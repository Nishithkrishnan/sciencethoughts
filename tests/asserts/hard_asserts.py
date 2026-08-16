from typing import Dict

class HardAsserter:
    @staticmethod
    def assert_latency(result: Dict, max_ms: int = 2800):
        latency = result["latency_ms"]
        assert latency <= max_ms, f"Latency SLA failed: {latency:.0f}ms > {max_ms}ms"

    @staticmethod
    def assert_char_limit(result: Dict, limit: int = 4096):
        # 4096 is Meta's actual documented max for a WhatsApp Cloud API `type: "text"`
        # message body (confirmed against developers.facebook.com/docs/whatsapp/cloud-api
        # /reference/messages), which is what sendWhatsAppMessage() in route.js sends.
        # This was previously 1024, which is Meta's limit for an *interactive* message
        # body — a different message type this app doesn't use for the main reply. That
        # mismatch made TC_017_CRASH_GUARD_LONG_INPUT fail on a reply (1198 chars) that
        # would have sent to WhatsApp successfully; it was never actually over the real
        # limit. Interactive-specific limits (header 24, button title 20) are still
        # separately enforced in assert_interactive_payload below.
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

        # NOTE: this used to skip the check entirely whenever the reply contained a refusal
        # phrase like "sorry" or "cannot" — on the theory that a refusal is always safe. That's
        # false: "Sorry, I can't share Mango Alibaug's rates, but ours are similar" is a refusal
        # AND a tenant-name leak in the same sentence. The system prompt's own cross-tenant rule
        # explicitly says "do not hardcode the competitor's name in your refusal template" — so a
        # correct refusal never needs to name the forbidden tenant, refusal or not. Enforce this
        # unconditionally instead of trusting refusal-shaped phrasing to be safe.
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
