import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import SignUp from "./components/SignUp";
import logo from './assets/DE_Africa_Logo_Primary_RGB_1.png';
import './App.css';

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

  return (
    <Router>
      <div className="app">
        <header>
          <img src={logo} alt="Digital Earth Africa" />
          <nav>
            <a href="https://digitalearthafrica.org/" target="_blank" rel="noopener noreferrer">Home</a>
            <a href="https://docs.digitalearthafrica.org/" target="_blank" rel="noopener noreferrer">User Guide</a>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/signup" element={<SignUp cfg={cfg} />} />
          </Routes>
        </main>
        <footer>
          <p>
            © Digital Earth Africa | <a href="https://docs.digitalearthafrica.org/en/latest/sandbox/termsconditions.html" target="_blank" rel="noopener noreferrer">Terms and Conditions</a>
          </p>
        </footer>
      </div>
    </Router>
  );
}
