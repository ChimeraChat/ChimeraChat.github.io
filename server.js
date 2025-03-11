import express from 'express';
import path from 'path';
import pkg from 'pg';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
dotenv.config({ path: 'googledrive.env' });
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bcrypt from 'bcrypt';
import { uploadMiddleware, uploadFileToDrive, createUserFolder } from "./config/googleDrive.js";
import { dbConfig } from './config/db.js';
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
app.use(bodyParser.json());

// Använd routes
//app.use('/signup', signupRoute);
//app.use('/login', loginRoute);

app.post('/upload', uploadMiddleware, async (req, res) => {
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

    // Skapa en mapp på Google Drive
    const userFolderId = await createUserFolder(username);

    // Lägg till användare i databasen tillsammans med deras folder ID
    const result = await pool.query(
        'INSERT INTO chimerachat_accounts(email, username, userFolderId) VALUES ($1, $2, $3) RETURNING userid',
        [email, username, userFolderId]
    );

    if (userResult.rows.length === 0) {
      throw new Error("Misslyckades med att skapa användaren i databasen.");
    }
    const { userid } = userResult.rows[0];

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

//Get user folder ID from database
app.get('/api/user/files', async (req, res) => {
  const userId = req.session.userId; // Användarens ID från sessionen
  const userFolderId = await getUserFolderId(userId); // Hämta mapp-ID från databasen

  try {
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


// Standard route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Servern körs på port ${port}`);
});


