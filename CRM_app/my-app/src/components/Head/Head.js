import { useNavigate } from 'react-router-dom';
import { useUser } from "../utils/UserContext";
import { useRef, useEffect, useState, useCallback } from "react";
import routes from "../utils/urls";
import './head.css';
import axios from "axios";
import { getCSRFToken } from "../utils/csrf";
import Clock from "../Clock/Clock";
import ModalCheck from "../componentsModals/ModalCheck/ModalCheck";
import LogoSmall from "../../img/LogoSmall.png";

const Head = () => {
    const navigate = useNavigate();
    const { user } = useUser();
    const detailsRef1 = useRef(null);
    const detailsRef3 = useRef(null);
    const [companies, setCompanies] = useState([]);
    const [userExams, setUserExams] = useState({});
    const [hoveredCompany, setHoveredCompany] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const intervalRef = useRef(null);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const handleFormSubmit = (event) => {
        event.preventDefault();
        closeModal();
    };

    useEffect(() => {
        axios.defaults.withCredentials = true; // Включаем отправку кук
        const handleClickOutside = (event) => {
            document.querySelectorAll("details[open]").forEach((details) => {
                if (!details.contains(event.target)) {
                    details.removeAttribute("open");
                }
            });
        };

        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    const fetchUserExams = useCallback(async () => {
        if (!user || !user.is_staff) return;

        try {
            const csrfToken = getCSRFToken();
            const response = await axios.get('http://127.0.0.1:8000/api-root/user_exam/', {
                headers: { 'X-CSRFToken': csrfToken },
            });
            setUserExams(response.data.results[0]);
        } catch (error) {
            console.error("Ошибка при загрузке экзаменов:", error);
        }
    }, [user]);

    useEffect(() => {
        if (user && user.is_staff) {
            intervalRef.current = setInterval(fetchUserExams, 1000);
        } else {
            clearInterval(intervalRef.current);
        }

        return () => clearInterval(intervalRef.current);
    }, [user, fetchUserExams]);

    const fetchCompanies = useCallback(async () => {
        try {
            const csrfToken = getCSRFToken();
            const response = await axios.get('http://127.0.0.1:8000/api-root/companies/', {
                headers: { 'X-CSRFToken': csrfToken },
            });
            setCompanies(response.data.results);
        } catch (error) {
            console.error("Ошибка при загрузке списка компаний:", error);
        }
    }, []);

    useEffect(() => {
        fetchCompanies();
    }, [fetchCompanies]);

    if (!user) return <div>Загрузка данных...</div>;

    const navigateToMain = () => {
        navigate(routes.main);
    };

    const navigateToExamUser = () => {
        navigate(routes.exam);
    };

    const handleMouseEnter = (companyId) => {
        setHoveredCompany(companyId);
    };

    const handleMouseLeave = () => {
        setHoveredCompany(null);
    };
    return (
        <div className="header center">
            <div className="header__box">
                <div className="header__logo" onClick={navigateToMain}>
                    <img className="header__logo_img" src={LogoSmall} alt="Logo"/>
                </div>

                <div className="header__buttons">
                    <div className="header__time">
                        <div><Clock/></div>
                    </div>

                    {user.post !== "Operator" && (
                        <div>
                            {user.is_staff ? (
                                <details id='testing_btn' ref={detailsRef1}>
                                    <summary className="header__filter">
                                <span>
                                    <svg width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5 10H10.575C10.9083 10 11.1583 9.89583 11.325 9.6875C11.4917 9.47917 11.575 9.25 11.575 9C11.575 8.75 11.4917 8.52083 11.325 8.3125C11.1583 8.10417 10.9083 8 10.575 8H5C4.71667 8 4.47917 8.09583 4.2875 8.2875C4.09583 8.47917 4 8.71667 4 9C4 9.28333 4.09583 9.52083 4.2875 9.7125C4.47917 9.90417 4.71667 10 5 10ZM5 6H9C9.28333 6 9.52083 5.90417 9.7125 5.7125C9.90417 5.52083 10 5.28333 10 5C10 4.71667 9.90417 4.47917 9.7125 4.2875C9.52083 4.09583 9.28333 4 9 4H5C4.71667 4 4.47917 4.09583 4.2875 4.2875C4.09583 4.47917 4 4.71667 4 5C4 5.28333 4.09583 5.52083 4.2875 5.7125C4.47917 5.90417 4.71667 6 5 6ZM2 14C1.45 14 0.979167 13.8042 0.5875 13.4125C0.195833 13.0208 0 12.55 0 12V2C0 1.45 0.195833 0.979167 0.5875 0.5875C0.979167 0.195833 1.45 0 2 0H18C18.55 0 19.0208 0.195833 19.4125 0.5875C19.8042 0.979167 20 1.45 20 2V3.5C20 3.78333 19.9042 4.02083 19.7125 4.2125C19.5208 4.40417 19.2833 4.5 19 4.5C18.7167 4.5 18.4792 4.40417 18.2875 4.2125C18.0958 4.02083 18 3.78333 18 3.5V2H2V12H8C8.28333 12 8.52083 12.0958 8.7125 12.2875C8.90417 12.4792 9 12.7167 9 13C9 13.2833 8.90417 13.5208 8.7125 13.7125C8.52083 13.9042 8.28333 14 8 14H2ZM20.9 7.3C20.9833 7.38333 21.025 7.475 21.025 7.575C21.025 7.675 20.9833 7.76667 20.9 7.85L20 8.75L18.25 7L19.15 6.1C19.2333 6.01667 19.325 5.975 19.425 5.975C19.525 5.975 19.6167 6.01667 19.7 6.1L20.9 7.3ZM19.4 9.35L13.05 15.7C12.95 15.8 12.8375 15.875 12.7125 15.925C12.5875 15.975 12.4583 16 12.325 16H11.5C11.3667 16 11.25 15.95 11.15 15.85C11.05 15.75 11 15.6333 11 15.5V14.675C11 14.5417 11.025 14.4125 11.075 14.2875C11.125 14.1625 11.2 14.05 11.3 13.95L17.65 7.6L19.4 9.35Z" fill="#474747"/>
                                    </svg>
                                </span>
                                        <span>Тестирование</span>
                                    </summary>

                                    <div className="header__list">
                                        {companies.map((company) => (
                                            <div className="header__list_text" key={company.id}>
                                                <div><a href={`${routes.exam}?company=${company.slug}`}>{company.name}</a></div>
                                                {company.count_exams > 0 && <div><span>{company.count_exams}</span></div>}
                                            </div>
                                        ))}
                                    </div>
                                </details>
                            ) : (
                                <details onClick={navigateToExamUser}>
                                    <summary className="header__filter">
                                <span>
                                    <svg width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5 10H10.575C10.9083 10 11.1583 9.89583 11.325 9.6875C11.4917 9.47917 11.575 9.25 11.575 9C11.575 8.75 11.4917 8.52083 11.325 8.3125C11.1583 8.10417 10.9083 8 10.575 8H5C4.71667 8 4.47917 8.09583 4.2875 8.2875C4.09583 8.47917 4 8.71667 4 9C4 9.28333 4.09583 9.52083 4.2875 9.7125C4.47917 9.90417 4.71667 10 5 10ZM5 6H9C9.28333 6 9.52083 5.90417 9.7125 5.7125C9.90417 5.52083 10 5.28333 10 5C10 4.71667 9.90417 4.47917 9.7125 4.2875C9.52083 4.09583 9.28333 4 9 4H5C4.71667 4 4.47917 4.09583 4.2875 4.2875C4.09583 4.47917 4 4.71667 4 5C4 5.28333 4.09583 5.52083 4.2875 5.7125C4.47917 5.90417 4.71667 6 5 6ZM2 14C1.45 14 0.979167 13.8042 0.5875 13.4125C0.195833 13.0208 0 12.55 0 12V2C0 1.45 0.195833 0.979167 0.5875 0.5875C0.979167 0.195833 1.45 0 2 0H18C18.55 0 19.0208 0.195833 19.4125 0.5875C19.8042 0.979167 20 1.45 20 2V3.5C20 3.78333 19.9042 4.02083 19.7125 4.2125C19.5208 4.40417 19.2833 4.5 19 4.5C18.7167 4.5 18.4792 4.40417 18.2875 4.2125C18.0958 4.02083 18 3.78333 18 3.5V2H2V12H8C8.28333 12 8.52083 12.0958 8.7125 12.2875C8.90417 12.4792 9 12.7167 9 13C9 13.2833 8.90417 13.5208 8.7125 13.7125C8.52083 13.9042 8.28333 14 8 14H2ZM20.9 7.3C20.9833 7.38333 21.025 7.475 21.025 7.575C21.025 7.675 20.9833 7.76667 20.9 7.85L20 8.75L18.25 7L19.15 6.1C19.2333 6.01667 19.325 5.975 19.425 5.975C19.525 5.975 19.6167 6.01667 19.7 6.1L20.9 7.3ZM19.4 9.35L13.05 15.7C12.95 15.8 12.8375 15.875 12.7125 15.925C12.5875 15.975 12.4583 16 12.325 16H11.5C11.3667 16 11.25 15.95 11.15 15.85C11.05 15.75 11 15.6333 11 15.5V14.675C11 14.5417 11.025 14.4125 11.075 14.2875C11.125 14.1625 11.2 14.05 11.3 13.95L17.65 7.6L19.4 9.35Z" fill="#474747"/>
                                    </svg>
                                </span>
                                        <span>Тестирование</span>
                                    </summary>
                                </details>
                            )}
                        </div>
                    )}

                    {user.is_staff ? (
                        <details>
                            <summary className="header__filter">
                                <span>
                                    <svg width="20" height="19" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M2 18C1.45 18 0.979167 17.8042 0.5875 17.4125C0.195833 17.0208 0 16.55 0 16V2C0 1.45 0.195833 0.979167 0.5875 0.5875C0.979167 0.195833 1.45 0 2 0H16C16.55 0 17.0208 0.195833 17.4125 0.5875C17.8042 0.979167 18 1.45 18 2V9C18 9.28333 17.9042 9.52083 17.7125 9.7125C17.5208 9.90417 17.2833 10 17 10C16.7167 10 16.4792 9.90417 16.2875 9.7125C16.0958 9.52083 16 9.28333 16 9V2H2V16H8C8.28333 16 8.52083 16.0958 8.7125 16.2875C8.90417 16.4792 9 16.7167 9 17C9 17.2833 8.90417 17.5208 8.7125 17.7125C8.52083 17.9042 8.28333 18 8 18H2ZM14.35 16.175L17.875 12.625C18.075 12.425 18.3125 12.325 18.5875 12.325C18.8625 12.325 19.1 12.425 19.3 12.625C19.5 12.825 19.6 13.0625 19.6 13.3375C19.6 13.6125 19.5 13.85 19.3 14.05L15.05 18.3C14.85 18.5 14.6125 18.6 14.3375 18.6C14.0625 18.6 13.825 18.5 13.625 18.3L11.5 16.175C11.3167 15.975 11.225 15.7375 11.225 15.4625C11.225 15.1875 11.325 14.95 11.525 14.75C11.725 14.55 11.9583 14.45 12.225 14.45C12.4917 14.45 12.725 14.55 12.925 14.75L14.35 16.175ZM5 10C5.28333 10 5.52083 9.90417 5.7125 9.7125C5.90417 9.52083 6 9.28333 6 9C6 8.71667 5.90417 8.47917 5.7125 8.2875C5.52083 8.09583 5.28333 8 5 8C4.71667 8 4.47917 8.09583 4.2875 8.2875C4.09583 8.47917 4 8.71667 4 9C4 9.28333 4.09583 9.52083 4.2875 9.7125C4.47917 9.90417 4.71667 10 5 10ZM5 6C5.28333 6 5.52083 5.90417 5.7125 5.7125C5.90417 5.52083 6 5.28333 6 5C6 4.71667 5.90417 4.47917 5.7125 4.2875C5.52083 4.09583 5.28333 4 5 4C4.71667 4 4.47917 4.09583 4.2875 4.2875C4.09583 4.47917 4 4.71667 4 5C4 5.28333 4.09583 5.52083 4.2875 5.7125C4.47917 5.90417 4.71667 6 5 6ZM13 10C13.2833 10 13.5208 9.90417 13.7125 9.7125C13.9042 9.52083 14 9.28333 14 9C14 8.71667 13.9042 8.47917 13.7125 8.2875C13.5208 8.09583 13.2833 8 13 8H9C8.71667 8 8.47917 8.09583 8.2875 8.2875C8.09583 8.47917 8 8.71667 8 9C8 9.28333 8.09583 9.52083 8.2875 9.7125C8.47917 9.90417 8.71667 10 9 10H13ZM13 6C13.2833 6 13.5208 5.90417 13.7125 5.7125C13.9042 5.52083 14 5.28333 14 5C14 4.71667 13.9042 4.47917 13.7125 4.2875C13.5208 4.09583 13.2833 4 13 4H9C8.71667 4 8.47917 4.09583 8.2875 4.2875C8.09583 4.47917 8 4.71667 8 5C8 5.28333 8.09583 5.52083 8.2875 5.7125C8.47917 5.90417 8.71667 6 9 6H13Z" fill="#474747"/>
                                    </svg>
                                </span>
                                <span>Чек-лист</span>
                            </summary>
                            <div className="header__list header__list_add">
                                <div><button className='add__list' onClick={openModal}>Создать проверку</button></div>
                                {companies.map((company) => (
                                    <div
                                        key={company.id}
                                        className="company-item"
                                        onMouseEnter={() => handleMouseEnter(company.id)}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        <span>{company.name}</span>
                                        {hoveredCompany === company.id && (
                                            <div className="dropdown-menu">
                                                <div className='call-chat'><a href={`${routes.lists}?company=${company.slug}&check_type=call`}>Звонки</a></div>
                                                <div className='call-chat'><a href={`${routes.lists}?company=${company.slug}&check_type=write`}>Письма</a></div>
                                                <div className='call-chat'><a href={`${routes.complaints}?company=${company.slug}`}>Жалобы</a></div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </details>
                    ) : (
                        <details id='testing_btn' ref={detailsRef1}>
                            <summary className="header__filter">
                                <span>
                                    <svg width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5 10H10.575C10.9083 10 11.1583 9.89583 11.325 9.6875C11.4917 9.47917 11.575 9.25 11.575 9C11.575 8.75 11.4917 8.52083 11.325 8.3125C11.1583 8.10417 10.9083 8 10.575 8H5C4.71667 8 4.47917 8.09583 4.2875 8.2875C4.09583 8.47917 4 8.71667 4 9C4 9.28333 4.09583 9.52083 4.2875 9.7125C4.47917 9.90417 4.71667 10 5 10ZM5 6H9C9.28333 6 9.52083 5.90417 9.7125 5.7125C9.90417 5.52083 10 5.28333 10 5C10 4.71667 9.90417 4.47917 9.7125 4.2875C9.52083 4.09583 9.28333 4 9 4H5C4.71667 4 4.47917 4.09583 4.2875 4.2875C4.09583 4.47917 4 4.71667 4 5C4 5.28333 4.09583 5.52083 4.2875 5.7125C4.47917 5.90417 4.71667 6 5 6ZM2 14C1.45 14 0.979167 13.8042 0.5875 13.4125C0.195833 13.0208 0 12.55 0 12V2C0 1.45 0.195833 0.979167 0.5875 0.5875C0.979167 0.195833 1.45 0 2 0H18C18.55 0 19.0208 0.195833 19.4125 0.5875C19.8042 0.979167 20 1.45 20 2V3.5C20 3.78333 19.9042 4.02083 19.7125 4.2125C19.5208 4.40417 19.2833 4.5 19 4.5C18.7167 4.5 18.4792 4.40417 18.2875 4.2125C18.0958 4.02083 18 3.78333 18 3.5V2H2V12H8C8.28333 12 8.52083 12.0958 8.7125 12.2875C8.90417 12.4792 9 12.7167 9 13C9 13.2833 8.90417 13.5208 8.7125 13.7125C8.52083 13.9042 8.28333 14 8 14H2ZM20.9 7.3C20.9833 7.38333 21.025 7.475 21.025 7.575C21.025 7.675 20.9833 7.76667 20.9 7.85L20 8.75L18.25 7L19.15 6.1C19.2333 6.01667 19.325 5.975 19.425 5.975C19.525 5.975 19.6167 6.01667 19.7 6.1L20.9 7.3ZM19.4 9.35L13.05 15.7C12.95 15.8 12.8375 15.875 12.7125 15.925C12.5875 15.975 12.4583 16 12.325 16H11.5C11.3667 16 11.25 15.95 11.15 15.85C11.05 15.75 11 15.6333 11 15.5V14.675C11 14.5417 11.025 14.4125 11.075 14.2875C11.125 14.1625 11.2 14.05 11.3 13.95L17.65 7.6L19.4 9.35Z" fill="#474747"/>
                                    </svg>
                                </span>
                                <span>Чек-лист</span>
                            </summary>

                            <div className="header__list">
                                <div className='call-chat'>
                                    <a href={`${routes.lists}?company=&check_type=call`}>Звонки</a>
                                </div>
                                <div className='call-chat'>
                                    <a href={`${routes.lists}?company=&check_type=write`}>Письма</a>
                                </div>
                                <div className='call-chat'>
                                    <a href={`${routes.complaints}?company=`}>Жалобы</a>
                                </div>
                            </div>
                        </details>
                    )}

                    <details ref={detailsRef3}>
                        <summary className="header__filter">
                            <span>
                                <svg width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M16.55 5.175L20.075 1.625C20.275 1.425 20.5125 1.325 20.7875 1.325C21.0625 1.325 21.3 1.425 21.5 1.625C21.7 1.825 21.8 2.0625 21.8 2.3375C21.8 2.6125 21.7 2.85 21.5 3.05L17.25 7.3C17.05 7.5 16.8167 7.6 16.55 7.6C16.2833 7.6 16.05 7.5 15.85 7.3L13.725 5.175C13.525 4.975 13.425 4.7375 13.425 4.4625C13.425 4.1875 13.525 3.95 13.725 3.75C13.925 3.55 14.1583 3.45 14.425 3.45C14.6917 3.45 14.925 3.55 15.125 3.75L16.55 5.175ZM8 8C6.9 8 5.95833 7.60833 5.175 6.825C4.39167 6.04167 4 5.1 4 4C4 2.9 4.39167 1.95833 5.175 1.175C5.95833 0.391667 6.9 0 8 0C9.1 0 10.0417 0.391667 10.825 1.175C11.6083 1.95833 12 2.9 12 4C12 5.1 11.6083 6.04167 10.825 6.825C10.0417 7.60833 9.1 8 8 8ZM0 14V13.2C0 12.6333 0.145833 12.1125 0.4375 11.6375C0.729167 11.1625 1.11667 10.8 1.6 10.55C2.63333 10.0333 3.68333 9.64583 4.75 9.3875C5.81667 9.12917 6.9 9 8 9C9.1 9 10.1833 9.12917 11.25 9.3875C12.3167 9.64583 13.3667 10.0333 14.4 10.55C14.8833 10.8 15.2708 11.1625 15.5625 11.6375C15.8542 12.1125 16 12.6333 16 13.2V14C16 14.55 15.8042 15.0208 15.4125 15.4125C15.0208 15.8042 14.55 16 14 16H2C1.45 16 0.979167 15.8042 0.5875 15.4125C0.195833 15.0208 0 14.55 0 14ZM2 14H14V13.2C14 13.0167 13.9542 12.85 13.8625 12.7C13.7708 12.55 13.65 12.4333 13.5 12.35C12.6 11.9 11.6917 11.5625 10.775 11.3375C9.85833 11.1125 8.93333 11 8 11C7.06667 11 6.14167 11.1125 5.225 11.3375C4.30833 11.5625 3.4 11.9 2.5 12.35C2.35 12.4333 2.22917 12.55 2.1375 12.7C2.04583 12.85 2 13.0167 2 13.2V14ZM8 6C8.55 6 9.02083 5.80417 9.4125 5.4125C9.80417 5.02083 10 4.55 10 4C10 3.45 9.80417 2.97917 9.4125 2.5875C9.02083 2.19583 8.55 2 8 2C7.45 2 6.97917 2.19583 6.5875 2.5875C6.19583 2.97917 6 3.45 6 4C6 4.55 6.19583 5.02083 6.5875 5.4125C6.97917 5.80417 7.45 6 8 6Z" fill="#474747"/>
                                </svg>
                            </span>
                            <span>{user.full_name}</span>
                        </summary>

                        <div className="header__list">
                            {user.is_staff && (
                                <div className="header__list_text"><a href={routes.admin}>Админ панель</a></div>
                            )}
                            {user.is_staff && (
                                <div className="header__list_text">
                                    <div><a href={`${routes.exam}?mode=my-exam`}>Мои зачёты</a></div>
                                    {userExams.count_exams > 0 && (
                                        <div>{userExams.count_exams}</div>
                                    )}
                                </div>
                            )}
                            <div className="header__list_text"><a href={routes.logout}>Выход</a></div>
                        </div>
                    </details>
                </div>
            </div>

            <ModalCheck
                isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={handleFormSubmit}
            />
        </div>
    );
};

export default Head;