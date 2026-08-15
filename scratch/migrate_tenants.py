import urllib.request
import urllib.parse
import json
import os

def load_env_local(filepath):
    if not os.path.exists(filepath):
        print(f"[MIGRATOR] .env file not found: {filepath}")
        return
    with open(filepath, 'r') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            parts = line.split('=', 1)
            if len(parts) == 2:
                key = parts[0].strip()
                val = parts[1].strip().strip('"').strip("'")
                os.environ[key] = val

# Load local environment keys to find Vercel KV endpoints
env_path = r"C:\Users\nishi\.gemini\antigravity\scratch\sciencethoughts\.env.local"
load_env_local(env_path)

kv_url = os.getenv("KV_REST_API_URL") or os.getenv("REDIS_REST_URL")
kv_token = os.getenv("KV_REST_API_TOKEN") or os.getenv("REDIS_REST_TOKEN")

if not kv_url or not kv_token:
    print("[MIGRATOR] Error: KV_REST_API_URL or KV_REST_API_TOKEN is not defined in .env.local.")
    exit(1)

# Default Hostname-to-companyId mappings for migration
mappings = {
    "sciencethoughts.com": "agency",
    "www.sciencethoughts.com": "agency",
    "mango.sciencethoughts.com": "9",
    "machan.sciencethoughts.com": "18",
    "losttraveller.sciencethoughts.com": "19",
    "destiny.sciencethoughts.com": "21",
    "ekostay.sciencethoughts.com": "22",
    "rentalgram.sciencethoughts.com": "23",
    "melhorstays.sciencethoughts.com": "24",
    "stayvista.sciencethoughts.com": "25",
    "saffronstays.sciencethoughts.com": "26",
    "lohono.sciencethoughts.com": "27"
}

print("[MIGRATOR] Beginning hostname tenant mapping migration...")

for hostname, company_id in mappings.items():
    key = f"tenant:hostname:{hostname}"
    encoded_key = urllib.parse.quote(key)
    target_url = f"{kv_url}/set/{encoded_key}"

    req = urllib.request.Request(
        target_url,
        data=json.dumps(company_id).encode("utf-8"),
        method="POST"
    )
    req.add_header("Authorization", f"Bearer {kv_token}")
    req.add_header("Content-Type", "application/json")

    try:
        with urllib.request.urlopen(req) as response:
            res_data = response.read().decode("utf-8")
            parsed = json.loads(res_data)
            if parsed.get("result") == "OK":
                print(f"[MIGRATOR] Mapped: {hostname} -> {company_id}")
            else:
                print(f"[MIGRATOR] Error mapping {hostname}: {parsed}")
    except Exception as e:
        print(f"[MIGRATOR] Exception during mapping of {hostname}: {e}")

print("[MIGRATOR] Migration complete.")
