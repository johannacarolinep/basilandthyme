from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse
from recipe_book.models import Recipe, Favourite


# Create your tests here.
class TestFavouritesListView(TestCase):
    def setUp(self):
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
            category=1
        )
        self.recipe2 = Recipe.objects.create(
            title="Test Recipe 2",
            author=self.user,
            slug="test-recipe-2",
            content="Test Recipe 2 Content",
            status=1,
            category=2
        )
        self.recipe3 = Recipe.objects.create(
            title="Test Recipe 3",
            author=self.user,
            slug="test-recipe-3",
            content="Test Recipe 3 Content",
            status=1,
            category=2
        )

        # User favourites recipe1 and recipe2
        self.favourite1 = Favourite.objects.create(
            user=self.user, recipe=self.recipe1)
        self.favourite2 = Favourite.objects.create(
            user=self.user, recipe=self.recipe2)

    def test_favourites_page_status_code(self):
        """ Test the status code of the favourites page. """
        response = self.client.get(reverse('favourites_page'))
        self.assertEqual(response.status_code, 200, msg="Status code not 200")

    def test_favourites_page_template_used(self):
        """
        Test the correct template is used for the FavouritesView.
        """
        response = self.client.get(reverse('favourites_page'))
        self.assertTemplateUsed(response, 'recipe_book/favourites.html')

    def test_authenticated_user_view(self):
        """
        Test that the favourites page display the favourited recipes of a
        logged in user.
        """
        response = self.client.get(reverse('favourites_page'))
        response.user = self.user
        self.assertIn(
            b"Test Recipe 1",
            response.content,
            msg="Favourited recipe not incl on favourites page")

        self.assertNotIn(
            b"Test Recipe 3",
            response.content,
            msg="Recipe incl on favourites page when not favourite")

        self.assertEqual(
            len(response.context_data['object_list']), 2,
            msg="Incorrect no of favourited recipes returned")

    def test_unauthenticated_user_view(self):
        """
        Test that the favourites page does not contain recipe objects when user
        is unauthenticated.
        """
        self.client.logout()
        response = self.client.get(reverse('favourites_page'))
        self.assertEqual(
            len(response.context_data['object_list']), 0,
            msg="Object_list should be empty for unauthenticated user")
