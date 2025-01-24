const recipesContainer = document.getElementById('recipes-container');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');
const reviewModal = document.getElementById('review-modal');
const reviewForm = document.getElementById('review-form');
const reviewDescriptionInput = document.getElementById('review-description');
const reviewRatingInput = document.getElementById('review-rating');
const reviewImageInput = document.getElementById('review-image');
const stickyButtons = document.getElementById('sticky-buttons');
const allRecipesButton = document.getElementById('all-recipes-button');
const followingButton = document.getElementById('following-button');
let user = null; // Stores the current user data
let allRecipes = []; // Stores all fetched recipes

function getUrlParameters() {
    const hasParams = new URLSearchParams(
        window.location.hash.substring(1)
    );
    return Object.fromEntries(hasParams);
}

const params = getUrlParameters();

if (params.id_token) {
    const decodedIdToken = JSON.parse(atob(params.id_token.split(".")[1]));

    sessionStorage.setItem("user", JSON.stringify(decodedIdToken));
    sessionStorage.setItem("userToken", JSON.stringify(params.id_token));
    //console.log("Toekn: ", params.id_token);
    //let toDelete = sessionStorage.getItem("userToken");

    console.log("Decoded Token:", decodedIdToken);
} else {
    console.error("ID token not found in the URL!");
}

function getUserFromSession() {
    const user = sessionStorage.getItem("user");
    return user ? JSON.parse(user) : null;
}

const currentUser = getUserFromSession();
if (currentUser) {
    console.log("Current User:", currentUser);
} else {
    window.location.href = "/login.html";
    console.log("No user found in session storage!");
}

// Fetch the current user profile
const fetchUser = async () => {
    const response = await fetch('https://0oo843p1e5.execute-api.us-east-1.amazonaws.com/prod/getUserProfile', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ body: JSON.stringify({ UserId: currentUser.sub }) }),
    });

    const data = await response.json();
    // Parse the body string into an object
    user = JSON.parse(data.body);
    console.log(user);
};

allRecipesButton.addEventListener('click', () => {
    fetchRecipes();
});

// Event listener for "Following" button
followingButton.addEventListener('click', async () => {
    try {
        const response = await fetch('https://0oo843p1e5.execute-api.us-east-1.amazonaws.com/prod/generateFeed', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ UserId: user.UserId }),
        });

        const result = await response.json();

        if (result.statusCode === 200) {
            const parsedBody = JSON.parse(result.body);
            if (parsedBody.Feed.length === 0) {
                recipesContainer.innerHTML = '<p style="text-align: center; font-size: 18px;">No recipes uploaded by following users.</p>';
            } else {
                renderRecipes(parsedBody.Feed); // Render the recipes from the feed
            }
        } else {
            alert('Failed to fetch following recipes. Please try again.');
        }
    } catch (error) {
        console.error('Error fetching following recipes:', error);
        alert('Unable to fetch following recipes. Please try again later.');
    }
});

