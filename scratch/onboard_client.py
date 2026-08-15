import argparse
import urllib.request
import urllib.parse
import json
import os
import getpass
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

def load_env_local(filepath):
    if not os.path.exists(filepath):
        print(f"[ONBOARDER] Local .env file not found: {filepath}")
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

# Load local environment keys to find Vercel KV endpoints and Encryption Keys
env_path = r"C:\Users\nishi\.gemini\antigravity\scratch\sciencethoughts\.env.local"
load_env_local(env_path)

kv_url = os.getenv("KV_REST_API_URL") or os.getenv("REDIS_REST_URL")
kv_token = os.getenv("KV_REST_API_TOKEN") or os.getenv("REDIS_REST_TOKEN")
app_encryption_key = os.getenv("APP_ENCRYPTION_KEY", "default_app_encryption_key_32bytes_length_must_be_set_for_safety!")

if not kv_url or not kv_token:
    print("[ONBOARDER] Error: KV_REST_API_URL or KV_REST_API_TOKEN is not defined in .env.local.")
    exit(1)

def encrypt_value(plaintext):
    """Encrypts plaintext to iv:authTag:ciphertext to match Node.js lib/crypto.js"""
    if not plaintext:
        return ""
    # Node equivalent key padding
    key_bytes = app_encryption_key.ljust(32, '0')[:32].encode('utf-8')
    aesgcm = AESGCM(key_bytes)
    
    # Generate 12-byte IV
    iv = os.urandom(12)
    # Encrypt (returns ciphertext + 16-byte tag)
    encrypted_bytes = aesgcm.encrypt(iv, plaintext.encode('utf-8'), None)
    
    ciphertext = encrypted_bytes[:-16]
    auth_tag = encrypted_bytes[-16:]
    
    return f"{iv.hex()}:{auth_tag.hex()}:{ciphertext.hex()}"

parser = argparse.ArgumentParser(description="Onboard new tenants and push their Zoho CRM and WhatsApp credentials to Vercel KV (Encrypted)")
parser.add_argument("--id", required=True, help="Property ID (e.g. '9' for Mango Alibaug)")
parser.add_argument("--domain", default="https://www.zohoapis.in", help="Zoho API domain (default: https://www.zohoapis.in)")
parser.add_argument("--phone_id", help="WhatsApp Phone Number ID mapped to this tenant")
parser.add_argument("--waba_id", help="WhatsApp Business Account ID (WABA ID) mapped to this tenant")
parser.add_argument("--hostname", help="Subdomain hostname mapped to this tenant")

args = parser.parse_args()

print(f"=== ONBOARDING SYSTEM FOR TENANT: {args.id} ===")
print("Please enter the client credentials interactively. Inputs for secrets will be hidden.")

# 1. Capture Zoho CRM Credentials
print("\n--- ZOHO CRM CONFIG ---")
client_id = input("Zoho Client ID: ").strip()
client_secret = getpass.getpass("Zoho Client Secret: ").strip()
refresh_token = getpass.getpass("Zoho Refresh Token: ").strip()

# 2. Capture WhatsApp Credentials
print("\n--- WHATSAPP CLOUD API CONFIG ---")
waba_token = getpass.getpass("WhatsApp Permanent Access Token: ").strip()

# Encrypt sensitive keys before writing to database
enc_client_id = encrypt_value(client_id) if client_id else ""
enc_client_secret = encrypt_value(client_secret) if client_secret else ""
enc_refresh_token = encrypt_value(refresh_token) if refresh_token else ""
enc_waba_token = encrypt_value(waba_token) if waba_token else ""

