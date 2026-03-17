import axios from "axios";

const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5050/api";
const normalizedApiUrl = rawApiUrl.replace(/\/+$/, "");
const API_URL = normalizedApiUrl.endsWith("/api")
  ? normalizedApiUrl
  : `${normalizedApiUrl}/api`;

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
