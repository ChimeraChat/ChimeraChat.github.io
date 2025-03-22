import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
const socket = io("https://chimerachat.onrender.com/");

const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");
const onlineUsersList = document.getElementById("onlineUsers");



// Check if the elements exist before using them
// Check if the elements exist before using them
if (!chatBox || !messageInput || !onlineUsersList) {
    console.error("Some chat elements are missing in the HTML.");
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


// Load history when the page loads
loadChatHistory();

//Emit a userLoggedIn event when a new connection is stablished.
try {
    const user = JSON.parse(sessionStorage.getItem("user"));
    socket.emit("userLoggedIn", { username: user.username });
} catch (error) {
    console.error("Error loading user data", error)
}


// Get UI elements
//const chatBox = document.getElementById("chatBox");
const chatRecipient = document.getElementById("chatRecipient"); // Dropdown for recipient
const chatWithTitle = document.getElementById("chatWithTitle");

// Update title based on recipient
chatRecipient.addEventListener("change", () => {
    const selectedUser = chatRecipient.value;
    chatWithTitle.textContent = selectedUser === "public" ? "Public Chat" : `Chat with ${selectedUser}`;
});

// Load available users dynamically
socket.on("updateOnlineUsers", (users) => {
    const onlineUsersList = document.getElementById("onlineUsers");
    const privateRecipientDropdown = document.getElementById("chatRecipient");

    if (!onlineUsersList || !privateRecipientDropdown) return;

    // Clear lists before updating
    onlineUsersList.innerHTML = "";
    privateRecipientDropdown.innerHTML = '<option value="">Select a user</option>';

    users.forEach((username) => {
        // Update sidebar list
        const listItem = document.createElement("li");
        listItem.textContent = username;
        onlineUsersList.appendChild(listItem);

        // Add to dropdown for private chat
        const option = document.createElement("option");
        option.value = username;
        option.textContent = username;
        privateRecipientDropdown.appendChild(option);
    });
});
// Function to display messages
function displayMessage(message, type = "public") {
    if (type === "private" && message.recipient !== sessionStorage.getItem("user").username) return; // Ignore if not meant for user

    const msgElement = document.createElement("p");
    msgElement.classList.add(message.sender === sessionStorage.getItem("user").username ? "user-message" : "other-message");
    msgElement.innerHTML = `<strong>${message.sender}:</strong> ${message.message}`;
    chatBox.appendChild(msgElement);
    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll
}

// Listen for messages
socket.on("receiveMessage", (data) => displayMessage(data, "public"));
socket.on("receivePrivateMessage", (data) => displayMessage(data, "private"));

// Send message
document.getElementById("chatForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const recipient = document.getElementById("chatRecipient").value.trim();
    const message = document.getElementById("messageInput").value.trim();

    if (!message) {
        return;
    }
    const user = JSON.parse(sessionStorage.getItem("user"));
    console.log("User from sessionStorage: ", user); // ADDED LINE: Inspect retrieved data

    if (!recipient) {
        alert("Please select a user to send a private message.");
        return;
    }

    if (!user || !user.userid || !user.username) {
        console.error("Error: User data is missing from sessionStorage.");
        alert("Error: Please log in again.");
        return;
    }

    if (recipient === "public") {
        console.log(`Public message from ${user.username}:`, message); // Debugging

        socket.emit("sendPublicMessage", {
            message,
            senderId: user.userid,
            senderUsername: user.username
        });
    } else {
        console.log(`Private message from ${user.username} to ${recipient}:`, message); // Debugging

    socket.emit("sendPrivateMessage", {
        recipient,
        message,
        senderId: user.userid,
        senderUsername: user.username
    });

        document.getElementById("messageInput").value = ""; // Clear input field
    }

});
document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(sessionStorage.getItem("user"));

    if (!user || !user.id || !user.username) {
        console.error("Error: User or user ID is missing from sessionStorage.");
        alert("Please log in again.");
        return;
    }

    console.log("User loaded from session:", user);
});
