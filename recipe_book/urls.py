from . import views
from django.urls import path


urlpatterns = [
    path('', views.FeaturesListView.as_view(), name='home_page'),
    path('recipes/', views.RecipeListView.as_view(), name='recipe_list_page'),
    path('recipes/<slug:slug>/', views.RecipeDetailView.as_view(), name='recipe_detail'),
    path('favourites/', views.FavouritesList.as_view(), name='favourites_page'),
    path('add-remove-favourite/', views.add_remove_favourite, name='add_remove_favourite'),
    path('add-update-rating/', views.add_update_rating, name='add_update_rating'),
]
