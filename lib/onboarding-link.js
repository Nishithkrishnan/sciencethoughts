import crypto from 'crypto';

// Signed, expiring onboarding links for WhatsApp Embedded Signup (/onboard).
//
// Why signed: whoever completes Embedded Signup through /onboard?tenant=X ends up with their
// WhatsApp token stored as tenant X's token. An unsigned link would let anyone overwrite any
// existing tenant (e.g. ?tenant=63 would hijack Marari Villas' bot). So links are only valid
// when ScienceThoughts generated them (see app/api/onboarding-link/route.js), for one tenant,
// until an expiry time.
//
// The HMAC key is DASHBOARD_SECRET, the same admin secret that already gates /dashboard, so
// there is no extra secret to manage. Rotating DASHBOARD_SECRET invalidates every outstanding link.

export const TENANT_ID_PATTERN = /^[a-z0-9][a-z0-9_-]{0,40}$/i;

function signature(tenant, exp, secret) {
  return crypto.createHmac('sha256', secret).update(`${tenant}.${exp}`, 'utf8').digest('base64url');
}

export function signOnboardingLink(tenant, exp, secret) {
  if (!secret) throw new Error('No signing secret configured');
  if (!TENANT_ID_PATTERN.test(tenant)) throw new Error('Invalid tenant id');
  return signature(tenant, exp, secret);
}

// Returns { valid: true } or { valid: false, reason }.
export function verifyOnboardingLink({ tenant, exp, sig }, secret, nowSeconds = Math.floor(Date.now() / 1000)) {
  if (!secret) return { valid: false, reason: 'server_not_configured' };
  if (!tenant || !exp || !sig) return { valid: false, reason: 'missing_parameters' };
  if (!TENANT_ID_PATTERN.test(tenant)) return { valid: false, reason: 'invalid_tenant' };
  const expNum = Number(exp);
  if (!Number.isInteger(expNum)) return { valid: false, reason: 'invalid_expiry' };

  const expected = Buffer.from(signature(tenant, String(expNum), secret));
  const given = Buffer.from(String(sig));
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) {
    return { valid: false, reason: 'bad_signature' };
  }
  if (expNum < nowSeconds) return { valid: false, reason: 'expired' };
  return { valid: true };
}
