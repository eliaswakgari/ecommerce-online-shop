import axios from "./axiosInstance.js";

export const getCartApi = () => axios.get("/api/cart");
export const addToCartApi = (data) => axios.post("/api/cart", data);
export const updateCartItemApi = (id, data) => axios.put(`/api/cart/${id}`, data);
export const removeCartItemApi = (id) => axios.delete(`/api/cart/${id}`);
export const clearCartApi = () => axios.delete("/api/cart");
