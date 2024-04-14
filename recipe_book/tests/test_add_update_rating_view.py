from django.contrib.auth.models import User
from django.test import TestCase
from recipe_book.models import Recipe, Rating


class AddUpdateRatingViewTest(TestCase):
    """
    A test case class to test the add-update-rating view, in ratings_crud.py.

    Contains tests to ensure the correct behavior of the add-update-rating
    view.

    Test methods:
        - `setUp`: Set up mock data for the tests.
        - `test_add_rating_authenticated_user`: Test method is returning
        correct response, 200, and rating is created, when request with
        authenticated user and no existing rating for recipe.
        - `test_update_rating_authenticated_user`: Test method is returning the
        correct response, 200, and rating is updated with new rating value,
        when request with an authenticated user and an existing rating.
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

    def test_add_rating_authenticated_user(self):
        """
        Test method is returning correct response, 200, and rating is created,
        when request with authenticated user and no existing rating for recipe.
        """
        data = {'recipeId': self.recipe.id, 'rating': '5'}
        response = self.client.post(
            '/add-update-rating/', data, content_type='application/json')
        self.assertEqual(
            response.status_code, 200, msg="Incorrect, status should be 200")
        self.assertIn(
            'star rating added', response.json()['message'],
            msg="Incorrect json response message")
        self.assertTrue(
            Rating.objects.filter(
                user=self.user, recipe_id=self.recipe.id, rating=5).exists(),
            msg="Rating does not exist after creation")

    def test_update_rating_authenticated_user(self):
        """
        Test method is returning correct response, 200, and rating is updated
        with new rating value, when request with authenticated user and an
        existing rating.
        """
        existing_rating = Rating.objects.create(
            recipe_id=self.recipe.id, user=self.user, rating=5)

        data = {'recipeId': self.recipe.id, 'rating': '1'}
        response = self.client.post(
            '/add-update-rating/', data, content_type='application/json')
        self.assertEqual(
            response.status_code, 200, msg="Incorrect, status should be 200")
        self.assertIn(
            'Rating updated', response.json()['message'],
            msg="Incorrect json response message")

        updated_rating = Rating.objects.get(pk=existing_rating.pk)
        self.assertTrue(
            updated_rating.rating == 1,
            msg="Rating value not updated")
