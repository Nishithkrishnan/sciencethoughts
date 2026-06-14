"use client";

import { useEffect } from "react";

export default function FlowiseChatbot() {
  useEffect(() => {
    // Prevent loading multiple instances
    if (window.Chatbot) return;

    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://cdn.jsdelivr.net/npm/flowise-embed/dist/web.js";
    script.async = true;
    
    script.onload = () => {
      if (window.Chatbot) {
        window.Chatbot.init({
          chatflowid: "20340033-b7ad-49d4-a688-2c4eb4314191",
          apiHost: "http://localhost:3000",
          theme: {
            button: {
              backgroundColor: "#00f2ff", // accent-teal matching the design system
              right: 30,
              bottom: 30,
              size: 48,
              dragAndDrop: false,
              iconColor: "#000000",
            },
            chatWindow: {
              welcomeMessage: "Hi! I'm the Science Thoughts cognitive assistant. Ask me anything about Nishith, the Email Filtering Agent, or the blog articles!",
              backgroundColor: "#0d0d11", // matches var(--bg-dark)
              fontSize: 15,
              userMessage: {
                backgroundColor: "#00f2ff",
                textColor: "#000000",
              },
              agentMessage: {
                backgroundColor: "rgba(255, 255, 255, 0.04)",
                textColor: "#ffffff",
              },
              textInput: {
                placeholder: "Type your question...",
                backgroundColor: "rgba(0, 0, 0, 0.2)",
                textColor: "#ffffff",
                sendButtonColor: "#00f2ff",
              }
            }
          }
        });
      }
    };

    document.body.appendChild(script);

    return () => {
      // Clean up script if component unmounts
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return null;
}
