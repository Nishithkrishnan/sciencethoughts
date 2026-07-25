import { NextResponse } from 'next/server';

const VERIFY_TOKEN = (process.env.WHATSAPP_VERIFY_TOKEN || "sciencethoughts_secure_token").trim();
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY?.trim();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim();
const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL?.trim();

// Simple in-memory cache to store conversation history (5 turns limit per user)
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

// Company ID to Name mapping
const companiesMap = {
  '1': 'Giridhari Constructions',
  '2': 'DAC Developers',
  '3': 'ASBL Builders',
  '4': 'Saritha Developers',
  '5': 'Anvita Group',
  '6': 'Radiance Realty',
  '7': 'GP Homes',
  '8': 'Navin Housing',
  '9': 'Mango Alibaug Villas',
  '10': 'Century Real Estate',
  '11': 'Adarsh Developers',
  '12': 'Aparna Constructions',
  '13': 'Sumadhura Group',
  '14': 'My Home Constructions',
  '15': 'Brigade Group',
  '16': 'BBG India',
  '17': 'Arvind SmartSpaces',
  '18': 'The Machan',
  '19': 'Lost Traveller',
  '20': 'Arco Iris Homestay',
  '21': 'Destiny Farmstay',
  '22': 'Eko Stay',
  '23': 'The Rentalgram',
  '24': 'Melhor Stays',
  '25': 'StayVista',
  '26': 'SaffronStays',
  'agency': 'ScienceThoughts AI Agency'
};

