import { useAuthStore } from "@/stores/auth-store";
import axios from "axios";

const baseURL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().auth.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});
