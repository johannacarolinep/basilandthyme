from django.views.generic import ListView
from django.shortcuts import render
from django.http import HttpResponse
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
            # print("Query:-------------", query)
            object_list = Recipe.objects.filter(
                Q(title__icontains=query) | Q(ingredients__icontains=query)
            )
            return object_list
        else:
            return Recipe.objects.all()


def hello(request):
    return HttpResponse("Hello world!")
