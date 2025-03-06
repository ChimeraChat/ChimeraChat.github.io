function createFooter() {
    const footer = document.createElement("footer");
    const paragraph = document.createElement("p");
    paragraph.innerHTML = "&copy; 2025 ChimeraChat. Alla rättigheter förbehållna.";

    footer.appendChild(paragraph);
    document.body.appendChild(footer); // Add the footer to the end of the body
}

// Run the function when the page loads
window.addEventListener("DOMContentLoaded", createFooter);