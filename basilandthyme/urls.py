""" URL configuration for basilandthyme project. """
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("", include("recipe_book.urls"), name="recipe-book-urls"),
    path("accounts/", include("allauth.urls")),
    path('admin/', admin.site.urls),
    path('summernote/', include('django_summernote.urls')),
]

handler404 = "recipe_book.views.page_not_found_view"
handler500 = "recipe_book.views.server_error_view"
