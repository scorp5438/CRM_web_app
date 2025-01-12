from django.http import HttpRequest, HttpResponse
from django.shortcuts import render
from django.contrib.auth.decorators import login_required


@login_required
def exam_view(request: HttpRequest) -> HttpResponse:
    mode = request.GET.get("mode")
    company = request.GET.get("company")
    if mode:
        request.session['mode'] = mode
    if company:
        request.session['company'] = company
    return render(request, 'index.html', {})

