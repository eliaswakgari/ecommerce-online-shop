import axios from "./axiosInstance.js";

// Create or update a product review
export const createReviewApi = (data) => axios.post("/api/reviews", data);

// Get reviews for a specific product
export const getProductReviewsApi = (productId, page = 1, limit = 10) => 
  axios.get(`/api/reviews/product/${productId}?page=${page}&limit=${limit}`);

// Get current user's reviews
export const getUserReviewsApi = () => axios.get("/api/reviews/user");

// Mark a review as helpful/unhelpful
export const updateReviewHelpfulApi = (reviewId, helpful) => 
  axios.put(`/api/reviews/${reviewId}/helpful`, { helpful });

// Delete a review
export const deleteReviewApi = (reviewId) => axios.delete(`/api/reviews/${reviewId}`);
