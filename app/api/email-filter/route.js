import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

const liveAgentsEnabled = process.env.LIVE_AGENTS_ENABLED === "true";

export async function POST(req) {
  try {
    const { emailText } = await req.json();

    if (!emailText || !emailText.trim()) {
      return new Response(JSON.stringify({ error: "Email text is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    let resultJson = null;
    let fallbackToSim = true;

    // Try live LLM execution first if enabled and keys are present
    if (liveAgentsEnabled && (process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY)) {
      try {
        let modelInstance;
        if (process.env.GEMINI_API_KEY) {
          modelInstance = google("gemini-2.5-flash");
        } else {
          modelInstance = openai("gpt-4o");
        }

        const prompt = `
You are an advanced email filtering AI Agent designed to run inside a Make.com workflow.
Analyze the following email content and extract structured fields in JSON format:
1. "category": A classification (e.g., "Inquiry", "Support", "Marketing", "Urgent", "Personal", "Spam", "Billing").
2. "sentiment": Overall sentiment (e.g., "Positive", "Neutral", "Negative", "Frustrated", "Urgent").
3. "summary": A concise 1-sentence summary of the email body.
4. "priority": One of "High", "Medium", "Low".
5. "actionTaken": A short description of the automated workflow action (e.g., "Labeled as 'AI Filtered' & cataloged in Google Sheets", "Flagged for immediate response & cataloged in Google Sheets").

Respond ONLY with a valid JSON object. Do not include markdown code blocks or backticks.

Email Content:
"${emailText}"
`;

        const { text } = await generateText({
          model: modelInstance,
          prompt: prompt,
        });

        const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        resultJson = JSON.parse(cleanText);
        fallbackToSim = false; // Succeeded!
      } catch (err) {
        console.error("[EMAIL-FILTER] Live LLM generation failed, falling back to simulation:", err);
      }
    }

    // High-fidelity simulation mode fallback (crash-proof)
    if (fallbackToSim || !resultJson) {
      const lower = emailText.toLowerCase();

      if (lower.includes("invoice") || lower.includes("billing") || lower.includes("payment") || lower.includes("receipt")) {
        resultJson = {
          category: "Billing",
          sentiment: "Neutral",
          summary: "An invoice or billing transaction statement requiring financial log updates.",
          priority: "Medium",
          actionTaken: "Logged in Accounting Sheet & Labeled as 'AI Filtered'",
        };
      } else if (lower.includes("urgent") || lower.includes("asap") || lower.includes("broken") || lower.includes("error") || lower.includes("crash") || lower.includes("503")) {
        resultJson = {
          category: "Urgent Support",
          sentiment: "Negative / Frustrated",
          summary: "Time-critical system error or immediate request demanding fast support resolution.",
          priority: "High",
          actionTaken: "High-Priority Sheet Logged, Slack Notification sent, & Labeled as 'AI Filtered'",
        };
      } else if (lower.includes("subscribe") || lower.includes("sale") || lower.includes("discount") || lower.includes("click here") || lower.includes("newsletter") || lower.includes("pitch")) {
        resultJson = {
          category: "Marketing",
          sentiment: "Positive / Promotional",
          summary: "Promotional marketing communication, newsletter, or sales outreach campaign.",
          priority: "Low",
          actionTaken: "Archived/Cataloged in Marketing Logs & Labeled as 'AI Filtered'",
        };
      } else {
        resultJson = {
          category: "General Inquiry",
          sentiment: "Neutral",
          summary: "General inquiry or project correspondence needing standard review.",
          priority: "Medium",
          actionTaken: "Logged in Operations Google Sheet & Labeled as 'AI Filtered'",
        };
      }
    }

    return new Response(JSON.stringify(resultJson), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in email-filter API route:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
