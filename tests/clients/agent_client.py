import requests
import time
from typing import Dict, Optional, List

class AgentClient:
    def __init__(self, base_url: str = "https://www.sciencethoughts.com"):
        self.base_url = base_url
        self.session_id_counter = 0

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

        start_time = time.time()
        response = requests.post(
            f"{self.base_url}/api/whatsapp-demo",
            json=payload,
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
