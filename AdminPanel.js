// Function to fetch all users from the API
const fetchUsers = async () => {
    try {
        const response = await fetch("https://0oo843p1e5.execute-api.us-east-1.amazonaws.com/prod/getAllUsers", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        console.log("API Response:", result);
        const users = JSON.parse(result.body).Users;
        console.log("Parsed Users:", users);
        createUsersTable(users);
        return users;
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
};



const deleteUser = async (userId) => {
    console.log("Deleting user with ID:", userId);
    try {
        const requestBody = JSON.stringify({
            body: JSON.stringify({ UserId: userId }), // Format the request body as required
        });
        console.log("Request body:", requestBody);

        const response = await fetch("https://0oo843p1e5.execute-api.us-east-1.amazonaws.com/prod/deleteUser", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: requestBody,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        console.log("User deleted successfully:", result);

        // Return true if the deletion was successful
        return true;
    } catch (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete user. Check the console for details.");
        return false;
    }
};

// Function to create and populate the users table
const createUsersTable = (users) => {
    const adminControls = document.querySelector(".admin-controls");

    if (!adminControls) {
        console.error("Admin controls container not found!");
        return;
    }

    // Clear existing content
    adminControls.innerHTML = "";

    // Create the table element
    const table = document.createElement("table");
    table.className = "table table-striped table-bordered";

    // Create the table header
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    const headers = ["Username", "Email", "Created At", "Bio", "Actions"];

    headers.forEach((header) => {
        const th = document.createElement("th");
        th.textContent = header;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create the table body
    const tbody = document.createElement("tbody");

    users.forEach((user) => {
        const row = document.createElement("tr");

        // Add user data to the row
        const usernameCell = document.createElement("td");
        usernameCell.textContent = user.Username || "N/A";
        row.appendChild(usernameCell);

        const emailCell = document.createElement("td");
        emailCell.textContent = user.Email || "N/A";
        row.appendChild(emailCell);

        const createdAtCell = document.createElement("td");
        createdAtCell.textContent = user.CreatedAt || "N/A";
        row.appendChild(createdAtCell);

        const bioCell = document.createElement("td");
        bioCell.textContent = user.Bio || "N/A";
        row.appendChild(bioCell);

        // Add actions (only Delete button)
        const actionsCell = document.createElement("td");

        // Create the Delete button
        const deleteButton = document.createElement("button");
        deleteButton.className = "btn btn-danger btn-sm";
        deleteButton.textContent = "Delete";

        // Add event listener to the Delete button
        deleteButton.addEventListener("click", async () => {
            const userId = user.UserId; // Assuming the user object has a `UserId` field
            const isDeleted = await deleteUser(userId);

            if (isDeleted) {
                // Remove the row from the table if the deletion was successful
                row.remove();
                console.log("User removed from the table.");
            }
        });

        actionsCell.appendChild(deleteButton); // Append the Delete button
        row.appendChild(actionsCell);

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    adminControls.appendChild(table);

    console.log("Table created and appended:", table); // Log the created table
};

// Fetch users and populate the table when the page loads
fetchUsers();