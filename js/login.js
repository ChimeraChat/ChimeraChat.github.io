document.getElementById("loginForm").addEventListener("submit", async function(event) {
    event.preventDefault(); // Förhindra att sidan laddas om

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const messageElement = document.getElementById("message");

    try {
        const response = await fetch("https://chimerachat.onrender.com/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Spara användaren i sessionStorage (för att hålla inloggad status)
            sessionStorage.setItem("user", JSON.stringify(data.user));

            messageElement.textContent = "Inloggning lyckades! Omdirigerar...";
            messageElement.style.color = "green";

            // Vänta 2 sekunder och skicka användaren till home.html
            setTimeout(() => {
                window.location.href = "home.html";
            }, 2000);
        } else {
            messageElement.textContent = data.message || "Felaktig e-post eller lösenord.";
            messageElement.style.color = "red";
        }
    } catch (error) {
        messageElement.textContent = "Kunde inte ansluta till servern.";
        messageElement.style.color = "red";
    }
});
