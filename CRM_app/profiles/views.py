import json
from django.contrib.auth.views import LoginView, LogoutView
from django.urls import reverse_lazy
from django.http import JsonResponse
from django.contrib.auth import authenticate, login
from django.shortcuts import render
from django.contrib.auth.decorators import login_required



@login_required
def index(request):
     return render(request, 'index.html', {})

class MyLoginView(LoginView):
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
                return JsonResponse({'success': True})

            return JsonResponse({'success': False, 'error': 'Неверные учетные данные'}, status=401)
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'error': 'Неверный формат JSON'}, status=400)

class MyLogoutView(LogoutView):
    next_page = reverse_lazy('profiles:login')




