// Wait until document has loaded before initializing the script
document.addEventListener("DOMContentLoaded", initializeRatingsScript);

/**
 * Adds event listeners to the openRatingsbuttons (stars displaying on cards or
 * on the recipe page)
 */
function initializeRatingsScript() {

    const openRatingsBtns = document.getElementsByClassName("init-rate-btn");
    if (openRatingsBtns) {
        for (let btn of openRatingsBtns) {
            btn.addEventListener('click', initalizeRating)
        }
    }
}


/**
 * Initializes the ratings modal and handles user interaction for rating recipes.
 * If the user is logged in, it calls a function to build the rating modal with
 * content for the user-recipe combination. Adds event listeners to the modal
 * buttons. If the user is not logged in, it opens the "Sign in" modal.
 *
 * @param {Event} click - click on rating button on recipe page or recipe card.
 * @param {string} recipeListId - Optional. The ID of the recipe when rating a card.
 * @returns {void}
 */
function initalizeRating(event) {
    const clickedRatingDisplay = event.currentTarget;
    const userLoggedIn = clickedRatingDisplay.getAttribute("data-logged-in");
    const recipeId = clickedRatingDisplay.getAttribute("data-recipe-id");

    if (userLoggedIn === "true") {
        // get modal elements
        const ratingModal = document.getElementById("ratings-modal");
        const closeModalBtn = document.getElementById("close-rating-btn");
        const cancelModalBtn = document.getElementById("cancel-rating-btn");
        const deleteBtn = document.getElementById("delete-rating-btn");
        const userRating = event.currentTarget.getAttribute("data-user-rating");

        buildRatingModal(userRating); // create modal content
        const starBtns = document.getElementsByClassName("star-btn");

        // Open modal and add event listeners to its buttons
        openModal(ratingModal);
        // Adds eventlistener to cancel buttons, to close modal and reset focus
        closeModalBtn.addEventListener('click', () => closeModal(ratingModal, clickedRatingDisplay));
        cancelModalBtn.addEventListener('click', () => closeModal(ratingModal, clickedRatingDisplay));

        // add event listener to star buttons
        for (let btn of starBtns) {
            btn.addEventListener('click', (event) => selectRating(event, recipeId));
        }

        deleteBtn.setAttribute("data-recipe-id", recipeId);
        deleteBtn.addEventListener('click', prepRatingDelete);

    } else {
        // User is not logged in, open "Sign in" modal
        const modal = document.getElementById("sign-up-modal");
        const closeModalBtn = document.getElementById("close-modal-btn");
        openModal(modal);
        closeModalBtn.addEventListener('click', () => closeModal(modal, clickedRatingDisplay));
    }
}


/**
 * Calls function to delete rating, passing the recipe id, and removes the
 * event listener from the clicked delete button. Calls function to update UI
 * based on response from DELETE request.
 * @param {Event} click on delete button in ratings modal 
 * @returns {void}
 */
async function prepRatingDelete(event) {
    event.currentTarget.removeEventListener('click', prepRatingDelete);
    const deleteRatingResult = await deleteRating(event.currentTarget.getAttribute("data-recipe-id"));
    deleteRatingAction(deleteRatingResult[0], deleteRatingResult[1], deleteRatingResult[2]);
}


/**
 * Builds the content of the rating modal based on the user's existing rating
 * of the recipe.
 *
 * @param {string} userRating - The user's existing rating for the recipe.
 * @returns {void}
 */
