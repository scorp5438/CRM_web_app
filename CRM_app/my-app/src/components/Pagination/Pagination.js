import React from "react";
import './page.css';

const Pagination = ({ currentPage, page, onPageChange }) => {
    const totalPages = page || 1;

    const getPageNumbers = () => {
        if (totalPages <= 1) return [1];

        const pages = [];
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        return pages;
    };
    return (
        <div className="pgn">
            <ul className="pgn__list" role="navigation" aria-labelledby="paginglabel">
                {/* Кнопка "Предыдущая" */}
                <li className="prev" title="Previous Page">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        rel="prev"
                    >
                        <i className="pgn__prev-icon icon-angle-left"></i>
                        <span className="pgn__prev-txt"><svg width="14" height="26" viewBox="0 0 14 26" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10.6223 18.3706L9.57602 19.4451L3.718 13.7483C3.62358 13.657 3.54814 13.5479 3.49603 13.4274C3.44392 13.3069 3.41616 13.1772 3.41435 13.0459C3.41254 12.9146 3.43672 12.7842 3.48549 12.6623C3.53427 12.5403 3.60667 12.4292 3.69854 12.3354L9.39739 6.47636L10.4719 7.52166L5.12312 13.0208L10.6223 18.3706Z" fill="black"/>
</svg>
</span>
                    </button>
                </li>

                {/* Номера страниц */}
                <li className="pgn__item">
                    {getPageNumbers().map((pageNumber) => (
                        <button
                            key={pageNumber}
                            onClick={() => onPageChange(pageNumber)}
                            className={pageNumber === currentPage ? "current" : ""}
                        >
                            {pageNumber}
                        </button>
                    ))}
                </li>

                {/* Кнопка "Следующая" */}
                <li className="next" title="Next Page">
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === page} // Отключаем кнопку, если это последняя страница
                        rel="next"
                    >
                        <i className="pgn__next-icon icon-angle-right"></i>
                        <span className="pgn__next-txt"><svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0.451987 1.57999L1.51299 0.519991L7.29199 6.29699C7.38514 6.38956 7.45907 6.49963 7.50952 6.62088C7.55997 6.74213 7.58594 6.87216 7.58594 7.00349C7.58594 7.13482 7.55997 7.26485 7.50952 7.3861C7.45907 7.50735 7.38514 7.61742 7.29199 7.70999L1.51299 13.49L0.452987 12.43L5.87699 7.00499L0.451987 1.57999Z" fill="black"/>
</svg>
</span>
                    </button>
                </li>
            </ul>
        </div>
    );
};

export default Pagination;