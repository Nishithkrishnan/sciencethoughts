"use client";

import { Activity, ArrowRight, CheckCircle2, Briefcase } from "lucide-react";
import InteractiveWebDemo from "../../../components/InteractiveWebDemo";

export default function CaseStudies() {
  return (
    <div style={{ background: "var(--bg-dark)" }}>
      {/* Hero Section */}
      <section style={{ padding: "140px 0 80px 0", position: "relative", overflow: "hidden" }}>
        <div className="container" style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", padding: "8px 18px", borderRadius: "30px", marginBottom: "25px" }}>
            <Activity size={14} className="animate-pulse-glow" style={{ color: "var(--accent-teal)" }} />
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "500", letterSpacing: "0.05em" }}>LIVE DEMOS</span>
          </div>

          <h1 style={{ fontSize: "3.8rem", fontWeight: "900", fontFamily: "var(--font-display)", letterSpacing: "-0.03em", lineHeight: "1.1", marginBottom: "25px" }}>
            Live <span className="gradient-text">Demos</span>
          </h1>

          <p style={{ fontSize: "1.2rem", color: "var(--text-secondary)", maxWidth: "800px", margin: "0 auto 45px auto", lineHeight: "1.6", fontWeight: "400" }}>
            Three fictional businesses, each with its own assistant. Ask what a customer would ask and see how it answers, when it defers to the team, and how it records an enquiry.
          </p>
        </div>
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.01) 1px, transparent 1px)", backgroundSize: "40px 40px", maskImage: "radial-gradient(circle at 50% 50%, black, transparent 80%)", pointerEvents: "none" }}></div>
      </section>

      {/* Featured demo: Tamarind Cove Villas, a fictional business. Not a client. */}
      <section className="section-padding" style={{ borderTop: "1px solid var(--border-color)" }}>
        <div className="container">
          <div className="glass" style={{ padding: "50px", borderRadius: "24px", borderTop: "4px solid var(--accent-teal)", background: "rgba(10, 10, 12, 0.6)" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "40px" }}>
              {/* Left Column: Content */}
              <div style={{ flex: "1 1 500px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                  <Briefcase size={28} color="var(--accent-teal)" />
                  <h2 style={{ fontSize: "2.2rem", fontWeight: "800", fontFamily: "var(--font-display)", margin: 0 }}>Tamarind Cove Villas</h2>
                </div>
                <p style={{ fontSize: "1.1rem", color: "var(--text-muted)", marginBottom: "30px", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.05em" }}>Fictional demo business: villa stay</p>
                
                <h3 style={{ fontSize: "1.4rem", fontWeight: "700", marginBottom: "15px", color: "#fff" }}>The situation</h3>
                <p style={{ color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "25px" }}>
                  Guests ask about rates, house rules and meals at all hours. When those questions wait until the owner is free the next morning, some of those guests have already booked somewhere else.
                </p>

                <h3 style={{ fontSize: "1.4rem", fontWeight: "700", marginBottom: "15px", color: "#fff" }}>What the assistant does</h3>
                <p style={{ color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "30px" }}>
                  It answers from the villa&apos;s own facts: rates, check-in times, pet policy and meals. When it does not know, it says so and passes the question to the team. When a guest wants to book, it records their dates, guest count and contact details for the owner to confirm.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "40px" }}>
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-color)", padding: "20px", borderRadius: "16px" }}>
                    <div style={{ color: "var(--accent-teal)", fontSize: "1.3rem", fontWeight: "800", marginBottom: "5px" }}>Real-Time</div>
                    <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Replies in the same WhatsApp conversation</div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-color)", padding: "20px", borderRadius: "16px" }}>
                    <div style={{ color: "var(--accent-violet)", fontSize: "1.3rem", fontWeight: "800", marginBottom: "5px" }}>Grounded</div>
                    <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Answers come only from the business&apos;s own facts</div>
                  </div>
                </div>

                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 30px 0", color: "var(--text-secondary)", fontSize: "1rem" }}>
                  <li style={{ marginBottom: "12px", display: "flex", alignItems: "flex-start", gap: "10px" }}><CheckCircle2 size={20} color="var(--accent-teal)" style={{ flexShrink: 0, marginTop: "2px" }}/> <strong>Answers from its own facts:</strong> told to pass a question to the team rather than guess when the answer isn&apos;t in the business&apos;s information.</li>
                  <li style={{ marginBottom: "12px", display: "flex", alignItems: "flex-start", gap: "10px" }}><CheckCircle2 size={20} color="var(--accent-teal)" style={{ flexShrink: 0, marginTop: "2px" }}/> <strong>Enquiries recorded:</strong> a customer&apos;s details and the conversation go to the business&apos;s Google Sheet or CRM.</li>
                  <li style={{ marginBottom: "12px", display: "flex", alignItems: "flex-start", gap: "10px" }}><CheckCircle2 size={20} color="var(--accent-teal)" style={{ flexShrink: 0, marginTop: "2px" }}/> <strong>Website or WhatsApp:</strong> works in a website chat or on WhatsApp, with nothing for the customer to install.</li>
                </ul>

                {/* Note: this is a proof-of-concept demo, not a completed client engagement with
                    measured before/after results. A before/after comparison table with specific
                    percentages was removed from here — those numbers were never actually measured
                    against real guest traffic and shouldn't be presented as a case-study result. */}
                <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "15px", color: "#fff" }}>What This Demo Shows</h3>
                <p style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}>
                  A customer can ask about rates, house rules or meals at any hour and get an accurate answer straight away, instead of waiting until the owner is free the next morning. Try it yourself in the live demo, including a question it shouldn&apos;t know.
                </p>
              </div>

              {/* Right Column: Live Demo Component */}
              <div style={{ flex: "1 1 400px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "600", letterSpacing: "0.05em", textTransform: "uppercase", background: "rgba(255,255,255,0.05)", padding: "6px 12px", borderRadius: "20px" }}>Live Interactive Demo</span>
                </div>
                <InteractiveWebDemo />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Demo Play Sandbox */}
      <section className="section-padding" style={{ borderTop: "1px solid var(--border-color)", background: "rgba(5, 5, 8, 0.4)" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <div className="glass" style={{ padding: "40px", borderRadius: "24px", maxWidth: "800px", margin: "0 auto", border: "1px solid rgba(37, 211, 102, 0.2)" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: "800", fontFamily: "var(--font-display)", marginBottom: "15px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
              <span style={{ color: "#25D366" }}>📱</span> Try the demos on WhatsApp
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", lineHeight: "1.6", marginBottom: "30px" }}>
              Chat with the same three demo agents on your phone. Type a number from the menu to pick one.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap", alignItems: "center" }}>
              <a 
                href="https://wa.me/918015424935?text=%2Freset" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ 
                  display: "inline-flex", 
                  alignItems: "center", 
                  gap: "10px", 
                  padding: "16px 32px", 
                  background: "#25D366", 
                  color: "#ffffff", 
                  borderRadius: "12px", 
                  fontSize: "1.05rem", 
                  fontWeight: "700", 
                  boxShadow: "0 0 20px rgba(37, 211, 102, 0.4)",
                  textDecoration: "none"
                }}
              >
                Chat on WhatsApp
              </a>
            </div>
            <div style={{ marginTop: "20px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
              *Type <strong>/reset</strong> inside the chat to pick a different demo at any time.
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding" style={{ background: "rgba(0, 242, 255, 0.03)", borderTop: "1px solid var(--border-color)", borderBottom: "1px solid var(--border-color)" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "2.5rem", fontWeight: "800", fontFamily: "var(--font-display)", marginBottom: "20px" }}>Want an agent for your business?</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto 30px auto" }}>
            Tell us what your customers ask. We build a private preview from your own information, so you can test it before anything goes live.
          </p>
          <a href="/#contact" className="nav-btn" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "16px 32px", fontSize: "1.05rem" }}>
            Book a call <ArrowRight size={18} />
          </a>
        </div>
      </section>

    </div>
  );
}
