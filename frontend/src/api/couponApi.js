import axios from "./axiosInstance.js";

export const adminCreateCouponApi = (data) => axios.post("/api/coupons", data);
export const validateCouponApi = (code) => axios.get(`/api/coupons/${code}`);
