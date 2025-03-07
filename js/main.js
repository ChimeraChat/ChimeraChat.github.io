document.getElementById("signupForm").addEventListener("submit", async function(event) {
    event.preventDefault(); // Prevent page reload

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const email = document.getElementById("email").value;

    try {
        const response = await fetch("https://chimerachat.onrender.com/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password, email })
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById("message").textContent = data.message;
            document.getElementById("message").style.color = "green";

            // Vänta 3 sekunder och skicka användaren till inloggningssidan
            setTimeout(() => {
                window.location.href = data.redirect;
            }, 3000);
        } else {
            document.getElementById("message").textContent = data.message || "Error signing up!";
            document.getElementById("message").style.color = "red";
        }
    } catch (error) {
        document.getElementById("message").textContent = "Error connecting to server!";
        document.getElementById("message").style.color = "red";
    }
});
