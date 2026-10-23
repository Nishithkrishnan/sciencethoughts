import { BUSINESS } from "../../../lib/business-info";

export const metadata = {
  title: "Contact — Sciencethoughts",
  description: "Contact Sciencethoughts about the AI WhatsApp concierge for hotels, resorts and villas.",
};

const labelStyle = { color: "var(--text-muted)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" };
const valueStyle = { color: "var(--text-primary)", fontSize: "1.05rem", lineHeight: "1.6" };
const linkStyle = { color: "var(--accent-teal)" };
const rowStyle = { display: "grid", gap: "2px", padding: "18px 0", borderTop: "1px solid var(--border-color)" };

export default function ContactPage() {
  return (
    <div style={{ background: "var(--bg-dark)", minHeight: "100vh" }}>
      <section style={{ padding: "120px 0 60px 0" }}>
        <div className="container" style={{ maxWidth: "780px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "2.4rem", fontWeight: "900", fontFamily: "var(--font-display)", color: "var(--text-primary)", marginBottom: "10px" }}>
            Contact
          </h1>
          <p style={{ color: "var(--text-secondary)", lineHeight: "1.7", marginBottom: "28px", fontSize: "1.05rem" }}>
            Questions about the AI concierge, a trial for your property, or an existing account: email is the quickest
            way to reach us, or call during business hours.
          </p>

          <div style={rowStyle}>
            <div style={labelStyle}>Email</div>
            <div style={valueStyle}><a href={`mailto:${BUSINESS.email}`} style={linkStyle}>{BUSINESS.email}</a></div>
          </div>
          <div style={rowStyle}>
            <div style={labelStyle}>Phone</div>
            <div style={valueStyle}>{BUSINESS.phone}</div>
          </div>
          <div style={rowStyle}>
            <div style={labelStyle}>Book a call</div>
            <div style={valueStyle}><a href={BUSINESS.callLink} style={linkStyle} target="_blank" rel="noopener noreferrer">30-minute call (Calendly)</a></div>
          </div>
          <div style={rowStyle}>
            <div style={labelStyle}>Business</div>
            <div style={valueStyle}>
              {BUSINESS.name}, run by {BUSINESS.owner} as a {BUSINESS.legalForm}<br />
              Udyam-registered micro enterprise: {BUSINESS.udyam}
            </div>
          </div>
          <div style={rowStyle}>
            <div style={labelStyle}>Location</div>
            <div style={valueStyle}>{BUSINESS.location}</div>
          </div>
          <div style={{ ...rowStyle, borderBottom: "1px solid var(--border-color)" }}>
            <div style={labelStyle}>Policies</div>
            <div style={valueStyle}>
              <a href="/terms-of-service" style={linkStyle}>Terms of Service</a> &middot;{" "}
              <a href="/privacy-policy" style={linkStyle}>Privacy Policy</a> &middot;{" "}
              <a href="/client-terms" style={linkStyle}>Client Service Terms</a> &middot;{" "}
              <a href="/refund-policy" style={linkStyle}>Cancellation &amp; Refund Policy</a> &middot;{" "}
              <a href="/data-notice" style={linkStyle}>Guest Data Notice</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
