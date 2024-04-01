/* Wait for page to load before initializing script */
document.addEventListener("DOMContentLoaded", initializeScript);

function initializeScript() {
    const navbarCollapse = document.querySelector(".navbar-collapse");
    if (navbarCollapse) {
        navbarCollapse.addEventListener('show.bs.collapse', () => toggleHeaderBanner(true))
        navbarCollapse.addEventListener('hidden.bs.collapse', () => toggleHeaderBanner(false))
    }

    const categoryButtons = document.getElementsByClassName('btnCategory');
    if (categoryButtons) {
        for (let i = 0; i < categoryButtons.length; i++) {
            categoryButtons[i].addEventListener('click', addCategoryQuery);
        }
    }

    const sortButtons = document.getElementsByClassName('btn-sort');
    if (sortButtons) {
        for (let i = 0; i < sortButtons.length; i++) {
            sortButtons[i].addEventListener('click', addSortQuery);
        }
    }

    const openRatingsBtns = document.getElementsByClassName("init-rate-btn");
    if (openRatingsBtns) {
        for (let btn of openRatingsBtns) {
            btn.addEventListener('click', initalizeRating)
        }
    }
}

/**
 * Toggles the visibility of the header banner. Hides the banner when collapsable
 * navbar is opened.
 * 
 * @param {boolean} hide - Indicates to hide the banner (true) or show it (false).
 */
