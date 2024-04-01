from django.views.generic import ListView
from django.db import models
from ..models import Recipe, Favourite


class FeaturesListView(ListView):
    model = Recipe
    template_name = 'recipe_book/index.html'
    context_object_name = 'context'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        # Annotate recipes with additional details
        base_queryset = Recipe.objects.filter(status=1).annotate(
            avg_rating=models.functions.Coalesce(models.Avg('rating_recipe__rating'), models.Value(0.0)),
            ratings_count=models.Count('rating_recipe'),
        )

        # if logged in user, annotate recipes with users rating of recipe
        user = self.request.user
        if user.is_authenticated:
            base_queryset = base_queryset.annotate(
                user_rating=models.Case(
                    models.When(rating_recipe__user=user, then=models.F('rating_recipe__rating')),
                    default=None,
                    output_field=models.IntegerField()
                )
                )

        # The 4 recipes with the highest rating
        rating_queryset = base_queryset.order_by('-avg_rating')[:4]
        date_queryset = base_queryset.order_by('-created_on')[:4]
        context['recipes_by_rating'] = rating_queryset
        context['recipes_by_date'] = date_queryset
        context['user_favorites'] = Favourite.get_user_favourite_ids(user)
        context['stars_range'] = range(1, 6)

        return context