// POST method receives inbound WhatsApp messages or Web Chat requests
export async function POST(req) {
  try {
    const body = await req.json();

    // Handle Direct Web Chat Requests from sciencethoughts.com website widget
    if (body.webChatMode) {
      const { text, companyId = "15", history = [] } = body;
      const formattedHistory = history.length > 0 ? history : [{ role: "user", content: text }];
      const aiPayload = await getOpenAIStructuredResponse(formattedHistory, companyId);
      
      // If lead extracted, attempt to push to CRM
      if (aiPayload.lead_extracted && aiPayload.lead_extracted.name) {
        aiPayload.lead_extracted.target_builder = companiesMap[companyId] || 'Web Demo Lead';
        aiPayload.lead_extracted.phone = 'Web Visitor';
        await pushLeadToMake(aiPayload.lead_extracted);
      }

      return NextResponse.json(aiPayload);
    }
    
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
          
          // Route permanent number ID to ScienceThoughts AI agency assistant
          const PERMANENT_PHONE_NUMBER_ID = (process.env.PERMANENT_PHONE_NUMBER_ID || "").trim();
          const isPermanentNumber = PERMANENT_PHONE_NUMBER_ID && (phone_number_id === PERMANENT_PHONE_NUMBER_ID);

          if (isPermanentNumber) {
            session.companyId = 'agency';
          }

          // Handle reset command (disabled for the permanent number)
          if (trimmedText.toLowerCase() === '/reset' && !isPermanentNumber) {
            session.companyId = null;
            session.history = [];
            await saveSession(from, session);
            
            const greeting = `Demo Hub Reset! 🔄 Please select which AI Assistant you would like to test:\n\n` +
              `1. *Giridhari Constructions* (Hyderabad)\n` +
              `2. *DAC Developers* (Chennai)\n` +
              `3. *ASBL Builders* (Hyderabad)\n` +
              `4. *Saritha Developers* (Bangalore)\n` +
              `5. *Anvita Group* (Bangalore)\n` +
              `6. *Radiance Realty* (Chennai)\n` +
              `7. *GP Homes* (Chennai)\n` +
              `8. *Navin Housing* (Chennai)\n` +
              `9. *Mango Alibaug Villas* (Alibaug Stay)\n` +
              `10. *Century Real Estate* (Bangalore)\n` +
              `11. *Adarsh Developers* (Bangalore)\n` +
              `12. *Aparna Constructions* (Hyderabad)\n` +
              `13. *Sumadhura Group* (Bangalore/Hyd)\n` +
              `14. *My Home Constructions* (Hyderabad)\n` +
              `15. *Brigade Group* (Bangalore)\n` +
              `16. *BBG India* (South India Plots)\n` +
              `17. *Arvind SmartSpaces* (Golf Villas)\n` +
              `18. *The Machan* (Lonavala Treehouses)\n` +
              `19. *Lost Traveller* (Goa Villas)\n` +
              `20. *Arco Iris Homestay* (South Goa Heritage)\n` +
              `21. *Destiny Farmstay* (Ooty Resort)\n` +
              `22. *Eko Stay* (Lonavala/Goa Villas)\n` +
              `23. *The Rentalgram* (Family Villas)\n` +
              `24. *Melhor Stays* (Goa Beach Villas)\n` +
              `25. *StayVista* (Premium Villa Chain)\n` +
              `26. *SaffronStays* (Premium Villa Network)\n\n` +
              `Reply with a number (*1-26*) to start the simulation!`;
            await sendWhatsAppMessage(phone_number_id, from, greeting);
            return new NextResponse('OK', { status: 200 });
          }

          // Handle selection mode
          if (session.companyId === null) {
            const num = parseInt(trimmedText);
            if (!isNaN(num) && num >= 1 && num <= 26) {
              session.companyId = trimmedText;
              session.history = [];
              await saveSession(from, session);
              const welcome = `Starting simulation for *${companiesMap[trimmedText]}* AI Assistant! 🚀\n\nAsk me anything about our properties, prices, locations, or availability. Send */reset* at any time to choose a different business!`;
              await sendWhatsAppMessage(phone_number_id, from, welcome);
              return new NextResponse('OK', { status: 200 });
            } else {
              // Default to Brigade Group (Option 15) for actual prospects who text 'Hi'
              session.companyId = '15';
              session.history = [];
              await saveSession(from, session);
            }
          }

          // 2. Append user message to history
          session.history.push({ role: 'user', content: text });
          if (session.history.length > 10) {
            session.history = session.history.slice(-10); // cap memory at last 5 turns
          }

          // 3. Call AI Pipeline (OpenAI -> Gemini -> Local Offline Fallback)
          const aiResponse = await getOpenAIStructuredResponse(session.history, session.companyId);
          const aiResponseText = aiResponse.reply;
          const leadData = aiResponse.lead_extracted;

          // Append assistant response to history
          session.history.push({ role: 'assistant', content: aiResponseText });
          await saveSession(from, session);

          // 4. Send the AI response back to the user via WhatsApp
          await sendWhatsAppMessage(phone_number_id, from, aiResponseText);

          // 5. If lead is qualified (Name found), push to Make CRM Webhook
          if (leadData && leadData.name) {
            if (!leadData.phone) {
              leadData.phone = from; // Auto-populate with incoming WhatsApp number
            }
            leadData.target_builder = companiesMap[session.companyId];
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

// Structured Property Knowledge Bases (1-26 & Agency)
function getCompanyKnowledge(companyId) {
  let prompt = "";

  if (companyId === '1') {
    prompt = `You are the autonomous AI Sales Assistant for Giridhari Constructions, a premium residential builder in Hyderabad.
=== PROJECT KNOWLEDGE BASE ===
1. **Giridhari's Prospera County**
   - Location: Kismatpur, Hyderabad (near TSPA Junction, 15 mins drive from Gachibowli / Financial District).
   - Project Type: Ultra-luxury gated villa community and premium villa plots.
   - Price: 4 BHK Luxury Villas start from ₹3.5 Crore to ₹5.2 Crore. Plots start from ₹1.2 Crore.
   - Availability: Only 4 ready ready-to-move-in villas and 9 plots left.
   - Amenities: 25,000 sq.ft. clubhouse, swimming pool, tennis court, gym, kids park.
2. **Giridhari's Skyscraper Residences**
   - Location: Kismatpur, Hyderabad ( Gandipet lake views).
   - Project Type: Modern high-rise luxury apartments (2 BHK and 3 BHK).
   - Price: 2 BHK starts from ₹95 Lakhs. 3 BHK ranges from ₹1.35 Crore to ₹1.65 Crore.
   - Availability: Under construction (Possession Dec 2027). 62% booked.`;
  } else if (companyId === '2') {
    prompt = `You are the autonomous AI Sales Assistant for DAC Developers, a premium residential builder in Chennai.
=== PROJECT KNOWLEDGE BASE ===
1. **DAC Prathyangira**
   - Location: Sholinganallur, OMR (Chennai IT Corridor).
   - Project Type: Premium 3 BHK luxury smart apartments.
   - Price: ₹1.15 Crore to ₹1.60 Crore.
   - Availability: 6 ready luxury apartments left.
   - Amenities: Smart home automation, clubhouse, gym, rooftop garden.
2. **DAC Medallion**
   - Location: Tambaram, Chennai.
   - Project Type: 2 & 3 BHK residential apartments.
   - Price: 2 BHK ranges from ₹75-85 Lakhs. 3 BHK ranges from ₹95 Lakhs to ₹1.10 Crore.
   - Availability: Under construction (Possession Q3 2027). 80% booked.`;
  } else if (companyId === '3') {
    prompt = `You are the autonomous AI Sales Assistant for ASBL Builders, a luxury high-rise builder in Hyderabad.
=== PROJECT KNOWLEDGE BASE ===
1. **ASBL Loft**
   - Location: Financial District, Hyderabad.
   - Project Type: Luxury high-rise 3 BHK apartments.
   - Price: ₹1.65 Crore to ₹2.10 Crore.
   - Availability: Ready to move in. Only 8 units left.
   - Amenities: Sky deck, infinity pool, commercial zone in complex.
2. **ASBL Spire**
   - Location: Kokapet, Hyderabad.
   - Project Type: Ultra-luxury sky villas (3 BHK & 4 BHK).
   - Price: 3 BHK starts from ₹1.90-2.20 Crore. 4 BHK starts from ₹2.50-2.90 Crore.
   - Availability: Under construction (Possession Dec 2028). 55% booked.`;
  } else if (companyId === '4') {
    prompt = `You are the autonomous AI Sales Assistant for Saritha Developers, a modern residential builder in Bangalore.
=== PROJECT KNOWLEDGE BASE ===
1. **Saritha Sunshine**
   - Location: Whitefield, Bangalore.
   - Project Type: Premium 2 BHK and 3 BHK apartments.
   - Price: 2 BHK starts from ₹82 Lakhs. 3 BHK ranges from ₹1.05-1.15 Crore.
   - Availability: 11 ready apartments left.
2. **Saritha Serene**
   - Location: Hope Farm Junction, Bangalore.
   - Project Type: Luxury gated villa community (4 BHK).
   - Price: ₹2.20 Crore to ₹3.10 Crore.
   - Availability: Possession Q4 2027. 40% booked.`;
  } else if (companyId === '5') {
    prompt = `You are the autonomous AI Sales Assistant for Anvita Group, a premium gated community developer in Hyderabad.
=== PROJECT KNOWLEDGE BASE ===
1. **Anvita Parkside**
   - Location: Kollur, Hyderabad (ORR exit).
   - Project Type: Gated community 3 BHK apartments.
   - Price: ₹1.10 Crore to ₹1.45 Crore.
   - Availability: 15 units available.
2. **Anvita Cove**
   - Location: Kollur, Hyderabad.
   - Project Type: Gated community ultra-luxury villas (4 BHK).
   - Price: ₹3.80 Crore to ₹4.90 Crore.
   - Availability: Ready to move in. Only 3 left.`;
  } else if (companyId === '6') {
    prompt = `You are the autonomous AI Sales Assistant for Radiance Realty, a premium residential builder in Chennai.
=== PROJECT KNOWLEDGE BASE ===
1. **Radiance Mandarina**
   - Location: Koyambedu, Chennai.
   - Project Type: Premium 2 & 3 BHK high-rise apartments.
   - Price: 2 BHK ranges from ₹85L-1.10Cr. 3 BHK ranges from ₹1.30-1.65Cr.
   - Availability: Ready to occupy. 8 units left.
2. **Radiance Ivy Terrace**
   - Location: Karapakkam, OMR, Chennai.
   - Project Type: Gated villa community (3 & 4 BHK).
   - Price: 3 BHK starts from ₹1.95Cr. 4 BHK ranges from ₹2.40-2.90Cr.
   - Availability: Possession Dec 2027. 52% booked.`;
  } else if (companyId === '7') {
    prompt = `You are the autonomous AI Sales Assistant for GP Homes, a modern residential builder in Chennai.
=== PROJECT KNOWLEDGE BASE ===
1. **GP Valencia**
   - Location: Kallikuppam, Ambattur, Chennai.
   - Project Type: Affordable premium 2 & 3 BHK apartments.
   - Price: 2 BHK ranges from ₹48-58L. 3 BHK ranges from ₹65-75L.
   - Availability: 11 units left.
2. **GP Pearl**
   - Location: Anna Nagar West Extension, Chennai.
   - Project Type: Super-premium 3 BHK apartments.
   - Price: ₹1.25 Crore to ₹1.45 Crore.
   - Availability: Ready to move in. Only 3 left.`;
  } else if (companyId === '8') {
    prompt = `You are the autonomous AI Sales Assistant for Navin Housing, a respected developer in Chennai.
=== PROJECT KNOWLEDGE BASE ===
1. **Navin's Starwood Towers**
   - Location: Vengaivasal, Medavakkam, Chennai.
   - Project Type: Premium 2 & 3 BHK apartments.
   - Price: 2 BHK ranges from ₹62-75L. 3 BHK ranges from ₹85L-1.10Cr.
   - Availability: Ready to occupy. 14 units left.
2. **Navin's Whiteberry**
   - Location: Moolakadai, Madhavaram, Chennai.
   - Project Type: High-rise 2 & 3 BHK luxury residences.
   - Price: 2 BHK ranges from ₹70-82L. 3 BHK ranges from ₹95L-1.25Cr.
   - Availability: Possession Dec 2026. 70% booked.`;
  } else if (companyId === '9') {
    prompt = `You are the autonomous AI Booking Assistant for Mango Alibaug Villas, a collection of premium, private luxury beach homes in Alibaug.
=== PROPERTY KNOWLEDGE BASE ===
1. **Mango Beach House (Kihim Beach)**
   - Location: Kihim, Alibaug (3 mins walk from beach, 20 mins from Mandwa Jetty).
   - Type: Luxury 4-BHK private pool villa in a lush mango orchard.
   - Rates: ₹28,000/night (weekday) / ₹35,000/night (weekend - Fri/Sat). Entire villa booking only.
   - Capacity: Sleeps up to 12 guests. Extra bed ₹1,500/night.
   - Amenities: Private pool, lawn, pool table, AC, generator backup, private chef available (meals packages: ₹1,500/adult/day).
   - House Rules: Pet-friendly (₹1,000 cleaning fee), check-in 1:00 PM, check-out 10:00 AM, quiet hours from 10:00 PM.
2. **Mango Villa Bougainvillea (Zirad)**
   - Location: Zirad, Alibaug (15 mins from Mandwa Jetty).
   - Type: Mediterranean-style 5-BHK private villa.
   - Rates: ₹32,000/night (weekday) / ₹42,000/night (weekend).
   - Capacity: Sleeps up to 15 guests. Private pool, cycles, private chef kitchen.`;
  } else if (companyId === '10') {
    prompt = `You are the autonomous AI Sales Assistant for Century Real Estate, Bangalore.
=== PROJECT KNOWLEDGE BASE ===
1. **Century Ethos**
   - Location: Hebbal, Bangalore.
   - Project Type: Ultra-luxury 3 & 4 BHK apartments.
   - Price: ₹2.80 Crore to ₹4.50 Crore.
   - Availability: Under construction. 18 units left.
2. **Century Breeze**
   - Location: Jakkur, Bangalore.
   - Project Type: Premium 2 & 3 BHK apartments.
   - Price: ₹95 Lakhs to ₹1.40 Crore.
   - Availability: Ready to move in. Only 5 units left.`;
  } else if (companyId === '11') {
    prompt = `You are the autonomous AI Sales Assistant for Adarsh Developers, Bangalore.
=== PROJECT KNOWLEDGE BASE ===
1. **Adarsh Sanctuary**
   - Location: Off Sarjapur Road, Bangalore.
   - Project Type: Eco-luxury 3 & 4 BHK forest-themed villas.
   - Price: ₹3.20 Crore to ₹4.80 Crore.
2. **Adarsh Palm Meadows**
   - Location: Whitefield, Bangalore.
   - Project Type: Ultra-premium luxury villas.
   - Price: ₹5.50 Crore to ₹8.50 Crore.`;
  } else if (companyId === '12') {
    prompt = `You are the autonomous AI Sales Assistant for Aparna Constructions, Hyderabad.
=== PROJECT KNOWLEDGE BASE ===
1. **Aparna Sarovar Zenith**
   - Location: Nallagandla, Gachibowli, Hyderabad.
   - Project Type: Premium eco-friendly 2, 3 & 4 BHK apartments.
   - Price: ₹1.10 Crore to ₹2.20 Crore.
2. **Aparna Zenon**
   - Location: Puppalaguda, near Financial District, Hyderabad.
   - Project Type: High-tech 2 & 3 BHK smart residences.
   - Price: ₹95 Lakhs to ₹1.60 Crore. Possession Dec 2026.`;
  } else if (companyId === '13') {
    prompt = `You are the autonomous AI Sales Assistant for Sumadhura Group, Bangalore & Hyderabad.
=== PROJECT KNOWLEDGE BASE ===
1. **Sumadhura Folium**
   - Location: Whitefield, Bangalore.
   - Project Type: Luxury 2, 3 & 4 BHK apartments.
   - Price: ₹1.20 Crore to ₹2.40 Crore.
2. **Sumadhura Horizon**
   - Location: Kondapur, near HITEC City, Hyderabad.
   - Project Type: Premium 2 & 3 BHK apartments.
   - Price: ₹95 Lakhs to ₹1.50 Crore.`;
  } else if (companyId === '14') {
    prompt = `You are the autonomous AI Sales Assistant for My Home Constructions, Hyderabad.
=== PROJECT KNOWLEDGE BASE ===
1. **My Home Avatar**
   - Location: Puppalaguda, Hyderabad.
   - Project Type: Gated township apartments (2 & 3 BHK).
   - Price: ₹85 Lakhs to ₹1.40 Crore.
2. **My Home Nishada**
   - Location: Kokapet, Financial District, Hyderabad.
   - Project Type: Ultra-luxury lakefront 3 & 4 BHK apartments.
   - Price: ₹2.10 Crore to ₹3.80 Crore.`;
  } else if (companyId === '15') {
    prompt = `You are the autonomous AI Sales Assistant for Brigade Group, Bangalore.
=== PROJECT KNOWLEDGE BASE ===
1. **Brigade Cornerstone Utopia**
   - Location: Varthur-Gunjur Road, Bangalore.
   - Project Type: High-tech integrated township apartments (1, 2 & 3 BHK).
   - Price: ₹65 Lakhs to ₹1.50 Crore.
2. **Brigade El Dorado**
   - Location: Aerospace Park, Bagalur, Bangalore.
   - Project Type: Premium 2 & 3 BHK residences.
   - Price: ₹45 Lakhs to ₹75 Lakhs.`;
  } else if (companyId === '16') {
    prompt = `You are the autonomous AI Sales Assistant for BBG India, open plot developer.
=== PROJECT KNOWLEDGE BASE ===
1. **BBG True Gold**
   - Location: Shadnagar, near Hyderabad.
   - Project Type: DTCP-approved open villa plots.
   - Price: ₹12 Lakhs to ₹25 Lakhs per plot.
2. **BBG True Solitaire**
   - Location: Sadashivpet, Mumbai Highway, Hyderabad.
   - Project Type: Layout open plots.
   - Price: ₹8 Lakhs to ₹18 Lakhs per plot.`;
  } else if (companyId === '17') {
    prompt = `You are the autonomous AI Sales Assistant for Arvind SmartSpaces, golf villas.
=== PROJECT KNOWLEDGE BASE ===
1. **Arvind Uplands**
   - Location: Adrej, Ahmedabad / Goa.
   - Project Type: Premium golf-themed villas.
   - Price: ₹1.80 Crore to ₹3.50 Crore.
2. **Arvind Greatlands**
   - Location: Devanahalli, Bangalore.
   - Project Type: Premium villa plots.
   - Price: ₹50 Lakhs to ₹95 Lakhs.`;
  } else if (companyId === '18') {
    prompt = `You are the autonomous AI Booking Assistant for The Machan, an exclusive eco-resort in Lonavala featuring luxury treehouses.
=== PROPERTY KNOWLEDGE BASE ===
1. **Canopy Machan & Starlight Machan**
   - Location: Atvan, Lonavala (30 mins from Lonavala station).
   - Type: Luxury eco-friendly treehouses suspended 30 to 45 feet above the forest canopy.
   - Rates: ₹18,000/night (weekday) / ₹26,000/night (weekend - Fri/Sat). Includes breakfast.
   - Capacity: Sleeps up to 3 adults.
   - Amenities: Private valley decks, outdoor bathtubs, solar-powered. No pets allowed.`;
  } else if (companyId === '19') {
    prompt = `You are the autonomous AI Booking Assistant for Lost Traveller, managing luxury private pool villas in Goa.
=== PROPERTY KNOWLEDGE BASE ===
1. **Villa Azure (Vagator, North Goa)**
   - Location: Vagator, North Goa (5 mins from Ozran Beach).
   - Type: Luxury 4-BHK private pool villa.
   - Rates: ₹35,000/night (weekday) / ₹45,000/night (weekend). Entire villa only.
   - Capacity: Sleeps up to 10 guests. Caretaker, pool, gazebo, Wi-Fi.
   - House Rules: Pet-friendly. Chef on call available (₹3,000/day).`;
  } else if (companyId === '20') {
    prompt = `You are the autonomous AI Booking Assistant for Arco Iris Boutique Homestay, a Portuguese heritage home in South Goa.
=== PROPERTY KNOWLEDGE BASE ===
1. **Arco Iris Heritage Rooms**
   - Location: Curtorim, South Goa (peaceful countryside overlooking lake).
   - Type: Restored 18th-century Portuguese manor with 5 color-themed luxury bedrooms.
   - Rates: ₹7,500/room/night (weekday) / ₹9,500/room/night (weekend). Includes breakfast.
   - Capacity: 2 adults per room. Pet-friendly. Authentic Goan home-cooked meals by host.`;
  } else if (companyId === '21') {
    prompt = `You are the autonomous AI Booking Assistant for Destiny Farmstay, a wilderness farm resort in Ooty.
=== PROPERTY KNOWLEDGE BASE ===
1. **Destiny Farmstay Resort**
   - Location: Avalanche Valley, Ooty (25 mins from town).
   - Type: Experiential lakeview farm resort with stable and agricultural farm.
   - Rates: ₹8,500/room/night (weekday) / ₹11,500/room/night (weekend).
   - Features: Horse riding, dairy farm tours, fishing, spa, adventure zipline.`;
  } else if (companyId === '22') {
    prompt = `You are the autonomous AI Booking Assistant for Eko Stay, a premier brand managing luxury private pool villas in Lonavala and Goa.
=== PROPERTY KNOWLEDGE BASE ===
1. **Villa Oasis (Lonavala)**
   - Location: Gold Valley, Lonavala.
   - Type: 4 BHK Private Pool Villa with mountain views.
   - Rates: ₹18,000/night (weekday) / ₹24,000/night (weekend).
   - Features: Private pool, lawn, pool table, carrom, kitchen, BBQ setup. Sleeps up to 12.
   - House Rules: Pet-friendly, check-in 2:00 PM, check-out 11:00 AM.
2. **Villa Sol (Candolim, Goa)**
   - Location: Candolim, North Goa (5 mins drive to beach).
   - Type: 3 BHK Portuguese-style luxury villa.
   - Rates: ₹22,000/night (weekday) / ₹28,000/night (weekend). Sleeps up to 8.`;
  } else if (companyId === '23') {
    prompt = `You are the autonomous AI Booking Assistant for The Rentalgram, offering premium curated family villas.
=== PROPERTY KNOWLEDGE BASE ===
1. **Villa Sage (Alibaug)**
   - Location: Mandwa Road, Alibaug (10 mins from jetty).
   - Type: Ultra-luxury 5 BHK Villa.
   - Rates: ₹35,000/night (weekday) / ₹45,000/night (weekend).
   - Features: Large private pool, landscaped gardens, private bar, AC, caretaker on-site. Sleeps 15.
2. **Bonheur Villa (Lonavala)**
   - Location: Khandala, Lonavala.
   - Type: 4 BHK Premium Family Villa with pool, kids play area, indoor games.
   - Rates: ₹25,000/night (weekday) / ₹32,000/night (weekend). Sleeps 12.`;
  } else if (companyId === '24') {
    prompt = `You are the autonomous AI Booking Assistant for Melhor Stays, managing high-end private villas in Goa.
=== PROPERTY KNOWLEDGE BASE ===
1. **Casa de Sol (Anjuna, Goa)**
   - Location: Anjuna, Goa (close to Purple Martini).
   - Type: Luxury beachfront 4 BHK villa with beach access.
   - Rates: ₹40,000/night (weekday) / ₹50,000/night (weekend). Sleeps 10.
   - Features: Private plunge pool, chef on call, security, high-speed Wi-Fi, fully serviced.
2. **Villa Bela Vista (Calangute, Goa)**
   - Location: Calangute, Goa.
   - Type: 3 BHK Luxury Villa with private garden, housekeeping, fully equipped kitchen.
   - Rates: ₹30,000/night (weekday) / ₹38,000/night (weekend). Sleeps 8.`;
  } else if (companyId === '25') {
    prompt = `You are the autonomous AI Booking Assistant for StayVista, India's largest luxury villa network.
=== PROPERTY KNOWLEDGE BASE ===
1. **Vista Grande (Ooty)**
   - Location: Lovedale, Ooty.
   - Type: 5 BHK Heritage Colonial Bungalow set in a tea estate.
   - Rates: ₹45,000/night (weekday) / ₹55,000/night (weekend). Sleeps 15.
   - Features: Tea garden view, fireplace, private lawn, pool table, chef service, premium linen.
2. **Vista Cliffhanger (Kasauli)**
   - Location: Kasauli, Himachal.
   - Type: 4 BHK luxury villa with mountain views.
   - Rates: ₹35,000/night (weekday) / ₹42,000/night (weekend). Jacuzzi, BBQ, bonfire area. Sleeps 10.`;
  } else if (companyId === '26') {
    prompt = `You are the autonomous AI Booking Assistant for SaffronStays, a network of premium private villas in India.
=== PROPERTY KNOWLEDGE BASE ===
1. **SaffronStays L'Attitude (Lake Vaitarna)**
   - Location: Khardi, Maharashtra (Lake Vaitarna waterfront).
   - Type: 3 BHK eco-friendly lakefront villa with organic dining.
   - Rates: ₹25,000/night (weekday) / ₹32,000/night (weekend). Sleeps 10.
   - Features: Lake views, pet-friendly, farm-to-table food, board games, quiet location.
2. **SaffronStays Salt Rim (Alibaug)**
   - Location: Korlai, Alibaug (beachfront).
   - Type: 2 BHK vintage villa overlooking the sea.
   - Rates: ₹20,000/night (weekday) / ₹26,000/night (weekend). Beach access, Konkani chef. Sleeps 6.`;
  } else {
    // ScienceThoughts AI Agency default
    prompt = `You are the autonomous AI Business Representative for ScienceThoughts, a premium B2B AI Automation Agency founded by Nishith Krishnan.
=== AGENCY KNOWLEDGE BASE ===
1. **Our Mission & Value Proposition:**
   - We build custom, high-performance, zero-hallucination Conversational AI Assistants for high-value industries like Real Estate developers and Luxury Hospitality stays.
   - We eliminate lead leakage by responding to queries in under 1.8s and syncing lead data directly to enterprise CRMs (Salesforce, Zoho, LeadSquared) in real-time.
   - Our agents are fully compliant with the Digital Personal Data Protection (DPDP) Act 2023.
2. **Core Features:**
   - Grounded RAG logic at Temperature 0.0 to prevent false claims.
   - Fluently bilingual in English, Hindi, Hinglish, Tamil, and Kannada.
   - Automatic CRM Webhook triggers.
3. **Pilot Offer & Pricing:**
   - Custom 14-day Staging Sandbox pilot for free.
   - Standard pricing: Setup starts at ₹75,000 / $1,000 (one-time) + monthly maintenance retainer.
4. **Booking:**
   - Book a 30-minute discovery call at: https://calendly.com/nishithmanu/30min
=== CONVERSION GOAL ===
- Qualify by asking for Name, Company Name, and Industry. Once shared, invite them to book a 30-min call using link: https://calendly.com/nishithmanu/30min`;
  }

  return prompt;
}

// Local simulation fallback engine in case both OpenAI and Gemini are offline
function simulateOfflineResponse(companyId, history) {
  const lastMessageObj = history[history.length - 1];
  const lastText = lastMessageObj?.content || "";
  const lower = lastText.toLowerCase();

  const companyName = companiesMap[companyId] || "Brigade Group";
  const isHospitality = ["9", "18", "19", "20", "21", "22", "23", "24", "25", "26"].includes(companyId);

  // Retrieve current lead state from history
  let extractedName = null;
  let extractedEmail = null;
  let extractedCheckInDate = null;
  let extractedCheckOutDate = null;
  let extractedCheckInTime = null;
  let extractedCheckOutTime = null;
  let extractedCallbackTime = null;
  let requirements = [];

  for (let i = history.length - 1; i >= 0; i--) {
    const msg = history[i];
    if (msg.role === 'user') {
      const txt = msg.content;
      const l = txt.toLowerCase();
      
      // Extract name
      const parts = txt.split(' ');
      if (parts.length <= 4 && !txt.includes('/') && !txt.includes('@') && !l.includes('book') && !l.includes('stay') && !l.includes('chef') && !l.includes('yes') && !l.includes('hi')) {
        extractedName = txt.trim();
      }
      // Extract email
      if (txt.includes('@') && txt.includes('.')) {
        extractedEmail = txt.trim();
      }
      // Extract requirements
      if (l.includes('chef') || l.includes('cook')) requirements.push("requires chef");
      if (l.includes('pet') || l.includes('dog') || l.includes('cat')) requirements.push("needs pet toys/facilities");
      if (l.includes('spa') || l.includes('massage')) requirements.push("spa service booking needed");
      if (l.includes('jacuzzi') || l.includes('pool')) requirements.push("pool access request");

      // Extract timings
      if (l.includes('early check') || l.includes('early checkin') || l.includes('early check-in')) {
        extractedCheckInTime = "early check-in requested";
      }
      if (l.includes('late check') || l.includes('late checkout') || l.includes('late check-out')) {
        extractedCheckOutTime = "late check-out requested";
      }
      if (l.includes('call back') || l.includes('call me') || l.includes('callback')) {
        extractedCallbackTime = "callback requested";
      }
    }
  }

  // State-Based Heuristics
  let reply = "";
  let lead_extracted = null;

  // Rule A: Greeting
  if (history.length <= 1 || lower === "hi" || lower === "hello" || lower === "hey" || lower === "reset") {
    reply = `Welcome to *${companyName}*! How can I assist you with checking availability, property specifications, pricing, or booking today?`;
  }
  // Rule A.5: Same-session booking check
  else if (lower.includes("booked already") || lower.includes("already booked") || lower.includes("booked for us") || lower.includes("you booked") || lower.includes("you register")) {
    if (extractedName) {
      reply = `Yes, absolutely! I have registered your pending booking request under the name *${extractedName}* ${extractedEmail ? `(Email: ${extractedEmail})` : ''}. Our manager will call you on this number shortly to finalize your stay.`;
    } else {
      reply = `I can certainly verify that for you. Could you please share your Name or check-in dates so I can check my active logs?`;
    }
  }
  // Rule B: Price inquiry
  else if (lower.includes("price") || lower.includes("rate") || lower.includes("cost") || lower.includes("tariff") || lower.includes("charge")) {
    if (isHospitality) {
      if (companyId === '9') {
        reply = `Our rates for Mango Beach House start at ₹28,000/night on weekdays and ₹35,000/night on weekends. Mango Villa Bougainvillea is ₹32,000/night (weekdays) and ₹42,000/night (weekends). Would you like to check availability?`;
      } else if (companyId === '18') {
        reply = `The Canopy Machan treehouse rates are ₹18,000/night (weekdays) and ₹26,000/night (weekends), including complimentary breakfast. Would you like me to block your dates?`;
      } else if (companyId === '19') {
        reply = `Villa Azure in Goa is ₹35,000/night (weekdays) and ₹45,000/night (weekends) for the entire 4 BHK villa. Shall I check booking availability for you?`;
      } else if (companyId === '20') {
        reply = `Arco Iris Heritage Rooms start at ₹7,500/room/night on weekdays and ₹9,500/room/night on weekends, including breakfast. Do you want to block a room?`;
      } else if (companyId === '21') {
        reply = `Destiny Farmstay room rates are ₹8,500/night (weekdays) and ₹11,500/night (weekends) with lake & farm views. Shall I check dates for you?`;
      } else if (companyId === '22') {
        reply = `Villa Oasis (Lonavala) is ₹18,000/night (weekdays) / ₹24,000/night (weekends). Villa Sol (Goa) is ₹22,000/night (weekdays) / ₹28,000/night (weekends). Shall we check dates?`;
      } else if (companyId === '23') {
        reply = `Villa Sage (Alibaug) rates are ₹35,000/night (weekdays) / ₹45,000/night (weekends). Bonheur Villa (Lonavala) is ₹25,000/night (weekdays) / ₹32,000/night (weekends). Shall I block it?`;
      } else if (companyId === '24') {
        reply = `Casa de Sol beachfront villa is ₹40,000/night (weekdays) / ₹50,000/night (weekends). Villa Bela Vista is ₹30,000/night (weekdays) / ₹38,000/night (weekends). Shall I look up dates?`;
      } else if (companyId === '25') {
        reply = `Vista Grande (Ooty Heritage) is ₹45,000/night (weekdays) / ₹55,000/night (weekends). Vista Cliffhanger (Kasauli) is ₹35,000/night (weekdays) / ₹42,000/night (weekends).`;
      } else if (companyId === '26') {
        reply = `SaffronStays L'Attitude (Lake Vaitarna) is ₹25,000/night (weekdays) / ₹32,000/night (weekends). Salt Rim (Alibaug beachfront) is ₹20,000/night (weekdays) / ₹26,000/night (weekends).`;
      } else {
        reply = `Rates range from ₹15,000 to ₹35,000 per night depending on the property selected. Shall we check your preferred dates?`;
      }
    } else {
      reply = `Prices range from ₹75 Lakhs to ₹3.5 Crores depending on the configuration (2, 3, or 4 BHK). Would you like me to share the exact pricing brochure or schedule a site visit?`;
    }
  }
  // Rule C: Amenities / Features
  else if (lower.includes("amenity") || lower.includes("facility") || lower.includes("pool") || lower.includes("gym") || lower.includes("pet") || lower.includes("chef") || lower.includes("food") || lower.includes("spa")) {
    if (isHospitality) {
      if (companyId === '9' || companyId === '19' || companyId === '22' || companyId === '23' || companyId === '24' || companyId === '26') {
        reply = `We feature a private swimming pool, Wi-Fi, 100% generator backup, caretakers, and a private chef on call to prepare local fresh delicacies. Selected properties are also pet-friendly. What dates are you planning?`;
      } else if (companyId === '18') {
        reply = `The treehouse features private decks, open-air bathtubs, forest views, and runs on solar power. To protect local wildlife, pets are not allowed. Shall we block dates?`;
      } else if (companyId === '21' || companyId === '25') {
        reply = `We feature horse riding, lake views, dairy farm visits, adventure ziplining, and organic local meals. Pet hosting can be arranged on request. What dates do you have in mind?`;
      } else {
        reply = `We offer private pools, high-speed Wi-Fi, fully equipped kitchens, games, and chef services. What dates would you like to request?`;
      }
    } else {
      reply = `We offer premium amenities including a fully equipped 25,000 sq.ft. clubhouse, swimming pool, sports courts, 24/7 security, power backup, and kids play zones. Shall I book a site visit?`;
    }
  }
  // Rule D: Booking Request / Schedule
  else if (lower.includes("book") || lower.includes("reserve") || lower.includes("visit") || lower.includes("schedule") || lower.includes("call") || lower.includes("yes")) {
    if (!extractedName) {
      reply = `I would be happy to organize that! Could you please share your **Name** so I can register your request?`;
    } else if (!extractedEmail && isHospitality) {
      reply = `Thank you, ${extractedName}! Could you please share your **Email Address** to send the reservation details?`;
    } else {
      reply = `Perfect! I have logged your request. A representative will contact you on this number shortly to confirm. Have a wonderful day!`;
    }
  }
  // Rule E: Name or Email Shared (Capture leads)
  else {
    if (lower.includes('@') && lower.includes('.')) {
      extractedEmail = lastText.trim();
      reply = `Thank you! I have updated your email to: ${extractedEmail}. Our manager will call you shortly to confirm dates and booking details.`;
    } 
    else if (lastText.split(' ').length <= 3) {
      extractedName = lastText.trim();
      if (isHospitality) {
        reply = `Nice to meet you, ${extractedName}! Could you please share your **Email Address** to finalize the booking reservation details?`;
      } else {
        reply = `Nice to meet you, ${extractedName}! What is your preferred date and time for a site visit or phone call?`;
      }
    } 
    else {
      reply = `I've noted that! Would you like me to check active booking availability, block your dates, or have a sales representative call you back?`;
    }
  }

  // Populate lead extraction if details are found
  if (extractedName) {
    lead_extracted = {
      name: extractedName,
      phone: null,
      email: extractedEmail || null,
      callback_time: extractedCallbackTime || null,
      check_in_date: extractedCheckInDate || "Next Weekend",
      check_out_date: extractedCheckOutDate || "Next Weekend",
      check_in_time: extractedCheckInTime || null,
      check_out_time: extractedCheckOutTime || null,
      additional_requirements: requirements.length > 0 ? requirements.join(', ') : "Direct Booking Requested",
      budget: isHospitality ? "25000" : "12500000"
    };
  }

  return {
    reply,
    lead_extracted
  };
}

// Google Gemini API integration (Gemini 2.0 Flash)
async function getGeminiResponse(history, systemInstruction) {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set.");
  }

  // Map roles to Gemini specifications ('assistant' -> 'model')
  const contents = history.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: contents,
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      generationConfig: {
        responseMimeType: "application/json"
      }
    })
  });

  const data = await response.json();
  
  if (data.error) {
    throw new Error(`Gemini API Error: ${data.error.message}`);
  }

  const rawText = data.candidates[0].content.parts[0].text.trim();
  const cleanContent = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
  return JSON.parse(cleanContent);
}

