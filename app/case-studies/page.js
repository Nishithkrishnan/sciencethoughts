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
            Luxury Hospitality <span className="gradient-text">Case Studies</span>
          </h1>

          <p style={{ fontSize: "1.2rem", color: "var(--text-secondary)", maxWidth: "800px", margin: "0 auto 45px auto", lineHeight: "1.6", fontWeight: "400" }}>
            How premium resorts and boutique villa networks use brand-safe AI agents to bypass OTA commissions and capture direct bookings 24/7.
          </p>
        </div>
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.01) 1px, transparent 1px)", backgroundSize: "40px 40px", maskImage: "radial-gradient(circle at 50% 50%, black, transparent 80%)", pointerEvents: "none" }}></div>
      </section>

      {/* Featured Proof of Concept: The Machan */}
      <section className="section-padding" style={{ borderTop: "1px solid var(--border-color)" }}>
        <div className="container">
          <div className="glass" style={{ padding: "50px", borderRadius: "24px", borderTop: "4px solid var(--accent-teal)", background: "rgba(10, 10, 12, 0.6)" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "40px" }}>
              {/* Left Column: Content */}
              <div style={{ flex: "1 1 500px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                  <Briefcase size={28} color="var(--accent-teal)" />
                  <h2 style={{ fontSize: "2.2rem", fontWeight: "800", fontFamily: "var(--font-display)", margin: 0 }}>The Machan</h2>
                </div>
                <p style={{ fontSize: "1.1rem", color: "var(--text-muted)", marginBottom: "30px", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.05em" }}>Luxury Treehouse Resort Proof-of-Concept</p>
                
                <h3 style={{ fontSize: "1.4rem", fontWeight: "700", marginBottom: "15px", color: "#fff" }}>The Bottleneck</h3>
                <p style={{ color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "25px" }}>
                  Guests looking to book treehouse cabins late at night had detailed questions about specific property rules, pet policies, and dining arrangements. Because inquiries were handled manually the following morning, high-intent travelers dropped off or booked on platforms charging a 15-20% commission.
                </p>

                <h3 style={{ fontSize: "1.4rem", fontWeight: "700", marginBottom: "15px", color: "#fff" }}>The Autonomous Solution</h3>
                <p style={{ color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "30px" }}>
                  We deployed a 24/7 AI guest concierge grounded in verified resort rules and tariffs. The agent answers forest deck amenity queries, explains wild animals/pet protection rules, up-sells dining packages, and processes reservation requests instantly.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "40px" }}>
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-color)", padding: "20px", borderRadius: "16px" }}>
                    <div style={{ color: "var(--accent-teal)", fontSize: "1.3rem", fontWeight: "800", marginBottom: "5px" }}>Real-Time</div>
                    <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Replies in the same WhatsApp conversation</div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-color)", padding: "20px", borderRadius: "16px" }}>
                    <div style={{ color: "var(--accent-violet)", fontSize: "1.3rem", fontWeight: "800", marginBottom: "5px" }}>Grounded</div>
                    <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Answers sourced from The Machan's own data</div>
                  </div>
                </div>

                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 30px 0", color: "var(--text-secondary)", fontSize: "1rem" }}>
                  <li style={{ marginBottom: "12px", display: "flex", alignItems: "flex-start", gap: "10px" }}><CheckCircle2 size={20} color="var(--accent-teal)" style={{ flexShrink: 0, marginTop: "2px" }}/> <strong>Grounded Tariff & Policy Answers:</strong> Instructed to defer to the property team rather than guess when information isn't in the verified knowledge base.</li>
                  <li style={{ marginBottom: "12px", display: "flex", alignItems: "flex-start", gap: "10px" }}><CheckCircle2 size={20} color="var(--accent-teal)" style={{ flexShrink: 0, marginTop: "2px" }}/> <strong>Zoho CRM Sync:</strong> Pushes captured guest and lead details directly to Zoho when connected.</li>
                  <li style={{ marginBottom: "12px", display: "flex", alignItems: "flex-start", gap: "10px" }}><CheckCircle2 size={20} color="var(--accent-teal)" style={{ flexShrink: 0, marginTop: "2px" }}/> <strong>WhatsApp Native:</strong> Communicates through the guest's preferred channel with zero app downloads required.</li>
                </ul>

                {/* Note: this is a proof-of-concept demo, not a completed client engagement with
                    measured before/after results. A before/after comparison table with specific
                    percentages was removed from here — those numbers were never actually measured
                    against real guest traffic and shouldn't be presented as a case-study result. */}
                <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "15px", color: "#fff" }}>What This Demo Shows</h3>
                <p style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}>
                  A guest can ask about amenities, pet policy, or rates at any hour and get an accurate, grounded answer immediately — instead of waiting until the property team is available the next morning. Try it yourself in the live demo.
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

      {/* Additional Case Studies Grid */}
      <section className="section-padding">
        <div className="container">
          <h2 style={{ fontSize: "2.2rem", fontWeight: "800", fontFamily: "var(--font-display)", marginBottom: "40px", textAlign: "center" }}>More Architecture Showcases</h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "30px" }}>
            
            {/* Mango Alibaug */}
            <div className="glass" style={{ padding: "35px", borderRadius: "24px", borderTop: "4px solid var(--accent-violet)", background: "rgba(10, 10, 12, 0.4)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "15px" }}>
                <Briefcase size={24} color="var(--accent-violet)" />
                <h3 style={{ fontSize: "1.6rem", fontWeight: "700", fontFamily: "var(--font-display)", margin: 0 }}>Mango Alibaug</h3>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "20px", fontWeight: "500", letterSpacing: "0.05em" }}>ALIBAUG | LUXURY BEACH HOUSE</p>
              <p style={{ color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "25px" }}>
                A custom AI host configured to quote weekend rates, calculate Konkani seafood meal packages, and answer pet-access questions from the property's own policies.
              </p>
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Handles after-hours inquiries the property team would otherwise miss.</span>
              </div>
            </div>

            {/* Lost Traveller */}
            <div className="glass" style={{ padding: "35px", borderRadius: "24px", borderTop: "4px solid var(--accent-green)", background: "rgba(10, 10, 12, 0.4)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "15px" }}>
                <Briefcase size={24} color="var(--accent-green)" />
                <h3 style={{ fontSize: "1.6rem", fontWeight: "700", fontFamily: "var(--font-display)", margin: 0 }}>Lost Traveller</h3>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "20px", fontWeight: "500", letterSpacing: "0.05em" }}>GOA | PREMIUM VILLA NETWORK</p>
              <p style={{ color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "25px" }}>
                Replaced static inquiry forms with a WhatsApp reservation chatbot, automatically routing booking inputs and guest details to their central sales CRM.
              </p>
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Outcome: Accelerated villa pipeline management.</span>
              </div>
            </div>

            {/* Destiny Farmstay */}
            <div className="glass" style={{ padding: "35px", borderRadius: "24px", borderTop: "4px solid var(--text-muted)", background: "rgba(10, 10, 12, 0.4)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "15px" }}>
                <Briefcase size={24} color="var(--text-muted)" />
                <h3 style={{ fontSize: "1.6rem", fontWeight: "700", fontFamily: "var(--font-display)", margin: 0 }}>Destiny Farmstay</h3>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "20px", fontWeight: "500", letterSpacing: "0.05em" }}>OOTY | EXPERIENTIAL STAY</p>
              <p style={{ color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "25px" }}>
                Handles complex questions regarding Ooty farm activity itineraries, animal stables, kids zones, horse riding packages, and check-out rules.
              </p>
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Outcome: Automated upselling of activity packages.</span>
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
              Experience the response speed, multilingual accuracy, and conversion-flow triggers directly on your phone. Chat with our active sandbox agent representing our boutique stays and resort templates.
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
              *Type <strong>/reset</strong> inside the chat to select a business code at any time.
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding" style={{ background: "rgba(0, 242, 255, 0.03)", borderTop: "1px solid var(--border-color)", borderBottom: "1px solid var(--border-color)" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "2.5rem", fontWeight: "800", fontFamily: "var(--font-display)", marginBottom: "20px" }}>Ready for Your Own Sandbox?</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto 30px auto" }}>
            We build custom 14-day staging pilots pre-loaded with your property policies and tariffs so your team can test the engine risk-free.
          </p>
          <a href="/#contact" className="nav-btn" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "16px 32px", fontSize: "1.05rem" }}>
            Request a Free Pilot <ArrowRight size={18} />
          </a>
        </div>
      </section>

    </div>
  );
}
