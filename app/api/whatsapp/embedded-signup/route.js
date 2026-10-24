import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { encrypt } from '../../../../lib/crypto';
import { verifyOnboardingLink, TENANT_ID_PATTERN } from '../../../../lib/onboarding-link';
import { kvCommand, kvConfigured } from '../../../../lib/kv-rest';
import { hasAcceptedCurrentTerms } from '../../../../lib/client-terms-store';

// Server side of WhatsApp Embedded Signup (the page is app/(site)/onboard/).
//
// When a client finishes Meta's Embedded Signup popup, the browser sends us a short-lived code
// (valid ~30 seconds) plus the WABA id and phone_number_id Meta reported. This route then does
// everything we used to do by hand for each client (see claude/m3-resorts-sandbox-test-19-oct.md):
//   1. exchange the code for the client's business token
//   2. store that token (encrypted) + their phone_number_id in KV, so app/api/whatsapp-demo/route.js
//      replies to their guests from their own number
//   3. subscribe our app to their WABA's webhooks (without this, inbound messages never arrive)
//   4. register their phone number for Cloud API (without this it stays "Pending")
//
// Coexistence: if the client connected a number they already use on the WhatsApp Business app,
// Meta keeps it registered, so we must NOT call /register (or set a PIN). We detect this from the
// phone number's is_on_biz_app field (and the FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING event).
// We deliberately do not call smb_app_data (old chat/contact sync): we don't need the history,
// and holding less guest data is better under the DPDP Act. See lib/coexistence.js.
//
// Still manual afterwards: the tenant's knowledge base (scripts/onboard-tenant.mjs, leave the
// WhatsApp prompts blank) and the companiesMap line in app/api/whatsapp-demo/route.js.
// Also NOT solved by this route: Meta will not deliver messages from the client's number until
// THEIR business completes Business Verification and the display name is approved
// (claude/client-whatsapp-onboarding-checklist.md).

const GRAPH_VERSION = (process.env.META_GRAPH_VERSION || 'v21.0').trim();
const META_APP_ID = (process.env.NEXT_PUBLIC_META_APP_ID || process.env.META_APP_ID || '1341456651450300').trim();
// The Meta App Secret. WHATSAPP_APP_SECRET already holds it (used for webhook signature checks).
const META_APP_SECRET = (process.env.META_APP_SECRET || process.env.WHATSAPP_APP_SECRET || '').trim();
const DASHBOARD_SECRET = (process.env.DASHBOARD_SECRET || '').trim();

const META_ID_PATTERN = /^\d{5,25}$/;

class GraphError extends Error {
  constructor(message, meta) {
    super(message);
    this.meta = meta || null;
  }
}

