"use client";

import React, { useEffect, useRef } from "react";

export default function EmbeddedFlowiseChat() {
  const containerRef = useRef(null);

  useEffect(() => {
    // We dynamically load the Web script and mount the chatbot inline in the container
    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://cdn.jsdelivr.net/npm/flowise-embed/dist/web.js";
    script.async = true;

    script.onload = () => {
      if (window.Chatbot && containerRef.current) {
        // Clear container to avoid duplicate chatbot elements
        containerRef.current.innerHTML = "";

        // Flowise embed allows creating a chatbot element inline inside a target element
        const chatbotElement = document.createElement("flowise-chatbot");
        
        // We configure it to render fullpage inside our div wrapper
        window.Chatbot.init({
          chatflowid: "20340033-b7ad-49d4-a688-2c4eb4314191",
          apiHost: "http://localhost:3000",
          theme: {
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

        // Set attributes to render it fullpage inline instead of bubble
        chatbotElement.setAttribute("chatflowid", "20340033-b7ad-49d4-a688-2c4eb4314191");
        chatbotElement.setAttribute("apiHost", "http://localhost:3000");
        
        // Style it to fill our parent container containerRef
        containerRef.current.appendChild(chatbotElement);
      }
    };

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="flowise-chat-container"
      style={{
        width: "100%",
        height: "600px",
        borderRadius: "16px",
        border: "1px solid var(--border-color)",
        overflow: "hidden",
        background: "rgba(10, 10, 12, 0.4)",
        boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        position: "relative",
      }}
    />
  );
}