// Render recipes
const renderRecipes = (recipes) => {
    recipesContainer.innerHTML = ''; // Clear the container
    //const allFollowing = new Set(user.Following || []); // Convert user.Following to a Set for quick lookup

    recipes.forEach(recipe => {
        const isSaved = user.SavedRecipes?.includes(recipe.RecipeId);
        const recipeCard = document.createElement('div');
        recipeCard.classList.add('recipe-card');

        // Determine username display
        const isCurrentUser = recipe.CreatorUsername === user.Username;
        let usernameHTML = isCurrentUser
            ? '<span class="username">You</span>'
            : `<span class="username">${recipe.CreatorUsername}</span>`;

        // Add user info
        recipeCard.innerHTML += `
                <div class="user-info">
                    ${usernameHTML}
                    <span class="create-date">${new Date(recipe.CreatedAt).toLocaleDateString()}</span>
                </div>
                <h3 class="title">${recipe.Title}</h3>
                <p class="description">${recipe.Description}</p>
                <p class="category">Category: ${recipe.Category}</p>
                <img src="${recipe.ImageURL || 'default-image.jpg'}" alt="${recipe.Title}">
                <p class="rating">Rating: ${recipe.Rating}</p>
            `;

        // Add ingredients and steps sections
        const ingredientsText = document.createElement('p');
        ingredientsText.classList.add('expand-text');
        ingredientsText.textContent = 'Ingredients';
        const ingredientsList = document.createElement('div');
        ingredientsList.classList.add('ingredients');
        ingredientsList.innerHTML = `<ul>${recipe.Ingredients.map(ing => `<li>${ing}</li>`).join('')}</ul>`;
        ingredientsList.style.display = 'none';
        ingredientsText.addEventListener('click', () => {
            ingredientsList.style.display = ingredientsList.style.display === 'none' ? 'block' : 'none';
        });

        const stepsText = document.createElement('p');
        stepsText.classList.add('expand-text');
        stepsText.textContent = 'Steps';
        const stepsList = document.createElement('div');
        stepsList.classList.add('steps');
        stepsList.innerHTML = `<ol>${recipe.Steps.map(step => `<li>${step}</li>`).join('')}</ol>`;
        stepsList.style.display = 'none';
        stepsText.addEventListener('click', () => {
            stepsList.style.display = stepsList.style.display === 'none' ? 'block' : 'none';
        });

        recipeCard.appendChild(ingredientsText);
        recipeCard.appendChild(ingredientsList);
        recipeCard.appendChild(stepsText);
        recipeCard.appendChild(stepsList);

        // Add Follow/Unfollow button
        if (!isCurrentUser) {
            const followButton = document.createElement('button');
            const updateFollowButtonText = () => {
                const isFollowing = user.Following?.includes(recipe.CreatorUserId);
                followButton.textContent = isFollowing
                    ? 'Unfollow' + " " + recipe.CreatorUsername
                    : 'Follow' + " " + recipe.CreatorUsername;
            };

            // Initialize the button text
            updateFollowButtonText();

            followButton.addEventListener('click', async () => {
                const isFollowing = user.Following?.includes(recipe.CreatorUserId); // Recalculate each time
                try {
                    const endpoint = isFollowing
                        ? 'https://0oo843p1e5.execute-api.us-east-1.amazonaws.com/prod/unfollowUser'
                        : 'https://0oo843p1e5.execute-api.us-east-1.amazonaws.com/prod/followUser';
                    const method = isFollowing ? 'PUT' : 'POST';

                    const response = await fetch(endpoint, {
                        method,
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            body: JSON.stringify({
                                UserId: user.UserId,
                                TargetUserId: recipe.CreatorUserId,
                            }),
                        }),
                    });

                    const result = await response.json();
                    if (result.statusCode === 200) {
                        const parsedBody = JSON.parse(result.body);
                        if (parsedBody.message === 'Successfully unfollowed user.') {
                            alert(parsedBody.message);
                            user.Following = user.Following.filter(id => id !== recipe.CreatorUserId);
                        } else if (parsedBody.message === 'Successfully followed user.') {
                            alert(parsedBody.message);
                            user.Following = [...(user.Following || []), recipe.CreatorUserId];
                        } else {
                            alert('Unexpected response. Please try again.');
                        }
                        // Update the button text after success
                        updateFollowButtonText();
                    } else {
                        alert('Failed to update follow status. Please try again.');
                    }
                } catch (error) {
                    console.error('Error updating follow status:', error);
                    alert('Unable to update follow status. Please try again later.');
                }
            });

            recipeCard.appendChild(followButton);
        }

        // Add Save/Unsave button
        const saveButton = document.createElement('button');
        saveButton.textContent = isSaved ? 'Unsave' : 'Save';
        saveButton.addEventListener('click', () => handleSave(recipe.RecipeId, saveButton));
        recipeCard.appendChild(saveButton);

        // Add Reviews button
        const reviewsButton = document.createElement('button');
        reviewsButton.textContent = 'Reviews';
        reviewsButton.addEventListener('click', () => handleReviews(recipe.RecipeId, recipeCard, reviewsButton));
        recipeCard.appendChild(reviewsButton);

        // Append the recipe card to the container
        recipesContainer.appendChild(recipeCard);
    });
};


// Fetch all recipes
const fetchRecipes = async () => {
    const response = await fetch('https://0oo843p1e5.execute-api.us-east-1.amazonaws.com/prod/fetchRecipes');
    const data = await response.json();
    allRecipes = JSON.parse(data.body).recipes;
    handleSort(allRecipes, 'Newest');
};

