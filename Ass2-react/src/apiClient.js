import axios from "axios";

const apiClient = axios.create({
  // In dev, default to Vite proxy (/api). In production, set VITE_API_BASE_URL.
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
});

export default apiClient;
