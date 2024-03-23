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
            console.log(data);
        });

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
function closeModal(modal, lastFocusElement) {
    modal.style.display = "none";
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    modal.removeAttribute('aria-modal');
    lastFocusElement.focus();
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