//signup.js
import { signupUser, createUserFolder } from './api'; // Importera nödvändiga funktioner från api.js

function updateMessage(message, isSuccess) {
    const messageElement = document.getElementById("message");
    messageElement.textContent = message;
    messageElement.style.color = isSuccess ? "green" : "red";
}

async function handleSignup(username, password, email) {
    try {
        const data = await signupUser({username, password, email});
        if (data.ok) {
            const folderId = await createUserFolder(username);
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
