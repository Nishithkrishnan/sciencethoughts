import pytest
import json
import os
from pathlib import Path
from clients.agent_client import AgentClient

def _load_from_env_local(var_name: str):
    """Falls back to .env.local for a var not already in the environment, mirroring how
    Next.js itself reads that file — so pytest and `next dev` can share one secrets file."""
    value = os.getenv(var_name)
    if not value:
        env_local_path = Path(__file__).parent.parent / ".env.local"
        if env_local_path.exists():
            with open(env_local_path, "r", encoding="utf-8") as f:
                for line in f:
                    if line.strip().startswith(f"{var_name}="):
                        value = line.split("=", 1)[1].strip().strip('"').strip("'")
                        break
    if value:
        os.environ[var_name] = value
    return value

# Automatically load OpenAI API key into session environment — required for DeepEval's own
# judge-model calls (Faithfulness/Relevancy), separate from whatever key production itself uses.
_load_from_env_local("OPENAI_API_KEY")

# Optional — if set (same value as Vercel's EVAL_BYPASS_TOKEN), AgentClient sends it as a header
# so this run skips the public web-demo's per-IP daily rate limit. Without it, running the full
# suite twice in the same UTC day from the same machine trips that limit partway through the
# second run (see all-tenants-routing-test-5-sep.md). Safe to leave unset — tests just run
# against the real rate limit like a normal visitor would, same as before this existed.
_load_from_env_local("EVAL_BYPASS_TOKEN")

# Load golden dataset
def load_test_cases():
    path = Path(__file__).parent / "golden_dataset.json"
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

import socket

def is_port_open(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        return s.connect_ex(('127.0.0.1', port)) == 0

@pytest.fixture(scope="session")
def agent_client():
    if is_port_open(3000):
        print("\n[INFO] Local dev server detected on port 3000. Routing tests to http://localhost:3000...")
        return AgentClient(base_url="http://localhost:3000")
    else:
        print("\n[INFO] Local dev server port 3000 is closed. Routing tests to production https://www.sciencethoughts.com...")
        return AgentClient(base_url="https://www.sciencethoughts.com")

@pytest.fixture(scope="session")
def test_cases():
    return load_test_cases()

def pytest_generate_tests(metafunc):
    """Dynamically parametrize tests from golden_dataset.json"""
    if "test_case" in metafunc.fixturenames:
        cases = load_test_cases()
        metafunc.parametrize(
            "test_case", 
            cases, 
            ids=[case["id"] for case in cases]
        )