function toggleHeaderBanner(hide) {
    const headerBanner = document.querySelector(".header-banner");
    if (headerBanner) {
        if (hide) {
            headerBanner.classList.add("d-none");
        } else {
            headerBanner.classList.remove("d-none");
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

// add event listener to delete rating button
function prepRatingDelete(event) {
    deleteRating(event.currentTarget.getAttribute("data-recipe-id"));
    event.currentTarget.removeEventListener('click', prepRatingDelete);
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
 * request and sends it. Updates the ratings display based on the response,
 * closes the modal and displays a toast message.
 *
 * @param {string} recipeId - The ID of the recipe for which the rating deletion
 * is being requested.
 * @returns {void}
 */
function deleteRating(recipeId) {
    // Create the delete request URL
    const url = "/delete-rating/" + "?recipeId=" + recipeId;

    // Grab the csrf token
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    // https://testdriven.io/blog/django-ajax-xhr/
    // Send a delete request to delete the comment
    fetch(url, {
            method: "DELETE",
            credentials: "same-origin",
            headers: {
                "X-Requested-With": "XMLHttpRequest",
                "X-CSRFToken": csrfToken,
            },
        })
        .then(response => Promise.all([response.json(), response.status]))
        .then(([data, status]) => {
            data.status = status;
            // grab ratingsDisplay based on location
            let ratingsDisplay;
            if (window.location.pathname === "/recipes/" || window.location.pathname === "/favourites/" || window.location.pathname === "/") {
                const recipeCard = document.getElementById(recipeId);
                ratingsDisplay = recipeCard.querySelector(".init-rate-btn");
            } else {
                ratingsDisplay = document.querySelector(".init-rate-btn");
            }
            // Handle the response data
            if (data.status === 200) {
                // If rating deleted, update frontend to reflect deletion
                ratingsDisplay.setAttribute("data-user-rating", "None")
                updateRatingsDisplay(data, ratingsDisplay);
            }
            // close modal and display toast message
            const modal = document.getElementById("ratings-modal");
            closeModal(modal, ratingsDisplay);
            displayToast("toast", data.message, data.status);
        });
}


/**
 * Displays a toast message with the given message and an image based on
 * the status.
 * 
 * @param {string} toastId - The ID of the toast element to display.
 * @param {string} message - The message to display in the toast.
 * @param {number} status - The status code, indicating indicating succcess or
 * failure.
 */
function displayToast(toastId, message, status) {
    const toast = document.getElementById(toastId);
    const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toast);
    const toastBody = toast.querySelector(".toast-body");
    let toastImage;
    toastBody.innerText = message;
    toastBootstrap.show()
    if (status === 200) {
        toastImage = toast.querySelector(".success-img");
    } else {
        toastImage = toast.querySelector(".fail-img");
    }
    toastImage.classList.remove("d-none");
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


/**
 * Handles the submission of an edited comment form with AJAX. Prepares the data
 * to send, does a PUT request, and handles the response, updating the frontend
 * to reflect a successful or unsuccessful edit of a comment.
 * 
 * @param {Event} form submitted while in "edit mode"
 * @param {HTMLFormElement} commentForm - the form element containing the comment data
 * @returns {void}
 */
function editCommentForm(event, commentForm) {
    // Prevent default form submission behaviour
    event.preventDefault();

    // Get commentId from the forms attribute 
    const commentId = commentForm.getAttribute("data-comment-id");

    // Create FormData object with data from the form
    const formData = new FormData(commentForm);

    // Convert the form data to JSON and add commentId
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });
    data['commentId'] = commentId;

    // Save the submitted form "body"
    const newComment = data['body'];

    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Credit: https://testdriven.io/blog/django-ajax-xhr/
    // Send PUT request to update the comment
    fetch(commentForm.action, {
            method: "PUT",
            credentials: "same-origin",
            headers: {
                "X-Requested-With": "XMLHttpRequest",
                "X-CSRFToken": csrfToken,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data)
        })
        .then(response => Promise.all([response.json(), response.status]))
        .then(([data, status]) => {
            // Handle server response
            if (status === 200) {
                // Add success message and update comment body
                const editBtn = document.querySelector(`[data-edit-comment-id="${commentId}"]`);
                const message = document.createElement("p")
                message.className = "small brand-green mt-2";
                message.innerText = "Comment was updated!";
                const container = editBtn.closest(".comment-container");
                container.querySelector("div").appendChild(message);
                const commentBody = editBtn.closest(".comment-body");
                commentBody.querySelector("p").innerText = newComment;
                // scroll to the comment body
                commentBody.scrollIntoView({
                    block: "center"
                });

            } else {
                // Add failure message and
                const editBtn = document.querySelector(`[data-edit-comment-id="${commentId}"]`);
                const message = document.createElement("p")
                message.className = "small red mt-2";
                message.innerText = "Comment was not updated!";
                const container = editBtn.closest(".comment-container");
                container.querySelector("div").appendChild(message);
            }
            // Reset form: empty textearea, remove comment id, update button and paragraph
            document.getElementById("id_body").value = "";
            commentForm.removeAttribute("data-comment-id");
            const submitBtn = document.getElementById("comment-submit-btn");
            const paragraph = commentForm.parentElement.querySelector("p");
            paragraph.innerHTML = 'Post a comment and <span class="brand-green">share your thoughts</span> on this recipe.';
            submitBtn.innerText = "Send";
            submitBtn.className = submitBtn.className.replace("update-btn", "submit-btn");
            // Switch event listener back, to post comments
            commentForm.removeEventListener("submit", prepEditForm);
            commentForm.addEventListener("submit", prepCommentForm);
        });
}


/**
 * Gets the value of the clicked category button and calls function at append/
 * update search query.
 *
 * @param {Event} click - The clicked category button.
 * @returns {void}
 */
function addCategoryQuery(event) {
    const category = event.currentTarget.value;
    updateOrAppendQueryParam("q", category)
}


/**
 * Gets the value of the clicked sort button and calls function at append/
 * update sort query.
 *
 * @param {Event} click - The clicked sort button.
 * @returns {void}
 */
function addSortQuery(event) {
    const sortCriteria = event.currentTarget.value;
    updateOrAppendQueryParam("s", sortCriteria)
}


/**
 * Modifies the URL by either updating the value of an existing parameter or by
 * adding a parameter, based on the provided parameters.
 * 
 * @param {string} param - The parameter type to be updated or appended.
 * @param {string} value - The value of the parameter.
 * @returns {void}
 */
function updateOrAppendQueryParam(param, value) {
    // Create a URL object
    const url = new URL(window.location.href);
    url.pathname = "/recipes/";

    // Use searchParams object to work with the parameters
    // credit: https://developer.mozilla.org/en-US/docs/Web/API/URL/searchParams
    const searchParams = url.searchParams;

    // If URL has the parameter type (param), update its value
    if (searchParams.has(param)) {
        searchParams.set(param, value);
    } else {
        // If URL does not have the parameter, add it
        searchParams.append(param, value);
    }

    // Update the URL's search string
    url.search = searchParams.toString();

    // Update the URL
    window.location.href = url.toString();
}


/**
 * Sends a POST request to the specified URL (in the parameter) with the
 * provided data, including the CSRF token.
 *
 * @param {string} postAddress - The URL to send the POST request to.
 * @param {object} data - The data to include in the request body.
 * @returns {object} data - the response data from the server.
 */
function sendPostRequest(postAddress, data) {
    // Retrieve the CSRF token from meta tag in HTML head
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    // Send POST request to the server
    return fetch(postAddress, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify(data)
        })
        // Once response received, convert it to json
        .then(response => Promise.all([response.json(), response.status]))
        .then(([data, status]) => {
            data.status = status;
            return data // Return the response data
        })
}


/**
 * Opens a modal by applying the correct classes/styles. Sets aria attributes
 * to reflect the modal is open. Calls function to trap the tab-focus inside modal.
 * 
 * @param {HTMLElement} modal - The modal to be opened.
 */
function openModal(modal) {
    modal.classList.add('show');
    modal.style.display = "block";
    modal.setAttribute('aria-hidden', 'false');
    modal.setAttribute('aria-modal', 'true');
    trapFocusInModal(modal);
}

/**
 * Closes a modal by adjusting css styles/classes. Adjusts aria to reflect modal
 * is closed. Sets the focus on the element passed as parameter lastFocusElement
 * 
 * @param {HTMLElement} modal - The modal to be closed.
 * @param {HTMLElement} lastFocusElement - The element to receive focus after
 * closing the modal.
 */
function closeModal(modal, lastFocusElement = undefined) {
    modal.style.display = "none";
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    modal.removeAttribute('aria-modal');
    if (lastFocusElement) {
        lastFocusElement.focus();
    }
}

/**
 * Traps focus within the modal to prevent it from moving outside.
 * 
 * @param {HTMLElement} modal - The modal element to trap focus within.
 */
function trapFocusInModal(modal) {
    // Get the focusable elements within the modal
    const focusableElements = modal.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])');
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];

    // Add event listener for keydown events in the modal
    modal.addEventListener('keydown', function (event) {
        const isTabPressed = event.key === 'Tab';
        if (isTabPressed) {
            // If focus is on the last focusable element, move it to the first
            if (document.activeElement === lastFocusableElement) {
                firstFocusableElement.focus();
                event.preventDefault();
            }
        }
    });

    // When the modal is open, move focus to the first focusable element
    firstFocusableElement.focus();
}