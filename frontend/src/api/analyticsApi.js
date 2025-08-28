import axios from "./axiosInstance.js";

export const getSalesApi = () => axios.get("/api/analytics/sales");
export const getTopProductsApi = () => axios.get("/api/analytics/top-products");
export const getOrdersByDateApi = () => axios.get("/api/analytics/orders-by-date");

// Detailed analytics APIs
export const getDetailedProductsApi = (period = 'all') => 
  axios.get(`/api/analytics/products/detailed?period=${period}`);

export const getDetailedOrdersApi = (period = 'all') => 
  axios.get(`/api/analytics/orders/detailed?period=${period}`);

export const getDetailedSalesApi = (period = 'all') => 
  axios.get(`/api/analytics/sales/detailed?period=${period}`);
