import axios from "./axiosInstance.js";

export const getSalesApi = () => axios.get("/api/analytics/sales");
export const getTopProductsApi = () => axios.get("/api/analytics/top-products");
export const getOrdersByDateApi = () => axios.get("/api/analytics/orders-by-date");
