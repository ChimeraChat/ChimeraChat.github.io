//files.js
import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
const socket = io("https://chimerachat.onrender.com/");

async function handleFileUpload() {
    const fileInput = document.getElementById("fileupload");
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a file to upload.");
        return;
    }

    try {
        const formData = new FormData();
        formData.append("fileupload", file);

        const uploadResponse = await fetch('/api/upload', {
            method: "POST",
            body: formData
        });

        const uploadData = await uploadResponse.json();
        if (uploadResponse.ok) {
            alert("File uploaded successfully!");
            fileInput.value = ""; // Reset input
            await displayUserFiles();
        } else {
            throw new Error(uploadData.message || "Error uploading file.");
        }
    } catch (error) {
        console.error("Upload error:", error);
        alert("An error occurred while uploading the file.");
    }
}

async function displayUserFiles() {
    try {
        const response = await fetch('/api/files');
        const files = await response.json();

        console.log("📁 Files received:", files);

        if (!response.ok) {
            throw new Error(files.message || "Failed to load files.");
        }
        if (!files || files.length === 0) {
            console.log("⚠ No files found in API response.");
        }

        renderFiles(files);
    } catch (error) {
        console.error("Error handling user files:", error);
    }
}

function renderFiles(files) {
    const fileList = document.getElementById('sharedList');

    if (!fileList) {
        console.error("Error: 'fileList' element not found in the DOM.");
        return; // Exit function if fileList is null
    }

    fileList.innerHTML = ""; // Clear the list before updating

    if (!files || files.length === 0) {
        fileList.innerHTML = "<p>No files found.</p>";
        return;
    }

    files.forEach(file => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<a href="${file.webViewLink}" target="_blank">${file.name}</a>`;
        fileList.appendChild(listItem);
    });
}


document.addEventListener("DOMContentLoaded", async function () {
    const uploadForm = document.getElementById("uploadForm");
    await displayUserFiles();
    if (uploadForm) {
        uploadForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            await handleFileUpload();
            await displayUserFiles();
        });
    }
});

socket.on("updateOnlineUsers", (users) => {
    const onlineUsersList = document.getElementById("onlineUsers");
    if (!onlineUsersList) return;

    // Clear lists before updating
    onlineUsersList.innerHTML = "";

    users.forEach((username) => {
        // Update sidebar list
        const listItem = document.createElement("li");
        listItem.textContent = username;
        onlineUsersList.appendChild(listItem);

    });
});
