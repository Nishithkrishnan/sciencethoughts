"""
Unit tests for lib/crypto.js — the AES-256-GCM helper that encrypts every tenant's
WhatsApp access token and Zoho CRM credentials before they're written to Vercel KV.

This is one of the few things in the stack that can be tested with zero network access
and zero API keys: it's pure local crypto logic. Run it on every change to lib/crypto.js,
and definitely before onboarding a new client (a break here means every future client's
credentials get "encrypted" in a way that doesn't actually protect them).

Requires: Node.js on PATH. No network, no OpenAI/Gemini key, no deployed site needed.
"""
import json
import shutil
import subprocess
import sys
from pathlib import Path

import pytest

CHECK_SCRIPT = Path(__file__).parent.parent / "lib" / "crypto_check.mjs"


class NodeNotFound(Exception):
    """Raised when no `node` executable is resolvable on PATH for this process.

    Distinct from a real crypto-logic failure: this means the environment running
    pytest can't find Node.js, not that lib/crypto.js is broken. Kept as its own
    exception so setup_class can turn it into a clean pytest.skip instead of a
    red ERROR that looks like a security check tripped."""


def run_crypto_check():
    if not CHECK_SCRIPT.exists():
        raise FileNotFoundError(
            f"crypto_check.mjs not found at {CHECK_SCRIPT}. "
            "This harness lives next to lib/crypto.js — copy it there if it's missing."
        )
    node_path = shutil.which("node")
    if node_path is None:
        raise NodeNotFound(
            "No `node` executable found on PATH for this process. If Node.js is "
            "installed via a version manager (nvm, nvm-windows, volta), make sure "
            "the shell/terminal you're running `pytest` from is the one that has "
            "`node` on PATH — try running `node --version` in that exact same "
            "terminal window to confirm."
        )
    proc = subprocess.run(
        [node_path, str(CHECK_SCRIPT)],
        capture_output=True,
        text=True,
        timeout=15,
    )
    # The harness prints one JSON array line (results) among any console.warn/error lines.
    json_line = None
    for line in proc.stdout.splitlines():
        line = line.strip()
        if line.startswith("[") and line.endswith("]"):
            json_line = line
            break
    if json_line is None:
        raise RuntimeError(
            f"crypto_check.mjs produced no parseable result.\nstdout:\n{proc.stdout}\nstderr:\n{proc.stderr}"
        )
    return json.loads(json_line)


class TestCryptoRoundTrip:
    """Each of these maps 1:1 to an assertion in lib/crypto_check.mjs."""

    @classmethod
    def setup_class(cls):
        try:
            cls.results = {r["name"]: r for r in run_crypto_check()}
        except NodeNotFound as e:
            pytest.skip(str(e))

    def _assert(self, name):
        r = self.results.get(name)
        assert r is not None, f"Expected check '{name}' did not run"
        assert r["pass"], f"{name} FAILED: {r['detail']}"

    def test_round_trip_shape(self):
        """encrypt() must return the documented iv:authTag:ciphertext hex format."""
        self._assert("round_trip_shape")

    def test_round_trip_value(self):
        """decrypt(encrypt(x)) must equal x exactly."""
        self._assert("round_trip_value")

    def test_iv_randomized_per_call(self):
        """Encrypting the same plaintext twice must not produce identical ciphertext
        (a fixed/reused IV would make stored secrets comparable/crackable)."""
        self._assert("iv_randomized_per_call")

    def test_tamper_is_detected(self):
        """A single flipped bit in stored ciphertext must NOT decrypt successfully.
        This is what actually protects a tenant's WhatsApp token if the KV store
        is ever read or modified by something it shouldn't be."""
        self._assert("tamper_detected")

    def test_legacy_plaintext_passthrough(self):
        """Back-compat: a value that isn't in iv:tag:ciphertext form is returned as-is
        instead of crashing (matters for any credential saved before encryption was added)."""
        self._assert("legacy_passthrough")

    def test_null_and_empty_handling(self):
        self._assert("encrypt_null_returns_null")
        self._assert("encrypt_empty_returns_null")
        self._assert("decrypt_null_returns_null")
