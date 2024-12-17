import { useNavigate } from 'react-router-dom';
import routes from "../utils/urls";



const Head = () => {
    const navigate = useNavigate();
    const handleButtonClick = () => {
        navigate(routes.exam);
    };
    return (
        <div>
            <h1>Hello</h1>
            <button className="header-nav-button" title="Раздел по тестированию" onClick={handleButtonClick}>Тестирование</button>
        </div>


    );
};
export default Head;