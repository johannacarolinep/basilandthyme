from django.views.generic import ListView, DetailView
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
        Based on https://docs.djangoproject.com/en/5.0/topics/class-based-views/generic-display/#adding-extra-context
        Adding additional context
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

        return context


class FeaturesListView(ListView):
    model = Recipe
    template_name = 'recipe_book/index.html'


class RecipeDetailView(DetailView):
    queryset = Recipe.objects.filter(status=1)
    template_name = "recipe_book/recipe-page.html"
    context_object_name = "recipe"
    slug_url_kwarg = "slug"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        recipe = self.get_object()
        return context
