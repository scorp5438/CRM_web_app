from django.urls import path

from .views import exam_view

urlpatterns = [
    path('', exam_view, name='exam'),
]


