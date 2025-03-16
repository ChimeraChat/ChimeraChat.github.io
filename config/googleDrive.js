//googleDrive.js
import { google } from "googleapis";
import multer from "multer";
import dotenv from "dotenv";
dotenv.config({ path: 'googledrive.env' });
import { Readable } from 'stream';

const storage = multer.memoryStorage();
const upload = multer({storage: storage});


// Konfigurera Google Auth
const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS, // länk till JSON-fil
    scopes: ["https://www.googleapis.com/auth/drive.file"],
});

// Skapa Drive-klienten
const drive = google.drive({ version: "v3", auth });

const sharedFolderId = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID; // Store shared folder ID

console.log("GOOGLE_APPLICATION_CREDENTIALS:", process.env.GOOGLE_APPLICATION_CREDENTIALS);

async function listAllFiles() {
    try {
        const res = await drive.files.list({
            fields: "files(id, name)",
            pageSize: 1000, // Adjust if needed
        });

        if (!res.data.files.length) {
            console.log("No files found.");
            return;
        }

        console.log("Files in Drive:");
        res.data.files.forEach(file => console.log(`ID: ${file.id}, Name: ${file.name}`));

    } catch (error) {
        console.error("Error listing files:", error.message);
    }
}

// Function to list all files in Google Drive
// listAllFiles();


async function deleteAllFiles() {
    try {
        const res = await drive.files.list({
            fields: "files(id, name)",
            pageSize: 1000, // Adjust if needed
        });

        if (!res.data.files.length) {
            console.log("No files found.");
            return;
        }

        for (const file of res.data.files) {
            console.log(`Deleting file: ${file.name} (ID: ${file.id})`);
            await drive.files.delete({ fileId: file.id });
        }

        console.log("All files deleted successfully!");
    } catch (error) {
        console.error("Error deleting files:", error.message);
    }
}

//Function for deleting all files from Google Drive
// deleteAllFiles();



export const uploadFileToDrive = async (filebuffer, filename, mimetype) => {
    if (!filebuffer || !filename || !mimetype) {
        throw new Error("Missing parameters for file upload.");
    }

    try {
        console.log("Uploading file:", filename, "to shared folder:", SHARED_FOLDER_ID);

        const bufferStream = new Readable();
        bufferStream.push(filebuffer);
        bufferStream.push(null); // End signal

        const fileResponse = await drive.files.create({
            requestBody: {
                name: filename,
                parents: [SHARED_FOLDER_ID], // Use the shared folder
            },
            media: {
                mimeType: mimetype,
                body: bufferStream,
            },
            fields: 'id'
        });

        const fileId = fileResponse.data.id;
        console.log("File uploaded:", fileId);

        // Make file publicly accessible
        await drive.permissions.create({
            fileId: fileId,
            requestBody: {
                role: 'reader',
                type: 'anyone'
            }
        });

        const fileLink = `https://drive.google.com/uc?id=${fileId}&export=download`;
        console.log("Public File Link:", fileLink);

        return { fileId, fileLink };

    } catch (error) {
        console.error("Error uploading to Drive:", error);
        return null;
    }
};

export { drive }
// Express route för att hantera uppladdning från klienten
export const uploadMiddleware = upload.single("fileupload");
