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
                alert(data.message || "File uploaded successfully!");
            })
            .catch(error => {
                alert("Error: " + error.message);
            });
    });
});