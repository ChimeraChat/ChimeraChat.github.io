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

document.addEventListener("DOMContentLoaded", () => {
    updateNav();
});

/**
 * Uppdaterar navigationsmenyn baserat på inloggningsstatus.
 */
function updateNav() {
    const user = JSON.parse(sessionStorage.getItem("user"));

    // Hämta menyn där länkarna ligger
    const navContainer = document.querySelector("nav .container");

    // Hämta eventuella existerande länkar
    const loginLink = document.querySelector(".nav-link[href='login.html']");
    const signupLink = document.querySelector(".nav-link[href='signup.html']");
    const existingLogoutLink = document.querySelector(".nav-link.logout");

    if (user) {
        // Om inloggad → ta bort "Log in" och "Sign up"
        if (loginLink) loginLink.remove();
        if (signupLink) signupLink.remove();

        // Lägg till "Log out" om den inte redan finns
        if (!existingLogoutLink) {
            addLogoutButton(navContainer);
        }
    } else {
        // Om utloggad → säkerställ att "Log in" och "Sign up" finns
        if (!loginLink) addLoginButton(navContainer);
        if (!signupLink) addSignupButton(navContainer);

        // Ta bort "Log out" om den finns
        if (existingLogoutLink) existingLogoutLink.remove();
    }
}

/**
 * Lägger till en "Log in"-knapp i navigeringen.
 * @param {HTMLElement} navContainer - Navigationscontainer.
 */
function addLoginButton(navContainer) {
    const loginNav = document.createElement("a");
    loginNav.href = "login.html";
    loginNav.textContent = "Log in";
    loginNav.classList.add("nav-link");
    navContainer.appendChild(loginNav);
    }
    /**
     * Lägger till en "Sign up"-knapp i navigeringen.
     * @param {HTMLElement} navContainer - Navigationscontainer.
     */
function addSignupButton(navContainer) {
    const signupNav = document.createElement("a");
    signupNav.href = "signup.html";
    signupNav.textContent = "Sign up";
    signupNav.classList.add("nav-link");
    navContainer.appendChild(signupNav);
    }

    /**
     * Lägger till en "Log out"-knapp och hanterar utloggning.
     * @param {HTMLElement} navContainer - Navigationscontainer.
     */
function addLogoutButton(navContainer) {
    const logoutNav = document.createElement("a");
    logoutNav.href = "#";
    logoutNav.textContent = "Log out";
    logoutNav.classList.add("nav-link", "logout");

    logoutNav.addEventListener("click", () => {
        sessionStorage.removeItem("user");
        window.location.href = "index.html"; // Skicka tillbaka till startsidan
    });

    navContainer.appendChild(logoutNav);
    }