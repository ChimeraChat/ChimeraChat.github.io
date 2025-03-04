document.addEventListener("DOMContentLoaded", function () {
    const uploadButton = document.querySelector("button[type='submit']");
    const fileInput = document.getElementById("fileUpload");

    uploadButton.addEventListener("click", function (event) {
        event.preventDefault();

        const file = fileInput.files[0];

        if (!file) {
            alert("Please select a file to upload.");
            return;
        }

        const formData = new FormData();
        formData.append("fileUpload", file);

        fetch("/upload", {
            method: "POST",
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                alert(data.message || "Fil uppladdad!");
                if (data.filePath) {
                    const uploadedFile = document.createElement("p");
                    uploadedFile.innerHTML = `Uppladdad fil: <a href="${data.filePath}" target="_blank">${data.filePath}</a>`;
                    document.body.appendChild(uploadedFile);
                }
            })
            .catch(error => {
                alert("Fel vid uppladdning: " + error.message);
            });
    });
});