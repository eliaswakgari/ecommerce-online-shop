import axios from "axios";
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000", // <-- important
  withCredentials: true,
  // Remove default Content-Type to allow multipart/form-data for file uploads
});

// Basic interceptor to bubble up errors
axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // optionally redirect to login or dispatch logout
    }
    return Promise.reject(err);
  }
);

export default axiosInstance;
