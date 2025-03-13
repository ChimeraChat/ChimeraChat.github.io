import { loginUser } from './api.js';
import { setupRestrictedLinks } from './main.js';
const API_BASE_URL = "https://your-api-base-url";

function updateLoginButton() {
    const loginButton = document.querySelector('nav a[href="login.html"]');
    const signupButton = document.querySelector('nav a[href="signup.html"]');

    if (!loginButton) return;
    if (!signupButton) return;

    if (sessionStorage.getItem("user")) {
        // User is logged in → Change to "Log out"
        loginButton.textContent = "Log out";
        loginButton.href = "#";
        loginButton.onclick = logout;
        signupButton.style.visibility = 'hidden';
    } else {
        // User is logged out → Keep "Log in"
        loginButton.textContent = "Log in";
        loginButton.href = "login.html";
        loginButton.onclick = null; // Reset to default behavior
        signupButton.style.visibility = 'visible';
    }
}

async function logout() {
    const user = JSON.parse(sessionStorage.getItem("user"));
    if (user) {
        try {
            const response = await fetch(`${API_BASE_URL}/logout`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({userId: user.userid})
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Logout failed.");
            }

            sessionStorage.removeItem("user");
            const message = document.createElement("div");
            message.textContent = "You've been logged out!";
            document.body.prepend(message);
            setTimeout(()=>{
                message.remove();
                window.location.href = "index.html";
            }, 3000)

            updateLoginButton();

        } catch (error) {
            console.error("Logout error:", error);
            const message = document.createElement("div");
            message.textContent = error.message || "Logout failed: An unexpected error occured.";
            document.body.prepend(message);
            setTimeout(()=>message.remove(),3000)
        }
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
            const message = document.createElement("div");
            message.textContent = "Login success!";
            document.body.prepend(message);
            setTimeout(()=>{
                message.remove();
            }, 3000)
            updateLoginButton();
            setupRestrictedLinks();

        } else {
            const message = document.createElement("div");
            message.textContent = data.message || "Login failed.";
            document.body.prepend(message);
            setTimeout(()=>message.remove(),3000)
        }
    } catch (error) {
        console.error("Fel vid inloggning:", error);
        const message = document.createElement("div");
        message.textContent = data.message || "Login failed, Server error.";
        document.body.prepend(message);
        setTimeout(()=>message.remove(),3000)
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


