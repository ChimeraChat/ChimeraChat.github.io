import { google } from "googleapis";
import multer from "multer";
import dotenv from "dotenv";
import { Readable } from 'stream';

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

//Skapa mapp till användare
async function createUserFolder(username) {
    console.log("👉 username", username);
    const folderMetadata = {
        'name': username,  // Mappens namn baserat på användarnamnet
        'mimeType': 'application/vnd.google-apps.folder'
    };

    const driveResponse = await drive.files.create({
        resource: folderMetadata,
        fields: 'id'
    });

    if (driveResponse.status === 200) {
        return driveResponse.data.id;  // Returnerar ID för den skapade mappen
    } else {
        throw new Error('Could not create Google Drive folder');
    }
}

export { drive, createUserFolder };

// Funktion för att ladda upp filer till Google Drive
export const uploadFileToDrive = async (filebuffer, filename, mimetype) => {
    try {

        // Skapa en läsbar stream från buffern
        const bufferStream = new Readable();
        bufferStream.push(filebuffer);
        bufferStream.push(null); // Slutsignal för streamen
        console.log("BufferStream:", bufferStream)

        const response = await drive.files.create({
            requestBody: {
                name: filename,
                parents: [process.env.GOOGLE_DRIVE_FOLDER_ID], // ID för mappen i Google Drive
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



// Express route för att hantera uppladdning från klienten
export const uploadMiddleware = upload.single("fileupload");
