import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
const socket = io("https://chimerachat.onrender.com");

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
        const messages = await response.json();
        messages.forEach(displayMessage);
    } catch (error) {
        console.error("Error loading chat history:", error);
    }
}

// Event listener for public chat
document.getElementById("chatFormPublic").addEventListener("submit", (event) => {
    event.preventDefault();
    const messageInput = document.getElementById("messageInputPublic");
    const message = messageInput.value.trim();

    if (message) {
        const user = JSON.parse(sessionStorage.getItem("user"));
        socket.emit("sendMessage", { message, username: user.username, type: "public" });
        messageInput.value = "";
    }
});

// Event listener for private chat
document.getElementById("chatFormPrivate").addEventListener("submit", (event) => {
    event.preventDefault();
    const messageInput = document.getElementById("messageInputPrivate");
    const message = messageInput.value.trim();

    if (message) {
        const user = JSON.parse(sessionStorage.getItem("user"));
        // Assuming you want to send to a specific user, you'll need the recipient's username
        const recipient = "someOtherUser"; // This can be dynamic based on the selected private chat
        socket.emit("sendPrivateMessage", { message, sender: user.username, recipient });
        messageInput.value = "";
    }
});

// Listen for incoming messages
socket.on("receiveMessage", (data) => {
    displayMessage(data, "public");
});

socket.on("receivePrivateMessage", (data) => {
    displayMessage(data, "private");
});

// Load history when the page loads
loadChatHistory();




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