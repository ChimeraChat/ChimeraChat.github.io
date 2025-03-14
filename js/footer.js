function createFooter() {
    const footer = document.createElement("footer");
    const paragraph = document.createElement("p");
    paragraph.innerHTML = "&copy; 2025 ChimeraChat. Some rights reserved.";

    footer.appendChild(paragraph);
    document.body.appendChild(footer); // Add the footer to the end of the body
}

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