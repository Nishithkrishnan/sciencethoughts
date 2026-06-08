"use client";

import React, { useState } from "react";
import AgentChat from "../../components/AgentChat";
import EmailFilterDemo from "../../components/EmailFilterDemo";
import { Brain, Briefcase, Sparkles, Activity, Cpu, Mail } from "lucide-react";

export default function LabPage() {
  const [activeTab, setActiveTab] = useState("researcher");

  const agents = [
    {
      id: "researcher",
      name: "The Neuro-Researcher",
      desc: "Scientific paper analysis & first-principles logic.",
      icon: <Brain size={20} />,
      color: "var(--accent-teal)",
      badge: "Vercel AI SDK",
    },
    {
      id: "strategist",
      name: "AI Business Architect",
      desc: "Automated business workflow & MAS designs.",
      icon: <Briefcase size={20} />,
      color: "var(--accent-violet)",
      badge: "Vercel AI SDK",
    },
    {
      id: "simplifier",
      name: "The Concept Simplifier",
      desc: "Simplifies complex quantum/physics/AI concepts.",
      icon: <Sparkles size={20} />,
      color: "var(--accent-yellow)",
      badge: "Vercel AI SDK",
    },
    {
      id: "email-agent",
      name: "Email Filtering Agent",
      desc: "Automated categorization, sentiment, & Sheets sync.",
      icon: <Mail size={20} />,
      color: "var(--accent-green)",
      badge: "Make.com + AI",
    }
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-dark)", color: "#fff", paddingTop: "50px", paddingBottom: "100px" }}>
      <div className="container">
        
        {/* Lab Header */}
        <div style={{ textAlign: "center", marginBottom: "50px", animation: "slideUp 0.8s ease-out" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: "rgba(0, 242, 255, 0.05)", border: "1px solid rgba(0, 242, 255, 0.15)", padding: "6px 16px", borderRadius: "30px", marginBottom: "15px" }}>
            <Activity size={14} className="animate-pulse-glow" style={{ color: "var(--accent-teal)" }} />
            <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--accent-teal)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Cognitive Sandbox v1.5</span>
          </div>
          <h1 style={{ fontSize: "3rem", fontWeight: "900", fontFamily: "var(--font-display)", marginBottom: "15px" }}>
            The Experimental <span className="gradient-text">Lab</span>
          </h1>
          <p style={{ maxWidth: "600px", margin: "0 auto", color: "var(--text-secondary)" }}>
            Interact with autonomous cognitive agents designed for specific problem-solving domains.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div style={{ display: "grid", gridTemplateColumns: activeTab === "email-agent" ? "1fr" : "1fr 2.5fr", gap: "30px", transition: "var(--transition-smooth)" }}>
          
          {/* Left Panel: Agent Select & Status */}
          <div style={{ display: "flex", flexDirection: activeTab === "email-agent" ? "row" : "column", gap: "25px", flexWrap: "wrap" }}>
            
            {/* System Status Panel (Smaller/inline when showcasing full-width pipeline) */}
            <div className="glass-panel" style={{ padding: "20px 24px", background: "rgba(22, 22, 28, 0.4)", border: "1px solid var(--border-color)", flex: activeTab === "email-agent" ? "1 1 300px" : "initial" }}>
              <h3 style={{ fontSize: "1rem", fontFamily: "var(--font-display)", fontWeight: "700", marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px" }}>
                <Cpu size={16} style={{ color: "var(--accent-teal)" }} /> System Status
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.85rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Agent Runtime:</span>
                  <span style={{ color: "var(--accent-green)", fontWeight: "600" }}>v16.5 (Active)</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Active Agent:</span>
                  <span style={{ color: "var(--accent-teal)", fontWeight: "600" }}>
                    {agents.find(a => a.id === activeTab)?.name}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Make.com Scenario:</span>
                  <span style={{ color: "var(--accent-yellow)" }}>9353591</span>
                </div>
              </div>
            </div>

            {/* Select Agents Cards */}
            <div style={{ display: "flex", flexDirection: activeTab === "email-agent" ? "row" : "column", gap: "15px", flex: activeTab === "email-agent" ? "2 1 600px" : "initial" }}>
              {agents.map((agent) => {
                const isActive = activeTab === agent.id;
                return (
                  <div key={agent.id} onClick={() => setActiveTab(agent.id)} className="glass" style={{ padding: "16px 20px", cursor: "pointer", border: isActive ? `1px solid ${agent.color}` : "1px solid var(--border-color)", background: isActive ? `${agent.color}05` : "rgba(13, 13, 16, 0.3)", boxShadow: isActive ? `0 0 15px ${agent.color}15` : "none", flex: activeTab === "email-agent" ? "1 1 200px" : "initial" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", color: isActive ? agent.color : "var(--text-secondary)" }}>
                        {agent.icon}
                        <h4 style={{ fontSize: "1rem", fontFamily: "var(--font-display)", fontWeight: "700" }}>{agent.name}</h4>
                      </div>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", border: "1px solid rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: "10px", background: "rgba(0,0,0,0.2)" }}>{agent.badge}</span>
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{agent.desc}</p>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Right Panel: Active Playground */}
          <div style={{ marginTop: activeTab === "email-agent" ? "20px" : "0" }}>
            {activeTab === "email-agent" ? (
              <EmailFilterDemo />
            ) : (
              <AgentChat agentType={activeTab} />
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