// Top-level LLM request orchestrator with fallbacks and extended CRM logging schema
async function getOpenAIStructuredResponse(history, companyId) {
  let builderPrompt = getCompanyKnowledge(companyId);

  const systemInstruction = `${builderPrompt}

=== UNIVERSAL RULES & BEHAVIOR ===
- Be polite, professional, and helpful. 
- **FIRST MESSAGE GREETING:** If the user sends a simple greeting (like "Hi", "Hello", "Hey") for the very first message in the history, ALWAYS reply with: "Welcome to [Company Name]! How can I assist you today?" (Make sure to replace [Company Name] with the actual company you represent).
- ALWAYS answer the user's questions first using the knowledge base.
- **HOW TO HANDLE CALLBACKS/CALLS:** If the user asks for a call, callback, or asks for someone to call them:
  1. Do NOT ask them for their phone number (the system already has it!).
  2. Ask for their **Name** and their **Preferred Time** for the call. For example: "I would be happy to arrange that! Could I get your name and your preferred time for the call?"
  3. Once they share their name and preferred time, confirm warmly that a representative will call them at their current number at their preferred time.
- **HOW TO HANDLE BOOKINGS/RESERVATIONS:** If the guest wants to book or check availability for the villas/resorts:
  1. Ask for their check-in and checkout dates, and the number of guests.
  2. Ask for their **Name** and **Email** so you can log the booking. Do NOT ask for their phone number (we already have it!).
  3. Once they provide the dates, name, and email, confirm warmly that their pending booking request has been logged and our manager will contact them to confirm.
- **SAME-SESSION BOOKING AWARENESS:** If the user asks 'did you book for us?' or references the booking they just made in the active chat session, check the conversation history above. Confirm the details warmly (e.g., "Yes, absolutely! I have registered your pending booking request for July 28th to 31st under the name Nishith (email: nishithmanu@gmail.com). Our manager will call you shortly to finalize."). Do NOT state that you do not have access to previous bookings if the details are right there in the chat history.
- Do NOT demand contact details in the first message. Answer their questions first, and then ask: "Would you like me to share the brochure or schedule a site visit to the property?" (For hospitality, ask: "Would you like me to check availability or block your booking dates?")
- Keep responses concise (under 3 sentences per message).

You must respond in JSON format with the following keys:
- "reply": The natural language reply to the user.
- "lead_extracted": An object containing the extracted details from the conversation history if they are mentioned. Only populate these if you are confident they have been provided. 
  Keys: 
  - "name": "string or null"
  - "phone": "string or null"
  - "email": "string or null"
  - "callback_time": "string or null (e.g. 'Tomorrow at 4 PM' if user requested call at specific time)"
  - "check_in_date": "string or null (e.g. 'Oct 12th')"
  - "check_out_date": "string or null (e.g. 'Oct 15th')"
  - "check_in_time": "string or null (e.g. 'early check-in at 10 AM')"
  - "check_out_time": "string or null (e.g. 'late check-out at 2 PM')"
  - "additional_requirements": "string summarizing dynamic requests (e.g., 'requires chef', 'spa service booking', 'needs pet toys') or null"
  - "budget": "string or null"`;

  // LEVEL 1: Primary Try (OpenAI)
  if (OPENAI_API_KEY) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemInstruction },
            ...history
          ],
          max_tokens: 350,
        }),
      });

      const data = await response.json();

      if (!data.error) {
        const rawContent = data.choices[0].message.content.trim();
        const cleanContent = rawContent.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsedContent = JSON.parse(cleanContent);
        return parsedContent;
      } else {
        console.error("[DEMO ROUTE] OpenAI API error response:", data.error.message);
      }
    } catch (error) {
      console.error("[DEMO ROUTE] OpenAI fetch request failed:", error);
    }
  }

  // LEVEL 2: Secondary Try (Google Gemini Failover)
  if (GEMINI_API_KEY) {
    try {
      console.log("[DEMO ROUTE] Triggering Google Gemini fallback...");
      const geminiPayload = await getGeminiResponse(history, systemInstruction);
      return geminiPayload;
    } catch (geminiError) {
      console.error("[DEMO ROUTE] Gemini fallback failed:", geminiError.message);
    }
  }

  // LEVEL 3: Emergency Offline Fallback
  console.log("[DEMO ROUTE] Triggering local simulation fallback...");
  return simulateOfflineResponse(companyId, history);
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
        callback_time: leadData.callback_time || null,
        check_in_date: leadData.check_in_date || null,
        check_out_date: leadData.check_out_date || null,
        check_in_time: leadData.check_in_time || null,
        check_out_time: leadData.check_out_time || null,
        additional_requirements: leadData.additional_requirements || null,
        budget: leadData.budget,
        builder: leadData.target_builder || "Brigade Group",
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
