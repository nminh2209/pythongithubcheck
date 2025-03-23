require('dotenv').config();
const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// MySQL Connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'trading_platform'
});

// Connect to database
connection.connect(err => {
  if (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }
  console.log('Connected to the database');
});

// Import CSV data into the assets table
const importCSV = (filePath, callback) => {
  const results = [];
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', data => results.push(data))
    .on('end', () => {
      if (results.length === 0) {
        console.warn(`Warning: No data found in ${filePath}`);
        return callback();
      }
      
      let completed = 0;
      results.forEach(row => {
        try {
          const { symbol, name, category, description, current_price } = row;
          const price = parseFloat(current_price) || 0.0;
          const query = 'INSERT INTO assets (symbol, name, category, description, current_price) VALUES (?, ?, ?, ?, ?)';
          connection.query(query, [symbol, name, category, description, price], err => {
            if (err) console.error(`Error inserting data: ${err.message}`);
            completed++;
            if (completed === results.length) callback();
          });
        } catch (err) {
          console.error(`Error processing row: ${err.message}`);
        }
      });
    })
    .on('error', err => console.error(`Error reading CSV: ${err.message}`));
};

// Import all CSV files in the archive folder
const archiveFolder = path.join(__dirname, 'db', 'archive');
console.log(`Checking for archive folder at: ${archiveFolder}`);

if (!fs.existsSync(archiveFolder)) {
  console.error('Error: Archive folder not found.');
  process.exit(1);
}


fs.readdir(archiveFolder, (err, files) => {
  if (err) {
    console.error(`Error reading archive folder: ${err.message}`);
    process.exit(1);
  }
  
  if (files.length === 0) {
    console.warn('Warning: No CSV files found in archive.');
    connection.end();
    return;
  }

  let completedFiles = 0;
  files.forEach(file => {
    const filePath = path.join(archiveFolder, file);
    if (!file.endsWith('.csv')) return; // Skip non-CSV files

    importCSV(filePath, () => {
      completedFiles++;
      if (completedFiles === files.length) {
        connection.end(err => {
          if (err) console.error(`Error closing connection: ${err.message}`);
          else console.log('Database connection closed');
        });
      }
    });
  });
});
