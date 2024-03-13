from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse
from .models import Recipe, Favourite


# Create your tests here.
class TestRecipeBookViews(TestCase):

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
