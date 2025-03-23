require('dotenv').config();
const { ethers } = require("hardhat");
const mysql = require("mysql2/promise"); // Use promise-based MySQL

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy the TradingPlatform contract
  const TradingPlatform = await ethers.getContractFactory("TradingPlatform");
  const tradingPlatform = await TradingPlatform.deploy();
  await tradingPlatform.deployed();

  console.log("TradingPlatform deployed to:", tradingPlatform.address);


  // ✅ Connect to MySQL Database
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
  });

  console.log("Connected to MySQL. Fetching assets...");

  // ✅ Fetch assets from the database
  const [rows] = await connection.execute("SELECT symbol, current_price FROM assets");

  // ✅ List each asset on the blockchain
  for (let asset of rows) {
    const price = ethers.utils.parseEther(asset.current_price.toString());
    // Convert price to ETH format
    const tx = await tradingPlatform.listAsset(asset.symbol, price);
    await tx.wait();
    console.log(`Listed asset: ${asset.symbol} at price ${ethers.utils.formatEther(price)} ETH`);
  }

  console.log("All assets have been listed on the blockchain.");
  await connection.end(); // Close the database connection
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
