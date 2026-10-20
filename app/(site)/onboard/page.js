import WhatsAppOnboarding from "../../../components/WhatsAppOnboarding";

// Client-facing page for connecting a property's WhatsApp Business number via Meta's Embedded
// Signup. Only works with a signed link from /api/onboarding-link (see lib/onboarding-link.js).
export const metadata = {
  title: "Connect your WhatsApp number — Sciencethoughts",
  robots: { index: false, follow: false },
};

export default function OnboardPage() {
  return <WhatsAppOnboarding />;
}
