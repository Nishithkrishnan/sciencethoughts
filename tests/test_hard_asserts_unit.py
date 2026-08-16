"""
Direct unit tests of tests/asserts/hard_asserts.py itself.

These previously had ZERO standalone coverage — HardAsserter was only ever exercised
indirectly inside test_agent.py, which means you could only find out one of its checks
was wrong (too strict, too lenient, or just buggy) at the same time you were burning a
live OpenAI call to test something else entirely. These run in milliseconds, no network,
no API key, so they should run on every commit.
"""
import pytest
from asserts.hard_asserts import HardAsserter


def make_result(reply="Hello!", latency_ms=500, raw_response=None):
    return {
        "reply": reply,
        "latency_ms": latency_ms,
        "raw_response": raw_response or {},
    }


class TestLatency:
    def test_under_limit_passes(self):
        HardAsserter.assert_latency(make_result(latency_ms=1000), max_ms=2800)

    def test_exactly_at_limit_passes(self):
        # Boundary: equal to the limit must pass (the assert uses <=)
        HardAsserter.assert_latency(make_result(latency_ms=2800), max_ms=2800)

    def test_over_limit_fails(self):
        with pytest.raises(AssertionError):
            HardAsserter.assert_latency(make_result(latency_ms=2801), max_ms=2800)


class TestCharLimit:
    def test_under_limit_passes(self):
        HardAsserter.assert_char_limit(make_result(reply="x" * 100), limit=1024)

    def test_exactly_at_limit_passes(self):
        HardAsserter.assert_char_limit(make_result(reply="x" * 1024), limit=1024)

    def test_over_limit_fails(self):
        with pytest.raises(AssertionError):
            HardAsserter.assert_char_limit(make_result(reply="x" * 1025), limit=1024)


class TestMarkdownCompliance:
    def test_plain_text_passes(self):
        HardAsserter.assert_markdown_compliance(make_result(reply="Rates start at 28,000/night."))

    def test_bold_markdown_fails(self):
        with pytest.raises(AssertionError):
            HardAsserter.assert_markdown_compliance(make_result(reply="Our **best** villa is..."))

    def test_markdown_link_fails(self):
        with pytest.raises(AssertionError):
            HardAsserter.assert_markdown_compliance(
                make_result(reply="Book here: [Calendly](https://calendly.com/x)")
            )

    def test_bare_url_passes(self):
        # Plain URLs (no markdown link syntax) are the required WhatsApp-safe format.
        HardAsserter.assert_markdown_compliance(make_result(reply="Book here: https://calendly.com/nishithmanu/30min"))


class TestTenantBleed:
    def test_clean_reply_passes(self):
        HardAsserter.assert_no_tenant_bleed(
            make_result(reply="Royal Garden Villas offers private pools in Lonavala."),
            forbidden_tenants=["Mango Alibaug"],
        )

    def test_direct_leak_fails(self):
        with pytest.raises(AssertionError):
            HardAsserter.assert_no_tenant_bleed(
                make_result(reply="We don't have that, but Mango Alibaug does offer pet-friendly stays."),
                forbidden_tenants=["Mango Alibaug"],
            )

    def test_leak_disguised_as_refusal_fails(self):
        # Regression test for the bypass that used to exist: a reply that *sounds* like a
        # refusal ("sorry", "cannot") but still names the forbidden tenant must still fail.
        # Before the fix in this session, this exact case slipped through silently.
        with pytest.raises(AssertionError):
            HardAsserter.assert_no_tenant_bleed(
                make_result(reply="Sorry, I cannot confirm Mango Alibaug's pet policy from here."),
                forbidden_tenants=["Mango Alibaug"],
            )

    def test_proper_refusal_without_naming_competitor_passes(self):
        # The system prompt requires refusals to NOT hardcode the competitor's name — this is
        # what a correct refusal looks like, and it should pass cleanly.
        HardAsserter.assert_no_tenant_bleed(
            make_result(reply="I can only assist you with inquiries regarding Royal Garden Villas."),
            forbidden_tenants=["Mango Alibaug"],
        )


class TestInteractivePayload:
    def test_no_interactive_key_passes(self):
        HardAsserter.assert_interactive_payload(make_result(raw_response={}))

    def test_header_at_limit_passes(self):
        HardAsserter.assert_interactive_payload(make_result(raw_response={
            "interactive": {"header": {"text": "x" * 24}}
        }))

    def test_header_over_limit_fails(self):
        with pytest.raises(AssertionError):
            HardAsserter.assert_interactive_payload(make_result(raw_response={
                "interactive": {"header": {"text": "x" * 25}}
            }))

    def test_button_title_over_limit_fails(self):
        with pytest.raises(AssertionError):
            HardAsserter.assert_interactive_payload(make_result(raw_response={
                "interactive": {"action": {"buttons": [{"reply": {"title": "x" * 21}}]}}
            }))

    def test_button_title_at_limit_passes(self):
        HardAsserter.assert_interactive_payload(make_result(raw_response={
            "interactive": {"action": {"buttons": [{"reply": {"title": "x" * 20}}]}}
        }))
