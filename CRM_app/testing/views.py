from django.http import HttpRequest, HttpResponse
from django.shortcuts import render
from django.contrib.auth.decorators import login_required


@login_required
def exam_view(request: HttpRequest) -> HttpResponse:
    return render(request, 'index.html', {})
