import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 8000,
});

// Attach JWT from AuthContext storage key
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("fw_admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
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
