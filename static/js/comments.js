// Wait until document is loaded before calling initializeCommentScript()
document.addEventListener("DOMContentLoaded", initializeCommentScript);

/**
 * Adds event listeners to comment form, comment delete buttons, and comment
 * edit buttons.
 */
function initializeCommentScript() {

    const commentForm = document.getElementById("comments-input");
    if (commentForm) {
        commentForm.addEventListener("submit", prepSubmitComment);
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
 * Wrapper function to prepare data to post and help pass variables from the
 * POST request in submitCommentForm.
 * @param {*} event - comment form submit while in post mode
 */
async function prepSubmitComment(event) {
    // Prepare data to post
    const commentForm = document.getElementById("comments-input");
    const formData = new FormData(commentForm);
    const submitCommentResult = await submitCommentForm(event, commentForm, formData);
    submitCommentAction(submitCommentResult[0], submitCommentResult[1])
}

/**
 * Handles the confirmation of comment deletion. Displays modal, and adds event
 * listeners to close modal and delete comment.
 * 
 * @param {Event} click on delete button of a comment.
 * @returns {void}
 */
function confirmCommentDeletion(event) {

    const button = event.currentTarget;
    const commentId = button.getAttribute("data-delete-comment-id");
    const modal = document.getElementById("delete-modal");
    const closeModalBtn = document.getElementById("close-delete-modal");
    const cancelModalBtn = document.getElementById("cancel-delete-btn");
    const confirmDeleteBtn = document.getElementById("delete-comment-btn");
    // reset form
    resetForm();

    // Displays the confirmation modal
    openModal(modal);
    // Adds eventlistener to cancel buttons, to close modal and reset focus
    closeModalBtn.addEventListener('click', () => closeModal(modal, button));
    cancelModalBtn.addEventListener('click', () => closeModal(modal, button));

    // Add event listener to confirm delete btn, pass through named function to remove event listener
    async function prepDeleteComment() {
        // close modal and remove event listener
        closeModal(modal);
        confirmDeleteBtn.removeEventListener('click', prepDeleteComment);
        const deleteCommentResult = await deleteComment(commentId);
        // call function to update UI based on response fr delete request
        deleteCommentAction(deleteCommentResult[0], deleteCommentResult[1], deleteCommentResult[2]);
    }

    confirmDeleteBtn.addEventListener('click', prepDeleteComment);
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

    // Move focus to textarea
    formTextArea.focus();

    // Switch out event listener on form button to use form for editing
    commentForm.removeEventListener("submit", prepSubmitComment);
    commentForm.addEventListener("submit", prepEditComment);

    // Set forms textare to existing comment body text
    formTextArea.value = commentBody;

    // Change styles and content to reflect form in edit mode
    submitBtn.innerText = "Update";
    submitBtn.className = submitBtn.className.replace("border-btn-green", "border-btn-yellow");
    commentForm.setAttribute("data-comment-id", commentId);
    formParagraph.innerHTML = 'You can now edit your comment:';
}


/**
 * Wrapper function to prepare data for PUT edit comment request and help pass
 * variables from the PUT request in editCommentForm.
 * @param {*} event - comment form submit while in edit mode
 */
async function prepEditComment(event) {
    const commentForm = document.getElementById("comments-input");
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
    const address = commentForm.action;
    const editCommentResult = await editCommentForm(event, data, address);
    editCommentAction(editCommentResult[0], editCommentResult[1], data['body'], commentId);
}


/**
 * Submits the comment form data to the server with an AJAX POST request.
 * Returns the response data.
 * 
 * @param {Event} submission of comment form while in submit mode (vs edit mode)
 * @returns {void}
 */
async function submitCommentForm(event, commentForm, formData) {
    // Prevent default form submission behaviour
    event.preventDefault();
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // https://testdriven.io/blog/django-ajax-xhr/
    // Send a POST request to create a comment with the form data
    return await fetch(commentForm.action, {
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
            return [data, status]
        });
};


/**
 * Handles the response of a comment post request, updating the UI to
 * reflect the result and displays a toast message.
 * 
 * @param {Object} data, response data received from the deletion request.
 * @param {number} status, the status code of the HTTP response.
 */
function submitCommentAction(data, status) {
    // Handle the response
    if (status === 200) {
        // If comment was created, call function to update frontend
        buildComment(data.data);
    }
    // display toast message
    displayToast("comment-toast", data.message, status);
    // clear the form
    document.getElementById("id_body").value = "";
}


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

    // Create green dividing line
    const divider = document.createElement("div");
    divider.className = "bg-brand-green h-line mx-auto my-3 d-none d-md-block";

    // Create the new comment
    const commentContainer = document.createElement("div");
    commentContainer.className = "comment-container row mx-auto my-2 py-3 bg-brand-gray";
    commentContainer.innerHTML = `
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
                <button class="py-1 px-2 comment-edit border-btn-yellow btn-rounded btn-shadow me-1" aria-label="Edit comment" data-edit-comment-id="${data.comment_id}">Edit</button>
                <button class="py-1 px-2 comment-delete border-btn-red btn-rounded btn-shadow mx-1" aria-label="Edit comment" data-delete-comment-id="${data.comment_id}">Delete</button>
            </div>
        </div>`;

    // Attach the comment and dividing line to the parent container
    commentsList.prepend(commentContainer);
    commentsList.prepend(divider);
    commentContainer.scrollIntoView({
        block: "center"
    });

    // Add event listeners to the new comment's buttons
    commentsList.querySelector(`[data-edit-comment-id="${data.comment_id}"]`).addEventListener("click", startEditComment);
    commentsList.querySelector(`[data-delete-comment-id="${data.comment_id}"]`).addEventListener("click", confirmCommentDeletion);
};


/**
 * Handles the request to delete a comment using a DELETE request. Creates the
 * reuqest URL by attaching the commentId as a parameter to the form's
 * action url. Returns the request reponse.
 * 
 * @param {string} commentId - the comments unique identifier
 * @returns {void}
 */
async function deleteComment(commentId) {

    // Create the delete request URL
    const commentForm = document.getElementById("comments-input");
    const url = commentForm.action.slice(0, -1) + "?commentId=" + commentId;

    // Grab the csrf token
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // https://testdriven.io/blog/django-ajax-xhr/
    // Send a delete request to delete the comment
    return await fetch(url, {
            method: "DELETE",
            credentials: "same-origin",
            headers: {
                "X-Requested-With": "XMLHttpRequest",
                "X-CSRFToken": csrfToken,
            },
        })
        .then(response => Promise.all([response.json(), response.status]))
        .then(([data, status]) => {
            return [data, status, commentId];
        });
}

/**
 * Handles the response of a comment deletion request, updating the UI to
 * reflect the result. If the deletion is successful (status code 200),
 * the comment element is removed from the DOM and a success message is shown.
 * If the deletion fails, an error message is appended to the comment element.
 * In both cases a toast message is displayed to inform the user.
 * 
 * @param {Object} data, response data received from the deletion request.
 * @param {number} status, the status code of the HTTP response.
 * @param {String} commentId, the ID of the comment being deleted.
 */
function deleteCommentAction(data, status, commentId) {
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
    // Display toast
    displayToast("comment-toast", data.message, status)
}


/**
 * Handles the submission of an edited comment form with AJAX. Does a PUT
 * request, returns the response data.
 * 
 * @param {Event} form submitted while in "edit mode"
 * @param {Object} data - the form data
 * @param {String} address - the URL for the PUT request
 * @returns {void}
 */
async function editCommentForm(event, data, address) {
    // Prevent default form submission behaviour
    event.preventDefault();
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Credit: https://testdriven.io/blog/django-ajax-xhr/
    // Send PUT request to update the comment
    return await fetch(address, {
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
            return [data, status]
        });
}


/**
 * Handles the response from the server after attempting to edit a comment.
 * Updates the UI according to the result and displays a toast message.
 * Resets the form back to "posting mode".
 * 
 * @param {Object} data - The response data from the PUT request.
 * @param {number} status - The HTTP status code of the response.
 * @param {string} newComment - The updated comment text.
 * @param {string} commentId - The ID of the comment being edited.
 */
function editCommentAction(data, status, newComment, commentId) {
    // Handle server response
    if (status === 200) {
        // Add success message and update comment body
        const editBtn = document.querySelector(`[data-edit-comment-id="${commentId}"]`);
        const message = document.createElement("p")
        message.className = "small brand-green mt-2";
        message.innerText = "Comment was updated!";
        const container = editBtn.closest(".comment-container");
        container.classList.remove("comment-inactive");
        container.querySelector(".small.red").remove();
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
    // Display toast
    displayToast("comment-toast", data.message, status)
    // Reset form:
    resetForm();
}


/**
 * Resets the form to its default state - to post comments.
 * 
 * @returns {void}
 */
function resetForm() {
    const commentForm = document.getElementById("comments-input");
    const submitBtn = document.getElementById("comment-submit-btn");
    const paragraph = commentForm.parentElement.querySelector("p");
    document.getElementById("id_body").value = "";
    commentForm.removeAttribute("data-comment-id");
    paragraph.innerHTML = 'Post a comment and <span class="brand-green">share your thoughts</span> on this recipe.';
    submitBtn.innerText = "Send";
    submitBtn.className = submitBtn.className.replace("border-btn-yellow", "border-btn-green");
    // Switch event listener back, to post comments
    commentForm.removeEventListener("submit", prepEditComment);
    commentForm.addEventListener("submit", prepSubmitComment);
}


// Exporting function for jest tests
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        deleteComment,
        submitCommentForm,
        editCommentForm
    };
}