from django.urls import path, include

from rest_framework.routers import DefaultRouter

from profiles.views import CompaniesView
from testing.views import ExamView
from .view import TestCSRFView

router = DefaultRouter()
router.register(r'testing', ExamView, basename='testing')
router.register(r'companies', CompaniesView, basename='companies')

urlpatterns = [
    path('get-csrf-token/', TestCSRFView.get_csrf_token, name='get-csrf-token'),
    path('', include(router.urls))
]

# urlpatterns += router.urls
