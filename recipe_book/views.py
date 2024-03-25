import json
from django.db import models
from django.views.generic import ListView, DetailView
from django.views.decorators.http import require_POST
from django.shortcuts import render
from django.http import HttpResponseRedirect, JsonResponse
from django.db.models import Q
from .models import Recipe, Favourite, Rating
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
        # https://docs.djangoproject.com/en/5.0/ref/models/querysets/#annotate
        base_queryset = Recipe.objects.filter(status=1).annotate(
            avg_rating=models.Avg('rating_recipe__rating'),  # Assume 'rating' is a field in the Rating model for the score
            ratings_count=models.Count('rating_recipe')  # Count ratings using the ID of the Rating model
        )
        if self.query:
            match self.query:
                case "all":
                    return base_queryset
                case "chicken":
                    return base_queryset.filter(category=1)
                case "pork":
                    return base_queryset.filter(category=2)
                case "beef":
                    return base_queryset.filter(category=3)
                case "fish":
                    return base_queryset.filter(category=4)
                case "vegetarian":
                    return base_queryset.filter(category=5)
                case _:
                    return base_queryset.filter(
                        Q(title__icontains=self.query) | Q(ingredients__icontains=self.query)
                    )
        else:
            return base_queryset

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
        context['stars_range'] = range(1, 6)

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
        context['avg_rating'] = Rating.get_recipe_avg_rating(recipe.id)
        context['rating_count'] = Rating.get_recipe_no_of_ratings(recipe.id)
        context['stars_range'] = range(1, 6)
        context['user_rating'] = Rating.get_user_rating_of_recipe(
            user.id, recipe.id)
        return context

    def post(self, request, *args, **kwargs):
        """
        Handles POST requests to add a new comment to the recipe.

        Returns:
            JsonResponse: JSON response indicating success or failure of
            comment creation. If successful, also passes response_data with the
            comment details.
        """
        comment_form = CommentForm(request.POST)

        if request.user.is_authenticated:
            if comment_form.is_valid():
                comment = comment_form.save(commit=False)
                comment.author = request.user
                comment.recipe = self.get_object()
                comment.save()
                response_data = {
                    "body": comment.body,
                    "comment_id": comment.id,
                    "date": comment.created_on,
                }

                return JsonResponse({'success': True, 'data': response_data})

            # If the form is invalid
            return JsonResponse(
                {'success': False, 'message': "Comment invalid"}, status=400)

        # If the form is invalid
        return JsonResponse(
            {'success': False, 'message': "You must be logged in to comment"},
            status=401)

    def delete(self, request, *args, **kwargs):
        """
        Handles DELETE requests to delete a comment of the recipe.

        Returns:
            JsonResponse: JSON response indicating success or failure of
            comment deletion.
        """
        # get commentId from request url
        comment_id = request.GET.get("commentId")
        recipe = self.get_object()
        # get the comment with matching id
        comment = recipe.comments.filter(id=comment_id).first()
        if comment is None:
            return JsonResponse(
                {'success': False,
                    'error': 'Comment not found or not authorized to delete'},
                status=400)

        if comment.author == request.user:
            comment.delete()
            return JsonResponse({'success': True, 'data': "comment deleted"})
        else:
            return JsonResponse(
                {'success': False, 'data': "not allowed"}, status=401)

    def put(self, request, *args, **kwargs):
        """
        Handles PUT requests to update a comment of the recipe.

        Returns:
            JsonResponse: JSON response indicating success or failure of
            comment update.
        """
        data = json.loads(request.body)
        comment_id = data["commentId"]
        recipe = self.get_object()
        comment = recipe.comments.filter(id=comment_id).first()

        if comment is None:
            return JsonResponse(
                {'success': False, 'error': 'Comment not found'}, status=400)

        if comment.author != request.user:
            return JsonResponse(
                {'success': False, 'error': 'Not authorised'}, status=401)

        elif data["body"] != "" and data["body"] != comment.body:
            comment.body = data["body"]
            if not comment.approved:
                comment.approved = True
            comment.save()
            return JsonResponse(
                {'success': True, 'data': "Comment updated"})

        return JsonResponse(
            {'success': False, 'data': "Comment not updated"}, status=400)


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
