import api, { initCsrf } from './api';

export const authService = {
  async me() {
    const { data } = await api.get('/user');
    return data.data;
  },
  async login(credentials) {
    await initCsrf();
    const { data } = await api.post('/login', credentials);
    return data.data;
  },
  async register(payload) {
    await initCsrf();
    const { data } = await api.post('/register', payload);
    return data.data;
  },
  async logout() {
    await api.post('/logout');
  },
};
