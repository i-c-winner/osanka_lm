import axios from "axios";

const RAW_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

// Принудительно https:// — на случай если переменная была встроена с http://
const API_BASE_URL = RAW_URL.replace(/^http:\/\/(?!localhost)/, "https://");

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
      const hadToken = !!localStorage.getItem("access_token");
      localStorage.removeItem("access_token");
      sessionStorage.removeItem("user_profile");
      document.cookie = "access_token=; path=/; max-age=0; SameSite=Lax";
      if (hadToken) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
