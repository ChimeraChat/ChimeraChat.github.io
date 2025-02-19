const express = require('express');
const { Pool } = require('pg');
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

// Lägg till denna rad för att servera statiska filer (HTML, CSS, bilder):
app.use(express.static(path.join(__dirname)));

// Exempel: Visa index.html vid roten
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Exempel: Endpoint för att testa PostgreSQL
app.get('/users', async (req, res) => {
  // Exempel-kod för att hämta users
  res.send('Exempel /users – din databaslogik här');
});


app.listen(port, () => {
  console.log(`Servern körs på port ${port}`);
});


