import axios from "axios";
import { API_BASE_URL } from "@/shared/config";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      sessionStorage.removeItem("user_profile");
      document.cookie = "access_token=; path=/; max-age=0; SameSite=Lax";
      // Не редиректим если уже на странице логина — избегаем петли
      const onLoginPage = window.location.pathname.includes("/login");
      if (!onLoginPage) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
