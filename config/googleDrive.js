import { google } from "googleapis";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

const storage = multer.diskStorage();
const upload = multer({storage: storage});


// Konfigurera Google Auth
const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS, // länk till JSON-fil
    scopes: ["https://www.googleapis.com/auth/drive.file"],
});

// Skapa Drive-klienten
const drive = google.drive({ version: "v3", auth });


// Funktion för att ladda upp filer till Google Drive
export const uploadFileToDrive = async (fileBuffer, fileName, mimeType) => {
    try {
        const response = await drive.files.create({
            requestBody: {
                name: fileName,
                parents: [process.env.GOOGLE_DRIVE_FOLDER_ID], // ID för mappen i Google Drive
            },
            media: {
                mimeType: mimeType, // Använd den faktiska MIME-typen från filen
                body: Buffer.from(fileBuffer), // Använd buffern direkt
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
export const uploadMiddleware = upload.single("fileupload");
