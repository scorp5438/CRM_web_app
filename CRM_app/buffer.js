try {
    const response = await fetch(routes.login, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({
            username: username,
            password: password,
        }),
    });

    if (!response.ok) {
        const text = await response.text();
        if (response.status === 401) {
            // Сервер вернул 401 — неверный логин или пароль
            setErrorMessage('Неверный логин или пароль');
        } else {
            // Другая ошибка сервера
            console.error('Ошибка ответа:', text);
            setErrorMessage('Ошибка сети или сервера');
        }
        setTimeout(() => setErrorMessage(''), 5000);

    }

    const data = await response.json();
    if (data.success) {
        if (data.csrfToken) {
            setCSRFToken(data.csrfToken);
        }
        setUser(data.user);

        console.log(data);
        navigate(routes.main);
    } else {
        setErrorMessage('Неверный логин или пароль');
        setTimeout(() => setErrorMessage(''), 5000);
    }
} catch (error) {
    console.error('Ошибка запроса:', error);
    setErrorMessage('Ошибка сети или сервера');
    setTimeout(() => setErrorMessage(''), 5000);
}
