from checklists.api.views import MistakeApiView, SubMistakeApiView, ChListApiView, ComplaintsApiView, CheckDoubleChListApiView
from django.urls import path, include
from profiles.api.views import CompaniesApiView, UserExamApiView, AdminApiView, OperatorApiView, \
    LinesApiView, TableUserData
from rest_framework.routers import DefaultRouter
from testing.api.views import ExamApiView, ExamUpdateApiView, ResultApiView

from .view import TestCSRFView


app_name = 'api-root'

router = DefaultRouter()
router.register(r'testing', ExamApiView, basename='testing')
router.register(r'companies', CompaniesApiView, basename='companies')
router.register(r'user_exam', UserExamApiView, basename='user_exam')
router.register(r'update_exam', ExamUpdateApiView, basename='update_exam')
router.register(r'admin', AdminApiView, basename='admin')
router.register(r'results', ResultApiView, basename='results')
router.register(r'mistakes', MistakeApiView, basename='mistakes')
router.register(r'sub-mistakes', SubMistakeApiView, basename='sub-mistakes')
router.register(r'operators', OperatorApiView, basename='operators')
router.register(r'lines', LinesApiView, basename='lines')
router.register(r'ch-list', ChListApiView, basename='ch-list')
router.register(r'complaints', ComplaintsApiView, basename='complaints')
router.register(r'check_double', CheckDoubleChListApiView, basename='check_double')
router.register(r'table_data', TableUserData, basename='table_data')

urlpatterns = [
    path('get-csrf-token/', TestCSRFView.get_csrf_token, name='get-csrf-token'),
    path('', include(router.urls))
]

# urlpatterns += router.urls
