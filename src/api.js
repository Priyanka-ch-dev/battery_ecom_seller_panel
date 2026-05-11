import axios from 'axios';

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:8000/api/'
  : 'https://batteriesbazaar.com/api/';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('seller_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('seller_refresh_token');

      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}users/token/refresh/`, {
            refresh: refreshToken
          });
          localStorage.setItem('seller_token', res.data.access);
          api.defaults.headers.common['Authorization'] = `Bearer ${res.data.access}`;
          originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('seller_token');
          localStorage.removeItem('seller_refresh_token');
          localStorage.removeItem('seller_user');
          window.location.href = '/login';
        }
      } else {
        localStorage.removeItem('seller_token');
        localStorage.removeItem('seller_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
