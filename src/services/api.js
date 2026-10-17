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

// ----------------------------------------------------
// Static Demo Mock Data for GitHub Pages / Static Host
// ----------------------------------------------------
const MOCK_CONFIG = {
  barberName: 'David',
  businessName: 'DAVID BARBER STUDIO',
  whatsappPhone: '5493413762115',
  holdDurationMinutes: 15,
  pointsForFreeCut: 10,
  address: 'Av. Santa Fe 3240 • Studio Privado',
  instagram: '@davidbarber.studio',
  workHours: {
    start: '09:00',
    end: '20:00',
    slotDuration: 45
  },
  workingDays: [1, 2, 3, 4, 5, 6],
  disabledSlots: [],
  drinks: ['Agua mineral', 'Gaseosa', 'Cerveza'],
  clubBenefits: [
    {
      id: 'ben-corte',
      title: 'Corte de Autor Bonificado',
      description: 'Acumulando 10 puntos con tus visitas en el estudio',
      badge: '10 PTS',
      active: true
    },
    {
      id: 'ben-bebida',
      title: 'Barra de Cortesía en el Sillón',
      description: 'Cerveza helada, gaseosa o agua mineral en servicios con bebida',
      badge: 'INCLUIDO',
      active: true
    },
    {
      id: 'ben-cumple',
      title: 'Beneficio Semana de Cumpleaños',
      description: 'Atención preferencial y regalo directo en tu WhatsApp',
      badge: 'SOCIOS',
      active: true
    }
  ],
  redeemables: [
    {
      id: 'red-corte',
      name: 'Corte de Autor Completo',
      pointsCost: 10,
      stock: 99,
      hasStockLimit: false,
      active: true,
      description: 'Canjeá 10 puntos y tu próximo corte es 100% bonificado.'
    },
    {
      id: 'red-pomada',
      name: 'Pomada Matte de Autor (50g)',
      pointsCost: 6,
      stock: 8,
      hasStockLimit: true,
      active: true,
      description: 'Fijación media y acabado natural mate con aroma exclusivo.'
    },
    {
      id: 'red-aceite',
      name: 'Aceite Nutritivo para Barba',
      pointsCost: 5,
      stock: 5,
      hasStockLimit: true,
      active: true,
      description: 'Hidratación profunda de piel y vello facial con extractos botánicos.'
    }
  ]
};

const MOCK_SERVICES = [
  {
    id: 'corte',
    name: 'Corte',
    tagline: 'Fade & Corte de Autor',
    price: 18000,
    duration: 45,
    pointsEarned: 1,
    drinkIncluded: false,
    badge: 'CLÁSICO DE LA CASA',
    imageUrl: '/imagenes/IMG_3526.PNG',
    includes: [
      'Corte personalizado',
      'Perfilado',
      'Diseños simples',
      'Asesoramiento de imagen',
      'Finalización con productos profesionales'
    ],
    sortOrder: 1
  },
  {
    id: 'corte-bebida',
    name: 'Corte + Bebida',
    tagline: 'Fade + Barra Libre 1 Bebida',
    price: 20000,
    duration: 45,
    pointsEarned: 1,
    drinkIncluded: true,
    badge: 'MÁS ELEGIDO',
    imageUrl: '/imagenes/IMG_3888.JPG.jpeg',
    includes: [
      'Corte personalizado',
      'Perfilado',
      'Diseños simples',
      'Asesoramiento de imagen',
      '1 bebida a elección (agua mineral, gaseosa o cerveza)',
      'Finalización con productos profesionales'
    ],
    sortOrder: 2
  },
  {
    id: 'barba-premium',
    name: 'Barba Premium',
    tagline: 'Ritual de Navaja & Toalla',
    price: 20000,
    duration: 45,
    pointsEarned: 1,
    drinkIncluded: false,
    badge: 'PERFILADO PRO',
    imageUrl: '/imagenes/barba-premium.jpg',
    includes: [
      'Diseño de barba',
      'Perfilado con navaja',
      'Hidratación y terminación profesional'
    ],
    sortOrder: 3
  },
  {
    id: 'barba-premium-bebida',
    name: 'Barba Premium + Bebida',
    tagline: 'Ritual de Barba + 1 Bebida',
    price: 22000,
    duration: 45,
    pointsEarned: 1,
    drinkIncluded: true,
    badge: 'BARBA + TRAGO',
    imageUrl: '/imagenes/barba-premium-bebida.jpg',
    includes: [
      'Diseño de barba',
      'Perfilado con navaja',
      '1 bebida a elección (agua mineral, gaseosa o cerveza)',
      'Hidratación y terminación profesional'
    ],
    sortOrder: 4
  },
  {
    id: 'experiencia-completa',
    name: 'Corte Premium · Experiencia Completa',
    tagline: 'Corte + Relax Ocular & Masaje + Bebida',
    price: 24000,
    duration: 60,
    pointsEarned: 1,
    drinkIncluded: true,
    badge: 'CORTE PREMIUM VIP',
    imageUrl: '/imagenes/corte-premium.png',
    includes: [
      'Corte personalizado y perfilado al detalle',
      'Sesión relax con gafas de masaje ocular y masajeador cervical',
      'Limpieza facial express',
      'Productos de cuidado para cabello y barba',
      '1 bebida a elección (agua mineral, gaseosa o cerveza)'
    ],
    sortOrder: 5
  }
];

