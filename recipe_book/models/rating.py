from django.db import models
from django.contrib.auth.models import User
from .recipe import Recipe


class Rating(models.Model):
    """
    Model representing ratings given by users to recipes.

    Attributes:
        - user (ForeignKey to User): The user who rated the recipe.
        - recipe (ForeignKey to Recipe): The recipe being rated.
        - rating (IntegerField): The rating value given by the user, ranging
        from 1 to 5.

    Meta:
        constraints (list of constraints): Ensures that each user can rate a
        recipe only once.

    Methods:
        - __str__(): Returns a string representation of the Rating object.
        - get_recipe_avg_rating(recipe_id): Calculates the average rating for a
        given recipe.
        - get_recipe_no_of_ratings(recipe_id): Gets the number of ratings for a
        given recipe.
        - get_user_rating_of_recipe(user_id, recipe_id): Retrieves the rating
        given by a specific user to a recipe.
    """
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
        Returns a string representation of the Rating object.

        Returns:
            str: A string indicating which user gave a rating, of what value,
            and to which recipe.
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
        """
        Retrieves the rating given by a specific user to a recipe, if it
        exists.

        Args:
            user_id (int): The ID of the user.
            recipe_id (int): The ID of the recipe.

        Returns:
            int or None: The rating given by the user to the recipe, or None if
            the user hasn't rated the recipe.
        """
        try:
            user_rating = cls.objects.get(
                recipe=recipe_id, user=user_id).rating
        except cls.DoesNotExist:
            user_rating = None

        return user_rating
