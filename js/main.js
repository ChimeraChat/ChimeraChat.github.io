//main.js
//import { displayUserFiles, renderFiles  } from './files.js';

function setupRestrictedLinks() {
    setTimeout(() => {  // Delay to ensure sessionStorage is updated
        const userString = sessionStorage.getItem("user");
        let user = null;

        if (userString) {
            try {
                user = JSON.parse(userString);
            } catch (error) {
                console.error('Error parsing user data from session storage:', error);
            }
        }

        if (!user) {
            const restrictedLinks = document.querySelectorAll('a[href="chat.html"], a[href="files.html"]');
            restrictedLinks.forEach(link => {
                link.addEventListener("click", (event) => {
                    event.preventDefault();
                    alert("Please log in to access this page.");
                    window.location.href = "login.html";
                });
            });
        }
    }, 500); // Delay 500ms to let sessionStorage update
}


document.addEventListener("DOMContentLoaded", () => {
    setupRestrictedLinks();
});

export { setupRestrictedLinks };

