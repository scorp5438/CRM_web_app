from django.http import HttpRequest, HttpResponse
from django.shortcuts import render
from django.contrib.auth.decorators import login_required


@login_required
def ch_list_view(request):
    return render(request, 'index.html', {})
