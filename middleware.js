import { NextResponse } from 'next/server';

const KV_URL = (process.env.KV_REST_API_URL || process.env.REDIS_REST_API_URL || process.env.REDIS_REST_URL || "").trim();
const KV_TOKEN = (process.env.KV_REST_API_TOKEN || process.env.REDIS_REST_API_TOKEN || process.env.REDIS_REST_TOKEN || "").trim();

export async function middleware(request) {
  // 1. Header Spoofing Prevention: Strip any pre-existing caller-supplied x-company-id headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete('x-company-id');

  let companyId = null;

  // 2. Local Development Override: Allow query param override only in development mode
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    const { searchParams } = new URL(request.url);
    const queryTenant = searchParams.get('tenant');
    if (queryTenant) {
      companyId = queryTenant.trim();
      console.log(`[MIDDLEWARE] Dev Override tenant set via query: ${companyId}`);
    }
  }

  // 3. Resolve Hostname Mapping from Vercel KV database
  if (!companyId) {
    const hostname = request.headers.get('host') || '';
    if (KV_URL && KV_TOKEN && hostname) {
      try {
        const res = await fetch(`${KV_URL}/get/tenant:hostname:${hostname}`, {
          headers: { Authorization: `Bearer ${KV_TOKEN}` }
        });
        const data = await res.json();
        if (data.result) {
          companyId = data.result.trim().replace(/^"|"$/g, ''); // strip quotes
        }
      } catch (e) {
        console.error(`[MIDDLEWARE] Failed hostname resolution lookup:`, e);
      }
    }
  }

  // 4. Default Fallback
  if (!companyId) {
    companyId = 'agency';
  }

  // 5. Inject resolved company ID
  requestHeaders.set('x-company-id', companyId);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Config to target only API routes and webhook controllers
export const config = {
  matcher: [
    '/api/:path*',
  ],
};
