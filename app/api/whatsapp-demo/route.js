import { NextResponse } from 'next/server';

const VERIFY_TOKEN = (process.env.WHATSAPP_VERIFY_TOKEN || "sciencethoughts_secure_token").trim();
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY?.trim();
const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL?.trim();

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

// Database Session helpers (Vercel KV with In-Memory fallback)
const KV_URL = (process.env.KV_REST_API_URL || process.env.REDIS_REST_API_URL || process.env.REDIS_REST_URL || "").trim();
const KV_TOKEN = (process.env.KV_REST_API_TOKEN || process.env.REDIS_REST_API_TOKEN || process.env.REDIS_REST_TOKEN || "").trim();

async function getSession(from) {
  if (KV_URL && KV_TOKEN) {
    try {
      const res = await fetch(`${KV_URL}/get/session:${from}`, {
        headers: { Authorization: `Bearer ${KV_TOKEN}` }
      });
      const data = await res.json();
      if (data.result) {
        return JSON.parse(data.result);
      }
    } catch (e) {
      console.error("[DEMO ROUTE] KV getSession failed, falling back to memory:", e);
    }
  }

  if (!conversationMemory.has(from)) {
    conversationMemory.set(from, { companyId: null, history: [] });
  }
  return conversationMemory.get(from);
}

