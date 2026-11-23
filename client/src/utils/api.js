const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

// Helper to get token
export const getAdminToken = () => localStorage.getItem('ssf_admin_token');
export const setAdminToken = (token) => localStorage.setItem('ssf_admin_token', token);
export const clearAdminToken = () => localStorage.removeItem('ssf_admin_token');

// Resolve static upload URLs
export const resolveImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api$/, '');
  return `${base}${path.startsWith('/') ? path : '/' + path}`;
};

// Generic Fetch wrapper with JSON parsing and auth headers
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = { ...options.headers };

  const token = getAdminToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

// ================= API ENDPOINTS =================

// Settings
export const apiGetSettings = () => request('/settings');
export const apiUpdateSettings = (body) =>
  request('/settings', { method: 'PUT', body: JSON.stringify(body) });
export const apiUploadLogo = (file) => {
  const formData = new FormData();
  formData.append('logo', file);
  return request('/settings/upload-logo', { method: 'POST', body: formData });
};
export const apiUploadPoster = (file) => {
  const formData = new FormData();
  formData.append('poster', file);
  return request('/settings/upload-poster', { method: 'POST', body: formData });
};

// Units
export const apiGetUnits = () => request('/units');
export const apiAddUnit = (body) =>
  request('/units', { method: 'POST', body: JSON.stringify(body) });
export const apiUpdateUnit = (id, body) =>
  request(`/units/${id}`, { method: 'PUT', body: JSON.stringify(body) });
export const apiDeleteUnit = (id) => request(`/units/${id}`, { method: 'DELETE' });

// Candidates & Check-In
export const apiRegisterCandidate = (body) =>
  request('/candidates/register', { method: 'POST', body: JSON.stringify(body) });
export const apiGetCandidateByTicket = (ticketId) =>
  request(`/candidates/ticket/${encodeURIComponent(ticketId)}`);
export const apiGetAllCandidates = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/candidates${query ? `?${query}` : ''}`);
};
export const apiCheckInCandidate = (ticketId) =>
  request('/candidates/check-in', {
    method: 'POST',
    body: JSON.stringify({ ticketId }),
  });
export const apiToggleCandidateAttendance = (id) =>
  request(`/candidates/${id}/toggle-attendance`, { method: 'PATCH' });
export const apiGetAttendanceStats = () => request('/candidates/attendance-stats');

// Admin Auth
export const apiVerifyPin = (pin) =>
  request('/auth/verify-pin', { method: 'POST', body: JSON.stringify({ pin }) });
export const apiVerifySession = () => request('/auth/verify-session');
export const apiChangePin = (currentPin, newPin) =>
  request('/auth/change-pin', {
    method: 'POST',
    body: JSON.stringify({ currentPin, newPin }),
  });
