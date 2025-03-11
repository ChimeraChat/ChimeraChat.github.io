import { loginUser } from './api.js';

function updateLoginButton() {
    const loginButton = document.querySelector('nav a[href="login.html"]');
    if (!loginButton) return;

    if (sessionStorage.getItem("user")) {
        // User is logged in → Change to "Log out"
        loginButton.textContent = "Log out";
        loginButton.href = "#";
        loginButton.onclick = logout;

    } else {
        // User is logged out → Keep "Log in"
        loginButton.textContent = "Log in";
        loginButton.href = "login.html";
        loginButton.onclick = null; // Reset to default behavior
    }
}

async function logout() {
    const user = JSON.parse(sessionStorage.getItem("user"));
    if (user) {
        try {
            const response = await fetch("/logout", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({userId: user.userid})
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Logout failed.");
            }

            sessionStorage.removeItem("user");
            alert("Du har loggats ut!");
            updateLoginButton();
            window.location.href = "index.html";
        } catch (error) {
            console.error("Fel vid utloggning:", error);
            alert(error.message || "Fel vid utloggning:");
        }
    }
}

function setupRestrictedLinks() {
    const user = JSON.parse(sessionStorage.getItem("user"));
    const restrictedLinks = document.querySelectorAll('a[href="chat.html"], a[href="files.html"]');

    if (!user) {
        restrictedLinks.forEach(link => {
            link.addEventListener("click", (event) => {
                event.preventDefault();
                alert("Please log in to access this page.");
                window.location.href = "login.html";
            });
        });
    }
}

async function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const data = await loginUser({ username, password });
        if (data.ok) {
            sessionStorage.setItem("user", JSON.stringify(data.user));
            alert("Inloggning lyckades!");
            window.location.href = "home.html";
            updateLoginButton();
            setupRestrictedLinks();
        } else {
            alert(data.message || "Inloggning misslyckades.");
        }
    } catch (error) {
        console.error("Fel vid inloggning:", error);
        alert("Serverfel vid inloggning.");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");

    updateLoginButton();
    setupRestrictedLinks();

    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    } else {
        console.error("Login form not found in DOM");
    }
});


