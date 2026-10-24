"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CLIENT_TERMS } from "../lib/client-terms";

// Front end of WhatsApp Embedded Signup (v4). Flow:
//  1. Check the signed link (tenant/exp/sig) with the server.
//  1b. The client enters their business details and accepts the Client Service Terms
//      (/client-terms). This is recorded by /api/onboarding/accept-terms, and the server refuses
//      step 4 without it.
//  2. Load Meta's JS SDK; the client clicks "Connect" and completes Meta's popup.
//  3. Meta posts a WA_EMBEDDED_SIGNUP message (WABA id, phone_number_id) to this window, and the
//     FB.login callback returns a code that expires in ~30 seconds.
//  4. Send both to /api/whatsapp/embedded-signup, which finishes setup server-side.
// Meta requires this page to be served over HTTPS from a domain listed in Facebook Login for
// Business > Settings (Allowed domains + Valid OAuth redirect URIs).

const APP_ID = process.env.NEXT_PUBLIC_META_APP_ID || "1341456651450300";
const CONFIG_ID = process.env.NEXT_PUBLIC_META_ES_CONFIG_ID || "";
const SDK_VERSION = process.env.NEXT_PUBLIC_META_GRAPH_VERSION || "v21.0";
const SESSION_INFO_WAIT_MS = 8000; // well inside the code's ~30s lifetime

const wrap = { background: "var(--bg-dark)", minHeight: "100vh", padding: "120px 20px 60px" };
const card = {
  maxWidth: "680px", margin: "0 auto", background: "var(--gradient-panel)",
  border: "1px solid var(--border-hover)", borderRadius: "var(--radius-lg)", padding: "36px"
};
const h1 = { fontSize: "2rem", fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--text-primary)", marginBottom: "10px" };
const p = { color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "14px" };
const li = { color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "8px" };
const button = {
  background: "#1877f2", color: "#fff", border: "none", borderRadius: "var(--radius-sm)",
  padding: "14px 24px", fontSize: "1rem", fontWeight: 700, cursor: "pointer", marginTop: "10px"
};
const box = (color) => ({
  border: `1px solid ${color}`, borderRadius: "var(--radius-md)", padding: "16px 18px",
  marginTop: "20px", color: "var(--text-primary)", lineHeight: 1.6
});

const label = { display: "block", color: "var(--text-primary)", fontWeight: 600, fontSize: "0.92rem", margin: "14px 0 6px" };
const input = {
  width: "100%", boxSizing: "border-box", padding: "11px 12px", borderRadius: "var(--radius-sm)",
  border: "1px solid var(--border-hover)", background: "rgba(255,255,255,0.04)", color: "var(--text-primary)", fontSize: "0.98rem"
};
const fieldError = { color: "#ff7a7a", fontSize: "0.85rem", marginTop: "4px" };
const primaryButton = { ...button, background: "var(--accent-teal)", color: "#04121a" };

const FIELDS = [
  { key: "legalName", label: "Legal name of the business", required: true, placeholder: "As on your GST / Udyam / registration" },
  { key: "tradingName", label: "Property name (if different)" },
  { key: "registration", label: "GST, Udyam or Shop & Establishment number", required: true },
  { key: "pan", label: "PAN (needed if you deduct TDS)", placeholder: "ABCDE1234F" },
  { key: "address", label: "Business address", required: true, multiline: true },
  { key: "contactName", label: "Your name", required: true },
  { key: "contactTitle", label: "Your role", placeholder: "Owner, Manager…" },
  { key: "email", label: "Email for notices and invoices", required: true, type: "email" },
];

