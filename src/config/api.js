export const API_URL = import.meta.env.PROD
  ? "https://roundtable-backend.onrender.com"
  : "http://localhost:3000";

export const getApiUrl = (endpoint) => `${API_URL}${endpoint}`;
