from django.urls import path

from .views import ch_list_view, complaints

urlpatterns = [
    path('', ch_list_view, name='ch_list'),
    path('complaints/', complaints, name='complaints'),

]