//signup.js
import { signupUser } from './api'; // Importera nödvändiga funktioner från api.js
import { createUserFolder } from '../config/googleDrive.js'; // Importera nödvändiga funktioner från googleDrive.js'
let folderId; // Global variabel för mapp-ID

function updateMessage(message, isSuccess) {
    const messageElement = document.getElementById("message");
    messageElement.textContent = message;
    messageElement.style.color = isSuccess ? "green" : "red";
}


async function handleSignup(username, password, email) {
    try {
        const data = await signupUser({username, password, email});
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
