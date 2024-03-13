from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse
from .models import Recipe, Favourite


# Create your tests here.
class TestRecipeListView(TestCase):

    def setUp(self):
        """
        Set up test mock data including a mock user, recipe, and favorites.
        """
        # Create a mock user
        self.user = User.objects.create_user(
            username="testuser", email="test@test.com", password="testpassword"
        )
        self.client.login(username="testuser", password="testpassword")

        # Create mock recipes
        self.recipe1 = Recipe.objects.create(
            title="Test Recipe 1",
            author=self.user,
            slug="test-recipe-1",
            content="Test Recipe 1 Content",
            status=1,
            category=1  # category "chicken"
        )
        self.recipe2 = Recipe.objects.create(
            title="Test Recipe 2",
            author=self.user,
            slug="test-recipe-2",
            content="Test Recipe 2 Content",
            status=1,
            category=2  # category "pork"
        )

        # Create a favourite for the mock user
        self.favourite1 = Favourite.objects.create(
            user=self.user, recipe=self.recipe1)
        self.favourite2 = Favourite.objects.create(
            user=self.user, recipe=self.recipe2)

    def test_render_recipe_list_page(self):
        """
        Test rendering the recipe list page.
        """
        response = self.client.get(reverse('recipe_list_page'))
        self.assertEqual(response.status_code, 200, msg="Status code not 200")
        self.assertTemplateUsed(response, 'recipe_book/recipes.html')
        self.assertIn(
            "Test Recipe 1",
            response.content.decode(),
            msg="Recipe title 1 not on the page")
        self.assertIn(
            "Test Recipe 2",
            response.content.decode(),
            msg="Recipe title 2 not on the page")

    def test_render_recipe_list_page_with_search_query(self):
        """
        Test rendering the recipe list page with a search query for which there
        is a matching result.
        """
        response = self.client.get(
            reverse('recipe_list_page'), {'q': 'Test Recipe 1'})
        self.assertEqual(response.status_code, 200, msg="Status code not 200")
        self.assertTemplateUsed(response, 'recipe_book/recipes.html')
        self.assertIn(
            b"Test Recipe 1",
            response.content,
            msg="Correct result not on the page")
        self.assertNotIn(
            b"Test Recipe 2",
            response.content,
            msg="Incorrect result is on page")

    def test_render_recipe_list_page_with_no_result(self):
        """
        Test rendering the recipe list page with a search query for which there
        is no matching result.
        """
        response = self.client.get(
            reverse('recipe_list_page'), {'q': 'not-existing'})
        self.assertEqual(response.status_code, 200, msg="Status code not 200")
        self.assertTemplateUsed(response, 'recipe_book/recipes.html')
        self.assertIn(
            b"Sorry, no results",
            response.content,
            msg="Correct result not on the page")
        self.assertNotIn(
            b"Test Recipe 1",
            response.content,
            msg="Incorrect result is on page")

    def test_render_recipe_list_page_with_category_search(self):
        """
        Test rendering the recipe list page with a category search result.
        """
        response = self.client.get(
            reverse('recipe_list_page'), {'q': 'chicken'})
        self.assertEqual(response.status_code, 200, msg="Status code not 200")
        self.assertTemplateUsed(response, 'recipe_book/recipes.html')
        self.assertIn(b"Test Recipe 1", response.content)
        self.assertNotIn(b"Test Recipe 2", response.content)
