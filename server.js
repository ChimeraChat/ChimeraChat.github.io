import express from 'express';
import path from 'path';
import pkg from 'pg';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
dotenv.config({ path: 'googledrive.env' });
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bcrypt from 'bcrypt';
import { uploadMiddleware, uploadFileToDrive } from "./config/googleDrive.js";

const router = express.Router();

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

// Använd routes
//app.use('/signup', signupRoute);
//app.use('/login', loginRoute);

app.post('/', uploadMiddleware, async (req, res) => {
  console.log("🔍 Filinfo:", req.file.buffer);
  console.log("🔍 Body:", req.body);

  if (!req.file) {
    return res.status(400).json({ message: "Ingen fil uppladdad!" });
  }

  try {
    const fileId = await uploadFileToDrive(req.file.buffer, req.file.originalname, req.file.mimetype);

    if (!fileId) {
      return res.status(500).json({ message: "Fel vid uppladdning." });
    }

    const fileUrl = `https://drive.google.com/uc?id=${fileId}`;
    res.json({ message: "Uppladdning lyckades!", fileUrl });
  } catch (error) {
    console.error("Fel vid uppladdning i server.js:", error);
    res.status(500).json({ message: "Serverfel vid uppladdning." });
  }
});


// Registrerings-API
app.post('/signup', async (req, res) => {
  console.log("👉 Mottaget POST /signup:", req.body);

  const { email, username, password } = req.body;
  try {
    if (!email || !username || !password) {
      return res.status(400).json({ message: "Alla fält måste fyllas i." });
    }

    const existingUser = await pool.query(
        'SELECT userid FROM chimerachat_accounts WHERE email = $2 OR username = $3',
        [email, username]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "E-post eller användarnamn används redan!" });
    }

    // Hasha lösenord
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("🔑 Hashed Password:", hashedPassword);


    console.log("👉 Börjar registreringsprocessen...");
    // Lägg till användare i databasen
    const result = await pool.query(
        'INSERT INTO chimerachat_accounts(email, username) VALUES ($2, $3)',
        [email, username]
    );

    if (result.rows.length === 0) {
      throw new Error("Misslyckades med att skapa användaren i databasen.");
    }

    console.log(`✅ Användare skapad `);

    // Spara lösenordet i en separat tabell
    await pool.query(
        'INSERT INTO encrypted_passwords(hashpassword) VALUES ($2)',
        [hashedPassword]
    );

    console.log("✅ Lösenord sparat!");

    res.status(201).json({
      message: 'Ditt konto har skapats! Omdirigerar till inloggningssidan...',
      redirect: '../login.html'
    });

  } catch (err) {
    console.error("Fel vid registrering:", err);
      res.status(500).json({
        message: "Registrering misslyckades.",
        error: err.message // Lägg till detaljerat felmeddelande
    });
  }
});


// log in route
// Funktion för att hantera inloggning
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const query = `
            SELECT chimerachat_accounts.userid, chimerachat_accounts.username, 
                   chimerachat_accounts.email, encrypted_passwords.hashpassword 
            FROM chimerachat_accounts
            JOIN encrypted_passwords ON chimerachat_accounts.userid = encrypted_passwords.userid
            WHERE chimerachat_accounts.username = $1
        `;
    const result = await pool.query(query, [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Felaktigt användarnamn eller lösenord" });
    }

    const user = result.rows[0];

    // Verifiera lösenordet
    const isMatch = await bcrypt.compare(password, user.hashpassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Felaktigt användarnamn eller lösenord" });
    }

    // Ta bort lösenord innan vi skickar tillbaka data
    delete user.hashpassword;

    res.json({ message: "Inloggning lyckades!", user });

  } catch (err) {
    console.error("Inloggningsfel:", err);
    res.status(500).json("Serverfel vid inloggning");
  }
});

// Standard route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Servern körs på port ${port}`);
});


