export const metadata = {
  title: "Terms of Service — Sciencethoughts",
  description: "Terms for using the sciencethoughts.com website and its live AI concierge demo.",
};

const sectionStyle = { marginTop: "36px" };
const headingStyle = { fontSize: "1.3rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "12px", fontFamily: "var(--font-display)" };
const pStyle = { color: "var(--text-secondary)", lineHeight: "1.7", marginBottom: "14px", fontSize: "1rem" };
const liStyle = { color: "var(--text-secondary)", lineHeight: "1.7", marginBottom: "10px" };
const linkStyle = { color: "var(--accent-teal)" };

export default function TermsOfService() {
  return (
    <div style={{ background: "var(--bg-dark)", minHeight: "100vh" }}>
      <section style={{ padding: "120px 0 60px 0" }}>
        <div className="container" style={{ maxWidth: "780px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "2.4rem", fontWeight: "900", fontFamily: "var(--font-display)", color: "var(--text-primary)", marginBottom: "10px" }}>
            Terms of Service
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "10px" }}>Last updated: 6 September 2026</p>

          <p style={pStyle}>
            These terms cover your use of sciencethoughts.com — the marketing site and its live demo — and are
            separate from the terms of any actual paid engagement. Sciencethoughts is operated by Nishith Krishnan,
            trading as Sciencethoughts, an individual/sole proprietor based in India, not a registered company, LLP,
            or partnership.
          </p>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>1. What this site is</h2>
            <p style={pStyle}>
              This site describes and demonstrates an AI WhatsApp/web concierge product for independent hospitality
              properties. By using it, including the live demo, you agree to these terms.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>2. The live demo is a demonstration, not a real booking channel</h2>
            <ul style={{ paddingLeft: "20px", marginBottom: "14px" }}>
              <li style={liStyle}>Anything you ask the demo AI is answered from that demo property&rsquo;s sample knowledge base for illustration purposes. No booking, reservation, or payment made through the demo is real.</li>
              <li style={liStyle}>The AI can make mistakes. It is designed to defer rather than guess when it lacks grounded information, but it is not guaranteed error-free — do not rely on a demo response as fact about any actual property.</li>
              <li style={liStyle}>How your demo conversation is processed and retained is described in the <a href="/data-notice" style={linkStyle}>Guest Data Notice</a> and the <a href="/privacy-policy" style={linkStyle}>Privacy Policy</a>.</li>
            </ul>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>3. Acceptable use</h2>
            <p style={pStyle}>Please don&rsquo;t use this site or the demo to:</p>
            <ul style={{ paddingLeft: "20px", marginBottom: "14px" }}>
              <li style={liStyle}>Submit unlawful, abusive, or fraudulent content.</li>
              <li style={liStyle}>Attempt to overload, disrupt, or automate excessive requests against the demo or the site.</li>
              <li style={liStyle}>Attempt to extract the underlying system prompts, credentials, or another property&rsquo;s data through the demo.</li>
              <li style={liStyle}>Submit anyone else&rsquo;s personal information without their knowledge, through the contact form or the demo.</li>
            </ul>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>4. If you become a paying client</h2>
            <p style={pStyle}>
              These website terms do not govern an actual paid engagement. If a property signs up as a client, that
              relationship — scope of work, fees, data handling, term, cancellation, liability — is governed
              exclusively by the separate, signed Pilot Service Agreement between Sciencethoughts and that property,
              not by this page.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>5. Intellectual property</h2>
            <p style={pStyle}>
              The site&rsquo;s content, design, and the underlying Sciencethoughts platform are owned by Nishith
              Krishnan. Property names, logos, and content shown in case studies or demos belong to their respective
              owners and are used for illustration of the product, not to claim an affiliation beyond what is stated.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>6. No warranty, limitation of liability</h2>
            <p style={pStyle}>
              This site and its demo are provided &ldquo;as is,&rdquo; without warranty of any kind, for evaluation
              purposes. To the extent permitted by law, Sciencethoughts is not liable for any loss arising from your
              use of this website or its demo. This does not limit any liability terms agreed separately in a signed
              client agreement.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>7. Governing law</h2>
            <p style={pStyle}>
              These terms are governed by the laws of India. Any dispute arising from use of this website is subject
              to the exclusive jurisdiction of the courts of Chennai, Tamil Nadu.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>8. Changes to these terms</h2>
            <p style={pStyle}>
              These terms may be updated as the site and product change. The &ldquo;last updated&rdquo; date at the
              top of this page reflects the most recent revision. Continued use of the site after a change means you
              accept the updated terms.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>9. Contact</h2>
            <p style={pStyle}>
              Questions about these terms: <a href="mailto:nishithmanu@gmail.com" style={linkStyle}>nishithmanu@gmail.com</a>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
