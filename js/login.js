


document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const loginButton = document.querySelector('nav a[href="login.html"]');

    if (sessionStorage.getItem("user")) {
        updateLoginButton();
    }

    if (loginForm) {
        loginForm.addEventListener("submit", login);
    }
    else {
        console.error("Login not found in DOM");
    }

    function updateLoginButton() {
        if (loginButton) {
            loginButton.textContent = "Log out";
            loginButton.href = "#";
            loginButton.addEventListener("click", () => {
                sessionStorage.removeItem("user");
                window.location.reload();
            });
        }
    }
});


// Funktion för att hantera inloggning
async function login(event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        console.log("Response status:", response.status); // Kollar HTTP-status
        console.log("Response headers:", response.headers);

        const text = await response.text(); // Läs svaret som text
        console.log("Raw response:", text);

        const data = JSON.parse(text); // Försök tolka JSON manuellt
        //const data = await response.json();

        if (response.ok) {
            sessionStorage.setItem("user", JSON.stringify(data.user));
            alert("Inloggning lyckades!");
            window.location.href = "home.html";
        } else {
            alert(data.message || "Inloggning misslyckades.");
        }
    } catch (error) {
        console.error("Fel vid inloggning:", error);
        alert("Serverfel vid inloggning.");
    }
}


