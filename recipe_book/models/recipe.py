from django.db import models
from django.core.validators import MinLengthValidator, MaxLengthValidator
from django.contrib.auth.models import User
from cloudinary.models import CloudinaryField


class Recipe(models.Model):
    """
    Model representing a recipe.

    Attributes:
    - title (CharField): The unique title of the recipe. May not be empty and
    must not exceed 70 characters.
    - slug (SlugField): A unique slug for the recipe URL. May not be empty and
    must not exceed 70 characters.
    - author (ForeignKey to User): The user who authored the recipe.
    - feature_image (CloudinaryField): The image of the recipe.
    - alt_text (CharField): Alt-text for the feature image.
    - content (TextField): The detailed content, including recipe instructions.
    Must be 100-5000 characters.
    - ingredients (TextField): Ingredients required for the recipe. Must be
    10-2500 characters.
    - teaser (CharField): A short teaser/description of the recipe. May not be
    empty and must not exceed 180 characters.
    - created_on (DateTimeField): Date and time when the recipe was created. Is
    set automatically on recipe creation.
    - updated_on (DateTimeField): Date and time when the recipe was last
    updated, set automatically when recipe is updated.
    - category (IntegerField): Category of the recipe (e.g., Chicken, Pork).
    Default is 0 - "No category selected".
    - status (IntegerField): Status of the recipe (e.g., Draft, Published).
    Default is 0 - "Draft".

    Choices:
        CATEGORIES (tuple): Choices for the categories field.
        STATUS (tuple): Choices for the status field.

    Meta:
        ordering (list): Specifies the default ordering for the model, by
        date/time in descending order.

    Methods:
        __str__(): Returns a string representation of the Recipe object.
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

    title = models.CharField(
        null=False,
        max_length=70,
        blank=False,
        unique=True)
    slug = models.SlugField(
        null=False,
        max_length=70,
        blank=False,
        unique=True)
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="user_recipes")
    feature_image = CloudinaryField(
        'image',
        default='placeholder',
        help_text="Image dimension 3:2 will work best.")
    alt_text = models.CharField(
        max_length=125,
        default='This ia a placeholder image')
    content = models.TextField(validators=[
            MinLengthValidator(
                100, message="The text must be at least 100 characters."),
            MaxLengthValidator(
                5000, message="The text must not exceed 5000 characters.")
        ],
        null=False,
        blank=False,
        help_text="Please only use the built in formatter. Don't copy paste!")
    ingredients = models.TextField(
        validators=[
            MinLengthValidator(
                10, message="The text must be at least 10 characters."),
            MaxLengthValidator(
                2500, message="The text must not exceed 2500 characters.")
        ],
        null=False,
        blank=False,
        help_text="Please only use the built in formatter. Don't copy paste!")
    teaser = models.CharField(null=False, max_length=180, blank=False)
    created_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True)
    category = models.IntegerField(choices=CATEGORIES, default=0)
    status = models.IntegerField(choices=STATUS, default=0)

    class Meta:
        ordering = ["-created_on"]

    def __str__(self):
        """
        Returns a string representation of the Recipe object.

        Returns:
            str: The recipe title.
        """
        return self.title
