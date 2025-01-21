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
                        <button>Edit</button>
                        <button>Delete</button>
                    </div>
                `)
                .join("");
        }
    };

    populateProfileDetails();
    populateSavedRecipes();
    populateUploadedRecipes();

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
});