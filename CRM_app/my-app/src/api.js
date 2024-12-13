import axios from 'axios';

const API_URL = 'http://localhost:8000/';  // URL вашего Django API

export const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}auth/`, { username, password });
    return response.data;
  } catch (error) {
    console.error('Ошибка при запросе:', error);
    throw error;
  }
};