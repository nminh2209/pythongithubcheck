import React, { useState, useEffect } from "react";
import { useWallet } from "./WalletContext";
import { Table, TableBody, TableCell, TableHead, TableRow, Card, CardContent, Button } from "@mui/material";
import axios from "axios";
import { ethers } from "ethers";
import "../Wallet.css";

// Correctly import parseEther from ethers

import contractArtifact from "./TradingPlatform.json";

const API_BASE_URL = "http://localhost:3001/api";

const Wallet = () => {
  const { balance, updateBalance, addTransaction, transactions, assets, updateAssets, userId } = useWallet();
  const [darkMode, setDarkMode] = useState(false);

  // Fetch wallet data: transactions and portfolio
  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const transactionsRes = await axios.get(`${API_BASE_URL}/transactions/${userId}`);
        const assetsRes = await axios.get(`${API_BASE_URL}/portfolio/${userId}`);

        // Update transactions
        transactionsRes.data.forEach((tx) => addTransaction(tx));

        // Ensure assets is an array
        const assetsData = Array.isArray(assetsRes.data) ? assetsRes.data : [assetsRes.data];
        updateAssets(assetsData);
      } catch (error) {
        console.error("Error fetching wallet data:", error.response?.data || error.message);
      }
    };

    if (userId) {
      fetchWalletData();
    }
  }, [userId, addTransaction, updateAssets]);

  // Sell function with partial-sell support (all values in ETH)
const sellStock = async (index) => {
  const stock = assets[index];
  const volumeToSell = parseInt(
    prompt(`You have ${stock.volume} shares of ${stock.symbol}. How many do you want to sell?`),
    10
  );
  if (isNaN(volumeToSell) || volumeToSell <= 0) return;
  if (volumeToSell > stock.volume) {
    alert("You do not have that many shares to sell!");
    return;
  }

  // Use avg_price as the purchase price (in ETH)
  const salePrice = parseFloat(stock.avg_price);
  if (isNaN(salePrice)) {
    alert("Invalid stock purchase price.");
    return;
  }

  const totalSaleAmount = salePrice * volumeToSell; // in ETH
  const newBalance = balance + totalSaleAmount;

  try {
    // Get the provider and signer from ethers.js
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    // Smart contract ABI and address
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your contract address
    const CONTRACT_ABI = contractArtifact.abi;

    // Create the contract instance
    const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);

    // Execute the trade (sell) without sending ETH
    const tx = await contract.executeTrade(stock.symbol, volumeToSell, false, {
      gasLimit: 200000, // Set the gas limit as needed
    });

    // Wait for the transaction to be mined
    await tx.wait();

    // Update local state (balance, portfolio, transaction history)
    updateBalance(newBalance);
    addTransaction({
      type: "sell",
      symbol: stock.symbol,
      price: salePrice,
      volume: volumeToSell,
      date: new Date()
    });
    updateAssets(stock.symbol, -volumeToSell, salePrice);

    // Optionally, send the sale data to your backend
    await axios.post(`${API_BASE_URL}/sell`, {
      userId,
      symbol: stock.symbol,
      price: salePrice,
      volume: volumeToSell
    });

    alert("Stock sold successfully!");
  } catch (error) {
    console.error("Error selling stock (contract):", error.response?.data || error.message);
    alert("There was an error while selling the stock.");
  }
};


  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle("dark-mode");
  };

  // Total portfolio value calculated as sum of (avg_price * volume) for each asset (in ETH)
  const getTotalPortfolioValue = () => {
    return assets
      .reduce((total, stock) => total + parseFloat(stock.avg_price) * stock.volume, 0)
      .toFixed(4);
  };

  return (
    <div className="wallet">
      <button className="toggle-dark-mode" onClick={toggleDarkMode}>
        {darkMode ? "☀️ " : "🌙"}
      </button>
      <CardContent className="wallet-card">
        <div className="wallet-header">
          <div className="wallet-info">
            <h2 className="wallet-balance">
              Wallet Balance: {balance.toFixed(4)} ETH
            </h2>
            <h3 className="portfolio-value">
              Total Portfolio Value: {getTotalPortfolioValue()} ETH
            </h3>
            <h3 className="total-value">
              Total Value: {(balance + parseFloat(getTotalPortfolioValue())).toFixed(4)} ETH
            </h3>
          </div>
        </div>
      </CardContent>
      <Card className="portfolio-card">
        <CardContent>
          <h2 id="portfolio" className="card-title">Your Portfolio</h2>
          <Table className="table">
            <TableHead>
              <TableRow>
                <TableCell>Symbol</TableCell>
                <TableCell>Price Bought (ETH)</TableCell>
                <TableCell className="volume-column">Volume</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assets && assets.length > 0 ? (
                assets.map((stock, index) => (
                  <TableRow key={index}>
                    <TableCell>{stock.symbol}</TableCell>
                    <TableCell>{stock.avg_price}</TableCell>
                    <TableCell className="volume-column">{stock.volume}</TableCell>
                    <TableCell>
                      <Button onClick={() => sellStock(index)}>Sell</Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4}>No assets available</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <h3 id="transactions" className="card-title">Transaction History</h3>
      <Table className="table">
        <TableHead>
          <TableRow>
            <TableCell>Type</TableCell>
            <TableCell>Symbol</TableCell>
            <TableCell>Price (ETH)</TableCell>
            <TableCell>Volume</TableCell>
            <TableCell>Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions && transactions.length > 0 ? (
            transactions.map((transaction, index) => (
              <TableRow key={index}>
                <TableCell>{transaction.type}</TableCell>
                <TableCell>{transaction.symbol}</TableCell>
                <TableCell>{transaction.price}</TableCell>
                <TableCell>{transaction.volume}</TableCell>
                <TableCell>{new Date(transaction.date).toLocaleString()}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5}>No transactions available</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default Wallet;
