"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Bot, User, RefreshCw, CheckCircle2, Sparkles } from "lucide-react";

export default function InteractiveWebDemo() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Welcome to The Machan! How can I assist you with checking cabin availability, rates, or forest treehouse amenities today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [companyId, setCompanyId] = useState("18"); // Default to The Machan (18)
  const chatEndRef = useRef(null);

  const companies = {
    "18": "The Machan (Lonavala Resort)",
    "9": "Mango Alibaug Villas (Alibaug Stay)",
    "22": "Eko Stay (Lonavala/Goa Villas)",
    "23": "The Rentalgram (Family Villas)",
    "24": "Melhor Stays (Goa Beach Villas)",
    "25": "StayVista (Premium Villa Chain)",
    "26": "SaffronStays (Premium Villa Network)",
    "27": "Lohono Stays (Premium Villas)",
    "28": "amã Stays & Trails (Taj Group)",
    "29": "ELIVAAS (Luxury Homestays)",
    "30": "Barefoot at Havelock (Andaman Resort)",
    "31": "Roamhome (Holiday Homes)",
    "32": "Elite Havens (Ultra-Luxury)",
    "33": "Tripvillas (Beachfront Stays)",
    "34": "Sol de Goa (Boutique Stay)",
    "35": "LuxUnlock (Heritage Villas)",
    "36": "Abode Bombay (Boutique Hotel)",
    "37": "The Postcard Hotel (Boutique Resorts)",
    "38": "Seclude Hotels (Experiential Rentals)",
    "39": "Coco Shambhala (Goa Villas)",
    "40": "Royal Garden Villas (Pool Villas)",
    "41": "Ebony Stays (Private Villas)",
    "42": "29Bungalow (Infinity Villas)",
    "43": "Villa Rentals Goa (Pool Stays)",
    "44": "Araiya Hotels (Boutique Hotels)",
    "45": "The Goa Villas (Luxury Villa Collection)",
    "46": "Stay Willas (Lonavala Villas)",
    "47": "The Khyber Himalayan Resort & Spa (Gulmarg Ski Resort)",
    "48": "Glenburn Tea Estate (Darjeeling Tea Estate)",
    "49": "Neemrana Hotels (Heritage Fort-Palaces)",
    "50": "CGH Earth (Kerala Eco-Luxury Resorts)",
    "51": "Rhythm Hospitality (Lonavala/Kumarakom Resorts)",
    "52": "Ahilya Fort (Maheshwar Royal Heritage)",
    "53": "The Tree House Resort, Jaipur (Eco-Luxury Treehouses)",
    "54": "Leisure Hotels Group (Uttarakhand Boutique Resorts)",
    "55": "Jehan Numa Palace (Bhopal Heritage Palace)",
    "56": "The Bison, Kabini (Kabini Wildlife Lodge)",
    "57": "Suján Jawai (Rajasthan Leopard Camp)",
    "58": "Khem Villas (Ranthambore Eco-Lodge)",
    "59": "The Belgadia Palace (Odisha Royal Heritage)",
    "60": "Jalakara (Andaman Islands Villa)",
    "61": "The Kumaon (Himalayan Boutique Lodge)",
    "62": "Vivenda Dos Palhaços (Goa Heritage Guesthouse)",
    "63": "Marari Villas (Kerala Beach Villas)",
    "64": "Alsisar Mahal (Shekhawati Heritage Palace)",
    "65": "Windermere Estate (Munnar Plantation Bungalow)"
  };

  useEffect(() => {
    if (messages.length > 1) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlCompanyId = params.get("c") || params.get("companyId") || params.get("tenant");
      if (urlCompanyId && companies[urlCompanyId]) {
        setCompanyId(urlCompanyId);
        const companyName = companies[urlCompanyId].split(" (")[0];
        const isHospitality = true; // All curated selections are hospitality
        
        let welcomeMsg = `Welcome to ${companyName}! How can I help you with checking villa availability, rates, or booking your stay today?`;

        setMessages([
          { role: "assistant", content: welcomeMsg }
        ]);
      }
    }
  }, []);

  const handleCompanyChange = (e) => {
    const newId = e.target.value;
    setCompanyId(newId);
    const companyName = companies[newId].split(" (")[0];
    const welcomeMsg = `Welcome to ${companyName}! How can I help you with checking villa availability, rates, or booking your stay today?`;

    setMessages([
      { role: "assistant", content: welcomeMsg }
    ]);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    const newHistory = [...messages, { role: "user", content: userMsg }];
    setMessages(newHistory);
    setLoading(true);

    try {
      // Call our Next.js API route directly
      const res = await fetch("/api/whatsapp-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          webChatMode: true,
          text: userMsg,
          companyId: companyId,
          history: newHistory.slice(-6), // Pass last 3 turns — this is what the AI model sees
          full_history: newHistory // Full conversation so far — used only for the lead transcript log
        })
      });

      const data = await res.json();
      if (data && data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: "I would be happy to help! Could I get your name and preferred callback time?" }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Apologies, I encountered a temporary connection issue. Please try typing again!" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    const companyName = companies[companyId].split(" (")[0];
    const welcomeMsg = `Welcome to ${companyName}! How can I help you with checking villa availability, rates, or booking your stay today?`;

    setMessages([
      { role: "assistant", content: welcomeMsg }
    ]);
  };

  return (
    <div className="glass-panel" style={{ borderRadius: "24px", border: "1px solid rgba(0, 242, 255, 0.2)", background: "rgba(10, 12, 18, 0.7)", overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
      {/* Header */}
      <div style={{ padding: "20px 25px", borderBottom: "1px solid var(--border-color)", background: "rgba(15, 20, 30, 0.8)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "15px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ padding: "10px", borderRadius: "12px", background: "rgba(0, 242, 255, 0.1)", color: "var(--accent-teal)", border: "1px solid rgba(0, 242, 255, 0.2)" }}>
            <Bot size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
              Live AI Concierge Interactive Demo
              <span style={{ fontSize: "0.7rem", padding: "2px 8px", borderRadius: "20px", background: "rgba(57, 255, 20, 0.15)", color: "var(--accent-green)", border: "1px solid rgba(57, 255, 20, 0.3)" }}>KB-GROUNDED</span>
            </h3>
            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "2px" }}>Select a resort or villa brand to test availability queries</p>
          </div>
        </div>

        {/* Company Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <select 
            value={companyId} 
            onChange={handleCompanyChange}
            style={{ background: "#0a0c14", color: "#fff", border: "1px solid var(--border-color)", padding: "8px 14px", borderRadius: "10px", fontSize: "0.88rem", outline: "none", cursor: "pointer" }}
          >
            {Object.entries(companies).map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>

          <button 
            onClick={handleReset} 
            title="Reset Chat"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", color: "var(--text-secondary)", padding: "8px", borderRadius: "10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Chat Messages Body */}
      <div style={{ padding: "25px", height: "380px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px", background: "rgba(5, 7, 12, 0.4)" }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ display: "flex", gap: "12px", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            {msg.role === "assistant" && (
              <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "rgba(0, 242, 255, 0.15)", border: "1px solid rgba(0, 242, 255, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-teal)", flexShrink: 0 }}>
                <Bot size={18} />
              </div>
            )}

            <div style={{ 
              maxWidth: "78%", 
              padding: "14px 18px", 
              borderRadius: msg.role === "user" ? "18px 18px 2px 18px" : "18px 18px 18px 2px",
              background: msg.role === "user" ? "linear-gradient(135deg, rgba(0, 242, 255, 0.2), rgba(188, 19, 254, 0.2))" : "rgba(20, 25, 35, 0.8)",
              border: msg.role === "user" ? "1px solid rgba(0, 242, 255, 0.3)" : "1px solid rgba(255, 255, 255, 0.08)",
              color: "#fff",
              fontSize: "0.93rem",
              lineHeight: "1.5"
            }}>
              {msg.content}
            </div>

            {msg.role === "user" && (
              <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "rgba(188, 19, 254, 0.15)", border: "1px solid rgba(188, 19, 254, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-violet)", flexShrink: 0 }}>
                <User size={18} />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "rgba(0, 242, 255, 0.15)", border: "1px solid rgba(0, 242, 255, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-teal)" }}>
              <Bot size={18} />
            </div>
            <div style={{ padding: "12px 18px", borderRadius: "18px", background: "rgba(20, 25, 35, 0.8)", border: "1px solid rgba(255, 255, 255, 0.08)", color: "var(--text-muted)", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "8px" }}>
              <Sparkles size={14} className="animate-spin" /> Querying custom property knowledge base...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} style={{ padding: "15px 20px", borderTop: "1px solid var(--border-color)", background: "rgba(10, 12, 18, 0.9)", display: "flex", gap: "12px" }}>
        <input 
          type="text" 
          placeholder="Ask about treehouse availability, weekday rates, wildlife policies, or request a booking..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ flexGrow: 1, background: "#060810", color: "#fff", border: "1px solid var(--border-color)", padding: "12px 18px", borderRadius: "12px", fontSize: "0.92rem", outline: "none" }}
        />
        <button 
          type="submit" 
          disabled={loading || !input.trim()}
          style={{ background: "linear-gradient(135deg, var(--accent-teal), var(--accent-violet))", border: "none", color: "#000", fontWeight: "700", padding: "12px 20px", borderRadius: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", opacity: loading || !input.trim() ? 0.5 : 1 }}
        >
          Send <Send size={16} />
        </button>
      </form>
    </div>
  );
}
