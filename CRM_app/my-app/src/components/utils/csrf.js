import axios from 'axios';
// Функция для получения CSRF-токена из cookies
export function getCSRFToken() {

    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, 10) === 'csrftoken=') {
                cookieValue = decodeURIComponent(cookie.substring(10));
                break;
            }
        }
    }
    if (!cookieValue) {
        // Если cookie не доступен, отправляем запрос на сервер для получения CSRF-токена
        return axios.get('http://127.0.0.1:8000/api-root/get-csrf-token/', {
            headers: {
                'X-Get-Token-Csrf-For-React': 'siyed9gp8qh934',
            },
        })
            .then(response => response.data.csrfToken);
    }

    return cookieValue;
}

// Функция для установки CSRF-токена с безопасными атрибутами
export function setCSRFToken(token) {
    const maxAge = 46800; // Установить срок действия токена, например, 13 час
    document.cookie = `csrftoken=${encodeURIComponent(token)}; Max-Age=${maxAge}; Secure; HttpOnly; SameSite=Strict;`;
}

// Функция для удаления CSRF-токена при выходе пользователя
export function deleteCSRFToken() {
    document.cookie = 'csrftoken=; Max-Age=0; Secure; HttpOnly; SameSite=Strict;';
}