# 3. Save Zoho CRM credentials
if client_id and client_secret and refresh_token:
    crm_key = f"tenant:crm:zoho:{args.id}"
    encoded_crm_key = urllib.parse.quote(crm_key)
    target_url = f"{kv_url}/set/{encoded_crm_key}"
    
    creds = {
        "client_id": enc_client_id,
        "client_secret": enc_client_secret,
        "refresh_token": enc_refresh_token,
        "api_domain": args.domain
    }

    req = urllib.request.Request(
        target_url,
        data=json.dumps(creds).encode("utf-8"),
        method="POST"
    )
    req.add_header("Authorization", f"Bearer {kv_token}")
    req.add_header("Content-Type", "application/json")

    try:
        with urllib.request.urlopen(req) as response:
            res_data = response.read().decode("utf-8")
            parsed = json.loads(res_data)
            if parsed.get("result") == "OK":
                print(f"[ONBOARDER] Saved CRM config: {crm_key}")
            else:
                print(f"[ONBOARDER] Error saving CRM config: {parsed}")
    except Exception as e:
        print(f"[ONBOARDER] Exception saving CRM config: {e}")

# 4. Save WhatsApp Cloud API credentials
if waba_token or args.phone_id or args.waba_id:
    wa_key = f"tenant:whatsapp:{args.id}"
    encoded_wa_key = urllib.parse.quote(wa_key)
    target_url = f"{kv_url}/set/{encoded_wa_key}"
    
    wa_config = {
        "waba_id": args.waba_id or "",
        "phone_number_id": args.phone_id or "",
        "waba_token": enc_waba_token
    }

    req = urllib.request.Request(
        target_url,
        data=json.dumps(wa_config).encode("utf-8"),
        method="POST"
    )
    req.add_header("Authorization", f"Bearer {kv_token}")
    req.add_header("Content-Type", "application/json")

    try:
        with urllib.request.urlopen(req) as response:
            res_data = response.read().decode("utf-8")
            parsed = json.loads(res_data)
            if parsed.get("result") == "OK":
                print(f"[ONBOARDER] Saved WhatsApp Cloud API config: {wa_key}")
    except Exception as e:
        print(f"[ONBOARDER] Exception saving WhatsApp Cloud API config: {e}")

# 5. Save Phone ID mapping (resolves incoming WhatsApp number to Tenant ID)
if args.phone_id:
    phone_key = f"tenant:phone:{args.phone_id.strip()}"
    encoded_phone_key = urllib.parse.quote(phone_key)
    target_url = f"{kv_url}/set/{encoded_phone_key}"
    
    req = urllib.request.Request(
        target_url,
        data=json.dumps(args.id).encode("utf-8"),
        method="POST"
    )
    req.add_header("Authorization", f"Bearer {kv_token}")
    req.add_header("Content-Type", "application/json")
    
    try:
        with urllib.request.urlopen(req) as response:
            res_data = response.read().decode("utf-8")
            parsed = json.loads(res_data)
            if parsed.get("result") == "OK":
                print(f"[ONBOARDER] Mapped WhatsApp Phone ID: {args.phone_id.strip()} -> {args.id}")
    except Exception as e:
        print(f"[ONBOARDER] Exception saving WhatsApp Phone ID mapping: {e}")

# 6. Save Hostname mapping
if args.hostname:
    host_key = f"tenant:hostname:{args.hostname.strip()}"
    encoded_host_key = urllib.parse.quote(host_key)
    target_url = f"{kv_url}/set/{encoded_host_key}"
    
    req = urllib.request.Request(
        target_url,
        data=json.dumps(args.id).encode("utf-8"),
        method="POST"
    )
    req.add_header("Authorization", f"Bearer {kv_token}")
    req.add_header("Content-Type", "application/json")
    
    try:
        with urllib.request.urlopen(req) as response:
            res_data = response.read().decode("utf-8")
            parsed = json.loads(res_data)
            if parsed.get("result") == "OK":
                print(f"[ONBOARDER] Mapped Hostname: {args.hostname.strip()} -> {args.id}")
    except Exception as e:
        print(f"[ONBOARDER] Exception saving Hostname mapping: {e}")

print("[ONBOARDER] Onboarding script run finished successfully.")
