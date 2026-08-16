import "./globals.css";
import FloatingWebChat from "../components/FloatingWebChat";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata = {
  title: "Sciencethoughts - AI WhatsApp Concierge for Luxury Hospitality",
  description: "AI-powered WhatsApp concierge for luxury villas, resorts, and boutique hotels. Instant guest replies, accurate rates from your own knowledge base, and qualified booking leads — 24/7, zero missed inquiries.",
  openGraph: {
    title: "Sciencethoughts - AI WhatsApp Concierge for Luxury Hospitality",
    description: "See how an AI concierge answers guest questions, quotes rates, and captures booking leads on WhatsApp. Try the live demo for a luxury villa or resort.",
    url: "https://sciencethoughts.com",
    siteName: "Sciencethoughts",
    images: [
      {
        url: "https://sciencethoughts.com/og-image.jpg", // Add an og-image.jpg to your public folder later
        width: 1200,
        height: 630,
        alt: "Sciencethoughts AI WhatsApp Concierge",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sciencethoughts - AI WhatsApp Concierge for Luxury Hospitality",
    description: "AI-powered WhatsApp concierge for luxury villas, resorts, and boutique hotels.",
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
              <a href="/case-studies" className="nav-link">Case Studies</a>
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
                  24/7 AI Concierge solutions for luxury hospitality, resorts, and premium vacation villa networks. Increase direct bookings and automate guest operations.
                </p>
              </div>
              <div>
                <h4 className="footer-heading">Navigation</h4>
                <ul className="footer-links">
                  <li><a href="/" className="footer-link">Home</a></li>
                  <li><a href="/case-studies" className="footer-link">Case Studies & Demos</a></li>
                </ul>
              </div>
              <div>
                <h4 className="footer-heading">Contact & Collabs</h4>
                <ul className="footer-links">
                  <li><span style={{ color: "var(--text-secondary)" }}>nishithmanu@gmail.com</span></li>
                  <li><a href="/#contact" className="footer-link">Schedule a Consultation</a></li>
                  <li><span style={{ color: "var(--text-muted)" }}>Bangalore, India</span></li>
                </ul>
              </div>
            </div>
            
            <div className="footer-bottom">
              <p>&copy; {new Date().getFullYear()} Science Thoughts. All rights reserved.</p>
              <p style={{ display: "flex", gap: "15px" }}>
                <a href="#" className="footer-link">Privacy Policy</a>
                <span>&middot;</span>
                <a href="#" className="footer-link">Terms of Service</a>
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
