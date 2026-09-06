import SearchInput from "../components/SearchInput";
import ContactForm from "../components/ContactForm";
import InteractiveWebDemo from "../components/InteractiveWebDemo";
import { Brain, Briefcase, Sparkles, ArrowRight, Activity, Cpu, Mail, Calendar, CheckCircle2, Home as HomeIcon } from "lucide-react";

export default async function Home() {

  const agents = [
    {
      id: "concierge-agent",
      name: "WhatsApp Guest Concierge",
      desc: "A 24/7 conversational AI that answers guest questions from your property's own knowledge base, quotes accurate rates, and extracts structured lead details from the conversation automatically — name, dates, budget, and requirements.",
      icon: <Mail size={24} />,
      color: "var(--accent-green)",
      badge: "Zoho CRM Native",
      stack: ["WhatsApp Cloud API", "OpenAI GPT-4o", "Zoho CRM", "Structured Lead Extraction"],
      borderColor: "rgba(57, 255, 20, 0.2)"
    },
    {
      id: "booking-agent",
      name: "Direct Booking Concierge",
      desc: "A custom 24/7 conversational assistant built to quote weekend tariffs, clarify property policies, and register bookings — grounded strictly in your property's verified knowledge base, and built to defer rather than guess.",
      icon: <HomeIcon size={24} />,
      color: "var(--accent-teal)",
      badge: "Multi-Tenant Architecture",
      stack: ["Next.js Edge", "Vercel KV", "OpenAI GPT-4o", "Gemini Failover"],
      borderColor: "rgba(0, 242, 255, 0.2)"
    }
  ];

  return (
    <div style={{ background: "var(--bg-dark)" }}>
      
      {/* 1. Hero Section */}
      <section style={{ padding: "140px 0 100px 0", position: "relative", overflow: "hidden" }}>
        <div className="container" style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
          
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", padding: "8px 18px", borderRadius: "30px", marginBottom: "25px", animation: "slideUp 0.6s ease-out" }}>
            <Activity size={14} className="animate-pulse-glow" style={{ color: "var(--accent-teal)" }} />
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "500", letterSpacing: "0.05em" }}>ENTERPRISE AI CONCIERGE PLATFORM</span>
          </div>

          <h1 style={{ fontSize: "4.2rem", fontWeight: "900", fontFamily: "var(--font-display)", letterSpacing: "-0.03em", lineHeight: "1.1", marginBottom: "25px", animation: "slideUp 0.8s ease-out" }}>
            The 24/7 AI Concierge for <span className="gradient-text">Luxury Hospitality</span>
          </h1>

          <p style={{ fontSize: "1.3rem", color: "var(--text-secondary)", maxWidth: "800px", margin: "0 auto 45px auto", lineHeight: "1.6", fontWeight: "400", animation: "slideUp 1s ease-out" }}>
            Convert late-night inquiries into confirmed reservations. Our AI agents engage guests instantly on WhatsApp, ground every answer in your property's own data, and sync captured lead details directly to your CRM.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "20px", alignItems: "center", flexWrap: "wrap", animation: "slideUp 1.2s ease-out" }}>
            <a href="/case-studies" className="nav-btn" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "16px 32px", fontSize: "1.05rem" }}>
              Explore Case Studies <ArrowRight size={18} />
            </a>
            <SearchInput />
          </div>

        </div>

        {/* Decorative Grid Mesh */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.01) 1px, transparent 1px)", backgroundSize: "40px 40px", maskImage: "radial-gradient(circle at 50% 50%, black, transparent 80%)", pointerEvents: "none" }}></div>
      </section>

      {/* 1.5 Powered By Strip (Social Proof) */}
      <section style={{ padding: "40px 0", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(5, 5, 8, 0.4)" }}>
        <div className="container">
          <p style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "20px" }}>Currently Integrated With</p>
          <div style={{ display: "flex", justifyContent: "center", gap: "50px", flexWrap: "wrap", opacity: 0.35 }}>
            <span style={{ fontSize: "1.2rem", fontWeight: "700", fontFamily: "var(--font-display)", color: "var(--text-muted)" }}>WhatsApp Business Platform</span>
            <span style={{ fontSize: "1.2rem", fontWeight: "700", fontFamily: "var(--font-display)", color: "var(--text-muted)" }}>Zoho CRM</span>
          </div>
          <p style={{ textAlign: "center", fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "16px" }}>Other CRMs and PMS platforms built to order for Portfolio and Enterprise plans.</p>
        </div>
      </section>

      {/* 2. Agent Showcase (The Lab) */}
      <section id="lab" className="section-padding" style={{ borderTop: "1px solid var(--border-color)" }}>
        <div className="container">
          
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
              <span style={{ color: "var(--accent-teal)", background: "rgba(0,242,255,0.05)", padding: "8px", borderRadius: "12px", border: "1px solid rgba(0,242,255,0.1)" }}>
                <Cpu size={24} />
              </span>
            </div>
            <h2 style={{ fontSize: "2.8rem", fontWeight: "800", fontFamily: "var(--font-display)", marginBottom: "15px" }}>Pre-Built Industry Adapters</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>Fully configured guest concierges ready to link with your property operations.</p>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: "30px", flexWrap: "wrap" }}>
            {agents.map((agent) => (
              <div 
                key={agent.id} 
                className="glass" 
                style={{ 
                  padding: "35px", 
                  borderRadius: "24px", 
                  display: "flex", 
                  flexDirection: "column", 
                  maxWidth: "500px",
                  width: "100%",
                  borderLeft: `4px solid ${agent.color}`,
                  background: "rgba(10, 10, 12, 0.4)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "48px", height: "48px", borderRadius: "12px", background: `${agent.color}15`, color: agent.color }}>
                    {agent.icon}
                  </div>
                  <span style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--text-muted)", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-color)", padding: "4px 10px", borderRadius: "8px" }}>{agent.badge}</span>
                </div>

                <h3 style={{ fontSize: "1.45rem", fontWeight: "700", marginBottom: "12px", fontFamily: "var(--font-display)" }}>{agent.name}</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.6", marginBottom: "25px", flexGrow: 1 }}>{agent.desc}</p>
                
                <div style={{ display: "flex", gap: "8px", marginBottom: "30px", flexWrap: "wrap" }}>
                  {agent.stack.map((tech, idx) => (
                    <span key={idx} style={{ fontSize: "0.75rem", background: "rgba(255,255,255,0.02)", color: "var(--text-secondary)", border: "1px solid var(--border-color)", padding: "4px 10px", borderRadius: "6px" }}>{tech}</span>
                  ))}
                </div>

                <a href={`/case-studies`} style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px", fontSize: "0.95rem", fontWeight: "600", color: "#fff", transition: "var(--transition-fast)" }} className="launch-link">
                  View Demo Hub <ArrowRight size={14} style={{ transition: "transform 0.2s" }} />
                </a>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Live Web Chat Demo Section */}
      <section id="live-demo" className="section-padding" style={{ borderTop: "1px solid var(--border-color)", background: "rgba(10, 15, 25, 0.4)" }}>
        <div className="container" style={{ maxWidth: "900px" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
              <span style={{ color: "var(--accent-teal)", background: "rgba(0, 242, 255, 0.05)", padding: "8px", borderRadius: "12px", border: "1px solid rgba(0, 242, 255, 0.1)" }}>
                <Sparkles size={24} />
              </span>
            </div>
            <h2 style={{ fontSize: "2.5rem", fontWeight: "800", fontFamily: "var(--font-display)", marginBottom: "12px" }}>Test Our AI Concierge Live</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem" }}>Interact with our enterprise real-time RAG engine directly from your browser.</p>
          </div>

          <InteractiveWebDemo />
        </div>
      </section>

      {/* 2.5 Case Studies & Benchmarks */}
      <section id="case-studies-cta" className="section-padding" style={{ borderTop: "1px solid var(--border-color)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "50px" }}>
            <h2 style={{ fontSize: "2.8rem", fontWeight: "800", fontFamily: "var(--font-display)", marginBottom: "15px" }}>How Reliability Is Built In</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", maxWidth: "800px", margin: "0 auto" }}>
              Every reply is grounded in your property's own data, and the system is designed to keep responding even when a provider goes down.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "25px", marginBottom: "50px" }}>
            <div className="glass" style={{ padding: "30px", borderRadius: "20px", textAlign: "center", background: "rgba(10, 10, 12, 0.4)" }}>
              <h4 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "8px" }}>Grounded, Brand-Safe Responses</h4>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>Answers are drawn strictly from your property's own verified knowledge base — the assistant is instructed to defer to your team rather than guess when information isn't there.</p>
            </div>
            <div className="glass" style={{ padding: "30px", borderRadius: "20px", textAlign: "center", background: "rgba(10, 10, 12, 0.4)" }}>
              <h4 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "8px" }}>Real-Time Guest Engagement</h4>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>Built on Next.js edge functions so guests get answers in the same conversation, not the next morning.</p>
            </div>
            <div className="glass" style={{ padding: "30px", borderRadius: "20px", textAlign: "center", background: "rgba(10, 10, 12, 0.4)" }}>
              <h4 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "8px" }}>Triple-Fallback Reliability</h4>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>If OpenAI is unavailable, the system automatically fails over to Gemini, then to a rules-based offline responder — guests get a reply instead of a dead chat.</p>
            </div>
          </div>

          <div style={{ textAlign: "center" }}>
            <a href="/case-studies" className="nav-btn" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "16px 32px", fontSize: "1.05rem" }}>
              Explore Case Studies & Demos <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* 3. Productized Services */}
      <section id="services" className="section-padding" style={{ borderTop: "1px solid var(--border-color)", background: "rgba(5, 5, 8, 0.4)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
             <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
              <span style={{ color: "var(--accent-green)", background: "rgba(57, 255, 20, 0.05)", padding: "8px", borderRadius: "12px", border: "1px solid rgba(57, 255, 20, 0.1)" }}>
                <Briefcase size={24} />
              </span>
            </div>
            <h2 style={{ fontSize: "2.8rem", fontWeight: "800", fontFamily: "var(--font-display)", marginBottom: "15px" }}>Bespoke Implementation Plans</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>Scale your direct booking conversions with our SLA-managed integrations.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "30px", alignItems: "stretch" }}>
            {/* Service 1 */}
            <div className="glass" style={{ padding: "40px 30px", borderRadius: "24px", borderTop: "4px solid var(--accent-teal)", display: "flex", flexDirection: "column", height: "100%" }}>
              <h3 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "10px" }}>Boutique Plan</h3>
              <p style={{ fontSize: "2rem", fontWeight: "800", marginBottom: "20px" }}>₹12,000 <span style={{fontSize: "1rem", fontWeight: "400", color: "var(--text-muted)"}}>/ month</span></p>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "15px" }}>+ ₹25,000 one-time setup fee</p>
              <p style={{ color: "var(--text-secondary)", marginBottom: "25px", flexGrow: 1 }}>One flat rate for any single-property luxury stay or boutique setup needing intelligent automated guest interactions on WhatsApp — a free 7-day trial included, regardless of nightly rate.</p>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 30px 0", color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                <li style={{ marginBottom: "10px", display: "flex", alignItems: "center", gap: "10px" }}><CheckCircle2 size={16} color="var(--accent-teal)"/> Brand-Safe FAQ & Booking Guard</li>
                <li style={{ marginBottom: "10px", display: "flex", alignItems: "center", gap: "10px" }}><CheckCircle2 size={16} color="var(--accent-teal)"/> 24/7 Guest Engagement on WhatsApp</li>
                <li style={{ marginBottom: "10px", display: "flex", alignItems: "center", gap: "10px" }}><CheckCircle2 size={16} color="var(--accent-teal)"/> Structured Lead Capture (Name, Dates, Contact Info)</li>
              </ul>
              <a href="#contact" className="nav-btn" style={{ display: "block", textAlign: "center", marginTop: "auto" }}>Get Started</a>
            </div>

            {/* Service 2 */}
            <div className="glass" style={{ padding: "40px 30px", borderRadius: "24px", borderTop: "4px solid var(--accent-violet)", display: "flex", flexDirection: "column", height: "100%" }}>
              <h3 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "10px" }}>Portfolio Plan</h3>
              <p style={{ fontSize: "2rem", fontWeight: "800", marginBottom: "20px" }}>₹45,000 <span style={{fontSize: "1rem", fontWeight: "400", color: "var(--text-muted)"}}>/ month</span></p>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "15px" }}>+ ₹100,000 Custom Setup Fee</p>
              <p style={{ color: "var(--text-secondary)", marginBottom: "25px", flexGrow: 1 }}>Designed for growing networks, multi-property vacation portfolios, and active hospitality groups requiring CRM pipelines.</p>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 30px 0", color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                <li style={{ marginBottom: "10px", display: "flex", alignItems: "center", gap: "10px" }}><CheckCircle2 size={16} color="var(--accent-violet)"/> Multi-Property Knowledge Base Routing</li>
                <li style={{ marginBottom: "10px", display: "flex", alignItems: "center", gap: "10px" }}><CheckCircle2 size={16} color="var(--accent-violet)"/> Zoho CRM Integration (other CRMs on request)</li>
                <li style={{ marginBottom: "10px", display: "flex", alignItems: "center", gap: "10px" }}><CheckCircle2 size={16} color="var(--accent-violet)"/> Custom Field Attribute Extraction</li>
              </ul>
              <a href="#contact" className="nav-btn" style={{ display: "block", textAlign: "center", marginTop: "auto" }}>Get Started</a>
            </div>

            {/* Service 3 */}
            <div className="glass" style={{ padding: "40px 30px", borderRadius: "24px", borderTop: "4px solid var(--text-muted)", display: "flex", flexDirection: "column", height: "100%" }}>
              <h3 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "10px" }}>Enterprise / Bespoke</h3>
              <p style={{ fontSize: "2rem", fontWeight: "800", marginBottom: "20px" }}>Custom SLA</p>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "15px" }}>Bespoke Architecture Pricing</p>
              <p style={{ color: "var(--text-secondary)", marginBottom: "25px", flexGrow: 1 }}>Custom RAG datasets, dedicated vector instances, custom telephony voice callers, and fully SLA-backed support contracts.</p>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 30px 0", color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                <li style={{ marginBottom: "10px", display: "flex", alignItems: "center", gap: "10px" }}><CheckCircle2 size={16} color="var(--text-muted)"/> Custom PMS & Booking Engine Integration (Built to Order)</li>
                <li style={{ marginBottom: "10px", display: "flex", alignItems: "center", gap: "10px" }}><CheckCircle2 size={16} color="var(--text-muted)"/> Encrypted, Per-Tenant Data Isolation</li>
                <li style={{ marginBottom: "10px", display: "flex", alignItems: "center", gap: "10px" }}><CheckCircle2 size={16} color="var(--text-muted)"/> Dedicated Vector Database Hosting (on request)</li>
              </ul>
              <a href="#contact" className="nav-btn" style={{ display: "block", textAlign: "center", marginTop: "auto", background: "var(--bg-card)", border: "1px solid var(--border-color)" }}>Request Quote</a>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Contact / Work With Me Section */}
      <section id="contact" className="section-padding" style={{ borderTop: "1px solid var(--border-color)", background: "rgba(5, 5, 8, 0.4)" }}>
        <div className="container" style={{ maxWidth: "1000px" }}>
          
          <div style={{ textAlign: "center", marginBottom: "50px" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
              <span style={{ color: "var(--accent-teal)", background: "rgba(0,242,255,0.05)", padding: "8px", borderRadius: "12px", border: "1px solid rgba(0,242,255,0.1)" }}>
                <Calendar size={24} />
              </span>
            </div>
            <h2 style={{ fontSize: "2.8rem", fontWeight: "800", fontFamily: "var(--font-display)", marginBottom: "15px" }}>Schedule a 15-Min Consultation</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>Discuss integrating the AI Concierge with your current booking engine and CRM.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "40px", alignItems: "start" }}>
            
            {/* Calendly Column */}
            <div className="glass-panel" style={{ padding: "0", background: "rgba(15, 15, 20, 0.6)", height: "700px", overflow: "hidden", border: "1px solid var(--border-color)" }}>
              <iframe 
                src="https://calendly.com/nishithmanu/30min?hide_event_type_details=1&hide_gdpr_banner=1" 
                width="100%" 
                height="100%" 
                frameBorder="0"
                style={{ border: "none" }}
              ></iframe>
            </div>

            {/* Email Form Column */}
            <div className="glass-panel" style={{ padding: "40px", background: "rgba(15, 15, 20, 0.6)" }}>
              <h3 style={{ marginBottom: "20px", fontSize: "1.4rem", fontWeight: "700", fontFamily: "var(--font-display)" }}>Send an Inquiry</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "30px", lineHeight: "1.6" }}>
                Send a direct message regarding your specific property PMS/CRM integrations, custom policies, or setup timelines.
              </p>
              <ContactForm />
            </div>

          </div>

        </div>
      </section>

    </div>
  );
}
