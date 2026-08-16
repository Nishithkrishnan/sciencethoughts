#!/usr/bin/env node
/**
 * Tenant onboarding script.
 *
 * Writes a new tenant's knowledge base, WhatsApp credentials, and (optionally) Zoho CRM
 * credentials directly into the same Vercel KV keys that app/api/whatsapp-demo/route.js and
 * lib/zoho.js already read from — tenant:knowledge:{id}, tenant:whatsapp:{id},
 * tenant:phone:{phone_number_id}, tenant:crm:zoho:{id}. No code change or redeploy needed for
 * any of that. The ONE thing this script cannot do for you is add the tenant's display name to
 * companiesMap in route.js — that's still a one-line code edit + deploy, and this script will
 * remind you at the end.
 *
 * Usage:
 *   node scripts/onboard-tenant.mjs [--env-file=.env.production.local]
 *
 * Defaults to .env.production.local (the file most likely to hold your real/production KV +
 * encryption credentials, not local dev ones). Pass --env-file to point at a different file.
 *
 * Nothing you type here is echoed back or logged anywhere except straight into KV.
 */

import { readFileSync, existsSync } from 'fs';
import { createInterface } from 'readline/promises';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// Tiny .env parser (no dependency on `dotenv`) — good enough for KEY=VALUE lines,
// optionally quoted, ignoring blank lines and #-comments.
// ---------------------------------------------------------------------------
function loadEnvFile(filePath) {
  if (!existsSync(filePath)) {
    console.error(`[onboard] Env file not found: ${filePath}`);
    process.exit(1);
  }
  const out = {};
  const raw = readFileSync(filePath, 'utf-8');
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

// ---------------------------------------------------------------------------
// AES-256-GCM encryption — deliberately duplicated from lib/crypto.js rather than imported,
// because that file uses `export`/`import` syntax that only works inside the Next.js build
// (the app has no "type": "module" in package.json, so a plain Node script can't import it
// directly without extra tooling). If you ever change the algorithm in lib/crypto.js, mirror
// the change here too — this MUST stay byte-for-byte compatible with lib/crypto.js's decrypt().
// ---------------------------------------------------------------------------
function encrypt(text, encryptionKey) {
  if (!text) return null;
  const key = Buffer.from(encryptionKey.padEnd(32, '0').slice(0, 32), 'utf-8');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

async function kvSet(kvUrl, kvToken, key, value) {
  const res = await fetch(kvUrl, {
    method: 'POST',
    headers: { Authorization: `Bearer ${kvToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(['SET', key, value])
  });
  const data = await res.json();
  if (data.error) throw new Error(`KV SET failed for ${key}: ${data.error}`);
  return data;
}

function extractExistingTenantIds() {
  try {
    const routeSrc = readFileSync(path.join(REPO_ROOT, 'app/api/whatsapp-demo/route.js'), 'utf-8');
    const match = routeSrc.match(/const companiesMap = \{([\s\S]*?)\};/);
    if (!match) return [];
    const ids = [...match[1].matchAll(/^\s*'([^']+)':/gm)].map((m) => m[1]);
    return ids;
  } catch {
    return [];
  }
}

async function main() {
  const envFileArg = process.argv.find((a) => a.startsWith('--env-file='));
  const envFileName = envFileArg ? envFileArg.split('=')[1] : '.env.production.local';
  const envFilePath = path.isAbsolute(envFileName) ? envFileName : path.join(REPO_ROOT, envFileName);

  console.log(`[onboard] Loading credentials from ${envFilePath}`);
  const env = loadEnvFile(envFilePath);

  const KV_URL = env.KV_REST_API_URL || env.REDIS_REST_API_URL || env.REDIS_REST_URL;
  const KV_TOKEN = env.KV_REST_API_TOKEN || env.REDIS_REST_API_TOKEN || env.REDIS_REST_TOKEN;
  const APP_ENCRYPTION_KEY = env.APP_ENCRYPTION_KEY;

  const missing = [];
  if (!KV_URL) missing.push('KV_REST_API_URL (or REDIS_REST_API_URL / REDIS_REST_URL)');
  if (!KV_TOKEN) missing.push('KV_REST_API_TOKEN (or REDIS_REST_API_TOKEN / REDIS_REST_TOKEN)');
  if (!APP_ENCRYPTION_KEY) missing.push('APP_ENCRYPTION_KEY');
  if (missing.length) {
    console.error(`[onboard] Missing required values in ${envFileName}:\n  - ${missing.join('\n  - ')}`);
    process.exit(1);
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q) => rl.question(q);

  console.log('\n=== Sciencethoughts — New Tenant Onboarding ===\n');

  const existingIds = extractExistingTenantIds();

  let tenantId = (await ask('Tenant ID (short unique key, e.g. "47"): ')).trim();
  while (existingIds.includes(tenantId)) {
    console.log(`  ! "${tenantId}" already exists in companiesMap. Pick a different id.`);
    tenantId = (await ask('Tenant ID: ')).trim();
  }

  const displayName = (await ask('Display name (e.g. "Coral Bay Villas"): ')).trim();
  const waToken = (await ask('WhatsApp access token: ')).trim();
  const phoneNumberId = (await ask('WhatsApp phone_number_id: ')).trim();

  console.log('\nKnowledge base — paste the full system-prompt text (rates, capacity, per-unit');
  console.log('amenities, house rules, meals, cancellation policy, etc). End with a line that');
  console.log('contains only END on its own.\n');
  let kbLines = [];
  while (true) {
    const line = await ask('');
    if (line.trim() === 'END') break;
    kbLines.push(line);
  }
  const knowledgePrompt = kbLines.join('\n').trim();
  if (!knowledgePrompt) {
    console.error('[onboard] No knowledge base text entered — aborting. Nothing was written.');
    rl.close();
    process.exit(1);
  }

  const wantsZoho = (await ask('\nDoes this tenant want Zoho CRM sync? (y/N): ')).trim().toLowerCase() === 'y';
  let zoho = null;
  if (wantsZoho) {
    const clientId = (await ask('  Zoho client_id: ')).trim();
    const clientSecret = (await ask('  Zoho client_secret: ')).trim();
    const refreshToken = (await ask('  Zoho refresh_token: ')).trim();
    const apiDomain = (await ask('  Zoho api_domain [https://www.zohoapis.in]: ')).trim() || 'https://www.zohoapis.in';
    zoho = { clientId, clientSecret, refreshToken, apiDomain };
  }

  rl.close();

  console.log('\n[onboard] Writing to KV...');

  await kvSet(KV_URL, KV_TOKEN, `tenant:knowledge:${tenantId}`, JSON.stringify({ prompt: knowledgePrompt }));
  console.log(`  ✓ tenant:knowledge:${tenantId}`);

  await kvSet(KV_URL, KV_TOKEN, `tenant:whatsapp:${tenantId}`, JSON.stringify({ waba_token: encrypt(waToken, APP_ENCRYPTION_KEY) }));
  console.log(`  ✓ tenant:whatsapp:${tenantId}`);

  await kvSet(KV_URL, KV_TOKEN, `tenant:phone:${phoneNumberId}`, tenantId);
  console.log(`  ✓ tenant:phone:${phoneNumberId} -> ${tenantId}`);

  if (zoho) {
    await kvSet(KV_URL, KV_TOKEN, `tenant:crm:zoho:${tenantId}`, JSON.stringify({
      client_id: encrypt(zoho.clientId, APP_ENCRYPTION_KEY),
      client_secret: encrypt(zoho.clientSecret, APP_ENCRYPTION_KEY),
      refresh_token: encrypt(zoho.refreshToken, APP_ENCRYPTION_KEY),
      api_domain: zoho.apiDomain
    }));
    console.log(`  ✓ tenant:crm:zoho:${tenantId}`);
  }

  console.log('\n[onboard] Done. One manual step left:');
  console.log(`  Add this line to companiesMap in app/api/whatsapp-demo/route.js, then commit + push:`);
  console.log(`    '${tenantId}': '${displayName}',`);
  console.log('\nEverything else (knowledge base, WhatsApp token, phone routing' + (zoho ? ', Zoho creds' : '') + ') is already live — no deploy needed for those.\n');
}

main().catch((err) => {
  console.error('[onboard] Failed:', err.message);
  process.exit(1);
});
