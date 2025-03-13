//signup.js
import { signupUser } from './api'; // Importera nödvändiga funktioner från api.js
import { createUserFolder } from '../config/googleDrive.js'; // Importera nödvändiga funktioner från googleDrive.js'
let folderId; // Global variabel för mapp-ID

function updateMessage(message, isSuccess) {
    const messageElement = document.getElementById("message");
    messageElement.textContent = message;
    messageElement.style.color = isSuccess ? "green" : "red";
}

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


async function handleSignup(username, password, email) {
    try {
        const signupData = {
            data: { username, password, email },
            salt: "staticSaltForNow"  // Generate an actual salt value in the future
        };
        const data = await signupUser(signupData);
        if (data.ok) {
            folderId = await createUserFolder(username);
            updateMessage("Registrering lyckades. Du blir strax omdirigerad till inloggningssidan", true);
            setTimeout(() => {
                window.location.href = "login.html";
            }, 3000);
        } else {
            updateMessage(data.message || "Registrering misslyckades.", false);
        }
    } catch (error) {
        updateMessage("Serverfel vid registrering.", false);
        console.error("Signup error:", error);
    }
}

export { handleSignup };
