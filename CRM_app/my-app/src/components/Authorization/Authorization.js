import React, { useState, useEffect} from "react";
import { useUser } from "../utils/UserContext";
import { useNavigate } from 'react-router-dom';
import { getCSRFToken, setCSRFToken } from '../utils/csrf';
import routes from '../utils/urls';
import './authorization.css';

const Authorization = () => {
    const navigate = useNavigate();
    const { setUser } = useUser();
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();

        const username = event.target.username.value.trim();
        const password = event.target.password.value.trim();

        if (!username || !password) {
            setErrorMessage('Логин и пароль не могут быть пустыми');
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
                console.log('Form submission response:', response);
                const text = await response.text();
                console.error('Ошибка ответа:', text);
                throw new Error('Ошибка сети или сервера');
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
                            <h3 className="auth__form_lable">Логин</h3>
                            <input required name="username" type="login" className="auth__input" placeholder="User" />
                            <h3 className="auth__form_lable">Пароль</h3>
                            <input required name="password" type="password" className="auth__input" placeholder="Password"/>
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