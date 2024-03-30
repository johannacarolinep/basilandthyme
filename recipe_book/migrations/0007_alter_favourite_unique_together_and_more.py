# Generated by Django 4.2.10 on 2024-03-28 21:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('recipe_book', '0006_alter_recipe_category_and_more'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='favourite',
            unique_together=set(),
        ),
        migrations.AddConstraint(
            model_name='favourite',
            constraint=models.UniqueConstraint(fields=('user', 'recipe'), name='unique_favourite'),
        ),
        migrations.AddConstraint(
            model_name='rating',
            constraint=models.UniqueConstraint(fields=('user', 'recipe'), name='unique_rating'),
        ),
    ]