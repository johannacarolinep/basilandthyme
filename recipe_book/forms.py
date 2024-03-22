from django.utils.translation import gettext_lazy as _
from .models import Comment
from django import forms


class CommentForm(forms.ModelForm):

    class Meta:
        model = Comment
        fields = ('body',)
        labels = {'body': _('Comment:'), }
        # https://docs.djangoproject.com/en/5.0/topics/forms/modelforms/#specifying-widgets-to-use-in-the-form-with-widgets
        widgets = {
            'body': forms.Textarea(
                attrs={'placeholder': 'Write your comment here...'})
        }
