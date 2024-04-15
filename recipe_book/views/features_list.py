from django.views.generic import ListView
from django.db import models
from ..models import Recipe, Favourite, Rating


class FeaturesListView(ListView):
    """
    View to display featured recipes (highest rated and latest published).
    Annotates the recipe objects with additional details and passes additional
    details as context.

    Attributes:
        model (Model): The model associated with the view (Recipe).
        template_name (str): The template used for rendering the view.
        context_object_name (str): The name of the context object used in the
        template.

    Methods:
        get_context_data(self, **kwargs): Adds extra context data including
        highest rated recipes, latest published recipes, average rating,
        rating count, user's favorite recipes, and the range used for creating
        star buttons.
    """
    model = Recipe
    template_name = 'recipe_book/index.html'
    context_object_name = 'context'

    def get_context_data(self, **kwargs):
        """
        Adds extra context data including highest rated recipes, latest
        published recipes, the user's favourite recipes and the range user for
        creating the star buttons. Annotates each recipe object with additional
        details avg rating, rating count, and the users existing rating of the
        recipe.

        Returns:
            dict: A dictionary containing the extra context data.
        """
        context = super().get_context_data(**kwargs)

        # Annotate recipes with additional details
        base_queryset = Recipe.objects.filter(status=1).annotate(
            avg_rating=models.functions.Coalesce(
                models.Avg('rating_recipe__rating'), models.Value(0.0)),
            ratings_count=models.Count('rating_recipe'),
        )

        # if logged in user, annotate recipes with users rating of recipe
        user = self.request.user
        if user.is_authenticated:
            # create a subquery to get the user's rating for each recipe
            ratings_subquery = Rating.objects.filter(
                recipe=models.OuterRef('pk'),
                user=user
            ).values('rating')[:1]

            # Annotate the queryset
            base_queryset = base_queryset.annotate(
                user_rating=models.Subquery(
                    ratings_subquery,
                    output_field=models.IntegerField(default=None))
            )

        rating_queryset = base_queryset.order_by('-avg_rating')[:4]
        date_queryset = base_queryset.order_by('-created_on')[:4]
        context['recipes_by_rating'] = rating_queryset
        context['recipes_by_date'] = date_queryset
        context['user_favourites'] = Favourite.get_user_favourite_ids(user)
        context['stars_range'] = range(1, 6)

        return context
