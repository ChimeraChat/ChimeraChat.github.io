import express from 'express';
import path from 'path';
import pkg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bcrypt from 'bcrypt';
import { createUserFolder, drive } from "./config/googleDrive.js";
import { dbConfig } from './config/db.js';
import {getUserFolderId} from "./js/api.js";
import session from 'express-session';

dotenv.config({ path: 'googledrive.env' });
dotenv.config();

const { Pool } = pkg;
const pool = new Pool(dbConfig);
const app = express();
const port = process.env.PORT || 3000;

// Hantera __dirname i ESM-modul
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Lägg till denna rad för att servera statiska filer (HTML, CSS, bilder):
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Add express-session middleware
app.use(session({
  secret: 'y91fe56e84cs6682ebc9!643rh89le22lut', // random secret
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    secure: false, // Set to true if using HTTPS
    httpOnly: true // Set to true for improved security
  }
}));

// Signup route
app.post('/signup', async (req, res) => {
  console.log("Received POST /signup:", req.body);
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ message: "All fields must be filled." });
  }
  console.log("Email:", email, "Username:", username, "Password:", password);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const userExists = await client.query('SELECT userid FROM chimerachat_accounts WHERE email = $1 OR username = $2', [email, username]);

    if (userExists.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: "Email or username already exists!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userResult = await client.query('INSERT INTO chimerachat_accounts(email, username) VALUES ($1, $2) RETURNING userid', [email, username]);

    if (userResult.rows.length === 0) {
      throw new Error("Failed to create user in the database.");
    }

    const { userid } = userResult.rows[0];
    const userFolderId = await createUserFolder(username); // This should catch errors internally and handle them appropriately

    await client.query('UPDATE chimerachat_accounts SET userFolderId = $1 WHERE userid = $2', [userFolderId, userid]);
    await client.query('INSERT INTO encrypted_passwords(userid, hashpassword) VALUES ($1, $2)', [userid, hashedPassword]);
    await client.query('COMMIT');

    res.status(201).json({ message: 'Your account has been created! Redirecting to the login page...', redirect: '/login.html' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error during registration:", err);
    res.status(500).json({ message: "Registration failed.", error: err.message });
  } finally {
    client.release();
  }
});


/*/ Registrerings route
app.post('/signup', async (req, res) => {
  console.log("👉 Mottaget POST /signup:", req.body);
  const { email, username, password } = req.body;
  const client = await pool.connect();  // Hämta en klient från poolen

  try {
    await client.query('BEGIN');  // Starta en transaktion

    if (!email || !username || !password) {
      return res.status(400).json({ message: "Alla fält måste fyllas i." });
    }

    const existingUser = await pool.query(
        'SELECT userid FROM chimerachat_accounts WHERE email = $1 OR username = $2',
        [email, username]
    );

    if (existingUser.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: "E-post eller användarnamn används redan!" });
    }

    // Skapa användare
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("🔑 Hashed Password:", hashedPassword);
    const userResult = await client.query(
        'INSERT INTO chimerachat_accounts(email, username) VALUES ($1, $2) RETURNING userid',
        [email, username]
    );

    if (userResult.rows.length === 0) {
      throw new Error("Misslyckades med att skapa användaren i databasen.");
    }
    // Lägg till användare i databasen tillsammans med deras folder ID
    const { userid } = userResult.rows[0];
    // Skapa en mapp på Google Drive
    const userFolderId = await createUserFolder(username);

    // Add user to the database together with their folder ID
    await client.query(
        'UPDATE chimerachat_accounts SET userFolderId = $1 WHERE userid = $2',
        [userFolderId, userid]
    );

    // Spara det krypterade lösenordet
    await client.query(
        'INSERT INTO encrypted_passwords(userid, hashpassword) VALUES ($1, $2)',
        [userid, hashedPassword]
    );

    console.log("✅ Användare skapad och lösenord sparat!");

    await client.query('COMMIT'); // Fullfölj transaktionen
    res.status(201).json({
      message: 'Ditt konto har skapats! Omdirigerar till inloggningssidan...',
    });

  } catch (err) {
    await client.query('ROLLBACK'); // Ångra alla ändringar om ett fel inträffar
    console.error("Fel vid registrering:", err);
      res.status(500).json({
        message: "Registrering misslyckades.",
        error: err.message // Lägg till detaljerat felmeddelande
    });
  } finally {
    client.release(); // Släpp anslutningen tillbaka till poolen
  }
});*/

// login route
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

    // Store user ID in the session
    req.session.userId = user.userid;

    res.json({
      message: "Inloggning lyckades!", user,
      redirect: "home.html"
    });

  } catch (err) {
    console.error("Inloggningsfel:", err);
    res.status(500).json("Serverfel vid inloggning");
  }
});

//Logout route
app.post('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error during logout:", err);
        return res.status(500).json({ message: "Failed to log out" });
      }
      res.status(200).json({ message: "Utloggning lyckades",
        redirect: "index.html"
      });
    });
  } else {
    res.status(200).json({ message: "Utloggning lyckades",
      redirect: "index.html"
    });
  }

});

//Get user folder ID from database
app.get('/api/user/files', async (req, res) => {
  if(!req.session.userId){
    return res.status(401).json({message: "You are not logged in"});
  }
  const userId = req.session.userId; // Användarens ID från sessionen

  try {
    const userFolderId = await getUserFolderId(userId); // Hämta mapp-ID från databasen
    const driveResponse = await drive.files.list({
      pageSize: 10,
      fields: 'nextPageToken, files(id, name)',
      q: `'${userFolderId}' in parents`  // Listar filer i användarens mapp
    });

    const files = driveResponse.data.files;
    res.status(200).json(files);
  } catch (error) {
    console.error("Error fetching files from Drive:", error);
    res.status(500).json({ message: "Failed to fetch files." });
  }
});

app.get('/api/user/id', async (req, res) => {
  if(!req.session.userId){
    return res.status(401).json({message: "You are not logged in"});
  }
  try {
    const userId = req.session.userId;
    const userFolderId = await getUserFolderId(userId);
    res.json({ id: userFolderId });
  } catch (error) {
    console.error('Error fetching userFolderId:', error);
    res.status(500).json({ message: 'Failed to fetch userFolderId' });
  }
});

app.get('/api/files', async (req, res) => {
  if(!req.session.userId){
    return res.status(401).json({message: "You are not logged in"});
  }
  try {
    const userId = req.session.userId;  // Användarens ID från sessionen, se till att sessionen är korrekt inställd
    const userFolderId = await getUserFolderId(userId);  // Hämta användarens Google Drive mapp ID från databasen

    const driveResponse = await drive.files.list({
      q: `'${userFolderId}' in parents`,  // Filtrera för filer som ligger i den specifika användarmappen
      fields: 'nextPageToken, files(id, name, mimeType, webViewLink, webContentLink)',  // Ange vilka fält som ska returneras
      pageSize: 10  // Antal filer att returnera
    });

    const files = driveResponse.data.files;
    res.status(200).json(files);
  } catch (error) {
    console.error("Error fetching files from Drive:", error);
    res.status(500).json({ message: "Failed to fetch files.", error: error.message });
  }
});


// Standard route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Servern körs på port ${port}`);
});


