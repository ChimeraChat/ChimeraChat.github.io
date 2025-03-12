import { signupUser } from "./api.js";
import { drive, createUserFolder } from '../config/googleDrive.js';

function updateMessage (message, isSuccess) {
    const messageElement = document.getElementById("message");
    messageElement.textContent = message;
    messageElement.style.color = isSuccess ? "green" : "red";
}

async function handleSignup(event) {
    event.preventDefault();
    console.log("Signup form submitted");
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const email = document.getElementById("email").value;
    let newUser;

    try {
        const data = await signupUser({username, password, email});

        if (data.ok) {
            newUser = {
                username: username,
                password: password,
                email: email
            };
            const folderId = await createUserFolder(newUser.username);
            newUser.folderId = folderId;
            updateMessage("Registrering lyckades. Du blir strax omdirigerad till inloggningssidan", true);
            setTimeout(() => {
            }, 300);
            // Rensar fälten efter lyckad signup.
            document.getElementById("username").value = "";
            document.getElementById("password").value = "";
            document.getElementById("email").value = "";
        } else {
            setTimeout(() => {
                updateMessage(data.message || "Registrering misslyckades.", false);
            }, 3000);
            // Rensar fälten
            document.getElementById("username").value = "";
            document.getElementById("password").value = "";
            document.getElementById("email").value = "";
        }
    } catch (error) {
        alert("Serverfel vid registrering.");
        document.getElementById("username").value = "";
        document.getElementById("password").value = "";
        document.getElementById("email").value = "";
    }
}

document.getElementById('signupForm').addEventListener('submit', handleSignup);


