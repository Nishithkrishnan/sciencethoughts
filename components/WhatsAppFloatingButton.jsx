"use client";

import React, { useState } from "react";

export default function WhatsAppFloatingButton() {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "30px",
        right: "30px",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      {/* Tooltip */}
      <div
        style={{
          background: "rgba(10, 10, 12, 0.85)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(37, 211, 102, 0.3)",
          color: "#ffffff",
          padding: "8px 16px",
          borderRadius: "12px",
          fontSize: "0.85rem",
          fontWeight: "600",
          letterSpacing: "0.02em",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
          opacity: hovered ? 1 : 0,
          transform: hovered ? "translateX(0)" : "translateX(10px)",
          transition: "opacity 0.25s ease, transform 0.25s ease",
          pointerEvents: "none",
          whiteSpace: "nowrap",
        }}
      >
        Chat with AI Agent
      </div>

      {/* Button */}
      <a
        href="https://wa.me/15550118852"
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "#25D366", // WhatsApp Green
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: hovered 
            ? "0 0 25px rgba(37, 211, 102, 0.6), 0 4px 15px rgba(0, 0, 0, 0.4)" 
            : "0 4px 15px rgba(0, 0, 0, 0.3)",
          transition: "transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.25s ease",
          transform: hovered ? "scale(1.1)" : "scale(1)",
          cursor: "pointer",
        }}
        aria-label="Chat on WhatsApp with our AI Agent"
      >
        {/* WhatsApp SVG Icon */}
        <svg
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M18.398 5.602c-1.71-1.71-3.985-2.651-6.406-2.651-4.992 0-9.056 4.062-9.056 9.054 0 1.595.416 3.15 1.206 4.52L3 21l4.432-1.162a8.988 8.988 0 004.357 1.127h.004c4.99 0 9.054-4.063 9.054-9.054a8.982 8.982 0 00-2.649-6.409zm-6.406 13.784c-1.353 0-2.678-.363-3.834-1.052l-.275-.164-2.85.748.76-2.778-.178-.284A7.478 7.478 0 014.544 12.01c0-4.137 3.367-7.502 7.508-7.502 2.003 0 3.887.781 5.302 2.197a7.447 7.447 0 012.193 5.305c-.004 4.14-3.37 7.506-7.511 7.506v-.03zm4.12-5.617c-.226-.113-1.334-.658-1.541-.733-.207-.076-.358-.113-.509.113-.15.226-.583.733-.715.884-.132.15-.264.17-.49.057a6.223 6.223 0 01-1.819-1.12 6.84 6.84 0 01-1.258-1.564c-.132-.226-.014-.348.099-.461.102-.102.226-.264.339-.396.113-.132.15-.226.226-.377.075-.15.038-.283-.019-.396-.057-.113-.51-1.225-.697-1.677-.184-.44-.37-.38-.509-.387-.132-.007-.283-.007-.433-.007-.15 0-.396.056-.603.283-.207.226-.79.772-.79 1.883 0 1.112.81 2.186.923 2.337.113.15 1.593 2.432 3.86 3.411.54.233.96.372 1.288.476.541.172 1.034.148 1.423.09.434-.065 1.334-.546 1.522-1.073.189-.527.189-.979.132-1.073-.056-.094-.207-.15-.433-.263z"
            fill="#FFFFFF"
          />
        </svg>
      </a>
    </div>
  );
}
