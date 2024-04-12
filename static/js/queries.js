/* Wait for page to load before initializing script */
document.addEventListener("DOMContentLoaded", initializeQueriesScript);

/**
 * Adds event listeners to category buttons and sort buttons
 */
function initializeQueriesScript() {
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
}


/**
 * Gets the value of the clicked category button and calls function to append/
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
 * Gets the value of the clicked sort button and calls function to append/
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

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        updateOrAppendQueryParam
    };
}