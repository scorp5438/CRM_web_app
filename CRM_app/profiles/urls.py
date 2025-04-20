from django.urls import path


from .views import MyLoginView, index, MyLogoutView

app_name = 'profiles'

urlpatterns = [
    path('login/',
         MyLoginView.as_view(
             template_name='index.html',
             redirect_authenticated_user=True
         ), name='login'),
    path('logout/', MyLogoutView.as_view(), name='logout'),

    path('', index, name='index')
]
