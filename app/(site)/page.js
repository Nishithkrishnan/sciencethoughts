import SearchInput from "../../components/SearchInput";
import ContactForm from "../../components/ContactForm";
import InteractiveWebDemo from "../../components/InteractiveWebDemo";
import { Briefcase, Sparkles, ArrowRight, Activity, Calendar, CheckCircle2, Globe, Users, MessageCircle, ShieldCheck } from "lucide-react";

// Home page for the business model set on 10 Nov 2026 (see the project doc "ScienceThoughts:
// Business Overview"): AI chat agents for any business that takes enquiries, website first,
// sold directly and through agencies. Prices are deliberately not shown yet; every offer routes
// to a call. Claims here must stay true: no clients, results or integrations we don't have.

const offers = [
  {
    id: "website",
    name: "Website agent",
    who: "For small businesses: clinics, home services, coaching centres, stays and more",
    desc: "An agent on your website that answers customers at any hour from your own prices, policies and details, and sends every enquiry to you.",
    points: ["Live on your website in about four days", "Enquiries delivered to your Google Sheet or CRM", "Updates to its information within 2 working days"],
    icon: <Globe size={24} />,
    color: "var(--accent-teal)",
  },
  {
    id: "white-label",
    name: "White-label agent",
    who: "For marketing and web agencies",
    desc: "Your clients ask for an AI chatbot and you have nobody to build one. We build and run an agent for each client, sold under your brand and your price.",
    points: ["Your brand, your client relationship", "We build, host and maintain it in the background", "Your first client is a free 14-day pilot"],
    icon: <Users size={24} />,
    color: "var(--accent-violet)",
  },
  {
    id: "whatsapp",
    name: "WhatsApp upgrade",
    who: "For businesses whose customers message on WhatsApp",
    desc: "The same agent on your own WhatsApp number, answering customers where they already message you and handing chats to your team when needed.",
    points: ["Works on your own WhatsApp number", "Same information, same rules as your website agent", "Needs Meta to verify your business, which can take several days"],
    icon: <MessageCircle size={24} />,
    color: "var(--accent-green)",
  },
  {
    id: "audit",
    name: "Chatbot audit",
    who: "For teams that already run a chatbot",
    desc: "A fixed-price test of your existing chatbot against a set of real customer questions, with a report of where it gives wrong or made-up answers.",
    points: ["A test set built from your real questions", "A clear failure report", "Fixed price, agreed up front"],
    icon: <ShieldCheck size={24} />,
    color: "var(--accent-teal)",
  },
];

const basics = [
  "Answers only from your own prices, policies and details",
  "Says so when it doesn't know, and alerts your team",
  "Records every enquiry with the full conversation",
  "Tested against real customer questions before it goes live",
];

const h2 = { fontSize: "2.8rem", fontWeight: "800", fontFamily: "var(--font-display)", marginBottom: "15px" };
const iconWrap = (color) => ({ color, background: "rgba(255,255,255,0.03)", padding: "8px", borderRadius: "12px", border: "1px solid var(--border-color)" });

