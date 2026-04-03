import axios from "axios";

// Primary Backend API
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
});

// ML OCR Service API
export const mlApi = axios.create({
  baseURL: import.meta.env.VITE_ML_API_BASE_URL || "http://localhost:8000"
});

const setupInterceptors = (instance) => {
  instance.interceptors.request.use(config => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
};

setupInterceptors(api);
setupInterceptors(mlApi);

export default api;