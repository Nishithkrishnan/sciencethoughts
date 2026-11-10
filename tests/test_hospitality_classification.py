"""
Regression guard for how built-in tenants are classified in app/api/whatsapp-demo/route.js.

History: "is this tenant a stay?" was once defined three different ways in that file, and the
copies drifted apart, which sent one tenant's guests down the wrong conversation flow in
production. There is now one definition (HOSPITALITY_IDS, derived from companiesMap), and this
test keeps it that way.

It also guards a later decision: the built-in tenants are ScienceThoughts' own assistant, three
FICTIONAL demo businesses, and M3 Resorts (our own test property). The roughly 55 real brands
that used to be built in as prospect demos were removed and must not come back. Real clients are
created at runtime (tenant:meta:{id} in KV), never added to companiesMap.

This test needs no Node, network call or API key: it parses the route.js source directly.
"""
import re
from pathlib import Path

import pytest

ROUTE_JS = Path(__file__).parent.parent / "app" / "api" / "whatsapp-demo" / "route.js"

# Ground truth, independent of the source file (re-deriving it from the code under test would
# defeat the point). Update these on purpose when a built-in tenant is added or removed.
EXPECTED_HOSPITALITY_IDS = {"tamarind-cove", "m3resorts"}
EXPECTED_BUSINESS_IDS = {"northgate-dental", "copperline-plumbing"}
EXPECTED_ALL_IDS = EXPECTED_HOSPITALITY_IDS | EXPECTED_BUSINESS_IDS | {"agency"}

# A sample of the retired real brands. None may appear as a built-in tenant name again.
RETIRED_REAL_BRANDS = [
    "Mango Alibaug", "The Machan", "StayVista", "SaffronStays", "Lohono", "ELIVAAS",
    "Royal Garden Villas", "Neemrana", "CGH Earth", "Glenburn", "Diphlu", "Ramathra",
]


def _read_source():
    if not ROUTE_JS.exists():
        pytest.skip(f"route.js not found at {ROUTE_JS} — copy the live file here to run this check")
    return ROUTE_JS.read_text(encoding="utf-8")


def _extract_companies_map(source):
    match = re.search(r"const companiesMap = \{(.*?)\n\};", source, re.DOTALL)
    assert match, "Could not find companiesMap in route.js — has it been renamed/restructured?"
    return dict(re.findall(r"'([^']+)':\s*'([^']*)'", match.group(1)))


def _extract_business_ids(source):
    match = re.search(r"const BUILT_IN_BUSINESS_IDS = new Set\(\[(.*?)\]\);", source, re.DOTALL)
    assert match, "Could not find BUILT_IN_BUSINESS_IDS in route.js — did its shape change?"
    return set(re.findall(r"'([^']+)'", match.group(1)))


class TestBuiltInTenantClassification:
    def test_companies_map_covers_expected_ids(self):
        companies = _extract_companies_map(_read_source())
        assert set(companies.keys()) == EXPECTED_ALL_IDS, (
            "Built-in tenant ids changed and this test's ground truth wasn't updated. "
            f"New/removed ids: {set(companies.keys()) ^ EXPECTED_ALL_IDS}"
        )

    def test_business_ids_match_and_exist(self):
        source = _read_source()
        business = _extract_business_ids(source)
        assert business == EXPECTED_BUSINESS_IDS, f"Unexpected non-stay built-ins: {business ^ EXPECTED_BUSINESS_IDS}"
        assert business <= set(_extract_companies_map(source)), "A business id is not in companiesMap"

    def test_single_shared_hospitality_set_is_derived_from_companies_map(self):
        """One definition of 'stay', derived from companiesMap minus the agency and the built-in
        businesses — not a hardcoded id list or a numeric cutoff that can go stale."""
        source = _read_source()
        assert len(re.findall(r"const HOSPITALITY_IDS\s*=", source)) == 1, "HOSPITALITY_IDS must be defined exactly once"
        match = re.search(
            r"const HOSPITALITY_IDS = new Set\(\s*Object\.keys\(companiesMap\)\.filter\(\((\w+)\)\s*=>\s*(.*?)\)\s*\);",
            source, re.DOTALL,
        )
        assert match, "HOSPITALITY_IDS is no longer derived from companiesMap — did its shape change?"
        body = match.group(2)
        assert "'agency'" in body and "BUILT_IN_BUSINESS_IDS" in body, (
            "HOSPITALITY_IDS must exclude both the agency and BUILT_IN_BUSINESS_IDS"
        )
        derived = set(_extract_companies_map(source)) - {"agency"} - _extract_business_ids(source)
        assert derived == EXPECTED_HOSPITALITY_IDS, f"Derived stay set is wrong: {derived ^ EXPECTED_HOSPITALITY_IDS}"

    def test_no_raw_numeric_or_hardcoded_classification(self):
        source = _read_source()
        assert not re.search(r"parseInt\([^)]*\)\s*>=\s*\d+", source), (
            "Found a raw numeric tenant-id cutoff — classify through HOSPITALITY_IDS / tenant type instead."
        )
        assert not re.search(r'\[[^\]]*\]\.includes\(companyId\)', source), (
            "Found a hardcoded tenant-id array driving behaviour — this previously went stale."
        )

    def test_no_real_brand_is_a_built_in_tenant(self):
        names = " | ".join(_extract_companies_map(_read_source()).values())
        leaked = [b for b in RETIRED_REAL_BRANDS if b.lower() in names.lower()]
        assert not leaked, f"Real brands are built-in tenants again: {leaked}. Demo tenants must be fictional."

    def test_runtime_tenants_are_supported(self):
        """Real clients come from KV (tenant:meta:{id}), so onboarding needs no deploy."""
        source = _read_source()
        assert "async function getTenantMeta" in source and "tenant:meta:" in source, (
            "The runtime tenant registry is missing — every new client would need a code change again."
        )
