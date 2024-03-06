/* Wait for page to load before initializing script */
document.addEventListener("DOMContentLoaded", initializeScript);

function initializeScript() {
    const categoryButtons = document.getElementsByClassName('btnCategory');

    for (let i = 0; i < categoryButtons.length; i++) {
        categoryButtons[i].addEventListener('click', addCategoryQuery);
    }
}

function addCategoryQuery(event) {
    const currentUrl = window.location.href;
    let category = event.currentTarget.innerHTML.toLowerCase();
    if (category === "see all") {
        category = "all"
    };
    console.log(category);

    // If URL does not contain /recipes, append "/recipes/?q=category"
    if (currentUrl.indexOf('/recipes') === -1) {
        window.location.href = currentUrl.split('?')[0].split('#')[0] + 'recipes/?q=' + category;
    } else {
        // If URL contains /recipes, remove any existing query string
        const baseUrl = currentUrl.split('?')[0].split('#')[0];

        // if there was a parameter
        if (baseUrl.endsWith('/recipes/')) {
            window.location.href = baseUrl + '?q=' + category;
        } else {
            // if there was no parameter
            window.location.href = baseUrl + '/?q=' + category;
        }
    }
}