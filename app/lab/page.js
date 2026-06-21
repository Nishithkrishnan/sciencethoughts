// app/lab/page.js
"use client";
import { useState } from "react";
import EmailFilterDemo from "../../components/EmailFilterDemo";
import MarketingAuditorDemo from "../../components/MarketingAuditorDemo";
import SystemArchitecture from "../../components/SystemArchitecture";

export default function LabPage() {
  const [activeTab, setActiveTab] = useState("email");

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-dark)",
      color: "#fff",
      paddingTop: "120px",
      paddingBottom: "100px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}>
      <div style={{ maxWidth: "800px", width: "100%" }}>
        <h1 style={{ fontSize: "3rem", fontWeight: "900", fontFamily: "var(--font-display)", textAlign: "center", marginBottom: "30px" }}>
          AI Agent Showcase
        </h1>
        
        {/* Tabs */}
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "30px" }}>
          <button 
            onClick={() => setActiveTab("email")}
            style={{
              padding: "10px 20px",
              background: activeTab === "email" ? "#00d2ff" : "transparent",
              color: activeTab === "email" ? "#000" : "var(--text-secondary)",
              border: "1px solid",
              borderColor: activeTab === "email" ? "#00d2ff" : "rgba(255,255,255,0.2)",
              borderRadius: "30px",
              cursor: "pointer",
              fontWeight: "bold",
              transition: "all 0.3s ease"
            }}
          >
            Email Filter Agent
          </button>
          <button 
            onClick={() => setActiveTab("auditor")}
            style={{
              padding: "10px 20px",
              background: activeTab === "auditor" ? "#00d2ff" : "transparent",
              color: activeTab === "auditor" ? "#000" : "var(--text-secondary)",
              border: "1px solid",
              borderColor: activeTab === "auditor" ? "#00d2ff" : "rgba(255,255,255,0.2)",
              borderRadius: "30px",
              cursor: "pointer",
              fontWeight: "bold",
              transition: "all 0.3s ease"
            }}
          >
            Real Estate Auditor (Python)
          </button>
        </div>

        {/* Dynamic Content */}
        {activeTab === "email" ? <EmailFilterDemo /> : <MarketingAuditorDemo />}
        
        <SystemArchitecture />
      </div>
    </div>
  );
}
