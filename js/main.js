import { handleFileUpload, loadFiles } from './files.js';
import { apiRequest } from './api.js';

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
    const signupForm = document.getElementById("signupForm");

    try {
        const response = await apiRequest('/signup', 'POST', { username, password, email });

        if (response.ok) {
            messageElement.textContent = response.message;
            console.log(response.message);

            setTimeout(() => {
            }, 300);
            window.location.href = "login.html"; // Redirect to index.html after successful signup

            signupForm.reset();

        } else {
            messageElement.textContent = response.message || "Error signing up!";
            if (response.details) {
                messageElement.textContent += ` Details: ${response.details}`;
            }
        }
    } catch (error) {
        messageElement.textContent = "Error connecting to server!";
        console.error("Signup error:", error); // Log the detailed error to the console
    }
});


function setupRestrictedLinks() {
    const userString = sessionStorage.getItem("user");
    if (userString) {
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
                    setTimeout(() => {
                        message.remove();
                        window.location.href = "login.html";
                    }, 3000)
                });
            }
        });
    }
}
setupRestrictedLinks()