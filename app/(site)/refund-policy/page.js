import { BUSINESS } from "../../../lib/business-info";

export const metadata = {
  title: "Cancellation & Refund Policy — Sciencethoughts",
  description: "Fees, cancellation and refunds for ScienceThoughts AI chat agents, white-label agents and chatbot audits.",
};

const sectionStyle = { marginTop: "36px" };
const headingStyle = { fontSize: "1.3rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "12px", fontFamily: "var(--font-display)" };
const pStyle = { color: "var(--text-secondary)", lineHeight: "1.7", marginBottom: "14px", fontSize: "1rem" };
const liStyle = { color: "var(--text-secondary)", lineHeight: "1.7", marginBottom: "10px" };
const linkStyle = { color: "var(--accent-teal)" };

export default function RefundPolicy() {
  return (
    <div style={{ background: "var(--bg-dark)", minHeight: "100vh" }}>
      <section style={{ padding: "120px 0 60px 0" }}>
        <div className="container" style={{ maxWidth: "780px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "2.4rem", fontWeight: "900", fontFamily: "var(--font-display)", color: "var(--text-primary)", marginBottom: "10px" }}>
            Cancellation &amp; Refund Policy
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "10px" }}>Last updated: 13 November 2026</p>

          <p style={pStyle}>
            This policy covers the paid {BUSINESS.name} services: AI chat agents for websites and WhatsApp, white-label agents
            for agencies, and chatbot audits. {BUSINESS.name} is run by {BUSINESS.owner} as a {BUSINESS.legalForm}, registered
            as a micro enterprise under Udyam ({BUSINESS.udyam}). Each client also accepts our{" "}
            <a href="/client-terms" style={linkStyle}>Client Service Terms</a>; if anything here differs from those terms,
            the Client Service Terms apply.
          </p>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>1. Fees</h2>
            <ul style={{ paddingLeft: "20px", marginBottom: "14px" }}>
              <li style={liStyle}>Your fees are set out in our written quote: a one-time setup fee for each agent and a monthly fee for hosting, monitoring and updates. An audit has one fixed fee.</li>
              <li style={liStyle}>Setup and audit fees are paid 50% before work starts and 50% at go-live (or when the audit report is delivered).</li>
              <li style={liStyle}>The monthly fee is charged in advance, on the same date each month as your go-live date.</li>
              <li style={liStyle}>For agencies, the first client&rsquo;s agent is a free 14-day pilot.</li>
              <li style={liStyle}>{BUSINESS.name} is not currently registered for GST, so no GST is added. Business clients may deduct tax at source where the law requires it.</li>
            </ul>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>2. Cancelling</h2>
            <p style={pStyle}>
              There is no minimum term. Either side can cancel by email at least 7 days before the next monthly charge, sent to{" "}
              <a href={`mailto:${BUSINESS.email}`} style={linkStyle}>{BUSINESS.email}</a>. The service ends at the end of the
              month already paid for, and nothing more is charged.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>3. Refunds</h2>
            <ul style={{ paddingLeft: "20px", marginBottom: "14px" }}>
              <li style={liStyle}><strong>If we can&rsquo;t deliver:</strong> if we cannot deliver your agent or audit, we refund everything you paid for it.</li>
              <li style={liStyle}><strong>If you cancel a build:</strong> after work has started and before go-live, the first 50% of the setup fee is not refunded, and the second 50% is not charged.</li>
              <li style={liStyle}><strong>Monthly fee:</strong> a month already paid for is not refunded, with one exception below.</li>
              <li style={liStyle}><strong>If the agent costs you a sale:</strong> if a reply from the agent contradicts the information you gave us and a customer documents that they did not buy or book because of it, we refund that month&rsquo;s fee.</li>
            </ul>
            <p style={pStyle}>
              To ask for a refund, email <a href={`mailto:${BUSINESS.email}`} style={linkStyle}>{BUSINESS.email}</a> with
              your business name and the reason. Approved refunds go back to the original payment method. We start them
              within 7 working days of approval; your bank or marketplace may take longer.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>4. How the service is delivered</h2>
            <p style={pStyle}>
              Everything is delivered online; nothing is shipped. A website agent goes live when one line of code is added
              to your website, usually about four days after you send us your information. The WhatsApp upgrade needs
              Meta (WhatsApp&rsquo;s owner) to verify your business first, which usually takes a few days.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>5. Contact</h2>
            <p style={pStyle}>
              Questions about this policy: <a href={`mailto:${BUSINESS.email}`} style={linkStyle}>{BUSINESS.email}</a>.
              See also our <a href="/terms-of-service" style={linkStyle}>Terms of Service</a> and{" "}
              <a href="/privacy-policy" style={linkStyle}>Privacy Policy</a>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
