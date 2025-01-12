
import Head from "../Head/Head";
import './style_start.css';
import Statistics from "../Statistics/Statistics";



const Start = () => {


    return (
        <div className="start">
            <div className="start__head"><Head /></div>
            <div className="start__body">
                <div className="start__body_table"><Statistics /></div>
            </div>
        </div>

    );
};
export default Start;