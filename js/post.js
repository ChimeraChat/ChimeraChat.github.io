document.addEventListener("DOMContentLoaded", function () {
    const uploadForm = document.getElementById("uploadForm");
    uploadForm.addEventListener("submit", async function (event) {
        event.preventDefault();
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
                console.log("data in post.js:", data);
                alert(`Uppladdning lyckades!`);
            } else {
                throw new Error("Server responded with an error!");

            }
        } catch (error) {
            console.error("Uppladdningsfel:", error);
            alert("Serverfel vid uppladdning.");
        }
    });
});