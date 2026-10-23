// Client Service Terms: the click-to-accept contract every property agrees to on /onboard.
// The full text lives at app/(site)/client-terms/page.js. It was adapted from the signed
// Pilot Service Agreement v1.0, which is now kept only for groups or custom deals.
//
// Bump CLIENT_TERMS.version whenever the terms page text changes in substance. Each acceptance
// is logged with the version that was shown, so we can always prove which text a client agreed to.

export const CLIENT_TERMS = {
  version: "1.0",
  updated: "23 October 2026",
};

// Key layout: a Redis list, appended to (RPUSH) on every acceptance. LINDEX -1 = the latest.
export const termsLogKey = (tenant) => `tenant:terms:${tenant}`;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PAN = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const TDS_OPTIONS = ["yes", "no", "unsure"];

function text(value, max) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "";
}

// Checks the business details a client enters on /onboard.
// Returns { ok: true, details } with cleaned values, or { ok: false, errors: { field: message } }.
export function validateClientDetails(input = {}) {
  const d = {
    legalName: text(input.legalName, 150),
    tradingName: text(input.tradingName, 150),
    registration: text(input.registration, 80),
    pan: text(input.pan, 10).toUpperCase(),
    address: text(input.address, 300),
    contactName: text(input.contactName, 100),
    contactTitle: text(input.contactTitle, 60),
    email: text(input.email, 120).toLowerCase(),
    tds: text(input.tds, 10).toLowerCase(),
  };
  const errors = {};
  if (d.legalName.length < 2) errors.legalName = "Enter your business's legal name.";
  if (d.registration.length < 3) errors.registration = "Enter your GST, Udyam or Shop & Establishment number.";
  if (d.pan && !PAN.test(d.pan)) errors.pan = "PAN should look like ABCDE1234F.";
  if (d.address.length < 10) errors.address = "Enter the full business address.";
  if (d.contactName.length < 2) errors.contactName = "Enter the name of the person accepting.";
  if (!EMAIL.test(d.email)) errors.email = "Enter a valid email for notices.";
  if (!TDS_OPTIONS.includes(d.tds)) errors.tds = "Choose whether you will deduct TDS.";
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, details: d };
}
