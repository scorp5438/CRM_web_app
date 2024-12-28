from django.urls import path, include

from rest_framework.routers import DefaultRouter

from profiles.api.views import CompaniesApiView, UserExamApiView, AdminCcApiView
from testing.api.views import ExamApiView, ExamCreateApiView, ExamUpdateApiView
from .view import TestCSRFView

router = DefaultRouter()
router.register(r'testing', ExamApiView, basename='testing')
router.register(r'companies', CompaniesApiView, basename='companies')
router.register(r'user_exam', UserExamApiView, basename='user_exam')
router.register(r'add_exam', ExamCreateApiView, basename='add_exam')
router.register(r'update_exam', ExamUpdateApiView, basename='update_exam')
router.register(r'admin_cc', AdminCcApiView, basename='admin_cc')

urlpatterns = [
    path('get-csrf-token/', TestCSRFView.get_csrf_token, name='get-csrf-token'),
    path('', include(router.urls))
]

# urlpatterns += router.urls
