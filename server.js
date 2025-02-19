const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.POSTGRESQL_ADDON_USER,
  host: process.env.POSTGRESQL_ADDON_HOST,
  database: process.env.POSTGRESQL_ADDON_DB,
  password: process.env.POSTGRESQL_ADDON_PASSWORD,
  port: 5432, // Clever Cloud använder port 5432, inte 50013 för externa anslutningar!
});

// Lägg till denna rad för att servera statiska filer (HTML, CSS, bilder):
app.use(express.static(path.join(__dirname)));
app.use(bodyParser.json());

// Testa att hämta alla users
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Serverfel');
  }
});

// Routes
try {
  const result = await pool.query('SELECT * FROM users');
  res.json(result.rows);
} catch (err) {
  console.error(err);
  res.status(500).send('Serverfel');
  }
  
// signup route
const signupRoute = require('./signup');
app.use('/signup', signupRoute);

// Standard route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Servern körs på port ${port}`);
});


