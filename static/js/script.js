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
function favouritingBtnListener(event, eventRecipeId) {
    // Retrieve the CSRF token from meta tag in HTML head
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    const button = event.currentTarget;

    console.log("User ID:", userId);
    if (userId !== "None") {
        // Create an object to send the data
        const data = {
            recipeId: eventRecipeId, // recipeId passed in script tag fr template
            userId: userId // userId passed in script tag fr template
        };

        // Send POST request to the server
        fetch('/add-remove-favourite/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify(data)
            })
            // Once data received, convert it to json
            .then(response => response.json())
            // Using the json response to make appropriate changes to frontend (WIP)
            .then(data => {
                if (data.message === 'Favourite removed') {
                    if (window.location.pathname === "/favourites/") {
                        // code for when favourite removed from favourites page
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
                    } else {
                        button.querySelector('i').className = button.querySelector('i').className.replace('fa-solid', 'fa-regular');
                        button.parentNode.querySelector('p').innerText = "Removed";
                    }
                } else if (data.message === 'Favourite created') {
                    button.querySelector('i').className = button.querySelector('i').className.replace('fa-regular', 'fa-solid');
                    button.parentNode.querySelector('p').innerText = "Saved!";
                }
            })
    } else {
        console.log("User not logged in");
        const modal = document.getElementById("sign-up-modal");
        modal.classList.add('show');
        modal.style.display = "block";
        const closeModalBtn = document.getElementById("close-modal-btn");
        closeModalBtn.addEventListener('click', function () {
            modal.style.display = "none";
            modal.classList.remove('show');
        })
    }
}