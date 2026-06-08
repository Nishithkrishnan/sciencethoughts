"use client";

import React, { useState } from "react";
import { Mail, CheckCircle, Database, ShieldCheck, Play, ArrowRight, Loader2, Sparkles, Send } from "lucide-react";

export default function EmailFilterDemo() {
  const [emailText, setEmailText] = useState(
    `Subject: Urgent: Dashboard system error on production database\n\nHi team,\nWe are seeing a repeating error code 503 on our user statistics dashboard when loading client information. Customers in region EU-West cannot load their profiles. Please look into this ASAP as it is impacting operations.\n\nThanks,\nSarah Jenkins\nOps Lead`
  );
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showFlowAnimation, setShowFlowAnimation] = useState(false);
  const [sheetRows, setSheetRows] = useState([
    { date: "08 Jun 21:10", sender: "alex@venture.com", cat: "Inquiry", sent: "Positive", priority: "Medium" },
    { date: "08 Jun 21:35", sender: "promo@newsletter.io", cat: "Marketing", sent: "Neutral", priority: "Low" },
  ]);

  const presetEmails = [
    {
      label: "🚨 Urgent Issue",
      text: `Subject: Urgent: Dashboard system error on production database\n\nHi team,\nWe are seeing a repeating error code 503 on our user statistics dashboard when loading client information. Customers in region EU-West cannot load their profiles. Please look into this ASAP as it is impacting operations.\n\nThanks,\nSarah Jenkins\nOps Lead`
    },
    {
      label: "📈 Marketing Pitch",
      text: `Subject: Elevate your analytics with 40% discount on Enterprise Tier\n\nHey Nishith,\nHope you are doing well! I saw science-thoughts and loved your AI sandbox. I wanted to see if you'd be interested in testing out our new vector scaling DB. We are offering a 40% launch discount this week. Let me know if you want a demo code.\n\nBest,\nMarcus from ScaleDB`
    },
    {
      label: "💼 Client Inquiry",
      text: `Subject: Request for consultation on AI agents for banking ops\n\nDear Nishith,\nI read your roadmap regarding AI transformation in UK Banking operations. We are a boutique consulting firm looking to automate our workflow sheets using Make.com and OpenAI. Could we schedule a 15-minute intro call to discuss collaboration?\n\nSincerely,\nDavid Vance\nManaging Partner`
    }
  ];

  const handleAnalyze = async () => {
    setLoading(true);
    setResult(null);
    setShowFlowAnimation(true);

    try {
      // Simulate network wait & Make.com flow steps
      await new Promise(resolve => setTimeout(resolve, 1500));

      const response = await fetch("/api/email-filter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailText }),
      });

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const data = await response.json();
      setResult(data);

      // Add to simulated google sheets log
      const dateStr = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
      const senderMatch = emailText.match(/(?:From|Thanks|Sincerely),\s*([A-Za-z\s]+)/);
      const sender = senderMatch ? `${senderMatch[1].trim().toLowerCase().replace(/\s+/g, "")}@domain.com` : "user@incoming.com";
      
      setSheetRows(prev => [
        {
          date: `08 Jun ${dateStr}`,
          sender: sender,
          cat: data.category,
          sent: data.sentiment,
          priority: data.priority
        },
        ...prev
      ]);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
      
      {/* Overview Block */}
      <div className="glass-panel" style={{ padding: "24px", background: "rgba(22, 22, 28, 0.3)", border: "1px solid var(--border-color)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px" }}>
          <span style={{ fontSize: "0.75rem", background: "rgba(0, 242, 255, 0.08)", border: "1px solid rgba(0, 242, 255, 0.2)", color: "var(--accent-teal)", padding: "4px 12px", borderRadius: "20px", fontWeight: "600", textTransform: "uppercase" }}>Workflow Architecture</span>
          <span style={{ fontSize: "0.75rem", background: "rgba(188, 19, 254, 0.08)", border: "1px solid rgba(188, 19, 254, 0.2)", color: "var(--accent-violet)", padding: "4px 12px", borderRadius: "20px", fontWeight: "600" }}>Make.com Scenario</span>
        </div>
        <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
          This agent showcases an production-grade automation workflow built in <strong>Make.com</strong>. It intercepts incoming Gmail messages, executes zero-shot classification via LLMs, logs structured parameters into Google Sheets, and updates Gmail statuses in one unified loop.
        </p>

        {/* Modular Workflow Visualizer */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginTop: "20px", background: "rgba(0,0,0,0.2)", padding: "16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.02)" }}>
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", width: "38px", height: "38px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
              <Mail size={16} />
            </div>
            <span style={{ fontSize: "0.75rem", fontWeight: "600" }}>1. Watch Gmail</span>
            <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>Trigger Module</span>
          </div>
          
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
            <div style={{ background: "rgba(0, 242, 255, 0.05)", border: "1px solid rgba(0, 242, 255, 0.2)", width: "38px", height: "38px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-teal)", boxShadow: showFlowAnimation && loading ? "var(--glow-teal)" : "none", transition: "all 0.3s" }}>
              <Sparkles size={16} />
            </div>
            <span style={{ fontSize: "0.75rem", fontWeight: "600" }}>2. AI Analysis</span>
            <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>Zero-Shot Agent</span>
          </div>

          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
            <div style={{ background: "rgba(57, 255, 20, 0.05)", border: "1px solid rgba(57, 255, 20, 0.2)", width: "38px", height: "38px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-green)", boxShadow: showFlowAnimation && !loading && result ? "var(--glow-green)" : "none", transition: "all 0.3s" }}>
              <Database size={16} />
            </div>
            <span style={{ fontSize: "0.75rem", fontWeight: "600" }}>3. Log Sheets</span>
            <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>Data Storage</span>
          </div>

          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
            <div style={{ background: "rgba(188, 19, 254, 0.05)", border: "1px solid rgba(188, 19, 254, 0.2)", width: "38px", height: "38px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-violet)" }}>
              <CheckCircle size={16} />
            </div>
            <span style={{ fontSize: "0.75rem", fontWeight: "600" }}>4. Tag Gmail</span>
            <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>Gmail Labels</span>
          </div>
        </div>
      </div>

      {/* Simulator Playground Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "25px" }}>
        
        {/* Left Interactive Input Panel */}
        <div className="glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "15px", background: "rgba(10, 10, 14, 0.7)" }}>
          <h3 style={{ fontSize: "1.1rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Mail size={16} style={{ color: "var(--accent-teal)" }} /> Incoming Email Payload
          </h3>
          
          {/* Preset Buttons */}
          <div style={{ display: "flex", gap: "8px", overflowX: "auto" }}>
            {presetEmails.map((item, idx) => (
              <button key={idx} onClick={() => { setEmailText(item.text); setResult(null); }} style={{ fontSize: "0.75rem", padding: "6px 12px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-color)", borderRadius: "20px", cursor: "pointer", transition: "var(--transition-fast)" }} onMouseOver={(e) => e.target.style.borderColor = "var(--accent-teal)"} onMouseOut={(e) => e.target.style.borderColor = "var(--border-color)"}>
                {item.label}
              </button>
            ))}
          </div>

          {/* Textarea */}
          <textarea value={emailText} onChange={(e) => setEmailText(e.target.value)} style={{ width: "100%", height: "200px", padding: "14px", borderRadius: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-color)", color: "#fff", fontFamily: "var(--font-sans)", fontSize: "0.9rem", lineHeight: "1.5", resize: "none" }} />
          
          <button onClick={handleAnalyze} disabled={loading || !emailText.trim()} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", padding: "12px", background: "var(--gradient-primary)", color: "#000", fontWeight: "700", borderRadius: "30px", cursor: "pointer", boxShadow: "var(--glow-teal)", transition: "var(--transition-smooth)" }}>
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Processing Make Flow...
              </>
            ) : (
              <>
                <Play size={16} /> Run Pipeline Simulation
              </>
            )}
          </button>
        </div>

        {/* Right Output Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Step 2/4 Log Outcome */}
          <div className="glass-panel" style={{ padding: "20px", background: "rgba(10, 10, 14, 0.7)", minHeight: "220px", display: "flex", flexDirection: "column" }}>
            <h3 style={{ fontSize: "1.1rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px", display: "flex", alignItems: "center", gap: "8px", marginBottom: "15px" }}>
              <Sparkles size={16} style={{ color: "var(--accent-violet)" }} /> Extraction Metadata
            </h3>

            {loading && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: "10px", color: "var(--text-secondary)" }}>
                <Loader2 size={24} className="animate-spin" style={{ color: "var(--accent-teal)" }} />
                <span style={{ fontSize: "0.85rem", fontFamily: "var(--font-mono)" }}>[Scenario 9353591] Activating modules...</span>
              </div>
            )}

            {!loading && !result && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center" }}>
                Submit an email input on the left to activate the AI extraction engine.
              </div>
            )}

            {!loading && result && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", animation: "fadeIn 0.5s ease-out" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "8px", fontSize: "0.85rem" }}>
                  <span style={{ color: "var(--text-muted)" }}>Category:</span>
                  <span style={{ color: "var(--accent-teal)", fontWeight: "600" }}>{result.category}</span>
                  
                  <span style={{ color: "var(--text-muted)" }}>Sentiment:</span>
                  <span style={{ color: "#fff", fontWeight: "600" }}>{result.sentiment}</span>

                  <span style={{ color: "var(--text-muted)" }}>Priority:</span>
                  <span style={{ 
                    color: result.priority === "High" ? "var(--accent-yellow)" : result.priority === "Low" ? "var(--text-muted)" : "var(--accent-teal)", 
                    fontWeight: "700" 
                  }}>{result.priority}</span>

                  <span style={{ color: "var(--text-muted)" }}>Auto Action:</span>
                  <span style={{ color: "var(--accent-green)", fontWeight: "500", display: "flex", alignItems: "center", gap: "4px" }}>
                    <ShieldCheck size={14} /> {result.actionTaken}
                  </span>
                </div>
                
                <div style={{ marginTop: "8px", borderTop: "1px solid rgba(255,255,255,0.03)", paddingTop: "10px" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Executive Summary:</span>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "4px", fontStyle: "italic" }}>
                    "{result.summary}"
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Step 3 Log: Simulated Google Sheet updates */}
          <div className="glass-panel" style={{ padding: "20px", background: "rgba(10, 10, 14, 0.7)" }}>
            <h3 style={{ fontSize: "1rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px", display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <Database size={15} style={{ color: "var(--accent-green)" }} /> Logs: Google Sheets Output Database
            </h3>
            
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", color: "var(--text-muted)" }}>
                    <th style={{ padding: "6px" }}>Time</th>
                    <th style={{ padding: "6px" }}>Sender</th>
                    <th style={{ padding: "6px" }}>Category</th>
                    <th style={{ padding: "6px" }}>Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {sheetRows.map((row, index) => (
                    <tr key={index} style={{ borderBottom: "1px solid rgba(255,255,255,0.02)", color: index === 0 && result ? "#fff" : "var(--text-secondary)" }}>
                      <td style={{ padding: "8px 6px", fontFamily: "var(--font-mono)" }}>{row.date}</td>
                      <td style={{ padding: "8px 6px" }}>{row.sender}</td>
                      <td style={{ padding: "8px 6px", color: index === 0 && result ? "var(--accent-teal)" : "inherit" }}>{row.cat}</td>
                      <td style={{ padding: "8px 6px", fontWeight: "600" }}>{row.priority}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
