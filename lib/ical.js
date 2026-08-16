/**
 * iCal Availability Service (Multi-Tenant, Multi-Unit)
 *
 * Reads booked-date ranges from each tenant's iCal feed(s) — the standard .ics export every
 * major booking channel (Airbnb, Booking.com, Google Calendar, etc.) already provides — so the
 * AI can answer availability questions against real data instead of guessing or, worse,
 * claiming a sync capability that doesn't exist.
 *
 * Feed URLs are configured per tenant (optionally per unit, for multi-villa properties) via
 * tenant:ical:{id} in KV: JSON array of { unit: "Villa Name" | null, url: "https://...ics" }.
 * Written by scripts/onboard-tenant.mjs for new tenants, or by hand via KV for existing ones.
 *
 * Parsed results are cached in KV for CACHE_TTL_SECONDS so a live calendar fetch+parse doesn't
 * happen on every single guest message — booking calendars don't change fast enough to need
 * that, and it keeps this fully opt-in: tenants with nothing configured pay one cheap cached
 * "not configured" lookup, not a live fetch attempt.
 */

import ical from 'node-ical';

const KV_URL = (process.env.KV_REST_API_URL || process.env.REDIS_REST_API_URL || process.env.REDIS_REST_URL || "").trim();
const KV_TOKEN = (process.env.KV_REST_API_TOKEN || process.env.REDIS_REST_API_TOKEN || process.env.REDIS_REST_TOKEN || "").trim();

const CACHE_TTL_SECONDS = 3600; // 1 hour — plenty fresh for a booking calendar, avoids re-fetching per message

function toDateOnly(d) {
  return new Date(d).toISOString().slice(0, 10);
}

async function fetchBusyRanges(feedUrl) {
  const data = await ical.async.fromURL(feedUrl);
  const events = Object.values(data).filter((e) => e && e.type === 'VEVENT' && e.start && e.end);
  return events.map((e) => ({ start: toDateOnly(e.start), end: toDateOnly(e.end) }));
}

async function kvSetSilently(key, value, ttlSeconds) {
  try {
    await fetch(KV_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(['SET', key, value, 'EX', String(ttlSeconds)])
    });
  } catch (e) {
    console.error(`[ICAL] Cache write failed for ${key}:`, e);
  }
}

/**
 * Returns { configured: boolean, units: [{ unit, busyRanges: [{start,end}] | null, error?: true }] }
 * for a tenant. configured=false means no iCal feed is set up — callers should fall back to the
 * existing "defer specific date questions to the property team" behavior, exactly like every
 * tenant that doesn't use this feature.
 */
export async function getTenantAvailability(companyId) {
  const id = companyId || 'agency';
  if (!KV_URL || !KV_TOKEN) return { configured: false, units: [] };

  // 1. Cache first.
  try {
    const cacheRes = await fetch(`${KV_URL}/get/tenant:ical:cache:${id}`, {
      headers: { Authorization: `Bearer ${KV_TOKEN}` }
    });
    const cacheData = await cacheRes.json();
    if (cacheData.result) {
      return JSON.parse(cacheData.result);
    }
  } catch (e) {
    console.error(`[ICAL] Cache read failed for tenant ${id}:`, e);
  }

  // 2. Load configured feed(s) for this tenant.
  let feeds = [];
  try {
    const res = await fetch(`${KV_URL}/get/tenant:ical:${id}`, {
      headers: { Authorization: `Bearer ${KV_TOKEN}` }
    });
    const data = await res.json();
    if (data.result) {
      feeds = JSON.parse(data.result);
    }
  } catch (e) {
    console.error(`[ICAL] Failed to load feed config for tenant ${id}:`, e);
  }

  if (!Array.isArray(feeds) || feeds.length === 0) {
    const result = { configured: false, units: [] };
    await kvSetSilently(`tenant:ical:cache:${id}`, JSON.stringify(result), CACHE_TTL_SECONDS);
    return result;
  }

  // 3. Fetch + parse each feed. One feed failing (bad URL, host down) doesn't take down the rest.
  const units = [];
  for (const feed of feeds) {
    try {
      const busyRanges = await fetchBusyRanges(feed.url);
      units.push({ unit: feed.unit || null, busyRanges });
    } catch (e) {
      console.error(`[ICAL] Failed to fetch/parse feed for tenant ${id}, unit ${feed.unit}:`, e.message);
      units.push({ unit: feed.unit || null, busyRanges: null, error: true });
    }
  }

  const result = { configured: true, units };
  await kvSetSilently(`tenant:ical:cache:${id}`, JSON.stringify(result), CACHE_TTL_SECONDS);
  return result;
}

/**
 * Renders availability data into a compact text block for injection into the AI system prompt.
 * Returns '' when not configured, so callers can always concatenate this in without an if-check.
 */
export function formatAvailabilityForPrompt(availability) {
  if (!availability || !availability.configured) return '';

  const lines = ['=== LIVE AVAILABILITY (from property calendar, refreshed hourly) ==='];
  for (const unit of availability.units) {
    const label = unit.unit || 'Property';
    if (unit.error) {
      lines.push(`${label}: Could not reach the live calendar right now — defer specific date-availability questions for this unit to the property team rather than guessing.`);
    } else if (!unit.busyRanges.length) {
      lines.push(`${label}: No blocked dates on the calendar right now (fully open for the foreseeable future, per last sync).`);
    } else {
      const ranges = unit.busyRanges.map((r) => `${r.start} to ${r.end}`).join(', ');
      lines.push(`${label}: BOOKED/unavailable: ${ranges}. Treat all other dates within the calendar's normal booking window as open.`);
    }
  }
  lines.push('Use this to answer availability questions directly and confidently. Do not guess dates this calendar does not cover — defer those to the property team exactly as you would for anything else not in the knowledge base.');
  return lines.join('\n');
}
