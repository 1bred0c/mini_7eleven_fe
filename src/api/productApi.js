import axiosClient from "./axiosClient";

export const productApi = {
  getProducts: (params) => axiosClient.get("/products", { params }),
  getProductById: (id) => axiosClient.get(`/products/${id}`),
  createProduct: (data) => axiosClient.post("/products", data),
  updateProduct: (id, data) => axiosClient.put(`/products/${id}`, data),
  updateProductStatus: (id, status) => axiosClient.patch(`/products/${id}/status`, { status }),
  updateProductStock: (id, stockQuantity) => axiosClient.patch(`/products/${id}/stock`, { stockQuantity }),
  deleteProduct: (id) => axiosClient.delete(`/products/${id}`),
};
