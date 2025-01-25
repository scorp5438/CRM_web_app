import React, { useEffect, useState } from "react";

import Head from "../Head/Head";

import "./CheckLists.css";
import {getCSRFToken} from "../utils/csrf";
import {useUser} from "../utils/UserContext";

const CheckLists = () => {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const csrfToken = getCSRFToken();
    const { setUser } = useUser();
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const url = `http://127.0.0.1:8000/api-root/mistakes/`;
            console.log("Request URL:", url);
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Ошибка: ${response.statusText}`);
            }

            const result = await response.json();
            setData(result.results || []); // Сохраняем массив категорий
        } catch (err) {
            setError(err.message); // Обрабатываем ошибки
        } finally {
            setLoading(false); // Завершаем загрузку
        }
    };

    return (
        <div>
            <Head />
            <div className="margin">
                <div className="box-tables center">
                    <table className="box-tables__table">
                        <thead>
                        <tr>
                            <th className="box-tables__head">Дата проверки</th>
                            <th className="box-tables__head">Контролёр</th>
                            <th className="box-tables__head">Ф.И. оператора</th>
                            <th className="box-tables__head">Дата и время обращения</th>
                            <th className="box-tables__head">ID звонка/чата</th>
                            {data.map((item) => (
                                <th key={item.id} className="box-tables__head">
                                    {item.name}<br />
                                    <span className='worth'>{item.worth}</span>
                                </th>
                            ))}
                            <th className="box-tables__head">Оценка</th>
                            <th className="box-tables__head">Линия</th>
                        </tr>
                        </thead>
                        <tbody>
                        {/* Здесь можно отобразить строки таблицы */}
                        <tr className="every">
                            <td className="box-tables__rows">оалпдрдвлар</td>
                            <td className="box-tables__rows">оалпдрдвлар</td>
                            <td className="box-tables__rows">оалпдрдвлар</td>
                            <td className="box-tables__rows">оалпдрдвлар</td>
                            <td className="box-tables__rows">оалпдрдвлар</td>
                            <td className="box-tables__rows">оалпдрдвлар</td>
                            <td className="box-tables__rows">оалпдрдвлар</td>
                            <td className="box-tables__rows">оалпдрдвлар</td>
                            <td className="box-tables__rows">оалпдрдвлар</td>
                            <td className="box-tables__rows">оалпдрдвлар</td>
                            <td className="box-tables__rows">оалпдрдвлар</td>
                            <td className="box-tables__rows">оалпдрдвлар</td>
                            <td className="box-tables__rows">оалпдрдвлар</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CheckLists;
