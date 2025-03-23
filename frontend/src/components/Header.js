import React from "react";
import { Link } from "react-router-dom";
import "../Header.css";

function Header({ user, handleLogout }) {
  return (
    <header>
      <nav className="headercontent">
        <div className="logo">
          <Link to="/">
            <img src="/logofinhay.webp" alt="SmartInvest Logo" />
          </Link>
        </div>
        <ul>
          <li>
            <Link to="/trading" className="trade-now">
              Trade Now
            </Link>
          </li>
          <li>
            <Link to="/wallet" className="trade-now">
              Wallet
            </Link>
          </li>
          {user ? (
            <>
              <li>
                <span className="trade-now">Welcome, {user.username}</span>
              </li>
              <li>
                <button className="trade-now" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li>
              <Link to="/login" className="trade-now">
                Login
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Header;
