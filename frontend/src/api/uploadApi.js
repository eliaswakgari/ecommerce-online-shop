import axios from "./axiosInstance.js";

// Convert File -> base64 data URL
export const fileToDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

export const uploadImageApi = async (imageBase64) => {
  console.log("Upload API called with base64:", typeof imageBase64 === 'string');

  try {
    const response = await axios.post("/api/upload/image", { imageBase64 }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
    });
    console.log("Upload API response:", response.data);
    return response;
  } catch (error) {
    console.error("Upload API error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: error.config
    });
    throw error;
  }
};

export const deleteImageApi = async (publicId) => {
  console.log("Delete API called with publicId:", publicId);
  try {
    const response = await axios.delete(`/api/upload/image/${publicId}`);
    console.log("Delete API response:", response.data);
    return response;
  } catch (error) {
    console.error("Delete API error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
};
