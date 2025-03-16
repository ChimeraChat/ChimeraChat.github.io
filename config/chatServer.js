import { createServer } from 'http';
import { Server } from 'socket.io';
import express from 'express';
import dotenv from 'dotenv';
import {dbConfig} from './db.js'; // Import the database connection
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool(dbConfig);

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

let onlineUsers = {}; // Store online users

// WebSocket Connection
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // When a user logs in, store their username
    socket.on("userLoggedIn", (username) => {
        onlineUsers[socket.id] = username;
        io.emit("updateOnlineUsers", Object.values(onlineUsers)); // Broadcast updated list
    });

    // When a user sends a message
    socket.on("sendMessage", async (messageData) => {
        try {
            const {senderId, senderUsername, message} = messageData;

            //Save to database
            await pool.query('INSERT INTO chat_messages(sender_id, sender_username, message) VALUES ($1, $2, $3)',
                [senderId, senderUsername, message]);

            console.log("Message saved to database:", messageData);
            io.emit("receiveMessage", messageData); // Send message to all users
        } catch (error)
        {
            console.error("Error saving message to database:", error);
        }
    });
    // When a user disconnects
    socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
        delete onlineUsers[socket.id];
        io.emit("updateOnlineUsers", Object.values(onlineUsers)); // Update user list
    });
});

app.get("/api/chat/history", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT sender_username, message, timestamp FROM chimerachat_messages ORDER BY timestamp ASC"
        );
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching chat history:", error);
        res.status(500).json({ message: "Failed to fetch chat history." });
    }
});

// Start the chat server
const CHAT_PORT = process.env.CHAT_PORT || 3001;
server.listen(CHAT_PORT, () => {
    console.log(`🚀 Chat server is running on port ${CHAT_PORT}`);
});

/*// Sample route
app.get("/", (req, res) => {
    res.send("ChimeraChat Server is Running!");
});*/