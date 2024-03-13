from django.contrib.auth.models import User
from django.test import TestCase
from django.utils import timezone
from django.db import IntegrityError
from datetime import datetime
from .models import Recipe


# Create your tests here.
class TestRecipeModel(TestCase):

    def setUp(self):
        # Create a superuser
        self.user = User.objects.create_superuser(
            username="testuser", email="test@test.com", password="testpassword"
        )

        self.recipe = Recipe.objects.create(
            title="Test Recipe Model 1",
            author=self.user,
            slug="test-recipe-model-1",
            content="Test recipe model content 1",
            teaser="Test recipe teaser 1",
            status=1,
        )

    def test_recipe_creation(self):
        recipe = self.recipe
        self.assertEqual(
            recipe.title, "Test Recipe Model 1", msg="Title not correct")
        self.assertEqual(recipe.author, self.user, msg="Author not correct")
        self.assertEqual(
            recipe.slug, "test-recipe-model-1", msg="Slug incorrect")
        self.assertEqual(
            recipe.content,
            "Test recipe model content 1",
            msg="Content is incorrect")
        self.assertEqual(recipe.status, 1, msg="Status is incorrect")
        self.assertEqual(recipe.category, 0, msg="Category incorrect")
        self.assertEqual(
            recipe.feature_image, "placeholder", msg="Image is incorrect")
        self.assertEqual(
            recipe.teaser, "Test recipe teaser 1", msg="Teaser is incorrect")
        self.assertIsInstance(recipe.created_on, datetime)
        self.assertIsNotNone(recipe.created_on)
        now = timezone.now()
        self.assertLessEqual(recipe.created_on, now)

    def test_unique_title(self):
        # Attempt to create a recipe with the same title
        with self.assertRaises(IntegrityError):
            Recipe.objects.create(
                title="Test Recipe Model 1",
                author=self.user,
                slug="different-slug",
                content="Test Recipe Content",
                teaser="Test Recipe Teaser",
                status=1,
            )

    def test_unique_slug(self):
        # Attempt to create a recipe with the same slug
        with self.assertRaises(IntegrityError):
            Recipe.objects.create(
                title="Test Recipe Model Different Title",
                author=self.user,
                slug="test-recipe-model-1",
                content="Test Recipe Content",
                teaser="Test Recipe Teaser",
                status=1,
            )
