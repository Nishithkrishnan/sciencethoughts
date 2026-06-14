// app/lab/page.js
"use client";

import EmailFilterDemo from "../../components/EmailFilterDemo";
import EmbeddedFlowiseChat from "../../components/EmbeddedFlowiseChat";

export default function LabPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-dark)",
      color: "#fff",
      paddingTop: "120px",
      paddingBottom: "100px",
    }}>
      <div className="container" style={{ maxWidth: "1200px" }}>
        
        <div style={{ textAlign: "center", marginBottom: "50px" }}>
          <h1 style={{ fontSize: "3rem", fontWeight: "900", fontFamily: "var(--font-display)", marginBottom: "15px" }}>
            The Experimental Lab
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
            Interact directly with live cognitive workloads and workflow automation demos.
          </p>
        </div>

        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", 
          gap: "40px",
          alignItems: "start"
        }}>
          {/* Demo 1: Email Filtering Agent */}
          <div className="glass-panel" style={{ padding: "30px", background: "rgba(10, 10, 12, 0.4)" }}>
            <h2 style={{ fontSize: "1.6rem", fontWeight: "700", fontFamily: "var(--font-display)", marginBottom: "20px", color: "var(--accent-green)" }}>
              Email Filtering Automation
            </h2>
            <EmailFilterDemo />
          </div>

          {/* Demo 2: Site QA Agent */}
          <div className="glass-panel" style={{ padding: "30px", background: "rgba(10, 10, 12, 0.4)" }}>
            <h2 style={{ fontSize: "1.6rem", fontWeight: "700", fontFamily: "var(--font-display)", marginBottom: "20px", color: "var(--accent-teal)" }}>
              Cognitive QA Agent
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.6", marginBottom: "20px" }}>
              Interact directly with the cognitive portfolio assistant to ask questions about the site and portfolio.
            </p>
            <EmbeddedFlowiseChat />
          </div>
        </div>

      </div>
    </div>
  );
}
