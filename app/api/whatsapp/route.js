import { NextResponse } from 'next/server';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "sciencethoughts_secure_token";
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// GET method is used by Meta to verify the webhook URL
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log("Webhook verified successfully!");
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
          console.log(`Received message from ${from}: ${text}`);
          
          // 1. Get autonomous response from OpenAI
          const aiResponse = await getOpenAIResponse(text);

          // 2. Send the AI response back to the user via WhatsApp
          await sendWhatsAppMessage(phone_number_id, from, aiResponse);
        }
      }
      return new NextResponse('OK', { status: 200 });
    } else {
      return new NextResponse('Not Found', { status: 404 });
    }
  } catch (error) {
    console.error("Webhook Error:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

async function getOpenAIResponse(userMessage) {
  if (!OPENAI_API_KEY) {
    console.warn("OPENAI_API_KEY is not set. Returning fallback message.");
    return "The ScienceThoughts AI brain is currently offline. Please provide your OpenAI API key in the environment variables.";
  }

  const prompt = `You are the autonomous AI Sales Assistant for DAC Developers, a premier residential builder in Chennai. 
Your goal is to answer buyers' questions about our projects and guide them toward booking a site visit or dropping their contact details.

Key Projects:
1. **DAC Prathyangira** (Sholinganallur, OMR): Luxury 2 & 3 BHK apartments starting from ₹85 Lakhs. Located 10 mins from ELCOT SEZ. Amenities include an infinity pool, clubhouse, and 100% power backup.
2. **DAC Medallion** (Medavakkam): Premium 2 & 3 BHK apartments starting from ₹75 Lakhs. Located near Medavakkam junction. Amenities include a fully equipped gym, landscaped gardens, and kids' play area.

Rules:
- Be polite, conversational, and helpful. 
- ALWAYS answer the user's questions first. 
- If a user says casual things like "sent by mistake", respond naturally (e.g., "No problem at all! Let me know if you ever want to check out our residential projects in Chennai. Have a great day!").
- Do NOT demand contact details (email/phone) in the first message. Answer their questions first, and then ask: "Would you like me to share the brochure or schedule a site visit for you?"
- Keep responses concise (under 3 sentences per message).`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Cost-effective, fast model
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: userMessage }
        ],
        max_tokens: 250,
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error("OpenAI Error:", error);
    return "I am currently experiencing a network issue connecting to my logic center. Please try again in a moment.";
  }
}

async function sendWhatsAppMessage(phone_number_id, to, messageText) {
  if (!WHATSAPP_ACCESS_TOKEN) {
    console.warn("WHATSAPP_ACCESS_TOKEN is not set. Cannot send outbound message.");
    return;
  }

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
      console.error("Meta API Error:", result.error);
    } else {
      console.log(`Successfully replied to ${to}`);
    }
  } catch (error) {
    console.error("Failed to send WhatsApp message:", error);
  }
}
