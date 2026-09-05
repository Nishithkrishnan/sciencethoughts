import { NextResponse } from 'next/server';
import { decrypt } from '../../../lib/crypto';

// Backs the /dashboard page. Lists deferred ("let me confirm with the team") questions logged by
// app/api/whatsapp-demo/route.js's logEscalation(), and lets you resolve one — optionally teaching
// the answer back into that tenant's knowledge base so the bot stops deferring on the same
// question next time, and optionally sending the answer straight back to the guest on WhatsApp.
// This is intentionally a single shared view (no per-tenant login) since none of these tenants are
// live clients yet — see engineering notes below before this ever needs to support a real client
// logging in to see only their own property's questions.

const KV_URL = (process.env.KV_REST_API_URL || process.env.REDIS_REST_API_URL || process.env.REDIS_REST_URL || "").trim();
const KV_TOKEN = (process.env.KV_REST_API_TOKEN || process.env.REDIS_REST_API_TOKEN || process.env.REDIS_REST_TOKEN || "").trim();
const WHATSAPP_ACCESS_TOKEN = (process.env.WHATSAPP_ACCESS_TOKEN || "").trim();
// Every demo tenant currently shares one WhatsApp Business number (the sandbox/permanent number
// guests "join" a tenant on), so this is the correct phone_number_id to send FROM for all of them
// today. A real client onboarded with their OWN WhatsApp Business number would need their
// phone_number_id stored on tenant:whatsapp:{id} in KV (onboard-tenant.mjs only stores it on the
// reverse tenant:phone:{phone_number_id} key today) — flagging that as a gap for whenever the
// first real client goes live, rather than silently sending from the wrong number.
const PERMANENT_PHONE_NUMBER_ID = (process.env.PERMANENT_PHONE_NUMBER_ID || "").trim();

// Shared-secret gate for this internal, single-user dashboard. Set DASHBOARD_SECRET in Vercel env
// vars. If it's not set, the endpoint fails closed (refuses all requests) rather than silently
// leaving guest contact info open to anyone who finds the URL.
const DASHBOARD_SECRET = (process.env.DASHBOARD_SECRET || "").trim();

async function kvCommand(command) {
  const res = await fetch(KV_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command)
  });
  const data = await res.json();
  if (data.error) throw new Error(`KV command failed [${command.join(' ')}]: ${data.error}`);
  return data.result;
}

async function kvGet(key) {
  const res = await fetch(`${KV_URL}/get/${key}`, {
    headers: { Authorization: `Bearer ${KV_TOKEN}` }
  });
  const data = await res.json();
  return data.result || null;
}

function authorized(key) {
  return DASHBOARD_SECRET && key === DASHBOARD_SECRET;
}

function looksLikePhoneNumber(contact) {
  return /^\+?\d{10,15}$/.test((contact || '').replace(/\s+/g, ''));
}

async function getTenantWhatsAppToken(companyId) {
  if (KV_URL && KV_TOKEN) {
    try {
      const res = await fetch(`${KV_URL}/get/tenant:whatsapp:${companyId}`, {
        headers: { Authorization: `Bearer ${KV_TOKEN}` }
      });
      const data = await res.json();
      if (data.result) {
        const wa = JSON.parse(data.result);
        const token = decrypt(wa.waba_token);
        if (token) return token;
      }
    } catch (e) {
      console.error(`[ESCALATIONS] Failed to load WhatsApp token for tenant ${companyId}:`, e);
    }
  }
  return WHATSAPP_ACCESS_TOKEN;
}

