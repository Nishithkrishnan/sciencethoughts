"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Brain, Briefcase, Sparkles, RefreshCw, AlertCircle } from "lucide-react";

export default function AgentChat({ agentType }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [liveEnabled, setLiveEnabled] = useState(false);
  const messagesEndRef = useRef(null);

  // Define agent specifics
  const agentConfig = {
    researcher: {
      name: "The Neuro-Researcher",
      subtitle: "First-Principles Science Analyzer",
      icon: <Brain size={18} />,
      color: "var(--accent-teal)",
      glow: "var(--glow-teal)",
      starterPrompts: [
        "Explain Quantum Computing from first principles.",
        "Break down how neural networks learn like human brains.",
        "Why do complex systems tend toward chaos?",
      ]
    },
    strategist: {
      name: "AI Business Architect",
      subtitle: "Autonomous Workflow Designer",
      icon: <Briefcase size={18} />,
      color: "var(--accent-violet)",
      glow: "var(--glow-violet)",
      starterPrompts: [
        "Design a multi-agent system for a customer support workflow.",
        "How can an AI agent automate inventory procurement?",
        "Create a workflow for automated market research.",
      ]
    },
    simplifier: {
      name: "The Concept Simplifier",
      subtitle: "Scientific Analogy Engine",
      icon: <Sparkles size={18} />,
      color: "var(--accent-yellow)",
      glow: "0 0 20px rgba(255, 183, 0, 0.25)",
      starterPrompts: [
        "Explain Einstein's theory of relativity like I am 5.",
        "What is the blockchain? Use a kitchen analogy.",
        "How does gene editing (CRISPR) work in simple terms?",
      ]
    }
  };

  const currentAgent = agentConfig[agentType] || agentConfig.researcher;

  // Set default initial greeting
  useEffect(() => {
    setMessages([
      {
        id: "greet",
        role: "assistant",
        content: `Greetings! I am **${currentAgent.name}**, configured as your ${currentAgent.subtitle}.\n\nHow can I assist you with your queries today? Choose a preset prompt below or type your own.`,
      }
    ]);
    
    // Check if live API is enabled server-side (mocked/configured check or env check)
    // We will set liveEnabled based on custom setting. Since we cannot check process.env in client directly for server variables, we can fetch a config or default to false.
    // For demo purposes, we will default it to show a state.
  }, [agentType]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { id: Date.now().toString(), role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const assistantMessageId = (Date.now() + 1).toString();
    // Add placeholder assistant message
    setMessages((prev) => [...prev, { id: assistantMessageId, role: "assistant", content: "" }]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages.filter(m => m.id !== "greet"), userMessage],
          type: agentType
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate response");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let accumulatedText = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunk = decoder.decode(value, { stream: !done });
        accumulatedText += chunk;
        
        // Update assistant message with streaming text
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId ? { ...msg, content: accumulatedText } : msg
          )
        );
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, content: "⚠️ **Error**: Failed to communicate with the agent API. Please check your network connection or API config." }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    setMessages([
      {
        id: "greet",
        role: "assistant",
        content: `Greetings! I am **${currentAgent.name}**, configured as your ${currentAgent.subtitle}.\n\nHow can I assist you with your queries today? Choose a preset prompt below or type your own.`,
      }
    ]);
  };

  return (
    <div className="glass-panel" style={{ display: "flex", flexDirection: "column", height: "650px", overflow: "hidden", border: "1px solid var(--border-color)", background: "rgba(10, 10, 14, 0.8)" }}>
      
      {/* Terminal Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid var(--border-color)", background: "rgba(0,0,0,0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", borderRadius: "50%", background: `${currentAgent.color}15`, border: `1px solid ${currentAgent.color}35`, color: currentAgent.color, boxShadow: currentAgent.glow }}>
            {currentAgent.icon}
          </div>
          <div>
            <h3 style={{ fontSize: "1.05rem", fontFamily: "var(--font-display)", fontWeight: "700" }}>{currentAgent.name}</h3>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>SYS_STATUS: ONLINE</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <button onClick={clearHistory} title="Clear terminal" style={{ color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", fontSize: "0.8rem", padding: "6px 12px", borderRadius: "20px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-color)", transition: "var(--transition-fast)" }} onMouseOver={(e) => e.target.style.color = "var(--text-primary)"} onMouseOut={(e) => e.target.style.color = "var(--text-muted)"}>
            <RefreshCw size={12} /> Clear
          </button>
        </div>
      </div>

      {/* Info notification */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(255, 183, 0, 0.04)", borderBottom: "1px solid rgba(255, 183, 0, 0.1)", padding: "10px 24px", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
        <AlertCircle size={14} style={{ color: "var(--accent-yellow)", flexShrink: 0 }} />
        <span>To toggle live AI answers, set <strong>LIVE_AGENTS_ENABLED=true</strong> and supply API keys in your environment.</span>
      </div>

      {/* Chat Messages Panel */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", width: "100%", animation: "fadeIn 0.3s ease-out" }}>
            <div style={{ display: "flex", gap: "12px", maxWidth: "80%", flexDirection: msg.role === "user" ? "row-reverse" : "row" }}>
              
              {/* Avatar icon */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", borderRadius: "50%", background: msg.role === "user" ? "rgba(255,255,255,0.05)" : `${currentAgent.color}10`, border: `1px solid ${msg.role === "user" ? "rgba(255,255,255,0.1)" : `${currentAgent.color}25`}`, color: msg.role === "user" ? "var(--text-primary)" : currentAgent.color, flexShrink: 0 }}>
                {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
              </div>

              {/* Message content */}
              <div className="glass" style={{ padding: "14px 18px", borderRadius: "18px", background: msg.role === "user" ? "rgba(255, 255, 255, 0.04)" : "rgba(255, 255, 255, 0.01)", border: `1px solid ${msg.role === "user" ? "rgba(255, 255, 255, 0.07)" : "var(--border-color)"}` }}>
                <div style={{ fontSize: "0.95rem", lineHeight: "1.6", color: msg.role === "user" ? "#fff" : "var(--text-secondary)", whiteSpace: "pre-wrap" }}>
                  {msg.content === "" ? (
                    <span style={{ display: "inline-flex", gap: "4px", alignItems: "center" }}>
                      <span style={{ width: "6px", height: "6px", background: currentAgent.color, borderRadius: "50%", animation: "pulseGlow 1.2s infinite ease-in-out" }}></span>
                      <span style={{ width: "6px", height: "6px", background: currentAgent.color, borderRadius: "50%", animation: "pulseGlow 1.2s infinite ease-in-out", animationDelay: "0.2s" }}></span>
                      <span style={{ width: "6px", height: "6px", background: currentAgent.color, borderRadius: "50%", animation: "pulseGlow 1.2s infinite ease-in-out", animationDelay: "0.4s" }}></span>
                    </span>
                  ) : (
                    // Simple parse for inline bold and list highlights (for styling mock/live text quickly without markdown parser complexity)
                    // Note: If you want full markdown, markdown package is nice, but simple tag formatting satisfies portfolio needs
                    msg.content.split("\n").map((line, i) => {
                      let processed = line;
                      // Replace bold markdown
                      const boldRegex = /\*\*(.*?)\*\*/g;
                      let hasBold = false;
                      const parts = [];
                      let lastIndex = 0;
                      let match;
                      while ((match = boldRegex.exec(processed)) !== null) {
                        hasBold = true;
                        parts.push(processed.substring(lastIndex, match.index));
                        parts.push(<strong key={match.index} style={{ color: "#fff" }}>{match[1]}</strong>);
                        lastIndex = boldRegex.lastIndex;
                      }
                      if (hasBold) {
                        parts.push(processed.substring(lastIndex));
                        return <p key={i} style={{ marginBottom: line ? "10px" : "15px" }}>{parts}</p>;
                      }
                      
                      // Bullet points
                      if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
                        return <li key={i} style={{ marginLeft: "15px", marginBottom: "8px" }}>{line.trim().substring(2)}</li>;
                      }
                      
                      // Numbered list
                      if (/^\d+\.\s/.test(line.trim())) {
                        return <li key={i} style={{ marginLeft: "15px", marginBottom: "8px", listStyleType: "decimal" }}>{line.trim().replace(/^\d+\.\s/, "")}</li>;
                      }
                      
                      return <p key={i} style={{ marginBottom: line ? "10px" : "15px" }}>{line}</p>;
                    })
                  )}
                </div>
              </div>

            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Preset starter questions */}
      <div style={{ padding: "12px 24px 0", display: "flex", gap: "10px", overflowX: "auto", whiteSpace: "nowrap", scrollbarWidth: "none" }}>
        {currentAgent.starterPrompts.map((prompt, index) => (
          <button key={index} onClick={() => setInput(prompt)} style={{ flexShrink: 0, padding: "8px 14px", borderRadius: "20px", border: "1px solid var(--border-color)", background: "rgba(255, 255, 255, 0.02)", fontSize: "0.8rem", color: "var(--text-secondary)", cursor: "pointer", transition: "var(--transition-fast)" }} onMouseOver={(e) => { e.target.style.borderColor = currentAgent.color; e.target.style.color = "#fff"; }} onMouseOut={(e) => { e.target.style.borderColor = "var(--border-color)"; e.target.style.color = "var(--text-secondary)"; }}>
            {prompt}
          </button>
        ))}
      </div>

      {/* Form Input Panel */}
      <form onSubmit={handleSubmit} style={{ padding: "16px 24px 24px", display: "flex", gap: "12px", background: "rgba(0,0,0,0.1)" }}>
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder={`Query ${currentAgent.name}...`} disabled={isLoading} style={{ flex: 1, padding: "14px 20px", borderRadius: "30px", border: "1px solid var(--border-color)", background: "rgba(255, 255, 255, 0.03)", fontSize: "0.95rem", transition: "var(--transition-smooth)" }} onFocus={(e) => e.target.style.borderColor = currentAgent.color} onBlur={(e) => e.target.style.borderColor = "var(--border-color)"} />
        <button type="submit" disabled={isLoading || !input.trim()} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "48px", height: "48px", borderRadius: "50%", background: input.trim() ? "var(--gradient-primary)" : "rgba(255,255,255,0.03)", border: "none", color: input.trim() ? "#000" : "var(--text-muted)", cursor: input.trim() ? "pointer" : "default", transition: "var(--transition-smooth)", boxShadow: input.trim() ? currentAgent.glow : "none" }}>
          <Send size={18} />
        </button>
      </form>

    </div>
  );
}
