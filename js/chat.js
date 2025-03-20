import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
const socket = io();


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


// Send a new message
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

// Receive messages
socket.on("receiveMessage", displayMessage, loadChatHistory);

// Load chat history when page loads
document.addEventListener("DOMContentLoaded", loadChatHistory);


// Update online users list
socket.on("updateOnlineUsers", (userList) => {
    const userListContainer = document.getElementById("onlineUsers");
    userListContainer.innerHTML = "";

    userList.forEach(user => {
        const listItem = document.createElement("li");
        listItem.textContent = user.username;
        userListContainer.appendChild(listItem);
    });
});



/*async function sendMessage() {
    const chatUser = sessionStorage.getItem("chatWith") ? JSON.parse(sessionStorage.getItem("chatWith")) : null;
    const messageInput = document.getElementById("messageInput");
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


// Update online users list
function updateUserList(users) {
    const onlineUsersList = document.getElementById("onlineUsers");
    onlineUsersList.innerHTML = ""; // Rensa listan

    users.forEach(username => {
        const listItem = document.createElement("li");
        listItem.textContent = username;
        onlineUsersList.appendChild(listItem);
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




