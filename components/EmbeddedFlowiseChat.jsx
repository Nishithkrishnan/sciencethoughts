"use client";

import React from "react";

export default function EmbeddedFlowiseChat() {
  return (
    <div style={{
      width: "100%",
      height: "600px",
      borderRadius: "16px",
      border: "1px solid var(--border-color)",
      overflow: "hidden",
      background: "rgba(10, 10, 12, 0.4)",
      boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      backdropFilter: "blur(4px)",
    }}>
      <iframe
        src="http://localhost:3000/chatbot/20340033-b7ad-49d4-a688-2c4eb4314191"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
        }}
        title="Science Thoughts Cognitive Assistant"
      />
    </div>
  );
}
