import axios from "./axiosInstance.js";

export const getProductsApi = (params) => axios.get("/api/products", { params });
export const getProductByIdApi = (id) => axios.get(`/api/products/${id}`);
export const getCategoriesApi = () => axios.get("/api/products/categories");

export const adminCreateProductApi = (data) => {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('price', data.price);
  formData.append('category', data.category);
  formData.append('stock', data.stock);
  formData.append('description', data.description);
  
  // Handle image upload - backend expects 'images' field
  if (data.image) {
    formData.append('images', data.image);
  }
  
  return axios.post("/api/products", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const adminUpdateProductApi = (id, data) => {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('price', data.price);
  formData.append('category', data.category);
  formData.append('stock', data.stock);
  formData.append('description', data.description);
  
  // Handle image upload - backend expects 'images' field
  if (data.image) {
    formData.append('images', data.image);
  }
  
  return axios.put(`/api/products/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const adminDeleteProductApi = (id) => axios.delete(`/api/products/${id}`);
