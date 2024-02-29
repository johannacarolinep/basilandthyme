from django.contrib import admin
from django_summernote.admin import SummernoteModelAdmin
from .models import Recipe, Comment, Favourite, Rating


@admin.register(Recipe)
class RecipeAdmin(SummernoteModelAdmin):

    list_display = ('title', 'slug', 'status', 'created_on')
    search_fields = ['title', 'content']
    list_filter = ('status', 'created_on', 'category',)
    prepopulated_fields = {'slug': ('title',)}
    summernote_fields = ('content', 'ingredients',)


# Register your models here.
admin.site.register(Comment)
admin.site.register(Favourite)
admin.site.register(Rating)
