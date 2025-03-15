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

console.log("GOOGLE_APPLICATION_CREDENTIALS:", process.env.GOOGLE_APPLICATION_CREDENTIALS);

async function listFiles() {
    try {
        const response = await drive.files.list({});
        console.log("response in drive.js", response);
        return response.data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}
async function createUserFolder(username) {
    if (!username) {
        throw new Error("Username is not defined");
    }
    console.log("Creating Google Drive folder for:", username);

    const folderMetadata = {
        'name': `${username}'s Folder`, // Mappens namn baserat på användarnamnet
        'mimeType': 'application/vnd.google-apps.folder',
        'parents': [process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID] // Set a parent folder if needed
    };

    try {
        const driveResponse = await drive.files.create({
            resource: folderMetadata,
            fields: 'id'
        });

        console.log("Mapp skapad i Google Drive:", driveResponse.data);
        return driveResponse.data.id;
    } catch (error) {
        console.error("Kunde inte skapa mapp i Google Drive:", error.message);
        return null;
    }
}


// Funktion för att ladda upp filer till Google Drive
export const uploadFileToDrive = async (filebuffer, filename, mimetype, parentFolderId) => {
    if(!filebuffer || !filename || !mimetype || !parentFolderId){
        throw new Error("Missing parameters");
    }
    try {
        let userFolderId = await createUserFolder(username);
        if (!userFolderId) {
            throw new Error("Failed to create/find user folder.");
        }
        // Skapa en läsbar stream från buffern
        const bufferStream = new Readable();
        bufferStream.push(filebuffer);
        bufferStream.push(null); // Slutsignal för streamen
        console.log("BufferStream:", bufferStream);

        const response = await drive.files.create({
            requestBody: {
                name: filename,
                parents: [parentFolderId], // ID för mappen i Google Drive
            },
            media: {
                mimeType: mimetype, // Använd den faktiska MIME-typen från filen
                body: bufferStream, // Använd stream
            },
        });
        console.log("Fil uppladdad:", response.data);
        return response.data.id;
    } catch (error) {
        console.error("Fel vid uppladdning drive.js:", error);
        return null;
    }
};

export { listFiles, createUserFolder, drive };


// Express route för att hantera uppladdning från klienten
export const uploadMiddleware = upload.single("fileupload");
