/** @format */

import axios from "axios";

const API_BASE = window.location.href.includes("localhost")
  ? "http://localhost:5500"
  : import.meta.env.VITE_API_URL || "https://api.mattybokks.com";

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAdminRoute = window.location.pathname.startsWith("/admin");
      if (isAdminRoute && window.location.pathname !== "/admin/login") {
        localStorage.removeItem("admin_token");
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;

// Auth
export const authAPI = {
  login: (data) => api.post("/auth/login", data),
  me: () => api.get("/auth/me"),
  changePassword: (data) => api.put("/auth/change-password", data),
  updateProfile: (data) => api.put("/auth/update-profile", data),
};

// Books
export const booksAPI = {
  getAll: (params) => api.get("/books", { params }),
  getById: (id) => api.get(`/books/${id}`),
  getGenres: () => api.get("/books/genres"),

  // Admin
  adminGetAll: (params) => api.get("/books/admin/all", { params }),
  adminGetById: (id) => api.get(`/books/admin/${id}`),
  adminCreate: (formData) =>
    api.post("/books/admin", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  adminUpdate: (id, formData) =>
    api.put(`/books/admin/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  adminDelete: (id) => api.delete(`/books/admin/${id}`),
};

// Payments
export const paymentsAPI = {
  initialize: (data) => api.post("/payments/initialize", data),
  verify: (reference) => api.get(`/payments/verify/${reference}`),
  getTransactions: (params) =>
    api.get("/payments/admin/transactions", { params }),
};

// Analytics
export const analyticsAPI = {
  getDashboard: () => api.get("/analytics/dashboard"),
  getSalesChart: (period) =>
    api.get("/analytics/sales-chart", { params: { period } }),
};

// Downloads
export const downloadURL = (token) => `${API_BASE}/api/downloads/${token}`;
export const freeDownloadURL = (bookId) =>
  `${API_BASE}/api/downloads/free/${bookId}`;

// Resolve a relative upload path to a full URL, e.g. /uploads/covers/foo.png
export const assetURL = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path}`;
};
