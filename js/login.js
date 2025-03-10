
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const loginButton = document.querySelector('nav a[href="login.html"]');

    updateLoginButton();

    if (loginForm) {
        loginForm.addEventListener("submit", login);
    }
    else {
        console.error("Login not found in DOM");
    }

    function updateLoginButton() {
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

    // function logout() {
    //     sessionStorage.removeItem("user"); // Remove user from session storage
    //     alert("You have been logged out!");
    //     updateLoginButton(); // Update button back to "Log in"
    //     window.location.href = "index.html"; // Redirect to homepage
    // }
    function logout() {
        const user = JSON.parse(sessionStorage.getItem("user"));
        if (user) {
            fetch("/logout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.userid })
            }).then(() => {
                sessionStorage.removeItem("user");
                alert("Du har loggats ut!");
                updateLoginButton();
                window.location.href = "index.html";
            }).catch(error => console.error("Fel vid utloggning:", error));
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


