// A SEPARATE root layout for the /embed route, deliberately not nested inside
// app/(site)/layout.js. Next.js App Router supports multiple root layouts via route
// groups: because there is no layout.js directly at app/ itself, app/(site)/layout.js
// and this file are two independent root layouts, each defining their own <html>/<body>.
//
// This route is only ever loaded inside an <iframe> on a CLIENT'S OWN website (via
// public/widget-loader.js), so it must NOT inherit any of the main site's chrome:
// no header/nav, no footer, no <FloatingWebChat /> (embedding ScienceThoughts' own
// sitewide agency widget inside a per-client widget iframe would be broken), and —
// just as importantly — no globals.css. globals.css sets `html, body { background-color:
// var(--bg-dark) }`, which would make this whole iframe an opaque near-black box
// instead of a transparent overlay that lets the chat bubble float on top of the
// client's own page background. Keeping this layout free of that stylesheet is what
// makes the iframe transparent by default (the HTML spec's initial background is
// already transparent — we just have to avoid overriding it).
export const metadata = {
  title: "Chat",
  robots: { index: false, follow: false },
};

export default function EmbedLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "transparent" }}>
        {children}
      </body>
    </html>
  );
}
