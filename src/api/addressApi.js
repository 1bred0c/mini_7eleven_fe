import axiosClient from "./axiosClient";

export const addressApi = {
  getAddresses: (params) => axiosClient.get("/addresses", { params }),
  getAddressById: (id) => axiosClient.get(`/addresses/${id}`),
  createAddress: (data) => axiosClient.post("/addresses", data),
  updateAddress: (id, data) => axiosClient.put(`/addresses/${id}`, data),
  setDefaultAddress: (id) => axiosClient.patch(`/addresses/${id}/default`),
  deleteAddress: (id) => axiosClient.delete(`/addresses/${id}`),
};