async function graph(path, { method = 'GET', token, body, query } = {}) {
  const url = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/${path}`);
  if (query) for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';
  const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  if (!res.ok || data.error) {
    const e = data.error || {};
    throw new GraphError(e.message || `Graph API HTTP ${res.status}`, {
      code: e.code, subcode: e.error_subcode, type: e.type, fbtrace_id: e.fbtrace_id
    });
  }
  return data;
}

async function exchangeCode(code) {
  const data = await graph('oauth/access_token', {
    query: { client_id: META_APP_ID, client_secret: META_APP_SECRET, code }
  });
  // Graph normally answers {"access_token": "..."}; Meta's guide describes the bare token, so accept both.
  const token = data.access_token || (typeof data.raw === 'string' ? data.raw.trim() : '');
  if (!token) throw new GraphError('Token exchange returned no access token');
  return token;
}

// Fallback when the browser didn't pass the WABA id: the token's own granted assets list it.
async function findWabaIdFromToken(token) {
  const data = await graph('debug_token', {
    query: { input_token: token, access_token: `${META_APP_ID}|${META_APP_SECRET}` }
  });
  const scopes = data?.data?.granular_scopes || [];
  const mgmt = scopes.find((s) => s.scope === 'whatsapp_business_management');
  return mgmt?.target_ids?.[0] || null;
}

async function findPhoneNumberId(wabaId, token) {
  const data = await graph(`${wabaId}/phone_numbers`, { token });
  return data?.data?.[0]?.id || null;
}

function stepError(e) {
  return { ok: false, error: e.message, meta: e.meta || null };
}

function linkFrom(obj) {
  return { tenant: obj.tenant, exp: obj.exp, sig: obj.sig };
}

// GET /api/whatsapp/embedded-signup?tenant=..&exp=..&sig=..  -> is this onboarding link usable?
export async function GET(req) {
  const p = new URL(req.url).searchParams;
  const link = { tenant: p.get('tenant'), exp: p.get('exp'), sig: p.get('sig') };
  const check = verifyOnboardingLink(link, DASHBOARD_SECRET);
  if (!check.valid) return NextResponse.json({ valid: false, reason: check.reason }, { status: 403 });
  return NextResponse.json({ valid: true, tenant: link.tenant, expiresAt: Number(link.exp) });
}

// POST /api/whatsapp/embedded-signup
// body: { tenant, exp, sig, code, waba_id?, phone_number_id?, business_id?, finish_type? }
export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 }); }

  const check = verifyOnboardingLink(linkFrom(body), DASHBOARD_SECRET);
  if (!check.valid) return NextResponse.json({ ok: false, error: `Onboarding link not valid (${check.reason})` }, { status: 403 });
  const tenant = body.tenant;
  if (!TENANT_ID_PATTERN.test(tenant)) return NextResponse.json({ ok: false, error: 'Invalid tenant' }, { status: 400 });

  if (!META_APP_SECRET || !kvConfigured()) {
    console.error('[EMBEDDED SIGNUP] Missing META_APP_SECRET/WHATSAPP_APP_SECRET or KV credentials');
    return NextResponse.json({ ok: false, error: 'Server is not configured for onboarding yet' }, { status: 500 });
  }
  // The property must accept the Client Service Terms (/client-terms) before we connect its number.
  try {
    if (!(await hasAcceptedCurrentTerms(tenant))) {
      return NextResponse.json({ ok: false, error: 'Please accept the Client Service Terms on this page before connecting your number.' }, { status: 403 });
    }
  } catch (e) {
    console.error(`[EMBEDDED SIGNUP] Could not check terms acceptance for tenant ${tenant}:`, e.message);
    return NextResponse.json({ ok: false, error: 'We could not check your terms acceptance. Please try again.' }, { status: 500 });
  }
  const code = typeof body.code === 'string' ? body.code.trim() : '';
  if (!code) return NextResponse.json({ ok: false, error: 'Missing code from Meta' }, { status: 400 });

  const steps = {};

  // 1. Exchange the code first: it expires ~30s after the popup closes.
  let token;
  try {
    token = await exchangeCode(code);
    steps.exchange = { ok: true };
  } catch (e) {
    console.error(`[EMBEDDED SIGNUP] Token exchange failed for tenant ${tenant}:`, e.message, e.meta);
    return NextResponse.json({ ok: false, error: `Could not complete the connection with Meta: ${e.message}`, steps: { exchange: stepError(e) } }, { status: 502 });
  }

  // 2. Work out which WABA / phone number was connected.
  let wabaId = META_ID_PATTERN.test(String(body.waba_id || '')) ? String(body.waba_id) : null;
  let phoneNumberId = META_ID_PATTERN.test(String(body.phone_number_id || '')) ? String(body.phone_number_id) : null;
  const businessId = META_ID_PATTERN.test(String(body.business_id || '')) ? String(body.business_id) : null;
  try {
    if (!wabaId) wabaId = await findWabaIdFromToken(token);
    if (wabaId && !phoneNumberId) phoneNumberId = await findPhoneNumberId(wabaId, token);
    steps.lookup = { ok: Boolean(wabaId && phoneNumberId), wabaId, phoneNumberId };
  } catch (e) {
    steps.lookup = stepError(e);
  }
  if (!wabaId) {
    return NextResponse.json({ ok: false, error: 'Meta did not tell us which WhatsApp account was connected', steps }, { status: 422 });
  }

  // 2b. Is this number also on the WhatsApp Business app (coexistence)?
  let coexistence = body.finish_type === 'FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING';
  if (phoneNumberId) {
    try {
      const info = await graph(phoneNumberId, { token, query: { fields: 'is_on_biz_app,platform_type' } });
      if (info.is_on_biz_app === true) coexistence = true;
      steps.platform = { ok: true, isOnBizApp: info.is_on_biz_app ?? null, platformType: info.platform_type ?? null };
    } catch (e) {
      steps.platform = stepError(e);
    }
  }

  // 3. Store the token right away, so it isn't lost if a later step fails.
  const pin = coexistence ? null : crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
  let replacedExisting = false;
  try {
    const existing = await kvCommand(['GET', `tenant:whatsapp:${tenant}`]);
    replacedExisting = Boolean(existing);
    await kvCommand(['SET', `tenant:whatsapp:${tenant}`, JSON.stringify({
      waba_token: encrypt(token),
      waba_id: wabaId,
      phone_number_id: phoneNumberId,
      business_id: businessId,
      two_step_pin: pin ? encrypt(pin) : null,
      coexistence,
      onboarding_method: coexistence ? 'embedded_signup_coexistence' : 'embedded_signup',
      onboarded_at: new Date().toISOString()
    })]);
    if (phoneNumberId) await kvCommand(['SET', `tenant:phone:${phoneNumberId}`, tenant]);
    steps.store = { ok: true, replacedExisting };
  } catch (e) {
    console.error(`[EMBEDDED SIGNUP] KV write failed for tenant ${tenant}:`, e.message);
    return NextResponse.json({ ok: false, error: 'Connected with Meta, but saving the connection failed', steps: { ...steps, store: stepError(e) } }, { status: 500 });
  }

  // 4. Subscribe our app to their WABA's webhooks.
  try {
    await graph(`${wabaId}/subscribed_apps`, { method: 'POST', token });
    steps.subscribe = { ok: true };
  } catch (e) {
    steps.subscribe = stepError(e);
  }

  // 5. Register the phone number for Cloud API (not for coexistence: it's already registered).
  if (coexistence) {
    steps.register = { ok: true, skipped: 'coexistence' };
  } else if (phoneNumberId) {
    try {
      await graph(`${phoneNumberId}/register`, { method: 'POST', token, body: { messaging_product: 'whatsapp', pin } });
      steps.register = { ok: true };
    } catch (e) {
      steps.register = stepError(e);
    }
  } else {
    steps.register = { ok: false, error: 'No phone number was connected' };
  }

  // 6. Best effort: read back the number so the page can show what got connected.
  let phone = null;
  if (phoneNumberId) {
    try {
      phone = await graph(phoneNumberId, { token, query: { fields: 'display_phone_number,verified_name,name_status,status' } });
    } catch { /* display only */ }
  }

  const ok = Boolean(steps.subscribe.ok && steps.register.ok);
  const record = {
    tenant, ok, wabaId, phoneNumberId, businessId, replacedExisting, coexistence,
    displayPhoneNumber: phone?.display_phone_number || null,
    verifiedName: phone?.verified_name || null,
    nameStatus: phone?.name_status || null,
    steps,
    at: new Date().toISOString()
  };
  try { await kvCommand(['SET', `tenant:onboarding:${tenant}`, JSON.stringify(record)]); } catch { /* audit only */ }
  console.log(`[EMBEDDED SIGNUP] tenant=${tenant} waba=${wabaId} phone=${phoneNumberId} ok=${ok} replaced=${replacedExisting}`, JSON.stringify(steps));

  return NextResponse.json(record);
}
