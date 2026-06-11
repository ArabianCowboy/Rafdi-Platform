const API_URL = import.meta.env.VITE_API_URL || 'https://api.rafdi.com';

const getHeaders = (contentType = true) => {
  const token = localStorage.getItem('token');
  const headers = { 'Authorization': `Bearer ${token}` };
  if (contentType) headers['Content-Type'] = 'application/json';
  return headers;
};

export { API_URL, getHeaders };