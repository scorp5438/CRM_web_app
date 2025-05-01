
/**
 * Проверяет, чтобы дата "с" не была позже даты "по"
 * @param {string} dateFrom - значение поля date_from (в формате 'YYYY-MM-DD')
 * @param {string} dateTo - значение поля date_to (в формате 'YYYY-MM-DD')
 * @returns {boolean} - true, если дата корректна, иначе false
 */
export const isValidDateRange = (dateFrom, dateTo) => {
    if (!dateFrom || !dateTo) return true;
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    return from <= to;
};
