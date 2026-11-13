import { BUSINESS } from "../../../lib/business-info";

// Customer-facing notice for anyone chatting with an AI agent that ScienceThoughts builds and runs
// (a client's website or WhatsApp, or the demos on this site). Every agent links here in its first
// message. Keep section 5 in step with the code: session TTL (24h) in app/api/whatsapp-demo/route.js,
// escalations (14 days), owner-takeover marker (12h, lib/coexistence.js), web rate limit (24h).
export const metadata = {
  title: "Customer Data Notice — ScienceThoughts",
  description: "How ScienceThoughts AI chat agents handle the information you share on a business's website or WhatsApp.",
};

const sectionStyle = { marginTop: "36px" };
const headingStyle = { fontSize: "1.3rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "12px", fontFamily: "var(--font-display)" };
const pStyle = { color: "var(--text-secondary)", lineHeight: "1.7", marginBottom: "14px", fontSize: "1rem" };
const liStyle = { color: "var(--text-secondary)", lineHeight: "1.7", marginBottom: "10px" };
const linkStyle = { color: "var(--accent-teal)" };
const strong = { color: "var(--text-primary)" };
const cell = { borderBottom: "1px solid var(--border-color)", padding: "10px 12px", color: "var(--text-secondary)", verticalAlign: "top", lineHeight: "1.6" };
const headCell = { ...cell, color: "var(--text-primary)", fontWeight: 700, textAlign: "left" };

const RETENTION = [
  ["Chat history on WhatsApp (used to keep the conversation going)", "Deleted 24 hours after your last message"],
  ["Website chat", "Your browser holds the conversation; we do not keep it after replying, except the records below"],
  ["Enquiry record (your details and the conversation, if you ask to be contacted or book)", "Kept while the business uses our service; deleted from our systems within 30 days after it stops"],
  ["A question the agent could not answer, with any contact details you gave", "Deleted automatically after 14 days"],
  ["Marker that staff have replied to you on WhatsApp (so the agent stays quiet)", "Deleted automatically after 12 hours"],
  ["Website chat: your IP address, counted for a daily anti-abuse limit", "Deleted automatically after 24 hours"],
  ["Copies held by the AI providers that generate replies", "Up to about 30 days, for security and abuse monitoring"],
];

export default function CustomerDataNotice() {
  return (
    <div style={{ background: "var(--bg-dark)", minHeight: "100vh" }}>
      <section style={{ padding: "120px 0 60px 0" }}>
        <div className="container" style={{ maxWidth: "780px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "2.4rem", fontWeight: "900", fontFamily: "var(--font-display)", color: "var(--text-primary)", marginBottom: "10px" }}>
            Customer Data Notice
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1rem", marginBottom: "10px" }}>
            How our AI chat agents handle the information you share
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "10px" }}>Last updated: 13 November 2026</p>

          <p style={pStyle}>
            This notice applies when you chat with an AI agent that {BUSINESS.name} builds and runs for a business, on that
            business&rsquo;s website or WhatsApp, and when you try one of the demo agents on sciencethoughts.com. Read it
            alongside the privacy policy of the business you are contacting.
          </p>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>1. Who is responsible</h2>
            <p style={pStyle}>
              The business you are contacting decides how your information is used and is responsible for it (it is the
              &ldquo;data fiduciary&rdquo; under India&rsquo;s Digital Personal Data Protection Act, 2023, and the
              &ldquo;controller&rdquo; under the UK or EU GDPR where they apply). {BUSINESS.name} ({BUSINESS.owner}, sole
              proprietor, {BUSINESS.location}) runs the agent and processes your information only on the business&rsquo;s
              behalf. For the demos on this site, {BUSINESS.name} is responsible.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>2. What is collected</h2>
            <ul style={{ paddingLeft: "20px", marginBottom: "14px" }}>
              <li style={liStyle}>What you choose to type: your questions and, if you share them, your name, phone number, email address, preferred dates or times, and details of what you need.</li>
              <li style={liStyle}>On WhatsApp: the number you message from and the time of the conversation.</li>
              <li style={liStyle}>On a website: your IP address, used only to apply a daily limit that stops automated abuse.</li>
            </ul>
            <p style={pStyle}>
              The agent does not ask for payment details, card numbers, government ID numbers, health information or other
              sensitive information. Please do not share them in the chat.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>3. Why it is used</h2>
            <ul style={{ paddingLeft: "20px", marginBottom: "14px" }}>
              <li style={liStyle}>To answer your question straight away, from the business&rsquo;s own information.</li>
              <li style={liStyle}>To pass your enquiry, or a question the agent cannot answer, to the business&rsquo;s team so a person can reply.</li>
              <li style={liStyle}>To check and improve the accuracy of that business&rsquo;s agent.</li>
            </ul>
            <p style={pStyle}>
              The business&rsquo;s reason for using your information is to respond to your request; under the UK or EU
              GDPR this is normally its legitimate interest or steps you ask for before a contract.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>4. Where it goes</h2>
            <ul style={{ paddingLeft: "20px", marginBottom: "14px" }}>
              <li style={liStyle}><strong style={strong}>To generate a reply:</strong> the conversation text is sent to OpenAI, or to Google (Gemini) if OpenAI is unavailable. Under their API terms, this content is not used to train their models. If both are unavailable, a simple pre-written reply is used instead.</li>
              <li style={liStyle}><strong style={strong}>Enquiries:</strong> sent to the business, usually as a row in its Google Sheet or a record in its CRM, through an automation service.</li>
              <li style={liStyle}><strong style={strong}>Hosting:</strong> our systems run on cloud hosting and an encrypted cloud database. WhatsApp messages also pass through Meta, WhatsApp&rsquo;s owner.</li>
              <li style={liStyle}><strong style={strong}>Never:</strong> your information is not sold, not shared with other businesses, and not used by {BUSINESS.name} to market to you.</li>
            </ul>
            <p style={pStyle}>
              <strong style={strong}>Outside your country:</strong> these services may process your information outside
              the country you are in, including in India and the United States. Where the UK or EU GDPR applies, such
              transfers rely on recognised safeguards, such as standard contractual clauses.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>5. How long it is kept</h2>
            <div style={{ overflowX: "auto", marginBottom: "14px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.95rem" }}>
                <thead>
                  <tr><th style={headCell}>Information</th><th style={headCell}>How long we keep it</th></tr>
                </thead>
                <tbody>
                  {RETENTION.map(([what, how]) => (
                    <tr key={what}><td style={cell}>{what}</td><td style={cell}>{how}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={pStyle}>
              Once an enquiry reaches the business&rsquo;s own sheet or systems, how long the business keeps it is set by
              its own policy. Our server logs do not record message text or full phone numbers.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>6. Security</h2>
            <p style={pStyle}>
              Messages travel over encrypted connections. Business credentials are stored encrypted, each business&rsquo;s
              data is kept separate, and access is limited to the people who run the service. If a breach affects your
              information, we tell the business promptly so it can meet its own duties.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>7. Children</h2>
            <p style={pStyle}>
              These chats are not meant for anyone under 18. If you believe a child has shared personal information through
              one, contact us (section 9) and it will be deleted.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>8. Your choices and rights</h2>
            <p style={pStyle}>
              You can ask questions without giving any contact details; they are needed only if you want the business to
              get back to you. Depending on where you live, you may have the right to access your information, correct it,
              have it erased, restrict or object to its use, receive a copy, withdraw consent, and nominate someone to act
              for you. In the UK or EU you may also complain to your data protection authority (in the UK, the
              Information Commissioner&rsquo;s Office).
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>9. Who to contact</h2>
            <ul style={{ paddingLeft: "20px", marginBottom: "14px" }}>
              <li style={liStyle}>For information the business already holds, contact that business directly.</li>
              <li style={liStyle}>For anything held in our systems, or for the demos on this site, email <a href={`mailto:${BUSINESS.email}`} style={linkStyle}>{BUSINESS.email}</a>. We pass requests about a business&rsquo;s customers to that business and help it respond.</li>
            </ul>
            <p style={pStyle}>
              Requests and grievances are acknowledged and answered within 30 days. The person responsible is
              {" "}{BUSINESS.owner}, at <a href={`mailto:${BUSINESS.email}`} style={linkStyle}>{BUSINESS.email}</a>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
