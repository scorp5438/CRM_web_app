import { useEffect, useState } from "react";
import "./modal_add.css";
import { getCSRFToken } from "../../utils/csrf";
import axios from "axios";

const ModalAdd = ({ examData, closeModal }) => {
    const [formData, setFormData] = useState({
        date_exam: '',
        name_intern: '',
        training_form: '',
        try_count: '',
        name_train: '',
        internal_test_examiner: '',
        note: '',
    });

    useEffect(() => {
        if (examData) {
            setFormData({
                date_exam: examData.date_exam || '',
                name_intern: examData.name_intern || '',
                training_form: examData.training_form || '',
                try_count: examData.try_count || '',
                name_train: examData.name_train || '',
                internal_test_examiner: examData.internal_test_examiner || '',
                note: examData.note || '',
            });
        }
    }, [examData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const csrfToken = getCSRFToken();
            const url = examData?.id
                ? `http://127.0.0.1:8000/api-root/update_exam/${examData.id}/`
                : 'http://127.0.0.1:8000/api-root/add_exam/';

            const method = examData?.id ? 'patch' : 'post';
            const response = await axios({
                method: method,
                url: url,
                data: formData,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                }
            });
            console.log('Response:', response.data);
            closeModal(); // Закрыть модальное окно после отправки
        } catch (error) {
            console.error('Ошибка при отправке данных:', error.response?.data || error.message);
        }
    };

    return (
        <div className="box-background" onClick={closeModal}>
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
                            <label className="box-modal__content_head">Дата экзамена:</label>
                            <input
                                className="box-modal__input"
                                type="date"
                                value={formData.date_exam}
                                onChange={(e) => setFormData({...formData, date_exam: e.target.value})}
                            />
                        </div>
                        <div className="box-modal__form_head">
                            <label className="box-modal__content_head">Имя стажера:</label>
                            <input
                                className="box-modal__input"
                                type="text"
                                placeholder="Введите имя и фамилию стажера"
                                value={formData.name_intern}
                                onChange={(e) => setFormData({...formData, name_intern: e.target.value})}
                            />
                        </div>
                        <div className="box-modal__form_head">
                            <label className="box-modal__content_head">Форма обучения:</label>
                            <input
                                className="box-modal__input"
                                type="text"
                                placeholder="Форма обучения"
                                value={formData.training_form}
                                onChange={(e) => setFormData({...formData, training_form: e.target.value})}
                            />
                        </div>
                        <div className="box-modal__form_head">
                            <label className="box-modal__content_head">Попытка:</label>
                            <input
                                className="box-modal__input"
                                type="text"
                                placeholder="Выберите количество попыток"
                                list="options"
                                value={formData.try_count}
                                onChange={(e) => setFormData({...formData, try_count: e.target.value})}
                            />
                            <datalist id="options">
                                <option value="Вариант 1"></option>
                                <option value="Вариант 2"></option>
                                <option value="Вариант 3"></option>
                            </datalist>
                        </div>
                        <div className="box-modal__form_head">
                            <label className="box-modal__content_head">ФИ обучающего / обучающих:</label>
                            <input
                                className="box-modal__input box-modal__input_svg"
                                type="text"
                                placeholder="Выберите обучающего"
                                value={formData.name_train}
                                onChange={(e) => setFormData({...formData, name_train: e.target.value})}
                            />
                        </div>
                        <div className="box-modal__form_head">
                            <label className="box-modal__content_head">ФИ принимающего внутреннее ТЗ:</label>
                            <input
                                className="box-modal__input box-modal__input_svg"
                                type="text"
                                placeholder="Выберите принимающего внутреннее ТЗ"
                                value={formData.internal_test_examiner}
                                onChange={(e) => setFormData({...formData, internal_test_examiner: e.target.value})}
                            />
                        </div>
                        <div className="box-modal__form_head">
                            <label className="box-modal__content_head">Примечание:</label>
                            <input
                                className="box-modal__input"
                                type="text"
                                placeholder="Введите примечание"
                                value={formData.note}
                                onChange={(e) => setFormData({...formData, note: e.target.value})}
                            />
                        </div>
                        <button type="submit" className="box-modal__content_button">
                            Добавить
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ModalAdd;