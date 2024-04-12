import json
from django.views.generic import DetailView
from django.http import JsonResponse
from ..models import Recipe, Favourite, Rating
from ..forms import CommentForm


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
                - 'avg_rating' (float): The average rating of the recipe.
                - 'rating_count' (int): The number of ratings for the recipe.
                - 'stars_range' (range): A range object used to create the star
                buttons.
                - 'user_rating' (int): The rating given by the current user for
                the recipe.
                - 'comments' (QuerySet): The comments associated with the
                recipe.
                - 'no_of_comments' (int): The number of approved comments for
                the recipe.
                - 'comment_form' (CommentForm): The form for adding comments.
        """
        context = super().get_context_data(**kwargs)
        recipe = self.get_object()
        user = self.request.user
        # print("Image url:", recipe.feature_image.secure_url)
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

                return JsonResponse(
                    {'data': response_data,
                        'message': "Comment successfully posted!"}, status=200)

            # If the form is invalid
            return JsonResponse(
                {'message': "Sorry, comment is invalid."}, status=400)

        # If the form is invalid
        return JsonResponse(
            {'message': "You must be logged in to comment"},
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
                {'message': 'Comment could not be found'},
                status=400)

        if comment.author == request.user:
            comment.delete()
            return JsonResponse({'message': "Comment succesfully deleted!"},
                                status=200)
        else:
            return JsonResponse(
                {'message': "You are not authorised to delete this comment"},
                status=401)

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
                {'message': 'Comment not found'}, status=400)

        elif comment.author != request.user:
            return JsonResponse(
                {'message': 'You are not authorised to edit this comment'},
                status=401)

        elif data["body"] == comment.body:
            return JsonResponse(
                {'message': "Comment not updated, no change was made"},
                status=400)

        if not comment.approved:
            comment.approved = True
        form = CommentForm(data, instance=comment)  # Create a form instance

        if form.is_valid():
            form.save()  # Updates the comment
            return JsonResponse(
                {'message': "Comment successfully updated!"}, status=200)

        else:
            return JsonResponse(
                {'message': "Sorry, comment not updated"}, status=400)
