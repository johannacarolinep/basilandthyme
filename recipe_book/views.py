from django.views.generic import ListView
from django.shortcuts import render
from django.http import HttpResponse
from .models import Recipe


# Create your views here.
class RecipeListView(ListView):
    queryset = Recipe.objects.all()
    template_name = 'recipe_book/recipes.html'
    paginate_by = 8


def hello(request):
    return HttpResponse("Hello world!")
