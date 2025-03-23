import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import axios from "axios";

const WalletContext = createContext();

export const useWallet = () => useContext(WalletContext);

export const WalletProvider = ({ children, userId }) => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [assets, setAssets] = useState([]);

  // Fetch User Balance
  const fetchBalance = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`http://localhost:3001/api/balance/${userId}`);
      setBalance(parseFloat(res.data.balance) || 0);
    } catch (error) {
      console.error("Error fetching balance:", error.response?.data || error.message);
    }
  }, [userId]);

  // Fetch User Assets (using the portfolio endpoint)
  const fetchAssets = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`http://localhost:3001/api/portfolio/${userId}`);
      // Ensure we update assets with an array
      setAssets(Array.isArray(res.data) ? res.data : [res.data]);
    } catch (error) {
      console.error("Error fetching user assets:", error.response?.data || error.message);
    }
  }, [userId]);

  // Fetch User Transactions
  const fetchTransactions = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`http://localhost:3001/api/transactions/${userId}`);
      setTransactions(res.data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error.response?.data || error.message);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    console.log("Fetching data for userId:", userId);
    fetchBalance();
    fetchAssets();
    fetchTransactions();
  }, [userId, fetchBalance, fetchAssets, fetchTransactions]);

  // Update user balance
  const updateBalance = async (newBalance) => {
    if (!userId) return;
    try {
      await axios.put(`http://localhost:3001/api/balance/${userId}`, { balance: newBalance });
      setBalance(parseFloat(newBalance) || 0);
    } catch (error) {
      console.error("Error updating balance:", error.response?.data || error.message);
    }
  };

  // Add transaction to the local state
  const addTransaction = (transaction) => {
    setTransactions((prevTransactions) => [...prevTransactions, transaction]);
  };

  // Update assets: if first parameter is an array, replace the entire state;
  // otherwise, update the specific asset entry using the property "avg_price".
  const updateAssets = (dataOrSymbol, volume, price) => {
    if (Array.isArray(dataOrSymbol)) {
      setAssets(dataOrSymbol);
      return;
    }
    setAssets((prevAssets) => {
      const assetIndex = prevAssets.findIndex((asset) => asset.symbol === dataOrSymbol);
      if (assetIndex !== -1) {
        const updatedAssets = [...prevAssets];
        updatedAssets[assetIndex].volume += volume;
        updatedAssets[assetIndex].avg_price = price;
        return updatedAssets;
      } else {
        return [...prevAssets, { symbol: dataOrSymbol, volume, avg_price: price }];
      }
    });
  };

  return (
    <WalletContext.Provider value={{ balance, updateBalance, transactions, addTransaction, assets, updateAssets, userId }}>
      {children}
    </WalletContext.Provider>
  );
};
