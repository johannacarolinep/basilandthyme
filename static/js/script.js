/* Wait for page to load before initializing script */
document.addEventListener("DOMContentLoaded", initializeScript);

function initializeScript() {
    const categoryButtons = document.getElementsByClassName('btnCategory');
    for (let i = 0; i < categoryButtons.length; i++) {
        categoryButtons[i].addEventListener('click', addCategoryQuery);
    }

    const favouriteButton = document.getElementById('favourite-btn');
    const unfavouriteButton = document.getElementById('unfavourite-btn');
    if (favouriteButton) {
        favouriteButton.addEventListener('click', favouritingBtnListener);
    } else if (unfavouriteButton) {
        unfavouriteButton.addEventListener('click', favouritingBtnListener);
    }
}

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
 * Retrieves the CSRF token, then sends a POST request to the server with the
 * CSRF token, recipe id, and user id.
 *
 * @param {Event} event - The click event triggering the function.
 * @returns {void}
 */
function favouritingBtnListener(event) {
    // Retrieve the CSRF token from meta tag in HTML head
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    const button = event.currentTarget;

    // Create a FormData object to send the data
    const formData = new FormData();
    formData.append('recipeId', recipeId); // recipeId passed in script tag fr template
    formData.append('userId', userId); // userId passed in script tag fr template

    // Send POST request to the server
    fetch('/add-remove-favourite/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;',
                'X-CSRFToken': csrfToken
            },
            body: formData
        })
        // Once data received, convert it to json
        .then(response => response.json())
        // Using the json response to make appropriate changes to frontend (WIP)
        .then(data => {
            console.log(data);
            if (data.message === 'It worked') {
                button.innerHTML = '<i class="fa-solid fa-heart mx-1 fs-rem-250 brand-green"></i>'
            }
        })
}