import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_REACT_API_BASE_URL,
});

export default api;
