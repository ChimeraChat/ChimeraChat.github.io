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
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password, email })
        });

        const data = await response.json();
        console.log(data);

        if (response.ok) {
            messageElement.textContent = data.message;
            console.log(data.message);

            if (data.redirect) {
                console.log(data.redirect);
                setTimeout(() => {
                }, 3000);
                window.location.href = "login.html";
            } else {
                console.error('Redirect URL is missing');
                console.log(response);
                messageElement.textContent += ' But redirect URL is missing.';
            }
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

/**
document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(sessionStorage.getItem("user"));

    const restrictedPages = ["chat.html", "post.html"];
    const currentPage = window.location.pathname.split("/").pop(); // Extracts current page name

    if (!user && restrictedPages.includes(currentPage)) {
        const messageElement = document.createElement("div");
        messageElement.textContent = "You must be logged in to access this page.";
        messageElement.style.color = "red";
        document.body.prepend(messageElement);
        setTimeout(() => {
        window.location.href = "login.html"; // Redirect to login page
        }, 3000);
    }
}); */
