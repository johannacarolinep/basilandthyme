from django.contrib import admin
from django_summernote.admin import SummernoteModelAdmin
from .models import Recipe, Comment, Favourite, Rating


@admin.register(Recipe)
class RecipeAdmin(SummernoteModelAdmin):
    """
    Customising the Django admin panel for the Recipe model.

    Attributes:
        list_display (tuple): Specifies the fields to display in the list view.
        search_fields (list): Specifies the fields to search on.
        list_filter (tuple): Specifies the fields to filter by.
        prepopulated_fields (dict): Specifies the fields to automatically
            populate based on another field.
        summernote_fields (tuple): A tuple specifying the fields to use
        summernote for text editing.
        fieldsets (list): A list of fieldset configurations for organizing
        fields and adding instructions in the interface.
    """
    list_display = ('title', 'slug', 'status', 'created_on')
    search_fields = ['title', 'content']
    list_filter = ('status', 'created_on', 'category',)
    prepopulated_fields = {'slug': ('title',)}
    summernote_fields = ('content', 'ingredients',)
    fieldsets = [
        (
            "Recipe details",
            {
                "fields": ["title", "slug", "category", "status", "author"],
                "classes": ["wide"],
            },
        ),
        (
            "Recipe image",
            {
                "fields": ["feature_image", "alt_text"],
                "description": "Use image of dimension 3:2 (width:height) if" +
                " possible. Images may otherwise be cropped. " + "<br>" +
                "Please provide a custom alt text (short image description).",
            },
        ),
        (
            "Content and ingredients",
            {
                "fields": ["content", "ingredients", "teaser"],
                "description": "Use only the provided formatter." +
                "<strong>DO NOT</strong> copy paste pre-formatted content.",
            },
        )
    ]


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    """
    Customising the Django admin panel for the Comment model.

    Attributes:
        list_display (tuple): Specifies the fields to display in the list view.
        list_filter (tuple): Specifies the fields to filter by.
    """
    list_display = ('recipe', 'author', 'approved', 'created_on')
    list_filter = ('approved',)


# Register your models here.
admin.site.register(Favourite)
admin.site.register(Rating)
