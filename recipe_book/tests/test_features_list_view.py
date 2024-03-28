from django.test import TestCase
from django.urls import reverse


# Create your tests here.
class TestFeaturesListView(TestCase):

    def test_features_list_page_status_code(self):
        """
        Test the status code of the home page.
        """
        response = self.client.get(reverse('home_page'))
        self.assertEqual(response.status_code, 200, msg="Status code not 200")

    def test_features_list_page_template_used(self):
        """
        Test the correct template is used for the FeaturesListView.
        """
        response = self.client.get(reverse('home_page'))
        self.assertTemplateUsed(response, 'recipe_book/index.html')
