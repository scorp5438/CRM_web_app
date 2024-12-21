import React, { useState, useEffect } from "react";
import "./test.css";

const Testing = () => {
    const [data, setData] = useState([]); // Состояние для хранения массива с API
    const [loading, setLoading] = useState(true); // Состояние для индикатора загрузки
    const [error, setError] = useState(null); // Состояние для обработки ошибок

    // Функция для получения данных с API
    const fetchData = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/api-root/testing/");

            // Проверка на успешность ответа
            if (!response.ok) {
                throw new Error(`Ошибка: ${response.statusText}`);
            }

            const result = await response.json();
            setData(result.results || []); // Устанавливаем данные в состояние

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false); // Выключаем индикатор загрузки
        }
    };

    // Выполняем запрос при монтировании компонента
    useEffect(() => {
        fetchData();
    }, []);

    // Обработка состояний: загрузка, ошибка и отображение данных
    if (loading) {
        return <div>Загрузка данных...</div>;
    }

    if (error) {
        return <div>Произошла ошибка: {error}</div>;
    }

    console.log(data.length);
    return (
        <div className="box-tables center">
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
                            <td className="box-tables__rows">{item.name_intern || "-"}</td>
                            <td className="box-tables__rows">{item.training_form || "-"}</td>
                            <td className="box-tables__rows">{item.try_count || "-"}</td>
                            <td className="box-tables__rows">{item.time_exam || "-"}</td>
                            <td className="box-tables__rows">{item.name_examiner_full_name || "-"}</td>
                            <td className="box-tables__rows">{item.result_exam || "-"}</td>
                            <td className="box-tables__rows">{item.comment_exam || "-"}</td>
                            <td className="box-tables__rows">{item.name_train_full_name || "-"}</td>
                            <td className="box-tables__rows">{item.internal_test_examiner_full_name || "-"}</td>
                            <td className="box-tables__rows_btn">
                                <button className="box-tables__rows_modify">
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
    );
};

export default Testing;
