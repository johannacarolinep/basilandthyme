/**
 * @jest-environment jsdom
 */

const {
    updateOrAppendQueryParam
} = require('../queries');

/**
 * Test suite for the updateOrAppendQueryParam function.
 * 
 * Tests the behavior of the updateOrAppendQueryParam function, which is
 * responsible for adding/updating query parameters to the URL (used for
 * searching and sorting recipes)..
 * 
 * The function should update an existing query parameter if is already in the
 * URL, or add it if it isn't.
 */
describe('updateOrAppendQueryParam', () => {
    beforeEach(() => {
        // Mock URL
        delete window.location;
        window.location = new URL('https://test.com');
    });

    afterEach(() => {
        // Restore mock URL
        delete window.location;
        window.location = new URL('https://test.com');
    });

    it('should update or append the query parameter', () => {
        // First, URL has no query parameters
        expect(window.location.searchParams.has('param1')).toBeFalsy();
        expect(window.location.searchParams.has('param2')).toBeFalsy();

        // Call the function with parameters to be added
        updateOrAppendQueryParam('param1', 'value1');
        updateOrAppendQueryParam('param2', 'value2');

        // checks if the query parameters are updated or appended correctly
        expect(window.location.searchParams.has('param1')).toBeTruthy();
        expect(window.location.searchParams.get('param1')).toEqual('value1');
        expect(window.location.searchParams.has('param2')).toBeTruthy();
        expect(window.location.searchParams.get('param2')).toEqual('value2');
    });
});