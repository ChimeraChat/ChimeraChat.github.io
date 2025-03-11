import { signupUser } from "./api.js";
import { drive } from '../config/googleDrive.js';

function updateMessage (message, isSuccess) {
    const messageElement = document.getElementById("message");
    messageElement.textContent = message;
    messageElement.style.color = isSuccess ? "green" : "red";
}

document.getElementById('signupForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    console.log("Signup form submitted");
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const email = document.getElementById("email").value;

    try {
        const data = await signupUser("/signup", { username, password, email });

        if (data.ok) {
            updateMessage("Registrering lyckades. Du blir strax omdirigerad till inloggningssidan", true);
            setTimeout(() => {
                window.location.href = "login.html";
            }, 300);
        } else {
            setTimeout(() => {
            updateMessage(data.message || "Registrering misslyckades.", false);
            }, 3000);
            username.value = "";
            password.value = "";
            email.value = "";
        }
    } catch (error) {
        alert("Serverfel vid registrering.");
        username.value = "";
        password.value = "";
        email.value = "";
    }
});

const userFolderId = await createUserFolder(newUser.username);
async function createUserFolder(username) {
    try {
        const folderMetadata = {
            'name': username,
            'mimeType': 'application/vnd.google-apps.folder'
        };

        const folder = await drive.files.create({
            resource: folderMetadata,
            fields: 'id'
        });

        return folder.data.userFolderId;  // Returnerar ID för den skapade mappen
    } catch (error) {
        console.error("Could not create folder:", error);
        throw error;
    }
}

