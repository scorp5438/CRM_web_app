import React from "react";



const FilterData = ({
                        handleFilterSubmit,
                        handleCheckboxChange,
                        selectedResults = [],
                        queryParams = {},
                        results = [],
                        handleReset,
                        showDateFromTo = true,
                        showResultsFilter = false,
                        customFields = [],
                        mode = null,
                        dateError = "",
                    }) => {

    return (
        <div className="dropdown-content">
            <form className="dropdown-content_form" method="get" onSubmit={handleFilterSubmit}>
                {showDateFromTo && mode !== 'my-exam' && (
                    <>
                        <div className='dropdown-content_min'>
                            <label htmlFor="date_from">Дата с:</label>
                            <input
                                type="date"
                                name="date_from"
                                defaultValue={queryParams.date_from || ''}
                            />
                        </div>

                        <div className='dropdown-content_min'>
                            <label htmlFor="date_to">Дата по:</label>
                            <input
                                type="date"
                                name="date_to"
                                defaultValue={queryParams.date_to || ''}
                            />
                        </div>

                        {dateError && (
                            <div style={{ fontSize:'13px', color: 'red', marginTop: '4px', marginLeft: '4px' }}>
                                {dateError}
                            </div>
                        )}
                    </>
                )}

                {showResultsFilter && results.length > 0 && (
                    <details className="sort__details">
                        <summary className="sort__details_summary">
                            <span className="sort__details_heading">Выберите результат</span>
                        </summary>
                        <div className="sort__details_check">
                            {results.map((result) => (
                                <div key={result} className="sort__details_box">
                                    <label className="custom-dropdown_label">
                                        <div>
                                            <input
                                                type="checkbox"
                                                value={result}
                                                checked={selectedResults.includes(result)}
                                                onChange={() => handleCheckboxChange(result)}
                                            />
                                        </div>
                                        <span>{result}</span>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </details>
                )}

                {/* Кастомные поля (если переданы) */}
                {customFields.map((field) => (
                    <div key={field.name} className='dropdown-content_min'>
                        <label htmlFor={field.name}>{field.label}:</label>
                        {field.type === 'select' ? (
                            <select
                                name={field.name}
                                defaultValue={queryParams[field.name] || ""}
                            >
                                {field.options.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type={field.type || 'text'}
                                name={field.name}
                                defaultValue={queryParams[field.name] || ""}
                            />
                        )}
                    </div>
                ))}

                <div className="sort__details_buttons">
                    {showDateFromTo && mode !== 'my-exam' && (
                    <button className="sort__details_buttons_bnt" type="submit">Показать</button>
                        )}
                    <button
                        className="sort__details_buttons_bnt sort__details_buttons_bnt_red"
                        type="reset"
                        onClick={handleReset}
                    >
                        Сброс
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FilterData;