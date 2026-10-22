#!/usr/bin/env node
/**
 * Re-encrypts every tenant secret stored in KV from the old APP_ENCRYPTION_KEY to a new one.
 *
 * Encrypted fields (see lib/crypto.js callers):
 *   tenant:whatsapp:{id}  -> waba_token, two_step_pin
 *   tenant:crm:zoho:{id}  -> client_id, client_secret, refresh_token
 *
 * Usage (PowerShell, from the project root):
 *   $env:NEW_APP_ENCRYPTION_KEY = "<the new key>"
 *   node scripts/rotate-encryption-key.mjs            # dry run: shows what would change, writes nothing
 *   node scripts/rotate-encryption-key.mjs --apply    # backs up, rewrites, verifies
 *
 * Old key = OLD_APP_ENCRYPTION_KEY env var, else APP_ENCRYPTION_KEY in the env file, else the
 * insecure fallback hard-coded in lib/crypto.js. Safe to re-run: values already on the new key are
 * left alone. Optional: --env-file=.env.production.local (default).
 *
 * Order for a rotation in production (the app can only decrypt with one key at a time):
 *   1. add the new APP_ENCRYPTION_KEY in Vercel (don't redeploy yet)
 *   2. run this with --apply
 *   3. redeploy in Vercel immediately (tenant-specific tokens fail to decrypt in between)
 *   4. put the new key in .env.production.local
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const INSECURE_FALLBACK_KEY = 'default_app_encryption_key_32bytes_length_must_be_set_for_safety!';
const ENCRYPTED_FIELDS = {
  'tenant:whatsapp:*': ['waba_token', 'two_step_pin'],
  'tenant:crm:zoho:*': ['client_id', 'client_secret', 'refresh_token']
};

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) throw new Error(`Env file not found: ${filePath}`);
  const out = {};
  for (const line of readFileSync(filePath, 'utf-8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    out[t.slice(0, eq).trim()] = v;
  }
  return out;
}

// Must stay byte-compatible with lib/crypto.js.
function keyBytes(k) { return Buffer.from(k.padEnd(32, '0').slice(0, 32), 'utf-8'); }

function encryptWith(text, key) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', keyBytes(key), iv);
  let enc = cipher.update(text, 'utf8', 'hex');
  enc += cipher.final('hex');
  return `${iv.toString('hex')}:${cipher.getAuthTag().toString('hex')}:${enc}`;
}

// Unlike lib/crypto.js, this throws on failure instead of returning the ciphertext.
function decryptWith(value, key) {
  const [ivHex, tagHex, enc] = value.split(':');
  const d = crypto.createDecipheriv('aes-256-gcm', keyBytes(key), Buffer.from(ivHex, 'hex'));
  d.setAuthTag(Buffer.from(tagHex, 'hex'));
  return d.update(enc, 'hex', 'utf8') + d.final('utf8');
}

const isEncryptedFormat = (v) => typeof v === 'string' && v.split(':').length === 3;

async function main() {
  const apply = process.argv.includes('--apply');
  const envArg = process.argv.find((a) => a.startsWith('--env-file='));
  const envPath = path.join(REPO_ROOT, envArg ? envArg.split('=')[1] : '.env.production.local');
  const env = loadEnvFile(envPath);

  const KV_URL = env.KV_REST_API_URL || env.REDIS_REST_API_URL || env.REDIS_REST_URL;
  const KV_TOKEN = env.KV_REST_API_TOKEN || env.REDIS_REST_API_TOKEN || env.REDIS_REST_TOKEN;
  const OLD_KEY = (process.env.OLD_APP_ENCRYPTION_KEY || env.APP_ENCRYPTION_KEY || INSECURE_FALLBACK_KEY).trim();
  const NEW_KEY = (process.env.NEW_APP_ENCRYPTION_KEY || '').trim();

  if (!KV_URL || !KV_TOKEN) throw new Error(`KV credentials missing in ${envPath}`);
  if (NEW_KEY.length < 32) throw new Error('Set NEW_APP_ENCRYPTION_KEY to a random value of at least 32 characters.');
  if (NEW_KEY === OLD_KEY) throw new Error('NEW_APP_ENCRYPTION_KEY is the same as the old key.');
  if (NEW_KEY === INSECURE_FALLBACK_KEY) throw new Error('NEW_APP_ENCRYPTION_KEY must not be the public fallback key.');

  async function kv(command) {
    const res = await fetch(KV_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(command)
    });
    const data = await res.json();
    if (data.error) throw new Error(`KV ${command[0]} failed: ${data.error}`);
    return data.result;
  }

  async function scan(pattern) {
    const keys = [];
    let cursor = '0';
    do {
      const [next, batch] = await kv(['SCAN', cursor, 'MATCH', pattern, 'COUNT', '200']);
      keys.push(...batch);
      cursor = String(next);
    } while (cursor !== '0');
    return [...new Set(keys)];
  }

  console.log(`[rotate] ${apply ? 'APPLY' : 'DRY RUN'} — old key: ${OLD_KEY === INSECURE_FALLBACK_KEY ? 'insecure fallback' : 'custom'}`);

  const plan = []; // { key, raw, updated, notes[] }
  let errors = 0;
  for (const [pattern, fields] of Object.entries(ENCRYPTED_FIELDS)) {
    for (const key of await scan(pattern)) {
      const raw = await kv(['GET', key]);
      let obj;
      try { obj = JSON.parse(raw); } catch { console.log(`  ! ${key}: not JSON, skipped`); errors++; continue; }
      const notes = [];
      let changed = false;
      for (const f of fields) {
        const v = obj[f];
        if (v === undefined || v === null || v === '') continue;
        if (!isEncryptedFormat(v)) { obj[f] = encryptWith(String(v), NEW_KEY); notes.push(`${f}: plaintext -> encrypted`); changed = true; continue; }
        try {
          obj[f] = encryptWith(decryptWith(v, OLD_KEY), NEW_KEY);
          notes.push(`${f}: re-encrypted`); changed = true;
        } catch {
          try { decryptWith(v, NEW_KEY); notes.push(`${f}: already on new key`); }
          catch { notes.push(`${f}: CANNOT DECRYPT with old or new key, left as is`); errors++; }
        }
      }
      console.log(`  ${changed ? '*' : '-'} ${key}: ${notes.join('; ') || 'no encrypted fields'}`);
      if (changed) plan.push({ key, raw, updated: obj });
    }
  }

  console.log(`[rotate] ${plan.length} record(s) to update, ${errors} problem(s).`);
  if (!apply) { console.log('[rotate] Dry run only. Re-run with --apply to write.'); return; }
  if (errors) { console.log('[rotate] Not applying because of the problems above.'); process.exitCode = 1; return; }
  if (!plan.length) { console.log('[rotate] Nothing to do.'); return; }

  const backupDir = path.join(REPO_ROOT, 'scratch');
  mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, `kv-backup-before-key-rotation-${Date.now()}.json`);
  writeFileSync(backupPath, JSON.stringify(Object.fromEntries(plan.map((p) => [p.key, p.raw])), null, 2));
  console.log(`[rotate] Backup of original values: ${backupPath}`);

  for (const p of plan) {
    await kv(['SET', p.key, JSON.stringify(p.updated)]);
    const check = JSON.parse(await kv(['GET', p.key]));
    for (const [pattern, fields] of Object.entries(ENCRYPTED_FIELDS)) {
      if (!p.key.startsWith(pattern.slice(0, -1))) continue;
      for (const f of fields) if (isEncryptedFormat(check[f])) decryptWith(check[f], NEW_KEY); // throws if wrong
    }
    console.log(`  ✓ ${p.key}`);
  }
  console.log('[rotate] Done. Now redeploy in Vercel, then set APP_ENCRYPTION_KEY in .env.production.local to the new key.');
  console.log('[rotate] Delete the backup file once you have confirmed replies still work.');
}

main().catch((e) => { console.error('[rotate] Failed:', e.message); process.exit(1); });
