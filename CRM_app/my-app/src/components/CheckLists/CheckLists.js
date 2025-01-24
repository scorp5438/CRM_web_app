import React, { useState, useEffect } from "react";

import Head from "../Head/Head";

import './CheckLists.css';

const CheckLists = () => {

    return (
        <div><Head/>
               <div>
                    <div className="box-tables center">
                        <div>

                        </div>
                        <table className="box-tables__table">
                            <thead>
                            <tr>
                                <th className="box-tables__head">Дата проверки</th>
                                <th className="box-tables__head">Контролёр</th>
                                <th className="box-tables__head">Ф.И. оператора</th>
                                <th className="box-tables__head">Дата и время обращения</th>
                                <th className="box-tables__head">ID звонка/чата</th>
                                <th className="box-tables__head">Категория 1</th>
                                <th className="box-tables__head">Категория 2</th>
                                <th className="box-tables__head">Категория 3</th>
                                <th className="box-tables__head">Категория 4</th>
                                <th className="box-tables__head">Категория 5</th>
                                <th className="box-tables__head">Категория 6</th>
                                <th className="box-tables__head">Оценка</th>
                                <th className="box-tables__head">Линия</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr className="every">
                                        <td className="box-tables__rows">оалпдрдвлар</td>
                                        <td className="box-tables__rows">оалпдрдвлар</td>
                                        <td className="box-tables__rows">оалпдрдвлар</td>
                                        <td className="box-tables__rows">оалпдрдвлар</td>
                                        <td className="box-tables__rows">оалпдрдвлар</td>
                                        <td className="box-tables__rows">оалпдрдвлар</td>
                                        <td className="box-tables__rows">оалпдрдвлар</td>
                                        <td className="box-tables__rows">оалпдрдвлар</td>
                                        <td className="box-tables__rows">оалпдрдвлар</td>
                                        <td className="box-tables__rows">оалпдрдвлар</td>
                                        <td className="box-tables__rows">оалпдрдвлар</td>
                                        <td className="box-tables__rows">оалпдрдвлар</td>
                                        <td className="box-tables__rows">оалпдрдвлар</td>


                                    </tr>

                            </tbody>
                        </table>
                    </div>
                    <div className="add_box">


                      </div>


                </div>
        </div>
    );
};

export default CheckLists;
