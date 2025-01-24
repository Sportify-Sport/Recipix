let currentPage = 1; // Track the current page
const itemsPerPage = 10; // Number of items to display per page

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
        const users = JSON.parse(result.body).Users;
        createUsersTable(users); // Render the users table
        return users;
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
};

// Function to fetch all recipes from the API
const fetchRecipes = async () => {
    try {
        const response = await fetch("https://0oo843p1e5.execute-api.us-east-1.amazonaws.com/prod/fetchRecipes", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();

        // Parse the body and extract the recipes data
        const parsedBody = JSON.parse(result.body);

        // Convert the recipes data into an array
        let recipes = [];
        if (Array.isArray(parsedBody)) {
            // If the parsed body is already an array, use it directly
            recipes = parsedBody;
        } else if (typeof parsedBody === "object" && parsedBody !== null) {
            // If the parsed body is an object, convert it to an array
            recipes = Object.values(parsedBody);
        } else {
            throw new Error("Recipes data is not in a valid format.");
        }


        createRecipesTable(recipes); // Render the recipes table
        return recipes;
    } catch (error) {
        console.error("Error fetching recipes:", error);
        alert("Failed to fetch recipes. Check the console for details.");
        return [];
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
    table.id = "users-table"; // Add an ID for DataTables

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

        // Add actions (Delete button)
        const actionsCell = document.createElement("td");
        const deleteButton = document.createElement("button");
        deleteButton.className = "btn btn-danger btn-sm";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", async () => {
            const confirmDelete = window.confirm("Are you sure you want to delete this user?");
            if (confirmDelete) {
                const isDeleted = await deleteUser(user.UserId);
                if (isDeleted) {
                    row.remove(); // Remove the row from the table
                    console.log("User removed from the table.");
                }
            }
        });

        actionsCell.appendChild(deleteButton);
        row.appendChild(actionsCell);

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    adminControls.appendChild(table);

    // Initialize DataTables for the users table
    $('#users-table').DataTable({
        paging: true,
        searching: true,
        ordering: true,
        info: true,
    });
};

// Function to create and populate the recipes table
const createRecipesTable = (recipes) => {
    const adminControls = document.querySelector(".admin-controls");

    if (!adminControls) {
        console.error("Admin controls container not found!");
        return;
    }

    // Clear existing content
    adminControls.innerHTML = "";

    // Flatten the nested array
    const flattenedRecipes = recipes.flat();

    // Create the table element
    const table = document.createElement("table");
    table.className = "table table-striped table-bordered";
    table.id = "recipes-table"; // Add an ID for DataTables

    // Create the table header
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    // Define the table headers
    const headers = [
        "Title",
        "Description",
        "Category",
        "Creator",
        "Created At",
        "Ingredients",
        "Steps",
        "Tags",
        "Rating",
        "Ratings Count",
        "Image URL",
        "Actions"
    ];

    headers.forEach((header) => {
        const th = document.createElement("th");
        th.textContent = header;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create the table body
    const tbody = document.createElement("tbody");

    flattenedRecipes.forEach((recipe) => {
        const row = document.createElement("tr");

        // Add recipe data to the row
        const titleCell = document.createElement("td");
        titleCell.textContent = recipe.Title || "N/A";
        row.appendChild(titleCell);

        const descriptionCell = document.createElement("td");
        descriptionCell.textContent = recipe.Description || "N/A";
        row.appendChild(descriptionCell);

        const categoryCell = document.createElement("td");
        categoryCell.textContent = recipe.Category || "N/A";
        row.appendChild(categoryCell);

        const creatorCell = document.createElement("td");
        creatorCell.textContent = recipe.CreatorUsername || "N/A";
        row.appendChild(creatorCell);

        const createdAtCell = document.createElement("td");
        createdAtCell.textContent = recipe.CreatedAt || "N/A";
        row.appendChild(createdAtCell);

        const ingredientsCell = document.createElement("td");
        ingredientsCell.textContent = recipe.Ingredients ? recipe.Ingredients.join(", ") : "N/A";
        row.appendChild(ingredientsCell);

        const stepsCell = document.createElement("td");
        stepsCell.textContent = recipe.Steps ? recipe.Steps.join(", ") : "N/A";
        row.appendChild(stepsCell);

        const tagsCell = document.createElement("td");
        tagsCell.textContent = recipe.Tags ? recipe.Tags.join(", ") : "N/A";
        row.appendChild(tagsCell);

        const ratingCell = document.createElement("td");
        ratingCell.textContent = recipe.Rating || "N/A";
        row.appendChild(ratingCell);

        const ratingsCountCell = document.createElement("td");
        ratingsCountCell.textContent = recipe.RatingsCount || "N/A";
        row.appendChild(ratingsCountCell);

        const imageUrlCell = document.createElement("td");
        imageUrlCell.innerHTML = recipe.ImageURL
            ? `<img src="${recipe.ImageURL}" alt="Recipe Image" style="width: 100px; height: auto;">`
            : "N/A";
        row.appendChild(imageUrlCell);

        // Add actions (Delete button)
        const actionsCell = document.createElement("td");
        const deleteButton = document.createElement("button");
        deleteButton.className = "btn btn-danger btn-sm";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", async () => {
            const confirmDelete = window.confirm("Are you sure you want to delete this recipe?");
            if (confirmDelete) {
                const isDeleted = await deleteRecipe(recipe.RecipeId, recipe.CreatorUserId);
                if (isDeleted) {
                    row.remove(); // Remove the row from the table
                    console.log("Recipe removed from the table.");
                }
            }
        });

        actionsCell.appendChild(deleteButton);
        row.appendChild(actionsCell);

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    adminControls.appendChild(table);

    // Initialize DataTables for the recipes table
    $('#recipes-table').DataTable({
        paging: true,
        searching: true,
        ordering: true,
        info: true,
    });
};

// Function to delete a user
const deleteUser = async (userId) => {
    try {
        const requestBody = JSON.stringify({
            body: JSON.stringify({ UserId: userId }),
        });

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
        return true;
    } catch (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete user. Check the console for details.");
        return false;
    }
};


// Function to delete a recipe
const deleteRecipe = async (recipeId, creatorUserId) => {
    try {
        const response = await fetch("https://0oo843p1e5.execute-api.us-east-1.amazonaws.com/prod/deleteRecipe", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                RecipeId: recipeId,
                CreatorUserId: creatorUserId
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        return true;
    } catch (error) {
        console.error("Error deleting recipe:", error);
        alert("Failed to delete recipe. Check the console for details.");
        return false;
    }
};

// Add event listeners to the buttons
document.getElementById("fetch-users-button").addEventListener("click", fetchUsers);
document.getElementById("fetch-recipes-button").addEventListener("click", fetchRecipes);


