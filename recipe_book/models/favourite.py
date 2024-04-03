from django.db import models
from django.contrib.auth.models import User
from .recipe import Recipe


class Favourite(models.Model):
    """
    Model representing the favourites of users for recipes.

    Attributes:
        user (ForeignKey to User): The user who favourited the recipe.
        recipe (ForeignKey to Recipe): The recipe favourited by the user.

    Meta:
        constraints (list of constraints): Ensures that each user can mark a
        recipe as a favourite only once.

    Methods:
        - __str__(): Returns a string representation of the Favourite object.
        - is_recipe_favourite(user, recipe): Checks if a recipe is marked as a
        favourite by a user.
        - is_recipe_favourite_by_ids(user_id, recipe_id): Checks if a recipe is
        marked as a favourite by a user, given user ID and recipe ID.
        - get_user_favourite_ids(user): Retrieves the IDs of recipes favourited
        by a user.
        - create_favourite(user_id, recipe_id): Create a Favourite object given
        a user id and recipe id, given that the favourite object does not
        already exist.
        - delete_favourite(user_id, recipe_id): Delete a Favourite object given
        a user id and recipe id, given that the favourite object exists.
    """
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='favourite_user'
    )
    recipe = models.ForeignKey(
        Recipe, on_delete=models.CASCADE, related_name='favourite_recipe'
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'recipe'], name='unique_favourite')
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
            return cls.objects.filter(
                user=user).values_list('recipe', flat=True)
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
