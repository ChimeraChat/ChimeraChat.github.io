document.addEventListener("DOMContentLoaded", function () {
    const uploadForm = document.getElementById("uploadForm");
    uploadForm.addEventListener("submit", async function (event) {
        event.preventDefault();

    });
});

async function handleFileUpload() {
    const fileInput = document.getElementById("fileupload");
    const file = fileInput.files[0];

    console.log(file);
    if (!file) {
        alert("Please select a file to upload.");
        return;
    }

    const formData = new FormData();
    formData.append("fileupload", file);
    console.log("FormData:", formData);

    try {
        let response = await fetch("/upload", {
            method: "POST",
            body: formData,
        });
        console.log("response:", response);
        if (response.ok) {
            const data = await response.json();
            console.log("data in files.js:", data);
            alert(`Uppladdning lyckades!`);
            fileInput.value = "";
        } else {
            throw new Error("Server responded with an error!");
        }
    } catch (error) {
        console.error("Uppladdningsfel:", error);
        alert("Serverfel vid uppladdning.");
    }
}

export { handleFileUpload };

// fileManager.js
async function loadFiles() {
    fetch('/api/files', {
        method: 'GET'
    })
        .then(response => response.json())
        .then(files => {
            const list = document.getElementById('fileList');
            list.innerHTML = '';  // Clear the list before updating
            files.forEach(file => {
                const listItem = document.createElement('li');
                listItem.textContent = file.name;  // Assuming 'name' is a property of the file objects
                list.appendChild(listItem);
            });
        })
        .catch(error => {
            console.error("Failed to load files:", error);
            alert("Error loading files.");
        });
}

export { loadFiles };