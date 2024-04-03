from django.db import models
from django.views.generic import ListView
from django.db.models import Q
from ..models import Recipe, Favourite


class RecipeListView(ListView):
    """
    View for displaying a list of recipes based on search queries and
    categories, or all published recipes if there is no search query.

    Attributes:
        model (Model): The model associated with the view (Recipe).
        template_name (str): The name of the template used to render the page.
        paginate_by (int): The number of items to paginate by.
    """
    model = Recipe
    template_name = 'recipe_book/recipes.html'
    paginate_by = 8

    def get_queryset(self):
        """
        Retrieves the queryset of recipes based on search queries and
        categories, or all published recipes if there is no query. Sorts the
        recipes if a sort parameter is present. Annotates each recipe with
        additional details avg rating, rating count, and if user is
        authenticated, the users rating of the recipe.

        Returns:
            Queryset: A filtered queryset of Recipe objects.
        """
        self.query = self.request.GET.get("q")
        self.sort = self.request.GET.get("s")
        # https://docs.djangoproject.com/en/5.0/ref/models/querysets/#annotate
        base_queryset = Recipe.objects.filter(status=1).annotate(
            avg_rating=models.functions.Coalesce(
                models.Avg('rating_recipe__rating'), models.Value(0.0)),
            ratings_count=models.Count('rating_recipe'),
        )
        # if logged in user, annotate recipes with users rating of recipe
        user = self.request.user
        if user.is_authenticated:
            base_queryset = base_queryset.annotate(
                user_rating=models.Case(
                    models.When(rating_recipe__user=user,
                                then=models.F('rating_recipe__rating')),
                    default=None,
                    output_field=models.IntegerField()
                )
                )

        # if there's a search query, filter recipes by it
        if self.query:
            match self.query.lower():
                case "all":
                    base_queryset = base_queryset
                case "chicken":
                    base_queryset = base_queryset.filter(category=1)
                case "pork":
                    base_queryset = base_queryset.filter(category=2)
                case "beef":
                    base_queryset = base_queryset.filter(category=3)
                case "fish":
                    base_queryset = base_queryset.filter(category=4)
                case "vegetarian":
                    base_queryset = base_queryset.filter(category=5)
                case _:
                    title_query = Q(title__icontains=self.query)
                    ingredients_query = Q(ingredients__icontains=self.query)
                    base_queryset = base_queryset.filter(
                        title_query | ingredients_query
                    )

        # if there's a sort query, sort recipes by it
        if self.sort:
            if self.sort == "newest":
                base_queryset = base_queryset.order_by('-created_on')
            elif self.sort == "oldest":
                base_queryset = base_queryset.order_by('created_on')
            elif self.sort == "highest-rating":
                base_queryset = base_queryset.order_by('-avg_rating')

        return base_queryset

    def get_context_data(self, **kwargs):
        """
        Adds extra context data for rendering the recipe list template.

        Returns:
            dict: A dictionary containing additional context data.
                - 'searchHeading' (str): A message indicating the search
                results or lack thereof.
                - 'user_favourites' (list): A list of recipe IDs favorited by
                the current user, or an empty list if the user is not
                authenticated or has no favorites.
                - 'stars_range' (range): A range object used to create the star
        """
        context = super().get_context_data(**kwargs)
        count = len(self.get_queryset())

        if self.query:
            if self.query == "all":
                context['searchHeading'] = (
                    "Showing all recipes, a total of " + str(count) + ".")
            elif count > 0:
                context['searchHeading'] = (
                    "Showing " +
                    str(count) +
                    " results for '" +
                    self.query +
                    "'.")
            else:
                context["searchHeading"] = (
                    "Sorry, no results for '" +
                    self.query +
                    "'. Please try again.")
        else:
            context['searchHeading'] = "Search for your new favourite recipes"

        user = self.request.user
        context['user_favourites'] = Favourite.get_user_favourite_ids(user)
        context['stars_range'] = range(1, 6)

        return context
