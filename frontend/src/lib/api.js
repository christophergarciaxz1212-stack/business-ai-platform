import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response && err.response.status === 401 && !err.config._retry) {
      err.config._retry = true;
      try {
        const r = await axios.post((import.meta.env.VITE_API_URL || '/api') + '/auth/refresh', {}, { withCredentials: true });
        const newToken = r.data.accessToken;
        localStorage.setItem('accessToken', newToken);
        err.config.headers.Authorization = `Bearer ${newToken}`;
        return api(err.config);
      } catch (e) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;