import axiosClient from "./axiosClient";

export const authApi = {
  register: (data) => axiosClient.post("/auth/register", data),
  login: (data) => axiosClient.post("/auth/login", data),
  refresh: (data) => axiosClient.post("/auth/refresh", data),
  logout: (refreshToken) => axiosClient.post("/auth/logout", { refreshToken }),
  me: () => axiosClient.get("/auth/me"),
};