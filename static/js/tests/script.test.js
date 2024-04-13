/* jshint esversion:8 */
/**
 * Test for the sendPostRequest function.
 * 
 * Verifies that the sendPostRequest function sends a POST request with the
 * CSRF token from the HTML head. It mocks the fetch function to simulate a
 * successful response, and checks that the featch is made with the right URL,
 * method, headers, and body. Checks that the returned data is as expected.
 */

const {
    JSDOM
} = require('jsdom');

// Mock meta tag with CSRF token
const metaTag = '<meta name="csrf-token" content="mock_csrf_token">';

// Mock the window object with the meta tag in the head
const dom = new JSDOM(`<!DOCTYPE html><html><head>${metaTag}</head><body></body></html>`);
global.document = dom.window.document;

// Import the sendPostRequest function
const {
    sendPostRequest
} = require('../script.js');

describe('sendPostRequest', () => {
    it('should send a POST request with CSRF token', async () => {
        // Mock the fetch
        global.fetch = jest.fn().mockImplementation(() =>
            Promise.resolve({
                json: () => Promise.resolve({
                    success: true
                }),
                status: 200
            })
        );

        // Call the function
        const response = await sendPostRequest('https://example.com/api', {
            data: 'example'
        });

        // Check that the fetch was made with the correct arguments
        expect(fetch).toHaveBeenCalledWith('https://example.com/api', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;',
                'X-CSRFToken': 'mock_csrf_token'
            },
            body: JSON.stringify({
                data: 'example'
            })
        });

        // Check the response is as expected
        expect(response).toEqual({
            success: true,
            status: 200
        });
    });
});