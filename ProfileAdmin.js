document.addEventListener("DOMContentLoaded", () => {
    const loggedInUser = {
        UserId: { S: "user-9012" },
        CreatedAt: { S: "2025-01-12T10:00:00Z" },
        CreatedRecipes: { L: [{ S: "5678-9012-3456" }] },
        Email: { S: "bakersue@example.com" },
        Following: { L: [] },
        ProfilePictureURL: { S: "https://s3.amazonaws.com/bucket-name/profile3-picture.jpg" },
        Rating: { N: "7.8" },
        RatingCount: { N: "8" },
        SavedRecipes: { L: [{ S: "6789-0123-4567" }, { S: "1234-5678-9012" }] },
        Username: { S: "BakerSue" },
        Bio: { S: "I love baking and sharing my recipes with the world!" }
    };

    // Populate profile details
    const populateProfileDetails = () => {
        const profileDetails = document.querySelector(".profile-details");
        if (profileDetails) {
            profileDetails.querySelector("#username").value = loggedInUser.Username.S;
            profileDetails.querySelector("#email").value = loggedInUser.Email.S;
            const createdAt = new Date(loggedInUser.CreatedAt.S).toISOString().split('T')[0];
            profileDetails.querySelector("#created-at").value = createdAt;
            profileDetails.querySelector("#bio").value = loggedInUser.Bio.S;
        }
    };

    // Populate saved recipes
    const populateSavedRecipes = () => {
        const savedRecipesContainer = document.querySelector(".saved-recipes .recipes-container");
        if (savedRecipesContainer) {
            savedRecipesContainer.innerHTML = loggedInUser.SavedRecipes.L
                .map(recipe => `
                    <div class="recipe-card">
                        <img src="https://via.placeholder.com/150" alt="Recipe">
                        <h3>Recipe ID: ${recipe.S}</h3>
                        <p>This is a saved recipe.</p>
                        <button>Remove</button>
                    </div>
                `)
                .join("");
        }
    };

    //// Populate uploaded recipes
    //const populateUploadedRecipes = () => {
    //    const uploadedRecipesContainer = document.querySelector(".uploaded-recipes .recipes-container");
    //    if (uploadedRecipesContainer) {
    //        uploadedRecipesContainer.innerHTML = loggedInUser.CreatedRecipes.L
    //            .map(recipe => `
    //                <div class="recipe-card">
    //                    <img src="https://via.placeholder.com/150" alt="Recipe">
    //                    <h3>Recipe ID: ${recipe.S}</h3>
    //                    <p>This is an uploaded recipe.</p>
    //                    <button>Edit</button>
    //                    <button>Delete</button>
    //                </div>
    //            `)
    //            .join("");
    //    }
    //};



    // Populate uploaded recipes
    const populateUploadedRecipes = () => {
        const uploadedRecipesContainer = document.querySelector(".uploaded-recipes .recipes-container");
        if (uploadedRecipesContainer) {
            uploadedRecipesContainer.innerHTML = loggedInUser.CreatedRecipes.L
                .map(recipe => `
                <div class="recipe-card">
                    <img src="https://via.placeholder.com/150" alt="Recipe">
                    <h3>Recipe ID: ${recipe.S}</h3>
                    <p>This is an uploaded recipe.</p>
                    <button class="edit-recipe" data-recipe-id="${recipe.S}">Edit</button>
                    <button class="delete-recipe" data-recipe-id="${recipe.S}">Delete</button>
                </div>
            `)
                .join("");

            // Add event listeners for Edit buttons
            const editButtons = document.querySelectorAll(".edit-recipe");
            editButtons.forEach(button => {
                button.addEventListener("click", () => {
                    const recipeId = button.getAttribute("data-recipe-id");
                    editRecipe(recipeId);
                });
            });

            // Add event listeners for Delete buttons
            const deleteButtons = document.querySelectorAll(".delete-recipe");
            deleteButtons.forEach(button => {
                button.addEventListener("click", () => {
                    const recipeId = button.getAttribute("data-recipe-id");
                    deleteRecipe(recipeId);
                });
            });
        }
    };

    // Function to handle editing a recipe
    const editRecipe = async (recipeId) => {
        try {
            // Fetch the recipe details (you can replace this with your logic to get the recipe data)
            const recipeDetails = {
                RecipeId: recipeId,
                Title: "Updated Homos Homos",
                Description: "Fluffy and delicious vanilla cupcakes with extra frosting.",
                Ingredients: ["Flour", "Sugar", "Vanilla Extract", "Butter", "Eggs", "Frosting"],
                Steps: [
                    "Mix dry ingredients",
                    "Add wet ingredients",
                    "Bake at 350°F for 20 mins",
                    "Frost the cupcakes"
                ],
                Category: "Dessert",
                Tags: ["cupcakes", "vanilla", "frosting"]
            };

            // Send PUT request to update the recipe
            const response = await fetch("https://0oo843p1e5.execute-api.us-east-1.amazonaws.com/prod/updateRecipe", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(recipeDetails)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const result = await response.json();
            alert("Recipe updated successfully!");
            console.log("Recipe updated:", result);

            // Refresh the uploaded recipes list
            populateUploadedRecipes();
        } catch (error) {
            console.error("Error updating recipe:", error);
            alert("Failed to update recipe. Check the console for details.");
        }
    };

    // Function to handle deleting a recipe
    const deleteRecipe = async (recipeId) => {
        try {
            // Send DELETE request to delete the recipe
            const response = await fetch("https://0oo843p1e5.execute-api.us-east-1.amazonaws.com/prod/deleteRecipe", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    RecipeId: recipeId,
                    CreatorUserId: loggedInUser.UserId.S // Use the logged-in user's ID
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const result = await response.json();
            alert("Recipe deleted successfully!");
            console.log("Recipe deleted:", result);

            // Refresh the uploaded recipes list
            populateUploadedRecipes();
        } catch (error) {
            console.error("Error deleting recipe:", error);
            alert("Failed to delete recipe. Check the console for details.");
        }
    };














    // Show/hide sections
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

    // Show profile details by default
    showSection("profile-details");

    // Handle bio updates
    const bioTextarea = document.querySelector("#bio");
    const saveChangesButton = document.querySelector("#save-changes-button");

    if (!bioTextarea || !saveChangesButton) {
        console.error("Bio textarea or Save Changes button not found in the DOM.");
        return;
    }

    let initialBio = bioTextarea.value;

    bioTextarea.addEventListener("input", () => {
        console.log("Bio field changed. Current value:", bioTextarea.value);
        if (bioTextarea.value !== initialBio) {
            saveChangesButton.disabled = false;
        } else {
            saveChangesButton.disabled = true;
        }
    });

    saveChangesButton.addEventListener("click", async (e) => {
        e.preventDefault();
        console.log("Save Changes button clicked.");
        const newBio = bioTextarea.value;

        try {
            console.log("Calling API to update bio...");

            const payload = {
                body: JSON.stringify({
                    UserId: "user-9012",
                    Bio: newBio
                })
            };

            const response = await fetch("https://0oo843p1e5.execute-api.us-east-1.amazonaws.com/prod/UpdateUserBio", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const responseData = await response.json();
            console.log("API response:", responseData);

            if (responseData.body) {
                const result = JSON.parse(responseData.body);
                if (response.ok) {
                    alert(result.message || "Bio updated successfully!");
                    initialBio = newBio;
                    saveChangesButton.disabled = true;
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

    // Modal functionality for adding recipes
    const addRecipeButton = document.querySelector(".add-recipe");
    const modal = document.getElementById("recipe-modal");
    const closeModalButton = document.querySelector(".close-modal");

    if (addRecipeButton && modal) {
        // Open modal when "Add Recipe" button is clicked
        addRecipeButton.addEventListener("click", () => {
            modal.style.display = "flex"; // Show the modal
        });

        // Close modal when the close button (X) is clicked
        closeModalButton.addEventListener("click", () => {
            modal.style.display = "none"; // Hide the modal
        });

        // Close modal when clicking outside the modal
        window.addEventListener("click", (event) => {
            if (event.target === modal) {
                modal.style.display = "none"; // Hide the modal
            }
        });

        // Handle form submission
        document.getElementById("recipe-form").addEventListener("submit", async (e) => {
            e.preventDefault();

            // Get form values
            const title = document.getElementById("title").value;
            const description = document.getElementById("description").value;
            const ingredients = document.getElementById("ingredients").value.split(",").map(item => item.trim());
            const steps = document.getElementById("steps").value.split(",").map(item => item.trim());
            const category = document.getElementById("category").value;
            const tags = document.getElementById("tags").value.split(",").map(item => item.trim());
            const creatorUserId = document.getElementById("creatorUserId").value;

            // Create recipe object
            const recipe = {
                Title: title,
                Description: description,
                Ingredients: ingredients,
                Steps: steps,
                Category: category,
                Tags: tags,
                CreatorUserId: creatorUserId
            };

            try {
                // Send POST request to the API
                const response = await fetch("https://0oo843p1e5.execute-api.us-east-1.amazonaws.com/prod/AddRecipe", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(recipe)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const result = await response.json();
                alert("Recipe posted successfully!");
                console.log("Recipe posted:", result);

                // Close the modal after successful submission
                modal.style.display = "none";

                // Clear the form
                document.getElementById("recipe-form").reset();
            } catch (error) {
                console.error("Error posting recipe:", error);
                alert("Failed to post recipe. Check the console for details.");
            }
        });
    }

    // Populate all sections
    populateProfileDetails();
    populateSavedRecipes();
    populateUploadedRecipes();
});