


document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", login);
    }
    else {
        console.error("Login not found in DOM");
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

        const data = await response.json();

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


