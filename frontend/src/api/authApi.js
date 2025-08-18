import axios from "./axiosInstance.js";

export const registerApi = (payload) => axios.post("/api/auth/register", payload);
export const loginApi = (payload) => axios.post("/api/auth/login", payload);
export const logoutApi = () => axios.post("/api/auth/logout");
export const getProfileApi = () => axios.get("/api/auth/profile");
export const updateProfileApi = (payload) => axios.put("/api/auth/profile", payload);
export const changePasswordApi = (payload) => axios.put("/api/auth/change-password", payload);
export const forgotPasswordApi = (payload) => axios.post("/api/auth/forgot-password", payload);
export const resetPasswordApi = (resetToken, payload) => axios.put(`/api/auth/reset-password/${resetToken}`, payload);
