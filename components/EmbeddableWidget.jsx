"use client";

// Cross-site embeddable widget. Unlike FloatingWebChat.jsx (the sitewide ScienceThoughts widget
// that lives on sciencethoughts.com itself and must ALWAYS represent ScienceThoughts — see the
// 14 Sep 2026 fix removing its own query-param reading), this component's entire purpose is the
// opposite: it is meant to be loaded, via widget-loader.js, inside an <iframe> embedded on a
// CLIENT'S OWN website (their domain, not ours). So it must always read the tenant from its own
// URL and always represent that one property — there is no "agency" default here, because this
// widget is never shown on a ScienceThoughts-owned page.
//
// It renders full-bleed inside its iframe (no fixed positioning of its own — that's the parent
// page's job, handled by widget-loader.js) and tells its parent frame, via postMessage, how big
// to make the iframe: small (just the round toggle button) when closed, full panel size when
// open. This is the same pattern Intercom/Crisp/Drift use, and it's what lets a chat bubble sit
// on a client's site without needing them to write any CSS or reserve any layout space for it.

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X, Bot, User } from "lucide-react";

const CLOSED_SIZE = { width: 84, height: 84 };
const OPEN_SIZE = { width: 380, height: 620 };

function postSizeToParent(open) {
  if (typeof window === "undefined" || window.parent === window) return;
  const size = open ? OPEN_SIZE : CLOSED_SIZE;
  window.parent.postMessage(
    { source: "sciencethoughts-widget", type: "resize", open, ...size },
    "*" // Deliberately '*': this widget is embedded on client domains we can't know in advance,
        // so there's no single target origin to pin. Only a resize hint (a boolean + two numbers)
        // ever leaves this frame — nothing sensitive — and the loader script only ever reads
        // that shape, so a wrong-origin recipient learning "someone's chat widget resized" is a
        // non-issue. This frame does not add a 'message' listener of its own, so it never acts
        // on anything the parent page might send back — no attack surface introduced by using '*'.
  );
}

export default function EmbeddableWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [tenant, setTenant] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I can help with room availability, rates, or any questions about your stay. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Deliberately no property-name lookup map here (unlike InteractiveWebDemo.js / the old
  // FloatingWebChat.jsx, both of which hardcode a partial id->name dictionary that goes stale
  // every time a new tenant is added). Each client's own embed snippet only ever points at their
  // own tenant id, so a generic greeting avoids that maintenance burden entirely — the AI's
  // actual first reply already introduces itself by the property's real name from its own KB
  // prompt once the guest sends a message.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const urlTenant = params.get("tenant") || params.get("c") || params.get("companyId");
    setTenant(urlTenant || null);
    // Tell the parent our starting (closed) size as soon as we're ready, in case the loader
    // script's own default guess ever drifts from CLOSED_SIZE.
    postSizeToParent(false);
  }, []);

  useEffect(() => {
    postSizeToParent(isOpen);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading || !tenant) return;

    const userMsg = input.trim();
    setInput("");
    const newHistory = [...messages, { role: "user", content: userMsg }];
    setMessages(newHistory);
    setLoading(true);

    try {
      // Same endpoint, same webChatMode payload shape the existing website widgets already use —
      // and since this page is served from sciencethoughts.com (the iframe's own origin), this
      // fetch is same-origin regardless of which client site the iframe is embedded on. No CORS
      // changes needed anywhere in app/api/whatsapp-demo/route.js for this to work.
      const res = await fetch("/api/whatsapp-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          webChatMode: true,
          text: userMsg,
          companyId: tenant,
          history: newHistory.slice(-6),
          full_history: newHistory,
        }),
      });

      const data = await res.json();
      if (data && data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "I'd be happy to help — could you try asking that again?" },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I had trouble connecting. Please try again in a moment." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // No tenant on the URL at all is a setup mistake on the client's side (a snippet pasted
  // without its data-tenant value) — fail visibly but harmlessly rather than silently defaulting
  // to some other property's knowledge base.
  if (tenant === null) {
    return null;
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "flex-end",
        background: "transparent",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #00F2FF 0%, #8A2BE2 100%)",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 25px rgba(0, 242, 255, 0.35), 0 4px 15px rgba(0, 0, 0, 0.3)",
            cursor: "pointer",
          }}
          aria-label="Open chat"
        >
          <MessageSquare size={26} color="#ffffff" />
        </button>
      )}

      {isOpen && (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "rgba(10, 11, 16, 0.97)",
            border: "1px solid rgba(0, 242, 255, 0.15)",
            borderRadius: "20px",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              background: "rgba(255, 255, 255, 0.02)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "#39FF14",
                  boxShadow: "0 0 8px #39FF14",
                }}
              />
              <span style={{ fontSize: "0.9rem", fontWeight: "700", color: "#fff" }}>
                Chat with us
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: "none", border: "none", color: "#a0a0b0", cursor: "pointer", padding: "4px" }}
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>

          <div style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "14px" }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", gap: "10px", flexDirection: msg.role === "user" ? "row-reverse" : "row" }}>
                <div
                  style={{
                    width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: msg.role === "user" ? "rgba(255,255,255,0.05)" : "rgba(0, 242, 255, 0.1)",
                    border: msg.role === "user" ? "none" : "1px solid rgba(0, 242, 255, 0.2)",
                  }}
                >
                  {msg.role === "user" ? <User size={13} color="#a0a0b0" /> : <Bot size={13} color="#00F2FF" />}
                </div>
                <div
                  style={{
                    maxWidth: "78%", padding: "10px 13px", borderRadius: "14px", fontSize: "0.85rem", lineHeight: "1.4",
                    color: "#fff",
                    background: msg.role === "user" ? "rgba(138, 43, 226, 0.2)" : "rgba(255, 255, 255, 0.03)",
                    border: msg.role === "user" ? "1px solid rgba(138, 43, 226, 0.3)" : "1px solid rgba(255, 255, 255, 0.05)",
                    wordBreak: "break-word",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ fontSize: "0.8rem", color: "#707080" }}>Typing…</div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSend} style={{ padding: "14px 16px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: "8px" }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question…"
              style={{
                flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "10px", padding: "8px 12px", color: "#fff", fontSize: "0.85rem", outline: "none",
              }}
              disabled={loading}
            />
            <button
              type="submit"
              style={{
                background: "#00F2FF", border: "none", borderRadius: "10px", width: "36px", height: "36px",
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              }}
              disabled={loading}
              aria-label="Send"
            >
              <Send size={16} color="#0A0B10" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
