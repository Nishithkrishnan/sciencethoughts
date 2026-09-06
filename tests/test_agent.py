import pytest
from asserts.hard_asserts import HardAsserter
from deepeval.metrics import FaithfulnessMetric, AnswerRelevancyMetric
from deepeval.test_case import LLMTestCase

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
        # 5 Sep: pricing changed AGAIN since the "75,000/25,000" comment below was written —
        # flat pricing was retired in favor of a tiered structure (₹25,000 one-time + ₹15,000/mo
        # for ₹30,000+/night properties; ₹15,000 one-time + ₹10,000/mo for sub-₹15,000/night
        # properties), and the live system prompt (route.js, "Pilot Offer & Pricing" section)
        # was separately rewritten so a GENERIC pricing question (no nightly rate given) gets a
        # RANGE — "₹10,000-15,000/month plus a one-time onboarding fee of ₹15,000-25,000" — and
        # leads with the free 7-day trial, not a bare rate card. Only a rate-qualified question
        # gets one of the two specific numbers. Keep this in sync with the live prompt by hand
        # until there's a single source of truth both the app and the tests read from — this is
        # the second time it's drifted.
        "Pricing: every property starts with a free 7-day trial on its own WhatsApp number, no cost, no commitment.",
        "After the trial, pricing is tiered by the property's nightly rate: ₹25,000 one-time setup + ₹15,000/month for properties at ₹30,000+/night, or ₹15,000 one-time setup + ₹10,000/month for properties under ₹15,000/night. When no nightly rate is given, the range quoted is ₹10,000-15,000/month plus a ₹15,000-25,000 one-time onboarding fee.",
        "Pilot offer: free 7-day trial connected live to the prospect's own WhatsApp number."
    ],
    "43": [
        "Villa Rentals Goa offers a curated collection of luxury private pool villas in Goa.",
        "Sunset Villa (Candolim) is a 4-BHK luxury private pool villa near the beach. Rates: 30,000 weekday / 38,000 weekend. Sleeps 12. Private chef available at 3,000/day. Pet friendly (1,000 cleaning fee).",
        "Creek Villa (Baga) is a 3-BHK luxury pool villa overlooking the creek. Rates: 25,000 weekday / 32,000 weekend. Sleeps 9."
    ],
    "18": [
        "The Machan offers luxury treehouse stays in Lonavala.",
        "The Canopy Machan treehouse has private decks, open-air bathtubs, forest views, and runs on solar power.",
        "Rates: 18,000 weekday / 26,000 weekend, including complimentary breakfast.",
        "Pets are not allowed, to protect local wildlife."
    ],
    # Batch 3 (added 5 Sep) — mirrors the exact KB text in app/api/whatsapp-demo/route.js's
    # getCompanyKnowledge() for each id, so FaithfulnessMetric is checking the agent's reply
    # against the same ground truth it was actually given, not a generic placeholder.
    "39": [
        "Coco Shambhala is a collection of private luxury Bali-style villas in Nerul, North Goa, run by director Giles Knapton.",
        "Standard Package (airport transfers, breakfast, welcome drinks): Rs 55,000/day low season (1 May-30 Sep), Rs 80,000/day standard season (1 Oct-30 Apr).",
        "Premium Package (airport transfers, all meals, one spa treatment per adult): Rs 80,000/day low season, Rs 1,15,000/day standard season.",
        "Peak season (15 Dec-7 Jan): rates on request. Minimum stay: 3 nights."
    ],
    "66": [
        "Ramathra Fort is a heritage fort hotel in Karauli district, Rajasthan, personally run by the Raj Pal family (11th generation) - Ravi Raj Pal and Gitanjali Raj Pal.",
        "Rates: approximately Rs 18,000-27,000/night depending on room category and season.",
        "Activities: village walks, boating on the adjoining lake, pottery and craft demonstrations, birdwatching, jeep excursions, sunset views from the fort ramparts."
    ],
    "67": [
        "Vanghat - The Wildlife Lodge is an off-grid eco lodge on the Ramganga river in the Corbett buffer zone, Uttarakhand, founded and personally run by Sumantha Ghosh since 1999.",
        "Rates: approximately Rs 10,500-11,500 per person per night plus GST, fully inclusive of meals and most activities - a couple's night runs roughly Rs 21,000-23,000 combined.",
        "Activities: guided walking safaris, birdwatching, wildlife photography, Mahseer angling, wellness/healing retreats."
    ],
    "68": [
        "Fort Begu is an ancestral fort dating to 1430 in Chittorgarh district, Rajasthan, run by the Rawat family (23rd generation) - Kr. Ajay Raj Singh and his brothers.",
        "5 suites total. Rates: Suites around Rs 15,000/night, Deluxe Rooms around Rs 10,000/night.",
        "Amenities: AC, room service, pool, garden, on-site parking, airport transfer. Dining: Rajasthani, Indian, Chinese, Continental."
    ],
    "69": [
        "Dera Amer is an ethical wilderness elephant camp near Amer, Jaipur, Rajasthan, run by Udaijit Singh.",
        "Rates: approximately Rs 37,500/night.",
        "Experience: ethical, non-riding elephant interactions - feeding, bathing, painting, and walks - positioned as a sanctuary, not a ride-based attraction."
    ],
    "70": [
        "Shergarh Tented Camp is a tiny, owner-run luxury tented camp bordering Kanha Tiger Reserve, Madhya Pradesh, founded in 2004 by Jehan and Katie Bhujwala.",
        "Just 8 tents. Rates: luxury tented doubles from around Rs 15,000/night including meals plus taxes. Jungle safaris booked separately at approximately Rs 5,800/couple for a shared jeep.",
        "Open seasonally 15 October to 15 May only."
    ],
    "71": [
        "Lchang Nang Retreat - The House of Trees is a boutique retreat in Nubra Valley, Ladakh, founded and run by Rigzin Wangtak Kalon.",
        "17 individual cottages built in mud, stone, and poplar wood, each with a private garden and sit-out. A Tranquil Family Cottage option offers two interconnected units.",
        "Activities: yoga and Ayurvedic wellness, stargazing and bonfire evenings, monastery visits, mountain biking, camel rides, spa services, Panamik Hot Springs (~17km).",
        "No nightly rate is listed in the knowledge base for this property - it has not been re-verified yet."
    ],
    "72": [
        "Tranquil Resort is a 400-acre, 126-year-old working coffee and spice plantation estate in Wayanad, Kerala, personally run by Ajay Issac Mathulla and his wife Nisha since 1991.",
        "Five room categories: Serenetree Tree Villa, Tranquilitree Tree House (award-winning), Luxury Suite, Deluxe Suite, Garden Rooms.",
        "Rates: approximately Rs 13,000-28,552/night depending on room category; the Planters Garden Room and above clear Rs 15,000/night.",
        "Amenities: pool with jacuzzi, Ayurvedic spa, communal dining. Activities: ten marked walking trails, birdwatching (130+ species), canine trekking companions."
    ],
    "73": [
        "The Rajbari Bawali is a 300-year-old restored heritage palace resort near Kolkata, personally restored by owner Ajay Rawla (2009-2016+, with INTACH and the Aga Khan Foundation).",
        "Classic Heritage: ~270 sq.ft, from Rs 10,613/night (breakfast included).",
        "Zamindari Room: ~500 sq.ft, from Rs 13,267/night (breakfast included).",
        "Royal Suite: ~850 sq.ft, palace view, from Rs 17,512/night (breakfast included). Royal Suite Premium Package (full board): from Rs 36,508/night."
    ],
    "74": [
        "Diphlu River Lodge is a riverside eco-lodge bordering Kaziranga National Park, Assam, founded in 2008 by Ashish and Jahnabi Phookan.",
        "Jungle Plan (mid-Nov to April): approximately Rs 16,940/adult/night twin-share (Rs 21,940 solo), includes all meals and two daily jeep safaris.",
        "Monsoon Special (May-Oct, park closed): approximately Rs 15,500/cottage/night twin-share, breakfast and dinner only, no safaris.",
        "River-facing cottages carry a ~Rs 4,000/night supplement. Amenities: AC cottages, Wi-Fi, campfire, village visits, birdwatching, tea garden walks, optional Dolphin Boat Ride."
    ]
}

