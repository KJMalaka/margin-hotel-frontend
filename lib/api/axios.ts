import axios from 'axios';
import { getToken, clearSession } from '@/lib/auth/session';

// Base URL comes from .env.local (see project root) so it's easy to
// repoint for deployment without touching code.
// Default fallback in case the .env/.env.local file is missing or misconfigured.
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/marginhotel',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Login/register are public, so never attach a token to them.
const isAuthCall = (url?: string) => url?.startsWith('/auth/') ?? false;

// Attach the JWT to every outgoing request (except /auth/*).
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token && !isAuthCall(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 on a protected route = expired/invalid token, so drop the stored session.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isAuthCall(error.config?.url)) {
      clearSession();
    }
    return Promise.reject(error);
  }
);