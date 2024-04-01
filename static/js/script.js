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