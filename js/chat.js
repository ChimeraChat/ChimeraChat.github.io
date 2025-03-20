import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
const socket = io();

const chatBoxPublic = document.getElementById("chatBoxPublic");
const chatBoxPrivate = document.getElementById("chatBoxPrivate");
const privateRecipient = document.getElementById("privateRecipient");
const messageInputPublic = document.getElementById("messageInputPublic");
const messageInputPrivate = document.getElementById("messageInputPrivate");
const onlineUsersList = document.getElementById("onlineUsers");

// Check if the elements exist before using them
// Check if the elements exist before using them
if (!chatBoxPublic || !chatBoxPrivate || !privateRecipient || !messageInputPublic || !messageInputPrivate || !onlineUsersList) {
    console.error("Some chat elements are missing in the HTML.");
}

// Function to display messages
function displayMessage(message, type = "public") {
    try {
        const chatBox = type === "private" ? chatBoxPrivate : chatBoxPublic;
        const msgElement = document.createElement("p");

        // Check if the message is from the user
        const user = JSON.parse(sessionStorage.getItem("user"));
        if (user && user.username === message.sender_username) {
            msgElement.classList.add("user-message"); // Style for user messages
        } else {
            msgElement.classList.add("other-message"); // Style for received messages
        }

        msgElement.innerHTML = `<strong>${message.sender_username}:</strong> ${message.message}`;
        chatBox.appendChild(msgElement);

        // Auto-scroll to the bottom
        chatBox.scrollTop = chatBox.scrollHeight;
    } catch (error) {
        console.error("Error in displayMessage:", error);
    }
}

/*
function displayMessage(message, type = "public") {
    const chatBox = type === "private" ? document.getElementById("chatBoxPrivate") :
document.getElementById("chatBoxPublic");
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
}*/

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
    const message = messageInputPublic.value.trim();

    if (message) {
        const user = JSON.parse(sessionStorage.getItem("user"));

        console.log(message, user)

        if (!user || !user.userid) {
            console.error("Error: User or user ID is missing from sessionStorage.");
            alert("Error: User not recognized. Please re-login.");
            return;
        }

        // Ensure the object includes `senderId`
        socket.emit("sendMessage", { message: message, senderId: user.userid, senderUsername: user.username });

        messageInputPublic.value = ""; // Clear input
    }
});

// Event listener for private chat
document.getElementById("chatFormPrivate").addEventListener("submit", (event) => {
    event.preventDefault();
    const recipient = privateRecipient.value.trim();
    const message = messageInputPrivate.value.trim();

    try {
        const user = JSON.parse(sessionStorage.getItem("user"));

        if (!user || !user.id || !user.username) {
            console.error("Error: User data is missing from sessionStorage.");
            alert("Error: Please log in again.");
            return;
        }

        if (!recipient) {
            alert("Please enter a recipient.");
            return;
        }

        console.log(`Private message from ${user.username} to ${recipient}:`, message); // Debugging

        socket.emit("sendPrivateMessage", {
            recipient,
            message,
            senderId: user.id,
            senderUsername: user.username
        });
        messageInputPrivate.value = ""; // Clear input field
    } catch (error) {
        console.error("Error sending private message:", error);
        alert("Failed to send private message.");
    }
});

socket.on("updateOnlineUsers", (users) => {
    if (!onlineUsersList) {
        console.error("onlineUsers element not found.");
        return;
    }

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

//Emit a userLoggedIn event when a new connection is stablished.
try {
    const user = JSON.parse(sessionStorage.getItem("user"));
    socket.emit("userLoggedIn", { username: user.username });
} catch (error) {
    console.error("Error loading user data", error)
}