/**
 * src/services/api.js
 * Centralized Axios client for DigiVahivat Web
 */
import axios from 'axios';
import { API_BASE_URL } from '../constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: inject token
api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('@digivahivat_auth');
    if (raw) {
      const { token } = JSON.parse(raw);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (err) {
    console.error('Failed reading token from localStorage', err);
  }
  return config;
});

// Response interceptor: standardize error messages
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const message =
      err.response?.data?.message ||
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.errors?.[0]?.message ||
      err.message ||
      'An unexpected error occurred. Please try again.';

    const customError = new Error(message);
    customError.status = status;
    customError.response = err.response;

    if (status === 401) {
      // Optional: auto-logout on unauthorized
      if (!window.location.pathname.startsWith('/login')) {
        // localStorage.removeItem('@digivahivat_auth');
      }
    }

    return Promise.reject(customError);
  }
);

// ─── AUTHENTICATION ──────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  changePassword: (data) => api.post('/auth/change-password', data),
  seedAdmin: () => api.post('/auth/seed-admin'),
};

// ─── RESIDENTS ───────────────────────────────────────────────
export const residentsAPI = {
  getAll: (params) => api.get('/residents', { params }),
  getMyProfile: () => api.get('/residents/me'),
  add: (data) => api.post('/residents', data),
  update: (id, data) => api.patch(`/residents/${id}`, data),
  remove: (id) => api.delete(`/residents/${id}`),
};

// ─── EVENTS & FALO ───────────────────────────────────────────
export const eventsAPI = {
  getAll: () => api.get('/events'),
  create: (data) => api.post('/events', data),
  dashboard: (id) => api.get(`/events/${id}/dashboard`),
  update: (id, data) => api.patch(`/events/${id}`, data),
  remove: (id) => api.delete(`/events/${id}`),
  exportExcel: (id) =>
    api.get(`/events/${id}/export/excel`, { responseType: 'blob' }),
};

// ─── CONTRIBUTIONS & MAINTENANCE ─────────────────────────────
export const contributionsAPI = {
  record: (data) => api.post('/contributions', data),
  getAll: (params) => api.get('/contributions', { params }),
  getPdfReceipt: (id) =>
    api.get(`/contributions/${id}/pdf-receipt`, { responseType: 'blob' }),
  remove: (id) => api.delete(`/contributions/${id}`),
};

// ─── EXPENSES ────────────────────────────────────────────────
export const expensesAPI = {
  log: (formData) =>
    api.post('/expenses', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getAll: (params) => api.get('/expenses', { params }),
  updateStatus: (id, payload) => api.patch(`/expenses/${id}/status`, payload),
  update: (id, formData) =>
    api.patch(`/expenses/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  remove: (id) => api.delete(`/expenses/${id}`),
};

// ─── SOCIETIES (SuperAdmin) ──────────────────────────────────
export const societiesAPI = {
  getAll: () => api.get('/societies'),
  create: (data) => api.post('/societies', data),
  update: (id, data) => api.patch(`/societies/${id}`, data),
  remove: (id) => api.delete(`/societies/${id}`),
  getAdmins: (id) => api.get(`/societies/${id}/admins`),
};

// ─── NOTICES ─────────────────────────────────────────────────
export const noticesAPI = {
  getAll: (params) => api.get('/notices', { params }),
  getById: (id) => api.get(`/notices/${id}`),
  create: (data) => api.post('/notices', data),
  update: (id, data) => api.patch(`/notices/${id}`, data),
  remove: (id) => api.delete(`/notices/${id}`),
};

// ─── COMPLAINTS & HELPDESK ───────────────────────────────────
export const complaintsAPI = {
  getAll: (params) => api.get('/complaints', { params }),
  getById: (id) => api.get(`/complaints/${id}`),
  create: (data) => api.post('/complaints', data),
  updateStatus: (id, payload) => api.patch(`/complaints/${id}/status`, payload),
  remove: (id) => api.delete(`/complaints/${id}`),
};

// ─── VISITOR MANAGEMENT SYSTEM (VMS) ─────────────────────────
export const visitorsAPI = {
  preApprove: (data) => api.post('/visitors/pre-approve', data),
  verify: (data) => api.post('/visitors/verify', data),
  checkin: (data) => api.post('/visitors/checkin', data),
  checkout: (id) => api.post(`/visitors/${id}/checkout`),
  getSocietyRegister: (params) =>
    api.get('/visitors/society-register', { params }),
  getMyVisitors: () => api.get('/visitors/my-visitors'),
  cancel: (id) => api.patch(`/visitors/${id}/cancel`),
  getPublicPass: (id) => api.get(`/visitors/pass/${id}`),
  getGatePassQrImage: (id) => `${API_BASE_URL}/visitors/pass/${id}/qr`,
};

// ─── EMERGENCY SOS ───────────────────────────────────────────
export const sosAPI = {
  trigger: (data) => api.post('/sos', data),
  getActive: () => api.get('/sos/active'),
  getHistory: () => api.get('/sos/history'),
  acknowledge: (id) => api.put(`/sos/${id}/acknowledge`),
  resolve: (id, payload) => api.put(`/sos/${id}/resolve`, payload),
  cancel: (id, payload) => api.put(`/sos/${id}/cancel`, payload),
  testNotification: () => api.post('/sos/test-notification'),
};

// ─── LEGAL ───────────────────────────────────────────────────
export const legalAPI = {
  getPrivacyPolicy: () => api.get('/legal/privacy-policy'),
  getSupportPage: () => api.get('/legal/support'),
  getTermsPage: () => api.get('/legal/terms'),
};

export default api;
