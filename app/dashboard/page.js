"use client";

import { useState, useEffect, useCallback } from "react";

// Internal, single-user dashboard: "what did the bot defer on across all tenants, that a human
// needs to answer." Access is gated by a ?key= query param matching DASHBOARD_SECRET in Vercel —
// bookmark the URL with the key included. No login flow since this is a shared view for one
// person (Nishith) across all demo tenants; see app/api/escalations/route.js for notes on what
// changes once a real client needs to log in and see only their own property's questions.
export default function DashboardPage() {
  const [dashboardKey, setDashboardKey] = useState("");
  const [keyInput, setKeyInput] = useState("");
  const [escalations, setEscalations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [days, setDays] = useState(3);
  const [drafts, setDrafts] = useState({}); // id -> { answer, teachKb }
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const k = params.get("key");
      if (k) {
        setDashboardKey(k);
        setKeyInput(k);
      }
    }
  }, []);

  const load = useCallback(async (key, dayRange) => {
    if (!key) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/escalations?key=${encodeURIComponent(key)}&days=${dayRange}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load");
        setEscalations(null);
      } else {
        setEscalations(data.escalations);
      }
    } catch (e) {
      setError("Network error loading escalations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (dashboardKey) load(dashboardKey, days);
  }, [dashboardKey, days, load]);

  const handleUnlock = (e) => {
    e.preventDefault();
    setDashboardKey(keyInput.trim());
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("key", keyInput.trim());
      window.history.replaceState({}, "", url.toString());
    }
  };

  const updateDraft = (id, field, value) => {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const resolve = async (id) => {
    const draft = drafts[id] || {};
    setSavingId(id);
    try {
      const res = await fetch("/api/escalations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: dashboardKey,
          id,
          answer: draft.answer || "",
          teachKb: Boolean(draft.teachKb && draft.answer)
        })
      });
      if (res.ok) {
        await load(dashboardKey, days);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to resolve");
      }
    } catch (e) {
      setError("Network error resolving escalation");
    } finally {
      setSavingId(null);
    }
  };

  if (!dashboardKey) {
    return (
      <div style={pageWrap}>
        <div style={{ ...panel, maxWidth: "420px", margin: "80px auto" }}>
          <h2 style={{ color: "#fff", marginBottom: "8px" }}>Escalations Dashboard</h2>
          <p style={{ color: "var(--text-secondary, #9aa)", fontSize: "0.9rem", marginBottom: "16px" }}>
            Enter the dashboard key to view deferred questions across all tenants.
          </p>
          <form onSubmit={handleUnlock} style={{ display: "flex", gap: "10px" }}>
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="Dashboard key"
              style={inputStyle}
            />
            <button type="submit" style={buttonStyle}>Unlock</button>
          </form>
        </div>
      </div>
    );
  }

  const pending = (escalations || []).filter((e) => !e.resolved);
  const resolved = (escalations || []).filter((e) => e.resolved);

  return (
    <div style={pageWrap}>
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "24px" }}>
          <div>
            <h1 style={{ color: "#fff", fontSize: "1.6rem", marginBottom: "4px" }}>Escalations Dashboard</h1>
            <p style={{ color: "var(--text-secondary, #9aa)", fontSize: "0.85rem" }}>
              Questions the AI deferred on across every tenant — answer here to also teach the bot for next time.
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <label style={{ color: "#9aa", fontSize: "0.85rem" }}>Last</label>
            <select value={days} onChange={(e) => setDays(Number(e.target.value))} style={selectStyle}>
              <option value={1}>1 day</option>
              <option value={3}>3 days</option>
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
            </select>
            <button onClick={() => load(dashboardKey, days)} style={buttonStyle}>Refresh</button>
          </div>
        </div>

        {error && (
          <div style={{ background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.3)", color: "#ff8080", padding: "10px 14px", borderRadius: "10px", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        {loading && <p style={{ color: "#9aa" }}>Loading...</p>}

        {!loading && escalations && pending.length === 0 && resolved.length === 0 && (
          <div style={{ ...panel, textAlign: "center", color: "#9aa" }}>
            Nothing deferred in this window — every question got a real answer.
          </div>
        )}

        {pending.length > 0 && (
          <>
            <h3 style={{ color: "#fff", fontSize: "1rem", margin: "20px 0 10px" }}>
              Needs an answer ({pending.length})
            </h3>
            {pending.map((esc) => (
              <div key={esc.id} style={{ ...panel, marginBottom: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", marginBottom: "8px" }}>
                  <span style={{ color: "var(--accent-teal, #00f2ff)", fontWeight: 600, fontSize: "0.9rem" }}>{esc.companyName}</span>
                  <span style={{ color: "#778", fontSize: "0.78rem" }}>{new Date(esc.createdAt).toLocaleString()}</span>
                </div>
                <p style={{ color: "#fff", fontSize: "0.95rem", marginBottom: "6px" }}>"{esc.question}"</p>
                <p style={{ color: "#8a8", fontSize: "0.8rem", marginBottom: "10px" }}>Guest contact: {esc.contact || "unknown"}</p>
                <textarea
                  placeholder="Type the real answer here..."
                  value={drafts[esc.id]?.answer || ""}
                  onChange={(e) => updateDraft(esc.id, "answer", e.target.value)}
                  style={textareaStyle}
                />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px", flexWrap: "wrap", gap: "10px" }}>
                  <label style={{ color: "#9aa", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "6px" }}>
                    <input
                      type="checkbox"
                      checked={Boolean(drafts[esc.id]?.teachKb)}
                      onChange={(e) => updateDraft(esc.id, "teachKb", e.target.checked)}
                    />
                    Add this answer to {esc.companyName}'s knowledge base (stops future deferrals on this question)
                  </label>
                  <button
                    onClick={() => resolve(esc.id)}
                    disabled={savingId === esc.id}
                    style={{ ...buttonStyle, opacity: savingId === esc.id ? 0.6 : 1 }}
                  >
                    {savingId === esc.id ? "Saving..." : "Save & Resolve"}
                  </button>
                </div>
              </div>
            ))}
          </>
        )}

        {resolved.length > 0 && (
          <>
            <h3 style={{ color: "#9aa", fontSize: "0.95rem", margin: "24px 0 10px" }}>
              Already answered ({resolved.length})
            </h3>
            {resolved.map((esc) => (
              <div key={esc.id} style={{ ...panel, marginBottom: "10px", opacity: 0.75 }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", marginBottom: "6px" }}>
                  <span style={{ color: "#8cf", fontSize: "0.85rem" }}>{esc.companyName}</span>
                  <span style={{ color: "#667", fontSize: "0.75rem" }}>{new Date(esc.createdAt).toLocaleString()}</span>
                </div>
                <p style={{ color: "#ccc", fontSize: "0.88rem" }}>"{esc.question}"</p>
                <p style={{ color: "#7c7", fontSize: "0.85rem", marginTop: "4px" }}>→ {esc.answer}</p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

const pageWrap = {
  minHeight: "100vh",
  background: "#05070c",
  fontFamily: "system-ui, -apple-system, sans-serif"
};

const panel = {
  background: "rgba(15, 20, 30, 0.8)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "16px",
  padding: "20px"
};

const inputStyle = {
  flexGrow: 1,
  background: "#0a0c14",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.15)",
  padding: "10px 14px",
  borderRadius: "10px",
  fontSize: "0.9rem",
  outline: "none"
};

const selectStyle = {
  background: "#0a0c14",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.15)",
  padding: "8px 10px",
  borderRadius: "8px",
  fontSize: "0.85rem"
};

const buttonStyle = {
  background: "linear-gradient(135deg, #00f2ff, #bc13fe)",
  border: "none",
  color: "#000",
  fontWeight: 700,
  padding: "10px 18px",
  borderRadius: "10px",
  cursor: "pointer",
  fontSize: "0.85rem"
};

const textareaStyle = {
  width: "100%",
  minHeight: "70px",
  background: "#0a0c14",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: "10px",
  padding: "10px 12px",
  fontSize: "0.88rem",
  outline: "none",
  resize: "vertical",
  fontFamily: "inherit"
};
