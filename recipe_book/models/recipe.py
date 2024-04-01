from django.db import models
from django.contrib.auth.models import User
from cloudinary.models import CloudinaryField


class Recipe(models.Model):
    """
    Model representing a recipe.

    Attributes:
    - title (CharField): The unique title of the recipe.
    - slug (SlugField): A unique slug for the recipe URL.
    - author (ForeignKey to User): The user who authored the recipe.
    - feature_image (CloudinaryField): The main image of the recipe.
    - alt_text (CharField): Alternative text for the feature image.
    - content (TextField): The detailed content, including recipe instructions.
    - ingredients (TextField): Ingredients required for the recipe.
    - teaser (CharField): A short teaser/description of the recipe.
    - created_on (DateTimeField): Date and time when the recipe was created.
    - updated_on (DateTimeField): Date and time when the recipe was last
    updated.
    - category (IntegerField): Category of the recipe (e.g., Chicken, Pork).
    - status (IntegerField): Status of the recipe (e.g., Draft, Published).
    """

    # Choices for the categories and status fields
    CATEGORIES = (
        (0, "No category selected"),
        (1, "Chicken"),
        (2, "Pork"),
        (3, "Beef"),
        (4, "Fish"),
        (5, "Vegetarian")
    )
    STATUS = ((0, "Draft"), (1, "Published"))

    title = models.CharField(max_length=70, unique=True)
    slug = models.SlugField(max_length=70, unique=True)
    author = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="user_recipes")
    feature_image = CloudinaryField('image', default='placeholder')
    alt_text = models.CharField(
        max_length=125, default='This ia a placeholder image')
    content = models.TextField()
    ingredients = models.TextField()
    teaser = models.CharField(max_length=180)
    created_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True)
    category = models.IntegerField(choices=CATEGORIES, default=0)
    status = models.IntegerField(choices=STATUS, default=0)

    def __str__(self):
        return f"{self.title}"