function getMockAppointments() {
  try {
    const raw = localStorage.getItem('barberfade_mock_appts');
    if (raw) return JSON.parse(raw);
  } catch {}
  const today = new Date().toISOString().split('T')[0];
  return [
    {
      id: 'demo-1',
      code: 'BF-8821',
      client_name: 'Mateo Rossi',
      client_phone: '3413762115',
      client_dni: '42123456',
      service_id: 'corte-bebida',
      service_name: 'Corte + Bebida',
      service_price: 20000,
      chosen_drink: 'Cerveza',
      date: today,
      time: '15:30',
      status: 'confirmed',
      notes: 'Turno confirmado'
    },
    {
      id: 'demo-2',
      code: 'BF-9014',
      client_name: 'Lucas Benítez',
      client_phone: '3415558899',
      client_dni: '40899123',
      service_id: 'experiencia-completa',
      service_name: 'Corte Premium · Experiencia Completa',
      service_price: 24000,
      chosen_drink: 'Gaseosa',
      date: today,
      time: '17:00',
      status: 'pending_confirmation',
      notes: 'Aguardando confirmación'
    }
  ];
}

function saveMockAppointments(appts) {
  try {
    localStorage.setItem('barberfade_mock_appts', JSON.stringify(appts));
  } catch {}
}

