require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const apiEndpoints = require('./api-endpoints');

const app = express();
const port = process.env.PORT || 3001;

// Create a MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'minh1234minh',
  database: 'trading_platform'
});

// Connect to the MySQL database
connection.connect(err => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
  console.log('Connected to the MySQL database');
});

// Middleware
app.use(cors());
app.use(express.json()); // Ensure JSON body parsing is enabled

// API Routes
const apiRouter = apiEndpoints(connection);
app.use('/api', apiRouter);

// Debug: Print all registered routes
const expressListRoutes = require('express-list-routes');
expressListRoutes(app);

// Root URL route
app.get('/', (req, res) => {
  res.send('Welcome to the API');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'API is running' });
});

// Debug: Ensure /api/login route is registered
if (apiRouter.stack.some(r => r.route?.path === '/login')) {
  console.log("✅ /api/login route is registered!");
} else {
  console.error("❌ ERROR: /api/login route is NOT registered.");
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
