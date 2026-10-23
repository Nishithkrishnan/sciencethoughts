import { BUSINESS } from "../../../lib/business-info";

export const metadata = {
  title: "Cancellation & Refund Policy — Sciencethoughts",
  description: "Free trial, fees, cancellation and refunds for the Sciencethoughts AI WhatsApp concierge.",
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
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "10px" }}>Last updated: 23 October 2026</p>

          <p style={pStyle}>
            This policy covers the paid {BUSINESS.name} AI WhatsApp concierge. {BUSINESS.name} is run by {BUSINESS.owner} as
            a {BUSINESS.legalForm}, registered as a micro enterprise under Udyam ({BUSINESS.udyam}). Each client also signs a
            service agreement; if anything here differs from your signed agreement, the agreement applies.
          </p>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>1. Free 7-day trial</h2>
            <p style={pStyle}>
              Every property starts with a free 7-day trial on its own WhatsApp number. No payment is taken to start,
              and you can stop at any time during the trial at no cost. If you decide not to continue, the assistant is
              switched off at the end of the trial and nothing is charged.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>2. Fees</h2>
            <ul style={{ paddingLeft: "20px", marginBottom: "14px" }}>
              <li style={liStyle}>One property (a villa, resort, hotel or homestay): ₹9,999 one-time setup fee, then ₹4,999 per month.</li>
              <li style={liStyle}>Several properties: pricing agreed in writing before you start.</li>
              <li style={liStyle}>The monthly fee is billed between the 1st and 5th of each month.</li>
              <li style={liStyle}>{BUSINESS.name} is not currently registered for GST, so no GST is added. Business clients may deduct TDS where the law requires it.</li>
            </ul>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>3. Cancelling</h2>
            <p style={pStyle}>
              After the trial, the service runs for a minimum of 6 months from the day your assistant goes live. After
              that, either side can cancel with one month&rsquo;s written notice, sent by email to{" "}
              <a href={`mailto:${BUSINESS.email}`} style={linkStyle}>{BUSINESS.email}</a>.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>4. Refunds</h2>
            <ul style={{ paddingLeft: "20px", marginBottom: "14px" }}>
              <li style={liStyle}><strong>Setup fee:</strong> refunded in full if you cancel before your assistant goes live on your number. Once it is live, the setup fee is not refundable.</li>
              <li style={liStyle}><strong>Monthly fee:</strong> a month that has already started is not refunded, with one exception below.</li>
              <li style={liStyle}><strong>If the assistant costs you a booking:</strong> if a reply from the assistant contradicts the information you gave us and a guest documents that they did not book because of it, we refund that month&rsquo;s fee.</li>
            </ul>
            <p style={pStyle}>
              To ask for a refund, email <a href={`mailto:${BUSINESS.email}`} style={linkStyle}>{BUSINESS.email}</a> with
              your property name and the reason. Approved refunds go back to the original payment method. We start them
              within 7 working days of approval; your bank may take a further 5&ndash;7 working days.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>5. How the service is delivered</h2>
            <p style={pStyle}>
              The service is delivered online; nothing is shipped. You connect your WhatsApp number through our setup
              link, and the assistant goes live once Meta (WhatsApp&rsquo;s owner) has approved your business. Meta&rsquo;s
              review usually takes a few days.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>6. Contact</h2>
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
