// src/api/axiosInstance.js
import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000', // adjust
  withCredentials: true, // This enables cookie-based authentication
});

instance.interceptors.request.use((config) => {
  console.debug('[axios] Request:', config.method?.toUpperCase(), config.baseURL + config.url);
  return config;
});

instance.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('[axios] Response error:', err?.response?.status, err?.config?.url, err?.response?.data);
    
    // Handle 401 unauthorized errors
    if (err?.response?.status === 401) {
      // For cookie-based auth, just redirect to login
      // The cookies will be cleared automatically by the browser
      console.warn('Authentication failed, redirecting to login');
      // Don't auto-redirect, let the app handle it
    }
    
    return Promise.reject(err);
  }
);

export default instance;