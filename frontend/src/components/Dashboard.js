import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Wallet from "./Wallet";
import TradingPlatform from "./TradingPlatform";

export default function Dashboard({ user, handleLogout }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      setLoading(false);
    }
  }, [user, navigate]);

  if (loading) return <h2>Loading...</h2>;

  return (
    <div className="dashboard-container">
      <h2>Welcome, {user.username}</h2>
      <button onClick={handleLogout}>Logout</button>
      <Wallet />
      <TradingPlatform />
    </div>
  );
}
