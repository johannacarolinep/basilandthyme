import json
from django.contrib.auth.models import User
from django.test import TestCase, Client
from django.urls import reverse
from .models import Recipe, Favourite, Comment


# Create your tests here.
class TestRecipeDetailView(TestCase):

    def setUp(self):
        """
        Set up test mock data including a mock user, recipe, and favorite.
        """
        # Create a mock user
        self.user = User.objects.create_user(
            username="testuser", email="test@test.com", password="testpassword"
        )
        self.client.login(username="testuser", password="testpassword")

        # Create a mock recipe
        self.recipe = Recipe.objects.create(
            title="Test Recipe",
            author=self.user,
            slug="test-recipe",
            content="Test Recipe Content",
            status=1,
        )

        # Create a favourite for the mock user
        self.favourite = Favourite.objects.create(
            user=self.user, recipe=self.recipe)

    def test_render_recipe_detail_page_with_invalid_slug(self):
        """
        Test rendering a recipe detail page with an invalid slug.
        """
        response = self.client.get(reverse(
            'recipe_detail', kwargs={'slug': 'non-existing-slug'}))
        self.assertEqual(
            response.status_code, 404, msg="Status code is not 404")

    def test_render_recipe_detail_page_when_not_logged_in(self):
        """
        Test rendering a recipe detail page when the user is not logged in.
        """
        self.client.logout()  # log out mock user
        response = self.client.get(reverse(
            'recipe_detail', kwargs={'slug': 'test-recipe'}))
        self.assertEqual(
            response.status_code, 200, msg="Status code is not 200")
        # Assert that 'is_favourite' is False since user is not logged in
        self.assertFalse(
            response.context['is_favourite'], msg="Recipe is favourite")

    def test_render_recipe_detail_page_with_favourite(self):
        """
        Test rendering a recipe detail page when the recipe is favourited by
        the logged in user.
        """
        response = self.client.get(reverse(
            'recipe_detail', kwargs={'slug': 'test-recipe'}))
        self.assertEqual(
            response.status_code, 200, msg="Status code is not 200")
        self.assertTemplateUsed(response, 'recipe_book/recipe-page.html')
        self.assertEqual(
            response.context['recipe'].title, 'Test Recipe', msg="Wrong title")
        self.assertEqual(
            response.context['is_favourite'], True, msg="Should be favourite")

    def test_render_recipe_detail_page_with_nonfavourited_recipe(self):
        """
        Test rendering a recipe detail page when the recipe is not favorited
        by the logged in user.
        """
        # Remove the favourite for the user
        self.favourite.delete()
        response = self.client.get(reverse(
            'recipe_detail', kwargs={'slug': 'test-recipe'}))
        self.assertEqual(
            response.status_code, 200, msg="Status code is not 200")
        # Assert that 'is_favourite' is False since recipe is not favourited
        self.assertFalse(
            response.context['is_favourite'], msg="Incorrectly favourited")

    def test_post_valid_comment(self):
        """
        Test posting a valid comment. Check that status code is 200 and that
        comment exists after posting.
        """
        # Create valid url and data to post
        url = reverse('recipe_detail', kwargs={'slug': self.recipe.slug})
        data = {'body': 'Test comment'}
        response = self.client.post(url, data)
        self.assertEqual(
            response.status_code, 200,
            msg="Status code not 200 in spite of valid post data for comment")
        self.assertTrue(
            Comment.objects.filter(body='Test comment').exists(),
            msg="Comment does not exist in spite of valid post")

    def test_post_comment_not_authenticated(self):
        """
        Test posting a comment while not logged in. Ensure comment is not
        created.
        """
        self.client.logout()
        # Create valid url and data to post
        url = reverse('recipe_detail', kwargs={'slug': self.recipe.slug})
        data = {'body': 'Test comment'}
        response = self.client.post(url, data)
        self.assertEqual(
            response.status_code, 401,
            msg="Status code should be 401, unauthorized")
        self.assertFalse(
            Comment.objects.filter(body='Test comment').exists(),
            msg="Comment created while not logged in")

    def test_post_invalid_comment(self):
        """
        Test posting a comment with empty string as body. Ensure comment is not
        created.
        """
        # Create valid url but invalid data to post (empty comment)
        url = reverse('recipe_detail', kwargs={'slug': self.recipe.slug})
        data = {'body': ''}
        response = self.client.post(url, data)
        self.assertEqual(
            response.status_code, 400,
            msg="Status code should be 400, bad request, for empty comment")
        self.assertFalse(
            Comment.objects.filter(body='').exists(),
            msg="Empty string comment created")

    def test_put_valid_edit_of_comment(self):
        """
        Test making a valid edit of a comment. Check that status code is 200
        and that comment is updated after editing.
        """
        # Create a comment to edit
        comment = Comment.objects.create(
            body='Test comment', author=self.user, recipe=self.recipe)
        url = reverse('recipe_detail', kwargs={'slug': self.recipe.slug})
        data = {'commentId': comment.id, 'body': 'Updated comment'}
        response = self.client.put(
            url, json.dumps(data), content_type='application/json')
        self.assertEqual(
            response.status_code, 200,
            msg="Status code not 200 in spite of valid edit request")
        comment.refresh_from_db()
        self.assertEqual(comment.body, 'Updated comment')

    def test_put_invalid_edit_of_comment(self):
        """
        Test making an invalid edit of a comment. Check that status code is
        400.
        """
        # Create a comment to edit
        comment = Comment.objects.create(
            body='Test comment', author=self.user, recipe=self.recipe)
        url = reverse('recipe_detail', kwargs={'slug': self.recipe.slug})
        data = {'commentId': comment.id, 'body': comment.body}
        response = self.client.put(
            url, json.dumps(data), content_type='application/json')
        self.assertEqual(
            response.status_code, 400,
            msg="Status code not 400 in spite of invalid edit request")

    def test_delete_comment(self):
        """
        Test deleting a comment through delete request. Check that status code
        is 200, and comment does not exist after deletion.
        """
        comment = Comment.objects.create(
            body='Test comment', author=self.user, recipe=self.recipe)
        base_url = reverse('recipe_detail', kwargs={'slug': self.recipe.slug})
        url = f"{base_url}?commentId={comment.id}"
        response = self.client.delete(url)
        self.assertEqual(
            response.status_code, 200,
            msg="Status not 200 inspite of valid delete request")
        self.assertFalse(
            Comment.objects.filter(body='Test comment').exists(),
            msg="Comment exists when it should be deleted")

    def test_delete_nonexistent_comment(self):
        """
        Test delete request for a nonexistent comment id. Check that status
        code is 400.
        """
        fake_comment_id = "10000"
        base_url = reverse('recipe_detail', kwargs={'slug': self.recipe.slug})
        url = f"{base_url}?commentId={fake_comment_id}"
        response = self.client.delete(url)
        self.assertEqual(
            response.status_code, 400,
            msg="Status not 400 inspite of invalid delete request")
