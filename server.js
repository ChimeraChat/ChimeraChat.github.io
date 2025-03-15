//server.js
import express from 'express';
import path from 'path';
import pkg from 'pg';
import pgSession from 'connect-pg-simple';
import dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: 'googledrive.env' });

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bcrypt from 'bcrypt';
import { dbConfig } from './config/db.js';
import session from 'express-session';
import { drive, uploadMiddleware, uploadFileToDrive, createUserFolder } from "./config/googleDrive.js";


const { Pool } = pkg;
const pool = new Pool(dbConfig);
const PgSession = pgSession(session);
const app = express();
const port = process.env.PORT || 3000;

// Hantera __dirname i ESM-modul
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Lägg till denna rad för att servera statiska filer (HTML, CSS, bilder):
app.use(express.json());
app.use(express.static(path.join(__dirname)));

console.log("SESSION_SECRET:", process.env.SESSION_SECRET ? "Loaded secret" : "Not Found sec");

// Add express-session middleware
app.use(session({
  store: new PgSession({
    pool: pool, // Use your PostgreSQL pool connection
    tableName: 'session' // This is the default table name; change it if needed
  }),
  secret: process.env.SESSION_SECRET, // Use the secret stored in GitHub Secrets
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    secure: process.env.NODE_ENV === "production", // Set to true if using HTTPS
    httpOnly: true
  }
}));

console.log("🔍 GOOGLE_APPLICATION_CREDENTIALS:", process.env.GOOGLE_APPLICATION_CREDENTIALS);
app.set('trust proxy', 1); // Trust first proxy

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
    let userFolderId;

    try {
        userFolderId = await createUserFolder(username, pool);
    } catch (error) {
        console.error("Error creating Google Drive folder:", error.message);
        userFolderId = null; // Allow signup even if folder creation fails
    }

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

// login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body; // Ensure username and password exist
  try {
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
      //delete user.hashpassword;

      // Store user in session
      req.session.user = {
        id: user.userid,
        username: user.username
      };

      console.log("Session after login:", req.session); // Debugging

      res.json({
        message: "Login successful!",
        user: {
          id: user.userid,
          username: user.username,
          email: user.email
        },
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

app.post('/api/create-folder', async (req, res) => {
  if (!req.session.user || !req.session.user.id) {
    return res.status(401).json({ message: "You are not logged in" });
  }
  const userId = req.session.user.id;

  try {
    //Check if the user already has a folder in the database
    const folderQuery = "SELECT userfolderid FROM chimerachat_accounts WHERE userid = $1";
    const folderResult = await pool.query(folderQuery, [userId]);

    if (folderResult.rows.length > 0 && folderResult.rows[0].userfolderid) {
      return res.json({ message: "Folder already exists", folderId: folderResult.rows[0].userfolderid });
    }
    //Create folder
    const usernameQuery = "SELECT username FROM chimerachat_accounts WHERE userid = $1";
    const usernameResult = await pool.query(usernameQuery, [userId]);

    if (usernameResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const username = usernameResult.rows[0].username;
    const folderId = await createUserFolder(username, pool); // Create Google Drive folder

    //store the folder ID in the database
    await pool.query("UPDATE chimerachat_accounts SET userfolderid = $1 WHERE userid = $2", [folderId, userId]);

    res.json({ message: "Folder created successfully", folderId });

  } catch (error) {
    console.error("Error creating user folder:", error);
    res.status(500).json({ message: "Failed to create folder." });
  }
});

app.post('/api/upload', uploadMiddleware, async (req, res) => {
  if (!req.session.user || !req.session.user.id) {
    return res.status(401).json({ message: "You are not logged in" });
  }
  try {
    const userId = req.session.user.id;
    const username = req.session.user.username;

    console.log(`Uploading file for user: ${username}`);
    const folderResult = await pool.query(
        'SELECT userfolderid FROM chimerachat_accounts WHERE userid = $1',
        [userId]
    );
    if (folderResult.rows.length === 0 || !folderResult.rows[0].userfolderid) {
      return res.status(400).json({ message: "No folder found for this user." });
    }
    const parentFolderId = folderResult.rows[0].userfolderid; // Fix the missing variable
    console.log("User Folder ID:", parentFolderId);

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const fileId = await uploadFileToDrive(req.file.buffer, req.file.originalname, req.file.mimetype, parentFolderId);

    if (!fileId) {
      return res.status(500).json({ message: "File upload failed." });
    }

    res.json({ message: "Upload successful!", fileId });
  } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Server error during upload." });
  }
});


//Get user folder ID from database
app.get('/api/user/files', async (req, res) => {
  if (!req.session.user || !req.session.user.id) {
    return res.status(401).json({ message: "You are not logged in" });
  }
  const userId = req.session.user.id; // Användarens ID från sessionen
    try {
      const userFolderId = await createUserFolder(userId, pool); // Hämta mapp-ID från databasen
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

app.get('/api/files/:folderId', async (req, res) => {
  const { folderId } = req.params;

  if (!folderId) {
    return res.status(400).json({ message: "Folder ID is required." });
  }

  try {
    const driveResponse = await drive.files.list({
      q: `'${folderId}' in parents`,
      fields: 'files(id, name, mimeType, webViewLink, webContentLink)',
      pageSize: 10
    });

    res.status(200).json(driveResponse.data.files);
  } catch (error) {
    console.error("Error fetching files from Drive:", error);
    res.status(500).json({ message: "Failed to fetch files." });
  }
});


app.get('/api/user/id', async (req, res) => {
  if (!req.session.user || !req.session.user.id) {
    return res.status(401).json({ message: "You are not logged in" });
  }
  const userId = req.session.user.id;
  try {
      const folderResult = await pool.query(
          'SELECT userfolderid FROM chimerachat_accounts WHERE userid = $1',
          [userId]
      );

      if (folderResult.rows.length === 0 || !folderResult.rows[0].userfolderid) {
        return res.status(404).json({ message: "User folder ID not found." });
      }

      res.json({ id: folderResult.rows[0].userfolderid });
  } catch (error) {
    console.error('Error fetching userFolderId:', error);
    res.status(500).json({ message: 'Failed to fetch userFolderId' });
  }
});


// Standard route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Servern körs på port ${port}`);
});


