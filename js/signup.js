import { signupUser } from "/api.js";

function updateMessage (message, isSuccess) {
    const messageElement = document.getElementById("message");
    messageElement.textContent = message;
    messageElement.style.color = isSuccess ? "green" : "red";
}

document.getElementById('signupForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const email = document.getElementById("email").value;

    try {
        const data = await signupUser("/signup", { username, password, email });

        if (data.ok) {
            updateMessage("Registrering lyckades. Du blir strax omdirigerad till inloggningssidan", true);
            setTimeout(() => {
                window.location.href = "login.html";
            }, 3000);
        } else {
            updateMessage(data.message || "Registrering misslyckades.", false);
        }
    } catch (error) {
        alert("Serverfel vid registrering.");
    }
});