function buildRatingModal(userRating) {
    const submitBtn = document.getElementById("submit-rating-btn");
    const deleteBtn = document.getElementById("delete-rating-btn");
    const modalIntro = document.getElementById("rate-modal-intro");
    const modalDeleteInstr = document.getElementById("rate-modal-delete-instr");
    const modalStarDiv = document.getElementById("rate-modal-stars");

    submitBtn.setAttribute("disabled", true);
    if (userRating != "None" && userRating != "null") {
        modalIntro.innerHTML = `You have previously given this recipe <span class="fw-bold">${userRating}
        stars</span>.
    <br>If you wish, you can edit your rating by simply submitting a new rating.`;
        modalDeleteInstr.innerHTML = 'Lastly, you can remove your existing rating by clicking "Delete" below.';
        if (deleteBtn.classList.contains("d-none")) {
            deleteBtn.classList.remove("d-none");
        }
    } else {
        modalIntro.innerHTML = 'Give this recipe a rating by selecting a star below and clicking "Submit".';
        modalDeleteInstr.innerHTML = "";
        if (!deleteBtn.classList.contains("d-none")) {
            deleteBtn.classList.add("d-none");
        }
    }

    // Create the star buttons styled according to the users existing rating for the recipe
    let starButtons = "";
    for (let i = 1; i <= 5; i++) {
        if (userRating != "None" && userRating >= i) {
            starButtons += `<button class="icon-button mx-1 star-btn" data-rating-value="${i}"
            aria-label="Give a ${i} star rating.">
            <i class="fa-solid fa-star" aria-hidden="true"></i>
        </button>`; // Add a full star
        } else if (userRating != "None" && userRating > i - 1) {
            starButtons += `<button class="icon-button mx-1 star-btn" data-rating-value="${i}"
            aria-label="Give a ${i} star rating.">
            <i class="fa-solid fa-star-half-stroke" aria-hidden="true"></i>
        </button>`; // Add a half star
        } else {
            starButtons += `<button class="icon-button mx-1 star-btn" data-rating-value="${i}"
            aria-label="Give a ${i} star rating.">
            <i class="fa-regular fa-star" aria-hidden="true"></i>
        </button>`; // Add an empty star
        }
    }
    modalStarDiv.innerHTML = starButtons;
}


/**
 * Submits a DELETE request for a rating, for a particular recipe. Prepares the
 * request and sends it. Returns the response data and the recipeId.
 *
 * @param {string} recipeId - The ID of the recipe for which the rating deletion
 * is being requested.
 * @returns {void}
 */
async function deleteRating(recipeId) {
    // Create the delete request URL
    const url = "/delete-rating/" + "?recipeId=" + recipeId;

    // Grab the csrf token
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    // https://testdriven.io/blog/django-ajax-xhr/
    // Send a delete request to delete the comment
    return await fetch(url, {
            method: "DELETE",
            credentials: "same-origin",
            headers: {
                "X-Requested-With": "XMLHttpRequest",
                "X-CSRFToken": csrfToken,
            },
        })
        .then(response => Promise.all([response.json(), response.status]))
        .then(([data, status]) => {
            return [data, status, recipeId];
        });
}

/**
 * Updates the ratings display based on the response recived from the DELETE
 * request (passed as parameters). Closes the ratings-modal and displays a
 * toast message.
 * @param {Object} data, response data received from the DELETE request.
 * @param {number} status, status code of the HTTP response.
 * @param {string}, recipeId, the id of the recipe
 */
function deleteRatingAction(data, status, recipeId) {
    let ratingsDisplay;
    if (window.location.pathname === "/recipes/" || window.location.pathname === "/favourites/" || window.location.pathname === "/") {
        const recipeCard = document.getElementById(recipeId);
        ratingsDisplay = recipeCard.querySelector(".init-rate-btn");
    } else {
        ratingsDisplay = document.querySelector(".init-rate-btn");
    }
    // Handle the response data
    if (status === 200) {
        // If rating deleted, update frontend to reflect deletion
        ratingsDisplay.setAttribute("data-user-rating", "None")
        updateRatingsDisplay(data, ratingsDisplay);
    }
    // close modal and display toast message
    const modal = document.getElementById("ratings-modal");
    closeModal(modal, ratingsDisplay);
    displayToast("toast", data.message, status);
}


/**
 * Handles the selection of a rating for a recipe. Activates the submit rating
 * button and adds event listener to it.
 *
 * @param {Event} click - Click on a star button, representing the selected
 * rating.
 * @param {string} recipeId - The ID of the recipe for which the rating is being
 * selected.
 * @returns {void}
 */
