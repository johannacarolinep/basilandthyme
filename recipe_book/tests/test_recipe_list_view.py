from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse
from recipe_book.models import Recipe, Favourite


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

    def test_recipe_list_page_pagination(self):
        """
        Test pagination on the recipe list page.
        Ensures a total of 12 recipes would be split over 2 pages, with 8
        recipes on the first page and 4 on the second page.
        """
        # Create 10 additional mock recipes to get to a total of 12
        for i in range(10):
            Recipe.objects.create(
                title=f"Test Recipe {i + 3}",
                author=self.user,
                slug=f"test-recipe-{i + 3}",
                content="Test Recipe Content",
                status=1,
            )

        response = self.client.get(reverse('recipe_list_page'))
        self.assertEqual(response.status_code, 200, msg="Status code not 200")
        paginator = response.context['paginator']

        # Check if the paginator has the correct number of pages
        self.assertEqual(paginator.num_pages, 2, msg="No of pages incorrect")

        # Check if the first page contains the correct number of recipes
        self.assertEqual(
            len(paginator.page(1).object_list), 8,
            msg="Incorrect no of results on page 1")

        # Check if the second page contains the correct number of recipes
        self.assertEqual(
            len(paginator.page(2).object_list), 4,
            msg="Incorrect no of results on page 2")

    def test_recipe_list_page_not_paginated(self):
        """
        Test to ensure the recipe list page is not paginated when the nu of
        recipes is smaller than the paginate_by number. Asserts there is only 1
        page and it has the correct number of recipes.
        """
        response = self.client.get(reverse('recipe_list_page'))
        self.assertEqual(response.status_code, 200, msg="Status code not 200")
        paginator = response.context['paginator']

        # Check if the paginator has the correct number of pages
        self.assertEqual(paginator.num_pages, 1, msg="No of pages incorrect")

        # Check if the first page contains the correct number of recipes
        self.assertEqual(
            len(paginator.page(1).object_list), 2,
            msg="Incorrect no of results on page 1")
