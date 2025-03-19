import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
const socket = io();

async function loadChatHistory() {
    try {
        const response = await fetch('/api/chat/history');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const messages = await response.json();

        messages.forEach(message => {
            if (!message.sender_username || !message.message) {
                console.error("Missing sender or message data:", message);
                return;
            }
            displayMessage(message, "chatBoxPublic");
        });
    } catch (error) {
        console.error("Error loading chat history:", error);
    }
}

// Function to display messages (now with target chat box)
function displayMessage(message, targetChatBoxId) {
    const chatBox = document.getElementById(targetChatBoxId);
    if (!chatBox) {
        console.error(`Error: ${targetChatBoxId} element not found.`);
        return;
    }

    const msgElement = document.createElement("p");

    // Check if the message is from the user
    const user = JSON.parse(sessionStorage.getItem("user"));

    if (!user || !user.username) {
        console.error("User data is missing in sessionStorage.");
        return;
    }

    if (user.username === message.sender_username) {
        msgElement.classList.add("user-message"); // Style for user messages
    } else {
        msgElement.classList.add("other-message"); // Style for received messages
    }

    msgElement.innerHTML = `<strong>${message.sender_username}:</strong> ${message.message}`;
    setTimeout(() => {
        chatBox.appendChild(msgElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    }, 1000); // Delay to ensure the message is displayed before scrolling
}

// Function to display private messages
function displayPrivateMessage(message) {
    displayMessage(message, "chatBoxPrivate");
}

// Send a new message (public)
document.getElementById("chatFormPublic").addEventListener("submit", (event) => {
    event.preventDefault();
    const messageInput = document.getElementById("messageInputPublic");
    if (!messageInput) {
        console.error("Error: messageInputPublic element not found.");
        return;
    }
    const message = messageInput.value.trim();

    const user = JSON.parse(sessionStorage.getItem("user"));

    if (!user || !user.username) {
        alert("Error: User not recognized. Please re-login.");
        window.location.href = "/login.html";
        return;
    }
    if (message) {
        const messageData = {
            senderId: user.id,
            senderUsername: user.username,
            message,
        };

        socket.emit("sendMessage", messageData);

        socket.on("messageConfirmed", () => {
            displayMessage(messageData, "chatBoxPublic");
        });
        messageInput.value = ""; // Clear input
    }
});

//Send private message
document.getElementById("chatFormPrivate").addEventListener("submit", (event) => {
    event.preventDefault();
    let recipientInput = document.getElementById("privateRecipient");
    let messageInput = document.getElementById("messageInputPrivate");

    if (!messageInput || !recipientInput) {
        console.error("Error: element not found.");
        return;
    }

    const recipientUsername = recipientInput.value.trim();
    const message = messageInput.value.trim();
    const user = JSON.parse(sessionStorage.getItem("user"));

    if (!user || !user.username) {
        alert("Error: User not recognized. Please re-login.");
        window.location.href = "/login.html";
        return;
    }

    if (message && recipientUsername) {
        const messageData = {
            senderUsername: user.username,
            recipientUsername: recipientUsername,
            message,
        };

        socket.emit("sendPrivateMessage", messageData);

        // Confirm private message delivery
        socket.on("privateMessageConfirmed", () => {
            displayPrivateMessage(messageData);
        });

        messageInput.value = "";
    } else {
        console.error("Empty message or recipient username");
    }
});

// Receive messages (public)
socket.on("receiveMessage", (message) => {
    displayMessage(message, "chatBoxPublic");
});

// Receive messages (private)
socket.on("receivePrivateMessage", (message) => {
    displayPrivateMessage(message, "chatBoxPrivate");
});

// Update online/offline users list
function updateUserList(users) {
    const onlineUsersList = document.getElementById("onlineUsers");
    const offlineUsersList = document.getElementById("offlineUsers");
    if (!onlineUsersList || !offlineUsersList) {
        console.error(`Error: onlineUsers or offlineUsers element not found.`);
        return;
    }
    onlineUsersList.innerHTML = "";
    offlineUsersList.innerHTML = "";

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




