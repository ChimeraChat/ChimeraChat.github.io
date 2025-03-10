

// api.js
async function signupUser(userData) {
    try {
        const response = await fetch('/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json(); // Förutsätter att servern skickar tillbaka JSON
        return { ok: response.ok, ...data }; // Sprid data och inkludera ok-status
    } catch (error) {
        console.error("Signup error:", error);
        return { ok: false, message: "Network error during signup" };
    }
}

async function loginUser(userData) {
    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    });
    return response.json();
}

export { signupUser, loginUser };
