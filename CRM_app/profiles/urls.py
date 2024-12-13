from django.contrib.auth.views import LoginView
from django.urls import path
from rest_framework import routers
from rest_framework.routers import DefaultRouter

from .views import MyLogoutView, CompaniesView

app_name = 'profiles'

urlpatterns = [
    path('login/',
         LoginView.as_view(
             template_name='profiles/login.html',
             redirect_authenticated_user=True
         ), name='login'),
    path('logout/', MyLogoutView.as_view(), name='logout'),
]