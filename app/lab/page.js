// app/lab/page.js
"use client";

import EmailFilterDemo from "../../components/EmailFilterDemo";

export default function LabPage() {
  // Directly render the Email Filtering Agent demo
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-dark)",
      color: "#fff",
      paddingTop: "80px",
      paddingBottom: "100px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}>
      <div style={{ maxWidth: "800px", width: "100%" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: "900", textAlign: "center", marginBottom: "20px" }}>
          Email Filtering Agent Demo
        </h1>
        <EmailFilterDemo />
      </div>
    </div>
  );
}
