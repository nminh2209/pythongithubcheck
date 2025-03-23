import React, { useState } from "react";
import "../Home.css";
import { Card, CardContent } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Homepage() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle("dark-mode");
  };

  return (
    <div className={`homepage ${darkMode ? "dark-mode" : ""}`}>
      <button className="toggle-dark-mode" onClick={toggleDarkMode}>
        {darkMode ? "☀️ " : "🌙"}
      </button>

      <section className="banner" style={{ backgroundImage: "url('/photo1.webp')" }}>
        <h1>Invest smartly with SmartInvest</h1>
        <p>Safe and effective financial solutions for your future.</p>
        <button className="cta-button" onClick={() => navigate("/trading")}>
          Start now
        </button>
      </section>

      <section className="investment-section">
        <h2>Investment Packages</h2>
        <div className="investment-list">
          <Card className="investment-card">
            <CardContent>
              <h3>Turtle Package</h3>
              <p>Profit: 7%/year</p>
            </CardContent>
          </Card>
          <Card className="investment-card">
            <CardContent>
              <h3>Fox Package</h3>
              <p>Profit: 10%/year</p>
            </CardContent>
          </Card>
          <Card className="investment-card">
            <CardContent>
              <h3>Buffalo Package</h3>
              <p>Profit: 15%/year</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="features">
        <h2>Outstanding Features</h2>
        <div className="features-list">
          <div className="feature-item">💰 Easy investment</div>
          <div className="feature-item">📈 Attractive interest rates</div>
          <div className="feature-item">🔒 Safe & secure</div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-column">
            <h3>About Us</h3>
            <p>SmartInvest is a smart investment platform that helps you manage your finances easily.</p>
          </div>
          <div className="footer-column">
            <h3>Contact Us</h3>
            <p>Email: support@smartinvest.com</p>
            <p>Hotline: 1900 1234</p>
          </div>
          <div className="footer-column">
            <h3>Follow Us</h3>
            <p>📘 Facebook | 🐦 Twitter | 📷 Instagram</p>
          </div>
        </div>
        <p>© 2025 SmartInvest. All rights reserved.</p>
      </footer>
    </div>
  );
}
