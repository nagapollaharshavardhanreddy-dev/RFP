// src/services/api.js
// Central Axios instance — all backend calls go through here

const BASE_URL = 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('hypotech_token');

const request = async (method, endpoint, body = null) => {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const config = { method, headers };
  if (body) config.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

// ── Auth ──────────────────────────────────────────────────
export const authAPI = {
  register: (body) => request('POST', '/auth/register', body),
  login: (body) => request('POST', '/auth/login', body),
  getProfile: () => request('GET', '/auth/profile'),
  updateProfile: (body) => request('PUT', '/auth/profile', body),
};

// ── Schedule ──────────────────────────────────────────────
export const scheduleAPI = {
  get: () => request('GET', '/schedule'),
  update: (body) => request('PUT', '/schedule', body),
};

// ── Apps ──────────────────────────────────────────────────
export const appsAPI = {
  getAll: () => request('GET', '/apps'),
  toggle: (id) => request('PUT', `/apps/${id}/toggle`),
  blockAll: () => request('PUT', '/apps/block-all'),
  unblockAll: () => request('PUT', '/apps/unblock-all'),
  logBlockEvent: (app_id) => request('POST', '/apps/block-event', { app_id }),
  getBlockEvents: () => request('GET', '/apps/block-events'),
};

// ── Reports ───────────────────────────────────────────────
export const reportsAPI = {
  weekly: () => request('GET', '/reports/weekly'),
  dashboard: () => request('GET', '/reports/dashboard'),
  logSleep: (body) => request('POST', '/reports/log', body),
};

// ── Settings ──────────────────────────────────────────────
export const settingsAPI = {
  get: () => request('GET', '/settings'),
  update: (body) => request('PUT', '/settings', body),
  logOverride: (body) => request('POST', '/settings/emergency-override', body),
  deleteData: () => request('DELETE', '/settings/data'),
};
