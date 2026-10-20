"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Front end of WhatsApp Embedded Signup (v4). Flow:
//  1. Check the signed link (tenant/exp/sig) with the server.
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

export default function WhatsAppOnboarding() {
  const [link, setLink] = useState(null);
  const [status, setStatus] = useState("checking"); // checking|invalid|ready|connecting|finishing|done|cancelled|error
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [sdkReady, setSdkReady] = useState(false);
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
          waba_id: info.waba_id, phone_number_id: info.phone_number_id, business_id: info.business_id
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
            <p style={{ ...p, color: "var(--text-primary)", fontWeight: 600, marginTop: "20px" }}>Before you start, have ready:</p>
            <ul style={{ paddingLeft: "20px", marginBottom: "14px" }}>
              <li style={li}>A phone number just for this, <strong>not</strong> currently used on the WhatsApp or WhatsApp Business app (its existing chats would no longer be accessible).</li>
              <li style={li}>That phone nearby, to receive a verification code by SMS or call.</li>
              <li style={li}>Your own established Facebook account (not a brand-new one).</li>
              <li style={li}>Your business name exactly as registered, your website, and your business details.</li>
            </ul>
            <p style={{ ...p, fontSize: "0.92rem", color: "var(--text-muted)" }}>
              After this, Meta also needs to verify your business (registration documents) before guests receive
              replies. We&rsquo;ll guide you through that separately.
            </p>
          </>
        )}

        {link && (status === "ready" || status === "cancelled" || status === "connecting") && (
          <>
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
