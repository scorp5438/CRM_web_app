import React, { useEffect, useState } from "react";
import Head from "../Head/Head";

import "./CheckLists.css";
import {getCSRFToken} from "../utils/csrf";
import {useUser} from "../utils/UserContext";
import axios from "axios";
import {useLocation} from "react-router-dom";
import InfoIcon from "../../img/InfoIcon";
import formatDate from "../utils/formateDate";


const CheckLists = () => {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();
    const location = useLocation();
    const [selectedCompanyName, setSelectedCompanyName] = useState("");
    const [avgResult, setAvgResult] = useState(0);
    const [queryParams, setQueryParams] = useState({ check_type: null, company: null });
    const [checkList, setCheckList] = useState([]);
    const [isCompanyVisible, setIsCompanyVisible] = useState(true);


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
            const companySlug = new URLSearchParams(location.search).get("company");

            const selectedCompany = companiesData.results.find(
                (company) => company.slug === companySlug
            );

            if (selectedCompany) {
                setSelectedCompanyName(selectedCompany.name);
                setIsCompanyVisible(true); // Показываем блок
                console.log(isCompanyVisible)
            } else {
                setSelectedCompanyName("Компания не найдена");
                setIsCompanyVisible(false); // Скрываем блок
            }
        } catch (err) {
            setError(`Ошибка: ${err.message}`);
            console.log(error);
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
            setData(result.results || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
            console.log(loading);
        }
    };
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const params = {
            check_type: searchParams.get('check_type') || null,
            company: searchParams.get('company') || null,
        };
        setQueryParams(params);
    }, [location.search]);

    useEffect(() => {
        if (user) {
            const shouldFetch = user.is_staff
                ? queryParams.company !== null && queryParams.check_type !== null
                : queryParams.check_type !== null;

            if (shouldFetch) {
                fetchCheckList();
            }
        }
    }, [queryParams, user]);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const params = {
            check_type: searchParams.get('check_type') || '',
            company: searchParams.get('company') || null,
            date_from: searchParams.get('date_from') || '',
            date_to: searchParams.get('date_to') || '',
        };
        setQueryParams(params);
    }, [location.search]);

    const fetchCheckList = async () => {
        try {
            const csrfToken = getCSRFToken();
            const { company, check_type, date_from, date_to } = queryParams;
            console.log(check_type)
            const response = await axios.get(`http://127.0.0.1:8000/api-root/ch-list/?company=${company}&check_type=${check_type}&date_from=${date_from}&date_to=${date_to}`, {
                headers: { 'X-CSRFToken': csrfToken },
            });

            setCheckList(response.data.results);
            setAvgResult(response.data.avg_result);
        } catch (error) {
            console.error("Ошибка при загрузке списка компаний:", error);
        }
    };
    useEffect(() => {
        if (avgResult !== undefined) {
            console.log("Обновленное avgResult:", avgResult);
        }
    }, [avgResult]);



    const handleFilterSubmit = (event) => {
        event.preventDefault();

        const currentSearchParams = new URLSearchParams(window.location.search);
        const formData = new FormData(event.target);

        formData.forEach((value, key) => {
            if (value.trim()) {
                currentSearchParams.set(key, value);
            } else {
                currentSearchParams.delete(key);
            }
        });


        if (!currentSearchParams.has("company") && queryParams.company) {
            currentSearchParams.set("company", queryParams.company);
        }

        const newUrl = `${window.location.pathname}?${currentSearchParams.toString()}`;
        window.history.pushState({}, '', newUrl);

        // Обновляем состояние
        setQueryParams({
            check_type: currentSearchParams.get("check_type") || null,
            company: currentSearchParams.get('company') || null,
            date_from: currentSearchParams.get('date_from') || '',
            date_to: currentSearchParams.get('date_to') || '',
        });

    };


    const handleReset = () => {
        const currentSearchParams = new URLSearchParams(window.location.search);
        currentSearchParams.delete("date_from");
        currentSearchParams.delete("date_to");

        if (queryParams.company) {
            currentSearchParams.set("company", queryParams.company);
        }

        const newUrl = `${window.location.pathname}?${currentSearchParams.toString()}`;
        window.history.pushState({}, '', newUrl);

        setQueryParams({
            check_type: queryParams.check_type,
            company: queryParams.company,
            date_from: '',
            date_to: '',
        });

        fetchData();
    };

    return (
        <div>
            <Head />
            {!user ? (
                <div>Загрузка данных...</div>
            ) : (
            <div className="margin">

                <div className="box-tables center">

                    <div>

                            <div className='company'>

                                <h1 className="company__name">
                                    <span>{user.is_staff ? selectedCompanyName : ''}</span>
                                    <span className="avg-result" style={{ color: avgResult < 65 ? "red" : avgResult < 75 ? "orange" : "green" }}>{avgResult}%</span>
                                </h1>

                            </div>

                    </div>
                    <div className="box-tables_sorting">
                        <div className="box-tables_sorting_position">
                            <div className="dropdown-content">
                                <form className="dropdown-content_form" method="get" onSubmit={handleFilterSubmit}>
                                    <div className='dropdown-content_min'>
                                        <label htmlFor="date_from">Дата с:</label>
                                        <input type="date" name="date_from" defaultValue={queryParams.date_from || ""} />
                                    </div>

                                    <div className='dropdown-content_min'>
                                        <label htmlFor="date_to">Дата по:</label>
                                        <input type="date" name="date_to" defaultValue={queryParams.date_to || ""} />
                                    </div>
                                    <div className="sort__details_buttons">
                                        <button className="sort__details_buttons_bnt" type="submit">Показать</button>
                                        <button className="sort__details_buttons_bnt sort__details_buttons_bnt_red" type="reset" onClick={handleReset}>Сброс</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
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
                                    <td className="box-tab__rows">{formatDate(item.date) || "-"}</td>
                                    <td className="box-tab__rows">{item.controller_full_name}</td>
                                    <td className="box-tab__rows">{item.operator_name_full_name}</td>
                                    <td className="box-tab__rows">
                                        <span className="call-date">{formatDate(item.call_date)}</span><br/>
                                        <span className="call-time">{item.call_time}</span>
                                    </td>
                                    <td className="box-tab__rows">{item.call_id}</td>
                                    <td className="box-tab__rows">{item.first_miss_name}
                                        <span className="zaebisy">{item.first_comm ? (
                                            <div className="customTooltip">
                                                <button className="note">
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
                                                    <button className="note">
                                                        <InfoIcon/>
                                                    </button>
                                                    <span className="tooltipText">{item.second_comm}</span>
                                                </div>
                                            ) : ""}
                                        </span>
                                    </td>
                                    <td className="box-tab__rows">{item.third_miss_name}
                                        <span className="zaebisy">
                                            {item.second_comm ? (
                                                <div className="customTooltip">
                                                    <button className="note">
                                                        <InfoIcon/>
                                                    </button>
                                                    <span className="tooltipText">{item.second_comm}</span>
                                                </div>
                                            ) : ""}
                                        </span>
                                    </td>
                                    <td className="box-tab__rows">{item.forty_miss_name}
                                        <span className="zaebisy">
                                            {item.forty_comm ? (
                                                <div className="customTooltip">
                                                    <button className="note">
                                                        <InfoIcon/>
                                                    </button>
                                                    <span className="tooltipText">{item.forty_comm}</span>
                                                </div>
                                            ) : ""}
                                        </span>
                                    </td>
                                    <td className="box-tab__rows">{item.fifty_miss_name}
                                        <span className="zaebisy">
                                          {item.fifty_comm ? (
                                              <div className="customTooltip">
                                                  <button className="note">
                                                      <InfoIcon/>
                                                  </button>
                                                  <span className="tooltipText">{item.fifty_comm}</span>
                                              </div>
                                          ) : ""}
                                        </span>
                                    </td>
                                    <td className="box-tab__rows">{item.sixty_miss_name}
                                        <span className="zaebisy">
                                            {item.sixty_comm ? (
                                                <div className="customTooltip">
                                                    <button className="note">
                                                        <InfoIcon/>
                                                    </button>
                                                    <span className="tooltipText">{item.sixty_comm}</span>
                                                </div>
                                            ) : ""}
                                        </span>
                                    </td>
                                    <td className="box-tab__rows">{item.result}</td>
                                    <td className="box-tab__rows">{item.line_name}</td>
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
