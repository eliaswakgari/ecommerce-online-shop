import axios from "./axiosInstance.js";

/**
 * Helpers for admin product create/update; accepts either:
 *  - a FormData instance (already-built), or
 *  - a plain object { name, price, category, stock, description, images }
 *
 * When given a plain object we build a FormData and append files (images) if provided.
 */

function buildFormDataIfNeeded(data) {
  // If caller already passed a FormData, return it as-is
  if (data instanceof FormData) return data;

  const formData = new FormData();
  if (data.name !== undefined) formData.append("name", data.name);
  if (data.price !== undefined) formData.append("price", String(data.price));
  if (data.category !== undefined) formData.append("category", data.category);
  if (data.stock !== undefined) formData.append("stock", String(data.stock));
  if (data.description !== undefined) formData.append("description", data.description);

  // Support images as either File objects array or single file field `images` or `image`
  if (data.images && Array.isArray(data.images)) {
    data.images.forEach((file) => formData.append("images", file));
  } else if (data.image) {
    // legacy single image field
    formData.append("images", data.image);
  }

  return formData;
}

export const getProductsApi = (params) => axios.get("/api/products", { params });
export const getProductByIdApi = (id) => axios.get(`/api/products/${id}`);
export const getCategoriesApi = () => axios.get("/api/products/categories");

export const adminCreateProductApi = (data) => {
  // data may be FormData or plain object
  const maybeForm = buildFormDataIfNeeded(data);

  return axios.post("/api/products", maybeForm, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const adminUpdateProductApi = (id, data) => {
  const maybeForm = buildFormDataIfNeeded(data);

  return axios.put(`/api/products/${id}`, maybeForm, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const adminDeleteProductApi = (id) => axios.delete(`/api/products/${id}`);