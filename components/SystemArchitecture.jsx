import React from "react";
import { Mail, Shield, CheckCircle, ArrowRight, Database, Cpu, Search, HelpCircle, Layers, FileText, Zap } from "lucide-react";

export default function SystemArchitecture() {
  return (
    <div style={{ marginTop: "70px", display: "flex", flexDirection: "column", gap: "60px" }}>
      
      {/* Divider */}
      <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, var(--border-color), transparent)" }}></div>

      {/* 1. Email Filtering Agent Section */}
      <section style={{ animation: "fadeIn 0.8s ease-out" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px" }}>
          <span style={{ fontSize: "0.75rem", background: "rgba(57, 255, 20, 0.08)", border: "1px solid rgba(57, 255, 20, 0.2)", color: "var(--accent-green)", padding: "4px 12px", borderRadius: "20px", fontWeight: "600", textTransform: "uppercase" }}>System Architecture 01</span>
          <h2 style={{ fontSize: "1.8rem", fontWeight: "800", fontFamily: "var(--font-display)", margin: 0 }}>Email Filtering Automation</h2>
        </div>
        
        <p style={{ color: "var(--text-secondary)", lineHeight: "1.6", fontSize: "1rem", marginBottom: "30px" }}>
          An enterprise-grade autonomous workflow that acts as a cognitive gateway for incoming correspondence. It eliminates manual email sorting, prioritizing, and initial data logging by converting unstructured text into structured, actionable business events in real-time.
        </p>

        {/* Node diagram */}
        <div style={{ 
          background: "rgba(0,0,0,0.25)", 
          padding: "30px", 
          borderRadius: "16px", 
          border: "1px solid var(--border-color)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          alignItems: "center",
          marginBottom: "35px",
          position: "relative"
        }}>
          {/* Node 1 */}
          <div className="glass-panel" style={{ padding: "20px", textAlign: "center", borderLeft: "3px solid #ff4a4a" }}>
            <Mail size={28} style={{ color: "#ff4a4a", margin: "0 auto 10px auto" }} />
            <h4 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "6px" }}>Gmail Ingestion</h4>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Webhooks trigger on incoming unread messages.</p>
          </div>
          
          <div style={{ display: "flex", justifyContent: "center", color: "var(--text-muted)" }}>
            <ArrowRight className="md-arrow-right" style={{ transform: "rotate(0deg)" }} />
          </div>

          {/* Node 2 */}
          <div className="glass-panel" style={{ padding: "20px", textAlign: "center", borderLeft: "3px solid var(--accent-green)" }}>
            <Cpu size={28} style={{ color: "var(--accent-green)", margin: "0 auto 10px auto" }} />
            <h4 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "6px" }}>OpenAI GPT-4o Classifier</h4>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Extracts priority, sentiment, category, & action items.</p>
          </div>

          <div style={{ display: "flex", justifyContent: "center", color: "var(--text-muted)" }}>
            <ArrowRight className="md-arrow-right" />
          </div>

          {/* Node 3 */}
          <div className="glass-panel" style={{ padding: "20px", textAlign: "center", borderLeft: "3px solid var(--accent-teal)" }}>
            <Database size={28} style={{ color: "var(--accent-teal)", margin: "0 auto 10px auto" }} />
            <h4 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "6px" }}>Google Sheets Logging</h4>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Creates row records of parsed metadata and urgency.</p>
          </div>
        </div>

        {/* Benefits Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "25px" }}>
          <div className="glass" style={{ padding: "20px", borderRadius: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              <Zap size={18} style={{ color: "var(--accent-green)" }} />
              <h5 style={{ fontWeight: "700", fontSize: "0.95rem", margin: 0 }}>Business Impact</h5>
            </div>
            <ul style={{ paddingLeft: "18px", color: "var(--text-secondary)", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "6px", margin: 0 }}>
              <li><strong>Zero Repetitive Work:</strong> Saves ~2 hours daily by automating lead & query sorting.</li>
              <li><strong>Hyper-Response Time:</strong> Immediate slack notifications can be wired for High-Priority issues.</li>
              <li><strong>Data Integrity:</strong> Ensures every customer query is recorded systematically without human error.</li>
            </ul>
          </div>
          <div className="glass" style={{ padding: "20px", borderRadius: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              <Layers size={18} style={{ color: "var(--accent-green)" }} />
              <h5 style={{ fontWeight: "700", fontSize: "0.95rem", margin: 0 }}>Technical Details</h5>
            </div>
            <ul style={{ paddingLeft: "18px", color: "var(--text-secondary)", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "6px", margin: 0 }}>
              <li>Built using <strong>Make.com</strong> for modular API orchestration.</li>
              <li>Utilizes zero-shot prompt structures in <strong>GPT-4o</strong> to return predictable JSON outputs.</li>
              <li>Secured via standard OAuth 2.0 Gmail and Google Cloud integrations.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, var(--border-color), transparent)" }}></div>

      {/* 2. Flowise Chat QA Agent Section */}
      <section style={{ animation: "fadeIn 1s ease-out" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px" }}>
          <span style={{ fontSize: "0.75rem", background: "rgba(0, 242, 255, 0.08)", border: "1px solid rgba(0, 242, 255, 0.2)", color: "var(--accent-teal)", padding: "4px 12px", borderRadius: "20px", fontWeight: "600", textTransform: "uppercase" }}>System Architecture 02</span>
          <h2 style={{ fontSize: "1.8rem", fontWeight: "800", fontFamily: "var(--font-display)", margin: 0 }}>Cognitive Portfolio QA Agent</h2>
        </div>
        
        <p style={{ color: "var(--text-secondary)", lineHeight: "1.6", fontSize: "1rem", marginBottom: "30px" }}>
          A semantic search assistant running on a Retrieval-Augmented Generation (RAG) architecture. Rather than relying purely on LLM baseline knowledge, this agent retrieves context directly from a curated portfolio database to answer questions with precision and absolute factual grounding.
        </p>

        {/* Node diagram */}
        <div style={{ 
          background: "rgba(0,0,0,0.25)", 
          padding: "30px", 
          borderRadius: "16px", 
          border: "1px solid var(--border-color)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          alignItems: "center",
          marginBottom: "35px",
          position: "relative"
        }}>
          {/* Node 1 */}
          <div className="glass-panel" style={{ padding: "20px", textAlign: "center", borderLeft: "3px solid var(--accent-violet)" }}>
            <FileText size={28} style={{ color: "var(--accent-violet)", margin: "0 auto 10px auto" }} />
            <h4 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "6px" }}>Knowledge Document</h4>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Curated Markdown document describing portfolio data.</p>
          </div>
          
          <div style={{ display: "flex", justifyContent: "center", color: "var(--text-muted)" }}>
            <ArrowRight className="md-arrow-right" />
          </div>

          {/* Node 2 */}
          <div className="glass-panel" style={{ padding: "20px", textAlign: "center", borderLeft: "3px solid var(--accent-teal)" }}>
            <Search size={28} style={{ color: "var(--accent-teal)", margin: "0 auto 10px auto" }} />
            <h4 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "6px" }}>Vector Database (RAG)</h4>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Embeds chunks and performs semantic vector search.</p>
          </div>

          <div style={{ display: "flex", justifyContent: "center", color: "var(--text-muted)" }}>
            <ArrowRight className="md-arrow-right" />
          </div>

          {/* Node 3 */}
          <div className="glass-panel" style={{ padding: "20px", textAlign: "center", borderLeft: "3px solid #ff9f43" }}>
            <Cpu size={28} style={{ color: "#ff9f43", margin: "0 auto 10px auto" }} />
            <h4 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "6px" }}>LLM Synthesis</h4>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>OpenAI LLM combines retrieved chunks to generate answers.</p>
          </div>
        </div>

        {/* Benefits Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "25px" }}>
          <div className="glass" style={{ padding: "20px", borderRadius: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              <Zap size={18} style={{ color: "var(--accent-teal)" }} />
              <h5 style={{ fontWeight: "700", fontSize: "0.95rem", margin: 0 }}>Business Impact</h5>
            </div>
            <ul style={{ paddingLeft: "18px", color: "var(--text-secondary)", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "6px", margin: 0 }}>
              <li><strong>Zero Hallucinations:</strong> The agent is strictly locked to output facts derived from the uploaded source.</li>
              <li><strong>24/7 Virtual Analyst:</strong> Instantly answers developer FAQs or potential recruiter requests.</li>
              <li><strong>Low Latency Support:</strong> Offloads high-frequency user support queries without human staffing.</li>
            </ul>
          </div>
          <div className="glass" style={{ padding: "20px", borderRadius: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              <Layers size={18} style={{ color: "var(--accent-teal)" }} />
              <h5 style={{ fontWeight: "700", fontSize: "0.95rem", margin: 0 }}>Technical Details</h5>
            </div>
            <ul style={{ paddingLeft: "18px", color: "var(--text-secondary)", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "6px", margin: 0 }}>
              <li>Orchestrated using **Flowise** node UI linking LangChain components.</li>
              <li>Splits text with a recursive character splitter (1,000 token chunk size, 200 token overlap).</li>
              <li>Uses **OpenAI text-embeddings-ada-002** and an In-Memory vector storage node for similarity lookups.</li>
            </ul>
          </div>
        </div>
      </section>

    </div>
  );
}
