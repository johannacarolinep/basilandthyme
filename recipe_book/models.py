from django.db import models
from django.contrib.auth.models import User
from cloudinary.models import CloudinaryField


# Create your models here.
class Recipe(models.Model):
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


class Comment(models.Model):
    recipe = models.ForeignKey(
        Recipe, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='comment_author')
    body = models.TextField()
    approved = models.BooleanField(default=True)
    created_on = models.DateTimeField(auto_now_add=True)


class Favourite(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='favourite_user'
    )
    recipe = models.ForeignKey(
        Recipe, on_delete=models.CASCADE, related_name='favourite_recipe'
    )


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
