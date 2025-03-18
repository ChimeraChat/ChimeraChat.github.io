import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
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

// Function to display messages
function displayMessage(message) {
    const chatBox = document.getElementById("chatBoxPublic");
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
    }, 1000); // Delay to ensure the message is displayed before scrolling

    // Auto-scroll to the bottom
    chatBox.scrollTop = chatBox.scrollHeight;
}

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

// Send a private message
document.getElementById("chatFormPrivate").addEventListener("submit", (event) => {
    event.preventDefault();
    const messageInput = document.getElementById("messageInputPrivate");
    const recipientUsername = document.getElementById("privateRecipient").value;
    const message = messageInput.value.trim();

    if (message && recipientUsername) {
        const user = JSON.parse(sessionStorage.getItem("user"));
        socket.emit("sendPrivateMessage", {
            senderUsername: user.username,
            recipientUsername,
            message
        });

        // Show message instantly
        displayPrivateMessage({ senderUsername: "Me", message });

        messageInput.value = "";
    }
});

// Display private messages
function displayPrivateMessage(message) {
    const chatBox = document.getElementById("chatBoxPrivate");
    if (!chatBox) return;

    const msgElement = document.createElement("p");

    if (message.senderUsername === "Me") {
        msgElement.classList.add("user-message");
    } else {
        msgElement.classList.add("other-message");
    }

    msgElement.innerHTML = `<strong>${message.senderUsername}:</strong> ${message.message}`;
    chatBox.appendChild(msgElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Listen for private messages
socket.on("receivePrivateMessage", displayPrivateMessage);


// Receive messages
socket.on("receiveMessage", displayMessage);


//socket.on("receiveMessage", displayMessage, updateUserList, loadChatHistory);


// Update online & offline users list
function updateUserLists(users) {
    const onlineUsersList = document.getElementById("onlineUsers");
    const offlineUsersList = document.getElementById("offlineUsers");

    if (!onlineUsersList || !offlineUsersList) {
        console.error("Error: User lists not found.");
        return;
    }

    onlineUsersList.innerHTML = ""; // Clear list
    offlineUsersList.innerHTML = ""; // Clear list

    users.forEach(user => {
        const listItem = document.createElement("li");
        listItem.textContent = user.username;

        if (user.isOnline) {
            listItem.classList.add("online-user");
            onlineUsersList.appendChild(listItem);
        } else {
            listItem.classList.add("offline-user");
            offlineUsersList.appendChild(listItem);
        }
    });
}

// Notify server when user logs in
document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    if (user) {
        socket.emit("userLoggedIn", { id: user.id, username: user.username });
    }
    loadChatHistory();
});

// Listen for online users update
socket.on("updateOnlineUsers", updateUserLists);



