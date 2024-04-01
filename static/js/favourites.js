document.addEventListener("DOMContentLoaded", initializeFavouriteScript);

function initializeFavouriteScript() {

    const favouritingButtons = document.getElementsByClassName('heart-btn');
    if (favouritingButtons) {
        for (let btn of favouritingButtons) {
            btn.addEventListener('click', favouritingBtnListener);
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
async function favouritingBtnListener(event) {

    const heartButton = event.currentTarget;
    const userLoggedIn = heartButton.getAttribute("data-logged-in");
    const recipeId = heartButton.getAttribute("data-recipe-id");

    if (userLoggedIn == "true") {
        // User is logged in, prepare POST request
        const postAddress = '/add-remove-favourite/';
        const data = {
            recipeId: recipeId, // recipeId passed in script tag fr template
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