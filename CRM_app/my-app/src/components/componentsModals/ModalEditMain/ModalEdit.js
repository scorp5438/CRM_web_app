import { useEffect, useState, useCallback } from "react";
import "./modal_edit.css";
import { getCSRFToken } from "../../utils/csrf";
import axios from "axios";
import { useUser } from "../../utils/UserContext";
import routes from "../../utils/urls";
import { useLocation, useNavigate } from 'react-router-dom';
import { formatTime } from '../../utils/formatTime';

const ModalEdit = ({ examData, closeModal, fetchData }) => {
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const location = useLocation();
    const { user } = useUser();
    const [results, setResults] = useState([]);
    const [users, setUsers] = useState([]);

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

    // Инициализация формы с данными экзамена
    const initFormData = useCallback(() => {
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
    }, [examData, user]);

    useEffect(() => {
        axios.defaults.withCredentials = true; // Включаем отправку кук
    }, []);

    useEffect(() => {
        initFormData();
    }, [initFormData]);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const params = {
            mode: searchParams.get('mode') || null,
            company: searchParams.get('company') || null,
        };
        setQueryParams(params);
    }, [location.search]);

    // Получение списка пользователей
    const fetchUsers = useCallback(async () => {
        try {
            const csrfToken = getCSRFToken();
            const response = await axios.get('http://127.0.0.1:8000/api-root/admin/', {
                headers: {
                    'X-CSRFToken': csrfToken,
                },
            });
            setUsers(response.data.results || []);
        } catch (error) {
            console.error("Ошибка при загрузке данных пользователей:", error.response?.data || error.message);
        }
    }, []);

    // Получение списка результатов
    const fetchResults = useCallback(async () => {
        try {
            const csrfToken = getCSRFToken();
            const response = await axios.get('http://127.0.0.1:8000/api-root/results/', {
                headers: {
                    'X-CSRFToken': csrfToken,
                },
            });
            setResults(response.data.results || []);
        } catch (error) {
            console.error("Ошибка при загрузке результатов:", error.response?.data || error.message);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
        fetchResults();
    }, [fetchUsers, fetchResults]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const csrfToken = getCSRFToken();
            await axios({
                method: 'patch',
                url: `http://127.0.0.1:8000/api-root/update_exam/${examData.id}/`,
                data: formData,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
            });

            closeModal();
            if (fetchData) {
                fetchData();
            }
        } catch (error) {
            if (error.response && error.response.data) {
                setErrors(error.response.data);
                console.error('Ошибка при отправке данных:', error.response.data);
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

        const url = `${routes.exam}/?${params.toString()}`;
        navigate(url);
    };

    const generateTimeSlots = () => {
        const slots = [];
        let startTime = 9 * 60;
        const endTime = 23 * 60;
        const interval = 30;

        while (startTime < endTime) {
            const hours = Math.floor(startTime / 60);
            const minutes = startTime % 60;
            const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
            slots.push(formattedTime);
            startTime += interval;
        }

        return slots;
    };

    const timeSlots = generateTimeSlots();

    const formatTimeWithInterval = (time) => {
        const [hours, minutes] = time.split(':').map(Number);
        const endMinutes = minutes + 30;
        const endHours = endMinutes >= 60 ? hours + 1 : hours;
        const formattedEndMinutes = endMinutes % 60;
        const formattedEndTime = `${String(endHours).padStart(2, '0')}:${String(formattedEndMinutes).padStart(2, '0')}`;
        return `${time} - ${formattedEndTime}`;
    };
    useEffect(() => {
        console.log('Errors changed:',
            Object.keys(errors).length > 0 ? errors : "Нет ошибок");
    }, [errors]);
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
                            <label className="box-modal__content_head"><span className="required-asterisk">*</span>Дата экзамена:</label>
                            <input
                                className="box-modal__input"
                                name="date_exam"
                                type="date"
                                value={formData.date_exam}
                                onChange={handleChange}
                            />
                            {errors.date_exam && <p className="error-text">{errors.date_exam[0]}</p>}
                        </div>

                        <div className="box-modal__form_head">
                            <label className="box-modal__content_head"><span className="required-asterisk">*</span>Попытка:</label>
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
                            {errors.try_count && <p className="error-text">{errors.try_count[0]}</p>}
                        </div>
                        <div className="box-modal__form_head">
                            <label className="box-modal__content_head"><span className="required-asterisk">*</span>Время ТЗ:</label>
                                <select className="box-modal__input box-modal__select"
                                        name="time_exam"
                                        value={formData.time_exam}
                                        onChange={handleChange}
                                >
                                    <option value="">{formData.time_exam && formData.time_exam !== '00:00:00' ?
                                        formatTimeWithInterval(formatTime(formData.time_exam)) : 'Выберите время'}</option>
                                    {timeSlots.map(time => (
                                        <option className="form_option" key={time} value={time}>
                                            {formatTimeWithInterval(time)}
                                        </option>
                                    ))}
                                </select>
                            {errors.time_exam && <p className="error-text">{errors.time_exam[0]}</p>}
                        </div>
                        <div className="custom-select-wrapper">
                            <label className="box-modal__content_head"><span className="required-asterisk">*</span>Ф.И.О. проверяющего</label>
                            <select
                                className="box-modal__input box-modal__select"
                                name="name_examiner"
                                value={formData.name_examiner}
                                onChange={handleChange}
                            >
                                <option value=""><span className="required-asterisk">*</span>Выберите проверяющего</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.full_name}
                                    </option>
                                ))}
                            </select>
                            {errors.name_examiner && <p className="error-text">{errors.name_examiner[0]}</p>}
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