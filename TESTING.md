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

The website was reviewed with [Responsive Viewer](https://chromewebstore.google.com/detail/responsive-viewer/inmopeiepgfljkpkidclfgbgbmfcennb), to test responsiveness and ensure a good and consistent user experience across device types.

The review was documented in the PDFs below, split per reviewed page:
- [Home page](documentation/responsiveness/responsive-home.pdf)
- [Recipes page](documentation/responsiveness/responsive-recipes.pdf)
- [Recipe detail page](documentation/responsiveness/responsive-recipe-page.pdf)
- [Favourites page](documentation/responsiveness/responsive-favourites.pdf)
- [Sign up page](documentation/responsiveness/responsive-signup.pdf)
- [Sign in page](documentation/responsiveness/responsive-signin.pdf)
- [Sign out page](documentation/responsiveness/responsive-signout.pdf)


<a id="manual-testing"></a>
## Manual testing TBC

<a id="manual-test-functionality"></a>
### Manual testing of core functionality TBC

<a id="user-story-testing"></a>
### Manual testing of user stories WIP

#### Epic: *Navigation and structure*

<details>
<summary>Click for manual tests of user stories relating to Navigation and structure</summary>

| __User story__ | __Acceptance criteria__ | __Pass?__ | __Screenshot (if relevant)__ | __Comments__ |
| ------------- | -----------| -------------------- | :-------: | ------------ |
| As a **Site User**, I can always see the main navigation options on the top of the page so that I can easily and intuitively find my way around the website. | 1. Given a user is not logged in, at the top of the page, the user can see the options of “home”, “register”, “log in”, and “favourites”. <br> 2. Given the user is logged in, the options showing are instead “home”, “log out”, and “favourites”. <br> 3. These options are visible and reachable from all pages on the website. <br> 4. The options have a hover effect to provide instant feedback to the user when navigating the site. | Y | ![Navigation logged in](documentation/story-testing/nav-authenticated.png) <br> ![Navigation logged out](documentation/story-testing/nav-anonymous.png) <br> ![Navigation hover on favourites](documentation/story-testing/nav-hover.png) | Main navigation is global. <br><br> The page "Recipes" was part of the initial plan for the site, but was accidentially left out from the user story  |
| As a **Site User** I can see an **informative 404 page guiding me back to the main page** if I visit a page that does not exist by mistake so that I can easily get back to the home page with minimal disruption. | 1. Given a user visits a page on the website that does not exist, they are served a custom 404 page. <br> 2. The 404 page contains a link back to the home page. | Y | ![404 page](documentation/story-testing/page-not-found.png) | - |
| As a **Site User** I can see the website's favicon so that I can easily find the website if I have multiple tabs open. | 1. The site has a favicon, adhering to the website design and colour scheme | Y | ![Website favicon](documentation/story-testing/favicon.png) | - |

</details>

#### Epic: *Account/Login*

<details>
<summary>Click for manual tests of user stories relating to Account/Login</summary>

| __User story__ | __Acceptance criteria__ | __Pass?__ | __Screenshot (if relevant)__ | __Comments__ |
| ------------- | -----------| -------------------- | :-------: | ------------ |
| As a **Site User** I can register an account with **email and password** so that I can **comment on, rate, and save recipes.** *Edit: email not mandatory* | 1. Given an email, a user can register an account. *Edit: email not mandatory* | Y | ![Sign up form](documentation/story-testing/signup.png) | Can sign up with username and password |
| As a **Site User** I can see **clear instructions, get feedback, and confirmation when trying to register an account with email** so that I can sign up without unnecessary problems and enjoy the experience. | 1. The sign-up page form includes clear instructions. <br> 2. Given the user submits the sign-up form, the user is given confirmation on whether the sign-up was successful. | Y | ![Form instructions](documentation/story-testing/signup-instructions.png) <br> ![Form feedback](documentation/story-testing/signup-feedback.png) ![Banner pre sign-up](documentation/story-testing/banner-pre-signup.png) <br> ![Banner post sign-up](documentation/story-testing/banner-post-signup.png) | The sign-up form contains instructions and feedback. <br><br> After sign-up/sign-in the user is redirected to the home page. The banner reflects the user is now signed in. |
| As a **Site User** with an account I can **log in** so that I can **comment on, rate, and save recipes.** | 1. Given a registered email a user can log in. *Edit: email not manadatory* | Y | ![Sign-in form](documentation/story-testing/signin.png) | - |
| As a **Logged-in User** I can log out so that I can feel safe in that others cannot access my credentials. | 1. Given a user is logged in, the user can click on “Log out” to log out. <br> 2. Then the logged-out status is reflected to the user on the page | Y | ![Sign out](documentation/story-testing/signout.png) <br> ![Banner after log out](documentation/story-testing/banner-pre-signup.png) | User can log out on Sign out page. <br><br>User is redirected to the home page, where the banner reflects logged out status |

</details>

#### Epic: *View recipes*
<details>
<summary>Click for manual tests of user stories relating to View recipes</summary>

| __User story__ | __Acceptance criteria__ | __Pass?__ | __Screenshot (if relevant)__ | __Comments__ |
| ------------- | -----------| -------------------- | :-------: | ------------ |
| As a **Site User** I can see the highest rated and latest added recipes featured on the main page so that I can get inspired and get an engaging introduction to the site. | 1. When a user opens the main page, sections displaying the highest rated recipes and latest added recipes are showing.<br> 2. Then the user can click on “See more” to see a list of all recipes sorted by rating and publication date respectively. | Y | ![Featured recipes on home page](documentation/story-testing/featured-recipes.png) | *Note* Clicking "See all" will open recipes page with all recipes. However, the user will need to use the sort button to sort by highest rating |
| As a **Site User** I can search or click on a category so that I can find recipes matching my criteria. | 1. When a user opens the main page, a search bar, as well as pre selected categories/featured categories show. <br> 2. When a user either searches or clicks on a category a list of recipes is seen, matching the user's criteria. | Y | ![Search bar on home page](documentation/story-testing/search-bar.png) <br> ![Showing category results](documentation/story-testing/category-results.png) | Search results open on Recipes page |
| As a **Site User** I can see a paginated list of recipes so that I can select which recipe I want to view. | 1. Given more than one recipe in the database matching the users criteria, these multiple recipes are listed.<br> 2. When a user searches or clicks on a category a list of recipes is seen.<br> 3. Given the number of recipes in the list is larger than 8, the list is paginated. | Y | ![All recipes showing](documentation/story-testing/all-recipes-default.png) <br> ![Results on recipes page](documentation/story-testing/category-results.png) <br> ![Pagination when 8+ results](documentation/story-testing/pagination.png) | By default the *Recipes* page displays all recipes. <br><br> The displayed recipes correspond to the user's search query. <br><br> Pagination is present when results are more than 8 |
| As a **Site User** I can sort the recipes in a list view so that I can more easily find the recipes I am looking for. | 1. When on a list view the user can sort the list based on rating and publication date. | Y | ![Sorting](documentation/story-testing/sort.png) | - |
| As a **Site User** I can click on a recipe card so that I can read the recipe | 1. When a recipe title is clicked the detailed view of the recipe is seen. | Y | ![Clicking card title](documentation/story-testing/clicking-card-title.png) <br> ![Corresponding recipe page opening](documentation/story-testing/open-corresponding-page.png) | Clicking on a recipe card title, e.g. "Seafood pasta" opens the corresponding recipe page |

</details>

#### Epic: *Commenting*
<details>
<summary>Click for manual tests of user stories relating to Commenting</summary>

| __User story__ | __Acceptance criteria__ | __Pass?__ | __Screenshot (if relevant)__ | __Comments__ |
| ------------- | -----------| -------------------- | :-------: | ------------ |
| As a **Logged in User** I can write comments on recipes so that I can provide feedback and share my experience with other users. | 1. Given a user is logged in, they can leave a comment on the recipe detail page. <br> 2. Then, the user is notified the comment is posted.<br> 3. Then, the comment is visible for all users.| Y | ![Comment form](documentation/story-testing/comments-form.png) <br> ![Toast: comment posted](documentation/story-testing/comments-toast-posted.png) <br> ![Comment posted](documentation/story-testing/comment-posted.png) | The comment form displays for a logged in user. <br> When the user successfully submits a comment, a toast message is displayed. <br> The comment is published at the top of the comments list. |
| As a **Logged in User** I can **modify or delete** my comment on a recipe so that I can be in control over my contribution to the conversation.| 1. Given a logged in user, they can modify their own comment <br> 2. Given a logged in user, they can delete their own comment <br> 3. Then the user is notified of successful modification/deletion | Y | ![Comment buttons](documentation/story-testing/comment-btns.png) <br> ![Edit form](documentation/story-testing/comment-edit-form.png)<br> ![Toast: edited comment](documentation/story-testing/comment-toast-edited.png) <br> ![Edited comment](documentation/story-testing/comment-edited.png) <br> ![Confirming deletion](documentation/story-testing/comment-delete-confirm.png)<br> ![Toast: deleted](documentation/story-testing/comment-toast-deleted.png)<br>![Comment deleted](documentation/story-testing/comment-deleted.png) | Edit and delete buttons show for comment author. <br><br> Clicking the edit button, the form will update for editing the comment. <br><br>Upon editing the comment, a toast message is displayed, and the comment is updated. A paragraph is added to confirm to user. <br><br> Clicking the delete button, the user is asked to confirm. When confirmed, a toast message is displayed. The comment is switched out to a paragraph confirming deletion. |
| As a **Site Admin** I can **disapprove comments** so that I can hide controversial comments. | 1. Given a logged in admin user, they can disapprove a comment <br> 2. Then, the comment is no longer showing for users except for the comment author, for whom the comment is faded out <br> 3. Then the admin user can choose to reverse the disapproval if they choose to. | Y | ![Admin disapproving comment](documentation/story-testing/comments-disapproving.png)<br>![Disapproved comment](documentation/story-testing/comments-disapproved.png)<br>![Disapproved comment not showing](documentation/story-testing/comments-disapproved-not-showing.png) | Superusers can approve and disapprove comments in the Django Admin Panel. <br><br> Disapproved comments show when the user is the comment author.<br><br> Disapproved comments are not visible for other users. |

</details>

#### Epic: *Favourites*
<details>
<summary>Click for manual tests of user stories relating to Favourites</summary>

### Epic: Favourites
| __User story__ | __Acceptance criteria__ | __Pass?__ | __Screenshot (if relevant)__ | __Comments__ |
| ------------- | -----------| -------------------- | :-------: | ------------ |
| As a **Logged in User** I can **favourite and unfavourite recipes** so that I can save or remove recipes from my favourites easily. | 1. Given a logged in user, they can click the heart button on a recipe card or the recipe details page to save a recipe to their favourites.<br> 2. Given a logged in user, they can click the heart button of a previously favourited recipe to unsave it from their favourites.| Y | ![Add to favourites on recipe card](documentation/story-testing/fave-add-recipes.png)<br> ![Remove favourite on recipe card](documentation/story-testing/fave-remove-recipes.png)<br> ![Add favourite on recipe page](documentation/story-testing/fave-recipe-page-add.png)<br>![Remove favourite on recipe page](documentation/story-testing/fave-recipe-page-remove.png) | - |
| As a **Logged in User** I can see my favourite recipes on the favourites page so that I can **easily access my favourite recipes** when I need them. |  1. When visiting the favourites page as a logged-in user, the user can view their saved recipes.<br> 2. If the user has not saved any recipes, they instead see an informative message explaining the "Favourites" functionality.<br> 3. If a user who is not logged in visits the favourites page, they are informed of the functionality and prompted to sign up or log in to use it. | Y | ![Favourites page with recipes](documentation/story-testing/fave-recipes.png) <br> ![Favourites page with no favourites](documentation/story-testing/fave-no-recipes.png) <br> ![Favourites page not logged in](documentation/story-testing/fave-anonymous.png) | - |
| As a **Logged in User** I can see the status of favouriting (favourited or not) for all recipe cards and detail pages so that I can know which recipes I have favourited without visiting the favourites page.| 1. Given a logged in user, the heart button on recipe cards and recipe detail pages are visually distinct to indicate whether the recipe is already saved.<br> 2. Given a non-logged-in user, the heart button on all recipe cards and recipe detail pages indicate the recipe is not saved. | Y | ![Cards favourite vs not favourite](documentation/story-testing/fave-cards-status.png) | Hearts are filled in when recipe is favourited, and otherwise not filled in. |
| As a **Non-Logged in User**, I can get informed to sign up or log in when trying to favourite a recipe so that I can **understand how to access the functionality.** | 1. Given a non-logged-in user, they can see the heart for favouriting recipes on the recipe cards and detail pages, so that they can be aware of the functionality.<br> 2. Then, if a non-logged-in user tries to favourite a recipe by clicking on the heart, they are prompted to sign up or log in. | Y | ![Sign up modal](documentation/story-testing/fave-sign-in-modal.png) | Clicking a heart while not signed in triggers the modal. |

</details>

#### Epic: *Rating*
<details>
<summary>Click for manual tests of user stories relating to Rating</summary>

| __User story__ | __Acceptance criteria__ | __Pass?__ | __Screenshot (if relevant)__ | __Comments__ |
| ------------- | -----------| -------------------- | :-------: | ------------ |
| As a **Site User** I can see the average rating a recipe has received so that I can get an understanding of the recipe's quality. | 1. For each recipe, in the recipe details view and the card view, the recipe's average rating is displayed. | Y | ![Ratings displayed on card](documentation/story-testing/rate-stars-card.png)<br> ![Ratings displayed on recipe page](documentation/story-testing/rate-stars-page.png) | The recipe's average rating is displayed visually by the stars. The number next to the stars is the number of the ratings the recipe has received. |
| As a **Logged in User** I can rate a recipe so that I can provide feedback on recipes in a low effort way. | 1. Given a user is logged in, they can click on one of five stars on any recipe detail page in order to give a rating of 1-5. <br> 2. Then, the user is notified of the rating they have given.<br> 3. Clicking on a rating a second time removes the rating.<br> 4. Then the user is notified the rating has been removed. | Y | ![Ratings modal with no existing rating](documentation/story-testing/rate-modal-no-rating.png)<br> ![Ratings modal with existing rating](documentation/story-testing/rate-modal-existing.png)<br> ![Toast displayed](documentation/story-testing/rate-toast.png) | Pass, with slight edit: Instead of adding/removing ratings when clicking one of the stars on the card/recipe page, a modal was added as a middle step, to make the ratings process more clear for the user. <br><br>The ratings display will show if the user has previously rated the recipe. In this case, the user has the additional option to delete the rating. Submitting a new rating will overwrite the existing one. <br><br> A toast message is displayed to confirm addition/update/removal of a rating. |

</details>

#### Epic: *Publishing recipes*
<details>
<summary>Click for manual tests of user stories relating to Publishing recipes</summary>

| __User story__ | __Acceptance criteria__ | __Pass?__ | __Screenshot (if relevant)__ | __Comments__ |
| ------------- | -----------| -------------------- | :-------: | ------------ |
| As a **Site Admin** I can **create** draft recipes so that I can finish writing the content later. | 1. Given a logged in admin user, they can save a draft recipe <br>2. Then they can finish the content at a later time | Y | ![Save as draft](documentation/story-testing/recipe-draft.png)<br>![Draft no published](documentation/story-testing/recipe-draft-not-visible.png) | Superusers can save recipes as drafts in the Django Admin Panel. When saved as drafts the recipes are not included on the website. |
| As a **Site Admin** I can **create, read, update and delete** recipes so that I can manage my site content | 1. Given a logged in admin user, they can create a recipe <br> 2. Given a logged in admin user, they can edit a recipe <br> 3. Given a logged in admin user, they can update a recipe <br> 4. Given a logged in admin user, they can delete a recipe | Y | - | Superusers can create, edit and delete recipes in the Django Admin Panel. |
| As a **Super user** I can rely on the field validation, as well as see clear instructions in the admin view so that I can trust in that the content I am publishing will be valid.| 1. All model fields have appropriate attributes <br> 2. The admin view provides explicit and helpful instructions where necessary | Partial | ![Field validation - required](documentation/story-testing/recipe-field-required.png)<br> ![Field validation - min length](documentation/story-testing/recipe-field-min-length.png)<br> ![Admin instructions](documentation/story-testing/recipe-sections.png) | Efforts were made to include appropriate field validation for all fields in the models.<br><br>Actions were taken to make the admin panel more user friendly for creating recipes. Fields were dividied into fieldsets, and instructions were added to some fields and fieldsets. |

</details>

#### Epic: *Accessibility*

<details>
<summary>Click for manual tests of user stories relating to Accessibility</summary>

| __User story__ | __Acceptance criteria__ | __Pass?__ | __Screenshot (if relevant)__ | __Comments__ |
| ------------- | -----------| -------------------- | :-------: | ------------ |
| As a **Site User** utilizing a screen reader I can listen to descriptive text representing any visual element on the website so that I can be included, navigate on the website, access the content, and use all core functionality. | 1. All images have an alt-text. <br> 2. All links have either a descriptive link text or an ARIA-label <br> 3. All buttons consisting of icons have an ARIA-label and the icon is hidden for screen readers. <br> 4.  All information communicated by a visual element on the site have a text alternative, so that screen reader users can take part of the information. <br> 5. Semantic HTML elements have been used where suitable, in order to further enable screen reader users to consume the website content. | Y | - | - | 
| As a Site User not able to utilise a mouse I can **focus on and access all interactive elements on the website using a keyboard** so that I can be included, navigate on the website, access the content, and use all core functionality. | 1. All interactive elements, such as buttons, form fields, and navigation, are accessible using a keyboard alone, without relying on mouse interactions. | Y | - | Tested the following actions without using a mouse: open an account, search for recipes, add a recipe to favourites, leave a rating, leave a comment, delete a comment. | 

</details>


#### *Miscellaneous*: User stories not belonging to a specific epic
<details>
<summary>Click for manual tests of miscellanous user stories</summary>

| __User story__ | __Acceptance criteria__ | __Pass?__ | __Screenshot (if relevant)__ | __Comments__ |
| ------------- | -----------| -------------------- | :-------: | ------------ |
| As a **Site User** finding the website through a search engine I can read a descriptive search result so that I can understand if the result is relevant to me. | 1. All pages have a meta description and keywords <br> 2. All pages have a title | Y | - | All pages have a title. All pages that should be searchable have a meta description and keywords (e.g. the 404 page does not have meta keywords). |
|  As a **Site User** I can observe consistent styling, structure and interaction design across all pages on the website so that I can have a pleasant experience with the website. | 1. The website adhers to the colour scheme, font choices and other design choices outlined in the README. <br> 2. All interactive elements provide a reaction when interacted with. | Y | - | Efforts were made to adher to the style guidelines set at the beginning of the project, in terms of colours and fonts. In general efforts were made to use styles relatively consistently across pages.<br><br>All interactive elements provide some form of instant visual feedback. |

</details>


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

The website's different pages were tested using Lighthouse, to ensure performance and accessibility.

<details>
<summary>Click to see screenshots of test results on mobile</summary>

- Home page
    ![Home page results](documentation/lighthouse/lighthouse-mobile-home.png)

- Recipes page
    ![Recipes page results](documentation/lighthouse/lighthouse-mobile-recipes.png)

- Recipe detail page (example)
    ![Recipe detail page results](documentation/lighthouse/lighthouse-mobile-recipe-page.png)

- Favourites page
    ![Favourites page results](documentation/lighthouse/lighthouse-mobile-favourites.png)

- Sign up page
    ![Sign up page results](documentation/lighthouse/lighthouse-mobile-signup.png)

- Sign out page
    ![Sign out page results](documentation/lighthouse/lighthouse-mobile-signout.png)

- Sign in page
    ![Sign in page results](documentation/lighthouse/lighthouse-mobile-signin.png)

</details>

<details>
<summary>Click to see screenshots of test results on desktop</summary>

- Home page
    ![Home page results](documentation/lighthouse/lighthouse-desktop-home.png)

- Recipes page
    ![Recipes page results](documentation/lighthouse/lighthouse-desktop-recipes.png)

- Recipe detail page (example)
    ![Recipe detail page results](documentation/lighthouse/lighthouse-desktop-recipe-page.png)

- Favourites page
    ![Favourites page results](documentation/lighthouse/lighthouse-desktop-favourites.png)

- Sign up page
    ![Sign up page results](documentation/lighthouse/lighthouse-desktop-signup.png)

- Sign out page
    ![Sign out page results](documentation/lighthouse/lighthouse-desktop-signout.png)

- Sign in page
    ![Sign in page results](documentation/lighthouse/lighthouse-desktop-signin.png)

</details>

### Performance optimisation
I initially had a lower performance score, mainly due to LCP (Largest Contentful Paint) and FCP (First Contentful Paint). These issues appeared when testing the deployed version of the website, while scores were high when testing in the local environment.

I implemented the following optimisations to improve the score, including:
- Lazy loading of images that would not appear above the fold
- Deferring non-critical resources
- Using Cloudinary for all of my images (previously I had only used Cloudinary to store the images belonging to the recipes).

After taking these actions, the highest impact suggestion raised by the Lighthouse report was to preload my LCP image.

![Lighthouse suggesting preload](documentation/lighthouse/lighthouse-preload.png)

Testing this resulted in a significantly higher score. However, I would sometimes get a warning in the console, about preloading a resource and then not using it within the first few seconds.

Reading up on this warning, I came to the understanding it might be appearing in situations when the browser has cached the image, in which case the preload is unnecessary.

Given that the score was significantly higher with the preload, and the warning seemingly explained by the possibility of the image being cached, I decided to keep preloading the image.


<a id="html-validation"></a>
## Validation of HTML

All pages were validated using W3C's Markup Validation Service, with no errors or warnings.

<details>
<summary>Click for screenshots of validation results per page</summary>

- Home page (index.html)
    ![HTML validation - home page](documentation/html-validation/html-validate-index.png)

- Recipes page (with results)
    ![HTML validation - recipes page](documentation/html-validation/html-validate-recipes.png)

- Recipes page (with no results)
    ![HTML validation - recipes page with no results](documentation/html-validation/html-validate-recipes-no-results.png)

- Favourites page (while not logged in)
    ![HTML validation - favourites page](documentation/html-validation/html-validate-favourites.png)

- Recipe page - Chicken yellow curry
    ![HTML validation - chicken yellow curry](documentation/html-validation/html-validate-recipe-page-chicken-curry.png)

- Recipe page - Seafood pasta
    ![HTML validation - seafood pasta](documentation/html-validation/html-validate-recipe-page-seafood-pasta.png)

- Sign-up page
    ![HTML validation - Sign-up page](documentation/html-validation/html-validate-signup.png)

- Sign-in page
    ![HTML validation - Sign-in page](documentation/html-validation/html-validate-login.png)

In addition to the above, the following were validated by copying the entirety of the page source code, and validating by direct input:
- The log-out page (/account/logout/)
- The favourites page while logged in, with no recipes favourited
- The favourites page while logged in, with recipes favourited
- A recipe detail page, while logged in, with comments posted
- The 404 and 500 pages

</details>

*Note*
All HTML code validated with no error or warnings. On pages that contain recipe cards, the tool did raise an "Info"-type message. The recipe cards utilize a Cloudinary tag to insert the images. This allows for using Cloudinary features such as automatically optimizing image quality. However, it seems the *img* tags that get inserted as a result contain a trailing "/". Since this cannot be easily changed, without losing the optimisation feature, and since the messages are of the type "info" rather than "warning", I will not take action to change this.


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

All Python code was linted using Code Institute's [CI Python Linter](https://pep8ci.herokuapp.com/) with no errors or warnings.

Screenshots of the results per file can be found in this [pdf](documentation/linting-results.pdf).

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



