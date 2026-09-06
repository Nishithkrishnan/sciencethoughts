export const metadata = {
  title: "Guest Data Notice — Sciencethoughts",
  description: "How the Sciencethoughts AI concierge handles information shared by guests on WhatsApp.",
};

const sectionStyle = { marginTop: "36px" };
const headingStyle = { fontSize: "1.3rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "12px", fontFamily: "var(--font-display)" };
const pStyle = { color: "var(--text-secondary)", lineHeight: "1.7", marginBottom: "14px", fontSize: "1rem" };
const liStyle = { color: "var(--text-secondary)", lineHeight: "1.7", marginBottom: "10px" };

export default function GuestDataNotice() {
  return (
    <div style={{ background: "var(--bg-dark)", minHeight: "100vh" }}>
      <section style={{ padding: "120px 0 60px 0" }}>
        <div className="container" style={{ maxWidth: "780px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "2.4rem", fontWeight: "900", fontFamily: "var(--font-display)", color: "var(--text-primary)", marginBottom: "10px" }}>
            Guest Data Notice
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1rem", marginBottom: "10px" }}>
            How the Sciencethoughts AI concierge handles information you share on WhatsApp
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "10px" }}>
            Last updated: 6 September 2026
          </p>

          <p style={pStyle}>
            This notice explains what happens to information you share when you message a property&rsquo;s AI concierge
            on WhatsApp, where that concierge is built and run by Sciencethoughts. It applies to every property that
            uses this service, and is meant to be read alongside, not instead of, that property&rsquo;s own privacy policy.
          </p>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>1. What is collected</h2>
            <p style={pStyle}>During a conversation, the concierge may collect:</p>
            <ul style={{ paddingLeft: "20px", marginBottom: "14px" }}>
              <li style={liStyle}>Information you choose to share: your name, phone number, email address, travel dates, number of guests, and any preferences or questions you type into the chat.</li>
              <li style={liStyle}>The WhatsApp number the message came from, and the time of the conversation.</li>
            </ul>
            <p style={pStyle}>
              We do not ask for payment details, card numbers, government ID numbers, health information, or other
              sensitive personal data through this chat, and you should not share them here.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>2. Why it is collected</h2>
            <ul style={{ paddingLeft: "20px", marginBottom: "14px" }}>
              <li style={liStyle}>To answer your question in real time — rates, amenities, activities, policies.</li>
              <li style={liStyle}>To pass a booking inquiry, or a question the assistant cannot confidently answer, to the property&rsquo;s team so a person can follow up.</li>
              <li style={liStyle}>To improve the accuracy of answers for that property.</li>
            </ul>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>3. Where the information goes</h2>
            <p style={pStyle}>
              <strong style={{ color: "var(--text-primary)" }}>To generate a reply.</strong> Conversation text is sent
              to OpenAI, and if that is unavailable to Google (Gemini), solely to produce an answer. If both are
              unavailable, a limited set of pre-written responses is used and nothing leaves our system. Under these
              providers&rsquo; API terms, content sent this way is not used to train their models. They may retain it
              briefly — typically up to 30 days — for security and abuse monitoring, after which it is deleted.
            </p>
            <p style={pStyle}>
              <strong style={{ color: "var(--text-primary)" }}>Processing outside India.</strong> These providers
              process the text on servers located outside India, principally in the United States.
            </p>
            <p style={pStyle}>
              <strong style={{ color: "var(--text-primary)" }}>Questions the assistant cannot answer.</strong> The
              question, and your contact details if you gave them, are stored so the property&rsquo;s team can follow
              up. These records are held in an encrypted database and are automatically deleted 14 days after they
              are created.
            </p>
            <p style={pStyle}>
              <strong style={{ color: "var(--text-primary)" }}>Booking inquiries.</strong> If you are making an
              inquiry, your details (name, contact information, dates, and what you asked about) are recorded in a
              dedicated record for that property that only the property&rsquo;s team can access, so a person there
              can follow up. A copy is also kept in Sciencethoughts&rsquo; own systems for as long as the property is
              a Sciencethoughts client, so the service can keep working and so the property has a backup record — see
              Section 4 for how long this is kept.
            </p>
            <p style={pStyle}>
              <strong style={{ color: "var(--text-primary)" }}>Never.</strong> We do not sell guest information, we
              do not share it with other properties, and we do not market to you on our own behalf.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>4. How long it is kept</h2>
            <p style={pStyle}>
              Information used only to generate a live reply is not stored by us beyond the conversation. Questions
              the assistant could not confidently answer, and any contact details given with them, are kept for 14
              days and then deleted automatically. Booking-inquiry details are different: we keep those for as long
              as the property is a Sciencethoughts client, so the service and the property&rsquo;s own record of the
              inquiry keep working, and delete them within 30 days of that relationship ending, except where the law
              requires us to keep something longer. This matches standard practice among hosted guest-messaging
              services. Once your details reach the property&rsquo;s own systems, how long the property itself keeps
              them is governed by its own policy, separate from ours.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>5. Security</h2>
            <p style={pStyle}>
              Messages travel over encrypted connections, including WhatsApp&rsquo;s own encrypted transport to Meta.
              Property credentials are stored encrypted. Access to system configuration and to stored escalation
              records is limited to the Service Provider. If a breach affecting guest information occurs, the
              property is notified promptly so it can meet its own obligations.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>6. Children</h2>
            <p style={pStyle}>
              This chat is not intended for use by anyone under 18. We do not knowingly collect personal information
              from a child through it. Where a booking inquiry mentions children travelling, only the information the
              adult chooses to provide is captured. If you believe a child has shared personal information here,
              contact us using the details in Section 8 and it will be deleted.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>7. Your choices</h2>
            <p style={pStyle}>
              Sharing your name, phone number or email in this chat is entirely up to you. You can ask a question and
              get an answer without giving any contact details — they are only needed if you want the property&rsquo;s
              team to get back to you.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>8. Your rights, and who to contact</h2>
            <p style={pStyle}>
              Under India&rsquo;s Digital Personal Data Protection Act, 2023 you may ask for access to the
              information held about you, ask for it to be corrected or erased, raise a grievance, and nominate
              someone to exercise these rights on your behalf. To do any of these:
            </p>
            <ul style={{ paddingLeft: "20px", marginBottom: "14px" }}>
              <li style={liStyle}>For information already passed to the property — contact that property&rsquo;s own guest services or reservations team directly.</li>
              <li style={liStyle}>For anything still held in our own systems — the 14-day escalation window, or a booking-inquiry copy kept while the property is a client, both described in Section 4 — contact Sciencethoughts at <a href="mailto:nishithmanu@gmail.com" style={{ color: "var(--accent-teal)" }}>nishithmanu@gmail.com</a>.</li>
            </ul>
            <p style={pStyle}>
              Grievances are acknowledged and responded to within 30 days. The person responsible is Nishith
              Krishnan, reachable at <a href="mailto:nishithmanu@gmail.com" style={{ color: "var(--accent-teal)" }}>nishithmanu@gmail.com</a>.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>9. Our approach to Indian data protection law</h2>
            <p style={pStyle}>
              This notice and the underlying system are designed around the core principles of the Digital Personal
              Data Protection Act, 2023 — collecting only what is needed, using it only for the stated purpose, and
              not keeping it longer than necessary. The property you are messaging is the data fiduciary for guest
              information collected through this chat; Sciencethoughts processes it on the property&rsquo;s behalf.
              This is a good-faith design approach and a description of how the system actually works, not a formal
              compliance certification.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
