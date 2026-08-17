const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const getHeaders = (contentType = true) => {
  const token = localStorage.getItem('token');
  const headers = { 'Authorization': `Bearer ${token}` };
  if (contentType) headers['Content-Type'] = 'application/json';
  return headers;
};


const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) {
    logout();
    return null;
  }

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) {
      logout();
      return null;
    }

    const data = await res.json();
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    return data.access_token;
  } catch {
    logout();
    return null;
  }
};


const apiFetch = async (url, options = {}) => {
  let res = await fetch(url, options);

  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (!newToken) return res;

    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${newToken}`,
    };
    res = await fetch(url, options);
  }

  return res;
};

const logout = async () => {
  const refreshToken = localStorage.getItem('refresh_token');

  if (refreshToken) {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    } catch {}
  }

  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('company_name');
  localStorage.removeItem('selectedRole');
  window.location.href = '/login';
};

export { API_URL, getHeaders, apiFetch, refreshAccessToken, logout };
