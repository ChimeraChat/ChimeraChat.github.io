// api.js
const API_BASE_URL = "https://chimerachat.onrender.com";


async function apiRequest(endpoint, method, userData) {
    try {
        const response = await fetch(endpoint, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            //Server error, will also be caught in catch block
            const errorData = await response.json();
            throw new Error(errorData.message || `Server error: ${response.status}`);
        }

        const data = await response.json();
        return { ok: response.ok, ...data };
    } catch (error) {
        console.error(`${method} error:`, error);
        return { ok: false, message: error.message || `Network error during ${method}` };
    }
}

async function signupUser(userData) {
    return apiRequest('/signup', 'POST', userData);
}

async function loginUser(userData) {
    return apiRequest('/login', 'POST', userData);
}

export { signupUser, loginUser, apiRequest };


/**
 *
 // api.js
 const API_BASE_URL = "https://chimerachat.onrender.com";

 export async function signup(username, password, email) {
 const response = await fetch(`${API_BASE_URL}/signup`, {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ username, password, email })
 });
 return response.json();
 }

 export async function login(username, password) {
 const response = await fetch(`${API_BASE_URL}/login`, {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ username, password })
 });
 return response.json();
 }

 export async function uploadFile(file) {
 const formData = new FormData();
 formData.append('file', file);
 const response = await fetch(`${API_BASE_URL}/upload`, {
 method: "POST",
 body: formData,
 });
 return response.json();
 }

 export async function logout() {
 const response = await fetch(`${API_BASE_URL}/logout`, {
 method: "POST",
 });
 return response.json();
 }

 export async function getUserFiles(){
 const response = await fetch(`${API_BASE_URL}/api/user/files`, {
 method: "GET",
 });
 return response.json();
 }
 */