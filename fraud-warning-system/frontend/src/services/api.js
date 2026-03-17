import axios from "axios";

// Base URL from env (Vercel) or fallback
const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? "https://fraudwatch-backend.onrender.com"
    : "http://localhost:4000");

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 8000,
});

// Attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("fw_admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("fw_admin_token");
      localStorage.removeItem("fw_admin_user");
      window.location.href = "/admin/login";
    }
    return Promise.reject(err);
  },
);

export default api;
