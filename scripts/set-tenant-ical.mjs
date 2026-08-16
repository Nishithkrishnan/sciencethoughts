#!/usr/bin/env node
/**
 * Sets (or updates) a tenant's iCal feed(s) — the piece that makes the AI's availability
 * answers real instead of guessed. Run this whenever a prospect or client sends you their
 * calendar export link (Airbnb, Booking.com, Google Calendar — anything that produces a
 * standard .ics URL). Works for both brand-new tenants and existing ones already in
 * companiesMap; this only touches tenant:ical:{id} in KV, nothing else.
 *
 * Usage:
 *   node scripts/set-tenant-ical.mjs [--env-file=.env.production.local]
 */

import { readFileSync, existsSync } from 'fs';
import { createInterface } from 'readline/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) {
    console.error(`[ical-setup] Env file not found: ${filePath}`);
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

async function kvSet(kvUrl, kvToken, key, value) {
  const res = await fetch(kvUrl, {
    method: 'POST',
    headers: { Authorization: `Bearer ${kvToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(['SET', key, value])
  });
  const data = await res.json();
  if (data.error) throw new Error(`KV SET failed for ${key}: ${data.error}`);
}

async function kvDel(kvUrl, kvToken, key) {
  await fetch(kvUrl, {
    method: 'POST',
    headers: { Authorization: `Bearer ${kvToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(['DEL', key])
  });
}

function extractCompaniesMap() {
  try {
    const routeSrc = readFileSync(path.join(REPO_ROOT, 'app/api/whatsapp-demo/route.js'), 'utf-8');
    const match = routeSrc.match(/const companiesMap = \{([\s\S]*?)\};/);
    if (!match) return {};
    const map = {};
    for (const m of match[1].matchAll(/'([^']+)':\s*'([^']+)'/g)) {
      map[m[1]] = m[2];
    }
    return map;
  } catch {
    return {};
  }
}

async function main() {
  const envFileArg = process.argv.find((a) => a.startsWith('--env-file='));
  const envFileName = envFileArg ? envFileArg.split('=')[1] : '.env.production.local';
  const envFilePath = path.isAbsolute(envFileName) ? envFileName : path.join(REPO_ROOT, envFileName);

  console.log(`[ical-setup] Loading credentials from ${envFilePath}`);
  const env = loadEnvFile(envFilePath);
  const KV_URL = env.KV_REST_API_URL || env.REDIS_REST_API_URL || env.REDIS_REST_URL;
  const KV_TOKEN = env.KV_REST_API_TOKEN || env.REDIS_REST_API_TOKEN || env.REDIS_REST_TOKEN;

  if (!KV_URL || !KV_TOKEN) {
    console.error(`[ical-setup] Missing KV_REST_API_URL / KV_REST_API_TOKEN in ${envFileName}`);
    process.exit(1);
  }

  const companies = extractCompaniesMap();
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q) => rl.question(q);

  console.log('\n=== Set Tenant iCal Feed(s) ===\n');
  console.log('Known tenant IDs:', Object.entries(companies).map(([id, name]) => `${id}=${name}`).join(', '), '\n');

  const tenantId = (await ask('Tenant ID: ')).trim();
  if (companies[tenantId]) {
    console.log(`  -> ${companies[tenantId]}`);
  } else {
    console.log('  ! Not found in companiesMap — double check this is the right ID before continuing.');
  }

  console.log('\nAdd one or more calendar feeds. For a single-unit property, leave the unit name');
  console.log('blank. For a multi-unit property, give each feed a unit name matching how it\'s');
  console.log('referred to in the knowledge base (e.g. "Villa Azure"). Enter a blank URL to finish.\n');

  const feeds = [];
  while (true) {
    const url = (await ask(`Feed URL${feeds.length ? ' (blank to finish)' : ''}: `)).trim();
    if (!url) break;
    const unit = (await ask('  Unit name (blank if single-unit property): ')).trim();
    feeds.push({ unit: unit || null, url });
  }

  rl.close();

  if (!feeds.length) {
    console.log('[ical-setup] No feeds entered — nothing written.');
    return;
  }

  await kvSet(KV_URL, KV_TOKEN, `tenant:ical:${tenantId}`, JSON.stringify(feeds));
  console.log(`  ✓ tenant:ical:${tenantId} (${feeds.length} feed${feeds.length > 1 ? 's' : ''})`);

  // Clear any cached "not configured" result so this takes effect immediately instead of
  // waiting up to an hour for the cache to expire.
  await kvDel(KV_URL, KV_TOKEN, `tenant:ical:cache:${tenantId}`);
  console.log(`  ✓ Cleared cached availability so this is live on the next message.`);

  console.log('\n[ical-setup] Done. No redeploy needed — this takes effect immediately.\n');
}

main().catch((err) => {
  console.error('[ical-setup] Failed:', err.message);
  process.exit(1);
});
