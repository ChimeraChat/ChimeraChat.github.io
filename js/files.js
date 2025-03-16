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

        if (!folderResponse.ok || !folderData.id) {
            throw new Error(folderData.message || "Failed to get folder ID.");
        }

        const userFolderId = folderData.id;  //  Ensure the variable is properly set

        // Fetch the files list from Google Drive
        const filesResponse = await fetch(`/api/files?folderId=${userFolderId}`);
        const files = await filesResponse.json();

        if (!filesResponse.ok) {
            throw new Error(files.message || "Failed to retrieve files.");
        }

        console.log("Files received:", files);
        if (files.length === 0) {
            console.log("No files found");
            return;
        }

        renderFiles(files);  // Call function to render files
    } catch (error) {
        console.error("Error handling files:", error);
        alert("Error loading files: " + error.message);
    }
}

function renderFiles(files) {
    const fileList = document.getElementById('fileList');
    if (!files || files.length === 0) {
        console.log("No files found.");
        return;
    }

    fileList.innerHTML = '';  // Clear the list before updating

    files.forEach(file => {
        const listItem = document.createElement('li');
        listItem.textContent = file.name;

        // Create Download button
        const downloadBtn = document.createElement('button');
        downloadBtn.textContent = "Download";
        downloadBtn.onclick = async () => {
            try {
                const response = await fetch(`/api/download/${file.id}`);
                const data = await response.json();
                if (response.ok) {
                    window.location.href = data.url; // Redirect to download link
                } else {
                    alert("Error: " + data.message);
                }
            } catch (error) {
                console.error("Download error:", error);
                alert("Failed to download file.");
            }
        };

        listItem.appendChild(downloadBtn);
        fileList.appendChild(listItem);
    });
}

document.addEventListener("DOMContentLoaded", async function () {
    const uploadForm = document.getElementById("uploadForm");
    await displayUserFiles();
    await renderFiles();
    if (uploadForm) {
        uploadForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            await handleFileUpload();
            await displayUserFiles();
            await renderFiles();
        });
    }
});

//export { handleFileUpload };