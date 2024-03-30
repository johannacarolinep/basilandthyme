from django.db import models
from django.contrib.auth.models import User
from cloudinary.models import CloudinaryField


# Create your models here.
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


class Comment(models.Model):
    """
    Model representing comments on recipes.

    Attributes:
        recipe (ForeignKey to Recipe): The recipe being commented on.
        author (ForeignKey to User): The user who wrote the comment.
        body (TextField): The text content of the comment.
        approved (BooleanField): Indicates whether the comment has been
        approved by the site admin. Is True by default.
        created_on (DateTimeField): The date and time of comment creation.
    """
    recipe = models.ForeignKey(
        Recipe, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='comment_author')
    body = models.TextField()
    approved = models.BooleanField(default=True)
    created_on = models.DateTimeField(auto_now_add=True)


class Favourite(models.Model):
    """
    Model representing the favourites of users for recipes.

    Attributes:
        user (ForeignKey to User): The user who favourited the recipe.
        recipe (ForeignKey to Recipe): The recipe favourited by the user.

    Meta:
        unique_together = ('user', 'recipe'): Ensures that each user can mark a
        recipe as a favourite only once.
    """
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='favourite_user'
    )
    recipe = models.ForeignKey(
        Recipe, on_delete=models.CASCADE, related_name='favourite_recipe'
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'recipe'], name='unique_favourite')
        ]

    def __str__(self):
        """
        Returns a string representation of the Favourite object.

        Returns:
            str: A string indicating which user favourited which recipe.
        """
        return f"{self.user} favourited '{self.recipe}'"

    @classmethod
    def is_recipe_favourite(cls, user, recipe):
        """
        Checks if a recipe is marked as a favourite by a user.

        Args:
            user (User): The user object.
            recipe (Recipe): The recipe object.

        Returns:
            bool: True if the recipe is favourited by the user, else False.
        """
        if user.is_authenticated:
            return cls.objects.filter(user=user, recipe=recipe).exists()
        else:
            return False

    @classmethod
    def is_recipe_favourite_by_ids(cls, user_id, recipe_id):
        """
        Checks if a recipe is marked as a favourite by a user, given user ID
        and recipe ID.

        Args:
            user_id (int): The ID of the user.
            recipe_id (int): The ID of the recipe.

        Returns:
            bool: True if the recipe is favourited by the user, else False.
        """
        if user_id:
            return cls.objects.filter(
                user_id=user_id, recipe_id=recipe_id).exists()
        else:
            return False

    @classmethod
    def get_user_favourite_ids(cls, user):
        """
        Retrieves the IDs of recipes favourited by a user.

        Args:
            user (User): The user object.

        Returns:
            list: A list of recipe IDs favourited by the user.
        """
        if user.is_authenticated:
            return cls.objects.filter(user=user).values_list('recipe', flat=True)
        return []

    @classmethod
    def create_favourite(cls, user_id, recipe_id):
        """
        Create a Favourite object given a user id and recipe id, given that
        the favourite object does not already exist.

        Args:
            user_id (int): The id of the user.
            recipe_id (int): The id of the recipe.

        Returns:
            bool: True if Favourite was created, else False.
        """
        user = User.objects.get(pk=user_id)
        recipe = Recipe.objects.get(pk=recipe_id)
        if not cls.objects.filter(user=user, recipe=recipe).exists():
            cls.objects.create(user=user, recipe=recipe)
            return True
        return False

    @classmethod
    def delete_favourite(cls, user_id, recipe_id):
        """
        Delete a Favourite object given a user id and recipe id, given that
        the favourite object exists.

        Args:
            user_id (int): The id of the user.
            recipe_id (int): The id of the recipe.

        Returns:
            bool: True if Favourite was deleted, else False.
        """
        user = User.objects.get(pk=user_id)
        recipe = Recipe.objects.get(pk=recipe_id)
        if cls.objects.filter(user=user, recipe=recipe).exists():
            favourite = cls.objects.get(user=user, recipe=recipe)
            favourite.delete()
            return True
        return False


class Rating(models.Model):
    RATING_CHOICES = [
        (1, '1'),
        (2, '2'),
        (3, '3'),
        (4, '4'),
        (5, '5'),
    ]

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='user_rating'
    )
    recipe = models.ForeignKey(
        Recipe, on_delete=models.CASCADE, related_name='rating_recipe'
    )
    rating = models.IntegerField(choices=RATING_CHOICES)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'recipe'],
                                    name='unique_rating')
        ]

    def __str__(self):
        """
        Returns a string representation of the Favourite object.

        Returns:
            str: A string indicating which user favourited which recipe.
        """
        return f"{self.user} gave a rating of {self.rating} to '{self.recipe}'"

    @classmethod
    def get_recipe_avg_rating(cls, recipe_id):
        """
        Calculates the average rating for a given recipe.

        Args:
            recipe_id (int): The ID of the recipe.

        Returns:
            float or None: The average rating of the recipe, or None if no
            the recipe has no ratings.
        """
        ratings = cls.objects.filter(recipe=recipe_id)
        return ratings.aggregate(
            avg_rating=models.functions.Coalesce(
                models.Avg('rating'), 0.0))['avg_rating']

    @classmethod
    def get_recipe_no_of_ratings(cls, recipe_id):
        """
        Gets the number of ratings for a given recipe.

        Args:
            recipe_id (int): The ID of the recipe.

        Returns:
            Integer: The number of ratings for a given recipe.
        """
        return cls.objects.filter(recipe=recipe_id).count()

    @classmethod
    def get_user_rating_of_recipe(cls, user_id, recipe_id):
        try:
            user_rating = cls.objects.get(
                recipe=recipe_id, user=user_id).rating
        except cls.DoesNotExist:
            user_rating = None

        return user_rating
