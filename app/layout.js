import "./globals.css";
import FlowiseChatbot from "../components/FlowiseChatbot";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata = {
  title: "Science Thoughts - AI Agents & Human Insights",
  description: "A hybrid showcase where science meets AI. Explore autonomous agents, dynamic interfaces, and cutting-edge cognitive articles.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <FlowiseChatbot />
        {/* Navigation Header */}
        <header className="header">
          <div className="container header-container">
            <a href="/" className="logo">
              <span>SCIENCE</span>
              <span className="logo-grey">THOUGHTS</span>
            </a>
            <nav className="nav-links">
              <a href="/" className="nav-link">Home</a>
              <a href="/lab" className="nav-link">The Lab</a>
              <a href="/#blog" className="nav-link">Think Tank</a>
              <a href="/#contact" className="nav-btn">Work With Me</a>
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
                  Architecting the intelligence of tomorrow. Bridging the gap between human reasoning and autonomous machine execution.
                </p>
              </div>
              <div>
                <h4 className="footer-heading">Navigation</h4>
                <ul className="footer-links">
                  <li><a href="/" className="footer-link">Home</a></li>
                  <li><a href="/lab" className="footer-link">The Lab (AI Agents)</a></li>
                  <li><a href="/#blog" className="footer-link">Think Tank (Blog)</a></li>
                </ul>
              </div>
              <div>
                <h4 className="footer-heading">Contact & Collabs</h4>
                <ul className="footer-links">
                  <li><span style={{ color: "var(--text-secondary)" }}>nishithmanu@gmail.com</span></li>
                  <li><a href="/#contact" className="footer-link">Hire Me / Consulting</a></li>
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
