// Base API URL (pointing to local Django backend during development)
const API_BASE_URL = 'http://localhost:8000/api';

export const api = {
  // 1. LOGIN: Obtain DRF auth token
  login: async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.non_field_errors?.[0] || errorData.detail || 'Invalid username or password');
    }

    const data = await response.json();
    // Django DRF returns { "token": "..." }
    localStorage.setItem('access_token', data.token);
    localStorage.setItem('username', username);
    return data;
  },

  // 2. LOGOUT: Clear token from storage
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('username');
  },

  // 3. GET ACCESS TOKEN: Helper to fetch stored token
  getToken: () => localStorage.getItem('access_token'),

  // 4. AUTHENTICATED FETCH WRAPPER: Uses 'Token <token>' header
  fetchWithAuth: async (endpoint, options = {}) => {
    const token = api.getToken();

    if (!token || token === 'undefined') {
      throw new Error('No authentication token found. Please sign in.');
    }

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
      Authorization: `Token ${token}`, // Django DRF Token format
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle invalid/expired token
    if (response.status === 401) {
      api.logout();
      window.location.reload();
      throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || `API request failed with status ${response.status}`);
    }

    return response.status === 204 ? null : response.json();
  },
}