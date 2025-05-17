export const API_URL = import.meta.env.PROD
  ? "https://roundtable-backend.onrender.com"
  : "";

export const getApiUrl = (endpoint) => `${API_URL}${endpoint}`;
