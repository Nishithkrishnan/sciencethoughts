/**
 * ScienceThoughts embeddable chat widget loader.
 *
 * A client pastes one line on their own site, right before </body>:
 *
 *   <script src="https://sciencethoughts.com/widget-loader.js" data-tenant="THEIR_TENANT_ID" async></script>
 *
 * That's the entire integration — no CSS, no layout space, no build step on their end.
 * This script creates a small floating <iframe> pointed at our own /embed page (which
 * always same-origin-fetches our own API, so no CORS setup is needed anywhere), and
 * listens for postMessage resize hints from that iframe so it can grow from a small
 * round button into a full chat panel and back, without the host page doing anything.
 * This is the same script-tag + iframe + postMessage-resize pattern used by Intercom,
 * Crisp, Drift, and HiJiffy.
 */
(function () {
  "use strict";

  var CURRENT_SCRIPT = document.currentScript;
  var TENANT = CURRENT_SCRIPT ? CURRENT_SCRIPT.getAttribute("data-tenant") : null;

  if (!TENANT) {
    console.error(
      "[Sciencethoughts widget] Missing data-tenant attribute on the widget-loader.js <script> tag. " +
        "Add data-tenant=\"your-tenant-id\" to the <script> tag — the widget will not load without it."
    );
    return;
  }

  // Resolve our own origin from the script's own src, so this loader keeps working
  // unchanged if it's ever served from a staging domain instead of production.
  var SCRIPT_SRC = (CURRENT_SCRIPT && CURRENT_SCRIPT.src) || "https://sciencethoughts.com/widget-loader.js";
  var ORIGIN = SCRIPT_SRC.replace(/\/widget-loader\.js.*$/, "");

  var CLOSED = { width: 84, height: 84 };
  var MARGIN = 20; // matches the fixed offset from the corner, kept in sync with clamping below

  var iframe = document.createElement("iframe");
  iframe.src = ORIGIN + "/embed?tenant=" + encodeURIComponent(TENANT);
  iframe.title = "Chat";
  iframe.setAttribute("aria-label", "Chat widget");
  iframe.setAttribute("loading", "eager");
  iframe.setAttribute("allow", "clipboard-write");
  iframe.style.position = "fixed";
  iframe.style.bottom = MARGIN + "px";
  iframe.style.right = MARGIN + "px";
  iframe.style.width = CLOSED.width + "px";
  iframe.style.height = CLOSED.height + "px";
  iframe.style.border = "none";
  iframe.style.background = "transparent";
  iframe.style.colorScheme = "normal"; // don't let the host page's dark-mode CSS invert our iframe
  iframe.style.zIndex = "2147483647"; // max practical z-index, sits above the host page's own UI
  iframe.style.transition = "width 0.2s ease, height 0.2s ease";

  function clamp(size) {
    // Keep the open panel from overflowing small/mobile viewports on the host page,
    // since a client's own screen size is never something we can predict in advance.
    var maxWidth = window.innerWidth - MARGIN * 2;
    var maxHeight = window.innerHeight - MARGIN * 2;
    return {
      width: Math.max(0, Math.min(size.width, maxWidth)),
      height: Math.max(0, Math.min(size.height, maxHeight)),
    };
  }

  function applySize(size) {
    var safe = clamp(size);
    iframe.style.width = safe.width + "px";
    iframe.style.height = safe.height + "px";
  }

  window.addEventListener("message", function (event) {
    var data = event.data;
    if (!data || data.source !== "sciencethoughts-widget" || data.type !== "resize") return;
    // We can't pin an expected event.origin here (this loader itself runs on whatever
    // client domain it's pasted into — that's the whole point), but we DO verify the
    // message actually came from the iframe we created, and the only data we ever act
    // on is two numbers for width/height. There's no code execution or DOM injection
    // from this handler, so accepting a wildcard-origin postMessage here is safe.
    if (event.source !== iframe.contentWindow) return;
    var width = typeof data.width === "number" ? data.width : CLOSED.width;
    var height = typeof data.height === "number" ? data.height : CLOSED.height;
    applySize({ width: width, height: height });
  });

  window.addEventListener("resize", function () {
    // Re-clamp on viewport resize/rotation so an already-open panel doesn't stay
    // wider than the screen after e.g. a phone is rotated.
    applySize({ width: iframe.style.width ? parseInt(iframe.style.width, 10) : CLOSED.width, height: iframe.style.height ? parseInt(iframe.style.height, 10) : CLOSED.height });
  });

  function mount() {
    document.body.appendChild(iframe);
  }

  if (document.body) {
    mount();
  } else {
    document.addEventListener("DOMContentLoaded", mount);
  }
})();
