import argparse
import urllib.request
import urllib.parse
import json
import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

def load_env_local(filepath):
    if not os.path.exists(filepath):
        print(f"[OFFBOARDER] Local .env file not found: {filepath}")
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

# Load environment keys
env_path = r"C:\Users\nishi\.gemini\antigravity\scratch\sciencethoughts\.env.local"
load_env_local(env_path)

kv_url = os.getenv("KV_REST_API_URL") or os.getenv("REDIS_REST_URL")
kv_token = os.getenv("KV_REST_API_TOKEN") or os.getenv("REDIS_REST_TOKEN")
app_encryption_key = os.getenv("APP_ENCRYPTION_KEY", "default_app_encryption_key_32bytes_length_must_be_set_for_safety!")

if not kv_url or not kv_token:
    print("[OFFBOARDER] Error: KV_REST_API_URL or KV_REST_API_TOKEN is not defined.")
    exit(1)

def decrypt_value(encrypted_text):
    """Decrypts AES-256-GCM encrypted token to plaintext"""
    if not encrypted_text:
        return None
    parts = encrypted_text.split(':')
    if len(parts) != 3:
        return encrypted_text # legacy plaintext fallback
    try:
        iv = bytes.fromhex(parts[0])
        auth_tag = bytes.fromhex(parts[1])
        ciphertext = bytes.fromhex(parts[2])
        key_bytes = app_encryption_key.ljust(32, '0')[:32].encode('utf-8')
        aesgcm = AESGCM(key_bytes)
        # Reconstruct full encrypted bytes for cryptography (ciphertext + tag)
        decrypted = aesgcm.decrypt(iv, ciphertext + auth_tag, None)
        return decrypted.decode('utf-8')
    except Exception as e:
        print(f"[OFFBOARDER] Decryption error: {e}")
        return None

parser = argparse.ArgumentParser(description="Offboard tenant, revoke Zoho OAuth token, and purge all KV database keys")
parser.add_argument("--id", required=True, help="Property ID to offboard (e.g. '9')")
args = parser.parse_args()

print(f"=== OFFBOARDING SYSTEM FOR TENANT: {args.id} ===")

# 1. Fetch CRM credentials to get the refresh token for revocation
crm_key = f"tenant:crm:zoho:{args.id}"
encoded_crm_key = urllib.parse.quote(crm_key)
target_url = f"{kv_url}/get/{encoded_crm_key}"

refresh_token = None
req_fetch = urllib.request.Request(target_url, method="GET")
req_fetch.add_header("Authorization", f"Bearer {kv_token}")

try:
    with urllib.request.urlopen(req_fetch) as response:
        res_data = response.read().decode("utf-8")
        parsed = json.loads(res_data)
        if parsed.get("result"):
            creds = json.loads(parsed["result"])
            refresh_token = decrypt_value(creds.get("refresh_token"))
except Exception as e:
    print(f"[OFFBOARDER] Warning: Failed to fetch CRM credentials: {e}")

# 2. Revoke Zoho Refresh Token (if found)
if refresh_token:
    print("[OFFBOARDER] Revoking Zoho Refresh Token...")
    revoke_url = "https://accounts.zoho.in/oauth/v2/token/revoke"
    revoke_data = urllib.parse.urlencode({
        "token": refresh_token
    }).encode("utf-8")

    req_revoke = urllib.request.Request(revoke_url, data=revoke_data, method="POST")
    req_revoke.add_header("Content-Type", "application/x-www-form-urlencoded")

    try:
        with urllib.request.urlopen(req_revoke) as response:
            status = response.getcode()
            print(f"[OFFBOARDER] Zoho OAuth Token Revocation Status: {status}")
    except Exception as e:
        print(f"[OFFBOARDER] Warning: Zoho Token revocation request failed: {e}")
else:
    print("[OFFBOARDER] No active Zoho refresh token found to revoke. Skipping.")

# 3. Purge all related Vercel KV Database keys
print("[OFFBOARDER] Purging tenant keys from Vercel KV...")

# List of keys to delete directly
keys_to_delete = [
    f"tenant:crm:zoho:{args.id}",
    f"tenant:crm:zoho:token:{args.id}",
    f"tenant:knowledge:{args.id}"
]

# Find and delete matching hostnames mapped to this tenant
# We scan for tenant:hostname:* keys
scan_url = f"{kv_url}/keys/tenant:hostname:*"
req_scan = urllib.request.Request(scan_url, method="GET")
req_scan.add_header("Authorization", f"Bearer {kv_token}")

try:
    with urllib.request.urlopen(req_scan) as response:
        res_data = response.read().decode("utf-8")
        parsed = json.loads(res_data)
        hostname_keys = parsed.get("result", [])
        for h_key in hostname_keys:
            # Check the value of this hostname key
            encoded_h_key = urllib.parse.quote(h_key)
            val_url = f"{kv_url}/get/{encoded_h_key}"
            req_val = urllib.request.Request(val_url, method="GET")
            req_val.add_header("Authorization", f"Bearer {kv_token}")
            
            with urllib.request.urlopen(req_val) as val_res:
                val_data = json.loads(val_res.read().decode("utf-8"))
                resolved_id = val_data.get("result", "").strip('"')
                if resolved_id == args.id:
                    keys_to_delete.append(h_key)
                    print(f"[OFFBOARDER] Flagged Hostname Mapping for deletion: {h_key}")
except Exception as e:
    print(f"[OFFBOARDER] Warning: Failed to scan hostname keys: {e}")

# Delete all flagged keys in parallel command
for key_name in keys_to_delete:
    encoded_del_key = urllib.parse.quote(key_name)
    del_url = f"{kv_url}/del/{encoded_del_key}"
    req_del = urllib.request.Request(del_url, method="POST")
    req_del.add_header("Authorization", f"Bearer {kv_token}")
    
    try:
        with urllib.request.urlopen(req_del) as response:
            res_data = response.read().decode("utf-8")
            parsed = json.loads(res_data)
            if parsed.get("result") == 1:
                print(f"[OFFBOARDER] Deleted: {key_name}")
            else:
                print(f"[OFFBOARDER] Key did not exist or delete skipped: {key_name}")
    except Exception as e:
        print(f"[OFFBOARDER] Failed to delete key {key_name}: {e}")

print("=== OFFBOARDING COMPLETED SUCCESSFULLY ===")
