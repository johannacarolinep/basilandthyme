document.addEventListener("DOMContentLoaded", initializeCommentScript);

function initializeCommentScript() {

    const commentForm = document.getElementById("comments-input");
    if (commentForm) {
        commentForm.addEventListener("submit", prepCommentForm);
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
            console.log("btn", btn)
            btn.addEventListener("click", startEditComment);
        }
    }
}


function prepCommentForm(event) {
    const commentForm = document.getElementById("comments-input");
    submitCommentForm(event, commentForm);
}


/**
 * Handles the confirmation of comment deletion. Displays modal, and adds event
 * listeners to close modal and/or delete comment.
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

    // Displays the confirmation modal
    openModal(modal);
    // Adds eventlistener to cancel buttons, to close modal and reset focus
    closeModalBtn.addEventListener('click', () => closeModal(modal, button));
    cancelModalBtn.addEventListener('click', () => closeModal(modal, button));

    // Add event listener to confirm delete btn, pass through named function to remove event listener
    function prepDeleteComment() {
        deleteComment(commentId);
        // close modal and remove event listener
        closeModal(modal);
        confirmDeleteBtn.removeEventListener('click', prepDeleteComment);
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

    // Switch out event listener on form button to use form for editing
    commentForm.removeEventListener("submit", prepCommentForm);
    commentForm.addEventListener("submit", prepEditForm);

    // Set forms textare to existing comment body text
    formTextArea.value = commentBody;

    // Change styles and content to reflect form in edit mode
    submitBtn.innerText = "Update";
    submitBtn.className = submitBtn.className.replace("submit-btn", "update-btn");
    commentForm.setAttribute("data-comment-id", commentId);
    formParagraph.innerHTML = 'You can now edit your comment:';
}


/**
 * Prepares and submits the comment form data to the server with an AJAX POST request.
 * Handles the response data.
 * 
 * @param {Event} submission of comment form while in submit mode (vs edit mode)
 * @param {HTMLFormElement} commentForm - The comment form element
 * @returns {void}
 */
function submitCommentForm(event, commentForm) {
    // Prevent default form submission behaviour
    event.preventDefault();

    // Prepare data to post
    const formData = new FormData(commentForm);
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // https://testdriven.io/blog/django-ajax-xhr/
    // Send a POST request to create a comment with the form data
    fetch(commentForm.action, {
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
            // Handle the response
            if (status === 200) {
                // If comment was created, call function to update frontend
                buildComment(data.data);
            } else {
                // handle not successful
            }
            // clear the form
            document.getElementById("id_body").value = "";
        });
};


function prepEditForm(event) {
    const commentForm = document.getElementById("comments-input");
    editCommentForm(event, commentForm);
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

    const divider = document.createElement("div");
    divider.className = "bg-brand-green h-line mx-auto my-3 d-none d-md-block";

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
                <button class="py-1 px-2 comment-edit me-1" aria-label="Edit comment" data-edit-comment-id="${data.comment_id}">Edit</button>
                <button class="py-1 px-2 comment-delete delete mx-1" aria-label="Edit comment" data-delete-comment-id="${data.comment_id}">Delete</button>
            </div>
        </div>`;

    // Attach the comment to the parentcontainer
    commentsList.prepend(commentContainer);
    commentsList.prepend(divider);

    // Add event listeners to the new comments buttons
    commentsList.querySelector(`[data-edit-comment-id="${data.comment_id}"]`).addEventListener("click", startEditComment);
    commentsList.querySelector(`[data-delete-comment-id="${data.comment_id}"]`).addEventListener("click", confirmCommentDeletion);
};


/**
 * Handles the request to delete a comment with AJAX using a DELETE request.
 * Creates the reuqest URL by attaching the commentId as a parameter to the forms
 * action url. Handles the request response, updating the frontend to reflect a 
 * successful deletion.
 * @param {string} commentId - the comments unique identifier
 * @returns {void}
 */
function deleteComment(commentId) {
    // Create the delete request URL
    const commentForm = document.getElementById("comments-input");
    const url = commentForm.action.slice(0, -1) + "?commentId=" + commentId;

    // Grab the csrf token
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // https://testdriven.io/blog/django-ajax-xhr/
    // Send a delete request to delete the comment
    fetch(url, {
            method: "DELETE",
            credentials: "same-origin",
            headers: {
                "X-Requested-With": "XMLHttpRequest",
                "X-CSRFToken": csrfToken,
            },
        })
        .then(response => response.status)
        .then((status) => {
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
        });
}