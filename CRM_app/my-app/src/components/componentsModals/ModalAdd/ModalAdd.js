import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import "./modal_add.css";
import { getCSRFToken } from "../../utils/csrf";
import axios from "axios";
import { useUser } from "../../utils/UserContext";
import routes from "../../utils/urls";
import CheckData from '../../utils/CheckData';


const ModalAdd = ({ examData, closeModal, fetchData, setNote }) => {
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const { user } = useUser();
    const [formData, setFormData] = useState({
        date_exam: '',
        name_intern: '',
        training_form: '',
        try_count: '',
        name_train: '',
        internal_test_examiner: '',
        note: '',
        company: user?.company_id || ''
    });

    useEffect(() => {
        axios.defaults.withCredentials = true; // Включаем отправку кук
    }, []);

    const [users, setUsers] = useState([]);
    useEffect(() => {
        if (examData && user) {
            setFormData({
                date_exam: examData.date_exam || '',
                name_intern: examData.name_intern || '',
                training_form: examData.training_form || '',
                try_count: examData.try_count || '',
                name_train: examData.name_train || '',
                internal_test_examiner: examData.internal_test_examiner || '',
                note: examData.note || '',
                company: user.company_id || '',
            });

        }
    }, [examData, user]);
    console.log(user);
    // Получение данных с API
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const csrfToken = getCSRFToken(); // Если CSRF токен требуется
                const response = await axios.get('http://127.0.0.1:8000/api-root/admin/', {
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

    let handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({}); // Очищаем предыдущие ошибки

        try {
            const csrfToken = getCSRFToken();
            const url = examData?.id
                ? `http://127.0.0.1:8000/api-root/testing/${examData.id}/`
                : 'http://127.0.0.1:8000/api-root/testing/';
            const method = examData?.id ? 'patch' : 'post';
            const data = examData?.id ? CheckData(examData, formData) : formData;

            const response = await axios({
                method: method,
                url: url,
                data: data,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
            });

            console.log('Response:', response.data);
            closeModal();
            if (fetchData) fetchData();
        } catch (error) {
            console.log(error);
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
        navigate(routes.exam);
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
                            {errors.date_exam && (
                                <p className="error-text">
                                    {errors.date_exam[0]}
                                </p>
                            )}
                        </div>
                        <div className="box-modal__form_head">
                            <label className="box-modal__content_head"><span className="required-asterisk">*</span>Имя стажера:</label>
                            <input
                                className="box-modal__input box-modal__input_cursor"
                                type="text"
                                name="name_intern"
                                placeholder="Введите имя и фамилию стажера"
                                value={formData.name_intern}
                                onChange={handleChange}
                                autoComplete="off"
                            />
                            {errors.name_intern && <p className="error-text">{errors.name_intern[0]}</p>}
                        </div>
                        <div className="box-modal__form_head">
                            <label className="box-modal__content_head"><span className="required-asterisk">*</span>Форма обучения:</label>
                            <select
                                className="box-modal__input"
                                type="text"
                                name="training_form"
                                placeholder="Форма обучения"
                                value={formData.training_form}
                                onChange={handleChange}
                            >
                                <option value="">Выберите фому обучения</option>
                                <option value="ВО">ВО</option>
                                <option value="Универсал">Универсал</option>
                            </select>
                            {errors.training_form && <p className="error-text">{errors.training_form[0]}</p>}
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
                        <div className="custom-select-wrapper">
                            <label className="box-modal__content_head"><span className="required-asterisk">*</span>ФИ обучающего / обучающих:</label>
                            <select
                                className="box-modal__input box-modal__select"
                                name="name_train"
                                value={formData.name_train}
                                onChange={handleChange}
                            >
                                <option>Выберите обучающего</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.full_name}
                                    </option>
                                ))}
                            </select>
                            {errors.name_train && <p className="error-text">{errors.name_train[0]}</p>}
                        </div>
                        <div className="custom-select-wrapper">
                            <label className="box-modal__content_head"><span className="required-asterisk">*</span>ФИ принимающего внутреннее ТЗ:</label>
                            <select
                                className="box-modal__input box-modal__select"
                                name="internal_test_examiner"
                                value={formData.internal_test_examiner}
                                onChange={handleChange}
                            >
                                <option>Выберите принимающего внутренний зачёт</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.full_name}
                                    </option>
                                ))}
                            </select>
                            {errors.internal_test_examiner && <p className="error-text">{errors.internal_test_examiner[0]}</p>}
                        </div>
                        <div className="box-modal__form_head">
                            <label className="box-modal__content_head">Примечание:</label>
                            <input
                                className="box-modal__input"
                                type="text"
                                name="note"
                                placeholder="Введите примечание"
                                value={formData.note}
                                onChange={handleChange}
                            />
                        </div>
                        <button onClick={navigateToExamUser} type="submit"  className="box-modal__content_button">
                            {examData?.id ? "Сохранить" : "Добавить"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ModalAdd;