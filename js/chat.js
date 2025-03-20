import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
const socket = io();


// Function to display messages
function displayMessage(message, type = "public") {
    const chatBox = type === "private" ? document.getElementById("chatBoxPrivate") : document.getElementById("chatBoxPublic");
    const msgElement = document.createElement("p");

    const user = JSON.parse(sessionStorage.getItem("user"));
    if (user.username === message.sender_username) {
        msgElement.classList.add("user-message");
    } else {
        msgElement.classList.add("other-message");
    }

    msgElement.innerHTML = `<strong>${message.sender_username}:</strong> ${message.message}`;
    chatBox.appendChild(msgElement);

    // Auto-scroll to the bottom
    chatBox.scrollTop = chatBox.scrollHeight;
}


// Load previous chat history

async function loadChatHistory() {
    try {
        const response = await fetch('/api/chat/history');
        const messages = await response.json();
        messages.forEach(displayMessage);
    } catch (error) {
        console.error("Error loading chat history:", error);
    }
}

// Function to display messages
function displayMessage(message) {
    const chatBox = document.getElementById("chatBox");
    const msgElement = document.createElement("p");
>>>>>>> parent of 0dbb233 (chat)


// Send a new message
document.getElementById("chatFormPublic").addEventListener("submit", (event) => {
    event.preventDefault();
    const messageInput = document.getElementById("messageInputPublic");
    const message = messageInput.value.trim();

    if (message) {
        const user = JSON.parse(sessionStorage.getItem("user"));

        if (!user || !user.username) {
            console.error("Error: User is not defined in sessionStorage.");
            alert("Error: User not recognized. Please re-login.");
            return;
        }
        const messageData = {
            senderId: user.id,
            senderUsername: user.username,
            message,
        };

        socket.emit("sendMessage", messageData);

        // Wait for server confirmation before displaying message
        socket.once("messageConfirmed", () => {
            displayMessage(messageData);
        });
        messageInput.value = ""; // Clear input
    }
});

// Receive messages
socket.on("receiveMessage", (message) => {
    displayMessage(message);
});
// Receive messages
//socket.on("receiveMessage", displayMessage, updateUserList, loadChatHistory);


// Update online & offline users list
function updateUserLists(users) {
    const onlineUsersList = document.getElementById("onlineUsers");
    const offlineUsersList = document.getElementById("offlineUsers");

    onlineUsersList.innerHTML = ""; // Clear list
    offlineUsersList.innerHTML = ""; // Clear list

    users.forEach(user => {
        const listItem = document.createElement("li");
        listItem.textContent = user.username;

        if (user.isOnline) {
            onlineUsersList.appendChild(listItem);
        } else {
            offlineUsersList.appendChild(listItem);
        }
    });
}

// Notify server when user logs in
document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    if (user) {
        socket.emit("userLoggedIn", user.username);
    }
    loadChatHistory();
});

// Listen for online users update
socket.on("updateOnlineUsers", updateUserList);




