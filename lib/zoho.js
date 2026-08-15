/**
 * Zoho CRM Integration Service
 */

// Refresh the access token using the permanent refresh token
async function getAccessToken() {
  const clientId = process.env.ZOHO_CLIENT_ID;
  const clientSecret = process.env.ZOHO_CLIENT_SECRET;
  const refreshToken = process.env.ZOHO_REFRESH_TOKEN;
  
  if (!clientId || !clientSecret || !refreshToken) {
    console.error("[ZOHO] Missing credentials in environment variables.");
    return null;
  }

  try {
    const params = new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token"
    });

    const response = await fetch("https://accounts.zoho.in/oauth/v2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params.toString()
    });

    const data = await response.json();
    if (data.access_token) {
      return data.access_token;
    } else {
      console.error("[ZOHO] Token refresh failed:", data);
      return null;
    }
  } catch (error) {
    console.error("[ZOHO] Exception during token refresh:", error);
    return null;
  }
}

// Push lead payload directly to Zoho CRM
export async function createZohoLead(leadData) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    console.warn("[ZOHO] Could not retrieve access token. Skipping lead sync.");
    return false;
  }

  // Construct descriptive summary field for guest stay requests
  const description = [
    `Check-in Date: ${leadData.check_in_date || "Not Specified"}`,
    `Check-out Date: ${leadData.check_out_date || "Not Specified"}`,
    `Callback Time: ${leadData.callback_time || "Not Specified"}`,
    `Requirements: ${leadData.additional_requirements || "Direct Booking Request"}`,
    `Target Brand: ${leadData.target_builder || "Hospitality Client"}`
  ].join("\n");

  try {
    const response = await fetch("https://www.zohoapis.in/crm/v2/Leads", {
      method: "POST",
      headers: {
        "Authorization": `Zoho-oauthtoken ${accessToken}`,
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
      console.log(`[ZOHO] Successfully registered Lead in Zoho CRM. Record ID: ${data.data[0].details.id}`);
      return true;
    } else {
      console.error("[ZOHO] Lead creation failed:", data);
      return false;
    }
  } catch (error) {
    console.error("[ZOHO] Exception during lead creation:", error);
    return false;
  }
}
