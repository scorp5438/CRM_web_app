import React, { useState, useEffect } from "react";
import "./modalCheck.css";
import { getCSRFToken } from "../../utils/csrf";
import { useUser } from "../../utils/UserContext";
import axios from "axios";
import IconArea from "../../../img/IconArea";


const ModalCheck = ({ isOpen, onClose, onSubmit, onInputChange }) => {
    // Вызов хуков безусловно
    const { user } = useUser();
    const [companies, setCompanies] = useState([]);
    const [operators, setOperators] = useState([]);
    const [companySlug, setCompanySlug] = useState('');
    const [mistakes, setMistakes] = useState([]);
    const [subMistakes, setSubMistakes] = useState([]);


    const [lines, setLines] = useState([]);

    const [formData, setFormData] = useState({
        company: '',
        operator_name: '',
        controller: '',
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
        claim: false,
        just: false,
        claim_number: '',
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const finalValue = type === 'checkbox' ? checked : value;

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
            [name]: finalValue, // Установка значения с учётом типа input
        });
    };



    useEffect(() => {
        if (user) {
            fetchCompanies();
        }
        if (companySlug) {
            fetchOperators(companySlug);
        }
        fetchLines();
        fetchMistakes();
        fetchSubMistakes();
        if (isOpen) {
            fetchSubMistakes();
        }
    }, [user, companySlug, isOpen]); // Следим за изменениями companySlug


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

    const fetchSubMistakes = async () => {
        try {
            const csrfToken = getCSRFToken();
            let allResults = []; // Массив для хранения всех данных
            let nextPage = 'http://127.0.0.1:8000/api-root/sub-mistakes/'; // Начинаем с первой страницы

            while (nextPage) { // Пока есть следующая страница
                const response = await axios.get(nextPage, {
                    headers: { 'X-CSRFToken': csrfToken },
                });

                // Добавляем данные текущей страницы в общий массив
                allResults = [...allResults, ...response.data.results];

                // Обновляем nextPage для следующего запроса
                nextPage = response.data.next;
            }

            setSubMistakes(allResults); // Сохраняем все данные в состоянии
        } catch (error) {
            console.error("Ошибка при загрузке sub-mistakes:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Создаем копию formData с обновленными значениями
        const updatedFormData = {
            ...formData,
            controller: user.id,
        };
        if (formData.type_appeal === "письма") {
            updatedFormData.call_time = null;
            updatedFormData.line = null;
        }

        try {
            const csrfToken = getCSRFToken();
            console.log("Данные для отправки:", updatedFormData);
            console.log("Формат даты:", updatedFormData.call_date);
            console.log("Формат времени:", updatedFormData.call_time);

            const response = await axios.post('http://127.0.0.1:8000/api-root/ch-list/', updatedFormData, {
                headers: { 'X-CSRFToken': csrfToken },
            });

            console.log('Данные успешно отправлены:', response.data);
            onClose();  // Закрыть модалку после успешной отправки
        } catch (error) {
            console.error("Ошибка при отправке данных:", error.response?.data || error.message);
        }
    };

    // Условный рендер только после вызова всех хуков
    if (!isOpen) return null;

    return (
        <div className="modal__overlay_check">
            <div className="modal__check">
                <div className="modal__check_duplicate">
                    <h2>Добавить запись</h2>
                    <button>Проверка на дубликат</button>
                </div>
                <form className='modal__form' onSubmit={onSubmit}>
                <div className="modal__upbox">
                        <div className="modal__upbox__left">
                            <label className="title__label">
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
                            <label className="title__label">
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

                        </div>

                        <div className="modal__upbox__center">
                            <label className="title__label">Дата обращения:</label>
                            <input
                                className="modal__check_input"
                                name="call_date"
                                type="date"
                                value={formData.call_date}
                                onChange={handleChange}
                            />

                            <label className="title__label">ID звонка/чата:</label>
                            <textarea
                                className="modal__check_textarea"
                                name="call_id"
                                value={formData.call_id}
                                onChange={handleChange}
                            />
                        </div>


                        <div className="modal__upbox__right">
                            <label className="title__label">Тип проверки:</label>
                            <select
                                className="modal__check_select"
                                name="type_appeal"
                                value={formData.type_appeal}
                                onChange={handleChange}
                            >
                                <option>Выберите тип проверки</option>
                                <option value="звонок">звонок</option>
                                <option value="письма">письма</option>
                            </select>
                            {formData.type_appeal === 'звонок' && (
                                <>
                                    <label className="title__label">Линия:</label>
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

                                    <label className="title__label">Время звонка:</label>
                                    <input
                                        className="modal__check_input"
                                        name="call_time"
                                        type="time"
                                        value={formData.call_time}
                                        onChange={handleChange}
                                    />
                                </>
                            )}

                        </div>
                    </div>

                    <div className="modalBox">
                        <div className="modalBox__all">
                            <div className="selectBox">
                                <label className="title__label_color">1. {mistakes[0].name}</label>
                                <select
                                    className="modal__check_select"
                                    name="first_miss"
                                    value={formData.first_miss}
                                    onChange={handleChange}
                                >
                                    <option>{mistakes[0].id}</option>
                                    {subMistakes
                                        .filter((subMistake) => subMistake.attachment === mistakes[0].id) // Пример фильтра
                                        .map((subMistake) => (
                                            <option key={subMistake.id} value={subMistake.id}>
                                                {subMistake.name}
                                            </option>
                                        ))}
                                </select>
                            </div>
                            <span className="span__box">
                                <label>Коментарий:</label>
                            <textarea
                                className="modal__check_textarea"
                                name="first_comm"
                                value={formData.first_comm}
                                onChange={handleChange}
                            /></span>
                        </div>

                        <div className="modalBox__all">
                            <div className="selectBox">
                                <label className="title__label_color">2. {mistakes[1].name}</label>
                                <select
                                    className="modal__check_select"
                                    name="second_miss"
                                    value={formData.second_miss}
                                    onChange={handleChange}
                                >
                                    <option>{mistakes[0].id}</option>
                                    {subMistakes
                                        .filter((subMistake) => subMistake.attachment === mistakes[1].id) // Пример фильтра
                                        .map((subMistake) => (
                                            <option key={subMistake.id} value={subMistake.id}>
                                                {subMistake.name}
                                            </option>
                                        ))}

                                </select>
                            </div>
                            <span className="span__box">
                                <label>Коментарий:</label>
                            <textarea
                                className="modal__check_textarea"
                                name="second_comm"
                                value={formData.second_comm}
                                onChange={handleChange}
                            />
                            </span>
                        </div>

                        <div className="modalBox__all">
                            <div className="selectBox">
                                <label className="title__label_color">3. {mistakes[2].name}</label>
                                <select
                                    className="modal__check_select"
                                    name="third_miss"
                                    value={formData.third_miss}
                                    onChange={handleChange}
                                >
                                    <option>{mistakes[0].id}</option>
                                    {subMistakes
                                        .filter((subMistake) => subMistake.attachment === mistakes[2].id) // Пример фильтра
                                        .map((subMistake) => (
                                            <option key={subMistake.id} value={subMistake.id}>
                                                {subMistake.name}
                                            </option>
                                        ))}

                                </select>
                            </div>
                            <span className="span__box">
                                <label>Коментарий:</label>
                            <textarea
                                className="modal__check_textarea"
                                name="third_comm"
                                value={formData.third_comm}
                                onChange={handleChange}
                            />
                            </span>
                        </div>

                        <div className="modalBox__all">
                            <div className="selectBox">
                                <label className="title__label_color">4. {mistakes[3].name}</label>
                                <select
                                    className="modal__check_select"
                                    name="forty_miss"
                                    value={formData.forty_miss}
                                    onChange={handleChange}
                                >
                                    <option>{mistakes[0].id}</option>
                                    {subMistakes
                                        .filter((subMistake) => subMistake.attachment === mistakes[3].id) // Пример фильтра
                                        .map((subMistake) => (
                                            <option key={subMistake.id} value={subMistake.id}>
                                                {subMistake.name}
                                            </option>
                                        ))}

                                </select>
                            </div>
                            <span className="span__box">
                                <label>Коментарий:</label>
                            <textarea
                                className="modal__check_textarea"
                                name="forty_comm"
                                value={formData.forty_comm}
                                onChange={handleChange}
                            />
                            </span>
                        </div>

                        <div className="modalBox__all">
                            <div className="selectBox">
                                <label className="title__label_color">5. {mistakes[4].name}</label>
                                <select
                                    className="modal__check_select"
                                    name="fifty_miss"
                                    value={formData.fifty_miss}
                                    onChange={handleChange}
                                >
                                    <option>{mistakes[0].id}</option>
                                    {subMistakes
                                        .filter((subMistake) => subMistake.attachment === mistakes[4].id) // Пример фильтра
                                        .map((subMistake) => (
                                            <option key={subMistake.id} value={subMistake.id}>
                                                {subMistake.name}
                                            </option>
                                        ))}

                                </select>
                            </div>
                            <span className="span__box">
                                <label>Коментарий:</label>
                            <textarea
                                className="modal__check_textarea"
                                name="fifty_comm"
                                value={formData.fifty_comm}
                                onChange={handleChange}
                            />
                            </span>
                        </div>

                        <div className="modalBox__all">
                            <div className="selectBox">
                                <label className="title__label_color">6. {mistakes[5].name}</label>
                                <select
                                    className="modal__check_select"
                                    name="sixty_miss"
                                    value={formData.sixty_miss}
                                    onChange={handleChange}
                                >
                                    <option>{mistakes[0].id}</option>
                                    {subMistakes
                                        .filter((subMistake) => subMistake.attachment === mistakes[5].id) // Пример фильтра
                                        .map((subMistake) => (
                                            <option key={subMistake.id} value={subMistake.id}>
                                                {subMistake.name}
                                            </option>
                                        ))}

                                </select>
                            </div>
                            <span className="span__box">
                                <label>Коментарий:</label>
                            <textarea
                                className="modal__check_textarea"
                                name="sixty_comm"
                                value={formData.sixty_comm}
                                onChange={handleChange}
                            />
                            </span>
                        </div>
                    </div>

                    <div className="modal__checkbox">
                        <div className="check">
                            <label className="title__label">Жалоба:</label>
                            <input
                                className="modal__check_checked"
                                name="claim"
                                type="checkbox"
                                value={formData.claim}
                                onChange={handleChange}
                            />
                        </div>

                        {formData.claim && ( // Условный рендеринг
                            <>
                                <div className="check">
                                    <label className="title__label">Обоснование:</label>
                                    <input
                                        className="modal__check_checked"
                                        name="just"
                                        type="checkbox"
                                        checked={formData.just} // Используем checked вместо value
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="check">
                                    <label className="title__label">Номер жалобы:</label>
                                    <input
                                        className="modal__check_select"
                                        name="claim_number"
                                        value={formData.claim_number}
                                        onChange={handleChange}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                    <div className="modal__check_buttons">
                        <button className="modal__button" type="submit" onClick={handleSubmit}>Сохранить</button>
                        <button className="modal__button" type="button" onClick={onClose}>
                            Отмена
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalCheck;
