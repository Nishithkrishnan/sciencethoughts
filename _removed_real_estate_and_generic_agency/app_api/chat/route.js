import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

// Check if live agents are enabled
const liveAgentsEnabled = process.env.LIVE_AGENTS_ENABLED === "true";

// Helper to simulate a streaming response when API is deactivated
function simulateStreamingResponse(message, type) {
  let replyText = "";
  
  if (type === "researcher") {
    replyText = `### Simulated Neuro-Researcher Response\n\n*(Note: The live API is currently deactivated. This is a high-fidelity demonstration of how I explain scientific concepts via first principles.)*\n\nYour query regarding **"${message}"** touches on fascinating cognitive and scientific principles. \n\n1. **First Principles Analysis**: Let's break this down to the core truths. Any complex system behaves according to its fundamental physical constraints.\n2. **Synthesis of Current Literature**: Recent papers on this subject suggest that neural scaling laws and multi-agent coordination systems behave similarly to entropy distribution in thermodynamic systems.\n3. **Simplification**: In essence, we are looking at how information flows across boundaries. \n\nTo run actual deep-dives into real scientific databases and get dynamic synthesis, please toggle the **LIVE_AGENTS_ENABLED** environment variable and provide your API keys.`;
  } else if (type === "strategist") {
    replyText = `### Simulated Business Architect Workflow\n\n*(Note: The live API is currently deactivated. This demonstrates my workflow generation engine.)*\n\nTo automate the business process surrounding **"${message}"**, I recommend a 3-agent autonomous architecture:\n\n* **Agent A: The Intake & Analysis Node** (Ingests input, extracts core metadata, flags formatting anomalies).\n* **Agent B: The Execution Engine** (Processes the tasks via API integrations or database transactions).\n* **Agent C: The Evaluator** (Performs accuracy checks, reviews quality, and routes alerts to humans if exception thresholds are crossed).\n\nIf you enable the live AI engine, I will generate custom code templates, integration diagrams, and execution schedules dynamically for this workflow.`;
  } else {
    replyText = `### Simulated Concept Simplifier Analogies\n\n*(Note: The live API is currently deactivated. Here is a simplified analogy of your topic.)*\n\nExplaining **"${message}"** doesn't require complex jargon! Let's use an everyday analogy:\n\nImagine a busy restaurant kitchen. If you have only one chef (a single-agent AI), they get overwhelmed trying to chop vegetables, grill steaks, and plate desserts at the same time. \n\nBut if you hire three chefs and give each a specialized role (a multi-agent system)—one for prep, one for cooking, one for plating—they can cook ten times as many meals, smoothly communicating with each other. That is exactly how autonomous agent groups work!\n\nWhen live API routes are turned on, I can translate any complex science, physics, or tech topic you throw at me into custom, clear analogies like this one!`;
  }

  // Create a ReadableStream that yields chunks with slight delays to simulate streaming
  const encoder = new TextEncoder();
  const words = replyText.split(" ");
  let wordIndex = 0;

  const stream = new ReadableStream({
    async start(controller) {
      function push() {
        if (wordIndex >= words.length) {
          controller.close();
          return;
        }
        
        // Push 1-3 words at a time for natural speed
        const chunkCount = Math.min(Math.floor(Math.random() * 3) + 1, words.length - wordIndex);
        const chunk = words.slice(wordIndex, wordIndex + chunkCount).join(" ") + " ";
        wordIndex += chunkCount;
        
        controller.enqueue(encoder.encode(chunk));
        
        // Random typing speed (30ms - 80ms)
        setTimeout(push, Math.floor(Math.random() * 50) + 30);
      }
      push();
    }
  });

  return stream;
}

export async function POST(req) {
  try {
    const { messages, type } = await req.json();
    const lastMessage = messages[messages.length - 1]?.content || "";

    // 1. If API is deactivated, return simulated stream
    if (!liveAgentsEnabled) {
      const stream = simulateStreamingResponse(lastMessage, type);
      return new Response(stream, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    // 2. Determine agent personality/instructions
    let systemInstruction = "";
    if (type === "researcher") {
      systemInstruction = "You are the Neuro-Researcher, a scientific agent that analyzes concepts from first principles. Break down technical queries into basic truths. Synthesize details with strict academic rigor, but remain clear. Use markdown.";
    } else if (type === "strategist") {
      systemInstruction = "You are the AI Business Architect. Your task is to design autonomous agent workflows for business automation. Explain roles, triggers, communication protocols, and code mockups for agents.";
    } else {
      systemInstruction = "You are the Concept Simplifier. Your job is to translate complex scientific, AI, or physics topics into highly intuitive, simple analogies for non-technical users. Avoid jargon.";
    }

    // 3. Select model based on available API Keys
    let modelInstance;
    if (process.env.GEMINI_API_KEY) {
      modelInstance = google("gemini-2.5-flash");
    } else if (process.env.OPENAI_API_KEY) {
      modelInstance = openai("gpt-4o");
    } else {
      // Fallback to simulated if keys are missing
      const stream = simulateStreamingResponse(lastMessage, type);
      return new Response(stream, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    // 4. Stream response using Vercel AI SDK
    const result = await streamText({
      model: modelInstance,
      system: systemInstruction,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Error in AI Chat API route:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
