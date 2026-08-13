from typing import Dict

class HardAsserter:
    @staticmethod
    def assert_latency(result: Dict, max_ms: int = 2800):
        latency = result["latency_ms"]
        assert latency <= max_ms, f"Latency SLA failed: {latency:.0f}ms > {max_ms}ms"

    @staticmethod
    def assert_char_limit(result: Dict, limit: int = 1024):
        reply = result["reply"]
        assert len(reply) <= limit, f"WhatsApp char limit exceeded: {len(reply)} > {limit}"

    @staticmethod
    def assert_markdown_compliance(result: Dict):
        reply = result["reply"]
        assert "**" not in reply, f"Forbidden markdown '**' detected: {reply[:50]}..."
        assert "[http" not in reply and "](http" not in reply, "Markdown link detected! Use plain URLs."

    @staticmethod
    def assert_no_tenant_bleed(result: Dict, forbidden_tenants: list):
        reply = result["reply"].lower()
        refusal_phrases = ["cannot", "unable", "refuse", "sorry", "not authorized", "can't assist", "not allowed", "only assist"]
        is_refusal = any(phrase in reply for phrase in refusal_phrases)
        
        # Only enforce bleed block if the bot did not refuse the request
        if not is_refusal:
            for forbidden in forbidden_tenants:
                assert forbidden.lower() not in reply, \
                    f"Tenant bleed detected! Mentioned '{forbidden}' in reply: {reply[:100]}"

    @staticmethod
    def assert_interactive_payload(result: Dict):
        raw = result.get("raw_response", {})
        # Check Meta interactive message guidelines if applicable
        if "interactive" in raw:
            interactive = raw["interactive"]
            # List header length assert (Meta cap: 24)
            if "header" in interactive and interactive["header"].get("text"):
                header_text = interactive["header"]["text"]
                assert len(header_text) <= 24, f"List header too long: {len(header_text)} (max: 24)"
            # Button title length assert (Meta cap: 20)
            if "action" in interactive and "buttons" in interactive["action"]:
                for btn in interactive["action"]["buttons"]:
                    title = btn.get("reply", {}).get("title", "")
                    assert len(title) <= 20, f"Button title too long: '{title}' ({len(title)} chars, max: 20)"

    @staticmethod
    def run_all(result: Dict, test_case: Dict, max_ms: int = 2800):
        HardAsserter.assert_latency(result, max_ms)
        HardAsserter.assert_char_limit(result)
        HardAsserter.assert_markdown_compliance(result)
        HardAsserter.assert_interactive_payload(result)
        if test_case.get("forbidden_tenants"):
            HardAsserter.assert_no_tenant_bleed(result, test_case["forbidden_tenants"])
        return True
