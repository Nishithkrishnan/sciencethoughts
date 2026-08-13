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
        # WhatsApp uses single asterisks for bold, not double
        assert "**" not in reply, f"Forbidden markdown '**' detected: {reply[:50]}..."
        # WhatsApp doesn't support markdown links [text](url)
        assert "[http" not in reply and "](http" not in reply, "Markdown link detected! Use plain URLs."

    @staticmethod
    def assert_no_tenant_bleed(result: Dict, forbidden_tenants: list):
        reply = result["reply"].lower()
        refusal_phrases = ["cannot", "unable", "refuse", "sorry", "not authorized", "can't assist", "not allowed", "only assist"]
        is_refusal = any(phrase in reply for phrase in refusal_phrases)
        
        # Only enforce bleed block if the bot did not correctly refuse the request
        if not is_refusal:
            for forbidden in forbidden_tenants:
                assert forbidden.lower() not in reply, \
                    f"Tenant bleed detected! Mentioned '{forbidden}' in reply: {reply[:100]}"

    @staticmethod
    def run_all(result: Dict, test_case: Dict):
        HardAsserter.assert_latency(result, test_case.get("max_latency_ms", 2800))
        HardAsserter.assert_char_limit(result)
        HardAsserter.assert_markdown_compliance(result)
        if test_case.get("forbidden_tenants"):
            HardAsserter.assert_no_tenant_bleed(result, test_case["forbidden_tenants"])
        return True
