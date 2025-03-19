//main.js
import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
const socket = io();

function setupRestrictedLinks() {
    setTimeout(() => {  // Delay to ensure sessionStorage is updated
        const userString = sessionStorage.getItem("user");
        let user = null;

        if (userString) {
            try {
                user = JSON.parse(userString);
            } catch (error) {
                console.error('Error parsing user data from session storage:', error);
            }
        }

        if (!user) {
            const restrictedLinks = document.querySelectorAll('a[href="chat.html"], a[href="files.html"]');
            restrictedLinks.forEach(link => {
                link.addEventListener("click", (event) => {
                    event.preventDefault();
                    alert("Please log in to access this page.");
                    window.location.href = "login.html";
                });
            });
        }
    }, 500); // Delay 500ms to let sessionStorage update
}


document.addEventListener("DOMContentLoaded", () => {
    setupRestrictedLinks();
});

export { setupRestrictedLinks };

// Update only online users list
function updateUserList(users) {
    const onlineUsersList = document.getElementById("onlineUsers");
    if (!onlineUsersList) {
        console.error(" Error: Online users list not found.");
        return;
    }

    onlineUsersList.innerHTML = ""; // Clear list

    users.forEach(username => {
        const listItem = document.createElement("li");
        listItem.textContent = username;
        listItem.classList.add("online-user");
        onlineUsersList.appendChild(listItem);
    });
}

// Listen for online user updates
socket.on("updateOnlineUsers", updateUserList);
