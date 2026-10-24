import axios from 'axios';

// Base backend URL with trailing slashes stripped
export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string)?.replace(/\/+$/, '') || 'http://localhost:5000';

// API root endpoint (/api)
export const API_URL: string = `${API_BASE_URL}/api`;

// Shared Axios client instance
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: Automatically attach token if available and not already explicitly set
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
