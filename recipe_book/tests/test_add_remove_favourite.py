from django.test import TestCase
from django.contrib.auth.models import User
from recipe_book.models import Recipe, Favourite


class AddRemoveFavouriteViewTests(TestCase):
    """
    A test case class to test the add-remove-favourite view
    (favourites_crud.py).

    Contains tests to ensure the correct behavior of the add-remove-favourite
    function view for adding and removing favorites by authenticated users.

    Test methods:
        - `setUp`: Set up mock data for the tests.
        - `test_add_favourite_authenticated_user`: Test that a favourite is
        added when the request is by a valid user and recipe, and favourite
        does not already exist.
        - `test_remove_favourite_authenticated_user`: Test that a favourite is
        removed when the request is by  valid user and recipe, and favourite
        already exists.
    """
    def setUp(self):
        """ Set up mock data for testing """
        self.super_user = User.objects.create_superuser(
            username="testsuperuser",
            email="testsuper@test.com",
            password="supertestpassword"
        )

        self.user = User.objects.create_user(
            username='testuser', password='testpassword')
        self.client.login(username="testuser", password="testpassword")

        self.recipe = Recipe.objects.create(
            title='Test Recipe', author=self.super_user)

    def test_add_favourite_authenticated_user(self):
        """
        Test that a favourite is added when request is valid user and recipe,
        and favourite does not already exist.
        """
        data = {'recipeId': self.recipe.id, 'userId': self.user.id}
        response = self.client.post(
            '/add-remove-favourite/', data, content_type='application/json')

        self.assertEqual(
            response.status_code, 200, msg="Incorrect status, should be 200")
        self.assertIn(
            'Added to favourites', response.json()['message'],
            msg="Incorrect json reponse message")
        self.assertTrue(
            Favourite.objects.filter(
                user=self.user, recipe=self.recipe).exists(),
            msg="Favourite was incorrectly not created")

    def test_remove_favourite_authenticated_user(self):
        """
        Test that a favourite is removed when request is valid user and recipe,
        and favourite already exist.
        """
        Favourite.objects.create(user=self.user, recipe=self.recipe)
        data = {'recipeId': self.recipe.id, 'userId': self.user.id}
        response = self.client.post(
            '/add-remove-favourite/', data, content_type='application/json')

        self.assertEqual(
            response.status_code, 200, msg="Incorrect status, should be 200")
        self.assertIn(
            'Removed from favourites', response.json()['message'],
            msg="Incorrect json response message")
        self.assertFalse(
            Favourite.objects.filter(
                user=self.user, recipe=self.recipe).exists(),
            msg="Favourite exists after deletion")
