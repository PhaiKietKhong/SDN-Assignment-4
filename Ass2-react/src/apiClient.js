import axios from "axios";

const defaultProdApiBaseUrl = "https://sdn-assignment-4-won0.onrender.com";

const apiBaseUrl = import.meta.env.DEV
  ? "/api"
  : import.meta.env.VITE_API_BASE_URL || defaultProdApiBaseUrl;

if (import.meta.env.PROD && !apiBaseUrl) {
  console.error(
    "Missing VITE_API_BASE_URL. Set it in Vercel to your backend origin.",
  );
}

const apiClient = axios.create({
  baseURL: apiBaseUrl,
});

export default apiClient;
