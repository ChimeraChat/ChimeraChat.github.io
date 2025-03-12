const API_BASE_URL = "https://chimerachat.onrender.com";
import { handleFileUpload, loadFiles } from './files.js';

document.addEventListener("DOMContentLoaded", function () {
    const uploadForm = document.getElementById("uploadForm");
    if (uploadForm) {
        uploadForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            await handleFileUpload();
            await loadFiles();
        });
    } else {
        console.error("uploadForm not found in DOM");
    }
});


document.getElementById("signupForm").addEventListener("submit", async function(event) {
    event.preventDefault(); // Prevent page reload

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const email = document.getElementById("email").value;
    const messageElement = document.getElementById("message"); // Get the message element once

    try {
        const response = await fetch(`${API_BASE_URL}/signup`, { // Use API_BASE_URL
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({username, password, email})
        });

        const data = await response.json();
        console.log(data);

        if (response.ok) {
            messageElement.textContent = data.message;
            console.log(data.message);

            setTimeout(() => {
            }, 3000);
            window.location.href = "login.html"; // Redirect to index.html after successful signup

        } else {
            messageElement.textContent = data.message || "Error signing up!";
            if (data.details) {
                messageElement.textContent += ` Details: ${data.details}`;
            }
        }
    } catch (error) {
        messageElement.textContent = "Error connecting to server!";
        console.error("Signup error:", error); // Log the detailed error to the console
    }
});


function setupRestrictedLinks() {
    const user = JSON.parse(sessionStorage.getItem("user"));
    const restrictedLinks = document.querySelectorAll('a[href="chat.html"], a[href="files.html"]');

    restrictedLinks.forEach(link => {
        // Remove old event listeners
        const oldLink = link.cloneNode(true);
        link.replaceWith(oldLink);
        if (!user) {
            link.addEventListener("click", (event) => {
                event.preventDefault();
                const message = document.createElement("div");
                message.textContent = "Please log in to access this page.";
                document.body.prepend(message);
                setTimeout(()=>{
                    message.remove();
                    window.location.href = "login.html";
                },3000)
            });
        }
    });
}

setupRestrictedLinks()