import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import SignUp from "./components/SignUp";

export default function App() {
  const [cfg, setCfg] = useState(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/config/config.json", { cache: "no-store" });
      if (!res.ok) throw new Error("Missing /config/config.json");
      const json = await res.json();
      setCfg(json);
    }
    load().catch((e) => console.error(e));
  }, []);

  if (!cfg) return <div style={{ padding: 24 }}>Loading…</div>;

  const cognitoLoginUrl = `https://${cfg.userPoolDomain}.auth.${cfg.region}.amazoncognito.com/login?client_id=${cfg.clientId}&response_type=code&redirect_uri=${encodeURIComponent(cfg.redirectUri)}&scope=email+openid+profile`;

  return (
    <Router>
      <div style={{ maxWidth: 520, margin: "40px auto", fontFamily: "system-ui, sans-serif" }}>
        <h1 style={{ marginBottom: 8 }}>DEA Sandbox — Authentication</h1>
        <nav style={{ marginBottom: 16 }}>
          <Link to="/signup" style={{ marginRight: 8 }}>Sign Up</Link>
          <a href={cognitoLoginUrl}>Sign In</a>
        </nav>
        <Routes>
          <Route path="/signup" element={<SignUp cfg={cfg} />} />
          <Route path="*" element={<SignUp cfg={cfg} />} />
        </Routes>
        <p style={{ marginTop: 32, fontSize: 12, color: "#555" }}>
          By continuing, you agree to our acceptable use policy.
        </p>
      </div>
    </Router>
  );
}
