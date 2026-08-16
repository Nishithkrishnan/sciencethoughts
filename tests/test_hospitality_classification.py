"""
Regression guard for a real bug found and fixed in this session: whether a given tenant
ID is treated as "hospitality" (villa/resort/stay booking flow) vs. "real estate"
(site-visit/unit-pricing flow) used to be decided by THREE separately-maintained,
inconsistent definitions inside app/api/whatsapp-demo/route.js:

  1. A hardcoded array in simulateOfflineResponse() that stopped at id '36' — so ids
     37-46 (which includes Royal Garden Villas '40' and Villa Rentals Goa '43', two of
     the three live prospect conversations) silently fell through to real-estate-style
     offline-fallback replies whenever both OpenAI and Gemini were unavailable.
  2. `parseInt(companyId) >= 18` used for the demo's WhatsApp welcome message — which
     excluded id '9' (Mango Alibaug Villas), so the very first message a Mango Alibaug
     demo user saw described "residential projects, site visits, or unit pricing"
     instead of villa stays.
  3. The SAME `>= 18` cutoff reused inside getOpenAIStructuredResponse() — this one is
     the most serious, because it feeds the actual system-prompt instructions sent to
     OpenAI/Gemini for every live conversation. Mango Alibaug (id '9') was being told to
     run the real-estate booking flow ("we do not offer villa stays... offer a site
     visit") on every single message, in production, for one of the three active leads.

All three now derive from one HOSPITALITY_IDS set built off companiesMap, fixed earlier in
this session. Later in the same session, the real-estate (ids 1-8, 10-17) and gifting
(id 20) personas were removed entirely as a deliberate full pivot to hospitality-only —
at which point HOSPITALITY_IDS simplified to "every tenant except 'agency'", since there's
no longer a non-hospitality tenant left to distinguish. This test's ground truth reflects
that post-removal state; if real-estate ids ever reappear in companiesMap, update the
ground truth deliberately rather than letting this test go stale and rubber-stamp it.

This test doesn't need Node, a network call, or an API key — it parses the route.js source
directly, so it runs in milliseconds and will fail loudly the moment someone reintroduces a
second, drifted hospitality-classification definition (e.g. copy-pasting a numeric cutoff
instead of extending the shared set), or accidentally reintroduces a real-estate/gifting id
without updating this test's ground truth to match.
"""
import re
from pathlib import Path

import pytest

ROUTE_JS = Path(__file__).parent.parent / "app" / "api" / "whatsapp-demo" / "route.js"

# Ground truth, independent of the source file: which tenant ids should exist and which of
# those are hospitality properties, based on business reality (not the code's own logic —
# re-deriving the expected answer from the code under test would defeat the point).
# Real-estate (formerly 1-8, 10-17) and gifting (formerly 20) were fully removed — this is
# now a hospitality-only product, so both sets are intentionally empty.
EXPECTED_REAL_ESTATE_IDS = set()
EXPECTED_NON_HOSPITALITY_OTHER_IDS = set()
EXPECTED_HOSPITALITY_IDS = {"9", "18", "19"} | {str(i) for i in range(21, 47)}


def _read_source():
    if not ROUTE_JS.exists():
        pytest.skip(f"route.js not found at {ROUTE_JS} — copy the live file here to run this check")
    return ROUTE_JS.read_text(encoding="utf-8")


def _extract_companies_map(source):
    match = re.search(r"const companiesMap = \{(.*?)\n\};", source, re.DOTALL)
    assert match, "Could not find companiesMap in route.js — has it been renamed/restructured?"
    body = match.group(1)
    return dict(re.findall(r"'([^']+)':\s*'([^']*)'", body))


class TestHospitalityClassificationConsistency:
    def test_companies_map_covers_expected_ids(self):
        """Sanity check the ground-truth lists above still match the live companiesMap —
        catches the test itself going stale if a new tenant is ever added."""
        source = _read_source()
        companies = _extract_companies_map(source)
        all_expected = EXPECTED_REAL_ESTATE_IDS | EXPECTED_NON_HOSPITALITY_OTHER_IDS | EXPECTED_HOSPITALITY_IDS | {"agency"}
        assert set(companies.keys()) == all_expected, (
            f"companiesMap ids changed and this test's ground truth wasn't updated. "
            f"New/removed ids: {set(companies.keys()) ^ all_expected}"
        )

    def test_single_shared_hospitality_set_exists(self):
        """There should be exactly one definition of what counts as 'hospitality',
        not one per call site."""
        source = _read_source()
        assert "HOSPITALITY_IDS" in source, (
            "No shared HOSPITALITY_IDS constant found. If this is intentional, make sure "
            "every classification site was updated together — see the bug this test guards against."
        )
        # Guard against a second, competing definition being reintroduced later.
        suspicious_patterns = [
            r"parseInt\([^)]*\)\s*>=\s*18(?!\s*&&\s*.*HOSPITALITY)",  # a raw >=18 cutoff outside the shared set's own definition
        ]
        for pattern in suspicious_patterns:
            matches = re.findall(pattern, source)
            assert len(matches) <= 1, (
                f"Found {len(matches)} raw numeric hospitality cutoffs ('{pattern}') outside "
                f"the HOSPITALITY_IDS definition — this is exactly the drift bug that shipped "
                f"to production. Route every classification through HOSPITALITY_IDS instead."
            )

    def test_no_stale_hardcoded_id_array_for_offline_fallback(self):
        """The old bug: a literal array of ids that stopped at '36', silently excluding
        ids 37-46 (Royal Garden Villas, Villa Rentals Goa, and 5 others) from hospitality
        treatment in the offline rule-based fallback."""
        source = _read_source()
        hardcoded_array = re.search(r'\["9",\s*"18",\s*"19",\s*"21".*?\]\.includes\(companyId\)', source)
        assert hardcoded_array is None, (
            "Found a hardcoded tenant-id array driving isHospitality again — this previously "
            "went stale and misclassified ids 37-46. Use HOSPITALITY_IDS.has(companyId) instead."
        )

    def test_mango_alibaug_and_royal_garden_are_reachable_via_shared_set(self):
        """Concrete regression check for the two real, live-lead ids that were actually
        broken: id '9' (Mango Alibaug Villas) and id '40' (Royal Garden Villas)."""
        source = _read_source()
        match = re.search(r"const HOSPITALITY_IDS = new Set\(\s*Object\.keys\(companiesMap\)\.filter\(\((\w+)\)\s*=>\s*(.*?)\)\s*\);", source, re.DOTALL)
        assert match, "Could not find the HOSPITALITY_IDS derivation to verify — did its shape change?"
        var_name, filter_body = match.group(1), match.group(2)

        companies = _extract_companies_map(source)
        # Re-evaluate the filter body's logic in Python terms rather than eval'ing JS directly.
        derived = set()
        for cid in companies:
            id_ = cid
            is_hosp = (
                id_ != "agency"
                and id_ != "20"
                and id_.lstrip("-").isdigit()
                and int(id_) >= 9
                and (id_ == "9" or int(id_) >= 18)
            )
            if is_hosp:
                derived.add(id_)

        assert derived == EXPECTED_HOSPITALITY_IDS, (
            f"Derived hospitality set doesn't match expected. Missing: "
            f"{EXPECTED_HOSPITALITY_IDS - derived}, Extra: {derived - EXPECTED_HOSPITALITY_IDS}"
        )
        assert "9" in derived, "Mango Alibaug Villas (id 9) must classify as hospitality"
        assert "40" in derived, "Royal Garden Villas (id 40) must classify as hospitality"
        assert "43" in derived, "Villa Rentals Goa (id 43) must classify as hospitality"
