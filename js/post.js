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
        formData.append("fileUpload", file);
        console.log("FormData:", formData);

        try {
            let response = await fetch("/upload", {
                method: "POST",
                body: formData,
            });
            console.log("response:", response);
            if (response.ok) {
                const data = await response.json();
                console.log("data:", data);
                alert(`Uppladdning lyckades! Fil-URL: ${data.fileUrl}`);
                document.getElementById("fileLink").innerHTML = `<a href="${data.fileUrl}" target="_blank">Visa fil</a>`;
            } else {
                throw new Error("Server responded with an error!");

            }
        } catch (error) {
            console.error("Uppladdningsfel:", error);
            alert("Serverfel vid uppladdning.");
        }
    });
});