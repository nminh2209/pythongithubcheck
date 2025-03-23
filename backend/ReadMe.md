# Trading Platform - Backend & Smart Contract Setup

This project is a trading platform that integrates a MySQL database, Hardhat for Ethereum smart contracts, and a React frontend. Follow the steps below to install all dependencies and set up your environment.

## 📂 Project Structure

```
/group-project-spr-2025-g12
│── /backend
│   ├── package.json
│   ├── importData.js
│   ├── script/
│   │   ├── deploy.js
│   ├── db/
│   │   ├── archive/ (CSV files)
│── /frontend
│   ├── src/
│   │   ├── App.js
│   ├── package.json
│── /smart-contracts
│   ├── contracts/
│   │   ├── TradingPlatform.sol
│   ├── deploy/
│   │   ├── deploy.js
│   ├── hardhat.config.js
│── README.md
```

## 🛠️ 1. Prerequisites
Before you start, make sure you have the following installed:

✅ Node.js (Latest LTS version)  
✅ npm or yarn (Comes with Node.js)  
✅ MySQL (Make sure it's running)  
✅ MetaMask (For blockchain transactions)  
✅ Hardhat (For Ethereum smart contracts)  

## 📦 2. Install Dependencies

### 🔹 Backend (Node.js + MySQL)
Navigate to the backend folder and install dependencies:

```sh
cd backend
npm install
```

This will install:
- `dotenv` → Loads environment variables
- `mysql2` → MySQL database connector
- `csv-parser` → Reads CSV files for importing assets

If needed, install them manually:
```sh
npm install dotenv mysql2 csv-parser
```

### 🔹 Smart Contracts (Hardhat)
Go to the smart-contracts folder and install dependencies:

```sh
cd smart-contracts
npm install
```

This will install:
- `hardhat` → Ethereum development framework
- `ethers` → Interacts with Ethereum blockchain
- `@nomicfoundation/hardhat-ethers` → Hardhat plugin for ethers.js

If needed, install them manually:
```sh
npm install hardhat ethers @nomicfoundation/hardhat-ethers
```

### 🔹 Frontend (React)
Go to the frontend folder and install dependencies:

```sh
cd frontend
npm install
```

This will install:
- `react` → UI framework
- `react-dom` → Renders React components
- `ethers.js` → Connects React to Ethereum
- `chart.js` → Displays asset price charts

If needed, install them manually:
```sh
npm install react react-dom ethers chart.js
```

## 🚀 3. Setup & Run

### 🔹 Backend

#### Configure `.env`
Create a `.env` file inside `backend/` and add:

```ini
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_DATABASE=trading_platform
```

#### Start MySQL Server
Ensure MySQL is running.

#### Import Assets into Database
```sh
node importData.js
```

### 🔹 Smart Contract Deployment

#### Start Hardhat Local Blockchain
```sh
npx hardhat node
```

#### Deploy the Smart Contract
```sh
npx hardhat run script/deploy.js --network localhost
```

### 🔹 Frontend

#### Start React App
```sh
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 Troubleshooting

### 🔴 MySQL: "Access denied for user 'root'@'localhost'"
Check your `.env` file and ensure MySQL credentials are correct.
Try logging into MySQL manually:
```sh
mysql -u root -p
```

### 🔴 Hardhat: "Cannot connect to network localhost"
Ensure Hardhat is running before deploying:
```sh
npx hardhat node
```

### 🔴 React: "Module not found" or "Failed to parse source map"
Try reinstalling dependencies:
```sh
rm -rf node_modules package-lock.json
npm install
```

## 💡 Future Improvements
- Add real-time price updates via WebSockets.
- Integrate a proper frontend dashboard for trading.
- Deploy smart contracts on a testnet (e.g., Goerli, Sepolia).

