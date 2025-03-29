import React, { useState } from "react";
import { useUser } from "../utils/UserContext";
import { useNavigate } from "react-router-dom";
import { getCSRFToken, setCSRFToken } from "../utils/csrf";
import routes from "../utils/urls";
import "./authorization.css";
import LogoBig from "../../img/LogoBig.png"

const Authorization = () => {
    const navigate = useNavigate();
    const { setUser } = useUser();
    const [errorMessage, setErrorMessage] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false); // Управление модальным окном

    const handleSubmit = async (event) => {
        event.preventDefault();

        const username = event.target.username.value.trim();
        const password = event.target.password.value.trim();
        const errorBorder = document.querySelectorAll(".auth__input");
        if (!username || !password) {
            setErrorMessage("Логин и пароль не могут быть пустыми");
            errorBorder.forEach((element) => {
                element.classList.add("auth__error");
                setTimeout(() => element.classList.remove("auth__error"), 5000);
            });
            setTimeout(() => setErrorMessage(""), 5000);
            return;
        }

        const csrfToken = getCSRFToken();
        try {
            const response = await fetch(routes.login, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfToken,
                },
                credentials: "include",
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                if (response.status === 401) {
                    setErrorMessage("Неверный логин или пароль");
                    errorBorder.forEach((element) => {
                        element.classList.add("auth__error");
                        setTimeout(() => element.classList.remove("auth__error"), 5000);
                    });
                } else {
                    console.error("Ошибка ответа:", errorText);
                    setErrorMessage("Ошибка сети или сервера");
                }
                setTimeout(() => setErrorMessage(""), 5000);
                return;
            }

            const data = await response.json();
            if (data.success) {
                if (data.csrfToken) {
                    setCSRFToken(data.csrfToken);
                }
                setUser(data.user);
                navigate(routes.main);
            } else {
                setErrorMessage("Неверный логин или пароль");
                setTimeout(() => setErrorMessage(""), 5000);
            }
        } catch {
            setErrorMessage("Ошибка сети или сервера");
            setTimeout(() => setErrorMessage(""), 5000);
        }
    };

    const handleForgotPasswordClick = (e) => {
        e.preventDefault(); // Предотвращение перехода по ссылке
        setIsModalOpen(true); // Открыть модальное окно
    };

    const closeModal = () => {
        setIsModalOpen(false); // Закрыть модальное окно
    };

    return (
        <div className="auth center">
            <div className="auth__background">
                <div className="auth__modal">
                    <div className="auth__modal-header">
                        <img className="auth__modal-header_logo" src={LogoBig} alt="Logo"/>
                    </div>
                    <div className="auth__modal-body">
                        <h2 className="auth__modal-body_head">Вход в личный кабинет</h2>
                        <form method="POST" className="auth__form" onSubmit={handleSubmit}>
                            {errorMessage && <div className="error-message">{errorMessage}</div>}
                            <h3 className="auth__form_lable">Логин</h3>
                            <input name="username" type="login" className="auth__input" placeholder="User" />
                            <h3 className="auth__form_lable">Пароль</h3>
                            <input name="password" type="password" className="auth__input" placeholder="Password" />
                            <button type="submit" className="auth__submit">Войти</button>
                        </form>
                        <div className="auth__forgot-password">
                            <button className="auth__modal-body_link" onClick={handleForgotPasswordClick}>
                                Забыли логин/пароль напишите менеджеру
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Модальное окно */}
            {isModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <div className="modal-title">
                            <h2>Сгущёнка за вредность</h2>
                            <button className="modal-close" onClick={closeModal}>
                                &times;
                            </button>
                        </div>
                        <div className="modal-text">
                            <p>Чтобы продолжить работу с программой, необходимо, занести
                                по 2 банки сгущёнки каждому разработчику!
                                Вы согласны подожить работу (по факту согласия
                                отправляется email-уведомление об этом в IT-отдел и в бухгалтерю)?</p>
                        </div>
                        <div className="modal-buttons">
                            <button title={"При согласии будут отправлены Ваши данные для уточнения от кого ждать угощения 🙂"} onClick={closeModal}>Да</button>
                            <button title={"При  НЕ согласии будут отправлены Ваши данные для уточнения кто в компании ЖАДИНА 😒"} onClick={closeModal}>Нет</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Authorization;
