import { BUSINESS } from "../../../lib/business-info";
import { CLIENT_TERMS } from "../../../lib/client-terms";

export const metadata = {
  title: "Client Service Terms — Sciencethoughts",
  description: "The terms every property accepts when it signs up for the Sciencethoughts AI WhatsApp concierge.",
};

const sectionStyle = { marginTop: "36px" };
const headingStyle = { fontSize: "1.3rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "12px", fontFamily: "var(--font-display)" };
const pStyle = { color: "var(--text-secondary)", lineHeight: "1.7", marginBottom: "12px", fontSize: "1rem" };
const liStyle = { color: "var(--text-secondary)", lineHeight: "1.7", marginBottom: "8px" };
const linkStyle = { color: "var(--accent-teal)" };
const summaryBox = { border: "1px solid var(--accent-teal)", borderRadius: "var(--radius-md)", padding: "18px 22px", marginTop: "24px" };

// Each clause is [number, text]. Keep the numbering stable: clients and emails may cite it.
const SECTIONS = [
  {
    title: "1. Who these terms are between",
    clauses: [
      ["1.1", `These Client Service Terms (the "Terms") are between ${BUSINESS.owner}, sole proprietor, trading as ${BUSINESS.name} (Udyam ${BUSINESS.udyam}, ${BUSINESS.location}, ${BUSINESS.email}, ${BUSINESS.phone}) ("${BUSINESS.name}", "we"), and the business that accepts them on our onboarding page (the "Property", "you").`],
      ["1.2", "You accept these Terms by ticking the box on your personal onboarding page. The person who ticks it confirms they are authorised to bind the Property. We record the date and time, the version of the Terms shown, and the business details you entered (your \"Client Details\")."],
      ["1.3", "For groups or custom arrangements we may instead sign a separate agreement with you. If we do, that signed agreement applies in place of these Terms."],
    ],
  },
  {
    title: "2. The Service",
    clauses: [
      ["2.1", "We provide an AI assistant that answers guest enquiries on your own WhatsApp Business number (the \"Service\")."],
      ["2.2", "The Service includes: building the assistant's knowledge base from facts you provide (rooms, rates, policies, location, amenities); connecting your WhatsApp number through Meta's Embedded Signup; answering guests in your name, and telling them honestly when it does not know an answer; passing booking enquiries (name, phone, dates, room type, guests, requests) to a record kept for you, such as a Google Sheet or your own CRM; updating the knowledge base when you send changes, normally within 2 working days; and support by email and WhatsApp on working days (Monday to Saturday, 10:00 to 18:00 IST)."],
      ["2.3", "The Service does not take payments from guests, confirm bookings, or change your booking or channel-manager systems. Bookings stay with you."],
      ["2.4", "The assistant runs on third-party services: Meta's WhatsApp Business Platform, AI model providers and cloud hosting. We do not control them. An outage or policy change by any of them is not a breach of these Terms, but we will tell you promptly and work to restore the Service."],
    ],
  },
  {
    title: "3. Free trial and Go-Live",
    clauses: [
      ["3.1", "The Service starts with a free 7-day trial. The trial begins on the day the assistant first answers guests on your own WhatsApp number."],
      ["3.2", "No payment is due to start or during the trial. Either side may end the trial at any time by email or WhatsApp, at no cost."],
      ["3.3", "If you want to continue, you pay the first invoice (section 4) by the end of the trial. Paid service starts on the day after the trial ends (the \"Go-Live Date\")."],
      ["3.4", "If you have not paid by day 8, the assistant is paused. It is switched off if no payment arrives within a further 7 days. Nothing is owed for the trial."],
      ["3.5", "Your business must pass Meta Business Verification, and your WhatsApp display name must be approved, before the assistant can reply from your number. You start verification on the day you accept these Terms. We guide you through the steps, but cannot speed up Meta's review."],
    ],
  },
  {
    title: "4. Fees and payment",
    clauses: [
      ["4.1", "For one property (a villa, resort, hotel or homestay): a one-time setup fee of ₹9,999, and a monthly service fee of ₹4,999. Both are first due by the end of the free trial. You may choose to pay the setup fee earlier."],
      ["4.2", "Fees for groups or several properties are agreed in writing (email is enough) before you start, and those agreed fees apply instead."],
      ["4.3", "Payment is collected through Razorpay. You approve a recurring UPI, card or bank mandate for the monthly fee. The setup fee may be paid with the first month or through a separate payment link."],
      ["4.4", "The monthly fee is charged in advance. The first charge is made on the Go-Live Date, and each later charge on the same date every month (or the last day of a shorter month)."],
      ["4.5", "We are not currently registered for GST, so no GST is charged. If we register, GST will be added from the date of registration, with 30 days' notice. Where the law requires you to deduct TDS, you may do so, and you must then share the TDS certificate (Form 16A) within the statutory time."],
      ["4.6", "If a monthly fee is unpaid 7 days after it is due, we may pause the Service after notice by email or WhatsApp. It restarts within 1 working day of payment. A pause does not extend the minimum term."],
      ["4.7", "Fees are fixed for the minimum term. After that, we may change them with 60 days' written notice, and you may cancel under section 5 instead of accepting."],
    ],
  },
  {
    title: "5. Minimum term and cancellation",
    clauses: [
      ["5.1", "After the trial, the Service runs for a minimum of 6 months from the Go-Live Date (the \"Minimum Term\"). It then continues month to month."],
      ["5.2", `After the Minimum Term, either side may cancel with one month's written notice by email. You send notice to ${BUSINESS.email}; we send notice to the email in your Client Details. Notice may be given during the Minimum Term to take effect at its end.`],
      ["5.3", "If you cancel during the Minimum Term, the monthly fees for the rest of the Minimum Term remain payable, except where you cancel under 5.4 or 5.5."],
      ["5.4", "Either side may cancel immediately by written notice if the other materially breaches these Terms and does not fix the breach within 15 days of being told about it in writing."],
      ["5.5", "If Meta suspends or permanently restricts your WhatsApp number for reasons not caused by us, either side may cancel with 15 days' notice. No further monthly fees are due after that."],
      ["5.6", "On cancellation, the assistant is switched off at the end of the notice period, and data is returned and deleted as set out in section 8."],
    ],
  },
  {
    title: "6. Refunds",
    clauses: [
      ["6.1", "The setup fee is refunded in full if you cancel before the Go-Live Date. From the Go-Live Date, it is not refundable."],
      ["6.2", "A month that has already started is not refunded, except under 6.3."],
      ["6.3", "If the assistant costs you a booking, we refund that month's fee. This applies when the assistant gave a guest information that contradicts what you provided for the knowledge base, and the guest documents (for example in a message or review) that they did not book because of that reply. Raise the claim within 30 days of the conversation and share the chat. This refund is your only remedy for that incident."],
      ["6.4", `Request a refund by email to ${BUSINESS.email} with your property name and the reason. Approved refunds go back to the original payment method. We start them within 7 working days of approval; your bank may take a further 5 to 7 working days.`],
    ],
  },
  {
    title: "7. Your responsibilities",
    clauses: [
      ["7.1", "You will: own the WhatsApp Business number and Meta business account used for the Service and keep them in good standing; complete Meta Business Verification and display-name approval; give accurate, current facts for the knowledge base and tell us promptly when rates, policies or availability change; follow WhatsApp's Business and Commerce Policies, and message guests only where they contacted you or agreed to be contacted; reply personally when the assistant hands a conversation over or says it does not know; and keep your own booking, pricing and cancellation decisions, which the assistant does not make."],
      ["7.2", "We are not responsible for errors caused by facts you supplied or did not update."],
      ["7.3", "Your Client Details must be accurate. Tell us by email if they change."],
    ],
  },
  {
    title: "8. Data protection",
    clauses: [
      ["8.1", "Under the Digital Personal Data Protection Act, 2023 (the \"DPDP Act\"), you are the Data Fiduciary for your guests' personal data. We are the Data Processor, and process that data only on your behalf."],
      ["8.2", "We process guest names, phone numbers, message content and booking details (dates, room type, number of guests, requests), only to answer your guests, record enquiries for you, and run and improve the Service for you."],
      ["8.3", "We will: process guest data only for those purposes and on your documented instructions; never sell guest data, or use it to market to guests for ourselves or anyone else; protect it with reasonable security safeguards, including encryption of stored access tokens and access limited to people who need it; use only sub-processors needed to run the Service (currently Meta, AI model providers, cloud hosting and database, and the automation and spreadsheet tools that deliver leads), and tell you before adding a new type of sub-processor; notify you without undue delay, and in any case within 48 hours, after becoming aware of a personal data breach affecting your guests, and help you meet your own notice duties; and help you respond to guests who ask to access, correct or erase their data."],
      ["8.4", "As Data Fiduciary, you are responsible for giving guests any notice the law requires. You may link to our Guest Data Notice at sciencethoughts.com/data-notice. The assistant also tells guests it is an AI assistant at the start of each new chat."],
      ["8.5", "Guest enquiry data is kept while these Terms are in force. Within 30 days after they end, we will give you an export of your enquiry records on request, and then delete your guest data and knowledge base from our systems, unless the law requires us to keep something. Escalation records expire automatically after 14 days."],
      ["8.6", "You own your guest data and the facts in your knowledge base."],
    ],
  },
  {
    title: "9. General",
    clauses: [
      ["9.1", "We own the software, prompts and systems behind the Service. You get the right to use the Service while these Terms are in force. We may reuse general know-how, but never your guest data or private information."],
      ["9.2", "Each side keeps the other's non-public business information confidential, during these Terms and for 2 years after they end. This does not apply to information that is public, already known, or required to be disclosed by law."],
      ["9.3", "We may name you as a client, or publish a case study, only with your written consent (email is enough)."],
      ["9.4", "The assistant uses AI and can make mistakes. We do not guarantee any number of bookings, accuracy in every reply, or uninterrupted service."],
      ["9.5", "Neither side is liable for indirect or consequential loss, including lost profits or lost bookings (except the refund under 6.3). Our total liability under these Terms is limited to the fees you paid in the 3 months before the claim. This limit does not apply to a breach of section 8 caused by our negligence, or to fraud."],
      ["9.6", "Neither side is liable for delay caused by events outside its reasonable control, including outages of Meta, AI providers or hosting, power or network failures, and natural disasters."],
      ["9.7", "We may update these Terms for future clients at any time. Changes to Terms you have already accepted apply to you only if you agree to them in writing (email is enough)."],
      ["9.8", "Neither side may transfer these Terms without the other's written consent, except that we may transfer them to a successor entity (for example, a company we incorporate) with notice."],
      ["9.9", "These Terms are governed by the laws of India. Both sides will first try to settle any dispute by discussion within 30 days. If that fails, the courts at Chennai, Tamil Nadu have exclusive jurisdiction."],
      ["9.10", "These Terms, with your Client Details and any fees agreed under 4.2, are the whole agreement about the Service. If they conflict with our website Terms of Service or Cancellation & Refund Policy, these Terms apply."],
      ["9.11", "An electronic acceptance of these Terms binds both sides as fully as a handwritten signature. Our record of your acceptance (date, time, version and Client Details) is accepted as evidence of it."],
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
              <li style={liStyle}>Free 7-day trial on your own WhatsApp number. Nothing is paid until it ends.</li>
              <li style={liStyle}>One property: ₹9,999 one-time setup, then ₹4,999 a month. Groups: price agreed in writing.</li>
              <li style={liStyle}><strong>Minimum term: 6 months from your Go-Live Date</strong> (the day after your trial). Then one month&rsquo;s notice to cancel.</li>
              <li style={liStyle}>Setup fee refunded in full if you cancel before Go-Live. A month&rsquo;s fee refunded if the assistant provably costs you a booking.</li>
              <li style={liStyle}>Your guest data is yours. We process it only to run your assistant, and delete it within 30 days after you leave.</li>
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
