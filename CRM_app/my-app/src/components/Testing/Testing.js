import React, { useState, useEffect } from "react";
import "./test.css";
import Head from "../Head/Head";
import { useUser } from "../utils/UserContext";
import ModalAdd from "../componentsModals/ModalAdd/ModalAdd";
import ModalEdit from "../componentsModals/ModalEditMain/ModalEdit";
import {useLocation} from "react-router-dom";


const Testing = () => {
    const [data, setData] = useState([]); // Состояние для хранения массива с API
    const [loading, setLoading] = useState(true); // Состояние для индикатора загрузки
    const [error, setError] = useState(null); // Состояние для обработки ошибок
    const { user } = useUser();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedExamData, setSelectedExamData] = useState(null);
    const location = useLocation();
    const [queryParams, setQueryParams] = useState({ mode: null, company: null });
    const [selectedCompanyName, setSelectedCompanyName] = useState("");

// Функция для открытия модального окна

    const openModal = () => {
        console.log("Кнопка нажата, открываю модалку");
        setIsModalOpen(true);
    };
// Функция для закрытия модального окна
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedExamData(null);
    }

    const handleEditClick = (exam) => {
        setSelectedExamData(exam); // Установить выбранные данные
        setIsModalOpen(true); // Открыть модальное окно
    };

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const params = {
            mode: searchParams.get('mode') || null,
            company: searchParams.get('company') || null,
        };
        setQueryParams(params);

    }, [location.search]);
    console.log(queryParams);



    const fetchData = async () => {
        try {
            const company = queryParams.company;
            const mode = queryParams.mode;
            console.log(company);

                const url = `http://127.0.0.1:8000/api-root/testing/?company=${company}&mode=${mode}`;
                console.log('Request URL:', url);
                const response = await fetch(url);


                // Отправляем запрос с параметрами
                if (!response.ok) {
                    throw new Error(`Ошибка: ${response.statusText}`);
                }
                const result = await response.json();
                setData(result.results || []); // Обработка данных

        } catch (err) {
            setError(err.message); // Обработка ошибок
        } finally {
            setLoading(false); // Завершаем загрузку
        }
    };
    useEffect(() => {

            setLoading(true); // Сбрасываем состояние загрузки
            setError(null);   // Очищаем ошибки
            setData([]);      // Очищаем старые данные
            fetchData();      // Вызываем fetchData только после обновления queryParams

    }, [queryParams]);

    const fetchCompanies = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/api-root/companies/");
            if (!response.ok) {
                throw new Error(`Ошибка при загрузке компаний: ${response.statusText}`);
            }
            const companiesData = await response.json();
            const companySlug = new URLSearchParams(location.search).get("company"); // Получаем `slug` из URL

            // Ищем компанию по `slug`
            const selectedCompany = companiesData.results.find(
                (company) => company.slug === companySlug
            );

            if (selectedCompany) {
                setSelectedCompanyName(selectedCompany.name); // Устанавливаем имя компании
            } else {
                document.querySelector(".company").remove();

                setSelectedCompanyName("Компания не найдена");
            }
        } catch (err) {
            setError(`Ошибка: ${err.message}`);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, [location.search]);

    // Обработчик для добавления нового экзамена
    const handleAddExam = async (newExam) => {
        try {
            const response = await fetch("http://127.0.0.1:8000/api-root/testing/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newExam),
            });

            if (!response.ok) {
                throw new Error(`Ошибка: ${response.statusText}`);
            }

            const addedExam = await response.json();

            // Обновляем состояние, добавляя новый экзамен
            setData((prevData) => [...prevData, addedExam]);
        } catch (err) {
            setError(err.message);
        }
    };


    return (
        <div><Head/>
            {!user ? (
                <div>Загрузка данных...</div>
            ) : (
            <div>
                <div className="box-tables center">
                    <div>
                        <div className='company'>
                            {(<h1 className="company__name">{selectedCompanyName}</h1>)}
                        </div>
                    </div>
                    <table className="box-tables__table">
                        <thead>
                        <tr>
                        <th className="box-tables__head">Дата зачёта</th>
                            <th className="box-tables__head">Ф.И.О. стажёра</th>
                            <th className="box-tables__head">Форма обучения</th>
                            <th className="box-tables__head">Попытка</th>
                            <th className="box-tables__head">Время зачёта</th>
                            <th className="box-tables__head">Ф.И.О. проверяющего</th>
                            <th className="box-tables__head">Результат</th>
                            <th className="box-tables__head">Комментарий</th>
                            <th className="box-tables__head">Ф.И.О. преподавателя</th>
                            <th className="box-tables__head">Ф.И.О. принимающего внутреннее ТЗ</th>
                        </tr>
                        </thead>
                        <tbody>
                        {data.length > 0 ? (
                            data.map((item, index) => (
                                <tr key={index} className="every">
                                    <td className="box-tables__rows">{item.date_exam || "-"}</td>
                                    <td className="box-tables__rows box-tables__rows_every1">{item.name_intern || "-"}</td>
                                    <td className="box-tables__rows box-tables__rows_every1">{item.training_form || "-"}</td>
                                    <td className="box-tables__rows">{item.try_count || "-"}</td>
                                    <td className="box-tables__rows">{item.time_exam || "-"}</td>
                                    <td className="box-tables__rows box-tables__rows_every1">{item.name_examiner_full_name || "-"}</td>
                                    <td className="box-tables__rows">{item.result_exam || "-"}</td>
                                    <td className="box-tables__rows box-tables__rows_every1">{item.comment_exam || "-"}</td>
                                    <td className="box-tables__rows box-tables__rows_every1">{item.name_train_full_name || "-"}</td>
                                    <td className="box-tables__rows box-tables__rows_every1">{item.internal_test_examiner_full_name || "-"}</td>
                                    <td className="box-tables__rows_btn">
                                        <button onClick={() => handleEditClick(item)}
                                                className="box-tables__rows_modify">
                                            <svg
                                                width="14"
                                                height="14"
                                                viewBox="0 0 14 14"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M1.75 12.25H2.81875L10.15 4.91875L9.08125 3.85L1.75 11.1812V12.25ZM0.25 13.75V10.5625L10.15 0.68125C10.3 0.54375 10.4656 0.4375 10.6469 0.3625C10.8281 0.2875 11.0188 0.25 11.2188 0.25C11.4187 0.25 11.6125 0.2875 11.8 0.3625C11.9875 0.4375 12.15 0.55 12.2875 0.7L13.3188 1.75C13.4688 1.8875 13.5781 2.05 13.6469 2.2375C13.7156 2.425 13.75 2.6125 13.75 2.8C13.75 3 13.7156 3.19062 13.6469 3.37187C13.5781 3.55312 13.4688 3.71875 13.3188 3.86875L3.4375 13.75H0.25ZM9.60625 4.39375L9.08125 3.85L10.15 4.91875L9.60625 4.39375Z"
                                                    fill="#B7B7B7"
                                                />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={10} className="td">
                                    Нет данных для отображения
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
                <div className="add_box">
                    {!user.is_staff && (
                        <button onClick={openModal} className="add_button"><span><svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                                                              xmlns="http://www.w3.org/2000/svg">
<path
    d="M7.25 11.75H8.75V8.75H11.75V7.25H8.75V4.25H7.25V7.25H4.25V8.75H7.25V11.75ZM8 15.5C6.9625 15.5 5.9875 15.3031 5.075 14.9094C4.1625 14.5156 3.36875 13.9813 2.69375 13.3063C2.01875 12.6313 1.48438 11.8375 1.09063 10.925C0.696875 10.0125 0.5 9.0375 0.5 8C0.5 6.9625 0.696875 5.9875 1.09063 5.075C1.48438 4.1625 2.01875 3.36875 2.69375 2.69375C3.36875 2.01875 4.1625 1.48438 5.075 1.09063C5.9875 0.696875 6.9625 0.5 8 0.5C9.0375 0.5 10.0125 0.696875 10.925 1.09063C11.8375 1.48438 12.6313 2.01875 13.3063 2.69375C13.9813 3.36875 14.5156 4.1625 14.9094 5.075C15.3031 5.9875 15.5 6.9625 15.5 8C15.5 9.0375 15.3031 10.0125 14.9094 10.925C14.5156 11.8375 13.9813 12.6313 13.3063 13.3063C12.6313 13.9813 11.8375 14.5156 10.925 14.9094C10.0125 15.3031 9.0375 15.5 8 15.5ZM8 14C9.675 14 11.0938 13.4187 12.2563 12.2563C13.4187 11.0938 14 9.675 14 8C14 6.325 13.4187 4.90625 12.2563 3.74375C11.0938 2.58125 9.675 2 8 2C6.325 2 4.90625 2.58125 3.74375 3.74375C2.58125 4.90625 2 6.325 2 8C2 9.675 2.58125 11.0938 3.74375 12.2563C4.90625 13.4187 6.325 14 8 14Z"
    fill="#474747"/>
</svg>

          </span>Добавить стажёра
                    </button>
                )}</div>
                {isModalOpen && (
                    user.is_staff ?
                        <ModalEdit
                            closeModal={closeModal}
                            examData={selectedExamData}
                            onAddExam={handleAddExam}
                            fetchData={fetchData}

                        />
                        :
                        <ModalAdd
                            closeModal={closeModal}
                            examData={selectedExamData}
                            onAddExam={handleAddExam}
                            fetchData={fetchData}

                        />
                )}

            </div>
                )}
        </div>
    );
};

export default Testing;
