from django.contrib.auth.models import User
from django.test import TestCase
from django.db import IntegrityError
from .models import Recipe, Favourite


class TestFavouriteModel(TestCase):
    # Create mock data
    def setUp(self):
        # Create a superuser
        self.super_user = User.objects.create_superuser(
            username="testsuperuser", email="testsuper@test.com", password="supertestpassword"
        )

        # Create a mock user
        self.user = User.objects.create_user(
            username="testuser", email="test@test.com", password="testpassword"
        )
        self.client.login(username="testuser", password="testpassword")

        # Create a mock recipe
        self.recipe = Recipe.objects.create(
            title="Test favourite recipe 1",
            author=self.super_user,
            slug="test-favourite-recipe-1",
            content="Test favourite model content 1",
            ingredients="Test favourite model ingredients",
            teaser="Test favourite recipe teaser 1",
            status=1,
        )

    def test_favourite_creation(self):
        """
        Test creating a Favourite given a logged in user and a recipe
        """
        favourite = Favourite.objects.create(
            user=self.user, recipe=self.recipe
            )
        self.assertIsNotNone(favourite)

    def test_unique_favourite_constraint(self):
        """
        Test to make sure the same user can not favourite the same recipe twice
        """
        Favourite.objects.create(user=self.user, recipe=self.recipe)
        with self.assertRaises(IntegrityError):
            Favourite.objects.create(user=self.user, recipe=self.recipe)

    def test_favourite_deletion(self):
        """
        Test a Favourite object is deleted as intended
        """
        favourite = Favourite.objects.create(
            user=self.user, recipe=self.recipe)
        self.assertIsNotNone(favourite)

        # Delete the favourite object
        favourite.delete()

        # Ensure the favourite object is deleted
        with self.assertRaises(Favourite.DoesNotExist):
            Favourite.objects.get(user=self.user, recipe=self.recipe)

    def test_is_recipe_favourite(self):
        """
        Test to ensure the is_recipe_favourite() method returns True when the
        given recipe is a favourite of the given user, and False when not.
        """
        # Create favourite
        favourite = Favourite.objects.create(
            user=self.user, recipe=self.recipe)
        favourited = Favourite.is_recipe_favourite(self.user, self.recipe)
        self.assertTrue(
            favourited, msg="Recipe not favourited when it should be")
        # Detelete favourite
        favourite.delete()
        not_favourite = Favourite.is_recipe_favourite(self.user, self.recipe)
        self.assertFalse(
            not_favourite, msg="Recipe is favourite when it should not be")

    def test_is_recipe_favourite_by_ids(self):
        """
        Test to ensure method returns true when passed a recipeId and userId
        when recipe is a favourite of the user, and false when not.
        """
        favourite = Favourite.objects.create(
            user=self.user, recipe=self.recipe)

        is_favourite = Favourite.is_recipe_favourite_by_ids(
            self.user.id, self.recipe.id)
        self.assertTrue(is_favourite, msg="Recipe should be favourite of user")

        favourite.delete()

        is_false_favourite = Favourite.is_recipe_favourite_by_ids(
            self.user.id, self.recipe.id)
        self.assertFalse(
            is_false_favourite, msg="Recipe should NOT be favourite of user")

    def test_get_user_favourite_ids(self):
        """
        Test to check that get_user_favourite_ids returns the right recipe id's
        given the user has favourited two recipes.
        """
        # create another test recipe
        recipe2 = Recipe.objects.create(
            title="Test favourite recipe 2",
            author=self.super_user,
            slug="test-favourite-recipe-2",
            content="Test favourite model content 2",
            ingredients="Test favourite model ingredients",
            teaser="Test favourite recipe teaser 2",
            status=1,
        )

        # favourite two recipes
        Favourite.objects.create(user=self.user, recipe=self.recipe)
        Favourite.objects.create(user=self.user, recipe=recipe2)

        # call method to get the ids of the users favourited recipes
        recipe_ids = list(Favourite.get_user_favourite_ids(self.user))
        # assert they are the ids of the two test recipes
        self.assertEqual(recipe_ids, [self.recipe.id, recipe2.id])