export default async function Home() {
  return (
    <div style={{ background: "var(--bg-dark)" }}>

      {/* 1. Hero */}
      <section style={{ padding: "140px 0 100px 0", position: "relative", overflow: "hidden" }}>
        <div className="container" style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", padding: "8px 18px", borderRadius: "30px", marginBottom: "25px", animation: "slideUp 0.6s ease-out" }}>
            <Activity size={14} className="animate-pulse-glow" style={{ color: "var(--accent-teal)" }} />
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "500", letterSpacing: "0.05em" }}>AI CHAT AGENTS, BUILT AND RUN FOR YOU</span>
          </div>

          <h1 style={{ fontSize: "4.2rem", fontWeight: "900", fontFamily: "var(--font-display)", letterSpacing: "-0.03em", lineHeight: "1.1", marginBottom: "25px", animation: "slideUp 0.8s ease-out" }}>
            An AI agent that answers your customers <span className="gradient-text">from your own information</span>
          </h1>

          <p style={{ fontSize: "1.3rem", color: "var(--text-secondary)", maxWidth: "800px", margin: "0 auto 45px auto", lineHeight: "1.6", fontWeight: "400", animation: "slideUp 1s ease-out" }}>
            We build, host and maintain AI chat agents for your website and WhatsApp. They answer at any hour, say so when they don&rsquo;t know, and send every enquiry to your team. No technical staff or new software needed.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "20px", alignItems: "center", flexWrap: "wrap", animation: "slideUp 1.2s ease-out" }}>
            <a href="/case-studies" className="nav-btn" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "16px 32px", fontSize: "1.05rem" }}>
              Try the live demos <ArrowRight size={18} />
            </a>
            <a href="#contact" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "16px 24px", fontSize: "1.05rem", color: "#fff", border: "1px solid var(--border-color)", borderRadius: "999px" }}>
              Book a 30-minute call
            </a>
            <SearchInput />
          </div>
        </div>
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.01) 1px, transparent 1px)", backgroundSize: "40px 40px", maskImage: "radial-gradient(circle at 50% 50%, black, transparent 80%)", pointerEvents: "none" }}></div>
      </section>

      {/* 1.5 What every agent does */}
      <section style={{ padding: "40px 0", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(5, 5, 8, 0.4)" }}>
        <div className="container">
          <p style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "20px" }}>What every agent does</p>
          <div style={{ display: "flex", justifyContent: "center", gap: "28px", flexWrap: "wrap" }}>
            {basics.map((b) => (
              <span key={b} style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                <CheckCircle2 size={16} color="var(--accent-teal)" /> {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Offers */}
      <section id="services" className="section-padding" style={{ borderTop: "1px solid var(--border-color)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
              <span style={iconWrap("var(--accent-green)")}><Briefcase size={24} /></span>
            </div>
            <h2 style={h2}>What we offer</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", maxWidth: "760px", margin: "0 auto" }}>
              Every agent comes with a one-time setup and a monthly fee for hosting, monitoring and updates. Monthly plans are month to month. Pricing depends on what you need, so we share it on a short call.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "26px", alignItems: "stretch" }}>
            {offers.map((o) => (
              <div key={o.id} className="glass" style={{ padding: "32px 26px", borderRadius: "24px", borderTop: `4px solid ${o.color}`, display: "flex", flexDirection: "column", height: "100%", background: "rgba(10, 10, 12, 0.4)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "48px", height: "48px", borderRadius: "12px", background: "rgba(255,255,255,0.04)", color: o.color, marginBottom: "18px" }}>{o.icon}</div>
                <h3 style={{ fontSize: "1.4rem", fontWeight: "700", marginBottom: "6px", fontFamily: "var(--font-display)" }}>{o.name}</h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "14px" }}>{o.who}</p>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.6", marginBottom: "18px", flexGrow: 1 }}>{o.desc}</p>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px 0", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                  {o.points.map((pt) => (
                    <li key={pt} style={{ marginBottom: "9px", display: "flex", alignItems: "flex-start", gap: "9px" }}><CheckCircle2 size={16} color={o.color} style={{ flexShrink: 0, marginTop: "3px" }} /> {pt}</li>
                  ))}
                </ul>
                <a href="#contact" className="nav-btn" style={{ display: "block", textAlign: "center", marginTop: "auto" }}>Ask about pricing</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Live demo */}
      <section id="live-demo" className="section-padding" style={{ borderTop: "1px solid var(--border-color)", background: "rgba(10, 15, 25, 0.4)" }}>
        <div className="container" style={{ maxWidth: "900px" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
              <span style={iconWrap("var(--accent-teal)")}><Sparkles size={24} /></span>
            </div>
            <h2 style={{ ...h2, fontSize: "2.5rem", marginBottom: "12px" }}>Try an agent now</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem" }}>
              Chat with a demo agent for one of three fictional businesses. Ask what a customer would ask, including something it shouldn&rsquo;t know.
            </p>
          </div>
          <InteractiveWebDemo />
        </div>
      </section>

      {/* 5. Reliability */}
      <section id="reliability" className="section-padding" style={{ borderTop: "1px solid var(--border-color)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "50px" }}>
            <h2 style={h2}>Built not to make things up</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", maxWidth: "800px", margin: "0 auto" }}>
              A wrong answer about your price or policy, in writing, is worse than no answer. Every agent is built around that.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "25px", marginBottom: "50px" }}>
            <div className="glass" style={{ padding: "30px", borderRadius: "20px", textAlign: "center", background: "rgba(10, 10, 12, 0.4)" }}>
              <h4 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "8px" }}>Only your information</h4>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>Answers come only from the details you give us. When something isn&rsquo;t there, the agent says it will check with your team, and your team is alerted.</p>
            </div>
            <div className="glass" style={{ padding: "30px", borderRadius: "20px", textAlign: "center", background: "rgba(10, 10, 12, 0.4)" }}>
              <h4 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "8px" }}>Tested before it goes live</h4>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>Each agent is checked against a set of your real customer questions, including ones it should refuse or pass to a person.</p>
            </div>
            <div className="glass" style={{ padding: "30px", borderRadius: "20px", textAlign: "center", background: "rgba(10, 10, 12, 0.4)" }}>
              <h4 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "8px" }}>Keeps replying if a provider fails</h4>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>If the main AI provider is down, the agent switches to a second one, then to a simple rules-based reply, so customers aren&rsquo;t left with a dead chat.</p>
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <a href="/case-studies" className="nav-btn" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "16px 32px", fontSize: "1.05rem" }}>
              See all three demos <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* 6. Contact */}
      <section id="contact" className="section-padding" style={{ borderTop: "1px solid var(--border-color)", background: "rgba(5, 5, 8, 0.4)" }}>
        <div className="container" style={{ maxWidth: "1000px" }}>
          <div style={{ textAlign: "center", marginBottom: "50px" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
              <span style={iconWrap("var(--accent-teal)")}><Calendar size={24} /></span>
            </div>
            <h2 style={h2}>Book a 30-minute call</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>Tell us about your business, or your agency&rsquo;s clients, and we&rsquo;ll show you what an agent would do and what it costs.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "40px", alignItems: "start" }}>
            <div className="glass-panel" style={{ padding: "0", background: "rgba(15, 15, 20, 0.6)", height: "700px", overflow: "hidden", border: "1px solid var(--border-color)" }}>
              <iframe
                src="https://calendly.com/nishithmanu/30min?hide_event_type_details=1&hide_gdpr_banner=1"
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: "none" }}
                title="Book a call"
              ></iframe>
            </div>
            <div className="glass-panel" style={{ padding: "40px", background: "rgba(15, 15, 20, 0.6)" }}>
              <h3 style={{ marginBottom: "20px", fontSize: "1.4rem", fontWeight: "700", fontFamily: "var(--font-display)" }}>Send an enquiry</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "30px", lineHeight: "1.6" }}>
                Tell us what your customers usually ask, where they reach you (website, WhatsApp or both), and whether you&rsquo;re an agency asking for a client.
              </p>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
