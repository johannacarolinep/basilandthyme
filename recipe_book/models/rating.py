from django.db import models
from django.contrib.auth.models import User
from .recipe import Recipe


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
