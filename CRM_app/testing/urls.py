from rest_framework.routers import SimpleRouter

from .views import ExamView

router = SimpleRouter()
router.register(r'testing', ExamView, basename='testing')

urlpatterns = []

urlpatterns += router.urls
