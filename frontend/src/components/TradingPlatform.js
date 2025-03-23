import { useState, useEffect } from "react";
// Ethers v6 imports
import { BrowserProvider, Contract, parseEther } from "ethers";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import "../TradingPlatform.css";
import { useWallet } from "./WalletContext";
import axios from "axios"; // Import axios for API requests

// Import your contract artifact from your ABI file (adjust the path as needed)
import contractArtifact from "./TradingPlatform.json";
const CONTRACT_ABI = contractArtifact.abi;
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export default function TradingPlatform() {
  const { balance, updateBalance, addTransaction, assets, updateAssets, userId } = useWallet();
  const [stocks, setStocks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("default");
  const [darkMode, setDarkMode] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [selectedVolume, setSelectedVolume] = useState({});

  // Setup ethers provider and contract instance
  const getContract = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask or another Web3 wallet.");
      return null;
    }
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  };

  // Fetch stock prices from your centralized API (prices are in ETH, e.g. "0.25")
  const fetchStocks = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/assets");
      const data = await res.json();
      const stocksWithHistory = data.map((stock) => ({
        ...stock,
        history: [parseFloat(stock.current_price)],
        volume: 0,
      }));
      setStocks(stocksWithHistory);
    } catch (error) {
      console.error("Error fetching stocks:", error);
    }
  };

  // Function to update stock prices locally (simulate fluctuations)
  const updatePrices = () => {
    setStocks((prevStocks) =>
      prevStocks.map((stock) => {
        const fluctuation = (Math.random() - 0.5) * 0.1;
        const newPrice = parseFloat(stock.current_price) * (1 + fluctuation);
        const updatedHistory = [...stock.history, parseFloat(newPrice.toFixed(4))];
        return { ...stock, current_price: newPrice.toFixed(4), history: updatedHistory };
      })
    );
  };

  useEffect(() => {
    fetchStocks();
    const interval = setInterval(updatePrices, 3000);
    return () => clearInterval(interval);
  }, []);

  // On-chain buy function (using pure ETH values)
  const buyStock = async (symbol, price, volume) => {
    const priceEth = parseFloat(price); // price in ETH (e.g. 0.25)
    const totalCost = priceEth * volume;  // total cost in ETH (e.g. 0.25 * 2 = 0.5 ETH)
    if (balance < totalCost) {
      alert("Insufficient funds in your wallet!");
      return;
    }
    try {
      const contract = await getContract();
      if (!contract) return;

      // Check if the asset is listed on-chain
      const assetOnChain = await contract.assets(symbol);
      if (!assetOnChain.isListed) {
        // List the asset on-chain, converting price to wei
        const txList = await contract.listAsset(symbol, parseEther(price.toString()));
        await txList.wait();
        console.log(`${symbol} has been listed on-chain.`);
      }

      // Execute the trade: buying (true) with totalCost (converted to wei)
      const tx = await contract.executeTrade(symbol, volume, true, {
        value: parseEther(totalCost.toString()),
      });
      await tx.wait();

      // Update backend and wallet after transaction
      updateBalance(balance - totalCost);
      addTransaction({ type: "buy", symbol, price: priceEth, volume, date: new Date(), userId }); // Pass userId
      updateAssets(symbol, volume, priceEth);

      // Update the backend database with the transaction
      await axios.post("http://localhost:3001/api/buy", {
        userId,
        symbol,
        price: priceEth,
        volume,
      });
    } catch (error) {
      console.error("Error buying stock (contract):", error);
    }
  };

  // On-chain sell function (using pure ETH values)
  const sellStock = async (index) => {
    const stock = assets[index];
    const volumeToSell = parseInt(prompt(`You have ${stock.volume} shares of ${stock.symbol}. How many do you want to sell?`), 10);
    if (isNaN(volumeToSell) || volumeToSell <= 0) return;
    if (volumeToSell > stock.volume) {
      alert("You do not have that many shares to sell!");
      return;
    }
    try {
      const contract = await getContract();
      if (!contract) return;
      const tx = await contract.executeTrade(stock.symbol, volumeToSell, false);
      await tx.wait();

      const saleValue = parseFloat(stock.current_price) * volumeToSell;
      updateBalance(balance + saleValue);
      addTransaction({
        type: "sell",
        symbol: stock.symbol,
        price: parseFloat(stock.current_price),
        volume: volumeToSell,
        date: new Date(),
        userId, // Pass userId
      });
      updateAssets(stock.symbol, -volumeToSell, parseFloat(stock.current_price));

      // Update the backend database with the transaction
      await axios.post("http://localhost:3001/api/sell", {
        userId,
        symbol: stock.symbol,
        price: parseFloat(stock.current_price),
        volume: volumeToSell,
      });
    } catch (error) {
      console.error("Error selling stock (contract):", error);
    }
  };

  // Trade function: decides between buy and sell
  const tradeStock = (symbol, price, volume, action) => {
    if (action === "buy") {
      buyStock(symbol, price, volume);
    } else if (action === "sell") {
      const stockIndex = assets.findIndex(
        (asset) => asset.symbol === symbol && parseFloat(asset.current_price) === parseFloat(price)
      );
      if (stockIndex !== -1) {
        sellStock(stockIndex);
      } else {
        alert("Stock not found in portfolio!");
      }
    }
  };

  const handleVolumeChange = (symbol, newVolume) => {
    setStocks((prevStocks) =>
      prevStocks.map((stock) =>
        stock.symbol === symbol ? { ...stock, volume: newVolume } : stock
      )
    );
  };

  const handleOpenModal = (stock) => {
    setSelectedStock(stock);
  };

  const handleCloseModal = () => {
    setSelectedStock(null);
  };

  const filteredStocks = stocks
    .filter((stock) => stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (filter === "price-high-low") return b.current_price - a.current_price;
      if (filter === "price-low-high") return a.current_price - b.current_price;
      return 0;
    });

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle("dark-mode");
  };

  return (
    <div className="trading-platform-container">
      <button className="toggle-dark-mode" onClick={toggleDarkMode}>
        {darkMode ? "☀️ " : "🌙"}
      </button>

      <div className="trading-platform">
        <section className="search-section">
          <h2>Explore the Stock Market</h2>
          <div className="search-controls">
            <input
              type="text"
              placeholder="Search stocks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <select
              className="filter-dropdown"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="default">Default</option>
              <option value="price-high-low">Price: High to Low</option>
              <option value="price-low-high">Price: Low to High</option>
            </select>
          </div>
        </section>

        <section className="market-section">
          <table className="stock-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Price (ETH)</th>
                <th>Volume</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStocks.map((stock) => (
                <tr key={stock.symbol}>
                  <td>{stock.symbol}</td>
                  <td>{stock.current_price}</td>
                  <td>
                    <input
                      type="number"
                      value={stock.volume || 0}
                      onChange={(e) =>
                        handleVolumeChange(stock.symbol, parseInt(e.target.value) || 0)
                      }
                      min="0"
                      className="volume-input"
                    />
                  </td>
                  <td>
                    <button
                      onClick={() =>
                        tradeStock(stock.symbol, stock.current_price, stock.volume, "buy")
                      }
                      className="buy-button"
                    >
                      Quick Buy
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="charts-section">
          {stocks.map((stock) => (
            <div key={stock.symbol} className="chart-card" onClick={() => handleOpenModal(stock)}>
              <h2>{stock.symbol} Price History</h2>
              <div className="chart-container">
                {stock.history && stock.history.length > 0 ? (
                  <Line
                    data={{
                      labels: stock.history.map((_, index) => index),
                      datasets: [
                        {
                          label: `${stock.symbol} Price`,
                          data: stock.history, 
                          borderColor: "rgba(75, 192, 192, 1)",
                          backgroundColor: "rgba(75, 192, 192, 0.2)",
                        },
                      ],
                    }}
                    options={{ maintainAspectRatio: false }}
                  />
                ) : (
                  <p>No data available</p>
                )}
              </div>
            </div>
          ))}
        </section>

        {selectedStock && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{selectedStock.symbol} Price History</h2>
              {selectedStock.history && selectedStock.history.length > 0 ? (
                <Line
                  data={{
                    labels: selectedStock.history.map((_, index) => index),
                    datasets: [
                      {
                        label: `${selectedStock.symbol} Price`,
                        data: selectedStock.history,
                        borderColor: "rgba(75, 192, 192, 1)",
                        backgroundColor: "rgba(75, 192, 192, 0.2)",
                      },
                    ],
                  }}
                />
              ) : (
                <p>No data available</p>
              )}
              <section className="market-section">
                <table className="stock-table">
                  <thead>
                    <tr>
                      <th>Symbol</th>
                      <th>Price (ETH)</th>
                      <th>Volume</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedStock && (
                      <tr key={selectedStock.symbol}>
                        <td>{selectedStock.symbol}</td>
                        <td>{selectedStock.current_price}</td>
                        <td>
                          <input
                            type="number"
                            value={selectedVolume[selectedStock.symbol] || 0}
                            onChange={(e) =>
                              setSelectedVolume({
                                ...selectedVolume,
                                [selectedStock.symbol]: parseInt(e.target.value) || 0,
                              })
                            }
                            min="0"
                            className="volume-input"
                          />
                        </td>
                        <td>
                          <button
                            onClick={() =>
                              tradeStock(
                                selectedStock.symbol,
                                selectedStock.current_price,
                                selectedVolume[selectedStock.symbol],
                                "buy"
                              )
                            }
                            className="buy-button"
                          >
                            Buy
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </section>
              <button className="close-button" onClick={handleCloseModal}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
