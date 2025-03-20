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

    if (!recipientUsername || !message) {
        alert("Recipient and message are required.");
        return;
    }

    const user = JSON.parse(sessionStorage.getItem("user"));
    socket.emit("sendPrivateMessage", {
        senderUsername: user.username,
        recipientUsername,
        message
    });

    // Show message instantly
    displayPrivateMessage({ senderUsername: "Me", message });

    messageInput.value = "";

});

// Listen for private messages
socket.on("receivePrivateMessage", displayPrivateMessage);

// Display private messages
function displayPrivateMessage(message) {
    const chatBox = document.getElementById("chatBoxPrivate");
    if (!chatBox) return;

    const msgElement = document.createElement("p");

    msgElement.classList.add(
        message.senderUsername === "Me" ? "user-message" : "other-message"
    );

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
socket.on("updateUserLists", (users) => {
    const onlineUsersList = document.getElementById("onlineUsers");
    const offlineUsersList = document.getElementById("offlineUsers");

    onlineUsersList.innerHTML = "";
    offlineUsersList.innerHTML = "";

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
});

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




