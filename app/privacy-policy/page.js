export const metadata = {
  title: "Privacy Policy — Sciencethoughts",
  description: "How Sciencethoughts collects and uses information from visitors to this website.",
};

const sectionStyle = { marginTop: "36px" };
const headingStyle = { fontSize: "1.3rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "12px", fontFamily: "var(--font-display)" };
const pStyle = { color: "var(--text-secondary)", lineHeight: "1.7", marginBottom: "14px", fontSize: "1rem" };
const liStyle = { color: "var(--text-secondary)", lineHeight: "1.7", marginBottom: "10px" };
const linkStyle = { color: "var(--accent-teal)" };

export default function PrivacyPolicy() {
  return (
    <div style={{ background: "var(--bg-dark)", minHeight: "100vh" }}>
      <section style={{ padding: "120px 0 60px 0" }}>
        <div className="container" style={{ maxWidth: "780px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "2.4rem", fontWeight: "900", fontFamily: "var(--font-display)", color: "var(--text-primary)", marginBottom: "10px" }}>
            Privacy Policy
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "10px" }}>Last updated: 6 September 2026</p>

          <p style={pStyle}>
            This policy covers sciencethoughts.com itself — the marketing site, the live demo widget, and the
            contact/booking tools on it. Sciencethoughts is operated by Nishith Krishnan, trading as Sciencethoughts,
            an individual/sole proprietor based in India — not a registered company.
          </p>
          <p style={pStyle}>
            If you are a guest of a property that uses the Sciencethoughts AI concierge on its own WhatsApp number,
            that is covered by a separate, more specific document: the{" "}
            <a href="/data-notice" style={linkStyle}>Guest Data Notice</a>. This policy is about people visiting this
            website, not guests messaging a client property.
          </p>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>1. What is collected</h2>
            <ul style={{ paddingLeft: "20px", marginBottom: "14px" }}>
              <li style={liStyle}><strong style={{ color: "var(--text-primary)" }}>Contact form:</strong> if you use the contact form on this site, we collect your name, email address, the scope you select, and your message.</li>
              <li style={liStyle}><strong style={{ color: "var(--text-primary)" }}>Booking a call:</strong> the &ldquo;Schedule a Consultation&rdquo; option embeds Calendly. Calendly collects what you enter there directly, under its own privacy policy — Sciencethoughts only sees the appointment details Calendly passes on.</li>
              <li style={liStyle}><strong style={{ color: "var(--text-primary)" }}>The live demo widget:</strong> if you try the AI concierge demo on this site, whatever you type is processed the same way a real guest&rsquo;s message would be — see the <a href="/data-notice" style={linkStyle}>Guest Data Notice</a> for exactly how that works (which AI providers see it, how long it&rsquo;s kept). If you share your name and contact details while exploring the demo because you want to be contacted, that inquiry is treated as a genuine lead and passed on for follow-up, the same as it would be for a real property.</li>
              <li style={liStyle}><strong style={{ color: "var(--text-primary)" }}>Basic usage analytics:</strong> this site uses Vercel Analytics and Vercel Speed Insights, which measure aggregate traffic and page performance without setting tracking cookies or building an individual profile of you.</li>
            </ul>
            <p style={pStyle}>We do not ask for payment details, card numbers, or government ID numbers anywhere on this site.</p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>2. Why it is collected</h2>
            <ul style={{ paddingLeft: "20px", marginBottom: "14px" }}>
              <li style={liStyle}>To respond to your inquiry or booking request.</li>
              <li style={liStyle}>To let you evaluate the AI concierge product yourself, through the live demo.</li>
              <li style={liStyle}>To understand how the site is used, in aggregate, so it can be improved.</li>
            </ul>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>3. Where the information goes</h2>
            <ul style={{ paddingLeft: "20px", marginBottom: "14px" }}>
              <li style={liStyle}><strong style={{ color: "var(--text-primary)" }}>Contact form</strong> submissions are relayed by Web3Forms, a third-party form-processing service, straight to Nishith&rsquo;s own inbox. Web3Forms processes the submission in transit; Sciencethoughts does not maintain a separate contact-form database beyond that inbox.</li>
              <li style={liStyle}><strong style={{ color: "var(--text-primary)" }}>Calendly bookings</strong> are handled entirely by Calendly under its own privacy policy.</li>
              <li style={liStyle}><strong style={{ color: "var(--text-primary)" }}>Demo widget conversations</strong> are sent to OpenAI, and if unavailable, Google (Gemini), solely to generate a reply — see the <a href="/data-notice" style={linkStyle}>Guest Data Notice</a>, Section 3, for the detail on retention and processing location. A demo lead that shares contact details may also be logged to Sciencethoughts&rsquo; own CRM, the same as a real property inquiry would be.</li>
              <li style={liStyle}><strong style={{ color: "var(--text-primary)" }}>Analytics</strong> data stays within Vercel&rsquo;s aggregate reporting; it is not sold or shared for advertising.</li>
            </ul>
            <p style={pStyle}>We do not sell any of this information, and we do not use it to advertise to you elsewhere.</p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>4. Cookies</h2>
            <p style={pStyle}>
              This site does not set its own marketing or tracking cookies. The Calendly booking widget and the
              Vercel analytics scripts embedded on the site may set cookies or use similar technology of their own,
              governed by their respective policies, not this one.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>5. How long it is kept</h2>
            <p style={pStyle}>
              Contact-form messages are kept as long as needed to respond to you and for a reasonable record of the
              conversation afterward. Demo-widget conversation data follows the same retention described in the{" "}
              <a href="/data-notice" style={linkStyle}>Guest Data Notice</a>: live-reply text is not stored beyond
              the conversation itself, unanswered questions are kept 14 days, and a captured lead/inquiry is kept
              while there is an active conversation about your inquiry and deleted within 30 days after that ends.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>6. Your rights, and who to contact</h2>
            <p style={pStyle}>
              Under India&rsquo;s Digital Personal Data Protection Act, 2023, you may ask for access to information
              held about you, ask for it to be corrected or erased, or raise a grievance. Contact Sciencethoughts at{" "}
              <a href="mailto:nishithmanu@gmail.com" style={linkStyle}>nishithmanu@gmail.com</a>. Grievances are
              acknowledged and responded to within 30 days.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>7. Changes to this policy</h2>
            <p style={pStyle}>
              This policy may be updated as the site and product change. The &ldquo;last updated&rdquo; date at the
              top of this page reflects the most recent revision.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
