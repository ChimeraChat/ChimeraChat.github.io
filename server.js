//server.js
import { createServer } from 'http';
import { Server } from 'socket.io';
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
import {drive, uploadMiddleware, uploadFileToDrive} from "./config/googleDrive.js";

const { Pool } = pkg;
const pool = new Pool(dbConfig);

const PgSession = pgSession(session);
const app = express();
const port = process.env.PORT || 10000;

const server = createServer(app); // Wrap Express with HTTP
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Store online users
let onlineUsers = new Map();

// Hantera __dirname i ESM-modul
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Lägg till denna rad för att servera statiska filer (HTML, CSS, bilder):
app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.use(express.static('public'));

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
      delete user.hashpassword;

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

app.post('/api/upload', uploadMiddleware, async (req, res) => {
  try {
    if (!req.session.user || !req.session.user.id) {
      return res.status(401).json({ message: "You are not logged in" });
    }

    const file = req.file;
    console.log("Uploading file:", file.originalname, "to shared folder.");

    // Upload file to Google Drive
    const uploadResult = await uploadFileToDrive(file.buffer, file.originalname, file.mimetype);

    if (!uploadResult) {
      return res.status(500).json({ message: "File upload failed" });
    }

    res.status(200).json({ message: "File uploaded successfully", fileId: uploadResult.fileId, downloadLink: uploadResult.fileLink });

  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
});

// Get files from a user's Google Drive folder
app.get('/api/files', async (req, res) => {
  try {
    const driveResponse = await drive.files.list({
      q: `'${process.env.GOOGLE_DRIVE_SHARED_FOLDER_ID}' in parents`,
      fields: 'files(id, name, mimeType, webViewLink, webContentLink)',
      pageSize: 50
    });

    const files = driveResponse.data.files;
    console.log("Files found:", files);
    res.status(200).json(files);

  } catch (error) {
    console.error("Error fetching files from Google Drive:", error);
    res.status(500).json({ message: "Failed to fetch files." });
  }
});
// download files from a user's Google Drive folder
app.get('/api/download/:fileId', async (req, res) => {
  try {
    const fileId = req.params.fileId;
    if (!fileId) {
      return res.status(400).json({ message: "File ID is required" });
    }

    const fileUrl = `https://drive.google.com/uc?id=${fileId}&export=download`;
    res.json({ url: fileUrl });
  } catch (error) {
    console.error("Error generating download link:", error);
    res.status(500).json({ message: "Failed to generate download link." });
  }
});

// WebSocket Connection
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // When a user logs in, store their username
  socket.on("userLoggedIn", (username) => {
    if (!username || !username.username) {
      console.error("Invalid username data:", username);
      return;
    }
    const name = username.username;
    if (onlineUsers.has(name)) {
      console.error('username already taken', name)
      return;
    }
    onlineUsers.set(name, socket.id);
    console.log(` ${name} is now online`);
    io.emit("updateOnlineUsers", Array.from(onlineUsers.keys())); // Broadcast updated list
  });

  // When a user disconnects
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
    let username = null;
    for (const [user, sockId] of onlineUsers) {
      if (sockId === socket.id) {
        username = user;
        break;
      }
    }

    if (username) {
      onlineUsers.delete(username);
      io.emit("updateOnlineUsers", Array.from(onlineUsers.keys())); // Update user list
    }
  });
  console.log("User connected:", socket.id);

  socket.on("sendPublicMessage", async (messageData) => {
    try {
      const {senderId, senderUsername, message} = messageData;
      console.log("Public Message from:", senderUsername, message);

      // Save to database
      await pool.query('INSERT INTO chimerachat_messages(sender_id, sender_username, message) VALUES ($1, $2, $3)',
          [senderId, senderUsername, message]);

        // Broadcast to everyone
        io.emit("other-message", { sender: senderUsername, message: message });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  socket.on("sendPrivateMessage", async (data) => {
    try {
      const { recipient, message, senderId, senderUsername } = data;
      console.log(`Private message from ${senderUsername} to ${recipient}: ${message}`);
      // Save private message to database
      await pool.query('INSERT INTO chimerachat_private_messages(sender_id, sender_username, recipient_username, message) VALUES ($1, $2, $3, $4)',
          [senderId, senderUsername, recipient, message]);
      io.emit("user-message", { sender: senderUsername, message: message, recipient: recipient });

      // Find recipient socket ID
      const recipientSocketId = [...onlineUsers.entries()].find(([socketId, username]) => username === recipient)?.[0];

      if (recipientSocketId) {
        io.to(recipientSocketId).emit("user-message", { sender: senderUsername, message: message, recipient: recipient });
      } else {
        console.log(`Recipient ${recipient} is offline.`);
      }
    } catch (error) {
      console.error("Error saving private message:", error);
    }
  });

});

app.get("/api/chat/history", async (req, res) => {
  console.log("Fetching chat history..."); //Check if code enters in this block
  try {
      const result = await pool.query(`
    SELECT sender_username, message, recipient_username, timestamp FROM chimerachat_messages
    UNION ALL
    SELECT sender_username, message, recipient_username, timestamp FROM chimerachat_private_messages
    ORDER BY timestamp ASC
  `);
      const messages = result.rows.map((row) => ({
        sender: row.sender_username,
        message: row.message,
        recipient: row.recipient_username,
      }));

      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      res.status(500).json({ message: "Failed to fetch chat history.", error: error.message });
    }
  });


// Standard route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

server.listen(port, () => {
  console.log(`servern körs på port ${port}`);
});


