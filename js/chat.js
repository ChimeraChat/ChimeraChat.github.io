const socket = io();

async function loadChatHistory() {
    try {
        const response = await fetch('/api/chat/history');
        const messages = await response.json();
        messages.forEach(displayMessage);
    } catch (error) {
        console.error("Error loading chat history:", error);
    }
}

function displayMessage(message) {
    const chatBox = document.getElementById("chatBox");
    const msgElement = document.createElement("p");
    msgElement.innerHTML = `<strong>${message.sender_username}:</strong> ${message.message}`;
    chatBox.appendChild(msgElement);
}

document.getElementById("chatForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const messageInput = document.getElementById("messageInput");
    const message = messageInput.value.trim();

    if (message) {
        const user = JSON.parse(sessionStorage.getItem("user"));
        const messageData = {
            senderId: user.id,
            senderUsername: user.username,
            message,
        };

        socket.emit("sendMessage", messageData);
        messageInput.value = ""; // Clear input
    }
});

socket.on("receiveMessage", displayMessage);


document.addEventListener("DOMContentLoaded", loadChatHistory);



















/*async function sendMessage() {
    const chatUser = sessionStorage.getItem("chatWith") ? JSON.parse(sessionStorage.getItem("chatWith")) : null;
    const messageInput = document.getElementById("messageInput");
    const message = messageInput.value.trim();

    if (!chatUser || !message) return;

    try {
        const response = await fetch("/send-message", );
        if (!response.ok) throw new Error("Failed to send message");
    } catch (error) {
        console.error("Message send error:", error);
        alert("Could not send message. Please try again.");
    }

    if (response.ok) {
        displayMessage("You", message); // Show message in chat
        messageInput.value = ""; // Clear input
    } else {
        alert("Failed to send message.");
    }
}

function displayMessage(sender, message) {
    const chatBox = document.getElementById("chatBox");
    const msgElement = document.createElement("div");
    msgElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatBox.appendChild(msgElement);
}

// Send message when button is clicked
document.getElementById("sendButton").addEventListener("click", sendMessage);*/