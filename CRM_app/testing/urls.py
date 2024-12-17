from django.urls import path

from .views import TestExamView

urlpatterns = [
    path('', TestExamView.as_view(), name='exam'),
]


