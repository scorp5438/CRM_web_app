from rest_framework.views import APIView
from django.middleware.csrf import get_token
from django.http import JsonResponse

class TestCSRFView(APIView):

    def get_csrf_token(request):
        referrer = request.META.get('HTTP_X_GET_TOKEN_CSRF_FOR_REACT')
        if not referrer or 'siyed9gp8qh934' != referrer:
            return JsonResponse({'error': 'Access denied'}, status=403)
        token = get_token(request)
        return JsonResponse({'csrfToken': token})
