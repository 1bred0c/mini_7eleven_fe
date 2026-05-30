import axios from "axios";
import { getAccessToken, clearAuth } from "../utils/auth";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  (response) => {
    // If response contains data directly, return it.
    return response.data;
  },
  (error) => {
    const originalRequest = error.config;

    // Normalize error object structure
    const normalizedError = {
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message || "An unexpected error occurred",
      code: error.response?.data?.code || "INTERNAL_SERVER_ERROR",
      errors: error.response?.data?.errors || null,
      data: error.response?.data?.data || null,
    };

    // If 401 occurs and user was logged in, clear session and redirect
    if (normalizedError.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const hasToken = !!getAccessToken();
      if (hasToken) {
        clearAuth();
        const currentPath = window.location.pathname;
        if (currentPath !== "/login" && currentPath !== "/register") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(normalizedError);
  }
);

export default axiosClient;
