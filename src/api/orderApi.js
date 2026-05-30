import axiosClient from "./axiosClient";

export const orderApi = {
  createOrder: (data) => axiosClient.post("/orders", data),
  getMyOrders: (params) => axiosClient.get("/orders/my", { params }),
  getMyOrderById: (id) => axiosClient.get(`/orders/my/${id}`),
  cancelMyOrder: (id) => axiosClient.patch(`/orders/my/${id}/cancel`),
  getAdminOrders: (params) => axiosClient.get("/orders", { params }),
  getAdminOrderById: (id) => axiosClient.get(`/orders/${id}`),
  updateOrderStatus: (id, status) => axiosClient.patch(`/orders/${id}/status`, { status }),
  updateOrderPaymentStatus: (id, paymentStatus) => axiosClient.patch(`/orders/${id}/payment-status`, { paymentStatus }),
};
