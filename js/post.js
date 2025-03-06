document.addEventListener("DOMContentLoaded", function () {
    const uploadForm = document.getElementById("uploadForm");
    uploadForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        const fileInput = document.getElementById("fileUpload");
        const file = fileInput.files[0];

        if (!file) {
            alert("Please select a file to upload.");
            return;
        }

        const formData = new FormData();
        formData.append("fileUpload", file);

        try {
            let response = await fetch("/upload", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                alert(`Uppladdning lyckades! Fil-URL: ${data.fileUrl}`);
                document.getElementById("fileLink").innerHTML = `<a href="${data.fileUrl}" target="_blank">Visa fil</a>`;
            } else {
                alert("Fel vid uppladdning.");
            }
        } catch (error) {
            console.error("Uppladdningsfel:", error);
            alert("Serverfel vid uppladdning.");
        }
    });
});