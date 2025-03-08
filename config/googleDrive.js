import { google } from "googleapis";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

const storage = multer.memoryStorage();
const upload = multer({storage: storage});


// Konfigurera Google Auth
const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS, // länk till JSON-fil
    scopes: ["https://www.googleapis.com/auth/drive.file"],
});

// Skapa Drive-klienten
const drive = google.drive({ version: "v3", auth });

async function listFiles() {
    try {
        const response = await drive.files.list({});
        console.log("response in drive.js", response);
    } catch (error) {
        console.error('API Error:', error);
    }
}

listFiles();

// Funktion för att ladda upp filer till Google Drive
export const uploadFileToDrive = async (filebuffer, filename, mimetype) => {
    try {
        const response = await drive.files.create({
            requestBody: {
                name: filename,
                parents: [process.env.GOOGLE_DRIVE_FOLDER_ID], // ID för mappen i Google Drive
            },
            media: {
                mimeType: mimetype, // Använd den faktiska MIME-typen från filen
                body: new Buffer.from(filebuffer), // Använd buffern direkt
            },
        });

        console.log("Fil uppladdad:", response.data);
        return response.data.id;
    } catch (error) {
        console.error("Fel vid uppladdning drive.js:", error);
        return null;
    }
};

// Express route för att hantera uppladdning från klienten
export const uploadMiddleware = upload.single("fileupload");
