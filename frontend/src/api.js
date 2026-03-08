// Use VITE_API_URL in production (e.g. https://your-backend.onrender.com), /api when proxied locally
const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

function getHeaders() {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || res.statusText || 'Request failed');
  return data;
}

export const authApi = {
  register: (body) =>
    fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse),
  login: (body) =>
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse),
  me: () =>
    fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    }).then(handleResponse),
};

export const leaveApi = {
  list: () =>
    fetch(`${API_BASE}/leave`, { headers: getHeaders() }).then(handleResponse),
  create: (body) =>
    fetch(`${API_BASE}/leave`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse),
  approve: (id) =>
    fetch(`${API_BASE}/leave/${id}/approve`, {
      method: 'PATCH',
      headers: getHeaders(),
    }).then(handleResponse),
  reject: (id) =>
    fetch(`${API_BASE}/leave/${id}/reject`, {
      method: 'PATCH',
      headers: getHeaders(),
    }).then(handleResponse),
};
