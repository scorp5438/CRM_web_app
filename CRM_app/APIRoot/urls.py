from django.urls import path, include

from rest_framework.routers import DefaultRouter

from profiles.api.views import CompaniesApiView
from testing.api.views import ExamApiView
from .view import TestCSRFView

router = DefaultRouter()
router.register(r'testing', ExamApiView, basename='testing')
router.register(r'companies', CompaniesApiView, basename='companies')

urlpatterns = [
    path('get-csrf-token/', TestCSRFView.get_csrf_token, name='get-csrf-token'),
    path('', include(router.urls))
]

# urlpatterns += router.urls
