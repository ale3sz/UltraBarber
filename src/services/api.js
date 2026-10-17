const API_BASE = '/api';

const CLIENT_TOKEN_KEY = 'barberfade_client_token';
const ADMIN_TOKEN_KEY = 'barberfade_admin_token';

export function getClientToken() {
  return localStorage.getItem(CLIENT_TOKEN_KEY);
}

export function setClientToken(token) {
  if (token) localStorage.setItem(CLIENT_TOKEN_KEY, token);
  else localStorage.removeItem(CLIENT_TOKEN_KEY);
}

export function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token) {
  if (token) localStorage.setItem(ADMIN_TOKEN_KEY, token);
  else localStorage.removeItem(ADMIN_TOKEN_KEY);
}

async function request(path, options = {}, authType = null) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (authType === 'client') {
    const token = getClientToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  } else if (authType === 'admin') {
    const token = getAdminToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'Error en la comunicación con el servidor');
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  // Public Bootstrap
  getBootstrap: () => request('/public/bootstrap'),
  getServices: () => request('/services'),
  getBusySlots: (date) => request(`/appointments/busy-slots?date=${encodeURIComponent(date)}`),

  // Client Auth & Profile (DNI + PIN)
  checkDni: (dni) => request(`/clients/check/${encodeURIComponent(dni)}`),
  loginClient: async (dni, pin) => {
    const data = await request('/clients/login', {
      method: 'POST',
      body: JSON.stringify({ dni, pin })
    });
    if (data.token) setClientToken(data.token);
    return data;
  },
  registerClient: async (payload) => {
    const data = await request('/clients/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (data.token) setClientToken(data.token);
    return data;
  },
  setupClientPin: async (payload) => {
    const data = await request('/clients/setup-pin', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (data.token) setClientToken(data.token);
    return data;
  },
  getClientMe: () => request('/clients/me', {}, 'client'),
  updateClientMe: (payload) => request('/clients/me', {
    method: 'PUT',
    body: JSON.stringify(payload)
  }, 'client'),
  getRecoveryLink: (dni) => request('/clients/recovery-link', {
    method: 'POST',
    body: JSON.stringify({ dni })
  }),
  logoutClient: () => setClientToken(null),

  // Client Bookings
  requestAppointment: (bookingData) => request('/appointments/request', {
    method: 'POST',
    body: JSON.stringify(bookingData)
  }, 'client'),
  getAppointmentStatus: (idOrCode) => request(`/appointments/${encodeURIComponent(idOrCode)}`),
  cancelMyAppointment: (id) => request(`/appointments/${encodeURIComponent(id)}/client-cancel`, {
    method: 'POST'
  }, 'client'),

  // David Admin Auth & Protected Endpoints
  loginAdmin: async (username, password) => {
    const data = await request('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    if (data.token) setAdminToken(data.token);
    return data;
  },
  getAdminMe: () => request('/admin/me', {}, 'admin'),
  logoutAdmin: () => setAdminToken(null),
  updateAdminCredentials: (payload) => request('/admin/credentials', {
    method: 'PUT',
    body: JSON.stringify(payload)
  }, 'admin'),
  getAdminDashboard: () => request('/admin/dashboard', {}, 'admin'),
  confirmAppointment: (id) => request(`/admin/appointments/${encodeURIComponent(id)}/confirm`, {
    method: 'POST'
  }, 'admin'),
  completeAppointment: (id, paymentData) => request(`/admin/appointments/${encodeURIComponent(id)}/complete`, {
    method: 'POST',
    body: JSON.stringify(paymentData)
  }, 'admin'),
  noShowAppointment: (id) => request(`/admin/appointments/${encodeURIComponent(id)}/no-show`, {
    method: 'POST'
  }, 'admin'),
  cancelAppointment: (id) => request(`/admin/appointments/${encodeURIComponent(id)}/cancel`, {
    method: 'POST'
  }, 'admin'),
  createManualAppointment: (payload) => request('/admin/appointments/manual', {
    method: 'POST',
    body: JSON.stringify(payload)
  }, 'admin'),
  addBlockedSlot: (payload) => request('/admin/blocked-slots', {
    method: 'POST',
    body: JSON.stringify(payload)
  }, 'admin'),
  removeBlockedSlot: (id) => request(`/admin/blocked-slots/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  }, 'admin'),
  updateClientByAdmin: (dni, payload) => request(`/admin/clients/${encodeURIComponent(dni)}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  }, 'admin'),
  updateServiceByAdmin: (id, payload) => request(`/admin/services/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  }, 'admin'),
  updateConfigByAdmin: (payload) => request('/admin/config', {
    method: 'PUT',
    body: JSON.stringify(payload)
  }, 'admin')
};
