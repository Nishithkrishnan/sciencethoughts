"use client";

import React, { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [scope, setScope] = useState("workflow-automation");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: "2e6029a9-dcec-40ea-88c8-cee99c15db69",
          name: name,
          email: email,
          subject: `ScienceThoughts Contact: ${scope}`,
          message: `Scope: ${scope}\n\nMessage: ${message}`,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setSubmitted(true);
        setName("");
        setEmail("");
        setMessage("");
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0", animation: "fadeIn 0.5s ease-out" }}>
        <CheckCircle2 size={48} style={{ color: "var(--accent-teal)", margin: "0 auto 20px auto" }} />
        <h3 style={{ fontSize: "1.5rem", marginBottom: "10px", fontFamily: "var(--font-display)" }}>Message Logged!</h3>
        <p style={{ color: "var(--text-secondary)", marginBottom: "25px", fontSize: "0.95rem" }}>Thank you for reaching out. I'll get back to you within 24 hours.</p>
        <button onClick={() => setSubmitted(false)} className="nav-btn" style={{ padding: "10px 24px" }}>Send another message</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase" }}>Full Name</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name" 
            required
            style={{ width: "100%", padding: "14px 18px", borderRadius: "10px", border: "1px solid var(--border-color)", background: "rgba(0,0,0,0.2)", outline: "none", fontSize: "0.95rem", transition: "var(--transition-smooth)" }}
            onFocus={(e) => e.target.style.borderColor = "var(--accent-teal)"}
            onBlur={(e) => e.target.style.borderColor = "var(--border-color)"}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase" }}>Email Address</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com" 
            required
            style={{ width: "100%", padding: "14px 18px", borderRadius: "10px", border: "1px solid var(--border-color)", background: "rgba(0,0,0,0.2)", outline: "none", fontSize: "0.95rem", transition: "var(--transition-smooth)" }}
            onFocus={(e) => e.target.style.borderColor = "var(--accent-teal)"}
            onBlur={(e) => e.target.style.borderColor = "var(--border-color)"}
          />
        </div>
      </div>

      <div>
        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase" }}>Project Scope / Inquiry</label>
        <select 
          value={scope}
          onChange={(e) => setScope(e.target.value)}
          style={{ width: "100%", padding: "14px 18px", borderRadius: "10px", border: "1px solid var(--border-color)", background: "rgba(0,0,0,0.2)", outline: "none", fontSize: "0.95rem", color: "var(--text-secondary)", transition: "var(--transition-smooth)" }}
          onFocus={(e) => e.target.style.borderColor = "var(--accent-teal)"}
          onBlur={(e) => e.target.style.borderColor = "var(--border-color)"}
        >
          <option value="workflow-automation">Custom AI Agent / Workflow Automation</option>
          <option value="technical-writing">Technical Blog Writing / Thought Leadership</option>
          <option value="consulting">General Consulting</option>
          <option value="collaboration">Research Collaboration</option>
        </select>
      </div>

      <div>
        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase" }}>Message</label>
        <textarea 
          rows="5" 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe your requirements or goals..." 
          required
          style={{ width: "100%", padding: "14px 18px", borderRadius: "10px", border: "1px solid var(--border-color)", background: "rgba(0,0,0,0.2)", outline: "none", fontSize: "0.95rem", resize: "vertical", transition: "var(--transition-smooth)" }}
          onFocus={(e) => e.target.style.borderColor = "var(--accent-teal)"}
          onBlur={(e) => e.target.style.borderColor = "var(--border-color)"}
        ></textarea>
      </div>

      <button 
        type="submit" 
        disabled={loading}
        style={{ 
          display: "inline-flex", 
          alignItems: "center", 
          justifyContent: "center", 
          gap: "8px", 
          padding: "16px 30px", 
          borderRadius: "30px", 
          background: "var(--gradient-primary)", 
          color: "#000", 
          fontWeight: "700", 
          cursor: loading ? "default" : "pointer", 
          transition: "var(--transition-smooth)",
          border: "none"
        }}
        onMouseOver={(e) => e.target.style.boxShadow = loading ? "none" : "var(--glow-teal)"}
        onMouseOut={(e) => e.target.style.boxShadow = "none"}
      >
        {loading ? "Sending..." : "Send Message"} <Send size={16} />
      </button>
    </form>
  );
}
