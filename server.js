require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const app = express();

app.use(express.json());

// DB Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) {
    console.error('DB connection failed:', err);
    process.exit(1);
  }
  console.log('Database connected.');
});

// POST /addSchool
app.post('/addSchool', (req, res) => {
  const { name, address, latitude, longitude } = req.body;

  if (!name || !address || isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({ error: 'Invalid input data.' });
  }

  const sql = 'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)';
  db.query(sql, [name, address, latitude, longitude], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'School added successfully.', id: result.insertId });
  });
});

// Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// GET /listSchools
app.get('/listSchools', (req, res) => {
  const userLat = parseFloat(req.query.latitude);
  const userLon = parseFloat(req.query.longitude);

  if (isNaN(userLat) || isNaN(userLon)) {
    return res.status(400).json({ error: 'Latitude and longitude are required.' });
  }

  db.query('SELECT * FROM schools', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    const sorted = results.map(school => ({
      ...school,
      distance: calculateDistance(userLat, userLon, school.latitude, school.longitude)
    })).sort((a, b) => a.distance - b.distance);

    res.json(sorted);
  });
});

// Basic Info route
app.get('/', (req, res) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>School Management API Documentation</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            padding: 20px;
          }
          h1, h2 {
            color: #333;
          }
          p {
            font-size: 16px;
          }
          ul {
            list-style-type: none;
            padding-left: 0;
          }
          li {
            margin-bottom: 10px;
          }
          code {
            display: block;
            background-color: #f4f4f4;
            padding: 10px;
            border-radius: 4px;
            margin-top: 5px;
          }
        </style>
      </head>
      <body>
        <h1>Welcome to the School Management API Documentation</h1>
        <p>Hi there, this is Rohit Chaudhary. I have implemented the given task and the endpoints for the API are provided below.</p>

        <h2>API Endpoints</h2>
        <ul>
          <li>
            <h3>Add School API</h3>
            <p><strong>Endpoint:</strong> /addSchool</p>
            <p><strong>Method:</strong> POST</p>
            <p><strong>URL:</strong> <code>https://school-management-phi-jet.vercel.app/addSchool</code></p>
          </li>
          <li>
            <h3>List Schools API</h3>
            <p><strong>Endpoint:</strong> /listSchools</p>
            <p><strong>Method:</strong> GET</p>
            <p><strong>URL:</strong> <code>http://school-management-phi-jet.vercel.app/listSchools?latitude=50&longitude=40</code></p>
          </li>
        </ul>
      </body>
    </html>
  `;

  res.send(htmlContent);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
