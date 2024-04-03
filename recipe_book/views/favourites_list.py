from django.db import models
from django.views.generic import ListView
from ..models import Recipe, Favourite


class FavouritesList(ListView):
    """
    View to display a list of a user's favorite recipes. If the user is
    authenticated, the view will return the user's favourite recipes, + some
    additional data such as average rating and rating count. If the user is not
    authenticated, the view will return an empty queryset.

    Attributes:
        model (Model): The model associated with the view (Recipe).
        template_name (str): The name of the template used for rendering the
        view.
        paginate_by (int): The number of items to paginate by.

    Methods:
        get_queryset(self): Retrieves the queryset of favorite recipes for the
        authenticated user or an empty queryset if user is not authenticated.
        Annotates each recipe object with additional details.
        get_context_data(self, **kwargs): Adds extra context data, the range
        used for creating star buttons.
    """
    model = Recipe
    template_name = "recipe_book/favourites.html"
    paginate_by = 8

    def get_queryset(self):
        """
        Retrieves the queryset of favorite recipes for an authenticated user.

        Returns:
            QuerySet: The queryset of favorite recipes with additional
            annotations if the user is authenticated, or an empty queryset if
            the user is not authenticated.
        """
        user = self.request.user
        if user.is_authenticated:
            favourite_recipes = Favourite.get_user_favourite_ids(user)
            base = Recipe.objects.filter(id__in=favourite_recipes, status=1)
            # https://docs.djangoproject.com/en/5.0/ref/models/querysets/#annotate
            queryset = base.annotate(
                avg_rating=models.Avg('rating_recipe__rating'),
                ratings_count=models.Count('rating_recipe'),
                user_rating=models.F('rating_recipe__rating')
            )
            return queryset

        else:
            return Recipe.objects.none()

    def get_context_data(self, **kwargs):
        """
        Adds extra context data, the range used for creating star buttons

        Returns:
            dict: A dictionary containing the extra context data.
        """
        context = super().get_context_data(**kwargs)
        context['stars_range'] = range(1, 6)

        return context
