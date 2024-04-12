/**
 * Test for the deleteComment function.
 * 
 * Verifies the function sends a DELETE request with the correct URL and CSRF
 * token. Mocks necessary dependencies, e.g. fetch, form, and document.
 * Checks that the function returns the expected data.
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
    deleteComment
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