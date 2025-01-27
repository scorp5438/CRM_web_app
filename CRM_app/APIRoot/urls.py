from django.urls import path, include

from rest_framework.routers import DefaultRouter

from profiles.api.views import CompaniesApiView, UserExamApiView, AdminCcApiView, AdminMainApiView, OperatorApiView, \
    LinesApiView
from testing.api.views import ExamApiView, ExamCreateApiView, ExamUpdateApiView, ResultApiView
from checklists.api.views import MistakeApiView, SubMistakeApiView, ChListCreateApiView, ChListApiView
from .view import TestCSRFView

router = DefaultRouter()
router.register(r'testing', ExamApiView, basename='testing')
router.register(r'companies', CompaniesApiView, basename='companies')
router.register(r'user_exam', UserExamApiView, basename='user_exam')
router.register(r'add_exam', ExamCreateApiView, basename='add_exam')
router.register(r'update_exam', ExamUpdateApiView, basename='update_exam')
router.register(r'admin_cc', AdminCcApiView, basename='admin_cc')
router.register(r'admin_main', AdminMainApiView, basename='admin_main')
router.register(r'results', ResultApiView, basename='results')
router.register(r'mistakes', MistakeApiView, basename='mistakes')
router.register(r'sub-mistakes', SubMistakeApiView, basename='sub-mistakes')
router.register(r'create_ch-list', ChListCreateApiView, basename='create_ch-list')
router.register(r'operators', OperatorApiView, basename='operators')
router.register(r'lines', LinesApiView, basename='lines')
router.register(r'ch-list', ChListApiView, basename='ch-list')

urlpatterns = [
    path('get-csrf-token/', TestCSRFView.get_csrf_token, name='get-csrf-token'),
    path('', include(router.urls))
]

# urlpatterns += router.urls
