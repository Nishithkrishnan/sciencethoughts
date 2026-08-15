/**
 * Zoho CRM Integration Service (Multi-Tenant with Application-Layer Decryption & KV Token Caching)
 */

import { decrypt } from './crypto';

const KV_URL = (process.env.KV_REST_API_URL || process.env.REDIS_REST_API_URL || process.env.REDIS_REST_URL || "").trim();
const KV_TOKEN = (process.env.KV_REST_API_TOKEN || process.env.REDIS_REST_API_TOKEN || process.env.REDIS_REST_TOKEN || "").trim();

// Fetch credentials for a specific tenant and decrypt secrets
async function getTenantCredentials(companyId) {
  const id = companyId || 'agency';

  // 1. Try fetching from Vercel KV first
  if (KV_URL && KV_TOKEN) {
    try {
      const res = await fetch(`${KV_URL}/get/tenant:crm:zoho:${id}`, {
        headers: { Authorization: `Bearer ${KV_TOKEN}` }
      });
      const data = await res.json();
      if (data.result) {
        const creds = JSON.parse(data.result);
        
        // Decrypt secrets at application layer before use
        const clientId = decrypt(creds.client_id);
        const clientSecret = decrypt(creds.client_secret);
        const refreshToken = decrypt(creds.refresh_token);
        const apiDomain = creds.api_domain || "https://www.zohoapis.in";

        if (clientId && clientSecret && refreshToken) {
          console.log(`[ZOHO] Decrypted and loaded credentials for tenant ${id} from KV.`);
          return { clientId, clientSecret, refreshToken, apiDomain };
        }
      }
    } catch (e) {
      console.error(`[ZOHO] Failed to load/decrypt credentials for tenant ${id}:`, e);
    }
  }

  // 2. Fall back to environment variables (legacy single-tenant mode)
  console.log(`[ZOHO] Using fallback environment variables.`);
  return {
    clientId: process.env.ZOHO_CLIENT_ID,
    clientSecret: process.env.ZOHO_CLIENT_SECRET,
    refreshToken: process.env.ZOHO_REFRESH_TOKEN,
    apiDomain: process.env.ZOHO_API_DOMAIN || "https://www.zohoapis.in"
  };
}

// Get access token (checks KV cache first, otherwise refreshes and caches)
async function getAccessToken(companyId) {
  const id = companyId || 'agency';

  // 1. Check Vercel KV token cache first
  if (KV_URL && KV_TOKEN) {
    try {
      const cacheRes = await fetch(`${KV_URL}/get/tenant:crm:zoho:token:${id}`, {
        headers: { Authorization: `Bearer ${KV_TOKEN}` }
      });
      const cacheData = await cacheRes.json();
      if (cacheData.result) {
        const cached = JSON.parse(cacheData.result);
        if (cached.token && cached.domain) {
          console.log(`[ZOHO] Using cached access token for tenant ${id}.`);
          return cached;
        }
      }
    } catch (e) {
      console.error(`[ZOHO] Token cache read error for tenant ${id}:`, e);
    }
  }

  // 2. Fetch and decrypt stored credentials
  const creds = await getTenantCredentials(companyId);
  if (!creds.clientId || !creds.clientSecret || !creds.refreshToken) {
    console.error(`[ZOHO] Missing credentials for tenant ${id}.`);
    return null;
  }

  try {
    const params = new URLSearchParams({
      refresh_token: creds.refreshToken,
      client_id: creds.clientId,
      client_secret: creds.clientSecret,
      grant_type: "refresh_token"
    });

    const response = await fetch("https://accounts.zoho.in/oauth/v2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString()
    });

    const data = await response.json();
    if (data.access_token) {
      const result = { token: data.access_token, domain: creds.apiDomain };

      // 3. Cache the newly generated token in KV
      if (KV_URL && KV_TOKEN) {
        try {
          const ttl = data.expires_in ? Math.max(Number(data.expires_in) - 60, 60) : 3500; // 1-minute safety buffer
          await fetch(KV_URL, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${KV_TOKEN}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(['SET', `tenant:crm:zoho:token:${id}`, JSON.stringify(result), 'EX', String(ttl)])
          });
          console.log(`[ZOHO] Cached access token for tenant ${id} (TTL: ${ttl}s).`);
        } catch (cacheErr) {
          console.error(`[ZOHO] Token cache save error for tenant ${id}:`, cacheErr);
        }
      }

      return result;
    } else {
      console.error(`[ZOHO] Token refresh failed response for tenant ${id}:`, data);
      return null;
    }
  } catch (error) {
    console.error(`[ZOHO] Exception during token refresh for tenant ${id}:`, error);
    return null;
  }
}

// Create a Lead inside Zoho CRM
export async function createZohoLead(leadData, companyId) {
  const auth = await getAccessToken(companyId);
  if (!auth) {
    console.warn(`[ZOHO] Could not retrieve access token for tenant ${companyId || 'agency'}. Skipping lead sync.`);
    return false;
  }

  const description = [
    `Check-in Date: ${leadData.check_in_date || "Not Specified"}`,
    `Check-out Date: ${leadData.check_out_date || "Not Specified"}`,
    `Callback Time: ${leadData.callback_time || "Not Specified"}`,
    `Requirements: ${leadData.additional_requirements || "Direct Booking Request"}`,
    `Target Brand: ${leadData.target_builder || "Hospitality Client"}`
  ].join("\n");

  try {
    const response = await fetch(`${auth.domain}/crm/v2/Leads`, {
      method: "POST",
      headers: {
        "Authorization": `Zoho-oauthtoken ${auth.token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        data: [
          {
            "Last_Name": leadData.name,
            "Email": leadData.email || "",
            "Phone": leadData.phone || "",
            "Description": description,
            "Lead_Source": "WhatsApp AI Concierge",
            "Company": "AI Concierge Guest"
          }
        ]
      })
    });

    const data = await response.json();
    if (data.data && data.data[0] && data.data[0].status === "success") {
      console.log(`[ZOHO] Successfully registered Lead for tenant ${companyId || 'agency'}. Record ID: ${data.data[0].details.id}`);
      return true;
    } else {
      console.error(`[ZOHO] Lead creation failed for tenant ${companyId || 'agency'}:`, data);
      return false;
    }
  } catch (error) {
    console.error(`[ZOHO] Exception during lead creation for tenant ${companyId || 'agency'}:`, error);
    return false;
  }
}
