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
/*
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
/*
// Event listener for private chat
document.getElementById("chatFormPrivate").addEventListener("submit", (event) => {
    event.preventDefault();
    const recipient = privateRecipient.value.trim();
    const message = messageInputPrivate.value.trim();

    try {
        const user = JSON.parse(sessionStorage.getItem("user"));

        if (!user || !user.userid || !user.username) {
            console.error("Error: User data is missing from sessionStorage.");
            alert("Error: Please log in again.");
            return;
        }

        console.log(`Private message from ${user.username} to ${recipient}:`, message); // Debugging

        socket.emit("sendPrivateMessage", {
            recipient,
            message,
            senderId: user.userid,
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
*/

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
    const privateRecipientDropdown = document.getElementById("privateRecipient");

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
function displayMessage(message, type = "public") {
    const chatBox = type === "private" ? chatBoxPrivate : chatBoxPublic; // Correct selection

    if (!chatBox) {
        console.error(`Error: ${type} chatBox is missing in the HTML.`);
        return;
    }

    const msgElement = document.createElement("p");
    msgElement.classList.add(
        message.sender === JSON.parse(sessionStorage.getItem("user")).username
            ? "user-message"
            : "other-message"
    );

    msgElement.innerHTML = `<strong>${message.sender}:</strong> ${message.message}`;
    chatBox.appendChild(msgElement);

    // Auto-scroll
    chatBox.scrollTop = chatBox.scrollHeight;
}
// Function to display messages
/* DENNA KOMMENTERADE FLORA UT FOR TEST!!!
function displayMessage(message, type = "public") {
    if (type === "private" && message.recipient !== sessionStorage.getItem("user").username) return; // Ignore if not meant for user

    const msgElement = document.createElement("p");
    msgElement.classList.add(message.sender === sessionStorage.getItem("user").username ? "user-message" : "other-message");
    msgElement.innerHTML = `<strong>${message.sender}:</strong> ${message.message}`;
    chatBoxPrivate.appendChild(msgElement);
    chatBoxPrivate.scrollTop = chatBoxPrivate.scrollHeight; // Auto-scroll
}
*/
// Listen for messages
socket.on("receiveMessage", (data) => displayMessage(data, "public"));
socket.on("receivePrivateMessage", (data) => displayMessage(data, "private"));

// Send message
document.getElementById("chatForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const recipient = document.getElementById("privateRecipient").value.trim();
    const message = document.getElementById("messageInputPrivate").value.trim();

    if (!recipient) {
        alert("Please select a user to send a private message.");
        return;
    }

    if (message) {
        const user = JSON.parse(sessionStorage.getItem("user"));

        if (!user || !user.userid || !user.username) {
            console.error("Error: User data is missing from sessionStorage.");
            alert("Error: Please log in again.");
            return;
        }

        console.log(`Private message from ${user.username} to ${recipient}:`, message); // Debugging

        socket.emit("sendPrivateMessage", {
            recipient,
            message,
            senderId: user.userid,
            senderUsername: user.username
        });

        document.getElementById("messageInputPrivate").value = ""; // Clear input field
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
