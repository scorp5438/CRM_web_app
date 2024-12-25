import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getCSRFToken } from '../utils/csrf';
import "./style_modal_window.css";
import { useUser } from '../utils/get_user';
import Cross from '../AllIcons/Cross/Cross';
import cross from '../../img/cross.svg';

function ModalWindow({ onClose, onInternAdded, examData, user, isEditing}) {
    const [formData, setFormData] = useState({
        date_exam: '',
        name_intern: '',
        cc: '',
        training_form: '',
        try_count: '',
        name_train: '',
        internal_test_examiner: '',
        note: '',
    });

    const [errors, setErrors] = useState({});
    const [trainingOptions, setTrainingOptions] = useState([]);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/users_okk/');
                setUsers(response.data);
            } catch (error) {
                console.error('Ошибка при загрузке пользователей:', error.message);
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        if (user) {
            setFormData({
                cc: examData ? examData.cc : user.company.id,
                date_exam: examData ? examData.date_exam : '',
                name_intern: examData ? examData.name_intern : '',
                training_form: examData ? examData.training_form : '',
                try_count: examData ? examData.try_count : '',
                name_train: examData ? examData.name_train : '',
                internal_test_examiner: examData ? examData.internal_test_examiner : '',
                note: examData ? examData.note : '',
            });
        }
    }, [examData, user]);

    useEffect(() => {
        axios.get('http://127.0.0.1:8000/api/training_form_list/')
            .then(response => {
                setTrainingOptions(response.data);
            })
            .catch(error => {
                console.error("Ошибка при загрузке списка результатов:", error.message);
            });
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value, // Для checkbox используем checked, для остальных value
        });
    };


    const formatErrors = (errors) => {
        const formattedErrors = {};

        for (const [key, value] of Object.entries(errors)) {
            if (key === 'date_exam') {
                if(value[0] === 'Неправильный формат date. Используйте один из этих форматов: YYYY-MM-DD.') {
                    formattedErrors[key] = "Заполните дату"
                } else {
                    formattedErrors[key] = value;
                }
            } else {
                formattedErrors[key] = value;
            }
        }

        return formattedErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(examData);

        try {
            const csrfToken = getCSRFToken();

            // Проверяем, есть ли examData и id (для редактирования)
            const url = examData && examData.id
                ? `http://127.0.0.1:8000/api/add_intern/${examData.id}/`
                : 'http://127.0.0.1:8000/api/add_intern/'; // Для создания нового объекта

            const method = examData && examData.id ? 'put' : 'post'; // Редактирование или создание

            const response = await axios({
                method: method,
                url: url,
                data: formData,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                }
            });

            console.log(`URL: ${url}, ID: ${examData ? examData.id : 'New Entry'}`);

            onInternAdded(response.data);
            onClose();
        } catch (error) {
            if (error.response && error.response.status === 400) {
                const formattedErrors = formatErrors(error.response.data);
                setErrors(formattedErrors);

                // Таймер для очистки ошибок через 5 секунд
                setTimeout(() => {
                    setErrors({});
                }, 5000);

                console.log('Ошибки с сервера:', formattedErrors);
            } else {
                console.error('Ошибка при отправке данных:', error.message);
            }
        }
    };

    return (
        <div className="modal-content">
            <div className="modal-top">
                <button className="close-modal" onClick={onClose}>
                    <Cross alt="cross" className="cross" />
                </button>
                <form onSubmit={handleSubmit}>
                    <label>
                        Дата экзамена:
                        <input
                            type="date"
                            name="date_exam"
                            value={formData.date_exam}
                            onChange={handleChange}
                        />
                        {errors.date_exam && <p className="error">{errors.date_exam}</p>}
                    </label>
                    <br />
                    <label>
                        Имя стажера:
                        <input
                            type="text"
                            name="name_intern"
                            value={formData.name_intern}
                            onChange={handleChange}
                        />
                        {errors.name_intern && <p className="error">{errors.name_intern[0]}</p>}
                    </label>
                    <br />
                    <label>
                        Форма обучения:
                        <select
                            type="text"
                            name="training_form"
                            value={formData.training_form}
                            onChange={handleChange}
                        >
                            <option value="">Форма обучения</option>
                            {trainingOptions.map(option => (
                                <option key={option[0]} value={option[0]}>
                                    {option[1]}
                                </option>
                            ))}
                        </select>
                        {errors.training_form && <p className="error">{errors.training_form[0]}</p>}
                    </label>
                    <br />
                    <label>
                        Попытка:
                        <select
                            name="try_count"
                            value={formData.try_count}
                            onChange={handleChange}
                        >
                            <option value="">Выберите</option> {/* Пустое значение по умолчанию */}
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                        </select>
                        {errors.try_count && <p className="error">{errors.try_count[0]}</p>}
                    </label>
                    <br />
                    <label>
                        ФИ обучающего/обучающих:
                        <select
                            className="svg-examiner"
                            name="name_train"
                            value={formData.name_train}
                            onChange={handleChange}
                        >
                            <option value="">Выберите обучающего</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.full_name}
                                </option>
                            ))}
                        </select>
                        {errors.name_train && <p className="error">{errors.name_train}</p>}
                    </label>
                    <br />
                    <label>
                        ФИ принимающего внутреннее ТЗ:
                        <select
                            className="svg-examiner"
                            name="internal_test_examiner"
                            value={formData.name_examiner}
                            onChange={handleChange}
                        >
                            <option value="">Выберите принимающего внутреннее ТЗ</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.full_name}
                                </option>
                            ))}
                        </select>
                        {errors.internal_test_examiner && <p className="error">{errors.internal_test_examiner}</p>}
                    </label>
                    <br />
                    <label>
                        Примечание:
                        <input
                            type="text"
                            name="note"
                            value={formData.note}
                            onChange={handleChange}
                        />
                        {errors.note && <p className="error">{errors.note[0]}</p>}
                    </label>
                    <br />
                    <button type="submit" className="add-modal">{isEditing ? "Сохранить" : "Добавить"}</button>
                </form>
            </div>
        </div>
    );
}

export default ModalWindow;
