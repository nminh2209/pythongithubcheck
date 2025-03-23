const express = require('express');
const bcrypt = require('bcrypt');

module.exports = (connection) => {
  const router = express.Router();

  // Get all assets
  router.get('/assets', (req, res) => {
    connection.query('SELECT * FROM assets', (err, results) => {
      if (err) return res.status(500).json({ error: 'Error fetching assets' });
      res.json(results);
    });
  });

  // Get specific asset by symbol
  router.get('/assets/:symbol', (req, res) => {
    const { symbol } = req.params;
    connection.query('SELECT * FROM assets WHERE symbol = ?', [symbol], (err, results) => {
      if (err) return res.status(500).json({ error: 'Error fetching asset' });
      res.json(results[0] || {});
    });
  });

  // Get user transactions with asset details
  router.get('/transactions/:userId', (req, res) => {
    const { userId } = req.params;
    const query = `
      SELECT t.*, a.symbol 
      FROM transactions t 
      JOIN assets a ON t.asset_id = a.asset_id 
      WHERE t.user_id = ?`;
    connection.query(query, [userId], (err, results) => {
      if (err) return res.status(500).json({ error: 'Error fetching transactions' });
      res.json(results);
    });
  });

  // Get user portfolio with asset details
  router.get('/portfolio/:userId', (req, res) => {
    const { userId } = req.params;
    const query = `
      SELECT p.*, a.symbol, a.current_price 
      FROM portfolio p 
      JOIN assets a ON p.asset_id = a.asset_id 
      WHERE p.user_id = ?`;
    connection.query(query, [userId], (err, results) => {
      if (err) return res.status(500).json({ error: 'Error fetching portfolio' });
      res.json(results);
    });
  });

  // Get user balance from USERS table
  router.get('/balance/:userId', (req, res) => {
    const { userId } = req.params;
    connection.query('SELECT balance FROM users WHERE user_id = ?', [userId], (err, results) => {
      if (err) return res.status(500).json({ error: 'Error fetching balance' });
      res.json(results[0] || { balance: 0 });
    });
  });

  // Update user balance in USERS table
  router.put('/balance/:userId', (req, res) => {
    const { userId } = req.params;
    const { balance } = req.body;
    connection.query('UPDATE users SET balance = ? WHERE user_id = ?', [balance, userId], (err, results) => {
      if (err) return res.status(500).json({ error: 'Error updating balance' });
      res.json({ success: true });
    });
  });

  // User registration (sign up)
  router.post('/signup', async (req, res) => {
    const { username, email, password, wallet_address } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const query = 'INSERT INTO users (username, email, password, wallet_address) VALUES (?, ?, ?, ?)';
      connection.query(query, [username, email, hashedPassword, wallet_address], (err, results) => {
        if (err) {
          console.error('Error signing up:', err);
          res.status(500).json({ error: 'Sign up failed' });
        } else {
          const user = { id: results.insertId, username, email, wallet_address };
          res.json({ user });
        }
      });
    } catch (error) {
      console.error('Error signing up:', error);
      res.status(500).json({ error: 'Sign up failed' });
    }
  });

  // User login
  router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM users WHERE email = ?';
    connection.query(query, [email], async (err, results) => {
      if (err) {
        console.error('Error logging in:', err);
        res.status(500).json({ error: 'Login failed' });
      } else if (results.length === 0) {
        res.status(401).json({ error: 'Invalid email or password' });
      } else {
        const user = results[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          res.status(401).json({ error: 'Invalid email or password' });
        } else {
          res.json({ user: { id: user.user_id, username: user.username, email: user.email } });
        }
      }
    });
  });

  // Route to handle buying stock
  router.post('/buy', (req, res) => {
    const { userId, symbol, price, volume } = req.body;
    
    // Check if the user has enough balance
    connection.query('SELECT balance FROM users WHERE user_id = ?', [userId], (err, results) => {
      if (err) return res.status(500).json({ error: 'Error checking balance' });

      const userBalance = results[0]?.balance || 0;
      const totalCost = price * volume;

      if (userBalance < totalCost) {
        return res.status(400).json({ error: 'Insufficient balance' });
      }
      
      // Look up the asset_id for the given symbol
      connection.query('SELECT asset_id FROM assets WHERE symbol = ?', [symbol], (err, assetResults) => {
        if (err || assetResults.length === 0) {
          return res.status(500).json({ error: 'Error finding asset' });
        }
        const asset_id = assetResults[0].asset_id;

        // Deduct balance from user
        connection.query('UPDATE users SET balance = balance - ? WHERE user_id = ?', [totalCost, userId], (err) => {
          if (err) return res.status(500).json({ error: 'Error updating balance' });

          // Check if the asset already exists in the portfolio using asset_id
          connection.query('SELECT * FROM portfolio WHERE user_id = ? AND asset_id = ?', [userId, asset_id], (err, portfolioResults) => {
            if (err) return res.status(500).json({ error: 'Error checking portfolio' });

            if (portfolioResults.length > 0) {
              // Update the existing record's volume (optionally update avg_price as needed)
              const existingStock = portfolioResults[0];
              const newVolume = existingStock.volume + volume;
              const updateQuery = 'UPDATE portfolio SET volume = ? WHERE user_id = ? AND asset_id = ?';
              connection.query(updateQuery, [newVolume, userId, asset_id], (err) => {
                if (err) return res.status(500).json({ error: 'Error updating portfolio' });
                res.json({ success: true, message: 'Stock bought and updated in portfolio' });
              });
            } else {
              // Insert a new record in the portfolio
              const insertQuery = 'INSERT INTO portfolio (user_id, asset_id, volume, avg_price) VALUES (?, ?, ?, ?)';
              connection.query(insertQuery, [userId, asset_id, volume, price], (err) => {
                if (err) return res.status(500).json({ error: 'Error adding stock to portfolio' });
                res.json({ success: true, message: 'Stock bought and added to portfolio' });
              });
            }
          });
        });
      });
    });
  });

  // Route to handle selling stock
