from django.db import models
from django.views.generic import ListView
from ..models import Recipe, Favourite


class FavouritesList(ListView):
    model = Recipe
    template_name = "recipe_book/favourites.html"
    paginate_by = 8

    def get_queryset(self):
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
        """
        context = super().get_context_data(**kwargs)  # building context
        context['stars_range'] = range(1, 6)

        return context
