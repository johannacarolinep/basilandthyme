/**
 * Test for the deleteRating function.
 * 
 * Verifies that the function sends a DELETE request with the correct URL and
 * CSRF token. Mocks necessary dependencies e.g. fetch and document.
 * Verifies that the function returns the expected data.
 */

const {
    JSDOM
} = require('jsdom');

// Mock a meta tag with a CSRF token
const metaTag = '<meta name="csrf-token" content="mock_csrf_token">';

// Create a mock window object with the meta tag
const dom = new JSDOM(`<!DOCTYPE html><html><head>${metaTag}</head><body></body></html>`);
global.document = dom.window.document;

// Import the deleteRating function
const {
    deleteRating
} = require('../ratings.js');

describe('deleteRating', () => {
    it('should send a DELETE request with the correct URL and CSRF token', async () => {
        // Mock fetch function
        global.fetch = jest.fn().mockImplementation(() =>
            Promise.resolve({
                json: () => Promise.resolve({
                    success: true
                }),
                status: 200
            })
        );

        // Call the function
        const result = await deleteRating('recipe123');

        // Check the fetch was made with the right arguments
        expect(fetch).toHaveBeenCalledWith('/delete-rating/?recipeId=recipe123', {
            method: 'DELETE',
            credentials: 'same-origin',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRFToken': 'mock_csrf_token',
            },
        });

        // Check the return is as expected
        expect(result).toEqual([{
            success: true
        }, 200, 'recipe123']);
    });
});