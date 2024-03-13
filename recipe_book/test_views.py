from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse
from . import views
from .models import Recipe, Favourite


# Create your tests here.
class TestRecipeBookViews(TestCase):

    def setUp(self):
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
        response = self.client.get(reverse(
            'recipe_detail', kwargs={'slug': 'non-existing-slug'}))
        self.assertEqual(response.status_code, 404)
