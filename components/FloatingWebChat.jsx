"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X, Bot, User } from "lucide-react";

export default function FloatingWebChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I am the ScienceThoughts AI Business Assistant. How can I help you automate your client onboarding, lead generation, or CRM sync today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    const newHistory = [...messages, { role: "user", content: userMsg }];
    setMessages(newHistory);
    setLoading(true);

    try {
      const res = await fetch("/api/whatsapp-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          webChatMode: true,
          text: userMsg,
          companyId: "agency", // Locked to ScienceThoughts AI Agency
          history: newHistory.slice(-6) // Capped at last 3 turns
        })
      });

      const data = await res.json();
      if (data && data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: "I would be happy to discuss how we can help. Feel free to book a 30-minute call with our team here: https://calendly.com/nishithmanu/30min" }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Oops! I encountered a connection issue. Please check your internet and try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", bottom: "30px", right: "30px", zIndex: 99999 }}>
      {/* 1. Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #00F2FF 0%, #8A2BE2 100%)",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 25px rgba(0, 242, 255, 0.4), 0 4px 15px rgba(0, 0, 0, 0.4)",
            cursor: "pointer",
            transition: "transform 0.25s ease",
          }}
          aria-label="Open AI Assistant"
        >
          <MessageSquare size={26} color="#ffffff" />
        </button>
      )}

      {/* 2. Chat Window Box */}
      {isOpen && (
        <div
          style={{
            width: "360px",
            height: "500px",
            background: "rgba(10, 11, 16, 0.95)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(0, 242, 255, 0.15)",
            borderRadius: "20px",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.6)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header */}
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
              <div>
                <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "700", color: "#ffffff", letterSpacing: "0.02em" }}>
                  ScienceThoughts AI
                </h4>
                <span style={{ fontSize: "0.75rem", color: "#707080" }}>
                  Online Concierge
                </span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <a
                href="https://wa.me/918015424935?text=Hi_ScienceThoughts"
                target="_blank"
                rel="noopener noreferrer"
                title="Continue on WhatsApp"
                style={{
                  color: "#25D366",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "opacity 0.2s",
                }}
                onMouseOver={(e) => e.currentTarget.style.opacity = "0.8"}
                onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.76.459 3.473 1.332 4.988L2 22l5.137-1.347c1.47.8 3.11 1.222 4.782 1.225h.003c5.505 0 9.987-4.482 9.987-9.99A9.923 9.923 0 0012.012 2zm-.006 18.286c-1.493 0-2.955-.401-4.227-1.16l-.303-.18-3.14.823.837-3.06-.197-.313a8.243 8.243 0 01-1.264-4.397c0-4.557 3.71-8.267 8.267-8.267 2.207 0 4.283.86 5.845 2.423a8.212 8.212 0 012.417 5.852c-.004 4.56-3.714 8.28-8.268 8.28zm4.54-6.192c-.248-.124-1.472-.727-1.7-.81-.228-.083-.393-.124-.559.124-.165.248-.642.81-.787.977-.145.165-.29.186-.538.062a6.857 6.857 0 01-2.004-1.235c-.78-.696-1.307-1.556-1.46-1.817-.153-.26-.016-.402.108-.525.112-.11.248-.29.372-.435.124-.145.165-.248.248-.414.083-.166.042-.31-.02-.435-.063-.124-.56-1.347-.767-1.848-.202-.484-.405-.418-.559-.426-.145-.008-.31-.008-.476-.008-.166 0-.435.062-.662.31-.228.249-.87.85-8.7 2.075 0 1.222.89 2.406 1.014 2.572.124.166 1.752 2.677 4.246 3.753.593.256 1.056.41 1.417.525.595.19 1.137.163 1.565.1.477-.072 1.472-.601 1.679-1.182.207-.58.207-1.077.145-1.181-.062-.104-.228-.166-.476-.29z"/>
                </svg>
              </a>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#a0a0b0",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div
            style={{
              flex: 1,
              padding: "20px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  gap: "10px",
                  flexDirection: msg.role === "user" ? "row-reverse" : "row",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: msg.role === "user" ? "rgba(255,255,255,0.05)" : "rgba(0, 242, 255, 0.1)",
                    border: msg.role === "user" ? "none" : "1px solid rgba(0, 242, 255, 0.2)",
                  }}
                >
                  {msg.role === "user" ? (
                    <User size={14} color="#a0a0b0" />
                  ) : (
                    <Bot size={14} color="#00F2FF" />
                  )}
                </div>
                <div
                  style={{
                    maxWidth: "75%",
                    padding: "10px 14px",
                    borderRadius: "14px",
                    fontSize: "0.85rem",
                    lineHeight: "1.4",
                    color: "#ffffff",
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
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(0, 242, 255, 0.1)",
                    border: "1px solid rgba(0, 242, 255, 0.2)",
                  }}
                >
                  <Bot size={14} color="#00F2FF" />
                </div>
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "14px",
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                    display: "flex",
                    gap: "4px",
                    alignItems: "center",
                    height: "32px",
                  }}
                >
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00F2FF", display: "inline-block" }}></span>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00F2FF", display: "inline-block" }}></span>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00F2FF", display: "inline-block" }}></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Form */}
          <form
            onSubmit={handleSend}
            style={{
              padding: "16px 20px",
              background: "rgba(0,0,0,0.2)",
              borderTop: "1px solid rgba(255, 255, 255, 0.05)",
              display: "flex",
              gap: "10px",
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about our AI services..."
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "10px",
                padding: "8px 14px",
                color: "#ffffff",
                fontSize: "0.85rem",
                outline: "none",
              }}
              disabled={loading}
            />
            <button
              type="submit"
              style={{
                background: "#00F2FF",
                border: "none",
                borderRadius: "10px",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 0 10px rgba(0, 242, 255, 0.2)",
              }}
              disabled={loading}
            >
              <Send size={16} color="#0A0B10" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
