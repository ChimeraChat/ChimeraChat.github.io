document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.getElementById("signupForm");
    let isSubmitting = false;  // 🔹 Lägg till flagga

    if (signupForm) {
        signupForm.addEventListener("submit", async (event) => {
            if (isSubmitting) return;  // 🔹 Stoppa om en request redan skickats
            isSubmitting = true;
            event.preventDefault();

            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;
            const email = document.getElementById("email").value;

            try {
                const response = await fetch("/signup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password, email })
                }); //signup

                const messageElement = document.getElementById("message");

                if (response.ok) {
                    console.log("✅ Registrering lyckades!");
                    messageElement.textContent = "Registrering lyckades. Du blir strax omdirigerad till inloggningssidan";
                    messageElement.style.color = "green";
                } else {
                    console.log("❌ Registrering misslyckades.");
                    messageElement.textContent = "Registrering misslyckades.";
                    messageElement.style.color = "red";
                }
            } catch (error) {
                console.error("❌ Fel vid registrering:", error);
                alert("Serverfel vid registrering.");

            } finally {
                isSubmitting = false;  // 🔹 Återställ flaggan

                // Vänta 3 sekunder och skicka användaren till inloggningssidan
                setTimeout(() => {
                    window.location.href = "login.html";
                }, 3000);

            }
        });
    }
});
