import { Server } from "socket.io";
import {dbConfig} from './db.js'; // Import the database connection
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool(dbConfig);

let io;
let onlineUsers = {}; // Store online users

export function startChat(server) {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

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
    return io;
}
