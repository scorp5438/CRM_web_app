import React, { useEffect, useState, useCallback } from "react";
import Head from "../Head/Head";
import "./CheckLists.css";
import { getCSRFToken } from "../utils/csrf";
import { useUser } from "../utils/UserContext";
import axios from "axios";
import { useLocation } from "react-router-dom";
import InfoIcon from "../../img/InfoIcon";
import formatDate from "../utils/formateDate";
import Pagination from "../Pagination/Pagination";
import FilterData from "../FilterData/FilterData";
import {isValidDateRange} from "../utils/validateDateRange";

const CheckLists = () => {
    const [data, setData] = useState([]);
    const { user } = useUser();
    const location = useLocation();
    const [selectedCompanyName, setSelectedCompanyName] = useState("");
    const [avgResult, setAvgResult] = useState(0);
    const [queryParams, setQueryParams] = useState({ check_type: null, company: null });
    const [checkList, setCheckList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [page, setPage] = useState(1);
    const isLettersCheck = queryParams.check_type === 'write' || queryParams.check_type === 'письма';
    const [dateError, setDateError] = useState("");
    const fetchCompanies = useCallback(async () => {
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
            } else {
                setSelectedCompanyName("Компания не найдена");
            }
        } catch (err) {
            console.error(`Ошибка: ${err.message}`);
        }
    }, [location.search]);

    const fetchData = useCallback(async () => {
        try {
            const url = `http://127.0.0.1:8000/api-root/mistakes/`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Ошибка: ${response.statusText}`);
            }

            const result = await response.json();
            setData(result.results || []);
        } catch (err) {
            console.error(err.message);
        }
    }, []);

    const fetchCheckList = useCallback(async () => {
        try {
            const csrfToken = getCSRFToken();
            const { company, check_type, date_from, date_to } = queryParams;
            const response = await axios.get(
                `http://127.0.0.1:8000/api-root/ch-list/?company=${company}&check_type=${check_type}&date_from=${date_from}&date_to=${date_to}&page=${currentPage}`,
                { headers: { 'X-CSRFToken': csrfToken } }
            );

            setCheckList(response.data.results || []);
            setAvgResult(response.data.avg_result || 0);
            // Устанавливаем page в 1, если данных нет, но сохраняем currentPage
            setPage(response.data.results?.length ? response.data.page : 1);
        } catch (error) {
            console.error("Ошибка при загрузке списка компаний:", error);
            setCheckList([]);
            setPage(1); // При ошибке сбрасываем page, но currentPage остаётся
        }
    }, [queryParams, currentPage]);

    useEffect(() => {
        fetchData();
        fetchCheckList();
        fetchCompanies();
    }, [fetchData, fetchCheckList, fetchCompanies, location.search]);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const params = {
            check_type: searchParams.get('check_type') || null,
            company: searchParams.get('company') || null,
            page: Number(searchParams.get('currentPag') || 0),
        };
        setQueryParams(params);
    }, [location.search]);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const params = {
            check_type: searchParams.get('check_type') || null,
            company: searchParams.get('company') || null,
            date_from: searchParams.get('date_from') || '',
            date_to: searchParams.get('date_to') || '',
        };
        // Получаем номер страницы из URL
        const pageFromUrl = Number(searchParams.get('page')) || 1;
        setCurrentPage(pageFromUrl); // Устанавливаем текущую страницу
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
    }, [queryParams, user, fetchCheckList]);

    const handleFilterSubmit = (event) => {
        event.preventDefault();

        const currentSearchParams = new URLSearchParams(window.location.search);
        const formData = new FormData(event.target);

        const dateFrom = formData.get("date_from");
        const dateTo = formData.get("date_to");

        // 🔍 Проверка корректности диапазона дат
        if (!isValidDateRange(dateFrom, dateTo)) {
            setDateError("'Дата с' не может быть больше чем 'Дата по'");
            return;
        }
        console.log(dateError);
        setDateError("");

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

        const newQueryParams = {
            mode: currentSearchParams.get('mode') || null,
            company: currentSearchParams.get('company') || null,
            date_from: currentSearchParams.get('date_from') || null,
            date_to: currentSearchParams.get('date_to') || null,
        };

        setQueryParams(newQueryParams);
        setCurrentPage(1);
    };
    useEffect(() => {
        if (dateError) {
            const timeout = setTimeout(() => {
                setDateError(null);
            }, 5000); // 5000 миллисекунд = 5 секунд

            return () => clearTimeout(timeout);
        }
    }, [dateError]);

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
        setCurrentPage(1);
        fetchData();
    };
    const handlePageChange = (pageNumber) => {
        const searchParams = new URLSearchParams(location.search);
        searchParams.set('page', pageNumber);
        window.history.pushState({}, '', `?${searchParams.toString()}`);
        setCurrentPage(pageNumber);
    };
    const checkTypeNames = {
        call: "звонки",
        write: "письма",
        письма: "письма",
        звонки: "звонки"
    };

    const getResultClass = () => {
        if (avgResult < 65) return "avg-result avg-result-red";
        if (avgResult < 75) return "avg-result avg-result-orange";
        return "avg-result avg-result-green";
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
                                    {user.is_staff && (
                                    <span> {selectedCompanyName}</span>)}
                                    <span className={getResultClass()}>{avgResult}% </span>
                                    <h3>- средний балл по всем проверкам в категории {checkTypeNames[queryParams.check_type] || "неизвестно"}</h3>
                                </h1>
                            </div>
                        </div>
                        <div className="box-tables_sorting">
                            <div className="box-tables_sorting_position">
                                <FilterData
                                    handleFilterSubmit={handleFilterSubmit}
                                    handleReset={handleReset}
                                    showDateFromTo={true}
                                    showResultsFilter={false}
                                    dateError={dateError}
                                />
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
                                {!isLettersCheck && <th className="box-tables__head">Линия</th>}
                            </tr>
                            </thead>
                            <tbody>
                            {checkList.length > 0 ? (
                                checkList.map((item, index) => (
                                    <tr key={index} className="every">
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
                                        {!isLettersCheck && <td className="box-tab__rows">{item.line_name}</td>}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={isLettersCheck ? 12 : 13} className="td">
                                        Нет данных для отображения
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            <div>
                <Pagination
                    currentPage={currentPage}
                    page={page}
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    );
};

export default CheckLists;