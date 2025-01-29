import React, { useEffect, useState } from "react";

import Head from "../Head/Head";

import "./CheckLists.css";
import {getCSRFToken} from "../utils/csrf";
import {useUser} from "../utils/UserContext";
import axios from "axios";
import {useLocation} from "react-router-dom";
import InfoIcon from "../../img/InfoIcon";

const CheckLists = () => {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const csrfToken = getCSRFToken();
    const { user } = useUser();
    const location = useLocation();
    const [selectedCompanyName, setSelectedCompanyName] = useState("");
    const [avgResult, setAvgResult] = useState(0);

    const [checkList, setCheckList] = useState([]);
    useEffect(() => {
        fetchData();
        fetchCheckList();
        fetchCompanies();
    }, [location.search]);

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
    const fetchCheckList = async () => {
        try {
            const csrfToken = getCSRFToken();
            const response = await axios.get('http://127.0.0.1:8000/api-root/ch-list/', {
                headers: { 'X-CSRFToken': csrfToken },
            });
            setCheckList(response.data.results);
            setAvgResult(response.data.avg_result);
        } catch (error) {
            console.error("Ошибка при загрузке списка компаний:", error);
        }
    };

    return (
        <div>
            <Head />
            {!user ? (
                <div>Загрузка данных...</div>
            ) : (
            <div className="margin">

                <div className="box-tables center">
                    {user.is_staff ? (
                    <div>
                            <div className='company'>
                            (<h1 className="company__name"><span>{selectedCompanyName}</span><span className="avg-result"
                                style={{
                                    color: avgResult < 65 ? "red" : avgResult < 75 ? "orange" : "green",
                                }}
                            > {avgResult}% </span></h1>)
                        </div>
                    </div>) : ("")}
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
                                    {item.name}<br/>
                                    <span className='worth'>{item.worth}</span>
                                </th>
                            ))}
                            <th className="box-tables__head">Оценка</th>
                            <th className="box-tables__head">Линия</th>
                        </tr>
                        </thead>
                        <tbody>
                        {checkList.length > 0 ? (
                            checkList.map((item, index) => (
                                <tr className="every">
                                    <td className="box-tables__rows">{item.date}</td>
                                    <td className="box-tables__rows">{item.controller_full_name}</td>
                                    <td className="box-tables__rows">{item.operator_name_full_name}</td>
                                    <td className="box-tables__rows">
                                        <span className="call-date">{item.call_date}</span><br/>
                                        <span className="call-time">{item.call_time}</span>
                                    </td>
                                    <td className="box-tables__rows">{item.call_id}</td>
                                    <td className="box-tables__rows">{item.first_miss_name}
                                        <span className="zaebisy">{item.first_comm ? (
                                            <div className="customTooltip">
                                                <button className="noteInfo">
                                                    <InfoIcon/>
                                                </button>
                                                <span className="tooltipText">{item.first_comm}</span>
                                            </div>

                                        ) : ""}</span>
                                    </td>
                                    <td className="box-tables__rows">{item.second_miss_name}
                                        <span className="zaebisy">
                                            {item.second_comm ? (
                                                <div className="customTooltip">
                                                    <button className="noteInfo">
                                                        <InfoIcon/>
                                                    </button>
                                                    <span className="tooltipText">{item.second_comm}</span>
                                                </div>
                                            ) : ""}
                                        </span>
                                    </td>
                                    <td className="box-tables__rows">{item.third_miss_name}
                                        <span className="zaebisy">
                                            {item.second_comm ? (
                                                <div className="customTooltip">
                                                    <button className="noteInfo">
                                                        <InfoIcon/>
                                                    </button>
                                                    <span className="tooltipText">{item.second_comm}</span>
                                                </div>
                                            ) : ""}
                                        </span>
                                    </td>
                                    <td className="box-tables__rows">{item.forty_miss_name}
                                        <span className="zaebisy">
                                            {item.forty_comm ? (
                                                <div className="customTooltip">
                                                    <button className="noteInfo">
                                                        <InfoIcon/>
                                                    </button>
                                                    <span className="tooltipText">{item.forty_comm}</span>
                                                </div>
                                            ) : ""}
                                        </span>
                                    </td>
                                    <td className="box-tables__rows">{item.fifty_miss_name}
                                        <span className="zaebisy">
                                          {item.fifty_comm ? (
                                              <div className="customTooltip">
                                                  <button className="noteInfo">
                                                      <InfoIcon/>
                                                  </button>
                                                  <span className="tooltipText">{item.fifty_comm}</span>
                                              </div>
                                          ) : ""}
                                        </span>
                                    </td>
                                    <td className="box-tables__rows">{item.sixty_miss_name}
                                        <span className="zaebisy">
                                            {item.sixty_comm ? (
                                                <div className="customTooltip">
                                                    <button className="noteInfo">
                                                        <InfoIcon/>
                                                    </button>
                                                    <span className="tooltipText">{item.sixty_comm}</span>
                                                </div>
                                            ) : ""}
                                        </span>
                                    </td>
                                    <td className="box-tables__rows">{item.result}</td>
                                    <td className="box-tables__rows">{item.line_name}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={13} className="td">
                                    Нет данных для отображения
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>)}
        </div>
    );
};

export default CheckLists;