// Step 1b: business details + click-to-accept of the Client Service Terms.
function TermsStep({ link, onAccepted }) {
  const [details, setDetails] = useState({ tds: "" });
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setDetails((d) => ({ ...d, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!agree) { setFormError("Please tick the box to accept the Client Service Terms."); return; }
    setSaving(true);
    setFormError("");
    setErrors({});
    try {
      const res = await fetch("/api/onboarding/accept-terms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...link, agree: true, termsVersion: CLIENT_TERMS.version, details })
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        onAccepted({ acceptedAt: data.acceptedAt, legalName: details.legalName });
      } else {
        setErrors(data.errors || {});
        setFormError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setFormError("Couldn't reach Sciencethoughts. Please check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ marginTop: "24px" }}>
      <p style={{ ...p, color: "var(--text-primary)", fontWeight: 700, fontSize: "1.1rem", marginBottom: "4px" }}>Step 1: Your business details</p>
      <p style={{ ...p, fontSize: "0.92rem" }}>These go on your invoices and are the details your agreement with us is made under.</p>
      {FIELDS.map((f) => (
        <div key={f.key}>
          <label style={label} htmlFor={f.key}>{f.label}{f.required ? " *" : ""}</label>
          {f.multiline ? (
            <textarea id={f.key} rows={3} style={input} value={details[f.key] || ""} onChange={set(f.key)} required={f.required} placeholder={f.placeholder} />
          ) : (
            <input id={f.key} type={f.type || "text"} style={input} value={details[f.key] || ""} onChange={set(f.key)} required={f.required} placeholder={f.placeholder} />
          )}
          {errors[f.key] && <div style={fieldError}>{errors[f.key]}</div>}
        </div>
      ))}
      <label style={label} htmlFor="tds">Will you deduct TDS from our invoices? *</label>
      <select id="tds" style={input} value={details.tds} onChange={set("tds")} required>
        <option value="" disabled>Choose one</option>
        <option value="yes">Yes</option>
        <option value="no">No</option>
        <option value="unsure">Not sure yet</option>
      </select>
      {errors.tds && <div style={fieldError}>{errors.tds}</div>}

      <p style={{ ...p, color: "var(--text-primary)", fontWeight: 700, fontSize: "1.1rem", margin: "28px 0 8px" }}>Step 2: Our terms</p>
      <ul style={{ paddingLeft: "20px", marginBottom: "12px" }}>
        <li style={li}>Free 7-day trial on your own number. Nothing is paid until it ends.</li>
        <li style={li}>Then ₹9,999 one-time setup and ₹4,999 a month (one property).</li>
        <li style={li}><strong>Minimum term: 6 months</strong> from the day after your trial, then one month&rsquo;s notice to cancel.</li>
        <li style={li}>Setup fee refunded in full if you cancel before then.</li>
      </ul>
      <label style={{ display: "flex", gap: "10px", alignItems: "flex-start", color: "var(--text-primary)", lineHeight: 1.6, cursor: "pointer" }}>
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ marginTop: "5px", width: "18px", height: "18px" }} />
        <span>
          I have read and accept the{" "}
          <a href="/client-terms" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-teal)" }}>Client Service Terms</a>{" "}
          (version {CLIENT_TERMS.version}), including the 6-month minimum term, and I am authorised to accept them for this business.
        </span>
      </label>
      {formError && <div style={box("#ff5c5c")}>{formError}</div>}
      <button type="submit" style={{ ...primaryButton, opacity: saving || !agree ? 0.6 : 1, marginTop: "18px" }} disabled={saving || !agree}>
        {saving ? "Saving…" : "Accept and continue"}
      </button>
    </form>
  );
}

export default function WhatsAppOnboarding() {
  const [link, setLink] = useState(null);
  const [status, setStatus] = useState("checking"); // checking|invalid|ready|connecting|finishing|done|cancelled|error
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [terms, setTerms] = useState(null); // null = loading; { accepted, acceptedAt, legalName }
  const sessionInfo = useRef(null);
  const finished = useRef(false);

  // 1. Validate the signed link.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const l = { tenant: params.get("tenant") || "", exp: params.get("exp") || "", sig: params.get("sig") || "" };
    fetch(`/api/whatsapp/embedded-signup?${new URLSearchParams(l)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.valid) {
          setLink(l);
          setStatus("ready");
          fetch(`/api/onboarding/accept-terms?${new URLSearchParams(l)}`)
            .then((r) => r.json())
            .then((t) => setTerms({ accepted: Boolean(t.accepted), acceptedAt: t.acceptedAt, legalName: t.details?.legalName }))
            .catch(() => setTerms({ accepted: false }));
        } else {
          setStatus("invalid");
          setMessage(
            d.reason === "missing_parameters" ? "This page needs a personal setup link from Sciencethoughts."
            : d.reason === "expired" ? "This setup link has expired. Please ask Sciencethoughts for a new one."
            : "This setup link isn't valid. Please ask Sciencethoughts for a new one.");
        }
      })
      .catch(() => { setStatus("invalid"); setMessage("Couldn't check this setup link. Please refresh and try again."); });
  }, []);

  // 2. Load Meta's JS SDK.
  useEffect(() => {
    if (window.FB) { queueMicrotask(() => setSdkReady(true)); return; }
    window.fbAsyncInit = function () {
      window.FB.init({ appId: APP_ID, autoLogAppEvents: true, xfbml: true, version: SDK_VERSION });
      setSdkReady(true);
    };
    if (!document.getElementById("facebook-jssdk")) {
      const s = document.createElement("script");
      s.id = "facebook-jssdk";
      s.src = "https://connect.facebook.net/en_US/sdk.js";
      s.async = true;
      s.defer = true;
      s.crossOrigin = "anonymous";
      document.body.appendChild(s);
    }
  }, []);

  // 3a. Listen for Meta's session info (which WABA / number was connected, or where they stopped).
  useEffect(() => {
    const onMessage = (event) => {
      if (!event.origin.endsWith("facebook.com")) return;
      let data;
      try { data = JSON.parse(event.data); } catch { return; }
      if (data?.type !== "WA_EMBEDDED_SIGNUP") return;
      if (String(data.event || "").startsWith("FINISH")) {
        sessionInfo.current = { ...(data.data || {}), finishType: data.event };
      } else if (data.event === "CANCEL" || data.event === "ERROR") {
        const d = data.data || {};
        if (d.error_message) {
          setStatus("error");
          setMessage(`Meta reported a problem: ${d.error_message}${d.error_code ? ` (code ${d.error_code})` : ""}. Please send this message to Sciencethoughts.`);
        } else if (!finished.current) {
          setStatus("cancelled");
          setMessage(d.current_step ? `Setup was closed at the "${d.current_step}" step.` : "Setup was closed before it finished.");
        }
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // 3b/4. Send the code (+ session info, if it arrives in time) to the server.
  const finish = useCallback(async (code) => {
    finished.current = true;
    setStatus("finishing");
    const start = Date.now();
    while (!sessionInfo.current && Date.now() - start < SESSION_INFO_WAIT_MS) {
      await new Promise((r) => setTimeout(r, 200));
    }
    const info = sessionInfo.current || {};
    try {
      const res = await fetch("/api/whatsapp/embedded-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...link, code,
          waba_id: info.waba_id, phone_number_id: info.phone_number_id, business_id: info.business_id,
          finish_type: info.finishType
        })
      });
      const data = await res.json();
      setResult(data);
      if (res.ok && data.ok) {
        setStatus("done");
      } else {
        setStatus("error");
        setMessage(data.error || "Your number was connected, but part of the setup didn't finish. Sciencethoughts has been notified and will complete it.");
      }
    } catch {
      setStatus("error");
      setMessage("We lost the connection while finishing setup. Please tell Sciencethoughts so we can check it.");
    }
  }, [link]);

  const launch = () => {
    if (!window.FB || !CONFIG_ID) return;
    sessionInfo.current = null;
    finished.current = false;
    setResult(null);
    setMessage("");
    setStatus("connecting");
    // FB.login's callback must be a plain (non-async) function.
    window.FB.login(function (response) {
      const code = response?.authResponse?.code;
      if (code) {
        finish(code);
      } else {
        setStatus((s) => (s === "error" ? s : "cancelled"));
        setMessage((m) => m || "Setup was closed before it finished.");
      }
    }, {
      config_id: CONFIG_ID,
      response_type: "code",
      override_default_response_type: true,
      extras: { setup: {} }
    });
  };

  return (
    <div style={wrap}>
      <div style={card}>
        <h1 style={h1}>Connect your WhatsApp number</h1>
        <p style={p}>
          This connects your property&rsquo;s WhatsApp Business number to the Sciencethoughts AI concierge, so it
          can answer your guests. You&rsquo;ll log in with Facebook and follow Meta&rsquo;s own setup steps; it takes
          about 5&ndash;10 minutes.
        </p>

        {status === "checking" && <p style={p}>Checking your setup link&hellip;</p>}

        {status === "invalid" && <div style={box("var(--accent-yellow)")}>{message}</div>}

        {link && status !== "invalid" && (
          <>
            <p style={{ ...p, color: "var(--text-primary)", fontWeight: 600, marginTop: "20px" }}>Which number will guests message?</p>
            <ul style={{ paddingLeft: "20px", marginBottom: "14px" }}>
              <li style={li}>
                <strong>Your current WhatsApp Business app number (recommended).</strong> You keep using the app as normal; your chats and contacts stay. Our assistant answers guests on the same number, and you see every reply in your app. When you reply to a guest yourself, the assistant stays quiet in that chat for 12 hours.
                <ul style={{ paddingLeft: "18px", marginTop: "6px" }}>
                  <li style={li}>Update the WhatsApp Business app first (version 2.24.17 or newer). The number should have been in use on the app for at least a week.</li>
                  <li style={li}>Keep your phone in hand: you&rsquo;ll confirm the connection inside the app.</li>
                  <li style={li}>WhatsApp Web / Desktop will be logged out once; just link it again afterwards. The WhatsApp app for Windows isn&rsquo;t supported for this.</li>
                  <li style={li}>Open the WhatsApp Business app on your phone at least once every two weeks, or Meta disconnects the assistant.</li>
                </ul>
              </li>
              <li style={li}>
                <strong>Or a new number used only for the assistant</strong>, <strong>not</strong> on the WhatsApp or WhatsApp Business app, with that phone nearby for a verification code by SMS or call.
              </li>
            </ul>
            <p style={{ ...p, color: "var(--text-primary)", fontWeight: 600 }}>Also have ready:</p>
            <ul style={{ paddingLeft: "20px", marginBottom: "14px" }}>
              <li style={li}>Your own established Facebook account (not a brand-new one).</li>
              <li style={li}>Your business name exactly as registered, your website, and your business details.</li>
            </ul>
            <p style={{ ...p, fontSize: "0.92rem", color: "var(--text-muted)" }}>
              After this, Meta also needs to verify your business (registration documents) before guests receive
              replies. We&rsquo;ll guide you through that separately.
            </p>
          </>
        )}

        {link && status !== "invalid" && terms && !terms.accepted && (
          <TermsStep link={link} onAccepted={(t) => setTerms({ accepted: true, ...t })} />
        )}

        {link && terms?.accepted && (
          <div style={box("var(--accent-green)")}>
            Client Service Terms (version {CLIENT_TERMS.version}) accepted
            {terms.legalName ? ` for ${terms.legalName}` : ""}
            {terms.acceptedAt ? ` on ${new Date(terms.acceptedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}` : ""}.
          </div>
        )}

        {link && terms?.accepted && (status === "ready" || status === "cancelled" || status === "connecting") && (
          <>
            <p style={{ ...p, color: "var(--text-primary)", fontWeight: 700, fontSize: "1.1rem", margin: "28px 0 4px" }}>Step 3: Connect your WhatsApp number</p>
            {!CONFIG_ID ? (
              <div style={box("var(--accent-yellow)")}>Setup isn&rsquo;t switched on yet on our side. Please contact Sciencethoughts.</div>
            ) : (
              <button style={{ ...button, opacity: sdkReady && status !== "connecting" ? 1 : 0.6 }}
                disabled={!sdkReady || status === "connecting"} onClick={launch}>
                {status === "connecting" ? "Waiting for Meta…" : status === "cancelled" ? "Try again" : "Connect with Facebook"}
              </button>
            )}
            {status === "cancelled" && message && <div style={box("var(--border-hover)")}>{message}</div>}
          </>
        )}

        {status === "finishing" && <div style={box("var(--accent-teal)")}>Finishing setup, please keep this page open&hellip;</div>}

        {status === "done" && (
          <div style={box("var(--accent-green)")}>
            <strong>You&rsquo;re connected.</strong>
            {result?.displayPhoneNumber ? ` ${result.displayPhoneNumber}` : ""}
            {result?.verifiedName ? ` (${result.verifiedName})` : ""} is now linked to Sciencethoughts.
            We&rsquo;ll confirm once your business verification is approved and your concierge is live.
          </div>
        )}

        {status === "error" && <div style={box("#ff5c5c")}>{message}</div>}
      </div>
    </div>
  );
}