router.post('/sell', (req, res) => {
  const { userId, symbol, price, volume } = req.body;

  // Convert price and volume to numbers
  const salePrice = parseFloat(price);
  const saleVolume = parseInt(volume, 10);
  const totalValue = salePrice * saleVolume;

  if (isNaN(salePrice) || isNaN(saleVolume) || isNaN(totalValue)) {
    return res.status(500).json({ error: 'Invalid numeric values provided.' });
  }

  console.log(`Sell request: userId=${userId}, symbol=${symbol}, salePrice=${salePrice}, saleVolume=${saleVolume}, totalValue=${totalValue}`);

  // Look up the asset_id for the given symbol
  connection.query('SELECT asset_id FROM assets WHERE symbol = ?', [symbol], (err, assetResults) => {
    if (err || assetResults.length === 0) {
      return res.status(500).json({ error: 'Error finding asset' });
    }
    const asset_id = assetResults[0].asset_id;

    // Check if the asset exists in the portfolio for the user
    connection.query('SELECT * FROM portfolio WHERE user_id = ? AND asset_id = ?', [userId, asset_id], (err, portfolioResults) => {
      if (err) return res.status(500).json({ error: 'Error checking portfolio' });
      if (portfolioResults.length === 0) {
        return res.status(400).json({ error: 'Asset not found in portfolio' });
      }

      const currentVolume = parseInt(portfolioResults[0].volume, 10);
      if (currentVolume < saleVolume) {
        return res.status(400).json({ error: 'Not enough volume to sell' });
      }

      const newVolume = currentVolume - saleVolume;

      // Function to update user's balance after updating portfolio
      const updateBalanceAndRespond = () => {
        connection.query('UPDATE users SET balance = balance + ? WHERE user_id = ?', [totalValue, userId], (err) => {
          if (err) {
            console.error("Balance update error:", err);
            return res.status(500).json({ error: 'Error updating balance' });
          }
          res.json({ success: true, message: 'Stock sold successfully' });
        });
      };

      // Update portfolio: if newVolume > 0 update the record; otherwise, delete the record
      if (newVolume > 0) {
        connection.query('UPDATE portfolio SET volume = ? WHERE user_id = ? AND asset_id = ?', [newVolume, userId, asset_id], (err) => {
          if (err) return res.status(500).json({ error: 'Error updating portfolio' });
          updateBalanceAndRespond();
        });
      } else {
        connection.query('DELETE FROM portfolio WHERE user_id = ? AND asset_id = ?', [userId, asset_id], (err) => {
          if (err) return res.status(500).json({ error: 'Error removing asset from portfolio' });
          updateBalanceAndRespond();
        });
      }
    });
  });
});


  return router;
};
