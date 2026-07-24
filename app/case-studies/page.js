"use client";

import { Activity, ArrowRight, CheckCircle2, Briefcase } from "lucide-react";
import InteractiveWebDemo from "../../components/InteractiveWebDemo";

export default function CaseStudies() {
  return (
    <div style={{ background: "var(--bg-dark)" }}>
      {/* Hero Section */}
      <section style={{ padding: "140px 0 80px 0", position: "relative", overflow: "hidden" }}>
        <div className="container" style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", padding: "8px 18px", borderRadius: "30px", marginBottom: "25px" }}>
            <Activity size={14} className="animate-pulse-glow" style={{ color: "var(--accent-teal)" }} />
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "500", letterSpacing: "0.05em" }}>PERFORMANCE BENCHMARKS</span>
          </div>

          <h1 style={{ fontSize: "3.8rem", fontWeight: "900", fontFamily: "var(--font-display)", letterSpacing: "-0.03em", lineHeight: "1.1", marginBottom: "25px" }}>
            Real Estate <span className="gradient-text">Case Studies</span>
          </h1>

          <p style={{ fontSize: "1.2rem", color: "var(--text-secondary)", maxWidth: "800px", margin: "0 auto 45px auto", lineHeight: "1.6", fontWeight: "400" }}>
            How top developers use our zero-hallucination RAG engines to cut response times from hours to seconds and capture 100% of after-hours ad traffic.
          </p>
        </div>
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.01) 1px, transparent 1px)", backgroundSize: "40px 40px", maskImage: "radial-gradient(circle at 50% 50%, black, transparent 80%)", pointerEvents: "none" }}></div>
      </section>

      {/* Featured Proof of Concept: Brigade Group */}
      <section className="section-padding" style={{ borderTop: "1px solid var(--border-color)" }}>
        <div className="container">
          <div className="glass" style={{ padding: "50px", borderRadius: "24px", borderTop: "4px solid var(--accent-teal)", background: "rgba(10, 10, 12, 0.6)" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "40px" }}>
              {/* Left Column: Content */}
              <div style={{ flex: "1 1 500px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                  <Briefcase size={28} color="var(--accent-teal)" />
                  <h2 style={{ fontSize: "2.2rem", fontWeight: "800", fontFamily: "var(--font-display)", margin: 0 }}>Brigade Group</h2>
                </div>
                <p style={{ fontSize: "1.1rem", color: "var(--text-muted)", marginBottom: "30px", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.05em" }}>Enterprise Architecture Proof-of-Concept</p>
                
                <h3 style={{ fontSize: "1.4rem", fontWeight: "700", marginBottom: "15px", color: "#fff" }}>The Bottleneck</h3>
                <p style={{ color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "25px" }}>
                  Despite significant Meta Ad spend, a large portion of high-intent buyers were clicking ads after 7 PM. Traditional static forms and delayed human follow-ups (averaging 4+ hours) resulted in critical lead leakage.
                </p>

                <h3 style={{ fontSize: "1.4rem", fontWeight: "700", marginBottom: "15px", color: "#fff" }}>The Autonomous Solution</h3>
                <p style={{ color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "30px" }}>
                  We deployed a fully autonomous WhatsApp AI Concierge powered by a grounded RAG architecture (Temperature 0.0). The system is strictly sandboxed to approved RERA documents and pricing sheets, ensuring 100% factual accuracy.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "40px" }}>
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-color)", padding: "20px", borderRadius: "16px" }}>
                    <div style={{ color: "var(--accent-teal)", fontSize: "2.5rem", fontWeight: "800", marginBottom: "5px" }}>1.8s</div>
                    <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Average Speed-to-Lead</div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-color)", padding: "20px", borderRadius: "16px" }}>
                    <div style={{ color: "var(--accent-violet)", fontSize: "2.5rem", fontWeight: "800", marginBottom: "5px" }}>100%</div>
                    <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>RERA Accuracy Guarantee</div>
                  </div>
                </div>

                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 30px 0", color: "var(--text-secondary)", fontSize: "1rem" }}>
                  <li style={{ marginBottom: "12px", display: "flex", alignItems: "flex-start", gap: "10px" }}><CheckCircle2 size={20} color="var(--accent-teal)" style={{ flexShrink: 0, marginTop: "2px" }}/> <strong>Zero Data Retention:</strong> Fully compliant with enterprise data privacy standards.</li>
                  <li style={{ marginBottom: "12px", display: "flex", alignItems: "flex-start", gap: "10px" }}><CheckCircle2 size={20} color="var(--accent-teal)" style={{ flexShrink: 0, marginTop: "2px" }}/> <strong>Instant CRM Sync:</strong> Pushes qualified leads directly to LeadSquared via Make.com webhooks.</li>
                  <li style={{ marginBottom: "12px", display: "flex", alignItems: "flex-start", gap: "10px" }}><CheckCircle2 size={20} color="var(--accent-teal)" style={{ flexShrink: 0, marginTop: "2px" }}/> <strong>Multi-lingual Edge:</strong> Seamlessly processes code-switched Hinglish inquiries.</li>
                </ul>

                {/* Impact Comparison Matrix */}
                <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "15px", color: "#fff" }}>Before vs. After Impact Matrix</h3>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem", textAlign: "left" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", color: "var(--text-muted)" }}>
                        <th style={{ padding: "10px" }}>Metric</th>
                        <th style={{ padding: "10px" }}>Traditional Form</th>
                        <th style={{ padding: "10px", color: "var(--accent-teal)" }}>ScienceThoughts AI</th>
                      </tr>
                    </thead>
                    <tbody style={{ color: "var(--text-secondary)" }}>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <td style={{ padding: "10px", fontWeight: "600" }}>Speed to Lead</td>
                        <td style={{ padding: "10px" }}>4.2 Hours</td>
                        <td style={{ padding: "10px", color: "var(--accent-teal)", fontWeight: "700" }}>1.8 Seconds</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <td style={{ padding: "10px", fontWeight: "600" }}>After-Hours Capture</td>
                        <td style={{ padding: "10px" }}>8% (Drop-off)</td>
                        <td style={{ padding: "10px", color: "var(--accent-teal)", fontWeight: "700" }}>94% Instant Chat</td>
                      </tr>
                      <tr>
                        <td style={{ padding: "10px", fontWeight: "600" }}>CRM Sync Delay</td>
                        <td style={{ padding: "10px" }}>24-48 Hours</td>
                        <td style={{ padding: "10px", color: "var(--accent-teal)", fontWeight: "700" }}>Instant (&lt; 2s)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
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

      {/* Additional Case Studies Grid */}
      <section className="section-padding">
        <div className="container">
          <h2 style={{ fontSize: "2.2rem", fontWeight: "800", fontFamily: "var(--font-display)", marginBottom: "40px", textAlign: "center" }}>More Architecture Showcases</h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "30px" }}>
            
            {/* ASBL */}
            <div className="glass" style={{ padding: "35px", borderRadius: "24px", borderTop: "4px solid var(--accent-violet)", background: "rgba(10, 10, 12, 0.4)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "15px" }}>
                <Briefcase size={24} color="var(--accent-violet)" />
                <h3 style={{ fontSize: "1.6rem", fontWeight: "700", fontFamily: "var(--font-display)", margin: 0 }}>ASBL Builders</h3>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "20px", fontWeight: "500", letterSpacing: "0.05em" }}>HYDERABAD | LUXURY APARTMENTS</p>
              <p style={{ color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "25px" }}>
                A custom AI assistant designed for ASBL Loft and Spire. The agent instantly qualifies buyers based on their budget (₹1.9 Cr+) and securely books site visits.
              </p>
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Outcome: Elimination of after-hours lead drop-off.</span>
              </div>
            </div>

            {/* Century Real Estate */}
            <div className="glass" style={{ padding: "35px", borderRadius: "24px", borderTop: "4px solid var(--accent-green)", background: "rgba(10, 10, 12, 0.4)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "15px" }}>
                <Briefcase size={24} color="var(--accent-green)" />
                <h3 style={{ fontSize: "1.6rem", fontWeight: "700", fontFamily: "var(--font-display)", margin: 0 }}>Century Real Estate</h3>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "20px", fontWeight: "500", letterSpacing: "0.05em" }}>BANGALORE | PREMIUM HOUSING</p>
              <p style={{ color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "25px" }}>
                Replaced static contact forms with a conversational agent capable of distributing property brochures and location pins dynamically via WhatsApp.
              </p>
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Outcome: Accelerated funnel progression.</span>
              </div>
            </div>

            {/* Saritha Developers */}
            <div className="glass" style={{ padding: "35px", borderRadius: "24px", borderTop: "4px solid var(--text-muted)", background: "rgba(10, 10, 12, 0.4)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "15px" }}>
                <Briefcase size={24} color="var(--text-muted)" />
                <h3 style={{ fontSize: "1.6rem", fontWeight: "700", fontFamily: "var(--font-display)", margin: 0 }}>Saritha Developers</h3>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "20px", fontWeight: "500", letterSpacing: "0.05em" }}>BANGALORE | TECH CORRIDOR</p>
              <p style={{ color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "25px" }}>
                Targeting tech workers in Whitefield, this AI model engages high-intent buyers with instant flat availability, layout specs, and metro connectivity details.
              </p>
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Outcome: Faster, frictionless buyer journey.</span>
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
              <span style={{ color: "#25D366" }}>📱</span> Test WhatsApp Cloud Integration
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", lineHeight: "1.6", marginBottom: "30px" }}>
              Experience the absolute speed, multilingual accuracy, and conversion-flow triggers directly on your phone. Chat with our active sandbox agent representing any of our 21 demo businesses.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap", alignItems: "center" }}>
              <a 
                href="https://wa.me/15550118852?text=%2Freset" 
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
              *Type <strong>/reset</strong> inside the chat to select a business code (1 to 21) at any time.
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding" style={{ background: "rgba(0, 242, 255, 0.03)", borderTop: "1px solid var(--border-color)", borderBottom: "1px solid var(--border-color)" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "2.5rem", fontWeight: "800", fontFamily: "var(--font-display)", marginBottom: "20px" }}>Ready for Your Own Sandbox?</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto 30px auto" }}>
            We build custom 14-day staging pilots pre-loaded with your project data so your team can test the engine risk-free.
          </p>
          <a href="/#contact" className="nav-btn" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "16px 32px", fontSize: "1.05rem" }}>
            Request a Free Pilot <ArrowRight size={18} />
          </a>
        </div>
      </section>

    </div>
  );
}
