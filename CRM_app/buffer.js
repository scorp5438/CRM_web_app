import { useNavigate } from 'react-router-dom';
import { useUser } from "../utils/UserContext";
import { useRef, useEffect, useState } from "react";
import routes from "../utils/urls";
import './head.css';
import axios from "axios";
import { getCSRFToken } from "../utils/csrf";
import Clock from "../Clock/Clock";

const Head = () => {
    const navigate = useNavigate();
    const { user } = useUser();
    const detailsRef = useRef(null);
    const [companies, setCompanies] = useState([]);
    const [userExams, setUserExams] = useState({});
    const [socket, setSocket] = useState(null);
    const [newNotification, setNewNotification] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (detailsRef.current && !detailsRef.current.contains(event.target)) {
                detailsRef.current.removeAttribute('open');
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (user) {
            fetchUserExams();
            const ws = new WebSocket(`ws://127.0.0.1:8000/ws/notifications/${user.id}/`);
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === "exam_notification") {
                    setNewNotification(true);
                    fetchUserExams();
                }
            };
            ws.onerror = (error) => console.error("WebSocket error:", error);
            setSocket(ws);
            return () => ws.close();
        }
    }, [user]);

    useEffect(() => {
        const interval = setInterval(() => {
            fetchUserExams();
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchCompanies = async () => {
        try {
            const csrfToken = getCSRFToken();
            const response = await axios.get('http://127.0.0.1:8000/api-root/companies/', {
                headers: { 'X-CSRFToken': csrfToken },
            });
            setCompanies(response.data.results);
        } catch (error) {
            console.error("Ошибка при загрузке списка компаний:", error);
        }
    };

    const fetchUserExams = async () => {
        try {
            const csrfToken = getCSRFToken();
            const response = await axios.get('http://127.0.0.1:8000/api-root/user_exam/', {
                headers: { 'X-CSRFToken': csrfToken },
            });
            setUserExams(response.data.results[0]);
        } catch (error) {
            console.error("Ошибка при загрузке экзаменов:", error);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    const navigateToMain = () => navigate(routes.main);
    const navigateToExamUser = () => navigate(routes.exam);

    if (!user) return <div>Загрузка данных...</div>;

    return (
        <div className="header center">
            <div className="header__box">
                <div className="header__logo" onClick={navigateToMain}>
                    <h2 className="header__logo_head">ЛОГО КОМПАНИИ</h2>
                </div>
                <div className="header__buttons">
                    <div className="header__time">
                        <Clock />
                    </div>
                    {user.is_staff ? (
                        <details ref={detailsRef}>
                            <summary className="header__filter">
                                <span>Тестирование {newNotification && <span className="notification-dot" />}</span>
                            </summary>
                            <div className="header__list">
                                {companies.map((company) => (
                                    <div className="header__list_text" key={company.id}>
                                        <div><a href={`${routes.exam}?company=${company.slug}`}>{company.name}</a></div>
                                        {company.count_exams > 0 && <div><a>{company.count_exams}</a></div>}
                                    </div>
                                ))}
                            </div>
                        </details>
                    ) : (
                        <details onClick={navigateToExamUser}>
                            <summary className="header__filter">
                                <span>Тестирование {newNotification && <span className="notification-dot" />}</span>
                            </summary>
                        </details>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Head;