function handleStaticFallback(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body) : {};

  // 1. Bootstrap
  if (path === '/public/bootstrap') {
    return { config: MOCK_CONFIG };
  }

  // 2. Services
  if (path === '/services') {
    return {
      services: MOCK_SERVICES,
      drinks: MOCK_CONFIG.drinks
    };
  }

  // 3. Busy slots
  if (path.startsWith('/appointments/busy-slots')) {
    const appts = getMockAppointments();
    const busy = appts.map((a) => a.time);
    return { busy };
  }

  // 4. Client Check DNI
  if (path.startsWith('/clients/check/')) {
    const dni = decodeURIComponent(path.replace('/clients/check/', ''));
    const saved = localStorage.getItem(`barber_client_${dni}`);
    if (saved) {
      return { exists: true, isRegistered: true, name: JSON.parse(saved).name };
    }
    if (dni === '42123456') {
      return { exists: true, isRegistered: true, name: 'Mateo Rossi' };
    }
    return { exists: false, isRegistered: false };
  }

  // 5. Client Login
  if (path === '/clients/login') {
    const { dni, pin } = body;
    let client = null;
    const saved = localStorage.getItem(`barber_client_${dni}`);
    if (saved) {
      client = JSON.parse(saved);
    } else {
      client = {
        dni,
        name: dni === '42123456' ? 'Mateo Rossi' : 'Socio David Barber',
        phone: '3413762115',
        points: 7,
        total_cuts: 7,
        tier: 'Black Gold'
      };
      localStorage.setItem(`barber_client_${dni}`, JSON.stringify(client));
    }
    const token = `mock-client-token-${dni}`;
    localStorage.setItem('barberfade_current_mock_client', JSON.stringify(client));
    return { token, client };
  }

  // 6. Client Register
  if (path === '/clients/register') {
    const client = {
      dni: body.dni,
      name: body.name || 'Nuevo Socio',
      phone: body.phone || '3413762115',
      points: 0,
      total_cuts: 0,
      tier: 'Miembro'
    };
    localStorage.setItem(`barber_client_${body.dni}`, JSON.stringify(client));
    localStorage.setItem('barberfade_current_mock_client', JSON.stringify(client));
    return { token: `mock-client-token-${body.dni}`, client };
  }

  // 7. Client Me
  if (path === '/clients/me') {
    let client = null;
    const saved = localStorage.getItem('barberfade_current_mock_client');
    if (saved) {
      client = JSON.parse(saved);
    } else {
      client = {
        dni: '42123456',
        name: 'Mateo Rossi',
        phone: '3413762115',
        points: 8,
        total_cuts: 8,
        tier: 'Black Gold'
      };
    }
    const appts = getMockAppointments().filter((a) => a.client_dni === client.dni);
    return { client, appointments: appts };
  }

  // 8. Request Appointment
  if (path === '/appointments/request') {
    const code = `BF-${Math.floor(1000 + Math.random() * 9000)}`;
    const svc = MOCK_SERVICES.find((s) => s.id === body.serviceId) || MOCK_SERVICES[0];
    const newAppt = {
      id: `mock-${Date.now()}`,
      code,
      client_name: body.clientName || 'Cliente',
      client_phone: body.clientPhone || '3413762115',
      client_dni: body.clientDni || '42123456',
      service_id: svc.id,
      service_name: svc.name,
      service_price: svc.price,
      chosen_drink: body.chosenDrink || (svc.drinkIncluded ? 'Cerveza' : null),
      date: body.date,
      time: body.time,
      status: 'pending_confirmation',
      notes: body.notes || ''
    };
    const appts = [newAppt, ...getMockAppointments()];
    saveMockAppointments(appts);

    const waText = `¡Hola David! Quiero pedir un turno:%0A%0A✂ *Servicio:* ${svc.name}%0A📅 *Fecha:* ${body.date}%0A⏰ *Hora:* ${body.time}%0A👤 *Cliente:* ${newAppt.client_name}%0A%0ACódigo: ${code}`;
    const whatsappLink = `https://wa.me/5493413762115?text=${waText}`;

    return {
      appointment: newAppt,
      whatsappLink,
      holdExpiresAt: Date.now() + 15 * 60 * 1000
    };
  }

  // 9. Admin Login
  if (path === '/admin/login') {
    if (body.password === '1234' || body.password === 'barber2026' || body.username === 'david') {
      const token = 'mock-admin-token-david';
      return {
        token,
        admin: { username: 'david', displayName: 'David' }
      };
    }
    const err = new Error('PIN incorrecto. Usá 1234 o barber2026');
    err.status = 401;
    throw err;
  }

  // 10. Admin Me
  if (path === '/admin/me') {
    return { admin: { username: 'david', displayName: 'David' } };
  }

  // 11. Admin Dashboard
  if (path === '/admin/dashboard') {
    const appointments = getMockAppointments();
    return {
      appointments,
      metrics: {
        todayTurns: appointments.length,
        todayEarnings: appointments.reduce((sum, a) => sum + (a.service_price || 0), 0),
        pendingConfirmations: appointments.filter((a) => a.status === 'pending_confirmation').length,
        totalClients: 48
      },
      services: MOCK_SERVICES,
      config: MOCK_CONFIG
    };
  }

  // 12. Admin appointment actions
  if (path.includes('/confirm')) {
    const id = path.split('/')[3];
    const appts = getMockAppointments().map((a) => (a.id === id ? { ...a, status: 'confirmed' } : a));
    saveMockAppointments(appts);
    return { success: true };
  }
  if (path.includes('/complete')) {
    const id = path.split('/')[3];
    const appts = getMockAppointments().map((a) => (a.id === id ? { ...a, status: 'completed' } : a));
    saveMockAppointments(appts);
    return { success: true };
  }
  if (path.includes('/cancel')) {
    const id = path.split('/')[3];
    const appts = getMockAppointments().map((a) => (a.id === id ? { ...a, status: 'cancelled' } : a));
    saveMockAppointments(appts);
    return { success: true };
  }

  return { ok: true };
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

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers
    });

    // If server responded with an HTML 404 page (typical on GitHub Pages static host)
    const contentType = res.headers.get('content-type') || '';
    if (!res.ok || !contentType.includes('application/json')) {
      // Trigger static fallback
      return handleStaticFallback(path, options);
    }

    const data = await res.json().catch(() => null);
    if (!data) {
      return handleStaticFallback(path, options);
    }
    return data;
  } catch {
    // Backend offline / GitHub Pages static environment -> fallback gracefully
    return handleStaticFallback(path, options);
  }
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
