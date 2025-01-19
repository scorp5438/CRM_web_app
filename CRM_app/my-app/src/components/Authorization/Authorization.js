import React, { useState, useEffect} from "react";
import { useUser } from "../utils/UserContext";
import { useNavigate } from 'react-router-dom';
import { getCSRFToken, setCSRFToken } from '../utils/csrf';
import routes from '../utils/urls';
import './authorization.css';


const Authorization = () => {
    const navigate = useNavigate();
    const { setUser } = useUser();
    const [errorMessage, setErrorMessage, setErrorBorder] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();

        const username = event.target.username.value.trim();
        const password = event.target.password.value.trim();
        let errorBorder = document.querySelectorAll('.auth__input');
        if (!username || !password) {
            setErrorMessage('Логин и пароль не могут быть пустыми');
            let errorBorder = document.querySelectorAll('.auth__input');
            errorBorder.forEach(element => {
                element.classList.add('auth__error');
                setTimeout(() => element.classList.remove('auth__error'), 5000);
            });
            setTimeout(() => setErrorMessage(''), 5000);
            return;
        }

        const csrfToken = getCSRFToken();
        console.log('CSRF Token:', csrfToken);

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
                const errorText = await response.text();

                // Обработка статусов ошибок
                if (response.status === 401) {
                    setErrorMessage('Неверный логин или пароль');
                    let errorBorder = document.querySelectorAll('.auth__input');
                    errorBorder.forEach(element => {
                        element.classList.add('auth__error');
                        setTimeout(() => element.classList.remove('auth__error'), 5000);
                    });
                } else if (response.status === 400) {
                    setErrorMessage('Логин и пароль не могут быть пустыми');
                } else {
                    console.error('Ошибка ответа:', errorText);
                    setErrorMessage('Ошибка сети или сервера');
                }

                setTimeout(() => setErrorMessage(''), 5000);
                return; // Завершаем выполнение, чтобы не обрабатывать как успешный ответ
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
            setErrorMessage('Ошибка сети или сервера');
            setTimeout(() => setErrorMessage(''), 5000);
        }
    };

    return (
        <div className="auth center">
            <div className="auth__background">
                <div className="auth__modal">
                    <div className="auth__modal-header">
                        <h2 className="auth__modal-header_logo">ЛОГО КОМПАНИИ</h2>
                    </div>
                    <div className="auth__modal-body">
                        <h2 className="auth__modal-body_head">Вход в личный кабинет</h2>
                        <form method='POST' className="auth__form" onSubmit={handleSubmit}>
                            {errorMessage && <div className="error-message">{errorMessage}</div>}
                            <h3 className="auth__form_lable">Логин</h3>
                            <input name="username" type="login" className="auth__input" placeholder="User" />
                            <h3 className="auth__form_lable">Пароль</h3>
                            <input name="password" type="password" className="auth__input" placeholder="Password"/>
                            <button type="submit" className="auth__submit">Войти</button>
                        </form>
                        <div className="auth__forgot-password">
                            <a href="#">Забыли логин/пароль
                                напишите менеджеру</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
}
export default Authorization;