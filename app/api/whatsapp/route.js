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

  const prompt = `You are the autonomous AI assistant for ScienceThoughts, an elite B2B AI Automation Agency. 
Your goal is to answer questions concisely, professionally, and drive the user to book an AI audit call.
Key Information:
- We build custom LangChain autonomous agents for luxury hospitality, resorts, and vacation villa networks.
- Our primary pitch: "We replace frustrating, rule-based chatbots with intelligent agents that plug directly into your WhatsApp and CRM, stopping you from bleeding expensive Meta Ad traffic."
- Our pricing: Setup Fee is ₹75,000 (one-time) and Monthly Retainer is ₹25,000/month.
- Tone: Strict, highly competent, professional, no-bullshit.
- Do not hallucinate features. If they ask to book, tell them to visit sciencethoughts.com or drop their email.`;

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