// Save or Unsave a recipe
const handleSave = async (recipeId, button) => {
    const isSaved = user.SavedRecipes?.includes(recipeId);
    const apiUrl = isSaved
        ? 'https://0oo843p1e5.execute-api.us-east-1.amazonaws.com/prod/unSaveRecipe'
        : 'https://0oo843p1e5.execute-api.us-east-1.amazonaws.com/prod/saveRecipe';

    const method = isSaved ? 'PUT' : 'POST';

    const response = await fetch(apiUrl, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            body: JSON.stringify({ UserId: user.UserId, RecipeId: recipeId }),
        }),
    });

    if (response.ok) {
        if (isSaved) {
            user.SavedRecipes = user.SavedRecipes.filter(id => id !== recipeId);
            button.textContent = 'Save';
            alert('Recipe removed from saved list!');
        } else {
            user.SavedRecipes = [...(user.SavedRecipes || []), recipeId];
            button.textContent = 'Unsave';
            alert('Recipe added to saved list!');
        }
    } else {
        console.error('Error saving/unsaving the recipe');
        alert('An error occurred. Please try again.');
    }
};

// Handle sorting
const handleSort = (recipes, sortBy) => {
    let sortedRecipes = [...recipes];
    if (sortBy === 'Newest') {
        sortedRecipes.sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt));
    } else if (sortBy === 'Rating') {
        sortedRecipes.sort((a, b) => b.Rating - a.Rating);
    }
    renderRecipes(sortedRecipes);
};

// Handle search
const handleSearch = async () => {
    const keyword = searchInput.value.trim();
    if (!keyword) {
        handleSort(allRecipes, sortSelect.value);
        return;
    }

    const response = await fetch('https://0oo843p1e5.execute-api.us-east-1.amazonaws.com/prod/searchRecipes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ body: JSON.stringify({ Keyword: keyword }) }),
    });
    const data = await response.json();
    const searchResults = JSON.parse(data.body).recipes;
    renderRecipes(searchResults);
};

