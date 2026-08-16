import pytest
import hmac
import hashlib
import json
import os
import responses
from clients.crm_adapter import CRMAdapter

@pytest.fixture
def adapter(tmp_path):
    # Use Pytest's tmp_path fixture to sandbox our recovery queue file
    queue_file = tmp_path / "recovery_queue.json"
    return CRMAdapter(queue_file=str(queue_file))

# Gap 1 & Refinement 1: Cap the backoff at 32s
def test_exponential_backoff_cap(adapter):
    for attempt in range(1, 15):
        delay = adapter.get_backoff_delay(attempt)
        assert delay <= 33.0
        if attempt >= 5:
            assert delay >= 32.0 # Cap lower bound

# Gap 2: Queue replay recovery using local storage
def test_queue_replay_failover(adapter):
    lead = {
        "external_id": "lead_101",
        "name": "Lena Mukhi",
        "email": "lena@mangoalibaug.com",
        "phone": "9820228077",
        "check_in_date": "2026-08-20",
        "check_out_date": "2026-08-22",
        "additional_requirements": "Konkani Seafood Pack"
    }

    # Verify queue is empty initially
    assert not os.path.exists(adapter.queue_file)

    # Trigger queue recovery
    adapter.push_to_queue(lead)
    assert os.path.exists(adapter.queue_file)

    # Verify lead content inside queue
    with open(adapter.queue_file, "r") as f:
        queue = json.load(f)
    assert len(queue) == 1
    assert queue[0]["external_id"] == "lead_101"

    # Mock successful replay function
    def mock_router(lead_data):
        return True

    flushed = adapter.replay_queue(mock_router)
    assert flushed == 1

    # Verify queue is empty after successful flush
    with open(adapter.queue_file, "r") as f:
        remaining = json.load(f)
    assert len(remaining) == 0

# Lead Idempotency check: Don't duplicate leads already in queue
def test_lead_idempotency(adapter):
    lead = {
        "external_id": "dup_102",
        "name": "Nikhil Mirkar"
    }

    adapter.push_to_queue(lead)
    adapter.push_to_queue(lead) # Duplicate insert attempt

    with open(adapter.queue_file, "r") as f:
        queue = json.load(f)
    assert len(queue) == 1 # Only one instance should exist

# Gap 3: HubSpot OAuth 401 token refresh mock test
@responses.activate
def test_hubspot_token_refresh(adapter):
    adapter.hubspot_refresh_token = "mock_refresh_token"
    adapter.hubspot_client_id = "mock_client_id"
    adapter.hubspot_client_secret = "mock_client_secret"

    # Mock HubSpot refresh endpoint response
    responses.add(
        responses.POST,
        "https://api.hubapi.com/oauth/v1/token",
        json={"access_token": "new_refreshed_access_token"},
        status=200
    )

    success = adapter.refresh_hubspot_token()
    assert success is True
    assert adapter.hubspot_access_token == "new_refreshed_access_token"

# Gap 4: Multi-tenant CRM Routing
# CAUTION: this test is self-contained decoration, not a real integration check. `tenants`
# and `route_lead` are defined right here in the test, not imported from any production
# code — so this passes today even though the actual live product (lib/zoho.js) only
# implements Zoho, not HubSpot or LeadSquared. It proves the routing IDEA works, not that
# it's wired up. Don't read "6 passed" as "multi-CRM routing is live" — it isn't yet.
def test_crm_tenant_routing():
    tenants = {
        "9": {"name": "Mango Alibaug", "crm": "zoho"},
        "18": {"name": "The Machan", "crm": "hubspot"},
        "21": {"name": "Destiny Farmstay", "crm": "leadsquared"}
    }
    
    def route_lead(tenant_id):
        tenant_config = tenants.get(tenant_id)
        if not tenant_config:
            return "unknown"
        return tenant_config["crm"]

    assert route_lead("9") == "zoho"
    assert route_lead("18") == "hubspot"
    assert route_lead("21") == "leadsquared"

# Gap 5: PMS HMAC Signature Verification
def verify_pms_signature(payload_bytes, signature, secret_key):
    expected_sig = hmac.new(
        secret_key.encode('utf-8'),
        payload_bytes,
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected_sig, signature)

def test_pms_webhook_signature_verification():
    secret = "secure_pms_webhook_secret_key"
    payload = json.dumps({"booking_id": "BK_992", "guests": 4}).encode('utf-8')
    
    # Generate signature
    signature = hmac.new(secret.encode('utf-8'), payload, hashlib.sha256).hexdigest()
    
    # Verify successful case
    assert verify_pms_signature(payload, signature, secret) is True
    
    # Verify spoofing prevention
    assert verify_pms_signature(payload, "fake_spoofed_signature", secret) is False

# Regression test for a real bug found this session: push_to_zoho() built its Zoho API
# request with no Authorization header at all, despite a comment saying "Zoho expects
# Authorization header" right above the headers dict. Every real call would have failed
# with 401 — the retry/backoff/queue logic was well tested, but the actual HTTP call it
# was retrying was broken from the start.
@responses.activate
def test_push_to_zoho_sends_authorization_header(adapter):
    responses.add(
        responses.POST,
        "https://www.zohoapis.in/crm/v2/Leads",
        json={"data": [{"code": "SUCCESS"}]},
        status=201,
    )
    lead = {"name": "Nishith Test Lead", "email": "test@example.com", "phone": "9999999999"}
    result = adapter.push_to_zoho(lead, access_token="mock_zoho_access_token")

    assert result is True
    sent_headers = responses.calls[0].request.headers
    assert "Authorization" in sent_headers, "push_to_zoho sent no Authorization header — every real call to Zoho would 401"
    assert "mock_zoho_access_token" in sent_headers["Authorization"]
