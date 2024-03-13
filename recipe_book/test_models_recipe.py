from django.contrib.auth.models import User
from django.test import TestCase
from django.utils import timezone
from django.db import IntegrityError
from django.core.exceptions import ValidationError
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
            ingredients="Test recipe model ingredients",
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
                ingredients="Test recipe model ingredients",
                teaser="Test Recipe Teaser",
                status=1,
            )

    def test_title_max_length(self):
        """
        Test that a validation error is raised when the title length exceeds
        the maximum limit.
        """
        long_title = "a" * 80

        recipe = Recipe(
            title=long_title,
            author=self.user,
            slug="test-recipe-model-x",
            content="Test Recipe Content",
            teaser="Test Recipe Teaser",
            ingredients="Test recipe model ingredients",
            status=1,
        )
        try:
            # Attempt to clean data
            recipe.full_clean()
        except ValidationError as e:
            if 'title' not in e.message_dict:
                # fail since validation error not relating to title
                self.fail(
                    "ValidationError raised, but not for the 'title' field."
                    )
        else:
            # Fail since no exception is raised
            self.fail(
                "ValidationError not raised for an excessively long title."
                )

    def test_slug_max_length(self):
        """
        Test that a validation error is raised when the slug length exceeds
        the maximum limit.
        """
        long_slug = "a" * 80

        recipe = Recipe(
            title="Test Recipe Model x",
            author=self.user,
            slug=long_slug,
            content="Test Recipe Content",
            teaser="Test Recipe Teaser",
            ingredients="Test recipe model ingredients",
            status=1,
        )
        try:
            # Attempt to clean data
            recipe.full_clean()
        except ValidationError as e:
            if 'slug' not in e.message_dict:
                # fail since validation error not relating to slug
                self.fail(
                    "ValidationError raised, but not for the 'slug' field."
                    )
        else:
            # Fail since no exception is raised
            self.fail(
                "ValidationError not raised for an excessively long slug."
                )

    def test_alt_text_max_length(self):
        """
        Test that a validation error is raised when the alt text length exceeds
        the maximum limit.
        """
        long_alt = "a" * 126

        recipe = Recipe(
            title="Test Recipe Model x",
            author=self.user,
            slug="test-recipe-model-x",
            alt_text=long_alt,
            content="Test Recipe Content",
            teaser="Test Recipe Teaser",
            ingredients="Test recipe model ingredients",
            status=1,
        )
        try:
            # Attempt to clean data
            recipe.full_clean()
        except ValidationError as e:
            if 'alt_text' not in e.message_dict:
                # fail since validation error not relating to slug
                self.fail(
                    "ValidationError raised, but not for the 'alt_text' field."
                    )
        else:
            # Fail since no exception is raised
            self.fail(
                "ValidationError not raised for an excessively long alt_text."
                )

    def test_teaser_max_length(self):
        """
        Test that a validation error is raised when the teaser length exceeds
        the maximum limit.
        """
        long_teaser = "a" * 181

        recipe = Recipe(
            title="Test Recipe Model x",
            author=self.user,
            slug="test-recipe-model-x",
            alt_text="test-recipe-model-alt-text",
            content="Test Recipe Content",
            teaser=long_teaser,
            ingredients="Test recipe model ingredients",
            status=1,
        )
        try:
            # Attempt to clean data
            recipe.full_clean()
        except ValidationError as e:
            if 'teaser' not in e.message_dict:
                # fail since validation error not relating to slug
                self.fail(
                    "ValidationError raised, but not for the 'teaser' field."
                    )
        else:
            # Fail since no exception is raised
            self.fail(
                "ValidationError not raised for an excessively long teaser."
                )
