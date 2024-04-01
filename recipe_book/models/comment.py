from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MaxLengthValidator
from .recipe import Recipe


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
    body = models.TextField(validators=[
            MaxLengthValidator(
                1200, message="The text must not exceed 1200 characters.")
        ],
        null=False,
        blank=False)
    approved = models.BooleanField(default=True)
    created_on = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_on"]

    def __str__(self):
        return f"{self.author} commented '{self.recipe}'"
