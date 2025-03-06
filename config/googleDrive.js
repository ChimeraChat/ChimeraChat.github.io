import { google } from "googleapis";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Konfigurera Google Auth
const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS, // länk till JSON-fil
    scopes: ["https://www.googleapis.com/auth/drive.file"],
});

// Skapa Drive-klienten
const drive = google.drive({ version: "v3", auth });

// Konfigurera Multer för att hantera filuppladdning
const upload = multer({ dest: "uploads/" });

// Funktion för att ladda upp filer till Google Drive
export const uploadFileToDrive = async (filePath, fileName) => {
    try {
        const response = await drive.files.create({
            requestBody: {
                name: fileName,
                parents: [process.env.GOOGLE_DRIVE_FOLDER_ID], // ID för mappen i Google Drive
            },
            media: {
                mimeType: "application/octet-stream",
                body: fs.createReadStream(filePath),
            },
        });

        console.log("Fil uppladdad:", response.data);
        return response.data.id;
    } catch (error) {
        console.error("Fel vid uppladdning:", error);
        return null;
    }
};

// Express route för att hantera uppladdning från klienten
export const uploadMiddleware = upload.single("fileUpload");
