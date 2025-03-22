import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
const socket = io("https://chimerachat.onrender.com/");

const messageInput = document.getElementById("messageInput");
const onlineUsersList = document.getElementById("onlineUsers");



// Check if the elements exist before using them
// Check if the elements exist before using them
if ( !messageInput || !onlineUsersList) {
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
    //privateRecipientDropdown.innerHTML = '<option value="">Select a user</option>';

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
    // Check if message is valid
    if (!message || !message.sender || !message.message) {
        console.error('Error: message is not valid. Missing sender or message.');
        return
    }
    const userString = sessionStorage.getItem("user");
    if (!userString) {
        console.error('Error: user not found in sessionStorage');
        return
    }
    const user = JSON.parse(userString);
    if (type === "private" && message.recipient !== user.username && message.sender !== user.username ) return; // Ignore if not meant for user or is not sent by user
    const chatBox = document.getElementById('chatBox');
    if (!chatBox) {
        console.error("Error: chatListCon not found. Cannot display message.")
        return;
    }
    const msgElement = document.createElement("p");
    msgElement.classList.add(message.sender === user.username ? "user-message" : "other-message");
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

    if (!user || !user.id || !user.username) {
        console.error("Error: User data is missing from sessionStorage.");
        alert("Error: Please log in again.");
        return;
    }

    if (recipient === "public") {
        console.log(`Public message from ${user.username}:`, message); // Debugging

        socket.emit("sendPublicMessage", {
            message,
            senderId: user.id,
            senderUsername: user.username
        });
    } else {
        console.log(`Private message from ${user.username} to ${recipient}:`, message); // Debugging

        socket.emit("sendPrivateMessage", {
            recipient,
            message,
            senderId: user.id,
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

const Userdata = {
    sessionStorageKeys: Object.keys(sessionStorage),
    sessionStorageUser: sessionStorage.getItem('user'),
};

//DEBUGG
const data = {
    sessionStorageKeys: Object.keys(sessionStorage),
    sessionStorageData: {},
    errorContext: null,
};

Object.keys(sessionStorage).forEach(key => {
    try {
        data.sessionStorageData[key] = JSON.parse(sessionStorage.getItem(key));
    } catch (e) {
        data.sessionStorageData[key] = sessionStorage.getItem(key);
    }
});

try {
    const errorLine = document.querySelector('script[src*="chat.js"]');
    if(errorLine) {
        const chatJSContent = await fetch(errorLine.src).then(res => res.text());
        const errorLineContent = chatJSContent.split('\n')[107];

        data.errorContext = {
            file: 'chat.js',
            line: 108,
            code: errorLineContent,
        };
    }
} catch (e) {
    console.error(e)
}