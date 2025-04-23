import json

from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.views import LoginView, LogoutView
from django.http import JsonResponse
from django.shortcuts import render
from django.urls import reverse_lazy
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie


@login_required
def index(request):
     return render(request, 'index.html', {})


@method_decorator(ensure_csrf_cookie, name='dispatch')
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

class MyLogoutView(LogoutView):
    next_page = reverse_lazy('myauth_profiles:login')