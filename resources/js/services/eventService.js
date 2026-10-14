import api from './api';

const clean = (params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined));

export const eventService = {
  list: (params) => api.get('/events', { params: clean(params) }).then((r) => r.data),
  get: (id) => api.get(`/events/${id}`).then((r) => r.data.data),
  categories: () => api.get('/event-categories').then((r) => r.data.data),
};

export const registrationService = {
  mine: (params) => api.get('/my-registrations', { params: clean(params) }).then((r) => r.data),
  register: (eventId) => api.post(`/events/${eventId}/registrations`).then((r) => r.data.data),
  cancel: (registrationId) => api.delete(`/registrations/${registrationId}`).then((r) => r.data.data),
  dashboard: () => api.get('/student/dashboard').then((r) => r.data),
};

export const organizerService = {
  dashboard: () => api.get('/organizer/dashboard').then((r) => r.data),
  events: (params) => api.get('/organizer/events', { params: clean(params) }).then((r) => r.data),
  event: (id) => api.get(`/organizer/events/${id}`).then((r) => r.data.data),
  create: (payload) => api.post('/organizer/events', payload).then((r) => r.data.data),
  update: (id, payload) => api.put(`/organizer/events/${id}`, payload).then((r) => r.data.data),
  setStatus: (id, status) => api.patch(`/organizer/events/${id}/status`, { status }).then((r) => r.data.data),
  remove: (id) => api.delete(`/organizer/events/${id}`).then((r) => r.data),
  registrations: (params) => api.get('/organizer/registrations', { params: clean(params) }).then((r) => r.data),
};

export const settingsService = {
  update: (role, payload) => api.put(`/${role}/settings`, payload).then((r) => r.data.data),
  updatePassword: (role, payload) => api.put(`/${role}/settings/password`, payload).then((r) => r.data),
};
