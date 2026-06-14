// Axios instance — the single HTTP client for all API calls.
// All headers, base URL, and JWT token handling live here.
// Right now it is a skeleton. When the backend is ready,
// uncomment the interceptors and set EXPO_PUBLIC_API_URL in .env

import axios from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// TODO (backend): Uncomment when backend is ready.
// import { useAuthStore } from '../store/authStore';
//
// api.interceptors.request.use((config) => {
//   const token = useAuthStore.getState().accessToken;
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });
//
// api.interceptors.response.use(
//   (res) => res.data.data,  // unwrap { status, data, error } envelope
//   async (error) => {
//     if (error.response?.status === 401) {
//       // refresh token logic here
//     }
//     return Promise.reject(error);
//   }
// );
