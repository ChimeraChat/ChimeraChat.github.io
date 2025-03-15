//files.js
async function handleFileUpload() {
    const fileInput = document.getElementById("fileupload");
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a file to upload.");
        return;
    }

    try {
        const folderResponse = await fetch('/api/user/id');
        const folderData = await folderResponse.json();
        if (!folderResponse.ok) {
            throw new Error(folderData.message || "Failed to get folder ID.");
        }

        const userFolderId = folderData.id;
        console.log("User Folder ID:", userFolderId);

        const formData = new FormData();
        formData.append("fileupload", file);
        formData.append("parentFolderId", userFolderId);

        const uploadResponse = await fetch('/api/upload', {
            method: "POST",
            body: formData
        });

        const uploadData = await uploadResponse.json();
        if(uploadResponse.ok){
            alert("File uploaded successfully!");
            fileInput.value = ""; // Reset the file input
            renderFiles(); // Refresh file list
        } else {
            throw new Error(uploadData.message || "Error uploading file.");
        }
    } catch (error) {
        console.error("Uppladdningsfel:", error);
        alert("An error occurred while uploading the file.");
    }
}

async function displayUserFiles() {
    try {
        const folderResponse = await fetch('/api/user/id');
        const folderData = await folderResponse.json();

        if (!folderResponse.ok) {
            throw new Error(folderData.message || "Failed to get folder ID.");
        }

        const folderId = folderData.id;
        console.log("Folder ID:", folderId); // Log or handle the folder ID if needed

        // Get the files from the user's folder
        const filesResponse = await fetch(`/api/files/${userFolderId}`);
        if (!filesResponse.ok) {
            throw new Error("Failed to fetch files.");
        }

        const files = await filesResponse.json();
        if (!filesResponse.ok) {
            throw new Error(files.message || "Failed to load files.");
        }
        renderFiles(files);
    } catch (error) {
        console.error("Error handling files:", error);
        alert("Error loading files: " + error.message);
    }
}

function renderFiles(files) {
    if (!files || files.length === 0) {
        console.log("No files found.");
        return;
    }

    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '';  // Clear the list before updating

    files.forEach(file => {
        const listItem = document.createElement('li');
        listItem.textContent = file.name;  // Assuming 'name' is a property of the file objects
        fileList.appendChild(listItem);
    });
}

document.addEventListener("DOMContentLoaded", function () {
    const uploadForm = document.getElementById("uploadForm");
    if (uploadForm) {
        uploadForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            await handleFileUpload();
            await renderFiles();
        });
    } else {
        console.error("uploadForm not found in DOM");
    }
});

export { handleFileUpload, renderFiles, displayUserFiles };