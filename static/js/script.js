/* Wait for page to load before initializing script */
document.addEventListener("DOMContentLoaded", initializeScript);

function initializeScript() {
    const categoryButtons = document.getElementsByClassName('btnCategory');
    for (let i = 0; i < categoryButtons.length; i++) {
        categoryButtons[i].addEventListener('click', addCategoryQuery);
    }

    const favouritingButton = document.getElementById('favouriting-btn');
    if (favouritingButton) {
        favouritingButton.addEventListener('click', (event) => favouritingBtnListener(event, recipeId));
    }

    const openRatingsBtn = document.getElementById("init-rate-btn");
    if (openRatingsBtn) {
        openRatingsBtn.addEventListener('click', initalizeRating)
    }

    const commentForm = document.getElementById("comments-input");
    if (commentForm) {
        commentForm.addEventListener("submit", prepCommentForm);
    }

    const commentDeleteBtns = document.getElementsByClassName("comment-delete");
    if (commentDeleteBtns) {
        for (let btn of commentDeleteBtns) {
            btn.addEventListener("click", confirmCommentDeletion);
        }
    }

    const commentEditBtns = document.getElementsByClassName("comment-edit");
    if (commentEditBtns) {
        for (let btn of commentEditBtns) {
            btn.addEventListener("click", startEditComment);
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
function initalizeRating(event, recipeListId = undefined) {
    const clickedRatingDisplay = event.currentTarget;
    // if recipeListId passed in (not on individual recipe page)
    if (recipeListId) {
        recipeId = recipeListId;
    }

    if (userId !== "None") {
        // get modal elements
        const ratingModal = document.getElementById("ratings-modal");
        const closeModalBtn1 = document.getElementById("close-rating-btn");
        const closeModalBtn2 = document.getElementById("cancel-rating-btn");
        const deleteBtn = document.getElementById("delete-rating-btn");
        const userRating = event.currentTarget.getAttribute("data-user-rating");

        buildRatingModal(userRating); // create modal content
        const starBtns = document.getElementsByClassName("star-btn");

        // Open modal and add event listeners to its buttons
        openModal(ratingModal);
        // Adds eventlistener to cancel buttons, to close modal and reset focus
        closeModalBtn1.addEventListener('click', () => closeModal(ratingModal, clickedRatingDisplay));
        closeModalBtn2.addEventListener('click', () => closeModal(ratingModal, clickedRatingDisplay));

        // add event listener to star buttons
        for (let btn of starBtns) {
            btn.addEventListener('click', (event) => selectRating(event, recipeId));
        }

        // add event listener to delete rating button
        if (deleteBtn) {
            deleteBtn.addEventListener('click', prepRatingDelete);
        }
    } else {
        // User is not logged in, open "Sign in" modal
        const modal = document.getElementById("sign-up-modal");
        const closeModalBtn = document.getElementById("close-modal-btn");
        openModal(modal);
        closeModalBtn.addEventListener('click', () => closeModal(modal, clickedRatingDisplay));
    }
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

function prepRatingDelete(event) {
    deleteRating(recipeId);
    event.currentTarget.removeEventListener('click', prepRatingDelete);
}

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
            // Handle the response data
            if (data.status === 200) {
                // If rating deleted, update frontend to reflect deletion
                // on listing pages
                if (window.location.pathname === "/recipes/" || window.location.pathname === "/favourites/") {
                    const recipeCard = document.getElementById(recipeId);
                    const ratingsDisplay = recipeCard.querySelector(".init-rate-btns");
                    ratingsDisplay.setAttribute("data-user-rating", "None")
                    updateRatingsDisplay(data, ratingsDisplay);
                    const modal = document.getElementById("ratings-modal");
                    closeModal(modal, ratingsDisplay);
                    // on individual recipe page
                } else {
                    ratingsDisplay = document.getElementById("init-rate-btn");
                    ratingsDisplay.setAttribute("data-user-rating", "None")
                    updateRatingsDisplay(data, ratingsDisplay);
                    const modal = document.getElementById("ratings-modal");
                    closeModal(modal, ratingsDisplay);
                }
            }
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
    selectedRating = event.currentTarget.getAttribute("data-rating-value");
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

    // Add event listener to submitbutton
    submitRatingBtn.addEventListener('click', prepRatingSubmit)
}

function prepRatingSubmit(event) {
    submitRating(selectedRating, recipeId)
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
    if (window.location.pathname === "/recipes/" || window.location.pathname === "/favourites/") {
        const recipeCard = document.getElementById(recipeId);
        ratingsDisplay = recipeCard.querySelector(".init-rate-btns");
    } else {
        // On recipe page
        ratingsDisplay = document.getElementById("init-rate-btn");
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


function prepCommentForm(event) {
    const commentForm = document.getElementById("comments-input");
    submitCommentForm(event, commentForm);
}

/**
 * Starts the process of editing a comment, after click on "edit" buttons.
 * Updates the form, switches out event listener on form button, and populates
 * the form field with existing comment body.
 * 
 * @param {Event} click on edit button
 * @returns {void}
 */
function startEditComment(event) {
    // Get the edit button and comment ID
    const editBtn = event.currentTarget;
    const commentId = editBtn.getAttribute("data-edit-comment-id");

    // Get the existing comment body
    const commentBody = editBtn.closest(".comment-body").querySelector('p').innerText;

    // Get the form and related elements
    const commentForm = document.getElementById("comments-input");
    const formTextArea = document.getElementById("id_body");
    const submitBtn = document.getElementById("comment-submit-btn");
    const formParagraph = commentForm.parentElement.querySelector("p");

    // Scroll up to the form
    commentForm.scrollIntoView({
        block: "center"
    });

    // Switch out event listener on form button to use form for editing
    commentForm.removeEventListener("submit", prepCommentForm);
    commentForm.addEventListener("submit", prepEditForm);

    // Set forms textare to existing comment body text
    formTextArea.value = commentBody;

    // Change styles and content to reflect form in edit mode
    submitBtn.innerText = "Update";
    submitBtn.className = submitBtn.className.replace("submit-btn", "update-btn");
    commentForm.setAttribute("data-comment-id", commentId);
    formParagraph.innerHTML = 'You can now edit your comment:';
}


function prepEditForm(event) {
    const commentForm = document.getElementById("comments-input");
    editCommentForm(event, commentForm);
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
 * Handles the confirmation of comment deletion. Displays modal, and adds event
 * listeners to close modal and/or delete comment.
 * 
 * @param {Event} click on delete button of a comment.
 * @returns {void}
 */
function confirmCommentDeletion(event) {

    const button = event.currentTarget;
    const commentId = button.getAttribute("data-delete-comment-id");
    const modal = document.getElementById("delete-modal");
    const closeModalBtn1 = document.getElementById("close-delete-modal");
    const closeModalBtn2 = document.getElementById("cancel-delete-btn");
    const confirmDeleteBtn = document.getElementById("delete-comment-btn");

    // Displays the confirmation modal
    openModal(modal);
    // Adds eventlistener to cancel buttons, to close modal and reset focus
    closeModalBtn1.addEventListener('click', () => closeModal(modal, button));
    closeModalBtn2.addEventListener('click', () => closeModal(modal, button));

    // Add event listener to confirm delete btn, pass through named function to remove event listener
    function prepDeleteComment() {
        deleteComment(commentId);
        // close modal and remove event listener
        closeModal(modal);
        confirmDeleteBtn.removeEventListener('click', prepDeleteComment);
    }

    confirmDeleteBtn.addEventListener('click', prepDeleteComment);
}


/**
 * Handles the request to delete a comment with AJAX using a DELETE request.
 * Creates the reuqest URL by attaching the commentId as a parameter to the forms
 * action url. Handles the request response, updating the frontend to reflect a 
 * successful deletion.
 * @param {string} commentId - the comments unique identifier
 * @returns {void}
 */
function deleteComment(commentId) {
    // Create the delete request URL
    const commentForm = document.getElementById("comments-input");
    const url = commentForm.action.slice(0, -1) + "?commentId=" + commentId;

    // Grab the csrf token
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

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
        .then(response => response.status)
        .then((status) => {
            // Handle the response data
            if (status === 200) {
                // If comment deleted, update frontend to reflect deletion
                const deleteButton = document.querySelector(`[data-delete-comment-id="${commentId}"]`);
                const comment = deleteButton.closest(".comment-container");
                comment.innerHTML = '<p class="mx-auto mb-0 text-center brand-green">Comment was successfully deleted.</p>';
            } else {
                // If comment not deleted, add paragraph to signal to user
                const deleteButton = document.querySelector(`[data-delete-comment-id="${commentId}"]`);
                const comment = deleteButton.closest(".comment-container");
                comment.innerHTML = comment.innerHTML + '<p class="mx-auto mb-0 text-center">Comment could not be deleted.</p>';
            }
        });
}


/**
 * Prepares and submits the comment form data to the server with an AJAX POST request.
 * Handles the response data.
 * 
 * @param {Event} submission of comment form while in submit mode (vs edit mode)
 * @param {HTMLFormElement} commentForm - The comment form element
 * @returns {void}
 */
function submitCommentForm(event, commentForm) {
    // Prevent default form submission behaviour
    event.preventDefault();

    // Prepare data to post
    const formData = new FormData(commentForm);
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // https://testdriven.io/blog/django-ajax-xhr/
    // Send a POST request to create a comment with the form data
    fetch(commentForm.action, {
            method: "POST",
            credentials: "same-origin",
            headers: {
                "X-Requested-With": "XMLHttpRequest",
                "X-CSRFToken": csrfToken,
            },
            body: formData
        })
        .then(response => Promise.all([response.json(), response.status]))
        .then(([data, status]) => {
            // Handle the response
            if (status === 200) {
                // If comment was created, call function to update frontend
                buildComment(data.data);
            } else {
                // handle not successful
            }
            // clear the form
            document.getElementById("id_body").value = "";
        });
};


/**
 * Builds and inserts a new comment in the HTML template using the provided data.
 * 
 * @param {Object} data - The data object received as part of POST request response,
 * containing comment details.
 * @returns {void}
 */
function buildComment(data) {
    // Prepare date for html
    const createdOn = new Date(data.date);
    const year = createdOn.getFullYear();
    const month = `0${createdOn.getMonth() + 1}`.slice(-2);
    const day = `0${createdOn.getDate()}`.slice(-2);
    const formattedDate = `${year}-${month}-${day}`;

    // Get comments parent container
    const commentsList = document.querySelector("#comments-list");

    // Create new comment in HTML using a string literal
    const newComment = `
    <div class="bg-brand-green h-line mx-auto my-3 d-none d-md-block"> </div>
    <div class="comment-container row mx-auto my-2 py-3 bg-brand-gray">
        <div class="col-12 col-md-3">
            <p class="mb-0">
                On ${formattedDate} 
                <span class="fw-bold">you</span> said:
            </p>
            <div class="bg-brand-green h-line d-md-none"></div> 
        </div>
        <div class="col-12 col-md-9 mt-2 mt-md-0 comment-body d-flex flex-column justify-content-between">
            <p class="text-break fst-italic fs-small">${data.body}</p>
            <div>
                <button class="py-1 px-2 comment-edit me-1" aria-label="Edit comment" data-edit-comment-id="${data.comment_id}">Edit</button>
                <button class="py-1 px-2 comment-delete delete mx-1" aria-label="Edit comment" data-delete-comment-id="${data.comment_id}">Delete</button>
            </div>
        </div>
    </div>
`;
    // Attach the new html comment to the parent container
    commentsList.innerHTML = newComment + commentsList.innerHTML;

    // Add event listeners to the new comments buttons
    commentsList.querySelector(`[data-edit-comment-id="${data.comment_id}"]`).addEventListener("click", startEditComment);
    commentsList.querySelector(`[data-delete-comment-id="${data.comment_id}"]`).addEventListener("click", confirmCommentDeletion);
};


/**
 * Adds a category query parameter to the current URL and redirects to the
 * updated URL.
 *
 * @param {Event} click - The clicked category button.
 * @returns {void}
 */
function addCategoryQuery(event) {
    const currentUrl = window.location.href;
    let category = event.currentTarget.value;

    // If URL does not contain /recipes, append "/recipes/?q=category"
    if (currentUrl.indexOf('/recipes') === -1) {
        window.location.href = currentUrl.split('?')[0] + 'recipes/?q=' + category;
    } else {
        // If URL contains /recipes, remove any existing query string
        const baseUrl = currentUrl.split('?')[0];

        // if there was a parameter
        if (baseUrl.endsWith('/recipes/')) {
            window.location.href = baseUrl + '?q=' + category;
        } else {
            // if there was no parameter
            window.location.href = baseUrl + '/?q=' + category;
        }
    }
}

/**
 * Handles the click event on favourite/unfavourite buttons.
 * If the user is logged in, sends a POST request to add/remove favourite
 * and updates the frontend based on the response.
 * If the user is not logged in, opens a modal to sign up or sign in.
 *
 * @param {Event} event - The click event triggering the function.
 * @returns {void}
 */
async function favouritingBtnListener(event, eventRecipeId) {

    const heartButton = event.currentTarget;
    console.log("In function to remove favourite")

    if (userId !== "None") {
        // User is logged in, prepare POST request
        const postAddress = '/add-remove-favourite/';
        const data = {
            recipeId: eventRecipeId, // recipeId passed in script tag fr template
            userId: userId // userId passed in script tag fr template
        };

        // Send POST request and await response
        const postResponse = await sendPostRequest(postAddress, data);
        if (postResponse.status === 200) {
            // If favourite was removed
            if (postResponse.action === 'removed') {
                if (window.location.pathname === "/favourites/") {
                    removeFavouriteOnFavouritesPage(heartButton);
                } else {
                    heartButton.querySelector('i').className = heartButton.querySelector('i').className.replace('fa-solid', 'fa-regular');
                    heartButton.parentNode.querySelector('p').innerText = "Removed";
                }
                // If favourite was created
            } else if (postResponse.action === 'created') {
                heartButton.querySelector('i').className = heartButton.querySelector('i').className.replace('fa-regular', 'fa-solid');
                heartButton.parentNode.querySelector('p').innerText = "Saved!";
            }
        }
        displayToast("fave-toast", postResponse.message, postResponse.status);
    } else {
        // User is not logged in, open "Sign in" modal
        const modal = document.getElementById("sign-up-modal");
        const closeModalBtn = document.getElementById("close-modal-btn");
        openModal(modal);
        closeModalBtn.addEventListener('click', () => closeModal(modal, heartButton));
    }
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
 * Styles the recipe card which the button belongs to, and updates the aria
 * attributes, to reflect the recipe has been removed from the users favourites.
 *
 * @param {HTMLElement} button - The button element clicked to remove the recipe from favorites.
 */
function removeFavouriteOnFavouritesPage(button) {
    // Get the card which the button belongs to
    const card = button.closest('.card');
    const paragraph = card.querySelector('p');
    const cardChildren = card.querySelectorAll('*');
    card.classList.add('unfavourited-card');
    paragraph.className = paragraph.className.replace('d-none', 'unfavourited-p');
    // Apply aria-hidden to each child element of card
    cardChildren.forEach(child => {
        child.setAttribute('aria-hidden', 'true');
    });
    card.setAttribute('aria-label', 'Removed recipe');
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