function selectRating(event, recipeId) {
    // Get rating value from the clicked star
    const selectedRating = event.currentTarget.getAttribute("data-rating-value");
    const submitRatingBtn = document.getElementById("submit-rating-btn");
    // activate submit button after a rating has been selected
    submitRatingBtn.removeAttribute("disabled");

    // style buttons to show selection
    const starBtns = document.getElementsByClassName("star-btn");
    for (let btn of starBtns) {
        if (selectedRating >= btn.getAttribute("data-rating-value")) {
            btn.classList.add("selected");
        } else {
            btn.classList.remove("selected");
        }
    }

    submitRatingBtn.setAttribute("data-recipe-id", recipeId);
    submitRatingBtn.setAttribute("data-rating-value", selectedRating);

    // Add event listener to submitbutton
    submitRatingBtn.addEventListener('click', prepRatingSubmit)
}

/**
 * Calls submitRating, passing the rating value and recipe id, before removing
 * the eventlistener from the clicked submit-button.
 * @param {Event} click - Click on the submit button in the ratings modal.
 */
function prepRatingSubmit(event) {
    submitRating(event.currentTarget.getAttribute("data-rating-value"), event.currentTarget.getAttribute("data-recipe-id"))
    event.currentTarget.removeEventListener('click', prepRatingSubmit);
}


/**
 * Submits a rating for a recipe asynchronously. Prepares the post data, calls
 * function to do POST request. Updates the ratings display based on the POST
 * response, closes the modal and displays a toast message.
 *
 * @param {number} rating - The rating to be submitted.
 * @param {string} recipeId - The ID of the recipe for which the rating is submitted.
 * @returns {Promise<void>} - A Promise that resolves when the rating submission process is complete.
 */
async function submitRating(rating, recipeId) {
    // prepare POST request
    const postAddress = '/add-update-rating/';
    const data = {
        rating: rating,
        recipeId: recipeId
    };

    // Send POST request and await response
    const postResponse = await sendPostRequest(postAddress, data);

    // handle response
    // grab ratingsdisplay based on location
    let ratingsDisplay;
    if (window.location.pathname === "/recipes/" || window.location.pathname === "/favourites/" || window.location.pathname === "/") {
        const recipeCard = document.getElementById(recipeId);
        ratingsDisplay = recipeCard.querySelector(".init-rate-btn");
    } else {
        // On recipe page
        ratingsDisplay = document.querySelector(".init-rate-btn");
    }
    // update ratingsdisplay if action successful
    if (postResponse.status === 200) {
        ratingsDisplay.setAttribute("data-user-rating", rating)
        updateRatingsDisplay(postResponse, ratingsDisplay); // update ratingsdisplay
    }
    // close modal and display toast message
    const modal = document.getElementById("ratings-modal");
    closeModal(modal, ratingsDisplay);
    displayToast("toast", postResponse.message, postResponse.status);
}


/**
 * Updates the ratings display (stars) on the page to reflect the recipes
 * current avg rating and number of ratings, based on the provided data.
 *
 * @param {object} data - Contains ratings count and average rating.
 * @param {HTMLElement} ratingsDisplay - The HTML element that holds the stars
 * and count
 * @returns {void}
 */
function updateRatingsDisplay(data, ratingsDisplay) {
    const starIcons = ratingsDisplay.querySelectorAll("i");
    const ratingsCount = ratingsDisplay.querySelector(".ratings-count");
    ratingsCount.innerHTML = `(${data.count})`;
    averageRating = data.average;
    let counter = 1;
    for (icon of starIcons) {
        if (averageRating >= counter) {
            icon.className = "fa-solid fa-star"; // Add a full star
        } else if (averageRating > counter - 1) {
            icon.className = "fa-solid fa-star-half-stroke"; // Add a half star
        } else {
            icon.className = "fa-regular fa-star"; // Add an empty star
        }
        counter++;
    }
}

// Exporting function for jest tests
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        deleteRating
    };
}