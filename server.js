import express from 'express';
import path from 'path';
import pkg from 'pg';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const { Pool } = pkg;

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// PostgreSQL connection pool
export const pool = new Pool({
  user: process.env.POSTGRESQL_ADDON_USER,
  host: process.env.POSTGRESQL_ADDON_HOST,
  database: process.env.POSTGRESQL_ADDON_DB,
  password: process.env.POSTGRESQL_ADDON_PASSWORD,
  port: process.env.POSTGRESQL_ADDON_PORT,
});

// Hantera __dirname i ESM-modul
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Lägg till denna rad för att servera statiska filer (HTML, CSS, bilder):
app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.use(bodyParser.json());

// signup route
import signupRoute from './js/signup.js';
app.use('../signup', signupRoute);

// login route
import loginRoute from './js/login.js';
app.use('../login', loginRoute);

// Standard route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Servern körs på port ${port}`);
});


