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
import { isValidDateRange} from "../utils/validateDateRange";

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
            const response = await axios.get("http://127.0.0.1:8000/api-root/companies/");
            const companiesData = response.data;
            const companySlug = new URLSearchParams(location.search).get("company");

            const selectedCompany = companiesData.results.find(
                (company) => company.slug === companySlug
            );

            if (selectedCompany) {
                setSelectedCompanyName(selectedCompany.name);
            } else {
                document.querySelector(".company")?.remove();
                setSelectedCompanyName("Компания не найдена");
            }
        } catch (err) {
            console.error(`Ошибка: ${err.message}`);
        }
    }, [location.search]);

    const fetchData = useCallback(async () => {
        try {
            const response = await axios.get("http://127.0.0.1:8000/api-root/mistakes/");
            setData(response.data.results || []);
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
            setPage(response.data.results?.length ? response.data.page : 1);
        } catch (error) {
            console.error("Ошибка при загрузке списка компаний:", error);
            setCheckList([]);
            setPage(1); // При ошибке сбрасываем page, но currentPage остаётся
        }
    }, [queryParams, currentPage]);

    useEffect(() => {
        axios.defaults.withCredentials = true; // Включаем отправку кук
    }, []);

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
            date_from: searchParams.get('date_from') || '',
            date_to: searchParams.get('date_to') || '',
        };
        const pageFromUrl = Number(searchParams.get('page')) || 1;
        setCurrentPage(pageFromUrl);
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

        // Проверка корректности диапазона дат
        if (dateFrom && dateTo && !isValidDateRange(dateFrom, dateTo)) {
            setDateError("'Дата с' не может быть больше чем 'Дата по'");
            return;
        }
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

        setQueryParams({
            check_type: currentSearchParams.get('check_type') || null,
            company: currentSearchParams.get('company') || null,
            date_from: currentSearchParams.get('date_from') || '',
            date_to: currentSearchParams.get('date_to') || '',
        });
        setCurrentPage(1);
    };
    useEffect(() => {
        if (dateError) {
            const timer = setTimeout(() => {
                setDateError("");
            }, 5000);
            return () => clearTimeout(timer);
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
                                    {user.is_staff ? selectedCompanyName : ''}
                                    <span className={`avg-result avg-result-${avgResult < 65 ? 'red' : avgResult < 75 ? 'orange' : 'green'}`}>
                                        {avgResult}%</span>
                                        <span><h3> - средний балл по всем проверкам в категории {checkTypeNames[queryParams.check_type] || "неизвестно"}</h3></span>
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
                                    queryParams={queryParams}
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
                                        {item.name}<br />
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
                                            <span className="call-date">{formatDate(item.call_date)}</span><br />
                                            <span className="call-time">{item.call_time}</span>
                                        </td>
                                        <td className="box-tab__rows">{item.call_id}</td>
                                        <td className="box-tab__rows">{item.first_miss_name}
                                            <span className="zaebisy">{item.first_comm ? (
                                                <div className="customTooltip">
                                                    <button className="note">
                                                        <InfoIcon />
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
                                                                <InfoIcon />
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
                                                                <InfoIcon />
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
                                                                <InfoIcon />
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
                                                                <InfoIcon />
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
                                                                <InfoIcon />
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