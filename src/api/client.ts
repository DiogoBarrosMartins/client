/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export const API_BASE = import.meta.env.VITE_API_URL
const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
