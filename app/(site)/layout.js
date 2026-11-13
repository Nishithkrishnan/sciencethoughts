import "../globals.css";
import FloatingWebChat from "../../components/FloatingWebChat";
import { BUSINESS } from "../../lib/business-info";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata = {
  title: "ScienceThoughts - AI chat agents for your website and WhatsApp",
  description: "We build, host and maintain AI chat agents that answer your customers from your own information, say so when they don't know, and send every enquiry to your team. For small businesses and agencies.",
  openGraph: {
    title: "ScienceThoughts - AI chat agents for your website and WhatsApp",
    description: "Try live demo agents for three fictional businesses and see how they answer, defer and record enquiries.",
    url: "https://sciencethoughts.com",
    siteName: "Sciencethoughts",
    images: [
      {
        url: "https://sciencethoughts.com/og-image.jpg", // Add an og-image.jpg to your public folder later
        width: 1200,
        height: 630,
        alt: "ScienceThoughts AI chat agents",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ScienceThoughts - AI chat agents for your website and WhatsApp",
    description: "AI chat agents that answer your customers from your own information, built and run for you.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <FloatingWebChat />
        {/* Navigation Header */}
        <header className="header">
          <div className="container header-container">
            <a href="/" className="logo">
              <span>SCIENCE</span>
              <span className="logo-grey">THOUGHTS</span>
            </a>
            <nav className="nav-links">
              <a href="/" className="nav-link">Home</a>
              <a href="/case-studies" className="nav-link">Demos</a>
              <a href="/#contact" className="nav-btn">Consultation</a>
            </nav>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1 }}>{children}</main>

        {/* Global Footer */}
        <footer className="footer">
          <div className="container">
            <div className="footer-grid">
              <div className="footer-brand">
                <a href="/" className="logo">
                  <span>SCIENCE</span>
                  <span className="logo-grey">THOUGHTS</span>
                </a>
                <p style={{ color: "var(--text-secondary)" }}>
                  AI chat agents for your website and WhatsApp, built, hosted and maintained for you. For small businesses and the agencies that serve them.
                </p>
              </div>
              <div>
                <h4 className="footer-heading">Navigation</h4>
                <ul className="footer-links">
                  <li><a href="/" className="footer-link">Home</a></li>
                  <li><a href="/case-studies" className="footer-link">Live demos</a></li>
                </ul>
              </div>
              <div>
                <h4 className="footer-heading">Contact & Collabs</h4>
                <ul className="footer-links">
                  <li><a href={`mailto:${BUSINESS.email}`} className="footer-link">{BUSINESS.email}</a></li>
                  <li><span style={{ color: "var(--text-secondary)" }}>{BUSINESS.phone}</span></li>
                  <li><a href="/contact" className="footer-link">Contact details</a></li>
                  <li><span style={{ color: "var(--text-muted)" }}>{BUSINESS.location}</span></li>
                </ul>
              </div>
            </div>
            
            <div className="footer-bottom">
              <p>&copy; {new Date().getFullYear()} {BUSINESS.name} &middot; Udyam {BUSINESS.udyam}</p>
              <p style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
                <a href="/privacy-policy" className="footer-link">Privacy Policy</a>
                <span>&middot;</span>
                <a href="/terms-of-service" className="footer-link">Terms of Service</a>
                <span>&middot;</span>
                <a href="/client-terms" className="footer-link">Client Terms</a>
                <span>&middot;</span>
                <a href="/refund-policy" className="footer-link">Cancellation &amp; Refunds</a>
                <span>&middot;</span>
                <a href="/data-notice" className="footer-link">Customer Data Notice</a>
                <span>&middot;</span>
                <a href="/contact" className="footer-link">Contact</a>
              </p>
            </div>
          </div>
        </footer>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
