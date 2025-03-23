-- Create database
CREATE DATABASE IF NOT EXISTS trading_platform;
USE trading_platform;

-- Users table
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL, -- Add the password column
    balance DECIMAL(20,2) DEFAULT 10000.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assets table
CREATE TABLE assets (
    asset_id INT PRIMARY KEY AUTO_INCREMENT,
    symbol VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    current_price DECIMAL(20,2) NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE transactions (
    transaction_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    asset_id INT NOT NULL,
    type ENUM('buy', 'sell') NOT NULL,
    price DECIMAL(20,2) NOT NULL,
    volume INT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    smart_contract_tx VARCHAR(66),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (asset_id) REFERENCES assets(asset_id)
);

-- Portfolio table
CREATE TABLE portfolio (
    portfolio_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    asset_id INT NOT NULL,
    volume INT NOT NULL,
    avg_price DECIMAL(20,2) NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (asset_id) REFERENCES assets(asset_id)
);

   -- Insert Sample Users--
INSERT INTO users (wallet_address, email, username, balance, password) VALUES
('0xA1B2C3D4E5F678901234567890ABCDEF12345678', 'alice@example.com', 'Alice', 15000.00, '$2b$10$examplehash1'),
('0xB2C3D4E5F678901234567890ABCDEF1234567890', 'bob@example.com', 'Bob', 12000.50, '$2b$10$examplehash2'),
('0xC3D4E5F678901234567890ABCDEF12345678901A', 'charlie@example.com', 'Charlie', 9000.75, '$2b$10$examplehash3'),
('0xD4E5F678901234567890ABCDEF12345678901AB2', 'david@example.com', 'David', 5000.00, '$2b$10$examplehash4'),
('0xE5F678901234567890ABCDEF12345678901AB2C3', 'eve@example.com', 'Eve', 7000.00, '$2b$10$examplehash5');


-- Insert Sample Transactions
INSERT INTO transactions (user_id, asset_id, type, price, volume, smart_contract_tx) VALUES
(1, 6, 'buy', 45000.00, 1, '0xabcdef1234567890abcdef1234567890abcdef12'),
(1, 7, 'buy', 3200.75, 2, '0xbcdefa1234567890abcdef1234567890abcdef34'),
(2, 3, 'buy', 3400.00, 3, NULL),
(2, 4, 'sell', 225.30, 5, '0xcdefab1234567890abcdef1234567890abcdef56'),
(3, 1, 'buy', 250.00, 4, '0xdefabc1234567890abcdef1234567890abcdef78'),
(4, 2, 'sell', 125.45, 1, '0xefabcd1234567890abcdef1234567890abcdef90'),
(3, 16, 'buy', 700.00, 2, '0xffabcd1234567890abcdef1234567890abcdef91'),
(2, 11, 'buy', 300.00, 3, NULL),
(1, 12, 'buy', 2607.05, 1, '0xabcdef9876543210abcdef9876543210abcdef99'),
(4, 20, 'sell', 1800.75, 2, '0xaaabcd1234567890abcdef1234567890abcdef92');


-- Insert Sample Portfolio Data
INSERT INTO portfolio (user_id, asset_id, volume, avg_price) VALUES
(1, 6, 1, 45000.00),
(1, 7, 2, 3200.75),
(2, 3, 3, 3400.00),
(3, 1, 4, 250.00),
(4, 2, 1, 125.45),
(3, 16, 2, 700.00),
(2, 11, 3, 300.00),
(1, 12, 1, 2607.05),
(4, 20, 2, 1800.75);
