import { NextResponse } from 'next/server';

// Runs once a day (see vercel.json -> crons) and emails a single digest listing every deferred
// ("let me confirm with the team") question from the last 24 hours that's still unanswered.
// This exists so nobody has to remember to open /dashboard — if there's nothing to answer, no
// email goes out at all.

const KV_URL = (process.env.KV_REST_API_URL || process.env.REDIS_REST_API_URL || process.env.REDIS_REST_URL || "").trim();
const KV_TOKEN = (process.env.KV_REST_API_TOKEN || process.env.REDIS_REST_API_TOKEN || process.env.REDIS_REST_TOKEN || "").trim();

// Vercel sets this automatically as `Authorization: Bearer <CRON_SECRET>` on requests it fires
// from vercel.json's crons config, as long as CRON_SECRET is set in your env vars. This stops
// randoms from hitting this URL and spamming your inbox — fails closed if it's not set.
const CRON_SECRET = (process.env.CRON_SECRET || "").trim();

// Delivery goes through the same Make.com automation that already logs leads to Google Sheets —
// a SEPARATE webhook from MAKE_WEBHOOK_URL (used by pushLeadToMake) so this can't ever interfere
// with the working lead-logging scenario. On the Make side this needs one small new scenario:
// Webhook trigger -> Gmail "Send an Email" action, mapping subjectLine into the subject and
// summaryHtml into the HTML body. All the "is this actually still unanswered / from the last 24h"
// filtering happens here in code before Make ever sees it, so Make doesn't need any filtering
// logic of its own — it just receives an already-final list and sends it.
const MAKE_DIGEST_WEBHOOK_URL = (process.env.MAKE_DIGEST_WEBHOOK_URL || "").trim();

// Optional — lets the email include a direct "open the dashboard" link. Without these two, the
// email still sends, just without that link.
const DASHBOARD_SECRET = (process.env.DASHBOARD_SECRET || "").trim();
const SITE_BASE_URL = (process.env.SITE_BASE_URL || "").trim();

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

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export async function GET(req) {
  if (!CRON_SECRET || req.headers.get('authorization') !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!KV_URL || !KV_TOKEN) {
    return NextResponse.json({ error: 'KV not configured' }, { status: 503 });
  }

  try {
    // Pull both today's and yesterday's date-bucketed id lists so a rolling 24-hour window is
    // covered even right after UTC midnight, then filter down to a real 24h cutoff below.
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const dates = [...new Set([today, yesterday])];

    const idLists = await Promise.all(dates.map((d) => kvCommand(['LRANGE', `escalations:${d}`, 0, -1]).catch(() => [])));
    const ids = [...new Set(idLists.flat())];

    const records = (await Promise.all(ids.map((id) => kvGet(`escalation:${id}`).catch(() => null))))
      .filter(Boolean)
      .map((raw) => { try { return JSON.parse(raw); } catch { return null; } })
      .filter(Boolean);

    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    const pending = records
      .filter((r) => !r.resolved && new Date(r.createdAt).getTime() >= cutoff)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    if (pending.length === 0) {
      return NextResponse.json({ ok: true, sent: false, reason: 'No pending escalations in the last 24 hours' });
    }

    if (!MAKE_DIGEST_WEBHOOK_URL) {
      console.error(`[DAILY DIGEST] ${pending.length} pending escalation(s) but MAKE_DIGEST_WEBHOOK_URL is not configured — cannot send.`);
      return NextResponse.json({ ok: false, error: 'Digest webhook not configured (set MAKE_DIGEST_WEBHOOK_URL)', pendingCount: pending.length }, { status: 500 });
    }

    const dashboardLink = SITE_BASE_URL && DASHBOARD_SECRET
      ? `${SITE_BASE_URL.replace(/\/$/, '')}/dashboard?key=${DASHBOARD_SECRET}`
      : null;

    const rowsHtml = pending.map((r) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(r.companyName || r.companyId)}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(r.question)}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(r.contact)}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;white-space:nowrap;">${new Date(r.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
      </tr>`).join('');

    const html = `
      <div style="font-family:sans-serif;color:#222;">
        <h2 style="margin-bottom:4px;">${pending.length} question${pending.length === 1 ? '' : 's'} waiting on an answer</h2>
        <p style="color:#555;margin-top:0;">Deferred by the AI in the last 24 hours and still unanswered.</p>
        <table style="border-collapse:collapse;width:100%;font-size:14px;">
          <thead><tr>
            <th style="text-align:left;padding:8px;border-bottom:2px solid #333;">Property</th>
            <th style="text-align:left;padding:8px;border-bottom:2px solid #333;">Question</th>
            <th style="text-align:left;padding:8px;border-bottom:2px solid #333;">Guest contact</th>
            <th style="text-align:left;padding:8px;border-bottom:2px solid #333;">Asked at (IST)</th>
          </tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table>
        ${dashboardLink ? `<p style="margin-top:16px;"><a href="${dashboardLink}">Open the dashboard to answer &rarr;</a></p>` : '<p style="margin-top:16px;color:#888;">Open your dashboard link to answer these.</p>'}
      </div>`;

    const subjectLine = `${pending.length} guest question${pending.length === 1 ? '' : 's'} waiting on an answer`;
    const summaryText = pending
      .map((r) => `- [${r.companyName || r.companyId}] "${r.question}" (from ${r.contact || 'unknown contact'}, asked ${new Date(r.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST)`)
      .join('\n');

    const res = await fetch(MAKE_DIGEST_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'daily_escalation_digest',
        count: pending.length,
        subjectLine,
        summaryHtml: html,
        summaryText,
        dashboardLink,
        items: pending.map((r) => ({
          property: r.companyName || r.companyId,
          question: r.question,
          contact: r.contact,
          askedAt: r.createdAt
        }))
      })
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error('[DAILY DIGEST] Make webhook send failed:', res.status, errText);
      return NextResponse.json({ ok: false, error: `Make webhook returned ${res.status}`, pendingCount: pending.length }, { status: 500 });
    }

    return NextResponse.json({ ok: true, sent: true, pendingCount: pending.length });
  } catch (e) {
    console.error('[DAILY DIGEST] Failed:', e);
    return NextResponse.json({ error: 'Failed to build/send digest' }, { status: 500 });
  }
}
