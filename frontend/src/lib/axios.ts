import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const isServer = typeof window === 'undefined';

export const api = axios.create({
  baseURL: isServer ? 'http://backend:3000/api/v1' : '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      // Use pushState to avoid a hard HTTP GET navigation that bypasses Next.js routing
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.history.pushState({}, '', '/login');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    }
    return Promise.reject(error);
  }
);
