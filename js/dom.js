/*
import { handleLogin, handleSignup } from './auth.js';
import { handleFileUpload, loadFiles } from './upload.js';

export function handleLoginForm() {
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const username = document.getElementById("login-username").value;
            const password = document.getElementById("login-password").value;

            const result = await handleLogin(username, password);

            if (result.success) {
                console.log("data", result.data);
                sessionStorage.setItem("user", JSON.stringify(result.data.user));
                window.location.href = "chat.html";
            } else {
                document.getElementById("message").textContent = result.error;
                document.getElementById("message").style.color = "red";
            }
        });
    }
}

export function handleSignupForm() {
    const signupForm = document.getElementById("signupForm");
    if (signupForm) {
        signupForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;
            const email = document.getElementById("email").value;

            const result = await handleSignup(username, password, email);

            if (result.success) {
                document.getElementById("message").textContent = result.data.message;
                document.getElementById("message").style.color = "green";
                setTimeout(() => {
                    window.location.href = result.data.redirect;
                }, 3000);
            } else {
                document.getElementById("message").textContent = result.error;
                document.getElementById("message").style.color = "red";
            }
        });
    }
}

export function handleUploadForm() {
    const uploadForm = document.getElementById("uploadForm");
    if (uploadForm) {
        uploadForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            try {
                const fileInput = document.getElementById("fileInput");
                const file = fileInput.files[0];
                const result = await handleFileUpload(file);
                if(result.success){
                    await loadFiles();
                }else{
                    console.error("Error in file upload:", result.error);
                    alert("An error occurred during file upload.");
                }
            } catch (error) {
                console.error("Error in file upload:", error);
                alert("An error occurred during file upload.");
            }
        });
    }
}
*/