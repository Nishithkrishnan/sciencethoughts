// WhatsApp Coexistence: a client's number used on the WhatsApp Business app AND our Cloud API bot
// at the same time. See claude/whatsapp-coexistence-research.md (project docs).
//
// 1. Owner takeover. Every message staff send from the Business app arrives as an
//    `smb_message_echoes` webhook. We then keep the bot quiet for that guest for HANDOFF_SECONDS,
//    so the owner and the bot never talk over each other. Each owner reply restarts the timer.
// 2. Disconnects. If the owner disconnects, or doesn't open the app for ~14 days, Meta sends an
//    `account_update` webhook (e.g. PARTNER_REMOVED / PRIMARY_INACTIVITY) and the bot stops
//    working on that number. We log it to `system:alerts` and email an alert.
import { kvCommand, kvConfigured } from './kv-rest';

export const HANDOFF_SECONDS = 12 * 60 * 60;
const handoffKey = (phoneNumberId, guest) => `handoff:${phoneNumberId}:${guest}`;

// Events worth telling Nishith about straight away.
const ALERT_EVENTS = new Set([
  'PARTNER_REMOVED', 'ACCOUNT_OFFBOARDED', 'ACCOUNT_RECONNECTED',
  'ACCOUNT_VIOLATION', 'ACCOUNT_RESTRICTION', 'DISABLED_UPDATE',
]);

export async function recordOwnerReplies(value) {
  const phoneNumberId = value?.metadata?.phone_number_id;
  const echoes = Array.isArray(value?.message_echoes) ? value.message_echoes : [];
  if (!phoneNumberId || !echoes.length || !kvConfigured()) return 0;
  let n = 0;
  for (const echo of echoes) {
    const guest = String(echo?.to || '').replace(/\D/g, '');
    if (!guest) continue;
    await kvCommand(['SET', handoffKey(phoneNumberId, guest), String(echo.timestamp || Date.now()), 'EX', String(HANDOFF_SECONDS)]);
    n++;
  }
  if (n) console.log(`[COEXISTENCE] Owner replied from the app on ${phoneNumberId}: bot paused for ${n} guest(s) for ${HANDOFF_SECONDS / 3600}h`);
  return n;
}

export async function isHandoffActive(phoneNumberId, guest) {
  if (!phoneNumberId || !guest || !kvConfigured()) return false;
  try {
    return Boolean(await kvCommand(['GET', handoffKey(phoneNumberId, String(guest).replace(/\D/g, ''))]));
  } catch (e) {
    console.error('[COEXISTENCE] Handoff check failed; replying as normal:', e.message);
    return false;
  }
}

// options: { makeWebhookUrl, alertEmail }
export async function handleAccountUpdate(value, wabaId, options = {}) {
  const event = value?.event || 'UNKNOWN';
  const info = value?.disconnection_info || {};
  const record = {
    at: new Date().toISOString(),
    event,
    wabaId: wabaId || null,
    phoneNumber: value?.phone_number || null,
    reason: info.reason || null,
    initiatedBy: info.initiated_by || null,
    raw: value,
  };
  console.log(`[ACCOUNT UPDATE] ${event} waba=${record.wabaId} phone=${record.phoneNumber} reason=${record.reason}`);
  if (!ALERT_EVENTS.has(event)) return record;

  if (kvConfigured()) {
    try {
      await kvCommand(['RPUSH', 'system:alerts', JSON.stringify(record)]);
      await kvCommand(['LTRIM', 'system:alerts', '-200', '-1']);
    } catch (e) {
      console.error('[ACCOUNT UPDATE] Could not store alert:', e.message);
    }
  }
  const { makeWebhookUrl, alertEmail } = options;
  if (makeWebhookUrl && alertEmail) {
    const reasonText = {
      PRIMARY_INACTIVITY: 'The WhatsApp Business app was not opened on the main phone for about 14 days.',
      COMPANION_INACTIVITY: 'A linked device was inactive for about 30 days.',
      ACCOUNT_DISCONNECTED: 'The owner disconnected the number from the Business Platform in the app.',
      CHANGE_NUMBER: 'The owner changed the WhatsApp number.',
      USER_RE_REGISTERED: 'The number was re-registered on WhatsApp (for example, a new phone).',
      BUSINESS_DOWNGRADE: 'The account was switched away from WhatsApp Business.',
    }[record.reason] || '';
    const html = `
      <div style="font-family:sans-serif;color:#222;">
        <h2 style="margin-bottom:4px;">WhatsApp account alert: ${event}</h2>
        <p>Number: <strong>${record.phoneNumber || 'unknown'}</strong> &middot; WhatsApp account ID: ${record.wabaId || 'unknown'}</p>
        ${record.reason ? `<p>Reason: <strong>${record.reason}</strong>${record.initiatedBy ? ` (by ${record.initiatedBy})` : ''}. ${reasonText}</p>` : ''}
        ${event === 'PARTNER_REMOVED' ? '<p><strong>The assistant has stopped answering on this number.</strong> Ask the client to reconnect through a new setup link.</p>' : ''}
      </div>`;
    try {
      await fetch(makeWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'account_alert',
          to: alertEmail,
          subjectLine: `WhatsApp alert: ${event}${record.phoneNumber ? ` (${record.phoneNumber})` : ''}`,
          summaryHtml: html,
        }),
      });
    } catch (e) {
      console.error('[ACCOUNT UPDATE] Alert email failed (non-fatal):', e.message);
    }
  }
  return record;
}
