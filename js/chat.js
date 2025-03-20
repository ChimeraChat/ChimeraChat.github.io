import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
const socket = io();

// Function to display messages
function displayMessage(message, type = "public") {
    const chatBox = type === "private" ? document.getElementById("chatBoxPrivate") : document.getElementById("chatBoxPublic");
    const msgElement = document.createElement("p");


    // Check if the message is from the user
    const user = JSON.parse(sessionStorage.getItem("user"));
    if (user.username === message.sender_username) {
        msgElement.classList.add("user-message"); // Style for user messages
    } else {
        msgElement.classList.add("other-message"); // Style for received messages
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

// Send a new message
document.getElementById("chatFormPublic").addEventListener("submit", (event) => {
    event.preventDefault();
    const messageInput = document.getElementById("messageInputPublic");
    const message = messageInput.value.trim();

    if (message) {
        const user = JSON.parse(sessionStorage.getItem("user"));

        socket.emit("sendMessage", { message, username: user.username, type: "public" });
        messageInput.value = ""; // Clear input
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