document.addEventListener("DOMContentLoaded", () => {

    let userToken = sessionStorage.getItem("userToken");

    function getUserFromSession() {
        const currentUser = sessionStorage.getItem("user");
        return currentUser ? JSON.parse(currentUser) : null;
    }

    const currentUser = getUserFromSession();
    if (currentUser) {
        console.log("Current User:", currentUser);
    } else {
        window.location.href = "/login.html";
        console.log("No user found in session storage!");
    }

    const userId = currentUser.sub;
    const username = currentUser['cognito:username'];
    const email = currentUser['email'];

    if (currentUser['cognito:groups'] && currentUser['cognito:groups'].includes("Admins")) {
        document.querySelector('.toggle-button[data-section="admin-panel"]').style.display = 'block';
    } else {
        document.querySelector('.toggle-button[data-section="admin-panel"]').style.display = 'none';
    }

    let userDetailsFromFetch = null; // Initialize as null

    async function fetchUserProfile(UserId) {
        console.log("Fetching profile for UserId:", UserId);
        const apiUrl = "https://0oo843p1e5.execute-api.us-east-1.amazonaws.com/prod/getUserProfile";
        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ UserId: userId }), // Ensure the key matches the API's expected input
            });

            if (!response.ok) {
                console.error("Error fetching user details:", response.statusText);
                return null;
            }

            const data = await response.json();
            console.log("API Response:", data);

            // Parse the `body` field as JSON
            if (data.body) {
                const userDetails = JSON.parse(data.body);
                console.log("Parsed User Details:", userDetails);
                return userDetails; // Return the parsed user details
            } else {
                console.error("No body found in the API response.");
                return null;
            }
        } catch (error) {
            console.error("An error occurred while fetching user details:", error);
            return null;
        }
    }

    (async () => {
        userDetailsFromFetch = await fetchUserProfile(userId);
        if (userDetailsFromFetch) {
            const createdAt = userDetailsFromFetch.CreatedAt;
            const bio = userDetailsFromFetch.Bio;
            console.log("CreatedAt:", createdAt);
            console.log("Bio:", bio);

            // Call populateProfileDetails with the fetched values
            populateProfileDetails(username, email, createdAt, bio);
        } else {
            console.error("Failed to fetch user details.");
        }
    })();

    const populateProfileDetails = (username, email, createdAt, bio) => {
        const profileDetails = document.querySelector(".profile-details");
        if (profileDetails) {
            console.log("CreatedAt value:", createdAt); // Debugging: Log the createdAt value

            // Validate createdAt
            let createdAtt;
            if (createdAt && !isNaN(new Date(createdAt).getTime())) {
                createdAtt = new Date(createdAt).toISOString().split('T')[0];
            } else {
                console.warn("Invalid createdAt value. Using current date as fallback.");
                createdAtt = new Date().toISOString().split('T')[0]; // Fallback to current date
            }

            profileDetails.querySelector("#username").value = username;
            profileDetails.querySelector("#email").value = email;
            profileDetails.querySelector("#created-at").value = createdAtt;
            profileDetails.querySelector("#bio").value = bio;
        }
    };

    const modal = document.getElementById("recipe-modal");
    const addRecipeButton = document.querySelector(".add-recipe");
    const closeModalButton = document.querySelector(".close-modal");
