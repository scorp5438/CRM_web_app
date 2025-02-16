from django.urls import path

from .views import ch_list_view

urlpatterns = [
    path('', ch_list_view, name='ch_list'),
]