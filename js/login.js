//login.js

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
            const response = await fetch('/logout', {
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
            }, 3000);
            message.remove();
            window.location.href = "index.html";

            updateLoginButton();

        } catch (error) {
            console.error("Logout error:", error);
            const message = document.createElement("div");
            message.textContent = error.message || "Logout failed: An unexpected error occured.";
            document.body.prepend(message);
            setTimeout(()=>message.remove(),3000);
        }
    }
}

async function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        // **DEBUGGING: Log full response**
        const textResponse = await response.text();
        console.log("Full server response:", textResponse);

        const data = await response.json();
        console.log("Login Response:", data); // Debugging

        if (response.ok && data.user) {
            console.log("Login Response:", data);
            sessionStorage.setItem("user", JSON.stringify(data.user));

            const message = document.createElement("div");
            message.textContent = "Login success!";
            document.body.prepend(message);

            updateLoginButton();

            setTimeout(()=>{
                message.remove();
                window.location.href = "home.html";
            }, 1000);


        } else {
            console.error("Login failed:", data.message);
            alert(data.message || "Login failed.");
        }
    } catch (error) {
        console.error("Error during login:", error);
        alert("Login failed due to server error.");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");

    updateLoginButton();

    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }
});


