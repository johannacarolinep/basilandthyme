import json
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from ..models import Recipe, Favourite


@require_POST
def add_remove_favourite(request):
    """
    View to handle POST request (Favourites buttons)
    """
    if request.method == 'POST':
        user = request.user
        if user.is_authenticated:
            user_id = user.id
            try:
                data = json.loads(request.body)
                recipe_id = data.get("recipeId")
                is_favourite = Favourite.is_recipe_favourite_by_ids(
                    user_id, recipe_id)
                # handle case where recipe is a favourite of the user
                if (is_favourite):
                    confirm = Favourite.delete_favourite(user_id, recipe_id)
                    if (confirm):
                        return JsonResponse(
                            {"action": "removed",
                                "message": "Removed from favourites: " + Recipe.objects.get(id=recipe_id).title},
                            status=200)
                # handle case where recipe is not a favourite of the user
                else:
                    confirm = Favourite.create_favourite(user_id, recipe_id)
                    if (confirm):
                        return JsonResponse(
                            {"action": "created", "message": "Added to favourites: " + Recipe.objects.get(id=recipe_id).title},
                            status=200)
            except json.JSONDecodeError:
                return JsonResponse(
                    {"message": "Sorry, something went wrong!"},
                    status=400)
        else:
            return JsonResponse(
                        {"message": "Log in to favourite recipes"},
                        status=401)