async function saveSession(from, session) {
  if (KV_URL && KV_TOKEN) {
    try {
      await fetch(KV_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${KV_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(['SET', `session:${from}`, JSON.stringify(session), 'EX', '86400']) // expire in 24 hours
      });
      return;
    } catch (e) {
      console.error("[DEMO ROUTE] KV saveSession failed, falling back to memory:", e);
    }
  }
  conversationMemory.set(from, session);
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
          
          // 1. Retrieve conversation session
          const session = await getSession(from);
          const trimmedText = text.trim();

          // Handle reset command
          if (trimmedText.toLowerCase() === '/reset') {
            session.companyId = null;
            session.history = [];
            await saveSession(from, session);
            const greeting = `Demo Hub Reset! 🔄 Please select which builder's AI Assistant you would like to test:\n\n1. *Giridhari Constructions* (Hyderabad)\n2. *DAC Developers* (Chennai)\n3. *ASBL Builders* (Hyderabad)\n4. *Saritha Developers* (Bangalore)\n5. *Anvita Group* (Bangalore)\n\nReply with a number (*1-5*) to start the simulation!`;
            await sendWhatsAppMessage(phone_number_id, from, greeting);
            return new NextResponse('OK', { status: 200 });
          }

          // Handle selection mode
          if (session.companyId === null) {
            if (trimmedText === '1' || trimmedText === '2' || trimmedText === '3' || trimmedText === '4' || trimmedText === '5') {
              session.companyId = trimmedText;
              session.history = [];
              await saveSession(from, session);
              const companies = {
                '1': 'Giridhari Constructions',
                '2': 'DAC Developers',
                '3': 'ASBL Builders',
                '4': 'Saritha Developers',
                '5': 'Anvita Group'
              };
              const welcome = `Starting simulation for *${companies[trimmedText]}* AI Assistant! 🚀\n\nAsk me anything about our project inventory, prices, location, or availability. Send */reset* at any time to choose a different builder!`;
              await sendWhatsAppMessage(phone_number_id, from, welcome);
              return new NextResponse('OK', { status: 200 });
            } else {
              const greeting = `Welcome to the ScienceThoughts Demo Hub! Please select which builder's AI Assistant you would like to test:\n\n1. *Giridhari Constructions* (Hyderabad)\n2. *DAC Developers* (Chennai)\n3. *ASBL Builders* (Hyderabad)\n4. *Saritha Developers* (Bangalore)\n5. *Anvita Group* (Bangalore)\n\nReply with a number (*1-5*) to start the simulation!`;
              await sendWhatsAppMessage(phone_number_id, from, greeting);
              return new NextResponse('OK', { status: 200 });
            }
          }

          // Standard chat mode (we have a locked companyId)
          session.history.push({ role: "user", content: text });

          // Keep history capped at the last 10 messages (5 turns) to prevent token bloat
          if (session.history.length > 10) {
            session.history.shift();
            session.history.shift();
          }

          // 2. Query OpenAI (using Structured Output JSON mode)
          const aiPayload = await getOpenAIStructuredResponse(session.history, session.companyId);
          const aiResponseText = aiPayload.reply;
          const leadData = aiPayload.lead_extracted;

          // 3. Save assistant response to memory
          session.history.push({ role: "assistant", content: aiResponseText });
          await saveSession(from, session);

          // 4. Send the AI response back to the user via WhatsApp
          await sendWhatsAppMessage(phone_number_id, from, aiResponseText);

          // 5. If lead is qualified (Name found), push to Make CRM Webhook
          if (leadData && leadData.name) {
            if (!leadData.phone) {
              leadData.phone = from; // Auto-populate with incoming WhatsApp number
            }
            const companies = {
              '1': 'Giridhari Constructions',
              '2': 'DAC Developers',
              '3': 'ASBL Builders',
              '4': 'Saritha Developers',
              '5': 'Anvita Group'
            };
            leadData.target_builder = companies[session.companyId];
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

async function getOpenAIStructuredResponse(history, companyId) {
  if (!OPENAI_API_KEY) {
    console.warn("OPENAI_API_KEY is not set. Returning fallback message.");
    return {
      reply: "The ScienceThoughts AI brain is currently offline. Please provide your OpenAI API key in the environment variables.",
      lead_extracted: null
    };
  }

  let builderPrompt = "";

  if (companyId === '1') {
    builderPrompt = `You are the autonomous AI Sales Assistant for Giridhari Constructions, a premium residential builder in Hyderabad.

=== PROJECT KNOWLEDGE BASE ===

1. **Giridhari's Prospera County**
   - **Location:** Kismatpur, Hyderabad (near TSPA Junction, 15 mins drive from Gachibowli / Financial District).
   - **Project Type:** Ultra-luxury gated villa community and premium villa plots.
   - **Price Range:** 
     - 4 BHK Luxury Villas: ₹3.5 Crore to ₹5.2 Crore (depending on villa size).
     - Villa Plots: ₹1.2 Crore onwards.
   - **Current Availability:**
     - Out of 85 total units, only **4 ready-to-move-in villas** and **9 premium plots** are currently available.
   - **Key Amenities:** 25,000 sq.ft. clubhouse, swimming pool, tennis court, fully-equipped gym, children's play park, 24/7 security.
   - **Nearby Facilities:** Glendale International School (2 mins), Continental Hospital (12 mins), Outer Ring Road (TSPA exit - 3 mins).

2. **Giridhari's Skyscraper Residences**
   - **Location:** Kismatpur, Hyderabad (high-rise zone with panoramic views of Gandipet lake).
   - **Project Type:** Modern high-rise luxury apartments (2 BHK and 3 BHK).
   - **Price Range:**
     - 2 BHK Apartments (1350 sq.ft.): ₹95 Lakhs onwards (base price).
     - 3 BHK Apartments (1850 - 2200 sq.ft.): ₹1.35 Crore to ₹1.65 Crore.
   - **Current Availability:**
     - Under construction (Possession by Dec 2027). Pre-launch booking is open. Currently **62% of units are already booked**.
   - **Key Amenities:** Lakeview rooftop infinity pool, sky lounge, indoor sports arena, jogging track, supermarket in clubhouse.
   - **Nearby Facilities:** Financial District (18 mins drive), Glendale Academy (5 mins walk), Gandipet Park (8 mins).

3. **Future Projects (Upcoming):**
   - **Giridhari Chevella Meadows:** Premium agricultural farmhouse plots launching in Chevella (Q4 2026). Expected starting price: ₹65 Lakhs for 1/4 acre.`;
  } 
  
  else if (companyId === '2') {
    builderPrompt = `You are the autonomous AI Sales Assistant for DAC Developers, a premium residential builder in Chennai.

=== PROJECT KNOWLEDGE BASE ===

1. **DAC Prathyangira**
   - **Location:** Sholinganallur, OMR (Chennai IT Corridor).
   - **Project Type:** Premium 3 BHK luxury smart apartments.
   - **Price Range:**
     - 3 BHK Smart Apartments (1550 - 1800 sq.ft.): ₹1.15 Crore to ₹1.60 Crore.
   - **Current Availability:**
     - Out of 60 total units, only **6 luxury apartments** are currently available. Ready to occupy.
   - **Key Amenities:** Smart home automation, state-of-the-art security, clubhouse, gym, indoor play area, landscaped terrace garden.
   - **Nearby Facilities:** 15 mins to Chennai International Airport, direct corridor connection to top IT parks, 5 mins to major hospitals and international schools.

2. **DAC Medallion**
   - **Location:** Tambaram, Chennai.
   - **Project Type:** Elegant 2 & 3 BHK residential apartments.
   - **Price Range:**
     - 2 BHK Apartments (1100 sq.ft.): ₹75 Lakhs to ₹85 Lakhs.
     - 3 BHK Apartments (1400 sq.ft.): ₹95 Lakhs to ₹1.10 Crore.
   - **Current Availability:**
     - Under construction (Possession by Q3 2027). Currently **80% of units are already booked**.
   - **Key Amenities:** Swimming pool, gym, mini-theatre, children's park, multi-purpose hall.
   - **Nearby Facilities:** Tambaram Railway Station (8 mins), Madras Christian College (10 mins), Tambaram Hindu Mission Hospital (6 mins).`;
  } 
  
  else if (companyId === '3') {
    builderPrompt = `You are the autonomous AI Sales Assistant for ASBL Builders (Ashoka Builders), a luxury high-rise builder in Hyderabad.

=== PROJECT KNOWLEDGE BASE ===

1. **ASBL Loft**
   - **Location:** Financial District, Hyderabad (prime IT hub).
   - **Project Type:** Luxury high-rise 3 BHK apartments.
   - **Price Range:**
     - 3 BHK Premium Units (1900 - 2400 sq.ft.): ₹1.65 Crore to ₹2.10 Crore.
   - **Current Availability:**
     - Completed project. Only **8 luxury units** are currently available for immediate purchase.
   - **Key Amenities:** Double-height sky deck, Lakeview infinity pool, world-class sports courts, commercial retail zone in complex.
   - **Nearby Facilities:** 2 mins walk to major IT Parks (Google, Microsoft), Gachibowli flyover (5 mins), Outer Ring Road Kokapet exit (6 mins).

2. **ASBL Spire**
   - **Location:** Kokapet, Hyderabad.
   - **Project Type:** Ultra-luxury sky villas (3 BHK & 4 BHK).
   - **Price Range:**
     - 3 BHK Sky Villas (2500 sq.ft.): ₹1.90 Crore to ₹2.20 Crore.
     - 4 BHK Sky Villas (3200 sq.ft.): ₹2.50 Crore to ₹2.90 Crore.
   - **Current Availability:**
     - Under construction (Possession Dec 2028). Pre-launch booking open. Currently **55% of inventory is booked**.
   - **Key Amenities:** Private sky gardens, double-height ceilings, private elevator access, luxury salon & spa in clubhouse.
   - **Nearby Facilities:** Financial District (5 mins drive), Rockwell International School (8 mins), Continental Hospital (10 mins).`;
  } 
  
  else if (companyId === '4') {
    builderPrompt = `You are the autonomous AI Sales Assistant for Saritha Developers, a modern residential builder in Bangalore.

=== PROJECT KNOWLEDGE BASE ===

1. **Saritha Sunshine**
   - **Location:** Whitefield, Bangalore (ITPL corridor).
   - **Project Type:** Premium 2 BHK and 3 BHK apartments.
   - **Price Range:**
     - 2 BHK Units (1200 sq.ft.): ₹82 Lakhs onwards.
     - 3 BHK Units (1650 sq.ft.): ₹1.05 Crore to ₹1.15 Crore.
   - **Current Availability:**
     - Out of 100 total units, only **11 ready-to-move-in apartments** are currently available.
   - **Key Amenities:** Clubhouse, gym, rooftop pool, multi-sports court, children's park.
   - **Nearby Facilities:** ITPL Metro Station (5 mins), Columbia Asia Hospital (10 mins), Vydehi School (6 mins).

2. **Saritha Serene**
   - **Location:** Hope Farm Junction, Bangalore.
   - **Project Type:** Luxury gated villa community.
   - **Price Range:**
     - 4 BHK Independent Villas: ₹2.20 Crore to ₹3.10 Crore.
   - **Current Availability:**
     - Under construction (Possession Q4 2027). Currently **40% of villas are booked**.
   - **Key Amenities:** Central forest park, organic farming zone, world-class clubhouse, spa, swimming pool.
   - **Nearby Facilities:** Whitefield Main Road (3 mins), ITPL (8 mins), Shell Tech Park (15 mins).`;
  } 
  
  else if (companyId === '5') {
    builderPrompt = `You are the autonomous AI Sales Assistant for Anvita Group, a premium gated community developer in Bangalore and Hyderabad.

=== PROJECT KNOWLEDGE BASE ===

1. **Anvita Parkside**
   - **Location:** Kollur, Hyderabad (outer ring road exit).
   - **Project Type:** Gated community 3 BHK apartments.
   - **Price Range:**
     - 3 BHK Spacious Units (1750 - 2100 sq.ft.): ₹1.10 Crore to ₹1.45 Crore.
   - **Current Availability:**
     - Out of 120 total units, only **15 premium apartments** are currently available.
   - **Key Amenities:** 3-tier security, infinity pool, multi-cuisine restaurant inside clubhouse, kids play zone, gym.
   - **Nearby Facilities:** Immediate access to Outer Ring Road (1 min), 18 mins to Financial District, Glendale Academy (8 mins).

2. **Anvita Cove**
   - **Location:** Kollur, Hyderabad.
   - **Project Type:** Gated community ultra-luxury villas.
   - **Price Range:**
     - 4 BHK Independent Luxury Villas: ₹3.80 Crore to ₹4.90 Crore.
   - **Current Availability:**
     - Ready to move in. Only **3 luxury villas** are currently available.
   - **Key Amenities:** Private pools for selected villas, massive club deck, sports facility, private home theatre.
   - **Nearby Facilities:** Financial District (15 mins drive), Birla Open Minds School (6 mins), Continental Hospital (14 mins).`;
  }

  const systemInstruction = `${builderPrompt}

=== UNIVERSAL RULES & BEHAVIOR ===
- Be polite, professional, and helpful. 
- ALWAYS answer the user's questions first using the knowledge base.
- **HOW TO HANDLE CALLBACKS/CALLS:** If the user asks for a call, callback, or asks for someone to call them:
  1. Do NOT ask them for their phone number (the system already has it from their chat!).
  2. Confirm warmly that our representative will call them at their current number shortly. For example: "Absolutely! I have scheduled a callback. Our representative will contact you shortly on this number."
  3. If you do not know their name yet, ask: "Could I get your name so I know who our team should ask for?"
  4. Once they share their name, output it in the JSON "name" field.
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
  console.log(`- token suffix: ...${WHATSAPP_ACCESS_TOKEN.slice(-15)}`);

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
        builder: leadData.target_builder || "Giridhari Constructions",
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
