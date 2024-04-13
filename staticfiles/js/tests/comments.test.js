/* jshint esversion:8 */
/**
 * Test for the deleteComment, submitCommentForm, and editCommentForm functions.
 * 
 * Verifies the deleteComment function sends a DELETE request with the correct
 * URL and CSRF token. Mocks necessary dependencies, e.g. fetch, form, and
 * document. Checks that the function returns the expected data.
 * 
 * Verifies the submitCommentForm function sends a POST request with the correct
 * URL, CSRF token and body. Additionally mocks formData. Checks that the
 * function returns the expected data.
 * 
 * Verifies the editCommentForm function sends a PUT request with the correct
 * URL, CSRF token and body. Additionally mocks the body object data. Checks
 * that the function returns the expected data.
 */

const {
    JSDOM
} = require('jsdom');

// Mock form element with action and CSRF token.
const mockForm = `
<form id="comments-input" action="/delete-comment/" method="post">
<input type="hidden" name="csrfmiddlewaretoken" value="mock_csrf_token">
</form>
`;

// Create a mock window object with the form
const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body>${mockForm}</body></html>`);
global.document = dom.window.document;

// Import the deleteComment function
const {
    deleteComment,
    submitCommentForm,
    editCommentForm
} = require('../comments.js');

describe('deleteComment', () => {
    it('should send a DELETE request with the correct URL and CSRF token', async () => {
        // Mock fetch
        global.fetch = jest.fn().mockImplementation(() =>
            Promise.resolve({
                json: () => Promise.resolve({
                    success: true
                }),
                status: 200
            })
        );

        // Call the function
        const result = await deleteComment('comment123');

        // Check that fetch was made with the right arguments
        expect(fetch).toHaveBeenCalledWith('/delete-comment?commentId=comment123', {
            method: 'DELETE',
            credentials: 'same-origin',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRFToken': 'mock_csrf_token',
            },
        });

        // Check return is as expected
        expect(result).toEqual([{
            success: true
        }, 200, 'comment123']);
    });
});

describe('submitCommentForm', () => {
    it('should send a POST request with the correct URL and CSRF token', async () => {
        // Mock fetch
        global.fetch = jest.fn().mockImplementation(() =>
            Promise.resolve({
                json: () => Promise.resolve({
                    success: true
                }),
                status: 200
            })
        );

        // Mock FormData
        const mockFormData = new FormData();
        mockFormData.append('body', 'comment text');

        // Mock event object
        const mockEvent = {
            preventDefault: jest.fn()
        };

        // Mock comment form element
        const commentForm = {
            action: '/submit-comment/',
        };

        // Call the function
        const result = await submitCommentForm(mockEvent, commentForm, mockFormData);

        // Check that fetch was made with the correct arguments
        expect(fetch).toHaveBeenCalledWith('/submit-comment/', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRFToken': 'mock_csrf_token',
            },
            body: mockFormData
        });

        // Check return is as expected
        expect(result).toEqual([{
            success: true
        }, 200]);
    });
});

describe('editCommentForm', () => {
    it('should send a PUT request with the correct URL and CSRF token', async () => {
        // Mock fetch
        global.fetch = jest.fn().mockImplementation(() =>
            Promise.resolve({
                json: () => Promise.resolve({
                    success: true
                }),
                status: 200
            })
        );

        // Mock event object
        const mockEvent = {
            preventDefault: jest.fn()
        };

        // Mock form data and address
        const mockData = {
            /* mock comment data */
            body: 'Mock comment',
            commentId: '123'
        };
        const mockAddress = '/edit-comment/';

        // Call the function
        const result = await editCommentForm(mockEvent, mockData, mockAddress);

        // Check that fetch was made with the correct arguments
        expect(fetch).toHaveBeenCalledWith(mockAddress, {
            method: 'PUT',
            credentials: 'same-origin',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRFToken': 'mock_csrf_token',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(mockData)
        });

        // Check return is as expected
        expect(result).toEqual([{
            success: true
        }, 200]);
    });
});