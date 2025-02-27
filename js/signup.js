document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.getElementById("signupForm");

    if (signupForm) {
        signupForm.addEventListener("submit", async (event) => {
            event.preventDefault(); // Förhindrar sidladdning

            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;
            const email = document.getElementById("email").value;

            try {
                const response = await fetch("https://chimerachat.onrender.com/signup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password, email })
                }); //signup

                console.log("Response status:", response.status); // Kollar HTTP-status
                console.log("Response headers:", response.headers);

                const data = await response.json();
                const messageElement = document.getElementById("message");

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error("❌ Registrering misslyckades:", errorData);
                    messageElement.textContent = errorData.message || "Registrering misslyckades.";
                    messageElement.style.color = "red";
                    return;
                }


                messageElement.textContent = data.message;
                messageElement.style.color = "green";

                // Vänta 3 sekunder och skicka användaren till inloggningssidan
                setTimeout(() => {
                    window.location.href = "login.html";
                }, 3000);

            } catch (error) {
                console.error("Fel vid registrering:", error);
                alert("Serverfel vid registrering.");
            }
        });
    }
});