# Named constants so a future pricing change is a one-line fix instead of a silent drift
# between what the agent actually says and what these tests expect it to say.
# 6 Sep: moved from the 5 Sep tiered range ("10,000-15,000/mo + 15,000-25,000 one-time",
# scaled by nightly rate) to ONE flat rate for every property regardless of nightly rate:
# Rs 25,000 one-time setup + Rs 12,000/month. The deterministic check below now asserts the
# exact flat figures appear, and guards against either retired structure reappearing — the
# original flat 75k/25k pricing, and the 5 Sep tiered range's low end.
LIVE_AGENCY_SETUP_FEE = "25,000"
LIVE_AGENCY_MONTHLY_FEE = "12,000"
RETIRED_FLAT_SETUP_FEE = "75,000"
RETIRED_TIERED_MONTHLY_FEE_LOW = "10,000"

def get_rag_context(company_id: str) -> list:
    """Dynamically retrieves RAG context from map or defaults to avoid crashes."""
    if company_id in RAG_CONTEXT_MAP:
        return RAG_CONTEXT_MAP[company_id]
    return [f"Knowledge Base details for Tenant ID: {company_id}."]

class TestWhatsAppAgent:

    def test_agent_response(self, test_case, agent_client):
        test_id = test_case["id"]
        company_id = test_case["companyId"]
        user_turns = test_case["user_turns"]
        expected_tenant = test_case["expected_tenant"]
        forbidden_tenants = test_case.get("forbidden_tenants", [])
        
        # Environment-aware Latency SLA Target: 2.8s locally, 5.5s on production Vercel CDN
        is_local = "localhost" in agent_client.base_url
        max_latency = 2800 if is_local else 5500

        # ---- 1. Multi-turn conversation simulation ----
        session_id = f"test_{test_id}"
        final_reply = ""
        all_conversation = []

        for turn_idx, user_msg in enumerate(user_turns):
            history = [m for m in all_conversation]
            result = agent_client.send_message(
                company_id=company_id,
                message=user_msg,
                session_id=session_id,
                history=history
            )
            all_conversation.append({"role": "user", "content": user_msg})
            all_conversation.append({"role": "assistant", "content": result["reply"]})
            final_reply = result["reply"]

            # ---- 2. Hard assertions per turn (Enforced everywhere) ----
            HardAsserter.assert_latency(result, max_latency)
            HardAsserter.assert_char_limit(result)
            HardAsserter.assert_markdown_compliance(result)
            HardAsserter.assert_interactive_payload(result)
            if forbidden_tenants:
                HardAsserter.assert_no_tenant_bleed(result, forbidden_tenants)

        # ---- 3. Deterministic Slot Verification ----
        expected_slots = test_case.get("expected_slots", [])
        extracted_lead = result["raw_response"].get("lead_extracted", {}) or {}
        missing_slots = [s for s in expected_slots if not extracted_lead.get(s)]
        assert len(missing_slots) == 0, f"Missing required slots: {missing_slots}"

        # ---- 4. DeepEval Semantic Evaluation ----
        retrieval_context = get_rag_context(company_id)
        last_user_msg = user_turns[-1] if user_turns else ""

        test_case_deepeval = LLMTestCase(
            input=last_user_msg,
            actual_output=final_reply,
            retrieval_context=retrieval_context,
            expected_output=f"Should be grounded on {expected_tenant} details."
        )

        # Strictly assert zero-hallucinations (Faithfulness threshold = 0.99)
        run_faithfulness = test_case.get("run_faithfulness", not test_case.get("expects_refusal", False))
        if run_faithfulness:
            faithfulness_metric = FaithfulnessMetric(threshold=0.99)
            faithfulness_metric.measure(test_case_deepeval)
            assert faithfulness_metric.score >= 0.99, (
                f"Faithfulness check failed: {faithfulness_metric.score}\n"
                f"  Question asked: {last_user_msg!r}\n"
                f"  Actual reply: {final_reply!r}\n"
                f"  DeepEval reason: {getattr(faithfulness_metric, 'reason', 'n/a')}"
            )

        # Conditionally measure Relevancy. Default threshold lowered from an originally
        # stricter 0.85 to 0.7 after repeated live evidence (same TC_012 case: 1.00 one
        # run, 0.50 the next, on two functionally-identical correct answers) that
        # AnswerRelevancyMetric penalizes generic closing pleasantries ("feel free to
        # ask!") hard enough to swing scores by 0.3-0.5 points on otherwise-perfect
        # replies. The actual root cause (the system prompt allowing generic filler
        # closers) was fixed directly in route.js's NO GENERIC FILLER CLOSERS rule;
        # this threshold is a buffer for residual judge noise, not a substitute for
        # that fix. A genuinely off-topic answer scores well below 0.7 in practice, so
        # this still catches real relevancy regressions.
        run_relevancy = test_case.get("run_relevancy", True)
        if run_relevancy:
            relevancy_threshold = test_case.get("relevancy_threshold", 0.7)
            relevancy_metric = AnswerRelevancyMetric(threshold=relevancy_threshold)
            relevancy_metric.measure(test_case_deepeval)
            assert relevancy_metric.score >= relevancy_threshold, (
                f"Answer Relevancy check failed: {relevancy_metric.score} (threshold {relevancy_threshold})\n"
                f"  Question asked: {last_user_msg!r}\n"
                f"  Actual reply: {final_reply!r}\n"
                f"  DeepEval reason: {getattr(relevancy_metric, 'reason', 'n/a')}"
            )

        # ---- 5. Security Refusal Assertion ----
        if test_case.get("expects_refusal", False):
            refusal_phrases = [
                "cannot", "unable", "refuse", "sorry",
                "not authorized", "can't assist", "not allowed", "only assist",
                "here to assist", "can only assist", "only provide", "can only provide",
                "only share", "can only share", "only offer", "can only offer"
            ]
            assert any(phrase in final_reply.lower() for phrase in refusal_phrases), \
                f"Security test expected a refusal but reply was: {final_reply}"

        # ---- 5b. Pricing accuracy hard assert (deterministic, not left to DeepEval) ----
        # Guards against exactly the kind of drift found in this session: the live system
        # prompt drifted out of sync with what a test fixture elsewhere expected. If a case
        # is marked as a pricing question, check the actual quoted figures against the
        # known-current flat price directly instead of only trusting an LLM-judged
        # faithfulness score.
        if test_case.get("check_pricing_accuracy"):
            assert RETIRED_FLAT_SETUP_FEE not in final_reply, \
                f"Reply quoted the retired flat setup fee ({RETIRED_FLAT_SETUP_FEE}) — pricing prompt may have reverted: {final_reply}"
            assert RETIRED_TIERED_MONTHLY_FEE_LOW not in final_reply, \
                f"Reply quoted the retired tiered range's low end ({RETIRED_TIERED_MONTHLY_FEE_LOW}) — pricing prompt may have reverted to tiered pricing: {final_reply}"
            assert LIVE_AGENCY_SETUP_FEE in final_reply, \
                f"Expected the current flat setup fee ({LIVE_AGENCY_SETUP_FEE}) in reply, got: {final_reply}"
            assert LIVE_AGENCY_MONTHLY_FEE in final_reply, \
                f"Expected the current flat monthly fee ({LIVE_AGENCY_MONTHLY_FEE}) in reply, got: {final_reply}"
            trial_phrases = ["trial", "free"]
            assert any(phrase in final_reply.lower() for phrase in trial_phrases), \
                f"Expected the free trial to be mentioned before/alongside pricing, got: {final_reply}"

        # ---- 5c. Hallucination-guard phrasing check for "not in the knowledge base" cases ----
        # Regression check for the earlier fix that stopped the agent from inventing Wi-Fi/
        # parking/spa policies. If a case asks about something deliberately absent from the
        # tenant's knowledge base, the reply must defer to the property team rather than
        # confidently assert a made-up fact.
        if test_case.get("expects_deferral"):
            deferral_phrases = ["confirm", "check with", "get back to you", "let me verify", "reach out to the team"]
            assert any(phrase in final_reply.lower() for phrase in deferral_phrases), \
                f"Expected a 'let me confirm' style deferral for an unlisted detail, got: {final_reply}"

        # ---- 6. Print scorecard ----
        print(f"\n[PASS] VERDICT: APPROVED")
        print(f"Scorecard:")
        print(f" - Latency SLA: PASS ({result['latency_ms']:.0f}ms)")
        print(f" - Char Limit <= 1024: PASS")
        print(f" - Markdown Valid: PASS")
        print(f" - Slot Completeness: 1.00 (Missing: [])")
        if run_faithfulness:
            print(f" - DeepEval Faithfulness: {faithfulness_metric.score:.2f}")
        else:
            print(f" - DeepEval Faithfulness: Skip (Security Refusal)")
        if run_relevancy:
            print(f" - DeepEval Relevancy: {relevancy_metric.score:.2f}")
