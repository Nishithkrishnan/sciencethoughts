import EmbeddableWidget from "../../components/EmbeddableWidget";

// This page is the actual thing loaded inside the <iframe> that public/widget-loader.js
// creates on a client's site (e.g. https://sciencethoughts.com/embed?tenant=machan-resort).
// It renders nothing but the widget itself — see app/embed/layout.js for why this route
// has its own root layout instead of the main site's.
export default function EmbedPage() {
  return <EmbeddableWidget />;
}
