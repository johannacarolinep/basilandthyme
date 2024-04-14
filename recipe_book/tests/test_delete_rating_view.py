from django.test import TestCase
from django.contrib.auth.models import User, AnonymousUser
from django.http import JsonResponse
from recipe_book.views import delete_rating
from recipe_book.models import Rating, Recipe
from unittest.mock import Mock


class DeleteRatingViewTest(TestCase):
    """
    A test case class to test the delete_rating view in ratings_crud.py.

    Contains tests to ensure the correct behavior of the delete_rating view
    for both authenticated and unauthenticated users, and scenarios where
    the rating exists or does not exist.

    Test methods:
        - `setUp`: Set up mock data for the tests.
        - `test_delete_rating_authenticated_user`: Test a delete request with
        an authenticated user,
        with an existing rating for recipe. Ensure getting the correct
        response and that the rating is deleted.
        - `test_delete_rating_not_authenticated_user`: Test a delete request
        with an anonymous user. Ensure getting the correct response, 401, and
        that the rating is not deleted.
        - `test_delete_rating_does_not_exist`: Test a delete request with a
        logged in user, but the rating does not exist. Ensure getting the
        correct response, 400.
    """
    def setUp(self):
        """ Set up mock data for testing """
        self.super_user = User.objects.create_superuser(
            username="testsuperuser",
            email="testsuper@test.com",
            password="supertestpassword"
        )

        self.user = User.objects.create_user(
            username='test_user', password='12345')

        self.recipe = Recipe.objects.create(
            title='Test Recipe', author=self.super_user)
        self.rating = Rating.objects.create(
            user=self.user, recipe=self.recipe, rating=4)

    def test_delete_rating_authenticated_user(self):
        """
        Test a delete request with an authenticated user, with an existing
        rating for recipe. Ensure getting the correct response and the rating
        is deleted.
        """
        request = Mock(
            method='DELETE', user=self.user, GET={'recipeId': self.recipe.id})
        response = delete_rating(request)
        self.assertEqual(
            response.status_code, 200, msg="Status code should be 200")
        self.assertEqual(
            response.content,
            JsonResponse(
                {"message": f"Rating deleted for recipe {self.recipe.title}",
                    "count": 0,
                    "average": 0.0}, status=200).content,
            msg="Response content incorrect")
        self.assertFalse(
            Rating.objects.filter(user=self.user, recipe=self.recipe).exists(),
            msg="Rating exists after deletion")

    def test_delete_rating_not_authenticated_user(self):
        """
        Test a delete request with an anonymous user. Ensure getting the
        correct response, 401, and that the rating is not deleted.
        """
        request = Mock(
            method='DELETE',
            user=AnonymousUser(), GET={'recipeId': self.recipe.id})
        response = delete_rating(request)
        self.assertEqual(
            response.status_code, 401, msg="Status should be 401, anonymous")
        self.assertEqual(
            response.content,
            JsonResponse(
                {"message": "You must be logged in to rate recipes"},
                status=401).content,
            msg="Incorrect JsonResponse")
        self.assertTrue(
            Rating.objects.filter(user=self.user, recipe=self.recipe).exists(),
            msg="Rating deleted in spite of anonymous user")

    def test_delete_rating_does_not_exist(self):
        """
        Test a delete request with a logged in user, but the rating does not
        exist. Ensure getting the correct response, 400.
        """
        self.rating.delete()
        request = Mock(
            method='DELETE', user=self.user, GET={'recipeId': self.recipe.id})
        response = delete_rating(request)
        self.assertEqual(
            response.status_code, 400, msg="Status code should be 400")
        self.assertEqual(
            response.content,
            JsonResponse(
                {"message": "Sorry, we could not find this rating"},
                status=400).content,
            msg="Incorrect Json response for non existing rating")
