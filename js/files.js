//files.js
import { uploadFileToDrive } from '../config/googleDrive.js';
import { getUserFolderId, getUserFiles } from "./api.js";


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
            fileInput.value = ""; // Reset the file input
        } else {
            alert("Error uploading the file.")
        }
    } catch (error) {
        console.error("Uppladdningsfel:", error);
        alert("An error occurred while uploading the file.");
    }
}

async function displayUserFiles() {
    try {
        // First get the user's folder ID
        const folderId = await getUserFolderId();
        console.log("Folder ID:", folderId); // Log or handle the folder ID if needed

        // Then fetch the files using that folder ID
        const files = await getUserFiles();
        renderFiles(files);
    } catch (error) {
        console.error("Error handling files:", error);
        alert("Error loading files: " + error.message);
    }
}

function renderFiles(files) {
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '';  // Clear the list before updating

    files.forEach(file => {
        const listItem = document.createElement('li');
        listItem.textContent = file.name;  // Assuming 'name' is a property of the file objects
        fileList.appendChild(listItem);
    });
}




export { handleFileUpload, renderFiles, displayUserFiles };