// Sends the answer straight back to the guest on WhatsApp instead of leaving the loop closed only
// on the dashboard side. IMPORTANT LIMITATION: WhatsApp's Business API only allows a free-form
// text message like this within 24 hours of the guest's last message ("the customer service
// window") — outside that window, Meta rejects it and a pre-approved Message Template is required
// instead. Since escalations are explicitly meant to be answered "the next day," many of these
// will legitimately fall outside the window. We don't silently swallow that: the failure and
// Meta's real error reason are returned to the dashboard so it's visible, not guessed at.
async function sendWhatsAppFollowUp(to, companyId, companyName, question, answer) {
  if (!PERMANENT_PHONE_NUMBER_ID) {
    return { ok: false, error: 'PERMANENT_PHONE_NUMBER_ID is not configured' };
  }
  const token = await getTenantWhatsAppToken(companyId);
  if (!token) {
    return { ok: false, error: 'No WhatsApp access token configured' };
  }
  const messageText = `Hi! Following up on your question to ${companyName}:\n"${question}"\n\n${answer}`;
  try {
    const response = await fetch(`https://graph.facebook.com/v19.0/${PERMANENT_PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: messageText }
      })
    });
    const result = await response.json();
    if (result.error) {
      console.error('[ESCALATIONS] WhatsApp follow-up failed:', result.error);
      return { ok: false, error: result.error.message || 'WhatsApp API rejected the message', code: result.error.code };
    }
    return { ok: true };
  } catch (e) {
    console.error('[ESCALATIONS] WhatsApp follow-up request failed:', e);
    return { ok: false, error: e.message };
  }
}

export async function GET(req) {
  if (!KV_URL || !KV_TOKEN) {
    return NextResponse.json({ error: 'KV not configured' }, { status: 503 });
  }
  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key') || '';
  if (!authorized(key)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Defaults to today (UTC), but accepts ?date=YYYY-MM-DD to look at a prior day, and
  // ?days=N to pull the last N days merged together (handy for a Monday catching up on a
  // weekend, since nobody's expected to check this daily).
  const dateParam = searchParams.get('date');
  const daysParam = parseInt(searchParams.get('days') || '1', 10);
  const days = Math.min(Math.max(daysParam, 1), 14);

  try {
    const dates = [];
    if (dateParam) {
      dates.push(dateParam);
    } else {
      for (let i = 0; i < days; i++) {
        const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
        dates.push(d);
      }
    }

    const idLists = await Promise.all(dates.map((d) => kvCommand(['LRANGE', `escalations:${d}`, 0, -1]).catch(() => [])));
    const ids = [...new Set(idLists.flat())];

    const records = (await Promise.all(ids.map((id) => kvGet(`escalation:${id}`).catch(() => null))))
      .filter(Boolean)
      .map((raw) => {
        try { return JSON.parse(raw); } catch { return null; }
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return NextResponse.json({ escalations: records, datesChecked: dates });
  } catch (e) {
    console.error('[ESCALATIONS] GET failed:', e);
    return NextResponse.json({ error: 'Failed to load escalations' }, { status: 500 });
  }
}

export async function POST(req) {
  if (!KV_URL || !KV_TOKEN) {
    return NextResponse.json({ error: 'KV not configured' }, { status: 503 });
  }
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const { key, id, answer, teachKb, sendToGuest } = body || {};
  if (!authorized(key)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    const raw = await kvGet(`escalation:${id}`);
    if (!raw) {
      return NextResponse.json({ error: 'Escalation not found (may have expired)' }, { status: 404 });
    }
    const record = JSON.parse(raw);
    record.resolved = true;
    record.answer = answer || null;
    record.resolvedAt = new Date().toISOString();

    // Optionally send the answer straight back to the guest on WhatsApp — only attempted when the
    // contact actually looks like a phone number (web-chat visitors with no captured number, or
    // an email-only contact, can't receive a WhatsApp message). Only outcome is recorded on the
    // record so the dashboard can show whether it actually reached the guest, not just that a send
    // was attempted.
    let notifyResult = null;
    if (sendToGuest && answer && looksLikePhoneNumber(record.contact)) {
      notifyResult = await sendWhatsAppFollowUp(record.contact, record.companyId, record.companyName, record.question, answer);
      record.guestNotified = notifyResult.ok;
      record.guestNotifyError = notifyResult.ok ? null : notifyResult.error;
    }

    // Re-save with a fresh 14-day TTL so it stays visible in the dashboard for a while after
    // resolution (useful for "what did we already answer this week" review), then expires.
    await kvCommand(['SET', `escalation:${id}`, JSON.stringify(record), 'EX', '1209600']);

    // Optionally teach the answer into the tenant's knowledge base — appended to
    // tenant:learned:{companyId}, which getCompanyKnowledge() reads on every reply. This is what
    // actually closes the loop: answer it once here, the bot stops deferring on it going forward.
    if (teachKb && answer) {
      const learnedKey = `tenant:learned:${record.companyId}`;
      const existing = (await kvGet(learnedKey)) || '';
      const newLine = `- Q: "${record.question}" — A: ${answer}`;
      const updated = existing ? `${existing}\n${newLine}` : newLine;
      await kvCommand(['SET', learnedKey, updated]); // no TTL — this is real, durable knowledge base content
    }

    return NextResponse.json({
      ok: true,
      taughtKb: Boolean(teachKb && answer),
      guestNotified: notifyResult ? notifyResult.ok : null,
      guestNotifyError: notifyResult && !notifyResult.ok ? notifyResult.error : null
    });
  } catch (e) {
    console.error('[ESCALATIONS] POST failed:', e);
    return NextResponse.json({ error: 'Failed to resolve escalation' }, { status: 500 });
  }
}
