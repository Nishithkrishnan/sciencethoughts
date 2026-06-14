// app/lab/page.js
"use client";

import EmailFilterDemo from "../../components/EmailFilterDemo";
import SystemArchitecture from "../../components/SystemArchitecture";

export default function LabPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-dark)",
      color: "#fff",
      paddingTop: "120px",
      paddingBottom: "100px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}>
      <div style={{ maxWidth: "800px", width: "100%" }}>
        <h1 style={{ fontSize: "3rem", fontWeight: "900", fontFamily: "var(--font-display)", textAlign: "center", marginBottom: "30px" }}>
          Email Filtering Agent Demo
        </h1>
        <EmailFilterDemo />
        <SystemArchitecture />
      </div>
    </div>
  );
}
