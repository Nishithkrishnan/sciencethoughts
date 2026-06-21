"use client";
import { useState } from "react";
import { motion } from "framer-motion";

export default function MarketingAuditorDemo() {
  const [copy, setCopy] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleAudit = async () => {
    if (!copy.trim()) return;
    
    setLoading(true);
    setError("");
    setResult(null);

    try {
      // Calls our live cloud Python backend
      const apiUrl = process.env.NEXT_PUBLIC_AI_API_URL || "https://sciencethoughts-python3.onrender.com/audit";
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marketing_copy: copy }),
      });

      if (!response.ok) {
        throw new Error("Failed to connect to AI Brain.");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Error connecting to the Python AI. Make sure the server is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
      <div className="glass-panel" style={{ padding: "24px", background: "rgba(22, 22, 28, 0.3)", border: "1px solid var(--border-color)", marginBottom: "30px", borderRadius: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px" }}>
          <span style={{ fontSize: "0.75rem", background: "rgba(0, 210, 255, 0.08)", border: "1px solid rgba(0, 210, 255, 0.2)", color: "#00d2ff", padding: "4px 12px", borderRadius: "20px", fontWeight: "600", textTransform: "uppercase" }}>Workflow Architecture</span>
          <span style={{ fontSize: "0.75rem", background: "rgba(255, 71, 87, 0.08)", border: "1px solid rgba(255, 71, 87, 0.2)", color: "#ff4757", padding: "4px 12px", borderRadius: "20px", fontWeight: "600" }}>Python + FastAPI</span>
        </div>
        <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
          This agent showcases a full-stack, enterprise-grade AI microservice. The React frontend sends text to a custom <strong>Python FastAPI</strong> backend, where a <strong>LangChain</strong> sequence enforces strict JSON schemas using Pydantic, acting as an elite real estate copywriter.
        </p>

        {/* Modular Workflow Visualizer */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", 
          gap: "12px", 
          marginTop: "20px", 
          background: "rgba(0,0,0,0.2)", 
          padding: "16px", 
          borderRadius: "10px", 
          border: "1px solid rgba(255,255,255,0.02)" 
        }}>
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", width: "38px", height: "38px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
            </div>
            <span style={{ fontSize: "0.75rem", fontWeight: "600" }}>1. Next.js UI</span>
            <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>React Frontend</span>
          </div>
          
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
            <div style={{ background: "rgba(0, 210, 255, 0.05)", border: "1px solid rgba(0, 210, 255, 0.2)", width: "38px", height: "38px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#00d2ff", boxShadow: loading ? "0 0 15px rgba(0, 210, 255, 0.5)" : "none", transition: "all 0.3s" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>
            </div>
            <span style={{ fontSize: "0.75rem", fontWeight: "600" }}>2. FastAPI Server</span>
            <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>Python Microservice</span>
          </div>

          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
            <div style={{ background: "rgba(58, 123, 213, 0.05)", border: "1px solid rgba(58, 123, 213, 0.2)", width: "38px", height: "38px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#3a7bd5", boxShadow: loading ? "0 0 15px rgba(58, 123, 213, 0.5)" : "none", transition: "all 0.3s", transitionDelay: "0.5s" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
            </div>
            <span style={{ fontSize: "0.75rem", fontWeight: "600" }}>3. LangChain</span>
            <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>Agentic Orchestration</span>
          </div>

          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
            <div style={{ background: "rgba(255, 71, 87, 0.05)", border: "1px solid rgba(255, 71, 87, 0.2)", width: "38px", height: "38px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#ff4757", boxShadow: !loading && result ? "0 0 15px rgba(255, 71, 87, 0.5)" : "none", transition: "all 0.3s" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <span style={{ fontSize: "0.75rem", fontWeight: "600" }}>4. Pydantic Output</span>
            <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>Strict JSON Schema</span>
          </div>
        </div>
      </div>

      <div style={{
        background: "rgba(255, 255, 255, 0.03)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "20px",
        padding: "30px",
        backdropFilter: "blur(10px)",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)"
      }}>
        <h2 style={{ fontSize: "1.8rem", marginBottom: "10px", color: "#00d2ff" }}>
          Real Estate Marketing Auditor
        </h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "20px", lineHeight: "1.5" }}>
          Paste your property description, Facebook Ad, or website copy below. Our LangChain AI agent will audit it for lead conversion and rewrite it to maximize sales.
        </p>

      <textarea
        value={copy}
        onChange={(e) => setCopy(e.target.value)}
        placeholder="e.g., 'Spacious 3BHK flat available in Whitefield. Good amenities. Contact for price.'"
        style={{
          width: "100%",
          minHeight: "150px",
          background: "rgba(0, 0, 0, 0.3)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "12px",
          padding: "15px",
          color: "#fff",
          fontSize: "1rem",
          fontFamily: "inherit",
          resize: "vertical",
          marginBottom: "20px",
          outline: "none",
          transition: "border-color 0.3s ease"
        }}
        onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
        onBlur={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.1)"}
      />

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleAudit}
        disabled={loading || !copy.trim()}
        style={{
          width: "100%",
          padding: "15px",
          background: loading ? "rgba(255, 255, 255, 0.1)" : "linear-gradient(90deg, #00d2ff 0%, #3a7bd5 100%)",
          color: loading ? "var(--text-secondary)" : "#fff",
          border: "none",
          borderRadius: "12px",
          fontSize: "1.1rem",
          fontWeight: "bold",
          cursor: loading || !copy.trim() ? "not-allowed" : "pointer",
          transition: "all 0.3s ease",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "10px",
          boxShadow: "0 4px 15px rgba(0, 210, 255, 0.3)"
        }}
      >
        {loading ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              style={{ width: "20px", height: "20px", border: "2px solid var(--text-secondary)", borderTopColor: "transparent", borderRadius: "50%" }}
            />
            AI is analyzing your copy...
          </>
        ) : (
          "Run Professional Audit"
        )}
      </motion.button>

      {error && (
        <div style={{ marginTop: "20px", padding: "15px", background: "rgba(255, 50, 50, 0.1)", border: "1px solid rgba(255, 50, 50, 0.3)", borderRadius: "10px", color: "#ff6b6b" }}>
          {error}
        </div>
      )}

      {result && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginTop: "30px", borderTop: "1px solid rgba(255, 255, 255, 0.1)", paddingTop: "30px" }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "1.5rem" }}>Audit Results</h3>
            <div style={{ 
              background: result.score > 70 ? "rgba(46, 213, 115, 0.2)" : "rgba(255, 71, 87, 0.2)", 
              color: result.score > 70 ? "#2ed573" : "#ff4757", 
              padding: "10px 20px", 
              borderRadius: "50px",
              fontWeight: "bold",
              fontSize: "1.2rem"
            }}>
              Score: {result.score}/100
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
            <div style={{ background: "rgba(46, 213, 115, 0.05)", border: "1px solid rgba(46, 213, 115, 0.2)", borderRadius: "12px", padding: "20px" }}>
              <h4 style={{ color: "#2ed573", marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                Strengths
              </h4>
              <ul style={{ paddingLeft: "20px", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "10px" }}>
                {result.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            
            <div style={{ background: "rgba(255, 71, 87, 0.05)", border: "1px solid rgba(255, 71, 87, 0.2)", borderRadius: "12px", padding: "20px" }}>
              <h4 style={{ color: "#ff4757", marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                Weaknesses
              </h4>
              <ul style={{ paddingLeft: "20px", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "10px" }}>
                {result.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          </div>

          <div style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "12px", padding: "20px" }}>
            <h4 style={{ color: "#00d2ff", marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="14 2 18 6 7 17 3 17 3 13 14 2"></polygon><line x1="3" y1="22" x2="21" y2="22"></line></svg>
              AI Optimized Rewrite
            </h4>
            <p style={{ color: "#fff", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
              {result.rewritten_copy}
            </p>
          </div>
        </motion.div>
      )}
      </div>
    </div>
  );
}
