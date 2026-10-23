// Server-only helpers for reading Client Service Terms acceptances (see lib/client-terms.js).
import { kvCommand } from './kv-rest';
import { CLIENT_TERMS, termsLogKey } from './client-terms';

export async function latestAcceptance(tenant) {
  const raw = await kvCommand(['LINDEX', termsLogKey(tenant), '-1']);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export async function hasAcceptedCurrentTerms(tenant) {
  const latest = await latestAcceptance(tenant);
  return latest?.version === CLIENT_TERMS.version;
}
