import api from './axios';

export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', {
      tenDangNhap: credentials.username,
      matKhau: credentials.password
    });
    return response.data;
  },

  register: async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  updateAccountWithCCCD: async (tenDangNhap, cccd) => {
    const response = await api.post(`/auth/update-cccd?tenDangNhap=${tenDangNhap}&cccd=${cccd}`);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  getAdmins: async () => {
    const response = await api.get('/auth/admins');
    return response.data;
  },
};

export const suKienAPI = {
  getAll: async () => {
    const response = await api.get('/events');
    return response.data;
  },

  getUpcoming: async () => {
    const response = await api.get('/events/upcoming');
    return response.data;
  },

  getJoined: async () => {
    const response = await api.get('/events/joined');
    return response.data;
  },

  getNotJoined: async () => {
    const response = await api.get('/events/not-joined');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/events', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/events/${id}`, data);
    return response.data;
  },

  approve: async (id) => {
    const response = await api.patch(`/events/${id}/approve`);
    return response.data;
  },

  reject: async (id) => {
    const response = await api.patch(`/events/${id}/reject`);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },
};

export const dangKySuKienAPI = {
  register: async (eventId) => {
    const response = await api.post(`/registrations/register/${eventId}`);
    return response.data;
  },

  cancel: async (registrationId) => {
    const response = await api.delete(`/registrations/${registrationId}/cancel`);
    return response.data;
  },

  getMyRegistrations: async () => {
    const response = await api.get('/registrations/my-registrations');
    return response.data;
  },

  getEventRegistrations: async (eventId) => {
    const response = await api.get(`/registrations/event/${eventId}`);
    return response.data;
  },

  adminRegisterUser: async (data) => {
    const response = await api.post('/registrations/admin/register', data);
    return response.data;
  },
};

export const thongBaoAPI = {
  create: async (data) => {
    const response = await api.post('/notifications', data);
    return response.data;
  },

  getMyNotifications: async () => {
    const response = await api.get('/notifications/my-notifications');
    return response.data;
  },

  getSentNotifications: async () => {
    const response = await api.get('/notifications/sent');
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },
};

export const nguoiDanAPI = {
  getAll: async () => {
    const response = await api.get('/nguoi-dan');
    return response.data;
  },

  getById: async (cccd) => {
    const response = await api.get(`/nguoi-dan/${cccd}`);
    return response.data;
  },

  getByGiaDinh: async (maGiaDinh) => {
    const response = await api.get(`/nguoi-dan/gia-dinh/${maGiaDinh}`);
    return response.data;
  },

  search: async (keyword) => {
    const response = await api.get(`/nguoi-dan/search?keyword=${keyword}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/nguoi-dan', data);
    return response.data;
  },

  update: async (cccd, data) => {
    const response = await api.put(`/nguoi-dan/${cccd}`, data);
    return response.data;
  },

  delete: async (cccd) => {
    const response = await api.delete(`/nguoi-dan/${cccd}`);
    return response.data;
  },
};

export const giaDinhAPI = {
  getAll: async () => {
    const response = await api.get('/gia-dinh');
    return response.data;
  },

  getById: async (maGiaDinh) => {
    const response = await api.get(`/gia-dinh/${maGiaDinh}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/gia-dinh', data);
    return response.data;
  },

  update: async (maGiaDinh, data) => {
    const response = await api.put(`/gia-dinh/${maGiaDinh}`, data);
    return response.data;
  },

  delete: async (maGiaDinh) => {
    const response = await api.delete(`/gia-dinh/${maGiaDinh}`);
    return response.data;
  },
};

export const taiLieuAPI = {
  delete: async (id) => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  },
};
