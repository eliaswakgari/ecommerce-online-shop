import axios from "./axiosInstance.js";

export const placeOrderApi = (data) => axios.post("/api/orders", data);
export const getUserOrdersApi = () => axios.get("/api/orders/user");
export const adminGetOrdersApi = () => axios.get("/api/orders");
export const adminUpdateOrderStatusApi = (id, data) => axios.put(`/api/orders/${id}`, data);
