

document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.getElementById("signupForm");

    if (signupForm) {
        signupForm.addEventListener("submit", async (event) => {
            event.preventDefault(); // Förhindrar sidladdning

            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;
            const email = document.getElementById("email").value;

            try {
                const response = await fetch("/signup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password, email })
                });

                console.log("Response status:", response.status); // Kollar HTTP-status
                console.log("Response headers:", response.headers);

                const text = await response.text(); // Läs svaret som text
                console.log("Raw response:", text);

                const data = await response.json();

                const messageElement = document.getElementById("message");
                if (response.ok) {
                    messageElement.textContent = data.message;
                    messageElement.style.color = "green";

                    // Vänta 3 sekunder och skicka användaren till inloggningssidan
                    setTimeout(() => {
                        window.location.href = "login.html";
                    }, 3000);
                } else {
                    messageElement.textContent = data.message || "Error signing up!";
                    messageElement.style.color = "red";
                }
            } catch (error) {
                console.error("Fel vid registrering:", error);
                alert("Serverfel vid registrering.");
            }
        });
    }
});
