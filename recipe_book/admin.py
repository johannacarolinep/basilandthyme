from django.contrib import admin
from .models import Recipe, Comment, Favourite, Rating

# Register your models here.
admin.site.register(Recipe)
admin.site.register(Comment)
admin.site.register(Favourite)
admin.site.register(Rating)
