function CheckData(beforeCheck, afterCheck) {
    const updatedData = {};

    for (const key in afterCheck) {
        // Сравниваем значения, исключая поле 'id'
        if (key !== 'id' && beforeCheck[key] !== afterCheck[key]) {
            updatedData[key] = afterCheck[key];
        }
    }

    return updatedData;
}

export default CheckData;
