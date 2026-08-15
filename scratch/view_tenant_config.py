import argparse
import urllib.request
import urllib.parse
import json
import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

def load_env_local(filepath):
    if not os.path.exists(filepath):
        print(f"[VIEWER] Local .env file not found: {filepath}")
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

# Load local environment keys
env_path = r"C:\Users\nishi\.gemini\antigravity\scratch\sciencethoughts\.env.local"
load_env_local(env_path)

kv_url = os.getenv("KV_REST_API_URL") or os.getenv("REDIS_REST_URL")
kv_token = os.getenv("KV_REST_API_TOKEN") or os.getenv("REDIS_REST_TOKEN")
app_encryption_key = os.getenv("APP_ENCRYPTION_KEY", "default_app_encryption_key_32bytes_length_must_be_set_for_safety!")

if not kv_url or not kv_token:
    print("[VIEWER] Error: KV_REST_API_URL or KV_REST_API_TOKEN is not defined in .env.local.")
    exit(1)

def decrypt_value(encrypted_text):
    """Decrypts AES-256-GCM encrypted token to plaintext"""
    if not encrypted_text:
        return "[Not Configured/Empty]"
    parts = encrypted_text.split(':')
    if len(parts) != 3:
        return f"{encrypted_text} (Legacy Plaintext)"
    try:
        iv = bytes.fromhex(parts[0])
        auth_tag = bytes.fromhex(parts[1])
        ciphertext = bytes.fromhex(parts[2])
        key_bytes = app_encryption_key.ljust(32, '0')[:32].encode('utf-8')
        aesgcm = AESGCM(key_bytes)
        decrypted = aesgcm.decrypt(iv, ciphertext + auth_tag, None)
        return decrypted.decode('utf-8')
    except Exception as e:
        return f"[Decryption Failed: {e}]"

parser = argparse.ArgumentParser(description="View all active KV configuration keys, decrypted secrets, and RAG prompts for a tenant")
parser.add_argument("--id", required=True, help="Property/Tenant ID to view (e.g. '9')")
args = parser.parse_args()

print(f"\n=======================================================")
print(f"       CONFIG & RAG DATA VIEWER FOR TENANT: {args.id}")
print(f"=======================================================\n")

# Helper to fetch a key
def fetch_kv_key(key_name):
    encoded = urllib.parse.quote(key_name)
    req = urllib.request.Request(f"{kv_url}/get/{encoded}", method="GET")
    req.add_header("Authorization", f"Bearer {kv_token}")
    try:
        with urllib.request.urlopen(req) as res:
            data = json.loads(res.read().decode("utf-8"))
            return data.get("result")
    except Exception as e:
        print(f"[Error fetching key {key_name}]: {e}")
        return None

# 1. Fetch CRM Config
print("📂 [1/4] Zoho CRM Credentials:")
crm_raw = fetch_kv_key(f"tenant:crm:zoho:{args.id}")
if crm_raw:
    try:
        creds = json.loads(crm_raw)
        print(f" - API Domain:    {creds.get('api_domain', 'https://www.zohoapis.in')}")
        print(f" - Client ID:     {decrypt_value(creds.get('client_id'))}")
        print(f" - Client Secret: {decrypt_value(creds.get('client_secret'))[:8]}************************")
        print(f" - Refresh Token: {decrypt_value(creds.get('refresh_token'))[:8]}************************")
    except Exception as je:
        print(f" - Raw CRM Value: {crm_raw}")
else:
    print(" - No custom Zoho CRM credentials found. (Using global .env fallback)")

# 2. Fetch WhatsApp Cloud API Config
print("\n📂 [2/4] WhatsApp Cloud API Credentials:")
wa_raw = fetch_kv_key(f"tenant:whatsapp:{args.id}")
if wa_raw:
    try:
        wa = json.loads(wa_raw)
        print(f" - Phone Number ID: {wa.get('phone_number_id', '[Not Set]')}")
        print(f" - WABA ID:         {wa.get('waba_id', '[Not Set]')}")
        print(f" - Access Token:    {decrypt_value(wa.get('waba_token'))[:8]}************************")
    except Exception as je:
        print(f" - Raw WhatsApp Value: {wa_raw}")
else:
    print(" - No custom WhatsApp Cloud API credentials found. (Using global .env fallback)")

# 3. Fetch Subdomain & Phone mappings
print("\n📂 [3/4] Mappings & Subdomain Routing:")
# Scan hostnames where value equals tenant ID
hostname_keys = []
scan_req = urllib.request.Request(f"{kv_url}/keys/tenant:hostname:*", method="GET")
scan_req.add_header("Authorization", f"Bearer {kv_token}")
try:
    with urllib.request.urlopen(scan_req) as res:
        data = json.loads(res.read().decode("utf-8"))
        hostname_keys = data.get("result", [])
except Exception:
    pass

resolved_hosts = []
for h_key in hostname_keys:
    resolved_val = fetch_kv_key(h_key)
    if resolved_val and resolved_val.strip('"') == args.id:
        resolved_hosts.append(h_key.replace("tenant:hostname:", ""))

print(f" - Active subdomains: {', '.join(resolved_hosts) if resolved_hosts else '[None]'}")

# 4. Fetch RAG Prompt
print("\n📂 [4/4] RAG System Instruction Prompt:")
rag_raw = fetch_kv_key(f"tenant:knowledge:{args.id}")
if rag_raw:
    try:
        rag = json.loads(rag_raw)
        print("-------------------------------------------------------")
        print(rag.get("prompt", "[Empty Prompt]"))
        print("-------------------------------------------------------")
    except Exception:
        print("-------------------------------------------------------")
        print(rag_raw)
        print("-------------------------------------------------------")
else:
    print(" - No custom dynamic RAG prompt stored in KV. (System falls back to app/api/whatsapp-demo/route.js prompt)")

print("\n=======================================================")
