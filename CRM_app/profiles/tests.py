from django.test import TestCase

'''
Поля логин пароль пустые
{'success': False, 'error': 'Логин и пароль обязательны'}, status=400
'''

'''
Успешная авторизация аутентификация
{'success': True, 'user': data_user}, status=200)
'''

'''
Неверный логин или пароль
{'success': False, 'error': 'Неверные учетные данные'}, status=401)
'''