// Handle reviews
const handleReviews = async (recipeId, recipeCard, button) => {
    let reviewsDiv = recipeCard.querySelector('.reviews-list');

    // If the button text is 'Reviews', we need to fetch the reviews again
    if (button.textContent === 'Reviews') {
        try {
            const response = await fetch('https://0oo843p1e5.execute-api.us-east-1.amazonaws.com/prod/getReviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    body: JSON.stringify({ RecipeId: recipeId }),
                }),
            });

            const data = await response.json();

            const reviews = data.body ? JSON.parse(data.body).Reviews : undefined;

            if (reviews && reviews.length > 0) {
                reviews.sort((a, b) => {
                    return new Date(b.CreatedAt) - new Date(a.CreatedAt);
                });
            }

            if (!reviewsDiv) {
                reviewsDiv = document.createElement('div');
                reviewsDiv.classList.add('reviews-list');
                recipeCard.appendChild(reviewsDiv);
            }

            reviewsDiv.innerHTML = '';

            const addReviewButton = document.createElement('button');
            addReviewButton.textContent = 'Add Review';
            addReviewButton.addEventListener('click', () => {
                reviewsDiv.style.display = 'none';
                button.textContent = 'Reviews';
                openReviewModal(recipeId);
            });
            reviewsDiv.appendChild(addReviewButton);

            if (!reviews || reviews.length === 0) {
                const noReviewsMessage = document.createElement('p');
                noReviewsMessage.textContent = 'There are no reviews for this recipe.';
                reviewsDiv.appendChild(noReviewsMessage);
            } else {
                reviews.forEach(review => {
                    const reviewCard = document.createElement('div');
                    reviewCard.classList.add('review-card');

                    // Check if the current user is the one who wrote the review
                    const isCurrentUser = review.Username === user.Username;

                    // Add the "You" label next to the username if it's the current user
                    let usernameHTML = `<span class="username">${review.Username}</span>`;
                    if (isCurrentUser) {
                        usernameHTML = 'You';
                    }

                    // Create the review card
                    reviewCard.innerHTML = `
            <p>____________________________________________________________________________________________________</p>
            <br>
            <div class="user-info">
                ${usernameHTML}
                <span class="create-date">${new Date(review.CreatedAt).toLocaleDateString()}</span>
            </div>
            <p class="description">${review.Description}</p>
            <p class="rating">Rating: ${review.Rating}</p>
            <img src="${review.ImageURL || 'default-image.jpg'}" alt="${review.Username}'s review">
        `;

                    // If the current user is the reviewer, show a delete button
                    if (isCurrentUser) {
                        const deleteButton = document.createElement('button');
                        deleteButton.classList.add('deleteReview');
                        deleteButton.textContent = 'Delete Review';

                        // Handle the delete button click
                        deleteButton.addEventListener('click', async () => {
                            const confirmDelete = confirm('Are you sure you want to delete this review?');
                            if (confirmDelete) {
                                try {
                                    const response = await fetch('https://0oo843p1e5.execute-api.us-east-1.amazonaws.com/prod/deleteReview', {
                                        method: 'DELETE',
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({
                                            body: JSON.stringify({
                                                ReviewId: review.ReviewId,
                                                ReviewerUserId: user.UserId,
                                            }),
                                        }),
                                    });

                                    if (response.ok) {
                                        alert('Review deleted successfully!');
                                        // Update the reviews list by removing the review from the DOM
                                        reviewCard.remove();
                                    } else {
                                        const data = await response.json();
                                        alert(`Failed to delete review. Error: ${data.message}`);
                                    }
                                } catch (error) {
                                    console.error('Error deleting review:', error);
                                    alert('An error occurred while deleting the review.');
                                }
                            }
                        });
                        // Append the delete button to the review card
                        reviewCard.appendChild(deleteButton);
                    }
                    // Append the review card to the reviews div
                    reviewsDiv.appendChild(reviewCard);
                });

            }

            reviewsDiv.style.display = 'block';
        } catch (error) {
            console.error('Error fetching reviews:', error);
            const errorMessage = document.createElement('p');
            errorMessage.textContent = 'Unable to fetch reviews. Please try again later.';
            reviewsDiv.appendChild(errorMessage);
        }

        button.textContent = 'X';
    } else if (button.textContent === 'X') {
        const isVisible = reviewsDiv.style.display !== 'none';
        reviewsDiv.style.display = isVisible ? 'none' : 'block';
        button.textContent = isVisible ? 'Reviews' : 'X';
    }
};

// Open review modal
const openReviewModal = (recipeId) => {
    reviewModal.dataset.recipeId = recipeId; // Attach recipeId to the modal
    reviewModal.style.display = 'flex';
};

// Close review modal
const closeReviewModal = () => {
    reviewModal.style.display = 'none';
    reviewForm.reset();
};

// Handle adding a review
reviewForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const recipeId = reviewModal.dataset.recipeId;
    const description = reviewDescriptionInput.value.trim();
    const rating = parseFloat(reviewRatingInput.value);
    const imageURL = reviewImageInput.value.trim();

    if (!description || rating < 0 || rating > 5 || isNaN(rating)) {
        alert('Please fill out all required fields correctly.');
        return;
    }

    try {
        const response = await fetch('https://0oo843p1e5.execute-api.us-east-1.amazonaws.com/prod/addReview', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                body: JSON.stringify({
                    RecipeId: recipeId,
                    ReviewerUserId: user.UserId,
                    Rating: rating,
                    Description: description,
                    ImageURL: imageURL || '',
                }),
            }),
        });

        if (response.ok) {
            alert('Review added successfully!');
            closeReviewModal();
            // Find the reviewsDiv and hide it
            const recipeCard = document.querySelector(`[data-recipe-id="${recipeId}"]`);
            const reviewsDiv = recipeCard.querySelector('.reviews-list');
            if (reviewsDiv) {
                reviewsDiv.style.display = 'none'; // Close the div that contains the reviews
            }
        } else {
            alert('Failed to add review. Please try again.');
        }
    } catch (error) {
        console.error('Error adding review:', error);
        alert('An error occurred. Please try again later.');
    }
});

// Initialize page
const init = async () => {
    await fetchUser();
    await fetchRecipes();
    sortSelect.addEventListener('change', () => handleSort(allRecipes, sortSelect.value));
    searchInput.addEventListener('input', handleSearch);
};

init();