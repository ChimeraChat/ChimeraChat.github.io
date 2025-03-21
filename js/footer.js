function createFooter() {
    console.log("Footer is being created...");

    const footer = document.createElement("footer");
    const paragraph = document.createElement("p");
    paragraph.innerHTML = "&copy; 2025 ChimeraChat. Some rights reserved.";

    const socialContainer = document.createElement("div");
    socialContainer.classList.add("social-links");

    const socialLinks = [
        { href: "https://www.instagram.com/hellokitty/", imgSrc: "img/instagram.png", alt: "Instagram" },
        { href: "https://customrickroll.github.io", imgSrc: "img/youtube.png", alt: "YouTube" }
    ];

    socialLinks.forEach(link => {
        const a = document.createElement("a");
        a.href = link.href;
        a.target = "_blank";
        a.rel = "noopener noreferrer";

        const img = document.createElement("img");
        img.src = link.imgSrc;
        img.alt = link.alt;
        img.classList.add("social-icon");

        a.appendChild(img);
        socialContainer.appendChild(a);
    });

    footer.appendChild(paragraph);
    footer.appendChild(socialContainer);
    document.body.appendChild(footer);
}
createFooter();
// Run the function when the page loads
let lastSoundIndex = -1;


document.getElementById("videoButton").addEventListener("click", function(event) {
    event.stopPropagation();
    const soundPool = [
        "sounds/sound1.mp3",
        "sounds/sound2.mp3",
        "sounds/sound3.mp3",
        "sounds/sound4.mp3",
        "sounds/sound5.mp3",
        "sounds/sound6.mp3",
    ];

    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * soundPool.length);
    } while (randomIndex === lastSoundIndex); // Prevents consecutive repeats

    lastSoundIndex = randomIndex;

    const audio = new Audio(soundPool[randomIndex]);
    audio.play().catch(err => console.error("Audio playback failed:", err));
});