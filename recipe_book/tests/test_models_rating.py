from django.contrib.auth.models import User
from django.test import TestCase
from django.db import IntegrityError
from recipe_book.models import Recipe, Rating


class TestRatingModel(TestCase):
    # Create mock data
    def setUp(self):
        # Create a superuser
        self.super_user = User.objects.create_superuser(
            username="testsuperuser",
            email="testsuper@test.com",
            password="supertestpassword"
        )

        # Create a mock user
        self.user = User.objects.create_user(
            username="testuser", email="test@test.com", password="testpassword"
        )
        self.client.login(username="testuser", password="testpassword")

        # Create a mock recipe
        self.recipe = Recipe.objects.create(
            title="Test rating recipe 1",
            author=self.super_user,
            slug="test-rating-recipe-1",
            content="Test rating model content 1",
            ingredients="Test rating model ingredients",
            teaser="Test rating recipe teaser 1",
            status=1,
        )

    def test_rating_creation(self):
        """ Test creating a rating given a logged in user and a recipe """
        rating = Rating.objects.create(
            user=self.user, recipe=self.recipe, rating=1
            )
        self.assertIsNotNone(rating, msg="Rating was not created")

    def test_unique_rating_constraint(self):
        """
        Test to make sure the same user can not rating the same recipe twice
        """
        Rating.objects.create(user=self.user, recipe=self.recipe, rating=2)
        with self.assertRaises(
                IntegrityError,
                msg="Error not raised for creating duplicate rating"):
            Rating.objects.create(user=self.user, recipe=self.recipe, rating=1)

    def test_rating_deletion(self):
        """ Test a Rating object is deleted as intended """
        rating = Rating.objects.create(
            user=self.user, recipe=self.recipe, rating=1)
        self.assertIsNotNone(rating, msg="Rating doesn't exist after creation")

        # Delete the rating object
        rating.delete()
        # Ensure the rating object is deleted
        with self.assertRaises(
                Rating.DoesNotExist, msg="Rating exists after deletion"):
            Rating.objects.get(user=self.user, recipe=self.recipe)

    def test_get_recipe_avg_rating_with_ratings(self):
        """
        Test to ensure the method returns the average rating for a given recipe
        which has ratings
        """
        # Create another test user
        user_2 = User.objects.create_user(
            username="testuser2", email="test2@test.com",
            password="test2password"
        )
        self.client.login(username="testuser2", password="test2password")
        Rating.objects.create(user=self.user, recipe=self.recipe, rating=1)
        Rating.objects.create(user=user_2, recipe=self.recipe, rating=5)

        avg_rating = Rating.get_recipe_avg_rating(recipe_id=self.recipe.id)

        self.assertEqual(avg_rating, 3.0, msg="Incorrect avg rating")

    def test_get_recipe_avg_rating_no_ratings(self):
        """
        Test to ensure the method returns 0.0 when a given recipe has no
        ratings
        """
        avg_rating = Rating.get_recipe_avg_rating(recipe_id=self.recipe.id)

        self.assertEqual(
            avg_rating, 0.0,
            msg="Should have returned 0.0 for recipe with no ratings")

    def test_get_recipe_no_of_ratings(self):
        """
        Test that the method returns the number of ratings for a given recipe
        """
        user_2 = User.objects.create_user(
            username="testuser2", email="test2@test.com",
            password="test2password"
        )
        self.client.login(username="testuser2", password="test2password")
        Rating.objects.create(user=self.user, recipe=self.recipe, rating=1)
        Rating.objects.create(user=user_2, recipe=self.recipe, rating=5)

        no_of_ratings = Rating.get_recipe_no_of_ratings(
            recipe_id=self.recipe.id)

        self.assertEqual(
            no_of_ratings, 2, msg="Incorrect no of ratings for recipe")

    def test_get_user_rating_of_recipe(self):
        """
        Test that the method returns the users existing rating value for a
        given recipe, or None if the user has not rated the recipe.
        """
        # Create a rating for user and recipe
        user = self.user
        rating = Rating.objects.create(user=user, recipe=self.recipe, rating=2)
        ratingExists = Rating.get_user_rating_of_recipe(
            user_id=user.id, recipe_id=self.recipe.id)

        self.assertEqual(
            ratingExists, 2, msg="Returned incorrect rating value")
        # Deleting the rating
        rating.delete()
        noneRating = Rating.get_user_rating_of_recipe(
            user_id=user.id, recipe_id=self.recipe.id)
        self.assertIsNone(
            noneRating, msg="Returned incorrect rating value. Should be none")
