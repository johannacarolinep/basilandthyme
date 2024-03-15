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

function favouritingBtnListener(event) {
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    const button = event.currentTarget;
    console.log("CSRF: ", csrfToken, "RecipeID: ", recipeId, "User ID: ", userId);
}