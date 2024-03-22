import json
from django.views.generic import ListView, DetailView
from django.views.decorators.http import require_POST
from django.shortcuts import render
from django.http import JsonResponse
from django.db.models import Q
from .models import Recipe, Favourite
from .forms import CommentForm


# Create your views here.
class RecipeListView(ListView):
    """
    View for displaying a list of recipes based on search queries and
    categories, or all published recipes if there is no search query.
    """
    model = Recipe
    template_name = 'recipe_book/recipes.html'
    paginate_by = 8

    def get_queryset(self):
        """
        Retrieves the queryset of recipes based on search queries and
        categories, or all published recipes if there is no query.

        Returns:
            Queryset: A filtered queryset of Recipe objects.
        """
        self.query = self.request.GET.get("q")
        if self.query:
            match self.query:
                case "all":
                    return Recipe.objects.filter(status=1)
                case "chicken":
                    return Recipe.objects.filter(status=1, category=1)
                case "pork":
                    return Recipe.objects.filter(status=1, category=2)
                case "beef":
                    return Recipe.objects.filter(status=1, category=3)
                case "fish":
                    return Recipe.objects.filter(status=1, category=4)
                case "vegetarian":
                    return Recipe.objects.filter(status=1, category=5)
                case _:
                    return Recipe.objects.filter(
                        Q(title__icontains=self.query) | Q(ingredients__icontains=self.query)
                    )
        else:
            return Recipe.objects.filter(status=1)

    def get_context_data(self, **kwargs):
        """
        Adds extra context data for rendering the recipe list template.

        Returns:
            dict: A dictionary containing additional context data.
                - 'searchHeading' (str): A message indicating the search
                results or lack thereof.
                - 'user_favorites' (list): A list of recipe IDs favorited by
                the current user, or an empty list if the user is not
                authenticated or has no favorites.
        """
        context = super().get_context_data(**kwargs)  # building context
        count = len(self.get_queryset())  # nr of objects found

        if self.query:
            if self.query == "all":
                context['searchHeading'] = "Showing all recipes, a total of " + str(count) + "."
            elif count > 0:
                context['searchHeading'] = "Showing " + str(count) + " results for '" + self.query + "'."
            else:
                context["searchHeading"] = "Sorry, no results for '" + self.query + "'. Please try again."
        else:
            context['searchHeading'] = "Search for your new favourite recipes"

        user = self.request.user
        context['user_favorites'] = Favourite.get_user_favourite_ids(user)

        return context


class FeaturesListView(ListView):
    model = Recipe
    template_name = 'recipe_book/index.html'


class RecipeDetailView(DetailView):
    """
    View for displaying details of a single recipe.

    Attributes:
        queryset (QuerySet): The queryset used to retrieve recipe objects with
        a status of published.
        template_name (str): The name of the template used to render the recipe
        detail page.
        context_object_name (str): The key used to access the recipe object in
        the template context.
        slug_url_kwarg (str): The name of the URL keyword argument containing
        the recipe slug.
    """
    queryset = Recipe.objects.filter(status=1)
    template_name = "recipe_book/recipe-page.html"
    context_object_name = "recipe"
    slug_url_kwarg = "slug"

    def get_context_data(self, **kwargs):
        """
        Adds extra context data for rendering the recipe detail template.

        Returns:
            dict: A dictionary containing additional context data:
                - 'recipe' (Recipe): The recipe object being viewed.
                - 'is_favourite' (bool): A boolean indicating whether the
                current user has favorited the recipe. Will be False if recipe
                is not a favourited or if the user is not authenticated.
        """
        context = super().get_context_data(**kwargs)
        recipe = self.get_object()
        user = self.request.user
        comments = recipe.comments.all().order_by("-created_on")
        no_of_comments = comments.filter(approved=True).count()
        comment_form = CommentForm()
        context['comment_form'] = comment_form
        context['comments'] = comments
        context['no_of_comments'] = no_of_comments
        context['is_favourite'] = Favourite.is_recipe_favourite(user, recipe)
        return context


@require_POST
def add_remove_favourite(request):
    """
    View to handle POST request (Favourites buttons)
    """
    if request.method == 'POST':
        print("Received request", request.body)

        try:
            data = json.loads(request.body)
            recipe_id = data.get("recipeId")
            user_id = data.get("userId")
            is_favourite = Favourite.is_recipe_favourite_by_ids(
                user_id, recipe_id)
            # handle case where recipe is a favourite of the user
            if (is_favourite):
                confirm = Favourite.delete_favourite(user_id, recipe_id)
                if (confirm):
                    return JsonResponse(
                        {"status": "success", "message": "Favourite removed"},
                        status=200)
            # handle case where recipe is not a favourite of the user
            else:
                confirm = Favourite.create_favourite(user_id, recipe_id)
                if (confirm):
                    return JsonResponse(
                        {"status": "success", "message": "Favourite created"},
                        status=200)
        except json.JSONDecodeError:
            return JsonResponse(
                {"status": "error", "message": "Invalid JSON"},
                status=400)


class FavouritesList(ListView):
    model = Recipe
    template_name = "recipe_book/favourites.html"
    paginate_by = 8

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            favourite_recipes = Favourite.get_user_favourite_ids(user)
            return Recipe.objects.filter(id__in=favourite_recipes)
        else:
            return Recipe.objects.none()
