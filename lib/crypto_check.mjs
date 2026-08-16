// Standalone Node harness for lib/crypto.js — run with: node lib/crypto_check.mjs
// Prints one JSON line per assertion so a pytest wrapper (test_crypto_roundtrip.py)
// can parse results without needing a JS test runner installed.
import { encrypt, decrypt } from './crypto.js';

const results = [];
function check(name, pass, detail = "") {
  results.push({ name, pass, detail });
}

// 1. Round-trip: encrypt then decrypt returns the original plaintext
const secret = "EAAG_test_whatsapp_permanent_token_abc123!!";
const enc = encrypt(secret);
check("round_trip_shape", typeof enc === "string" && enc.split(":").length === 3, `got: ${enc}`);
const dec = decrypt(enc);
check("round_trip_value", dec === secret, `expected "${secret}", got "${dec}"`);

// 2. Two encryptions of the same plaintext must differ (random IV per call) —
//    if this ever fails it means the IV generation broke and ciphertexts are replayable/comparable.
const enc2 = encrypt(secret);
check("iv_randomized_per_call", enc !== enc2, "two encrypt() calls on the same input produced identical ciphertext");

// 3. Tamper detection: flipping a character in the ciphertext must NOT silently decrypt to the
//    original plaintext. AES-GCM's auth tag should cause decrypt() to fail and fall back to
//    returning the raw (garbled) input, per the function's own documented behavior.
const [ivPart, tagPart, cipherPart] = enc.split(":");
const flippedChar = cipherPart[0] === "0" ? "1" : "0";
const tampered = `${ivPart}:${tagPart}:${flippedChar}${cipherPart.slice(1)}`;
const tamperedResult = decrypt(tampered);
check("tamper_detected", tamperedResult !== secret, `tampered ciphertext decrypted successfully to the real secret — auth tag is not being enforced! got: "${tamperedResult}"`);

// 4. Backward-compat: a plain (non colon-delimited) legacy string passes through unchanged
const legacy = "unencrypted_legacy_token_value";
check("legacy_passthrough", decrypt(legacy) === legacy, `expected passthrough, got "${decrypt(legacy)}"`);

// 5. Null/empty handling
check("encrypt_null_returns_null", encrypt(null) === null);
check("encrypt_empty_returns_null", encrypt("") === null);
check("decrypt_null_returns_null", decrypt(null) === null);

// 6. Wrong-key decrypt must fail closed, not return plaintext-looking garbage silently accepted.
//    (We can't swap ENCRYPTION_KEY at runtime here since it's read once from env at module load,
//    so this is covered instead by the auth-tag tamper test above, which exercises the same code path.)

console.log(JSON.stringify(results));
const allPass = results.every(r => r.pass);
process.exit(allPass ? 0 : 1);
