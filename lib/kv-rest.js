// Minimal Upstash Redis REST client (Vercel KV), shared by API routes.
const KV_URL = (process.env.KV_REST_API_URL || process.env.REDIS_REST_API_URL || process.env.REDIS_REST_URL || '').trim();
const KV_TOKEN = (process.env.KV_REST_API_TOKEN || process.env.REDIS_REST_API_TOKEN || process.env.REDIS_REST_TOKEN || '').trim();

export const kvConfigured = () => Boolean(KV_URL && KV_TOKEN);

export async function kvCommand(command) {
  const res = await fetch(KV_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command)
  });
  const data = await res.json();
  if (data.error) throw new Error(`KV ${command[0]} failed: ${data.error}`);
  return data.result;
}
