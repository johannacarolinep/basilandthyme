import json
from django.http import JsonResponse
from django.views.decorators.http import require_POST, require_http_methods
from ..models import Recipe, Rating


@require_POST
def add_update_rating(request):
    """
    View to handle POST request (Ratings)
    """
    if request.method == 'POST':
        # Get user
        user = request.user
        if user.is_authenticated:
            try:
                data = json.loads(request.body)
                recipe_id = data.get("recipeId")
                rating_value = data.get("rating")

            except json.JSONDecodeError:
                return JsonResponse(
                    {"message": "Sorry! Something went wrong."},
                    status=400)

            # check if there is an existing rating
            try:
                existing_rating = Rating.objects.get(
                    recipe=recipe_id, user=user.id)
            except Rating.DoesNotExist:
                existing_rating = None

            if not existing_rating:
                # create a new rating
                Rating.objects.create(
                    user=user, recipe_id=recipe_id, rating=rating_value)
                rating_count = Rating.get_recipe_no_of_ratings(recipe_id)
                recipe_average = Rating.get_recipe_avg_rating(recipe_id)
                return JsonResponse(
                    {"message": rating_value + " star rating added to " + Recipe.objects.get(id=recipe_id).title,
                        "count": rating_count,
                        "average": recipe_average},
                    status=200)

            else:
                # update existing rating
                existing_rating.rating = data.get("rating")
                existing_rating.save()
                rating_count = Rating.get_recipe_no_of_ratings(recipe_id)
                recipe_average = Rating.get_recipe_avg_rating(recipe_id)
                return JsonResponse(
                    {"message": "Rating updated for " + Recipe.objects.get(id=recipe_id).title,
                        "count": rating_count,
                        "average": recipe_average},
                    status=200)
        else:
            return JsonResponse(
                            {"message": "You need to be logged in to rate recipes!"},
                            status=401)


@require_http_methods(["DELETE"])
def delete_rating(request):
    if request.method == 'DELETE':
        user = request.user
        if user.is_authenticated:
            try:
                recipe_id = request.GET.get("recipeId")
                try:
                    existing_rating = Rating.objects.get(
                        recipe=recipe_id, user=user.id)
                    existing_rating.delete()
                    rating_count = Rating.get_recipe_no_of_ratings(recipe_id)
                    recipe_average = Rating.get_recipe_avg_rating(recipe_id)
                    return JsonResponse(
                        {"message": "Rating deleted for recipe " + Recipe.objects.get(id=recipe_id).title,
                            "count": rating_count,
                            "average": recipe_average},
                        status=200)

                except Rating.DoesNotExist:
                    return JsonResponse(
                        {"message": "Sorry, we could not find this rating"},
                        status=400)

            except json.JSONDecodeError:
                return JsonResponse(
                    {"message": "Sorry, something went wrong!"},
                    status=400)
        else:
            return JsonResponse(
                        {"message": "You must be logged in to rate recipes"},
                        status=401)
