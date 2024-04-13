# Testing

**Table of content**
- [Browser compatibility testing](#browser-compatibility)
- [Responsiveness testing](#responsiveness)
- [Manual testing](#manual-testing)
    - [Manual testing of core functionality](#manual-test-functionality)
    - [Manual testing of user stories](#user-story-testing)
- [Automated tests](#automated-tests)
    - [Django unit tests](#unittests)
    - [Jest tests for JavaScript](#jest-tests)
- [Lighthouse tests](#lighthouse)
- [Validation of HTML](#html-validation)
- [Validation of CSS](#css-validation)
- [Linting of Python code](#python-lint)
- [Linting of JavaScript code](#js-lint)

<a id="browser-compatibility"></a>
## Browser compatibility testing

To ensure cross-browser compatibility, the website was reviewed on Chrome, Safari, Microsoft Edge and Firefox.

Click on the links below to see screenshots of the website opened on different browsers:

<details>
<summary>Chrome</summary>
![Chrome screenshot](documentation/browser-chrome.png)
</details>

<details>
<summary>Safari</summary>
![Safari screenshot](documentation/browser-safari.png)
</details>

<details>
<summary>Microsoft Edge</summary>
![Microsoft Edge screenshot](documentation/browser-edge.png)
</details>

<details>
<summary>Firefox</summary>
![Firefox screenshot](documentation/browser-firefox.png)
</details>

<a id="responsiveness"></a>
## Responsiveness testing

<a id="manual-testing"></a>
## Manual testing

<a id="manual-test-functionality"></a>
### Manual testing of core functionality

<a id="user-story-testing"></a>
### Manual testing of user stories

<a id="automated-tests"></a>
## Automated tests

Due to time constraints, as well as limited experience with automated testing, not all scenarios are covered by these tests. The intention was rather that the automated tests may complement the manual testing of the project, and provide more robust testing as a whole.

<a id="unittests"></a>
### Django unit tests

<details> 
<summary>Click for details relating to Django unit tests</summary>

Unit tests were written to test the core functionality in all models and views of the project. These tests were written throughout the development of the project and were run as part of *pre-commit*, helping to continuously ensure code was working as intended, by stopping any commit that would lead to a failure of an existing test.

![Screenshot of pre-commit passing](documentation/pre-commit-pass.png)

The unit tests are placed in the *tests* directory within the *recipe_book* app and were split into separate files per view/model, to maintain better readability.

In brief, the tests focus on aspects such as:
- Ensuring duplicate entries cannot be created where there should be a uniqueness constraint (e.g. the same user should not be able to favourite a recipe twice, or there should not be two recipes with the same title).
- Ensuring an anonymous user cannot access functionality that should be restricted to logged-in users (e.g. posting a comment).
- Ensuring recipes, ratings and favourites *are* created/updated/deleted when requests are valid (e.g. user is authenticated, and values are of valid format).
- Ensuring that methods in general return expected values and status codes.

In total 54 tests were written:

![Screenshot of unit tests passing](documentation/unittests-pass.png)
</details>

<a id="jest-tests"></a>
### Jest tests for JavaScript

<details>
<summary>Click for details relating to Jest tests</summary>

Due mainly to time constraints, Jest tests were not prioritised throughout the development of the project. However, a few tests were added at the end of the development phase, focusing on testing the most crucial aspects of the JavaScript code. Specifically, the tests aim to test the JavaScript functions responsible for making POST, PUT, and DELETE requests to the backend.

The tests mock the required dependencies, call these functions and check that the fetch was made with the expected arguments, as well as that the response is as expected.

In total 12 tests were written, in 8 test suites.

![Jest tests passing](documentation/jest-pass.png)

These tests can be found in the *static*/*js*/*tests* directory. The tests are split into separate files, corresponding to the JavaScript file with the same name. E.g. tests relating to *comments.js* are in the file *comments.test.js*.

</details>

<a id="lighthouse"></a>
## Lighthouse tests

<a id="html-validation"></a>
## Validation of HTML

<a id="css-validation"></a>
## Validation of CSS

CSS was validated using [W3C's CSS Validation Service](https://jigsaw.w3.org/css-validator/validator).

<details>
<summary>Click to see CSS validation details</summary>

### Validating *style.css*

Validating the custom CSS by uploading the file *style.css* results in no errors.

![Validation style.css](documentation/css-validation-file.png)

The tool raises 11 warnings:
![Validation warnings style.css](documentation/css-validation-file-warnings.png)

The first warning just implies the tool does not access my Bootstrap CSS, as expected.

The remaining warnings relate to the use of vendor extensions. 
I am aware these may not be supported across all browsers. However, their application is not crucial to using the website. These vendor extensions are used for two purposes in the CSS file:
1. To truncate the title and teaser text in recipe cards. Without the truncation, the overflow is instead hidden. 
2. To increase the visibility of the heart buttons on the recipe cards. Given that these buttons are overlaid on top of an image, it was difficult to find a style that would stand out well on a multitude of backgrounds. If the *text-stroke* is not applied, the style is a simple white, which may be hard to see depending on the background image. However, the user can in this case reach the same functionality (favouriting the recipe) from the individual recipe's detail page.

### A note on validating the website by URL

When validating the website by URL, the tool raises errors, as well as a multitude of warnings. However, all errors and all errors except the ones mentioned above relate to Bootstrap.

Visiting Bootstrap's website, I found the following text, providing an explanation for these errors and warnings.

![Bootstrap validators](documentation/bootstrap-validators.png)

</details>

<a id="python-lint"></a>
## Linting of Python code

<a id="js-lint"></a>
## Linting of JavaScript code

All JS code was linted using [JSHint](https://jshint.com/) to ensure code validity.

Given that several JS files were used in the project, both Bootstrap and custom JS files, the files all contained undefined/unused variables. For example, there is a function `openModal()` in *script.js*, which is never called within *script.js*, but is called in most of the other JS files. So *openModal* was showing as an *unused variable* in *script.js* and an *undefined variable* in the other files.

After making sure that all undefined variables and unused variables were of this type, or a global type (e.g. *module*), I changed the JSHint configuration to not display warnings of this type before proceeding.

![JSHint unused variables](documentation/jshint-unused-variables.png)
![JSHint undefined variables](documentation/jshint-undefined-variables.png)

<details>
<summary>Click to see screenshots of linting results per file</summary>

- script.js
    ![script.js](documentation/jshint-script.png)

- favourites.js
    ![favourites.js](documentation/jshint-favourites.png)

- comments.js
    ![comments.js](documentation/jshint-comments.png)

- queries.js
    ![queries.js](documentation/jshint-queries.png)

- ratings.js
    ![ratings.js](documentation/jshint-ratings.png)

- script.test.js
    ![script.test.js](documentation/jshint-test-script.png)

- ratings.test.js
    ![ratings.test.js](documentation/jshint-test-ratings.png)

- queries.test.js
    ![queries.test.js](documentation/jshint-test-queries.png)

- comments.test.js
    ![comments.test.js](documentation/jshint-comments.png)

</details>



