from django.http import HttpResponseNotFound
from django.shortcuts import render


def page_not_found_view(request, exception):
    """
    View to render a custom 404 page.

    Args:
        request (HttpRequest): The HTTP request object.
        exception (Exception): The exception that triggered the 404 error.

    Returns:
        HttpResponseNotFound: HTTP response with the rendered 404 page.
    """
    return HttpResponseNotFound(render(request, "errors/404.html", {}))


def server_error_view(request):
    """
    View to render a custom 404 page.

    Args:
        request (HttpRequest): The HTTP request object.
        exception (Exception): The exception that triggered the 404 error.

    Returns:
        HttpResponseNotFound: HTTP response with the rendered 404 page.
    """
    return HttpResponseNotFound(render(request, "errors/500.html", {}))
