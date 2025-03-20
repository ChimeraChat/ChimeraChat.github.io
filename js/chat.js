import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
const socket = io();

const chatBoxPublic = document.getElementById("chatBoxPublic");
const chatBoxPrivate = document.getElementById("chatBoxPrivate");
const privateRecipient = document.getElementById("privateRecipient");

// Check if the elements exist before using them
if (!chatBoxPublic || !chatBoxPrivate || !privateRecipient) {
    console.error("Some chat elements are missing in the HTML.");
}

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

        if (!user || !user.userid) {
            console.error("Error: User or user ID is missing from sessionStorage.");
            alert("Error: User not recognized. Please re-login.");
            return;
        }

        // Ensure the object includes `senderId`
        socket.emit("sendMessage", { message });

        messageInput.value = ""; // Clear input
    }
});

// Event listener for private chat
document.getElementById("chatFormPrivate").addEventListener("submit", (event) => {
    event.preventDefault();
    const messageInput = document.getElementById("messageInputPrivate");
    const recipientInput = document.getElementById("privateRecipient"); // Get recipient
    const recipient = recipientInput.value.trim();
    const message = messageInput.value.trim();

    if (!recipient) {
        alert("Please enter a recipient for the private message.");
        return;
    }

    if (message) {
        const user = JSON.parse(sessionStorage.getItem("user"));
        socket.emit("sendPrivateMessage", { message, sender: user.username, recipient });
        messageInput.value = "";
    }
});


socket.on("updateOnlineUsers", (users) => {
    const onlineUsersList = document.getElementById("onlineUsers");
    if (!onlineUsersList) return;

    onlineUsersList.innerHTML = ""; // Clear existing list

    users.forEach((username) => {
        const listItem = document.createElement("li");
        listItem.textContent = username;
        onlineUsersList.appendChild(listItem);
    });
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