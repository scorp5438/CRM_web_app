from django.urls import path


from .views import MyLoginView, index, logout_view

app_name = 'profiles'

urlpatterns = [
    path('login/',
         MyLoginView.as_view(

         ), name='login'),
#     path('logout/', MyLogoutView.as_view(), name='logout'),
    path('logout', logout_view, name='logout'),
    path('', index, name='index')
]
