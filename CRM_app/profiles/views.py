import json
from django.contrib.auth.views import LoginView, LogoutView
from django.urls import reverse_lazy
from django.http import JsonResponse
from django.contrib.auth import authenticate, login
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.views import View


@login_required
def index(request):
     return render(request, 'index.html', {})

class MyLoginView(View):
    def post(self, request, *args, **kwargs):
        try:
            # Получаем данные из JSON
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')

            if not username or not password:
                return JsonResponse({'success': False, 'error': 'Логин и пароль обязательны'}, status=400)

            # Аутентификация пользователя
            user = authenticate(request, username=username, password=password)
            if user:
                login(request, user)
                data_user = {'username': user.username,
                             'full_name': user.profile.full_name,
                             'is_staff': user.is_staff,
                             'id': user.id,
                             'company': user.profile.company.name,
                             'company_id': user.profile.company.id,
                             'post': user.profile.post}
                return JsonResponse({'success': True, 'user': data_user}, status=200)

            return JsonResponse({'success': False, 'error': 'Неверные учетные данные'}, status=401)
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'error': 'Неверный формат JSON'}, status=400)

# class MyLogoutView(View):
#     next_page = reverse_lazy('myauth_profiles:login')
# views.py
from django.contrib.auth import logout
from django.http import JsonResponse


def logout_view(request):
    if request.method == 'POST':
        logout(request)
        return JsonResponse({'message': 'Logged out'})
    return JsonResponse({'error': 'Method not allowed'}, status=405)




