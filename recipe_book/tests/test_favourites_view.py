from django.test import TestCase
from django.urls import reverse


# Create your tests here.
class TestFavouritesView(TestCase):

    def test_favourites_page_status_code(self):
        """
        Test the status code of the favourites page.
        """
        response = self.client.get(reverse('favourites_page'))
        self.assertEqual(response.status_code, 200, msg="Status code not 200")

    def test_favourites_page_template_used(self):
        """
        Test the correct template is used for the FavouritesView.
        """
        response = self.client.get(reverse('favourites_page'))
        self.assertTemplateUsed(response, 'recipe_book/favourites.html')
