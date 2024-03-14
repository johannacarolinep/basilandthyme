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

    # def test_unique_favourite_constraint(self):
        """
        Test to make sure the same user can not favourite the same recipe twice
        """
        # Favourite.objects.create(user=self.user, recipe=self.recipe)
        # favourites = Favourite.objects.all()
        # print("Print 1:")
        # for favourite in favourites:
        #     print(favourite)
        # Favourite.objects.create(user=self.user, recipe=self.recipe)
        # favourites = Favourite.objects.all()
        # print("print 2:")
        # for favourite in favourites:
        #     print(favourite)
        # with self.assertRaises(Exception) as raised:  # top level exception as we want to figure out its exact type
        #     Favourite.objects.create(user=self.user, recipe=self.recipe)
        # self.assertEqual(IntegrityError, type(raised.exception))  # if it fails, we'll get the correct type to import
        # with self.assertRaises(IntegrityError):
        #     Favourite.objects.create(user=self.user, recipe=self.recipe)

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
        # Create favourite
        favourite = Favourite.objects.create(user=self.user, recipe=self.recipe)
        favourited = Favourite.is_recipe_favourite(self.user, self.recipe)
        self.assertTrue(
            favourited, msg="Recipe not favourited when it should be")
        # Detelete favourite
        favourite.delete()
        not_favourite = Favourite.is_recipe_favourite(self.user, self.recipe)
        self.assertFalse(not_favourite, msg="Recipe is favourite when it should not be")
