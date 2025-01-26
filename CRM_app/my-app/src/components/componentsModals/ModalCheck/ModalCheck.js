import React, { useState, useEffect } from "react";
import "./modalCheck.css";
import { getCSRFToken } from "../../utils/csrf";
import { useUser } from "../../utils/UserContext";
import axios from "axios";

const ModalCheck = ({ isOpen, onClose, onSubmit, onInputChange }) => {
    // Вызов хуков безусловно
    const { user } = useUser();
    const [companies, setCompanies] = useState([]);
    const [operators, setOperators] = useState([]);
    const [companySlug, setCompanySlug] = useState('');
    const [mistakes, setMistakes] = useState([]);

    const [lines, setLines] = useState([]);

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
        if (name === 'company') {
            const company_id = Number(value);
            const company = companies.find(company => company.id === company_id);
            const slug = company ? company.slug : null;
            setCompanySlug(slug); // Обновление состояния companySlug
            console.log(typeof company_id);
            fetchOperators(slug); // Загружаем операторов с использованием slug
        }

        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };


    useEffect(() => {
        if (user) {
            fetchCompanies();
        }
        if (companySlug) {
            fetchOperators(companySlug); // Загружаем операторов по slug
        }
        fetchLines();
        fetchMistakes();
    }, [user, companySlug]); // Следим за изменениями companySlug


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

    const fetchOperators = async (companySlug) => {
        try {
            const csrfToken = getCSRFToken();
            const response = await axios.get(`http://127.0.0.1:8000/api-root/operators/?company=${companySlug}`, {
                headers: { 'X-CSRFToken': csrfToken },
            });
            setOperators(response.data.results);  // Устанавливаем список операторов
        } catch (error) {
            console.error("Ошибка при загрузке списка операторов:", error);
        }
    };
    const fetchLines = async () => {
        try {
            const csrfToken = getCSRFToken();
            const response = await axios.get('http://127.0.0.1:8000/api-root/lines/', {
                headers: { 'X-CSRFToken': csrfToken },
            });
            setLines(response.data.results);
        } catch (error) {
            console.error("Ошибка при загрузке линий:", error);
        }
    };


    const fetchMistakes = async () => {
        try {
            const csrfToken = getCSRFToken();
            const response = await axios.get('http://127.0.0.1:8000/api-root/mistakes/', {
                headers: { 'X-CSRFToken': csrfToken },
            });
            setMistakes(response.data.results);
        } catch (error) {
            console.error("Ошибка при загрузке линий:", error);
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const csrfToken = getCSRFToken();
            const response = await axios.post('http://127.0.0.1:8000/api-root/create_ch-list/', formData, {
                headers: { 'X-CSRFToken': csrfToken },
            });
            console.log('Данные успешно отправлены:', response.data);
            onClose();  // Закрыть модалку после успешной отправки
        } catch (error) {
            console.error('Ошибка при отправке данных:', error);
        }
    };

    // Условный рендер только после вызова всех хуков
    if (!isOpen) return null;

    return (
        <div className="modal__overlay_check">
            <div className="modal__check">
                <h2>Добавить запись</h2>
                <form className='modal__form' onSubmit={onSubmit}>
                    <label>
                        Компания:

                    </label>
                    <select
                        className="modal__check_select"
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
                        className="modal__check_select"
                        name="operator_name"
                        value={formData.operator_name}
                        onChange={handleChange}
                    >
                        <option>Выберите оператора</option>
                        {operators.map(operator => (
                            <option key={operator.id} value={operator.id}>
                                {operator.full_name}
                            </option>
                        ))}
                    </select>
                    <label>Тип проверки:</label>
                    <select
                        className="modal__check_select"
                        name="type_appeal"
                        value={formData.type_appeal}
                        onChange={handleChange}
                    >
                        <option>Выберите тип проверки</option>
                        <option value="звонок">звонок</option>
                        <option value="письмо">письмо</option>
                    </select>

                    <label>Линия:</label>
                    <select
                        className="modal__check_select"
                        name="line"
                        value={formData.line}
                        onChange={handleChange}
                    >
                        <option>Выберите линию</option>
                        {lines.map(line => (
                            <option key={line.id} value={line.id}>
                                {line.name_line}
                            </option>
                        ))}
                    </select>

                    <label>Дата звонка:</label>
                    <input
                        className="modal__check_input"
                        name="call_date"
                        type="date"
                        value={formData.call_date}
                        onChange={handleChange}
                    />

                    <label>Время звонка:</label>
                    <input
                        className="modal__check_input"
                        name="call_time"
                        type="time"
                        value={formData.call_time}
                        onChange={handleChange}
                    />

                    <label>ID звонка/чата:</label>
                    <textarea
                        className="modal__check_textarea"
                        name="call_id"
                        value={formData.call_id}
                        onChange={handleChange}
                    />
                    {mistakes.map(mistake => (
                        <label>{mistake.name}</label>
                        <select>
                        <option>
                        </select>
                        ))};

                    <label>Пропуск 1:</label>
                    <select
                        className="modal__check_select"
                        name="first_miss"
                        value={formData.first_miss}
                        onChange={handleChange}
                    >
                        <option>Выберите пропуск</option>
                        <option value="yes">Да</option>
                        <option value="no">Нет</option>
                    </select>


                    <label>Комментарий 1:</label>
                    <select
                        className="modal__check_select"
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
                        className="modal__check_select"
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
                        className="modal__check_select"
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
                        className="modal__check_select"
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
                        className="modal__check_select"
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
                        className="modal__check_select"
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
                        className="modal__check_select"
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
                        className="modal__check_select"
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
                        className="modal__check_select"
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
