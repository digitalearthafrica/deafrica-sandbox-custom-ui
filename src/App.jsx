import React, { useEffect, useState } from "react";
import SignUp from "./components/SignUp";
import "./styles.css";

export default function App() {
  const [cfg, setCfg] = useState(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/config/config.json", { cache: "no-store" });
      if (!res.ok) throw new Error("Missing /config/config.json");
      const json = await res.json();
      setCfg(json);
    }
    load().catch(console.error);
  }, []);

  if (!cfg) return <div style={{ padding: 24 }}>Loading…</div>;

  return (
    <div className="page">
      <header className="brand">
        <img src="/dea-logo.png" alt="DEA logo" />
      </header>

      <div className="card">
        <SignUp config={cfg} />
      </div>

      <p className="helper" style={{ marginTop: 16 }}>
        By continuing, you agree to our acceptable use policy.
      </p>
    </div>
  );
}
