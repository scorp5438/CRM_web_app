import React, { useState, useEffect } from "react";
import "./modalCheck.css";
import { getCSRFToken } from "../../utils/csrf";
import { useUser } from "../../utils/UserContext";
import axios from "axios";

const ModalCheck = ({ isOpen, onClose, onSubmit, onInputChange }) => {
    // Вызов хуков безусловно
    const { user } = useUser();
    const [companies, setCompanies] = useState([]);
    const [formData, setFormData] = useState({
        company: '',
        operator_name: '',
        type_appeal: '',
        line: '',
        call_date: '',
        call_time: '',
        call_id: '',
        first_miss: '',
        second_miss: '',
        third_miss: '',
        forty_miss: '',
        fifty_miss: '',
        sixty_miss: '',
        first_comm: '',
        second_comm: '',
        third_comm: '',
        forty_comm: '',
        fifty_comm: '',
        sixty_comm: '',
        claim: '',
        just: '',
        claim_number: '',
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    useEffect(() => {
        if (user) {
            fetchCompanies();
        }
    }, [user]);

    const fetchCompanies = async () => {
        try {
            const csrfToken = getCSRFToken();
            const response = await axios.get('http://127.0.0.1:8000/api-root/companies/', {
                headers: { 'X-CSRFToken': csrfToken },
            });
            setCompanies(response.data.results);
        } catch (error) {
            console.error("Ошибка при загрузке списка компаний:", error);
        }
    };

    // Условный рендер только после вызова всех хуков
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Добавить запись</h2>
                <form onSubmit={onSubmit}>
                    <label>
                        Компания:

                    </label>
                    <select
                        className=""
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                    >
                        <option>Выберите компанию</option>
                        {companies.map(company => (
                            <option key={company.id} value={company.id}>
                                {company.name}
                            </option>
                        ))}
                    </select>
                    <label>
                        Оператор:
                    </label>
                    <select
                        className=""
                        name="operator"
                        value={formData.operator_name}
                        onChange={handleChange}
                    >
                        <option>Выберите оператора</option>
                        {companies.map(company => (
                            <option key={company.id} value={company.id}>
                                {company.name}
                            </option>
                        ))}
                    </select>
                    <label>Тип проверки:</label>
                    <select
                        name="type_appeal"
                        value={formData.type_appeal}
                        onChange={handleChange}
                    >
                        <option>Выберите тип проверки</option>
                        {/* Добавьте список типов проверок, если данные доступны */}
                        <option value="type1">Тип 1</option>
                        <option value="type2">Тип 2</option>
                        <option value="type3">Тип 3</option>
                    </select>

                    <label>Линия:</label>
                    <select
                        name="line"
                        value={formData.line}
                        onChange={handleChange}
                    >
                        <option>Выберите линию</option>
                        <option value="line1">Линия 1</option>
                        <option value="line2">Линия 2</option>
                        <option value="line3">Линия 3</option>
                    </select>

                    <label>Дата звонка:</label>
                    <select
                        name="call_date"
                        value={formData.call_date}
                        onChange={handleChange}
                    >
                        <option>Выберите дату звонка</option>
                        <option value="2025-01-01">01.01.2025</option>
                        <option value="2025-01-02">02.01.2025</option>
                        <option value="2025-01-03">03.01.2025</option>
                    </select>

                    <label>Время звонка:</label>
                    <select
                        name="call_time"
                        value={formData.call_time}
                        onChange={handleChange}
                    >
                        <option>Выберите время звонка</option>
                        <option value="10:00">10:00</option>
                        <option value="11:00">11:00</option>
                        <option value="12:00">12:00</option>
                    </select>

                    <label>ID звонка/чата:</label>
                    <select
                        name="call_id"
                        value={formData.call_id}
                        onChange={handleChange}
                    >
                        <option>Выберите ID звонка</option>
                        <option value="call1">Call 1</option>
                        <option value="call2">Call 2</option>
                        <option value="call3">Call 3</option>
                    </select>

                    <label>Пропуск 1:</label>
                    <select
                        name="first_miss"
                        value={formData.first_miss}
                        onChange={handleChange}
                    >
                        <option>Выберите пропуск</option>
                        <option value="yes">Да</option>
                        <option value="no">Нет</option>
                    </select>

                    <label>Пропуск 2:</label>
                    <select
                        name="second_miss"
                        value={formData.second_miss}
                        onChange={handleChange}
                    >
                        <option>Выберите пропуск</option>
                        <option value="yes">Да</option>
                        <option value="no">Нет</option>
                    </select>

                    <label>Пропуск 3:</label>
                    <select
                        name="third_miss"
                        value={formData.third_miss}
                        onChange={handleChange}
                    >
                        <option>Выберите пропуск</option>
                        <option value="yes">Да</option>
                        <option value="no">Нет</option>
                    </select>

                    <label>Пропуск 4:</label>
                    <select
                        name="forty_miss"
                        value={formData.forty_miss}
                        onChange={handleChange}
                    >
                        <option>Выберите пропуск</option>
                        <option value="yes">Да</option>
                        <option value="no">Нет</option>
                    </select>

                    <label>Пропуск 5:</label>
                    <select
                        name="fifty_miss"
                        value={formData.fifty_miss}
                        onChange={handleChange}
                    >
                        <option>Выберите пропуск</option>
                        <option value="yes">Да</option>
                        <option value="no">Нет</option>
                    </select>

                    <label>Пропуск 6:</label>
                    <select
                        name="sixty_miss"
                        value={formData.sixty_miss}
                        onChange={handleChange}
                    >
                        <option>Выберите пропуск</option>
                        <option value="yes">Да</option>
                        <option value="no">Нет</option>
                    </select>

                    <label>Комментарий 1:</label>
                    <select
                        name="first_comm"
                        value={formData.first_comm}
                        onChange={handleChange}
                    >
                        <option>Выберите комментарий</option>
                        <option value="comment1">Комментарий 1</option>
                        <option value="comment2">Комментарий 2</option>
                    </select>

                    <label>Комментарий 2:</label>
                    <select
                        name="second_comm"
                        value={formData.second_comm}
                        onChange={handleChange}
                    >
                        <option>Выберите комментарий</option>
                        <option value="comment1">Комментарий 1</option>
                        <option value="comment2">Комментарий 2</option>
                    </select>

                    <label>Комментарий 3:</label>
                    <select
                        name="third_comm"
                        value={formData.third_comm}
                        onChange={handleChange}
                    >
                        <option>Выберите комментарий</option>
                        <option value="comment1">Комментарий 1</option>
                        <option value="comment2">Комментарий 2</option>
                    </select>

                    <label>Комментарий 4:</label>
                    <select
                        name="forty_comm"
                        value={formData.forty_comm}
                        onChange={handleChange}
                    >
                        <option>Выберите комментарий</option>
                        <option value="comment1">Комментарий 1</option>
                        <option value="comment2">Комментарий 2</option>
                    </select>

                    <label>Комментарий 5:</label>
                    <select
                        name="fifty_comm"
                        value={formData.fifty_comm}
                        onChange={handleChange}
                    >
                        <option>Выберите комментарий</option>
                        <option value="comment1">Комментарий 1</option>
                        <option value="comment2">Комментарий 2</option>
                    </select>

                    <label>Комментарий 6:</label>
                    <select
                        name="sixty_comm"
                        value={formData.sixty_comm}
                        onChange={handleChange}
                    >
                        <option>Выберите комментарий</option>
                        <option value="comment1">Комментарий 1</option>
                        <option value="comment2">Комментарий 2</option>
                    </select>

                    <label>Жалоба:</label>
                    <select
                        name="claim"
                        value={formData.claim}
                        onChange={handleChange}
                    >
                        <option>Выберите жалобу</option>
                        <option value="claim1">Жалоба 1</option>
                        <option value="claim2">Жалоба 2</option>
                    </select>

                    <label>Обоснование:</label>
                    <select
                        name="just"
                        value={formData.just}
                        onChange={handleChange}
                    >
                        <option>Выберите обоснование</option>
                        <option value="just1">Обоснование 1</option>
                        <option value="just2">Обоснование 2</option>
                    </select>

                    <label>Номер жалобы:</label>
                    <select
                        name="claim_number"
                        value={formData.claim_number}
                        onChange={handleChange}
                    >
                        <option>Выберите номер жалобы</option>
                        <option value="number1">Номер 1</option>
                        <option value="number2">Номер 2</option>
                    </select>
                    <button type="submit">Сохранить</button>
                    <button type="button" onClick={onClose}>
                        Отмена
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ModalCheck;
