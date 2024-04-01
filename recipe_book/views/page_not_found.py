from django.http import HttpResponseNotFound
from django.shortcuts import render


def page_not_found_view(request, exception):
    return HttpResponseNotFound(render(request, "404.html", {}))
