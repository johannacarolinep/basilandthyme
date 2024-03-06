from django.views.generic import ListView
from django.shortcuts import render
from django.db.models import Q
from .models import Recipe


# Create your views here.
class RecipeListView(ListView):
    # queryset = Recipe.objects.all()
    model = Recipe
    template_name = 'recipe_book/recipes.html'
    paginate_by = 8

    def get_queryset(self):
        query = self.request.GET.get("q")
        if query:
            match query:
                case "all":
                    return Recipe.objects.all()
                case "chicken":
                    return Recipe.objects.filter(category=1)
                case "pork":
                    return Recipe.objects.filter(category=2)
                case "beef":
                    return Recipe.objects.filter(category=3)
                case "fish":
                    return Recipe.objects.filter(category=4)
                case "vegetarian":
                    return Recipe.objects.filter(category=5)
                case _:
                    return Recipe.objects.filter(
                        Q(title__icontains=query) | Q(ingredients__icontains=query)
                    )
        else:
            return Recipe.objects.all()


class FeaturesListView(ListView):
    model = Recipe
    template_name = 'recipe_book/index.html'
