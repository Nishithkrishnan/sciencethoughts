import { NextResponse } from 'next/server';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "sciencethoughts_secure_token";
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;

// Simple in-memory cache to store conversation history (5 turns limit per user)
// Key: phone number, Value: Array of chat messages [{ role, content }]
const conversationMemory = new Map();

// GET method is used by Meta to verify the webhook URL
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log("Sandbox Demo Webhook verified successfully!");
    return new NextResponse(challenge, { status: 200 });
  } else {
    return new NextResponse('Forbidden', { status: 403 });
  }
}

// POST method receives the inbound WhatsApp messages
export async function POST(req) {
  try {
    const body = await req.json();
    
    // Validate that this is a WhatsApp API event
    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const messages = value?.messages;

      // If there is an inbound message
      if (messages && messages.length > 0) {
        const message = messages[0];
        const from = message.from; // User's phone number
        const text = message.text?.body; // What the user typed
        const phone_number_id = value.metadata.phone_number_id;

        if (text) {
          console.log(`[DEMO ROUTE] Received message from ${from}: ${text}`);
          
          // 1. Retrieve or initialize conversation history
          if (!conversationMemory.has(from)) {
            conversationMemory.set(from, []);
          }
          const history = conversationMemory.get(from);
          history.push({ role: "user", content: text });

          // Keep history capped at the last 10 messages (5 turns) to prevent token bloat
          if (history.length > 10) {
            history.shift();
            history.shift();
          }

          // 2. Query OpenAI (using Structured Output JSON mode)
          const aiPayload = await getOpenAIStructuredResponse(history);
          const aiResponseText = aiPayload.reply;
          const leadData = aiPayload.lead_extracted;

          // 3. Save assistant response to memory
          history.push({ role: "assistant", content: aiResponseText });

          // 4. Send the AI response back to the user via WhatsApp
          await sendWhatsAppMessage(phone_number_id, from, aiResponseText);

          // 5. If lead is qualified (Name + Phone found), push to Make CRM Webhook
          if (leadData && leadData.name && leadData.phone) {
            console.log(`[DEMO ROUTE] Lead Qualified! Pushing to CRM:`, leadData);
            await pushLeadToMake(leadData);
          }
        }
      }
      return new NextResponse('OK', { status: 200 });
    } else {
      return new NextResponse('Not Found', { status: 404 });
    }
  } catch (error) {
    console.error("[DEMO ROUTE] Webhook Error:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

async function getOpenAIStructuredResponse(history) {
  if (!OPENAI_API_KEY) {
    console.warn("OPENAI_API_KEY is not set. Returning fallback message.");
    return {
      reply: "The ScienceThoughts AI brain is currently offline. Please provide your OpenAI API key in the environment variables.",
      lead_extracted: null
    };
  }

  const systemInstruction = `You are the autonomous AI Sales Assistant for Giridhari Constructions, a premium residential builder in Hyderabad. 
Your goal is to answer buyers' questions about our projects and guide them toward scheduling a site visit or leaving their contact details (Name, Phone, and Budget).

Key Projects:
1. **Giridhari's Prospera County** (Kismatpur, near TSPA Junction): Premium villas and villa plots. Highlights: Secure gated community, world-class clubhouse, swimming pool, sports courts, and landscaped parks.
2. **Giridhari's Skyscraper Residences** (Kismatpur): Upcoming modern high-rise apartments with panoramic views. Highlights: Excellent connectivity to Gachibowli, state-of-the-art amenities, and spacious floor plans.

Rules:
- Be polite, professional, and helpful. 
- ALWAYS answer the user's questions first. 
- Do NOT demand contact details in the first message. Answer their questions first, and then ask: "Would you like me to share the brochure or schedule a site visit to the property?"
- Keep responses concise (under 3 sentences per message).

You must respond in JSON format with the following keys:
- "reply": The natural language reply to the user.
- "lead_extracted": An object containing the extracted details from the conversation history if they are mentioned. Only populate these if you are confident they have been provided. Keys: "name", "phone", "email", "budget". If a key is not found or has not been shared yet, set its value to null.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" }, // Forces structured output JSON
        messages: [
          { role: "system", content: systemInstruction },
          ...history
        ],
        max_tokens: 350,
      }),
    });

    const data = await response.json();
    const parsedContent = JSON.parse(data.choices[0].message.content.trim());
    return parsedContent;
  } catch (error) {
    console.error("[DEMO ROUTE] OpenAI Error:", error);
    return {
      reply: "I am currently experiencing a network issue connecting to my logic center. Please try again in a moment.",
      lead_extracted: null
    };
  }
}

async function sendWhatsAppMessage(phone_number_id, to, messageText) {
  if (!WHATSAPP_ACCESS_TOKEN) {
    console.warn("WHATSAPP_ACCESS_TOKEN is not set. Cannot send outbound message.");
    return;
  }

  console.log(`[DEMO ROUTE] Debug Info:`);
  console.log(`- phone_number_id: ${phone_number_id}`);
  console.log(`- token prefix: ${WHATSAPP_ACCESS_TOKEN.substring(0, 15)}...`);

  try {
    const response = await fetch(`https://graph.facebook.com/v19.0/${phone_number_id}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: to,
        type: "text",
        text: { body: messageText }
      })
    });

    const result = await response.json();
    if (result.error) {
      console.error("[DEMO ROUTE] Meta API Error:", result.error);
    } else {
      console.log(`[DEMO ROUTE] Successfully replied to ${to}`);
    }
  } catch (error) {
    console.error("[DEMO ROUTE] Failed to send WhatsApp message:", error);
  }
}

async function pushLeadToMake(leadData) {
  const url = MAKE_WEBHOOK_URL;
  if (!url) {
    console.warn("MAKE_WEBHOOK_URL environment variable is not set. Skipping CRM push.");
    return;
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: leadData.name,
        phone: leadData.phone,
        email: leadData.email,
        budget: leadData.budget,
        timestamp: new Date().toISOString()
      })
    });

    if (response.ok) {
      console.log("[DEMO ROUTE] Successfully pushed lead payload to Make Webhook.");
    } else {
      console.error("[DEMO ROUTE] Make Webhook responded with error status:", response.status);
    }
  } catch (error) {
    console.error("[DEMO ROUTE] Failed to push lead to Make:", error);
  }
}
