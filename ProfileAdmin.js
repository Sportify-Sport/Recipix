document.addEventListener("DOMContentLoaded", () => {
    const loggedInUser = {
        UserId: { S: "user-9012" },
        CreatedAt: { S: "2025-01-12T10:00:00Z" },
        CreatedRecipes: { L: [{ S: "4b3d0903-d22e-449f-9a78-50fe00c987f8" }] },
        Email: { S: "bakersue@example.com" },
        Following: { L: [] },
        ProfilePictureURL: { S: "https://s3.amazonaws.com/bucket-name/profile3-picture.jpg" },
        Rating: { N: "7.8" },
        RatingCount: { N: "8" },
        SavedRecipes: { L: [{ S: "6789-0123-4567" }, { S: "1234-5678-9012" }] },
        Username: { S: "BakerSue" },
        Bio: { S: "I love baking and sharing my recipes with the world!" }
    };


    const modal = document.getElementById("recipe-modal");
    const addRecipeButton = document.querySelector(".add-recipe");
    const closeModalButton = document.querySelector(".close-modal");


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
    console.log("Populating modal with recipe details:", recipe); 


    document.getElementById("title").value = recipe.Title || "";
    document.getElementById("description").value = recipe.Description || "";
    document.getElementById("ingredients").value = recipe.Ingredients?.join(", ") || "";
    document.getElementById("steps").value = recipe.Steps?.join(", ") || "";
    document.getElementById("category").value = recipe.Category || "";
    document.getElementById("tags").value = recipe.Tags?.join(", ") || "";
    document.getElementById("creatorUserId").value = recipe.CreatorUserId || "";
};

 
const fetchRecipeDetails = async (recipeId) => {
    console.log("Fetching recipe details for RecipeId:", recipeId); 
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
        console.log("Fetched recipe details:", result); 


        const recipe = JSON.parse(result.body);
        console.log("Parsed recipe details:", recipe); 


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


        const title = document.getElementById("title").value;
        const description = document.getElementById("description").value;
        const ingredients = document.getElementById("ingredients").value.split(",").map(item => item.trim());
        const steps = document.getElementById("steps").value.split(",").map(item => item.trim());
        const category = document.getElementById("category").value;
        const tags = document.getElementById("tags").value.split(",").map(item => item.trim());
        const creatorUserId = document.getElementById("creatorUserId").value;


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
            const mode = document.getElementById("recipe-form").dataset.mode;
            let response;

            if (mode === "add") {

                response = await fetch("https://0oo843p1e5.execute-api.us-east-1.amazonaws.com/prod/AddRecipe", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(recipe)
                });
            } else if (mode === "edit") {

                const recipeId = document.getElementById("recipe-form").dataset.recipeId;
                recipe.RecipeId = recipeId; 
                response = await fetch("https://0oo843p1e5.execute-api.us-east-1.amazonaws.com/prod/updateRecipe", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(recipe)
                });
            }

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const result = await response.json();
            alert(mode === "add" ? "Recipe posted successfully!" : "Recipe updated successfully!");
            console.log(mode === "add" ? "Recipe posted:" : "Recipe updated:", result);


            modal.style.display = "none";

            document.getElementById("recipe-form").reset();


            populateUploadedRecipes();
        } catch (error) {
            console.error("Error:", error);
            alert(`Failed to ${mode === "add" ? "post" : "update"} recipe. Check the console for details.`);
        }
    });



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


            const editButtons = document.querySelectorAll(".edit-recipe");
            editButtons.forEach(button => {
                button.addEventListener("click", () => {
                    const recipeId = button.getAttribute("data-recipe-id");
                    fetchRecipeDetails(recipeId); 
                });
            });


            const deleteButtons = document.querySelectorAll(".delete-recipe");
            deleteButtons.forEach(button => {
                button.addEventListener("click", () => {
                    const recipeId = button.getAttribute("data-recipe-id");
                    deleteRecipe(recipeId);
                });
            });
        }
    };




    const deleteRecipe = async (recipeId) => {
        try {
            const response = await fetch("https://0oo843p1e5.execute-api.us-east-1.amazonaws.com/prod/DeleteRecipe", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    RecipeId: { S: recipeId },
                    CreatorUserId: { S: loggedInUser.UserId.S }
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const result = await response.json();
            alert("Recipe deleted successfully!");
            console.log("Recipe deleted:", result);


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
                    UserId: { S: "user-9012" },
                    Bio: { S: newBio }
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


    populateProfileDetails();
    populateSavedRecipes();
    populateUploadedRecipes();
});