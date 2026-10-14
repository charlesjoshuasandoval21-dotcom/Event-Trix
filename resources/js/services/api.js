import axios from 'axios';

const API_ORIGIN = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const api = axios.create({
  baseURL: `${API_ORIGIN}/api`,
  withCredentials: true,
  withXSRFToken: true,
  headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
});

export const initCsrf = () => axios.get(`${API_ORIGIN}/sanctum/csrf-cookie`, { withCredentials: true });

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error;

    if (response?.status === 419 && config && !config._retried) {
      config._retried = true;
      await initCsrf();
      return api(config);
    }

    const isAuthProbe = config?.url?.endsWith('/user') || config?.url?.endsWith('/login');
    if (response?.status === 401 && !isAuthProbe) {
      window.dispatchEvent(new Event('auth:expired'));
    }

    return Promise.reject(error);
  }
);

export default api;
