import React, { useState, useEffect } from "react";
import './style_statistics.css';
import RestImg from '../../img/rest.png'
import axios from "axios";

const Statistics = () => {
  const [tableData, setTableData] = useState([]); // Состояние для хранения данных таблицы
  const [error, setError] = useState(null); // Состояние для обработки ошибок

  const fetchTableData = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api-root/table_data/");
      setTableData(response.data.results); // Сохраняем данные в состоянии
    } catch (err) {
      setError(`Ошибка: ${err.message}`);
    }
  };

  useEffect(() => {
    axios.defaults.withCredentials = true; // Включаем отправку кук
    fetchTableData();
  }, []);

  if (error) {
    return <div><img src={RestImg} alt="Rest"/></div>;
  }

  return (
      <div className="top_table">
        <p className="top_table__head">Выполненная работа за день</p>
        <table className="top_table__box">
          <thead className="top_table__strok">
          <tr className="top_table__strok_head">
            <th className="top_table__strok_head_h">ОКК</th>
            <th className="top_table__strok_head_h">Звонки</th>
            <th className="top_table__strok_head_h">Письма</th>
            <th className="top_table__strok_head_h">Тестовый зачёт</th>
            <th className="top_table__strok_head_h">Выработка</th>
          </tr>
          </thead>
          <tbody className="top_table__body">
          {tableData.length > 0 ? (
              tableData.map((item, index) => (
                  <tr className="top_table__body_headBody" key={index}>
                    <th className="top_table__body_strok">{item.full_name}</th>
                    <td className="top_table__body_strok">{item.count_of_checks_call}</td>
                    <td className="top_table__body_strok">{item.count_of_checks_write}</td>
                    <td className="top_table__body_strok">{item.count_exam_conducted}</td>
                    <td className="top_table__body_strok">{item.make.toFixed(2)}%</td>
                  </tr>
              ))
          ) : (
              <tr>
                <td colSpan={5}>Нет данных для отображения</td>
              </tr>
          )}
          </tbody>
        </table>
      </div>
  );
};

export default Statistics;