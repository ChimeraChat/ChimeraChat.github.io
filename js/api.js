// api.js
const API_BASE_URL = "https://chimerachat.onrender.com";



async function getUserFolderId() {
    const response = await fetch(`${API_BASE_URL}/api/user/id`);
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || `Server error: ${response.status}`);
    }
    return data.id;
}



async function getUserFiles() {
    const response = await fetch(`${API_BASE_URL}/api/user/files`, {
        method: "GET",
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || `Server error: ${response.status}`);
    }
    return data;
}

export { getUserFolderId, getUserFiles };
