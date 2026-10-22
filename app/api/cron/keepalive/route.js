import { NextResponse } from 'next/server';

// Keeps the Upstash Redis database "active" so the free plan never archives and deletes it.
// Upstash deletes free databases after 14 days with no activity; that already happened once
// (Oct 2026) and wiped every tenant's knowledge base. Vercel Cron calls this once a day
// (see vercel.json), and each call writes one small key, which counts as activity.
//
// Vercel adds `Authorization: Bearer <CRON_SECRET>` to cron requests when CRON_SECRET is set,
// so random visitors can't hit this endpoint.

const CRON_SECRET = (process.env.CRON_SECRET || '').trim();
const KV_URL = (process.env.KV_REST_API_URL || process.env.REDIS_REST_API_URL || process.env.REDIS_REST_URL || '').trim();
const KV_TOKEN = (process.env.KV_REST_API_TOKEN || process.env.REDIS_REST_API_TOKEN || process.env.REDIS_REST_TOKEN || '').trim();

export async function GET(req) {
  if (!CRON_SECRET || req.headers.get('authorization') !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  if (!KV_URL || !KV_TOKEN) {
    console.error('[KEEPALIVE] KV credentials missing');
    return NextResponse.json({ ok: false, error: 'KV not configured' }, { status: 500 });
  }
  const at = new Date().toISOString();
  try {
    const res = await fetch(KV_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(['SET', 'system:keepalive', at])
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    console.log(`[KEEPALIVE] Database pinged at ${at}`);
    return NextResponse.json({ ok: true, at });
  } catch (e) {
    console.error('[KEEPALIVE] Database ping failed:', e.message);
    return NextResponse.json({ ok: false, error: 'Database ping failed' }, { status: 502 });
  }
}
