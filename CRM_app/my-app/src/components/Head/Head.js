import { useNavigate } from 'react-router-dom';
import Testing from "../Testing/Testing";
import routes from "../utils/urls";



const Head = () => {
    const navigate = useNavigate();
    const handleButtonClick = () => {
        navigate(routes.exam);
    };
    return (
        <div>
            <button className="header-nav-button" title="Раздел по тестированию" onClick={handleButtonClick}>
                <Testing/><p> Тестирование </p></button>
        </div>


    );
};
export default Head;