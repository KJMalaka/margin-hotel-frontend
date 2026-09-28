import axios from 'axios';

// Base URL comes from .env.local (see project root) so it's easy to
// repoint for deployment without touching code.
// Default fallback in case the .env/.env.local file is missing or misconfigured.
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/marginhotel',
  headers: {
    'Content-Type': 'application/json',
  },
});