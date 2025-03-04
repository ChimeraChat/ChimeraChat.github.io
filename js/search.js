async function fetchOnlineUsers() {
    try {
        const response = await fetch("/online-users");
        if (!response.ok) throw new Error("Failed to fetch users");
        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function searchUsers() {
    const searchValue = document.getElementById("searchUser").value.trim().toLowerCase();
    const userList = document.getElementById("userList");
    const errorMessage = document.getElementById("errorMessage");

    userList.innerHTML = "";
    errorMessage.textContent = "";

    if (!searchValue) {
        errorMessage.textContent = "Please enter a name to search.";
        return;
    }

    const users = await fetchOnlineUsers();
    const filteredUsers = users.filter(user => user.username.toLowerCase().includes(searchValue));

    if (filteredUsers.length === 0) {
        errorMessage.textContent = "No users found.";
    } else {
        filteredUsers.forEach(user => {
            const li = document.createElement("li");
            li.textContent = user.username;
            li.dataset.userid = user.userid;
            li.addEventListener("click", () => startChat(user.userid, user.username));
            userList.appendChild(li);
        });
    }
}

async function startChat(userid, username) {
    sessionStorage.setItem("chatWith", JSON.stringify({ userid, username }));
    window.location.href = "chatroom.html"; // Redirect to chat page
}

document.getElementById("searchButton").addEventListener("click", searchUsers);