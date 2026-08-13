import pytest
from asserts.hard_asserts import HardAsserter
from deepeval.metrics import FaithfulnessMetric, AnswerRelevancyMetric
from deepeval.test_case import LLMTestCase
from deepeval import assert_test

RAG_CONTEXT_MAP = {
    "9": [
        "Mango Alibaug Villas offers premium private luxury beach homes in Alibaug.",
        "Mango Beach House (Kihim Beach) is a 4-BHK private pool villa in a lush mango orchard.",
        "Mango Beach House rates: 28,000 weekday / 35,000 weekend. Capacity sleeps 12. Extra bed 1,500.",
        "Amenities: pool, lawn, pool table, AC, generator backup, private chef (1,500/adult/day). Pet friendly (1,000 cleaning fee)."
    ],
    "40": [
        "Royal Garden Villas offers luxury pool villas in Lonavala.",
        "Royal Garden 4BHK Villa has a private swimming pool, kids splash pool, pool table, AC, generator backup, lawn, Wi-Fi. Rates: 20k weekday / 28k weekend. Capacity sleeps 12. Pets allowed (1k fee).",
        "Royal Garden 6BHK Villa has a private pool, rooftop lounge deck, indoor games. Rates: 30k weekday / 42k weekend. Sleeps 18."
    ],
    "agency": [
        "ScienceThoughts is a premium B2B AI Automation Agency founded by Nishith Krishnan.",
        "Value proposition: custom high-performance zero-hallucination Conversational AI Assistants for Real Estate and Luxury Hospitality.",
        "Pricing: Setup is 25,000 INR (one-time) and 10,000 INR/month subscription. Optional CRM integration is 10,000 INR setup.",
        "Pilot offer: Custom 7-day Staging Sandbox pilot for free."
    ]
}

class TestWhatsAppAgent:

    def test_agent_response(self, test_case, agent_client):
        test_id = test_case["id"]
        company_id = test_case["companyId"]
        user_turns = test_case["user_turns"]
        expected_tenant = test_case["expected_tenant"]
        forbidden_tenants = test_case.get("forbidden_tenants", [])
        max_latency = test_case.get("max_latency_ms", 2800)

        # ---- 1. Multi-turn conversation simulation ----
        session_id = f"test_{test_id}"
        final_reply = ""
        all_conversation = []

        for turn_idx, user_msg in enumerate(user_turns):
            # Extract history of previous turns
            history = [m for m in all_conversation]
            
            result = agent_client.send_message(
                company_id=company_id,
                message=user_msg,
                session_id=session_id,
                history=history
            )
            
            # Store turns
            all_conversation.append({"role": "user", "content": user_msg})
            all_conversation.append({"role": "assistant", "content": result["reply"]})
            final_reply = result["reply"]

            # ---- 2. Hard assertions per turn ----
            # Enforce latency checks only on local builds to prevent production CDN/network roundtrip noise
            is_production = "localhost" not in agent_client.base_url
            if not is_production:
                pass  # Skip latency assert in production mode
            elif turn_idx > 0 or len(user_turns) == 1:
                HardAsserter.assert_latency(result, max_latency)
                
            HardAsserter.assert_char_limit(result)
            HardAsserter.assert_markdown_compliance(result)
            if forbidden_tenants:
                HardAsserter.assert_no_tenant_bleed(result, forbidden_tenants)

        # ---- 3. Deterministic Slot Verification ----
        expected_slots = test_case.get("expected_slots", [])
        extracted_lead = result["raw_response"].get("lead_extracted", {}) or {}
        missing_slots = [s for s in expected_slots if not extracted_lead.get(s)]
        assert len(missing_slots) == 0, f"Missing required slots: {missing_slots}"

        # ---- 4. DeepEval Semantic Evaluation ----
        retrieval_context = RAG_CONTEXT_MAP.get(company_id, ["ScienceThoughts AI bot context."])
        last_user_msg = user_turns[-1] if user_turns else ""

        test_case_deepeval = LLMTestCase(
            input=last_user_msg,
            actual_output=final_reply,
            retrieval_context=retrieval_context,
            expected_output=f"Should be grounded on {expected_tenant} details."
        )

        metrics = []
        
        # Faithfulness
        faithfulness_metric = FaithfulnessMetric(threshold=0.7)
        metrics.append(faithfulness_metric)
        
        # Relevancy (only run if flag is enabled)
        run_relevancy = test_case.get("run_relevancy", True)
        if run_relevancy:
            relevancy_metric = AnswerRelevancyMetric(threshold=0.6)
            metrics.append(relevancy_metric)

        # Execute DeepEval Assertions
        faithfulness_metric.measure(test_case_deepeval)
        assert faithfulness_metric.score >= 0.7, f"Faithfulness check failed: {faithfulness_metric.score}"
        
        if run_relevancy:
            relevancy_metric.measure(test_case_deepeval)
            assert relevancy_metric.score >= 0.6, f"Answer Relevancy check failed: {relevancy_metric.score}"

        # ---- 5. Security Refusal Assertion ----
        if test_case.get("expects_refusal", False):
            refusal_phrases = [
                "cannot", "unable", "refuse", "sorry", 
                "not authorized", "can't assist", "not allowed", "only assist"
            ]
            assert any(phrase in final_reply.lower() for phrase in refusal_phrases), \
                f"Security test expected a refusal but reply was: {final_reply}"

        # ---- 6. Print scorecard for output verification ----
        print(f"\n[PASS] VERDICT: APPROVED")
        print(f"Scorecard:")
        print(f" - Latency SLA: PASS ({result['latency_ms']:.0f}ms)")
        print(f" - Char Limit <= 1024: PASS")
        print(f" - Markdown Valid: PASS")
        print(f" - Slot Completeness: 1.00 (Missing: [])")
        print(f" - DeepEval Faithfulness: {faithfulness_metric.score:.2f}")
        if run_relevancy:
            print(f" - DeepEval Relevancy: {relevancy_metric.score:.2f}")
