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

// Load chat history
async function loadChatHistory() {
    try {
        const response = await fetch('/api/chat/history');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const messages = await response.json();
        messages.forEach(message => displayMessage(message, "chatBoxPublic"));

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
    const message = messageInput.value.trim();

    if (message) {
        const user = JSON.parse(sessionStorage.getItem("user"));

        socket.emit("sendMessage", { message, username: user.username, type: "public" });
        messageInput.value = "";


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

        socket.once("messageConfirmed", () => {
            displayMessage(messageData, "chatBoxPublic");
        });
        messageInput.value = ""; // Clear input

    }
});

// Event listener for private chat
document.getElementById("chatFormPrivate").addEventListener("submit", (event) => {
    event.preventDefault();
