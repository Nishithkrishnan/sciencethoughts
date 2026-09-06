import os
import requests
import time
from typing import Dict, Optional, List

class AgentClient:
    def __init__(self, base_url: str = "https://www.sciencethoughts.com"):
        self.base_url = base_url
        self.session_id_counter = 0
        # If set (same value as the EVAL_BYPASS_TOKEN env var configured in Vercel), lets this
        # client skip the public web-demo's per-IP daily rate limit — see route.js. Without it,
        # running the full suite twice in the same UTC day from the same machine will trip that
        # limit partway through the second run (documented 5 Sep, all-tenants-routing-test-5-sep.md).
        self.eval_bypass_token = os.getenv("EVAL_BYPASS_TOKEN")

    def send_message(
        self, 
        company_id: str, 
        message: str, 
        session_id: Optional[str] = None,
        history: Optional[List[Dict]] = None
    ) -> Dict:
        """Simulates a WhatsApp / Webchat call to Next.js API endpoint."""
        if session_id is None:
            self.session_id_counter += 1
            session_id = f"test_session_{self.session_id_counter}"

        payload = {
            "companyId": company_id,
            "text": message,       # Map message -> text parameter
            "sessionId": session_id,
            "webChatMode": True,
            "history": history or []
        }

        headers = {}
        if self.eval_bypass_token:
            headers["x-eval-bypass-token"] = self.eval_bypass_token

        start_time = time.time()
        response = requests.post(
            f"{self.base_url}/api/whatsapp-demo",
            json=payload,
            headers=headers,
            timeout=15
        )
        elapsed_ms = (time.time() - start_time) * 1000

        response.raise_for_status()
        data = response.json()

        # Extract bot reply
        bot_reply = data.get("reply") or ""

        return {
            "session_id": session_id,
            "reply": bot_reply,
            "raw_response": data,
            "latency_ms": elapsed_ms,
            "company_id": company_id
        }
