//files.js
import { uploadFileToDrive } from '../config/googleDrive.js';

async function handleFileUpload() {
    const fileInput = document.getElementById("fileupload");
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a file to upload.");
        return;
    }

    try {
        const userFolderId = await getUserFolderId();
        const filebuffer = await file.arrayBuffer();
        const fileId = await uploadFileToDrive(filebuffer, file.name, file.type, userFolderId);
        if(fileId){
            alert("File uploaded successfully!");
            // Reset the file input
            fileInput.value = "";
        } else {
            alert("Error uploading the file.")
        }
    } catch (error) {
        console.error("Uppladdningsfel:", error);
        alert("An error occurred while uploading the file.");
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