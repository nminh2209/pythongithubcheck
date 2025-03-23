import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Wallet from "./Wallet";
import { WalletProvider } from "./WalletContext";
import Header from "./Header";
import AuthPage from "./Login";
import TradingPlatform from "./TradingPlatform";
import Home from "./Home";
import Dashboard from "./Dashboard";

function App() {
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser?.id) {
      setUserId(storedUser.id);
      setUser(storedUser);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setUserId(null);
    window.location.href = "/login"; // Force page reload to clear session
  };

  return (
    // Ideally wrap your entire app with WalletProvider only once.
    <WalletProvider userId={userId}>
      <div className="App">
        <Header user={user} handleLogout={handleLogout} />
        <Routes>
          <Route index element={<Home />} />
          <Route path="/trading" element={<TradingPlatform />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route
            path="/login"
            element={<AuthPage setUserId={setUserId} setUser={setUser} />}
          />
          <Route
            path="/dashboard"
            element={
              user ? (
                <Dashboard user={user} handleLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </WalletProvider>
  );
}

export default App;
