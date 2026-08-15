import argparse
import urllib.request
import urllib.parse
import json
import os
from pypdf import PdfReader

def load_env_local(filepath):
    if not os.path.exists(filepath):
        print(f"[DRAFTER] Local .env file not found: {filepath}")
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
openai_api_key = os.getenv("OPENAI_API_KEY")

if not kv_url or not kv_token:
    print("[DRAFTER] Error: KV_REST_API_URL or KV_REST_API_TOKEN is not defined in .env.local.")
    exit(1)

if not openai_api_key:
    print("[DRAFTER] Error: OPENAI_API_KEY is not defined in env.")
    exit(1)

parser = argparse.ArgumentParser(description="Extract knowledge base prompt from client PDF brochure and push to Vercel KV")
parser.add_argument("--id", required=True, help="Property ID (e.g. '9' for Mango Alibaug)")
parser.add_argument("--pdf", required=True, help="Path to client brochure PDF file")
parser.add_argument("--name", required=True, help="Official Client / Property Name")

args = parser.parse_args()

if not os.path.exists(args.pdf):
    print(f"[DRAFTER] Error: PDF file not found at {args.pdf}")
    exit(1)

print(f"[DRAFTER] Extracting text from PDF: {args.pdf}...")

# 1. Parse text from PDF using pypdf
reader = PdfReader(args.pdf)
raw_text = ""
for page in reader.pages:
    text_content = page.extract_text()
    if text_content:
        raw_text += text_content + "\n"

if not raw_text.strip():
    print("[DRAFTER] Error: Could not extract any text from the PDF brochure.")
    exit(1)

print(f"[DRAFTER] Extracted {len(raw_text)} characters. Running LLM structuring assistant...")

# 2. Call OpenAI to generate the custom grounded system prompt matching the concierge schema
system_instruction = (
    "You are an expert AI system engineer. Analyze the raw text from the client brochure/tariff "
    "and draft a high-quality, grounded system prompt block for an autonomous WhatsApp/Web concierge "
    "bot representing this property. Focus on precision and do not hallucinate details. "
    "If pricing tables or policies are ambiguous, include a list of low-confidence flags in your response "
    "so the founder can verify them live with the client.\n\n"
    "Your output MUST be a JSON object with the following keys:\n"
    "- \"prompt\": A detailed system prompt containing: Property name, specific villas/rooms, check-in/out policies, "
    "weekday/weekend rates, meals/chef pricing, pet rules, and amenities.\n"
    "- \"low_confidence_flags\": An array of strings detailing ambiguous details, missing rates, or conflicting rules "
    "that need live confirmation."
)

user_prompt = (
    f"Client Name: {args.name}\n"
    f"Raw Brochure Content:\n{raw_text[:8000]}" # Cap to 8000 chars for API tokens limit safety
)

url = "https://api.openai.com/v1/chat/completions"
payload = {
    "model": "gpt-4o-mini",
    "response_format": { "type": "json_object" },
    "messages": [
        { "role": "system", content: system_instruction },
        { "role": "user", content: user_prompt }
    ],
    "max_tokens": 1500,
    "temperature": 0.2
}

req_data = json.dumps(payload).encode("utf-8")
req = urllib.request.Request(url, data=req_data, method="POST")
req.add_header("Authorization", f"Bearer {openai_api_key}")
req.add_header("Content-Type", "application/json")

draft = None
try:
    with urllib.request.urlopen(req) as response:
        res_data = response.read().decode("utf-8")
        parsed = json.loads(res_data)
        content = parsed["choices"][0]["message"]["content"]
        draft = json.loads(content)
except Exception as e:
    print(f"[DRAFTER] OpenAI API extraction failed: {e}")
    exit(1)

if not draft or "prompt" not in draft:
    print("[DRAFTER] Error: LLM returned invalid schema.")
    exit(1)

print("\n=== SYSTEM PROMPT DRAFT GENERATED SUCCESSFULLY ===")
print(draft["prompt"])

if draft.get("low_confidence_flags"):
    print("\n⚠️  LOW-CONFIDENCE FLAGS (Check these with client on the call):")
    for flag in draft["low_confidence_flags"]:
        print(f" - {flag}")

# 3. Store the confirmed knowledge base in Vercel KV
kb_key = f"tenant:knowledge:{args.id}"
encoded_key = urllib.parse.quote(kb_key)
target_url = f"{kv_url}/set/{encoded_key}"

kb_payload = {
    "prompt": draft["prompt"]
}

req_save = urllib.request.Request(
    target_url,
    data=json.dumps(kb_payload).encode("utf-8"),
    method="POST"
)
req_save.add_header("Authorization", f"Bearer {kv_token}")
req_save.add_header("Content-Type", "application/json")

try:
    with urllib.request.urlopen(req_save) as response:
        res_data = response.read().decode("utf-8")
        parsed = json.loads(res_data)
        if parsed.get("result") == "OK":
            print(f"\n[DRAFTER] Successfully pushed final Knowledge Base to KV key: {kb_key}")
        else:
            print(f"\n[DRAFTER] Error pushing to KV: {parsed}")
except Exception as e:
    print(f"\n[DRAFTER] Exception during KV save: {e}")
