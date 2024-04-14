from django.utils.translation import gettext_lazy as _
from .models import Comment
from django import forms


class CommentForm(forms.ModelForm):
    """
    Form class for creating and updating Comment instances.

    Attributes:
        model (Model): The model associated with the form.
        fields (tuple): A tuple specifying the fields in the form.
        labels (dict): A dictionary specifying the labels for form fields.
        widgets (dict): A dictionary specifying the widgets to use for form
        fields.

    Credit for infor about widgets:
    https://docs.djangoproject.com/en/5.0/topics/forms/modelforms/#specifying-widgets-to-use-in-the-form-with-widgets

    """
    class Meta:
        model = Comment
        fields = ('body',)
        labels = {'body': _('Comment:'), }
        widgets = {
            'body': forms.Textarea(
                attrs={'placeholder': 'Write your comment here...'})
        }
