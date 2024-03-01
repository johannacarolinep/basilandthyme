from . import views
from django.urls import path


urlpatterns = [
    path('', views.hello, name='hello'),
    path('recipes/', views.RecipeListView.as_view(), name='recipe-list-page'),
]
