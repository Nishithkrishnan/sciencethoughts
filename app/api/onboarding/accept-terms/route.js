import { NextResponse } from 'next/server';
import { verifyOnboardingLink } from '../../../../lib/onboarding-link';
import { CLIENT_TERMS, termsLogKey, validateClientDetails } from '../../../../lib/client-terms';
import { kvCommand, kvConfigured } from '../../../../lib/kv-rest';
import { latestAcceptance } from '../../../../lib/client-terms-store';

// Records a property's acceptance of the Client Service Terms (/client-terms) from /onboard.
// This click-to-accept record replaces a signed agreement for single properties, so it must be
// good evidence: we log which version was shown, when, from where, and the business details the
// client entered. Each acceptance is appended (never overwritten) to the list tenant:terms:{tenant}.
// app/api/whatsapp/embedded-signup/route.js refuses to connect a number until one exists.

const DASHBOARD_SECRET = (process.env.DASHBOARD_SECRET || '').trim();

// GET ?tenant&exp&sig -> { accepted, version, acceptedAt } for the current terms version.
export async function GET(req) {
  const p = new URL(req.url).searchParams;
  const link = { tenant: p.get('tenant'), exp: p.get('exp'), sig: p.get('sig') };
  const check = verifyOnboardingLink(link, DASHBOARD_SECRET);
  if (!check.valid) return NextResponse.json({ accepted: false, reason: check.reason }, { status: 403 });
  if (!kvConfigured()) return NextResponse.json({ accepted: false, reason: 'server_not_configured' }, { status: 500 });
  let latest;
  try {
    latest = await latestAcceptance(link.tenant);
  } catch (e) {
    console.error(`[CLIENT TERMS] Could not read acceptance for tenant ${link.tenant}:`, e.message);
    return NextResponse.json({ accepted: false, reason: 'lookup_failed' }, { status: 500 });
  }
  const accepted = latest?.version === CLIENT_TERMS.version;
  return NextResponse.json({
    accepted,
    version: CLIENT_TERMS.version,
    acceptedAt: accepted ? latest.acceptedAt : null,
    details: accepted ? latest.details : null,
  });
}

// POST { tenant, exp, sig, agree: true, termsVersion, details: {...} }
export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 }); }

  const link = { tenant: body.tenant, exp: body.exp, sig: body.sig };
  const check = verifyOnboardingLink(link, DASHBOARD_SECRET);
  if (!check.valid) return NextResponse.json({ ok: false, error: `Onboarding link not valid (${check.reason})` }, { status: 403 });
  if (!kvConfigured()) return NextResponse.json({ ok: false, error: 'Server is not configured for onboarding yet' }, { status: 500 });

  if (body.agree !== true) {
    return NextResponse.json({ ok: false, error: 'Please tick the box to accept the Client Service Terms.' }, { status: 400 });
  }
  if (body.termsVersion !== CLIENT_TERMS.version) {
    return NextResponse.json({ ok: false, error: 'The terms were updated while this page was open. Please refresh and review them again.' }, { status: 409 });
  }
  const v = validateClientDetails(body.details || {});
  if (!v.ok) return NextResponse.json({ ok: false, error: 'Please check the highlighted details.', errors: v.errors }, { status: 400 });

  const record = {
    tenant: link.tenant,
    version: CLIENT_TERMS.version,
    acceptedAt: new Date().toISOString(),
    details: v.details,
    ip: (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || null,
    userAgent: (req.headers.get('user-agent') || '').slice(0, 300) || null,
    linkExpiresAt: Number(link.exp),
  };
  try {
    await kvCommand(['RPUSH', termsLogKey(link.tenant), JSON.stringify(record)]);
  } catch (e) {
    console.error(`[CLIENT TERMS] Could not record acceptance for tenant ${link.tenant}:`, e.message);
    return NextResponse.json({ ok: false, error: 'We could not save your acceptance. Please try again.' }, { status: 500 });
  }
  console.log(`[CLIENT TERMS] tenant=${link.tenant} accepted v${record.version} as "${record.details.legalName}"`);
  return NextResponse.json({ ok: true, version: record.version, acceptedAt: record.acceptedAt });
}

