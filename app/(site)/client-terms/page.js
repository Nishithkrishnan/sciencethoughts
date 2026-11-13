import { BUSINESS } from "../../../lib/business-info";
import { CLIENT_TERMS } from "../../../lib/client-terms";

export const metadata = {
  title: "Client Service Terms — ScienceThoughts",
  description: "The terms every client accepts when it signs up for a ScienceThoughts AI chat agent, chatbot audit or white-label agent.",
};

const sectionStyle = { marginTop: "36px" };
const headingStyle = { fontSize: "1.3rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "12px", fontFamily: "var(--font-display)" };
const pStyle = { color: "var(--text-secondary)", lineHeight: "1.7", marginBottom: "12px", fontSize: "1rem" };
const liStyle = { color: "var(--text-secondary)", lineHeight: "1.7", marginBottom: "8px" };
const linkStyle = { color: "var(--accent-teal)" };
const summaryBox = { border: "1px solid var(--accent-teal)", borderRadius: "var(--radius-md)", padding: "18px 22px", marginTop: "24px" };

// Each clause is [number, text]. Keep the numbering stable: clients and emails may cite it.
// Version 2.0 replaced 1.0 (villas/resorts, 6-month minimum, fixed prices) on 13 Nov 2026.
const SECTIONS = [
  {
    title: "1. Who these terms are between",
    clauses: [
      ["1.1", `These Client Service Terms (the "Terms") are between ${BUSINESS.owner}, sole proprietor, trading as ${BUSINESS.name} (Udyam ${BUSINESS.udyam}, ${BUSINESS.location}, ${BUSINESS.email}, ${BUSINESS.phone}) ("${BUSINESS.name}", "we"), and the business that accepts them (the "Client", "you").`],
      ["1.2", "You accept these Terms by ticking the box on your onboarding page, or by confirming in writing (email is enough) a quote that refers to them. The person accepting confirms they are authorised to bind the Client. We keep a record of the date, the version of the Terms and the details you gave us."],
      ["1.3", "Where we sign a separate agreement with you, that agreement applies in place of these Terms."],
    ],
  },
  {
    title: "2. The services",
    clauses: [
      ["2.1", "Agent: we build, host and maintain an AI chat agent (the \"Agent\") that answers your customers on your website and, if you choose the WhatsApp upgrade, on your own WhatsApp number. It answers from the information you give us, says so when it does not know, alerts your team, and records each enquiry (the customer's details and the conversation) in a Google Sheet or CRM."],
      ["2.2", "Setup: you send us your website, your common customer questions and your price list or policies. We build and test the Agent, you review a private preview, and it goes live when you approve it (the \"Go-Live Date\")."],
      ["2.3", "Updates: changes to the Agent's information are included and made within 2 working days of your request. Support is by email and WhatsApp on working days (Monday to Saturday, 10:00 to 18:00 IST)."],
      ["2.4", "WhatsApp upgrade: this needs Meta (WhatsApp's owner) to verify your business and approve your display name. We guide you through it but cannot speed up or guarantee Meta's review."],
      ["2.5", "Chatbot audit: we test a chatbot you already run against a set of real customer questions and give you a written report of what it got wrong. An audit is a one-off service; sections 4.3 to 4.6 on monthly fees do not apply to it."],
      ["2.6", "The Agent does not take payments, confirm bookings, appointments or orders, or change your own systems. Those decisions stay with you."],
      ["2.7", "The services run on third-party providers: AI model providers, cloud hosting, Meta's WhatsApp Business Platform and the tools that deliver enquiries. We do not control them. An outage or policy change by one of them is not a breach of these Terms, but we will tell you promptly and work to restore the service."],
    ],
  },
  {
    title: "3. Agencies (white-label)",
    clauses: [
      ["3.1", "If you are an agency, you may sell Agents to your own customers (\"End Clients\") under your own brand and at your own prices. You are our Client; each End Client is your customer, not ours. We do not contact your End Clients unless you ask us to."],
      ["3.2", "You are responsible for your agreement with each End Client, for collecting their information and approvals, and for making sure they are allowed to use the Agent the way they do. You must not promise End Clients anything these Terms do not provide."],
      ["3.3", "Your first End Client's Agent is a free 14-day pilot from its Go-Live Date. After the pilot, the fees in our quote apply unless you tell us in writing before it ends that you do not want to continue."],
      ["3.4", "For your End Clients' customer data, the End Client decides why and how it is used, you act for the End Client, and we act for you as your sub-processor under section 7."],
    ],
  },
  {
    title: "4. Fees and payment",
    clauses: [
      ["4.1", "Fees are set out in our written quote to you (email is enough) and consist of a one-time setup fee for each Agent and a monthly fee for hosting, monitoring and updates. An audit has a fixed fee."],
      ["4.2", "Setup and audit fees are paid 50% before we start work and 50% when the Agent goes live or the audit report is delivered."],
      ["4.3", "The monthly fee is charged in advance, first on the Go-Live Date and then on the same date each month (or the last day of a shorter month)."],
      ["4.4", "Payment is collected through Razorpay, a freelance marketplace (such as Upwork) or bank transfer, as stated in the quote. Fees are in the currency stated in the quote."],
      ["4.5", "Taxes: we are not currently registered for GST, so no GST is added. If we register, GST will be added from the date of registration where it applies, with 30 days' notice. Where the law requires you to deduct tax at source (such as TDS in India), you may do so and must share the certificate within the statutory time."],
      ["4.6", "If a monthly fee is unpaid 7 days after it is due, we may pause the Agent after notice by email or WhatsApp. It restarts within 1 working day of payment."],
      ["4.7", "We may change monthly fees with 30 days' written notice. You may cancel under section 5 instead of accepting."],
    ],
  },
  {
    title: "5. Term and cancellation",
    clauses: [
      ["5.1", "There is no minimum term. Monthly service continues month to month until either side cancels."],
      ["5.2", `Either side may cancel by email at least 7 days before the next monthly charge. You send notice to ${BUSINESS.email}; we send notice to the email you gave us. The service then ends at the end of the month already paid for, and no further fees are charged.`],
      ["5.3", "Either side may end these Terms immediately by written notice if the other materially breaches them and does not fix the breach within 15 days of being told about it in writing."],
      ["5.4", "When the service ends, the Agent is switched off. Your data is returned and deleted as set out in section 7."],
    ],
  },
  {
    title: "6. Refunds",
    clauses: [
      ["6.1", "If we cannot deliver the Agent or the audit, we refund everything you paid for it."],
      ["6.2", "If you cancel a build after we have started work and before the Go-Live Date, the first 50% of the setup fee is not refunded and the second 50% is not charged."],
      ["6.3", "A month already paid for is not refunded, except under 6.4."],
      ["6.4", "If the Agent gave a customer information that contradicts what you provided, and the customer documents (for example in a message or review) that they did not buy or book because of that reply, we refund that month's fee. Raise the claim within 30 days and share the chat. This refund is your only remedy for that incident."],
      ["6.5", `Request a refund by email to ${BUSINESS.email}. Approved refunds go back to the original payment method. We start them within 7 working days of approval; your bank or marketplace may take longer.`],
    ],
  },
  {
    title: "7. Data protection",
    clauses: [
      ["7.1", "You decide why and how your customers' personal data is used (you are the \"Data Fiduciary\" under India's Digital Personal Data Protection Act, 2023, and the \"controller\" under the UK or EU GDPR where they apply). We process that data only on your behalf, as your processor."],
      ["7.2", "We process customer names, contact details, message content and enquiry details, only to answer your customers, record enquiries for you, and run and improve the service for you."],
      ["7.3", "We will: process customer data only for those purposes and on your documented instructions; never sell it, or use it to market to your customers for ourselves or anyone else; protect it with reasonable security safeguards, including encrypted credentials and limited access; keep anyone who handles it bound by confidentiality; use only sub-processors needed to run the service (currently AI model providers, cloud hosting and database, Meta for WhatsApp, and the automation and spreadsheet tools that deliver enquiries) and tell you before adding a new type of sub-processor; notify you without undue delay, and in any case within 48 hours, after becoming aware of a personal data breach affecting your customers, and help you meet your own duties; help you respond to customers who ask to access, correct or erase their data; and make available the information you reasonably need to show these Terms are being followed."],
      ["7.4", "Customer data may be processed outside your country, including in India and the United States, by us and our sub-processors. Where the UK or EU GDPR applies, we will rely on the appropriate safeguards for such transfers (such as standard contractual clauses) and will sign them with you on request."],
      ["7.5", "You are responsible for giving your customers any notice the law requires, and for having a lawful basis for the processing. You may link to our notice at sciencethoughts.com/data-notice. The Agent tells customers it is an AI assistant at the start of each new chat."],
      ["7.6", "Do not use the Agent to collect health, financial, government ID or other sensitive data beyond what is needed to arrange a contact or appointment. We configure the Agent not to ask for such data."],
      ["7.7", "Enquiry records are kept while these Terms are in force. Chat history used to reply is deleted 24 hours after a customer's last message. Within 30 days after the service ends, we give you an export of your enquiry records on request, then delete your customer data and the Agent's information from our systems, unless the law requires us to keep something."],
      ["7.8", "You own your customer data and the information you give us for the Agent."],
    ],
  },
  {
    title: "8. General",
    clauses: [
      ["8.1", "We own the software, prompts, test sets and systems behind the services. You get the right to use the services while these Terms are in force. We may reuse general know-how, but never your customer data or private information."],
      ["8.2", "Each side keeps the other's non-public business information confidential, during these Terms and for 2 years after they end. This does not apply to information that is public, already known, or required to be disclosed by law."],
      ["8.3", "We may name you as a client, or publish a case study, only with your written consent (email is enough)."],
      ["8.4", "The Agent uses AI and can make mistakes. We do not guarantee any number of enquiries or sales, accuracy in every reply, or uninterrupted service. An audit reports the failures found in the questions tested; it does not guarantee a chatbot has no other failures."],
      ["8.5", "Neither side is liable for indirect or consequential loss, including lost profits or lost sales (except the refund under 6.4). Our total liability under these Terms is limited to the fees you paid us in the 3 months before the claim. This limit does not apply to a breach of section 7 caused by our negligence, or to fraud."],
      ["8.6", "Neither side is liable for delay caused by events outside its reasonable control, including outages of AI providers, hosting or Meta, power or network failures, and natural disasters."],
      ["8.7", "We may update these Terms for future clients at any time. Changes to Terms you have already accepted apply to you only if you agree to them in writing (email is enough)."],
      ["8.8", "Neither side may transfer these Terms without the other's written consent, except that we may transfer them to a successor entity (for example, a company we incorporate) with notice."],
      ["8.9", "These Terms are governed by the laws of India. Both sides will first try to settle any dispute by discussion within 30 days. If that fails, the courts at Chennai, Tamil Nadu have exclusive jurisdiction."],
      ["8.10", "These Terms, with your accepted quote and the details you gave us, are the whole agreement about the services. If they conflict with our website Terms of Service or Cancellation & Refund Policy, these Terms apply."],
      ["8.11", "An electronic acceptance of these Terms binds both sides as fully as a handwritten signature. Our record of your acceptance is accepted as evidence of it."],
    ],
  },
];

export default function ClientTerms() {
  return (
    <div style={{ background: "var(--bg-dark)", minHeight: "100vh" }}>
      <section style={{ padding: "120px 0 60px 0" }}>
        <div className="container" style={{ maxWidth: "780px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "2.4rem", fontWeight: "900", fontFamily: "var(--font-display)", color: "var(--text-primary)", marginBottom: "10px" }}>
            Client Service Terms
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "10px" }}>
            Version {CLIENT_TERMS.version} &middot; Last updated: {CLIENT_TERMS.updated}
          </p>

          <div style={summaryBox}>
            <p style={{ ...pStyle, color: "var(--text-primary)", fontWeight: 700, marginBottom: "8px" }}>In short</p>
            <ul style={{ paddingLeft: "20px", margin: 0 }}>
              <li style={liStyle}>Fees are in your written quote: a one-time setup fee and a monthly fee (an audit has one fixed fee).</li>
              <li style={liStyle}>Setup is paid 50% before we start and 50% at go-live.</li>
              <li style={liStyle}><strong>No minimum term.</strong> Month to month; cancel by email at least 7 days before the next charge.</li>
              <li style={liStyle}>Agencies: sell agents under your own brand and price. Your first client is a free 14-day pilot.</li>
              <li style={liStyle}>Your customers&rsquo; data is yours. We process it only to run your agent, and delete it within 30 days after you leave.</li>
            </ul>
            <p style={{ ...pStyle, fontSize: "0.9rem", color: "var(--text-muted)", marginTop: "10px", marginBottom: 0 }}>
              This summary is for convenience. The full terms below are what you agree to.
            </p>
          </div>

          {SECTIONS.map((s) => (
            <div key={s.title} style={sectionStyle}>
              <h2 style={headingStyle}>{s.title}</h2>
              {s.clauses.map(([n, t]) => (
                <p key={n} style={pStyle}><strong style={{ color: "var(--text-primary)" }}>{n}</strong> {t}</p>
              ))}
            </div>
          ))}

          <div style={sectionStyle}>
            <h2 style={headingStyle}>Contact</h2>
            <p style={pStyle}>
              Questions about these Terms: <a href={`mailto:${BUSINESS.email}`} style={linkStyle}>{BUSINESS.email}</a>.
              See also our <a href="/refund-policy" style={linkStyle}>Cancellation &amp; Refund Policy</a> and{" "}
              <a href="/data-notice" style={linkStyle}>Guest Data Notice</a>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
