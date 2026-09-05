#!/usr/bin/env node
/**
 * Clears today's web-chat daily rate-limit counters (see WEB_DEMO_DAILY_LIMIT /
 * checkWebDemoRateLimit in app/api/whatsapp-demo/route.js). Each visitor IP gets its own KV key
 * `ratelimit:webchat:{ip}:{YYYY-MM-DD}` capped at 60 messages/day — the guard that stops a
 * script hammering the public demo endpoint from running up OpenAI/Gemini cost unattended.
 *
 * Running the pytest suite repeatedly in one day (as you do while iterating) counts against that
 * same limit, since every test call goes through webChatMode: true just like a real visitor.
 * This script SCANs for today's ratelimit:webchat:* keys and deletes them, so you're unblocked
 * immediately instead of waiting for the UTC-midnight reset. Harmless to run — it only resets
 * counters, nothing else, and any real visitor who tripped it today just gets their count zeroed.
 *
 * Usage:
 *   node scripts/clear-webchat-ratelimit.mjs [--env-file=.env.production.local]
 */

import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) {
    console.error(`[clear-ratelimit] Env file not found: ${filePath}`);
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

async function kvCommand(kvUrl, kvToken, command) {
  const res = await fetch(kvUrl, {
    method: 'POST',
    headers: { Authorization: `Bearer ${kvToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command)
  });
  const data = await res.json();
  if (data.error) throw new Error(`KV command failed [${command.join(' ')}]: ${data.error}`);
  return data.result;
}

async function findMatchingKeys(kvUrl, kvToken, pattern) {
  let cursor = '0';
  const keys = [];
  do {
    const result = await kvCommand(kvUrl, kvToken, ['SCAN', cursor, 'MATCH', pattern, 'COUNT', '100']);
    cursor = result[0];
    keys.push(...result[1]);
  } while (cursor !== '0');
  return keys;
}

async function main() {
  const envFileArg = process.argv.find((a) => a.startsWith('--env-file='));
  const envFileName = envFileArg ? envFileArg.split('=')[1] : '.env.production.local';
  const envFilePath = path.isAbsolute(envFileName) ? envFileName : path.join(REPO_ROOT, envFileName);

  console.log(`[clear-ratelimit] Loading credentials from ${envFilePath}`);
  const env = loadEnvFile(envFilePath);
  const KV_URL = env.KV_REST_API_URL || env.REDIS_REST_API_URL || env.REDIS_REST_URL;
  const KV_TOKEN = env.KV_REST_API_TOKEN || env.REDIS_REST_API_TOKEN || env.REDIS_REST_TOKEN;

  if (!KV_URL || !KV_TOKEN) {
    console.error(`[clear-ratelimit] Missing KV_REST_API_URL / KV_REST_API_TOKEN in ${envFileName}`);
    process.exit(1);
  }

  const today = new Date().toISOString().slice(0, 10); // UTC, matches the route's key format
  const pattern = `ratelimit:webchat:*:${today}`;

  console.log(`[clear-ratelimit] Scanning for keys matching ${pattern}...`);
  const keys = await findMatchingKeys(KV_URL, KV_TOKEN, pattern);

  if (!keys.length) {
    console.log('[clear-ratelimit] No rate-limit keys found for today — nothing to clear.');
    return;
  }

  console.log(`[clear-ratelimit] Found ${keys.length} key(s):`);
  for (const k of keys) console.log(`  - ${k}`);

  for (const k of keys) {
    await kvCommand(KV_URL, KV_TOKEN, ['DEL', k]);
    console.log(`  ✓ Cleared ${k}`);
  }

  console.log(`\n[clear-ratelimit] Done. ${keys.length} counter(s) reset — you're unblocked immediately.`);
}

main().catch((err) => {
  console.error('[clear-ratelimit] Failed:', err.message);
  process.exit(1);
});
