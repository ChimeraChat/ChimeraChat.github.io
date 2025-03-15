//signup.js

async function handleSignup(username, password, email) {
    try {
        const response = await fetch('/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password, email }) // Send as username, password, email
        });

        const data = await response.json();
        if (response.ok) {
            // Call API to create the Google Drive folder for this user
            await fetch('/api/create-folder', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username })
            });
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
            signupForm.reset(); // Clear the form after signup attempt
        });
    }
});