/////////////////////////////////////////////////////////////////////////////////////////
    const recipesContainer = document.getElementById('recipes-container');
    const searchBar = document.getElementById('search-bar');
    const sortOptions = document.getElementById('sort-options');

    const fetchSavedRecipes = async () => {
        try {
            const response = await fetch('https://0oo843p1e5.execute-api.us-east-1.amazonaws.com/prod/GetSavedRecipes', {
                method: 'POST',
                body: JSON.stringify({ UserId: userId }),
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await response.json();
            const recipes = JSON.parse(data.body).SavedRecipes; // Parse the JSON string received
            displaySavedRecipes(recipes); // Call the function to display the recipes
        } catch (error) {
            console.error("Error fetching saved recipes:", error);
        }
    };

    // Function to display recipes
    const displaySavedRecipes = (recipes) => {
        recipesContainer.innerHTML = ''; // Clear the container

        const recipesArray = recipes.map((recipe, index) => ({
            ...recipe,
            id: index // Assign an ID to each recipe
        }));

        // Function to sort recipes based on selected option
        const sortRecipes = (recipes) => {
            const sortBy = sortOptions.value;
            if (sortBy === 'rating') {
                return recipes.sort((a, b) => b.Rating - a.Rating); // Sort by Rating
            } else if (sortBy === 'newest') {
                return recipes.sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt)); // Sort by Newest
            }
            return recipes;
        };

        // Function to search recipes based on the search input
        const filterRecipes = (recipes) => {
            const searchQuery = searchBar.value.toLowerCase();
            return recipes.filter(recipe => recipe.Title.toLowerCase().includes(searchQuery));
        };

        // Combine sorting and searching functionality
        const sortedRecipes = sortRecipes(recipesArray);
        const filteredRecipes = filterRecipes(sortedRecipes);

        // Loop through the filtered and sorted recipes and display them
        filteredRecipes.forEach(recipe => {
            const recipeCard = document.createElement('div');
            recipeCard.classList.add('recipe-card');
            recipeCard.innerHTML = `
            <div class="user-info">
                <span class="username">${recipe.CreatorUsername}</span>
                <span class="create-date">${new Date(recipe.CreatedAt).toLocaleDateString()}</span>
            </div>
            <h3 class="title">${recipe.Title}</h3>
            <p class="description">${recipe.Description}</p>
            <p class="category">Category: ${recipe.Category}</p>
            <img src="${recipe.ImageURL || 'default-image.jpg'}" alt="${recipe.Title}">
            <p class="rating">Rating: ${recipe.Rating}</p>
        `;

            // Create and append ingredients list with toggle functionality
            const ingredientsList = document.createElement('div');
            ingredientsList.classList.add('ingredients');
            ingredientsList.innerHTML = `<ul>${recipe.Ingredients.map(ing => `<li>${ing}</li>`).join('')}</ul>`;
            ingredientsList.style.display = 'none';
            const ingredientsText = document.createElement('p');
            ingredientsText.classList.add('expand-text');
            ingredientsText.textContent = 'Ingredients';
            ingredientsText.addEventListener('click', () => {
                ingredientsList.style.display = ingredientsList.style.display === 'none' ? 'block' : 'none';
            });

            // Create and append steps list with toggle functionality
            const stepsList = document.createElement('div');
            stepsList.classList.add('steps');
            stepsList.innerHTML = `<ol>${recipe.Steps.map(step => `<li>${step}</li>`).join('')}</ol>`;
            stepsList.style.display = 'none';
            const stepsText = document.createElement('p');
            stepsText.classList.add('expand-text');
            stepsText.textContent = 'Steps';
            stepsText.addEventListener('click', () => {
                stepsList.style.display = stepsList.style.display === 'none' ? 'block' : 'none';
            });

            // Append the created elements to the recipe card
            recipeCard.appendChild(ingredientsText);
            recipeCard.appendChild(ingredientsList);
            recipeCard.appendChild(stepsText);
            recipeCard.appendChild(stepsList);

            // Add the "Unsave" button after the steps section
            const unsaveBtn = document.createElement('button');
            unsaveBtn.classList.add('unsave-btn');
            unsaveBtn.textContent = 'Unsave';
            unsaveBtn.setAttribute('data-recipe-id', recipe.RecipeId);
            recipeCard.appendChild(unsaveBtn);

            // Append the card to the container
            recipesContainer.appendChild(recipeCard);

            // Add event listener for the "Unsave" button
            unsaveBtn.addEventListener('click', async () => {
                const recipeId = unsaveBtn.getAttribute('data-recipe-id');
                const success = await unsaveRecipe(recipeId);  // Call the unsave function with the recipe ID

                if (success) {
                    recipeCard.remove();  // Only remove the card from the page if the recipe was unsaved successfully
                } else {
                    alert("Failed to unsave the recipe. Please try again.");  // Optionally, notify the user
                }
            });
        });
    };

    // Function to unsave a recipe
    const unsaveRecipe = async (recipeId) => {
        try {
            const response = await fetch('https://0oo843p1e5.execute-api.us-east-1.amazonaws.com/prod/UnsaveRecipe', {
                method: 'PUT',
                body: JSON.stringify({ RecipeId: recipeId, UserId: userId }), // Send RecipeId and UserId in the request body
                headers: { 'Content-Type': 'application/json' },
            });

            const result = await response.json();
            if (response.status === 200 && result.body.includes("successfully")) {
                return true;  // Return true if the unsave was successful
            } else {
                return false;  // Return false if the unsave was not successful
            }
        } catch (error) {
            return false;  // Return false if an error occurred
        }
    };

    // Event listener for section toggle buttons
    const toggleButtons = document.querySelectorAll('.toggle-button');
    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const section = button.getAttribute('data-section');
            if (section === 'saved-recipes') {
                fetchSavedRecipes(); // Fetch saved recipes only when "Saved Recipes" is clicked
            } else {
                recipesContainer.innerHTML = ''; // Clear the recipes container for other sections
            }
        });
    });

    // Event listeners for search and sort
    searchBar.addEventListener('input', () => fetchSavedRecipes());
    sortOptions.addEventListener('change', () => fetchSavedRecipes());

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////












    addRecipeButton.addEventListener("click", () => {
        modal.style.display = "flex";
        document.getElementById("recipe-form").reset();
        document.getElementById("recipe-form").dataset.mode = "add";
    });


    closeModalButton.addEventListener("click", () => {
        modal.style.display = "none";
    });


    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });


    const populateModalWithRecipeDetails = (recipe) => {


        document.getElementById("title").value = recipe.Title || "";
        document.getElementById("description").value = recipe.Description || "";
        document.getElementById("ingredients").value = recipe.Ingredients?.join(", ") || "";
        document.getElementById("steps").value = recipe.Steps?.join(", ") || "";
        document.getElementById("category").value = recipe.Category || "";
        document.getElementById("tags").value = recipe.Tags?.join(", ") || "";
        document.getElementById("urlImage").value = recipe.ImageURL || ""; 
    };



    const fetchRecipeDetails = async (recipeId) => {
        try {
            const requestBody = {
                body: JSON.stringify({ RecipeId: recipeId })
            };
            const response = await fetch("https://0oo843p1e5.execute-api.us-east-1.amazonaws.com/prod/getRecipeDetails", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const result = await response.json();


            const recipe = JSON.parse(result.body);


            populateModalWithRecipeDetails(recipe);


            modal.style.display = "flex";


            document.getElementById("recipe-form").dataset.mode = "edit";
            document.getElementById("recipe-form").dataset.recipeId = recipeId;
        } catch (error) {
            console.error("Error fetching recipe details:", error);
            alert("Failed to fetch recipe details. Check the console for details.");
        }
        };

        document.getElementById("recipe-form").addEventListener("submit", async (e) => {
            e.preventDefault();

            // Disable the submit button to prevent duplicate requests
            const submitButton = document.querySelector("#recipe-form button[type='submit']");
            submitButton.disabled = true;

            try {
                // Get form values
                const title = document.getElementById("title").value;
                const description = document.getElementById("description").value;
                const ingredients = document.getElementById("ingredients").value.split(",").map(item => item.trim());
                const steps = document.getElementById("steps").value.split(",").map(item => item.trim());
                const category = document.getElementById("category").value;
                const tags = document.getElementById("tags").value.split(",").map(item => item.trim());
                const imageUrl = document.getElementById("urlImage").value;
                const creatorUserId = userId; // Use the plain string value of the user ID

                // Construct the recipe object
                const recipe = {
                    Title: title,
                    Description: description,
                    Ingredients: ingredients,
                    Steps: steps,
                    Category: category,
                    Tags: tags,
                    ImageURL: imageUrl,
                    CreatorUserId: creatorUserId
                };

                // Determine the mode (add or edit)
                const mode = document.getElementById("recipe-form").dataset.mode;
                const url = mode === "add"
                    ? "https://0oo843p1e5.execute-api.us-east-1.amazonaws.com/prod/AddRecipe"
                    : "https://0oo843p1e5.execute-api.us-east-1.amazonaws.com/prod/updateRecipe";
                const method = mode === "add" ? "POST" : "PUT";

                // Add RecipeId for edit mode
                if (mode === "edit") {
                    const recipeId = document.getElementById("recipe-form").dataset.recipeId;
                    recipe.RecipeId = recipeId;
                }

                // Send the request
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(recipe)
                });

                // Check for HTTP errors
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                // Parse the response
                const result = await response.json();

                // Show success message
                alert(mode === "add" ? "Recipe posted successfully!" : "Recipe updated successfully!");
                console.log(mode === "add" ? "Recipe posted:" : "Recipe updated:", result);

                // Hide the modal and reset the form
                const modal = document.getElementById("recipe-modal"); // Ensure you have a reference to the modal
                modal.style.display = "none";
                document.getElementById("recipe-form").reset();

                // Refresh the uploaded recipes list
                populateUploadedRecipes();
            } catch (error) {
                // Handle errors
                console.error("Error:", error);
                alert(`Failed to ${mode === "add" ? "post" : "update"} recipe. Check the console for details.`);
            } finally {
                // Re-enable the submit button
                submitButton.disabled = false;
            }
        });

    const populateUploadedRecipes = async () => {
        const uploadedRecipesContainer = document.querySelector(".uploaded-recipes .recipes-container");

        if (!uploadedRecipesContainer) {
            console.error("Uploaded recipes container not found in the DOM.");
            return;
        }

        try {
            // Fetch the uploaded recipes for the logged-in user
            const response = await fetch("https://0oo843p1e5.execute-api.us-east-1.amazonaws.com/prod/getUploadedRecipes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    body: JSON.stringify({ UserId: userId }) // Use the logged-in user's ID
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const result = await response.json();
            const uploadedRecipes = JSON.parse(result.body).UploadedRecipes;

            // Clear the container before populating it
            uploadedRecipesContainer.innerHTML = "";

            // Populate the container with the uploaded recipes
            uploadedRecipesContainer.innerHTML = uploadedRecipes
                .map(recipe => {
                    // Create the recipe card HTML
                    const recipeCard = `
                    <div class="recipe-card">
                        <div class="user-info">
                            Uploaded on
                            <span class="create-date">${new Date(recipe.CreatedAt).toLocaleDateString()}</span>
                        </div>
                        <h3 class="title">${recipe.Title}</h3>
                        <p class="description">${recipe.Description}</p>
                        <p class="category">Category: ${recipe.Category}</p>
                        <img src="${recipe.ImageURL || 'default-image.jpg'}" alt="${recipe.Title}">
                        <p class="rating">Rating: ${recipe.Rating}</p>
                        <p class="expand-text ingredients-text">Ingredients</p>
                        <div class="ingredients" style="display: none;">
                            <ul>${recipe.Ingredients.map(ing => `<li>${ing}</li>`).join('')}</ul>
                        </div>
                        <p class="expand-text steps-text">Steps</p>
                        <div class="steps" style="display: none;">
                            <ol>${recipe.Steps.map(step => `<li>${step}</li>`).join('')}</ol>
                        </div>
                        <button class="edit-recipe" data-recipe-id="${recipe.RecipeId}">Edit</button>
                        <button class="delete-recipe" data-recipe-id="${recipe.RecipeId}">Delete</button>
                    </div>
                `;

                    return recipeCard;
                })
                .join("");

            // Add event listeners for expanding ingredients and steps
            const ingredientsTexts = document.querySelectorAll(".ingredients-text");
            ingredientsTexts.forEach(text => {
                text.addEventListener("click", () => {
                    const ingredientsList = text.nextElementSibling;
                    ingredientsList.style.display = ingredientsList.style.display === "none" ? "block" : "none";
                });
            });

            const stepsTexts = document.querySelectorAll(".steps-text");
            stepsTexts.forEach(text => {
                text.addEventListener("click", () => {
                    const stepsList = text.nextElementSibling;
                    stepsList.style.display = stepsList.style.display === "none" ? "block" : "none";
                });
            });

            // Add event listeners to the "Edit" buttons
            const editButtons = document.querySelectorAll(".edit-recipe");
            editButtons.forEach(button => {
                button.addEventListener("click", () => {
                    const recipeId = button.getAttribute("data-recipe-id");
                    fetchRecipeDetails(recipeId); // Fetch and populate the modal with recipe details
                });
            });

            // Add event listeners to the "Delete" buttons
            const deleteButtons = document.querySelectorAll(".delete-recipe");
            deleteButtons.forEach(button => {
                button.addEventListener("click", () => {
                    const recipeId = button.getAttribute("data-recipe-id");
                    const confirmDelete = confirm("Are you sure you want to delete this recipe? This action cannot be undone.");

                    if (confirmDelete) {
                        deleteRecipe(recipeId); // Delete the recipe
                    }
                });
            });

        } catch (error) {
            console.error("Error fetching uploaded recipes:", error);
            alert("Failed to fetch uploaded recipes. Check the console for details.");
        }
    };


    const deleteRecipe = async (recipeId) => {
        try {
            const requestBody = JSON.stringify({
                RecipeId: recipeId,
                CreatorUserId: userId
            });
            const response = await fetch("https://0oo843p1e5.execute-api.us-east-1.amazonaws.com/prod/deleteRecipe", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    RecipeId: recipeId,
                    CreatorUserId: userId
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const result = await response.json();
            alert("Recipe deleted successfully!");


            populateUploadedRecipes();
        } catch (error) {
            console.error("Error deleting recipe:", error);
            alert("Failed to delete recipe. Check the console for details.");
        }
    };


    const buttons = document.querySelectorAll(".toggle-button");
    const sections = document.querySelectorAll(".profile-page section");

    const showSection = (sectionClass) => {
        sections.forEach(section => {
            section.classList.remove("active-section");
            if (section.classList.contains(sectionClass)) {
                section.classList.add("active-section");
            }
        });
    };

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            const sectionClass = button.getAttribute("data-section");
            showSection(sectionClass);
        });
    });


    showSection("profile-details");


    const bioTextarea = document.querySelector("#bio");
    const saveChangesButton = document.querySelector("#save-changes-button");

    if (!bioTextarea || !saveChangesButton) {
        console.error("Bio textarea or Save Changes button not found in the DOM.");
        return;
    }

    let initialBio = bioTextarea.value;

    bioTextarea.addEventListener("input", () => {
        if (bioTextarea.value !== initialBio) {
            saveChangesButton.disabled = false;
        } else {
            saveChangesButton.disabled = true;
        }
    });


    saveChangesButton.addEventListener("click", async (e) => {
        e.preventDefault();
        const newBio = bioTextarea.value;

        try {
            const response = await fetch("https://0oo843p1e5.execute-api.us-east-1.amazonaws.com/prod/UpdateUserBio", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    body: JSON.stringify({ // Wrap the payload in a `body` field
                        UserId: userId,
                        Bio: newBio
                    })
                })
            });

            const responseData = await response.json();
            console.log(responseData);
            if (responseData.body) {
                const result = responseData.body;
                console.log(result);
                if (response.ok) {
                    alert(result.message || "Bio updated successfully!");
                    bioTextarea.value = newBio; // Update the UI with the new bio
                    bio = newBio; // Update the global bio variable
                    saveChangesButton.disabled = true; // Disable the save button
                } else {
                    alert(`Error: ${result.error || "An unknown error occurred."}`);
                }
            } else {
                alert("Invalid response from the server.");
            }
        } catch (error) {
            console.error("Error updating bio:", error);
            alert("An error occurred while updating the bio.");
        }
    });

    populateProfileDetails();
    populateUploadedRecipes();
});