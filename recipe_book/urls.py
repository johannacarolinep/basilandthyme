from . import views
from django.urls import path


urlpatterns = [
    path('', views.FeaturesListView.as_view(), name='home_page'),
    path('recipes/', views.RecipeListView.as_view(), name='recipe_list_page'),
]
