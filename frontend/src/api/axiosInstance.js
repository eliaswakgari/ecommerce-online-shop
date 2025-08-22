// src/api/axiosInstance.js
import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000', // adjust
  withCredentials: true, // if backend uses cookie auth
});

instance.interceptors.request.use((config) => {
  console.debug('[axios] Request:', config.method?.toUpperCase(), config.baseURL + config.url, config.headers);
  return config;
});

instance.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('[axios] Response error:', err?.response?.status, err?.config?.url, err?.response?.data);
    return Promise.reject(err);
  }
);

export default instance;