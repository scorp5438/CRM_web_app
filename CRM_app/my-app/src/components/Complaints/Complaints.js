import React, { useState, useEffect } from "react";
import Head from "../Head/Head";
import formatDate from "../utils/formateDate";
import './complaints.css';
import { useUser } from "../utils/UserContext";
import { useLocation } from "react-router-dom";

const Complaints = () => {
    const [selectedCompanyName, setSelectedCompanyName] = useState("");
    const [complaints, setComplaints] = useState([]);
    const [error, setError] = useState(null); // Состояние для обработки ошибок
    const { user } = useUser();
    const location = useLocation();
    const [queryParams, setQueryParams] = useState({ company: null, date_from: '', date_to: '' });

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
                setSelectedCompanyName(selectedCompany.name); // Устанавливаем имя компании
            } else {
                document.querySelector(".company")?.remove(); // Используем optional chaining на случай, если элемент не найден
                setSelectedCompanyName("Компания не найдена");
            }
        } catch (err) {
            setError(`Ошибка: ${err.message}`);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, [location.search]);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const params = {
            company: searchParams.get('company') || null,
            date_from: searchParams.get('date_from') || '',
            date_to: searchParams.get('date_to') || '',
        };
        setQueryParams(params);
    }, [location.search]);

    const handleComplaints = async () => {
        try {
            const { company, date_from, date_to } = queryParams;
            console.log(company);
            const response = await fetch(
                `http://127.0.0.1:8000/api-root/complaints/?company=${company}&date_from=${date_from}&date_to=${date_to}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Ошибка: ${response.statusText}`);
            }

            const complaints = await response.json();
            setComplaints(complaints.results || []);
            console.log(complaints);
        } catch (err) {
            setError(err.message);
        }
    };


    useEffect(() => {
        handleComplaints();
    }, [queryParams]);

    useEffect(() => {
        const widthBlocks = document.querySelectorAll('.company');
        const tableNone = document.querySelectorAll('.tableNone');

        if (widthBlocks.length > 0) {
            widthBlocks.forEach(block => {
                block.style.width = tableNone.length > 0 ? '1600px' : '1557px';
                block.style.right = tableNone.length > 0 ? '0' : '22px';
            });
        }
    }, [complaints]); // Обновляем стили при изменении данных

    return (
        <div>
            <Head />
            {!user ? (
                <div>Загрузка данных...</div>
            ) : (
                <div>
                    <div className="box-tables center">
                        <div>
                            <div className='company'>
                                <h1 className="company__name">{selectedCompanyName}</h1>
                            </div>
                        </div>
                        <table className="box-tables__table">
                            <thead>
                            <tr>
                                <th className="box-tables__head">Дата поверки</th>
                                <th className="box-tables__head">Дата и время жалобы</th>
                                <th className="box-tables__head">Тип проверки</th>
                                <th className="box-tables__head">Номер жалобы</th>
                                <th className="box-tables__head">Оператор</th>
                                <th className="box-tables__head">Комментарий</th>
                            </tr>
                            </thead>
                            <tbody>
                            {complaints.length > 0 ? (
                                complaints.map((item, index) => (
                                    <tr key={index} className="every">
                                        <td className="box-tab__rows">{formatDate(item.date) || "-"}</td>
                                        <td className="box-tab__rows">
                                            <span className="call-date">{formatDate(item.call_date)}</span><br />
                                            <span className="call-time">{item.call_time}</span>
                                        </td>
                                        <td className="box-tables__rows box-tables__rows_every1">{item.type_appeal || "-"}</td>
                                        <td className="box-tables__rows">{item.claim_number || "-"}</td>
                                        <td className="box-tables__rows box-tables__rows_every1">{item.operator_name_full_name || "-"}</td>
                                        <td className="box-tables__rows box-tables__rows_every1">{item.sixty_comm || "-"}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="tableNone">
                                        Нет данных для отображения
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Complaints;