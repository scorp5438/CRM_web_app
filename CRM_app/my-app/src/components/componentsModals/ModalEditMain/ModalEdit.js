import { useEffect, useState } from "react";
import "./modal_edit.css";
import { getCSRFToken } from "../../utils/csrf";
import axios from "axios";
import { useUser } from "../../utils/UserContext";
import routes from "../../utils/urls";
import CheckData from '../../utils/CheckData';
import { useLocation, useNavigate } from 'react-router-dom';



const ModalEdit = ({ examData, closeModal, fetchData }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useUser();
    const [results, setResults] = useState([]);

    const [queryParams, setQueryParams] = useState({
        mode: null,
        company: null,
    });

    const [formData, setFormData] = useState({
        date_exam: "2025-01-05",
        try_count: 2,
        time_exam: "00:00:00",
        result_exam: "",
        comment_exam: "",
        name_examiner: null,
    });
    const [users, setUsers] = useState([]);
    useEffect(() => {
        if (examData && user) {
            setFormData({
                date_exam: examData.date_exam,
                try_count: examData.try_count,
                time_exam: examData.time_exam || "00:00:00",
                result_exam: examData.result_exam || '',
                comment_exam: examData.comment_exam || '',
                training_form: examData.training_form,
                name_examiner: examData.name_examiner || '',

            });

        }
    }, [examData], [user]);
    console.log(user);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const params = {
            mode: searchParams.get('mode') || null,
            company: searchParams.get('company') || null,
        };
        setQueryParams(params);
    }, [location.search]);
    console.log(queryParams);

    // Получение данных с API
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const csrfToken = getCSRFToken(); // Если CSRF токен требуется
                const response = await axios.get('http://127.0.0.1:8000/api-root/admin_main/', {
                    headers: {
                        'X-CSRFToken': csrfToken,
                    },
                });
                setUsers(response.data.results || []); // Установите полученные данные
            } catch (error) {
                console.error("Ошибка при загрузке данных пользователей:", error.response?.data || error.message);
            }
        };

        fetchUsers();
    }, []);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const csrfToken = getCSRFToken(); // Если требуется CSRF токен
                const response = await axios.get('http://127.0.0.1:8000/api-root/results/', {
                    headers: {
                        'X-CSRFToken': csrfToken,
                    },
                });
                setResults(response.data.results || []); // Устанавливаем результаты
            } catch (error) {
                console.error("Ошибка при загрузке результатов:", error.response?.data || error.message);
            }
        };

        fetchResults();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log('user.id:', user.id); // Логируем значение user.id
        try {
            const csrfToken = getCSRFToken();

            const data = CheckData(examData, formData);
            console.log('Отправляемые данные на бэкэнд:', data);
            const response = await axios({
                method: 'patch',
                url: `http://127.0.0.1:8000/api-root/update_exam/${examData.id}/`,
                data: data,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
            });

            console.log('Response:', response.data);
            closeModal();
            if (fetchData) {
                fetchData();
            }
        } catch (error) {
            if (error.response && error.response.data) {
                console.error('Ошибка при отправке данных:', error.response.data); // Логируем ошибки с сервера
            } else {
                console.error('Ошибка при отправке данных:', error.message);
            }
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };
    const navigateToExamUser = () => {
        const params = new URLSearchParams();
        if (queryParams.mode) {
            params.set('mode', 'my-exam');
        }
        if (queryParams.company) {
            params.set('company', queryParams.company);
        }

        // Формируем полный URL и выполняем переход
        const url = `${routes.exam}/?${params.toString()}`;
        navigate(url);
    };

    return (
        <div className="box-background">
            <div className="box-modal" onClick={(e) => e.stopPropagation()}>
                <div className="box-modal__content">
                <span className="box-modal__content_close" onClick={closeModal}>
                    <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M1.4 9.99999L0 8.59999L3.6 4.99999L0 1.42499L1.4 0.0249939L5 3.62499L8.575 0.0249939L9.975 1.42499L6.375 4.99999L9.975 8.59999L8.575 9.99999L5 6.39999L1.4 9.99999Z"
                            fill="#FF0000"
                        />
                    </svg>
                </span>
                    <div>
                        <p className="box-modal__examinfo">{examData.name_intern}, прошёл(ла) обучение по форме {examData.training_form} у {examData.name_train_full_name},
                            внутренний зкзамен принимал(ла) {examData.name_train_full_name}</p>
                        {examData.note && (<p className="box-modal__examinfo">Примечание: {examData.note}</p>)}
                    </div>
                    <form className="box-modal__form" onSubmit={handleSubmit}>
                        <div className="box-modal__form_head">
                            <label className="box-modal__content_head">Дата экзамена:</label>
                            <input
                                className="box-modal__input"
                                name="date_exam"
                                type="date"
                                value={formData.date_exam}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="box-modal__form_head">
                            <label className="box-modal__content_head">Попытка:</label>
                            <select
                                className="box-modal__input"
                                name="try_count"
                                value={formData.try_count}
                                onChange={handleChange}
                            >
                                <option value="">Выберите попытку</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                            </select>
                        </div>
                        <div className="box-modal__form_head">
                            <label className="box-modal__content_head">Время экзамена:</label>
                            <input
                                className="box-modal__input"
                                name="time_exam"
                                type="time"
                                value={formData.time_exam}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="custom-select-wrapper">
                            <label className="box-modal__content_head">Ф.И.О. проверяющего</label>
                            <select
                                className="box-modal__input box-modal__select"
                                name="name_examiner"
                                value={formData.name_examiner}
                                onChange={handleChange}
                            >
                                <option value="">Выберите проверяющего</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.full_name}
                                    </option>
                                ))}

                            </select>
                        </div>
                        <div className="custom-select-wrapper">
                            <label className="box-modal__content_head">Результат:</label>
                            <select
                                className="box-modal__input box-modal__select"
                                name="result_exam"
                                value={formData.result_exam}
                                onChange={handleChange}
                            >
                                <option value="">Выберите результат</option>
                                {results.map(result => (
                                    <option key={result} value={result}>
                                        {result}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="box-modal__form_head">
                            <label className="box-modal__content_head">Коментарий:</label>
                            <textarea
                              className="box-modal__input box-modal__textarea"
                              name="comment_exam"
                              value={formData.comment_exam}
                              onChange={handleChange}
                            />
                        </div>
                        <button onClick={navigateToExamUser} type="submit" className="box-modal__content_button">
                            Сохранить
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ModalEdit;