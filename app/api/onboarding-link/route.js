import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { signOnboardingLink, TENANT_ID_PATTERN } from '../../../lib/onboarding-link';

// Generates a signed, expiring /onboard link for one client.
// Usage (in a browser): /api/onboarding-link?key=<DASHBOARD_SECRET>&tenant=coralbay&days=7
// Send the returned URL to the client. See lib/onboarding-link.js for why links are signed.

const DASHBOARD_SECRET = (process.env.DASHBOARD_SECRET || '').trim();
const SITE_BASE_URL = (process.env.SITE_BASE_URL || '').trim().replace(/\/+$/, '');

function authorized(key) {
  if (!DASHBOARD_SECRET || !key) return false;
  const a = Buffer.from(String(key));
  const b = Buffer.from(DASHBOARD_SECRET);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function GET(req) {
  const url = new URL(req.url);
  const p = url.searchParams;
  if (!authorized(p.get('key'))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tenant = (p.get('tenant') || '').trim();
  if (!TENANT_ID_PATTERN.test(tenant)) {
    return NextResponse.json({ error: 'tenant must be letters, numbers, - or _ (max 41 chars)' }, { status: 400 });
  }
  const days = Math.min(Math.max(parseInt(p.get('days') || '7', 10) || 7, 1), 30);
  const exp = Math.floor(Date.now() / 1000) + days * 86400;
  const sig = signOnboardingLink(tenant, String(exp), DASHBOARD_SECRET);

  const base = SITE_BASE_URL || url.origin;
  const link = `${base}/onboard?tenant=${encodeURIComponent(tenant)}&exp=${exp}&sig=${sig}`;
  return NextResponse.json({ tenant, url: link, expiresAt: new Date(exp * 1000).toISOString() });
}
