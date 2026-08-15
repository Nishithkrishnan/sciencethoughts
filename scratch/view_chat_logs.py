import argparse
import urllib.request
import urllib.parse
import json
import os
from datetime import datetime

def load_env_local(filepath):
    if not os.path.exists(filepath):
        print(f"[LOGS] Local .env file not found: {filepath}")
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
    print("[LOGS] Error: KV_REST_API_URL or KV_REST_API_TOKEN is not defined in .env.local.")
    exit(1)

def fetch_kv_key(key_name):
    encoded = urllib.parse.quote(key_name)
    req = urllib.request.Request(f"{kv_url}/get/{encoded}", method="GET")
    req.add_header("Authorization", f"Bearer {kv_token}")
    try:
        with urllib.request.urlopen(req) as res:
            data = json.loads(res.read().decode("utf-8"))
            return data.get("result")
    except Exception as e:
        return None

parser = argparse.ArgumentParser(description="View chat session history and transcripts for a specific business tenant")
parser.add_argument("--id", required=True, help="Property ID (e.g. '9' for Mango Alibaug)")
parser.add_argument("--phone", help="Specify a guest phone number to view their full chat directly")

args = parser.parse_args()

print(f"\n=======================================================")
print(f"       CHAT LOGS & CONVERSATION AUDITOR FOR TENANT: {args.id}")
print(f"=======================================================")

# 1. If a specific phone number is requested, print that chat directly
if args.phone:
    phone_clean = args.phone.strip().replace("+", "")
    session_key = f"session:{phone_clean}"
    session_raw = fetch_kv_key(session_key)
    
    if session_raw:
        try:
            session = json.loads(session_raw)
            if session.get("companyId") == args.id:
                print(f"\n📱 Guest Number: +{phone_clean}")
                print(f"-------------------------------------------------------")
                history = session.get("history", [])
                if not history:
                    print(" (Conversation is empty or reset) ")
                else:
                    for turn in history:
                        role = "🧑 Guest" if turn["role"] == "user" else "🤖 Concierge"
                        print(f"[{role}]: {turn['content']}")
                print(f"-------------------------------------------------------")
            else:
                print(f"\n[Error]: The session for +{phone_clean} belongs to a different tenant ({session.get('companyId')}). Access Denied.")
        except Exception as e:
            print(f"[Error parsing session JSON]: {e}")
    else:
        print(f"\n[Info]: No active chat session found in KV database for phone: +{phone_clean}")
    print("=======================================================\n")
    exit(0)

# 2. Otherwise, scan all session keys in Vercel KV
print("\nScanning active sessions in database...")
scan_req = urllib.request.Request(f"{kv_url}/keys/session:*", method="GET")
scan_req.add_header("Authorization", f"Bearer {kv_token}")

session_keys = []
try:
    with urllib.request.urlopen(scan_req) as res:
        data = json.loads(res.read().decode("utf-8"))
        session_keys = data.get("result", [])
except Exception as e:
    print(f"[Error scanning keys]: {e}")
    exit(1)

tenant_sessions = []
for skey in session_keys:
    val = fetch_kv_key(skey)
    if val:
        try:
            sess = json.loads(val)
            if sess.get("companyId") == args.id:
                phone = skey.replace("session:", "")
                history = sess.get("history", [])
                last_msg = history[-1]["content"] if history else "[No messages]"
                tenant_sessions.append((phone, len(history), last_msg))
        except Exception:
            pass

if not tenant_sessions:
    print(f"\n[Info]: No active guest conversations found in KV for tenant ID {args.id}.")
    print("=======================================================\n")
    exit(0)

print(f"\nFound {len(tenant_sessions)} active guest conversation(s) for this tenant:")
print("--------------------------------------------------------------------------------")
print(f"{'Guest Phone':<18} | {'Turns':<5} | {'Last Message Preview'}")
print("--------------------------------------------------------------------------------")
for idx, (phone, turns, last_msg) in enumerate(tenant_sessions, start=1):
    preview = last_msg[:50] + "..." if len(last_msg) > 50 else last_msg
    print(f"{idx}. +{phone:<14} | {turns:<5} | {preview}")

print("--------------------------------------------------------------------------------")
print(f"\n💡 To view a full transcript, re-run with the phone parameter:")
print(f"   python scratch/view_chat_logs.py --id {args.id} --phone [Guest Phone Number]")
print("=======================================================\n")
