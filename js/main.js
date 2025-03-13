import { handleFileUpload, displayUserFiles, renderFiles  } from './files.js';
import { handleSignup } from './signup.js'; // Importera handleSignup från signup.js

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

document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.getElementById("signupForm");
    if (signupForm) {
        signupForm.addEventListener("submit", async function (event) {
            event.preventDefault(); // Prevent page reload
            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;
            const email = document.getElementById("email").value;
            await handleSignup(username, password, email);
            signupForm.reset(); // Rensa formuläret efter försök till registrering
        });
    } else {
        console.error("Signup form not found in DOM");
    }
});


function setupRestrictedLinks() {
    const userString = sessionStorage.getItem("user");
    let user = null;

    // Parse the user data if it's available
    if (userString) {
        try {
            user = JSON.parse(userString);
        } catch (error) {
            console.error('Error parsing user data from session storage:', error);
        }
    }

    // If a user is not logged in, handle restricted links
    if (!user) {
        const restrictedLinks = document.querySelectorAll('a[href="chat.html"], a[href="files.html"]');
        restrictedLinks.forEach(link => {
            link.addEventListener("click", (event) => {
                event.preventDefault();
                const message = document.createElement("div");
                message.textContent = "Please log in to access this page.";
                document.body.prepend(message);

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    message.remove();
                    window.location.href = "login.html";
                }, 3000);
            });
        });
    }
}

export { setupRestrictedLinks };

document.addEventListener("DOMContentLoaded", async function() {
    await displayUserFiles();
    await renderFiles();
    await setupRestrictedLinks();
});