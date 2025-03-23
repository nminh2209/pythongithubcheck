import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../Login.css"; // Import the CSS file

export default function Login({ setUserId, setUser }) {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser?.id) {
      setUserId(storedUser.id);
      setUser(storedUser); // Ensure user is set
      navigate("/dashboard");
    }
  }, [setUserId, setUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const url = isSignUp
        ? "http://localhost:3001/api/signup"
        : "http://localhost:3001/api/login";
      const payload = isSignUp
        ? { username, email, password, wallet_address: walletAddress }
        : { email, password };
      const res = await axios.post(url, payload);

      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUserId(res.data.user.id);
      setUser(res.data.user);
      navigate("/dashboard");
    } catch (error) {
      setError(error.response?.data?.error || "Authentication failed.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>{isSignUp ? "Sign Up" : "Sign In"}</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <>
              <input
                type="text"
                className="auth-input"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <input
                type="text"
                className="auth-input"
                placeholder="Wallet Address"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
              />
            </>
          )}
          <input
            type="email"
            className="auth-input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            className="auth-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="auth-button">
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>
        <p onClick={() => setIsSignUp(!isSignUp)} className="toggle-text">
          {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
        </p>
      </div>
    </div>
  );
}
