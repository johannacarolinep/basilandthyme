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

    const commentForm = document.getElementById("comments-input");
    if (commentForm) {
        commentForm.addEventListener("submit", (event) => submitCommentForm(event, commentForm));
    }

    const commentDeleteBtns = document.getElementsByClassName("comment-delete");
    for (let btn of commentDeleteBtns) {
        btn.addEventListener("click", confirmCommentDeletion);
    }
}

function confirmCommentDeletion(event) {
    const button = event.currentTarget;
    const commentId = button.getAttribute("data-comment-id");
    const modal = document.getElementById("delete-modal");
    const closeModalBtn1 = document.getElementById("close-delete-modal");
    const closeModalBtn2 = document.getElementById("cancel-delete-btn");
    const confirmDeleteBtn = document.getElementById("delete-comment-btn");

    openModal(modal);
    closeModalBtn1.addEventListener('click', () => closeModal(modal, button));
    closeModalBtn2.addEventListener('click', () => closeModal(modal, button));

    // pass through named function to remove event listener
    function prepDeleteComment(event) {
        deleteComment(event, commentId);
        closeModal(modal);
        confirmDeleteBtn.removeEventListener('click', prepDeleteComment);
    }

    confirmDeleteBtn.addEventListener('click', prepDeleteComment);
}

function deleteComment(event, commentId) {
    const commentForm = document.getElementById("comments-input");
    const url = commentForm.action.slice(0, -1) + "?commentId=" + commentId;
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // https://testdriven.io/blog/django-ajax-xhr/
    fetch(url, {
            method: "DELETE",
            credentials: "same-origin",
            headers: {
                "X-Requested-With": "XMLHttpRequest",
                "X-CSRFToken": csrfToken,
            },
            body: commentId
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const deleteButton = document.querySelector(`[data-comment-id="${commentId}"]`);
                const comment = deleteButton.closest(".comment-container");
                comment.innerHTML = '<p class="mx-auto mb-0 text-center brand-green">Comment was successfully deleted.</p>';
            } else {
                // handle not successful
                const deleteButton = document.querySelector(`[data-comment-id="${commentId}"]`);
                const comment = deleteButton.closest(".comment-container");
                comment.innerHTML = comment.innerHTML + '<p class="mx-auto mb-0 text-center">Comment could not be deleted.</p>';
            }
        });
}

function submitCommentForm(event, commentForm) {
    event.preventDefault();

    const formData = new FormData(commentForm);
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    // https://testdriven.io/blog/django-ajax-xhr/
    fetch(commentForm.action, {
            method: "POST",
            credentials: "same-origin",
            headers: {
                "X-Requested-With": "XMLHttpRequest",
                "X-CSRFToken": csrfToken,
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                buildComment(data.data);
            } else {
                // handle not successful
            }
        });

};

function buildComment(data) {
    // Prepare date for html
    const createdOn = new Date(data.date);
    const year = createdOn.getFullYear();
    const month = `0${createdOn.getMonth() + 1}`.slice(-2);
    const day = `0${createdOn.getDate()}`.slice(-2);
    const formattedDate = `${year}-${month}-${day}`;

    // Get comments parent container
    const commentsList = document.querySelector("#comments-list");

    // Create new comment in HTML
    const newComment = `
    <div class="bg-brand-green h-line mx-auto my-3 d-none d-md-block"> </div>
    <div class="row mx-auto my-2 py-3 bg-brand-gray">
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
                <button class="py-1 px-2 comment-edit me-1" aria-label="Edit comment">Edit</button>
                <button class="py-1 px-2 comment-delete mx-1" aria-label="Edit comment">Delete</button>
            </div>
        </div>
    </div>
`;
    // Attach the new html to the parent container
    commentsList.innerHTML = newComment + commentsList.innerHTML;
};

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

    if (userId !== "None") {
        // User is logged in, prepare POST request
        const postAddress = '/add-remove-favourite/';
        const data = {
            recipeId: eventRecipeId, // recipeId passed in script tag fr template
            userId: userId // userId passed in script tag fr template
        };

        // Send POST request and await response
        const postResponse = await sendPostRequest(postAddress, data);

        // If favourite was removed
        if (postResponse.message === 'Favourite removed') {
            if (window.location.pathname === "/favourites/") {
                removeFavouriteOnFavouritesPage(heartButton);
            } else {
                heartButton.querySelector('i').className = heartButton.querySelector('i').className.replace('fa-solid', 'fa-regular');
                heartButton.parentNode.querySelector('p').innerText = "Removed";
            }
            // If favourite was created
        } else if (postResponse.message === 'Favourite created') {
            heartButton.querySelector('i').className = heartButton.querySelector('i').className.replace('fa-regular', 'fa-solid');
            heartButton.parentNode.querySelector('p').innerText = "Saved!";
        }
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
        .then(response => response.json())
        .then(data => {
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