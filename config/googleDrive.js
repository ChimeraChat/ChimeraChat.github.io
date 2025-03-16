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

let sharedFolderId = process.env.SHARED_FOLDER_ID || null; // Store shared folder ID

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

listAllFiles();

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

        console.log("✅ All files deleted successfully!");
    } catch (error) {
        console.error("Error deleting files:", error.message);
    }
}

deleteAllFiles();

async function createSharedFolder() {
    if (sharedFolderId) {
        console.log("✅ Shared folder already exists:", sharedFolderId);
        return sharedFolderId;
    }

    console.log("🔄 Creating a shared folder...");

    const folderMetadata = {
        name: "ChimeraChat Shared Files",
        mimeType: "application/vnd.google-apps.folder",
    };

    try {
        const response = await drive.files.create({
            resource: folderMetadata,
            fields: "id",
        });

        sharedFolderId = response.data.id;

        // Make the folder public
        await drive.permissions.create({
            fileId: sharedFolderId,
            requestBody: {
                role: "reader",
                type: "anyone",
            },
        });

        console.log("✅ Shared folder created:", sharedFolderId);
        return sharedFolderId;
    } catch (error) {
        console.error("❌ Failed to create shared folder:", error.message);
        throw new Error("Shared folder creation failed.");
    }
}

async function createUserFolder(username, pool) {
    if (!username) {
        throw new Error("Username is not defined");
    }
    if (!pool) {
        throw new Error("Database pool is not available.");
    }
    console.log("Creating Google Drive folder for:", username);

    try {
        const result = await pool.query('SELECT userfolderid FROM chimerachat_accounts WHERE username = $1', [username]);
        if (result.rows.length > 0 && result.rows[0].userfolderid) {
            console.log("✅ Folder already exists for", username);
            return result.rows[0].userfolderid;  // Return existing folder ID
        }

        console.log("No folder found, creating a new one...");
        const folderMetadata = {
            'name': `${username}'s Folder`, // Mappens namn baserat på användarnamnet
            'mimeType': 'application/vnd.google-apps.folder',
            'parents': [process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID] // Set a parent folder if needed
        };
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
        console.log(`Uploading file: ${filename} to folder: ${parentFolderId}`);

        // Skapa en läsbar stream från buffern
        const bufferStream = new Readable();
        bufferStream.push(filebuffer);
        bufferStream.push(null); // Slutsignal för streamen
        console.log("BufferStream:", bufferStream);

        const response = await drive.files.create({
            requestBody: {
                name: filename,
                parents: [parentFolderId], // ID för mappen i Google Drive
                mimeType: mimetype,
            },
            media: {
                mimeType: mimetype, // Använd den faktiska MIME-typen från filen
                body: bufferStream, // Använd stream
            },
            fields: 'id',
        });
        console.log("Fil uppladdad:", response.data);
        return response.data.id;


    } catch (error) {
        console.error("Fel vid uppladdning drive.js:", error);
        return null;
    }
};

export { createUserFolder, createSharedFolder, drive };


// Express route för att hantera uppladdning från klienten
export const uploadMiddleware = upload.single("fileupload");
