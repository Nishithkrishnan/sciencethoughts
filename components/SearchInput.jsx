"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";

export default function SearchInput() {
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      // Scroll to Think Tank (blog) section
      const blogSection = document.getElementById("blog");
      if (blogSection) {
        blogSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <form onSubmit={handleSearchSubmit} style={{ position: "relative", display: "flex", alignItems: "center" }}>
      <Search size={18} style={{ position: "absolute", left: "16px", color: focused ? "var(--accent-teal)" : "var(--text-muted)", zIndex: 1, transition: "var(--transition-fast)" }} />
      <input 
        type="text" 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search the Think Tank..." 
        style={{ 
          padding: "16px 20px 16px 50px", 
          width: "320px", 
          background: "rgba(255, 255, 255, 0.03)", 
          border: focused ? "1px solid var(--accent-teal)" : "1px solid var(--border-color)", 
          borderRadius: "40px", 
          color: "#fff", 
          outline: "none", 
          fontSize: "1rem", 
          transition: "var(--transition-smooth)" 
        }} 
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </form>
  );
}
