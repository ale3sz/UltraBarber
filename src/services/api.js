import { getAssetUrl } from '../utils/assets';
import { formatLocalDate } from '../utils/date';

const API_BASE = '/api';

const CLIENT_TOKEN_KEY = 'barberfade_client_token';
const ADMIN_TOKEN_KEY = 'barberfade_admin_token';

function safeGetStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetStorage(key, val) {
  try {
    localStorage.setItem(key, val);
  } catch {}
}

function safeRemoveStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch {}
}

export function getClientToken() {
  return safeGetStorage(CLIENT_TOKEN_KEY);
}

export function setClientToken(token) {
  if (token) safeSetStorage(CLIENT_TOKEN_KEY, token);
  else safeRemoveStorage(CLIENT_TOKEN_KEY);
}

export function getAdminToken() {
  return safeGetStorage(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token) {
  if (token) safeSetStorage(ADMIN_TOKEN_KEY, token);
  else safeRemoveStorage(ADMIN_TOKEN_KEY);
}

// ----------------------------------------------------
// Static Demo Mock Data for GitHub Pages / Static Host
// ----------------------------------------------------
const MOCK_CONFIG = {
  barberName: 'David',
  businessName: 'ULTRA BARBER STUDIO',
  whatsappPhone: '5493413762115',
  holdDurationMinutes: 15,
  pointsForFreeCut: 10,
  address: 'Eva Perón 52 • Studio Privado',
  city: 'Capitán Bermúdez',
  googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=-32.8300541,-60.7128648',
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
    imageUrl: getAssetUrl('imagenes/IMG_3526.PNG'),
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
    imageUrl: getAssetUrl('imagenes/corte-bebida.jpg'),
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
    imageUrl: getAssetUrl('imagenes/barba-premium.jpg'),
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
    imageUrl: getAssetUrl('imagenes/barba-premium-bebida.jpg'),
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
    imageUrl: getAssetUrl('imagenes/corte-premium.png'),
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

export function formatStaticClient(raw) {
  if (!raw) return null;
  const nameParts = (raw.name || '').trim().split(/\s+/);
  const firstName = raw.firstName || nameParts[0] || 'Socio';
  const lastName = raw.lastName || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'VIP');
  const fullName = raw.name || `${firstName} ${lastName}`.trim();
  const totalCuts = raw.totalCuts ?? raw.total_cuts ?? 8;
  const points = raw.points ?? 8;

  let tier = 'Black Member · Nivel 1';
  if (totalCuts >= 12) tier = 'Gold VIP · Nivel 3';
  else if (totalCuts >= 6) tier = 'Silver & Gold · Nivel 2';

  return {
    id: raw.id || `client-${raw.dni || '42123456'}`,
    dni: raw.dni || '42123456',
    firstName,
    lastName,
    name: fullName,
    phone: raw.phone || '3413762115',
    birthDate: raw.birthDate || '1995-05-15',
    points,
    totalCuts,
    total_cuts: totalCuts,
    tier: raw.tier || tier,
    memberSince: raw.memberSince || '2025-01-15',
    hasPin: true,
    pinCode: raw.pinCode || '1234',
    notes: raw.notes || ''
  };
}

function normalizeMockAppointment(a) {
  const clientName = a.clientName || a.client_name || 'Cliente';
  const clientPhone = a.clientPhone || a.client_phone || '3413762115';
  const dni = a.dni || a.client_dni || '42123456';
  const serviceId = a.serviceId || a.service_id || 'corte-bebida';
  const serviceName = a.serviceName || a.service_name || 'Corte + Bebida';
  const price = a.price ?? a.service_price ?? 20000;
  const selectedDrink = a.selectedDrink ?? a.chosen_drink ?? null;
  let status = a.status || 'confirmado';
  if (status === 'confirmed') status = 'confirmado';
  if (status === 'pending_confirmation') status = 'pendiente';
  if (status === 'completed') status = 'finalizado';
  if (status === 'cancelled') status = 'cancelado';

  return {
    ...a,
    dni,
    client_dni: dni,
    clientName,
    client_name: clientName,
    clientPhone,
    client_phone: clientPhone,
    serviceId,
    service_id: serviceId,
    serviceName,
    service_name: serviceName,
    price,
    service_price: price,
    selectedDrink,
    chosen_drink: selectedDrink,
    status
  };
}

function getMockAppointments() {
  try {
    const raw = safeGetStorage('barberfade_mock_appts');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(normalizeMockAppointment);
    }
  } catch {}
  const today = formatLocalDate(new Date());
  return [
    normalizeMockAppointment({
      id: 'demo-1',
      code: 'BF-8821',
      dni: '38999888',
      clientName: 'Mateo Rossi',
      clientPhone: '3413762115',
      serviceId: 'corte-bebida',
      serviceName: 'Corte + Bebida',
      price: 20000,
      selectedDrink: 'Cerveza',
      date: today,
      time: '15:30',
      status: 'confirmado',
      notes: 'Turno confirmado'
    }),
    normalizeMockAppointment({
      id: 'demo-2',
      code: 'BF-9014',
      dni: '40123456',
      clientName: 'Lucas Benítez',
      clientPhone: '3415558899',
      serviceId: 'experiencia-completa',
      serviceName: 'Corte Premium · Experiencia Completa',
      price: 24000,
      selectedDrink: 'Gaseosa',
      date: today,
      time: '17:00',
      status: 'pendiente',
      notes: 'Aguardando confirmación'
    })
  ];
}

function saveMockAppointments(appts) {
  safeSetStorage('barberfade_mock_appts', JSON.stringify(appts.map(normalizeMockAppointment)));
}

function handleStaticFallback(path, options = {}) {
  let body = {};
  try {
    body = options.body ? JSON.parse(options.body) : {};
  } catch {
    body = {};
  }

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
    const appts = getMockAppointments().filter((a) => a.status === 'confirmado' || a.status === 'pendiente');
    const busySlots = appts.map((a) => a.time);
    return {
      busy: busySlots,
      busySlots,
      disabledSlots: MOCK_CONFIG.disabledSlots || [],
      isDayClosed: false,
      closedReason: ''
    };
  }

  // 4. Client Check DNI
  if (path.startsWith('/clients/check/')) {
    const rawParam = decodeURIComponent(path.replace('/clients/check/', '')).trim();
    const dni = rawParam.replace(/\D/g, '');

    // David Admin DNI Recognition (with dynamic localStorage support)
    const savedAdminDni = safeGetStorage('barber_admin_dni') || '11111111';
    if (dni === '11111111' || (savedAdminDni && dni === savedAdminDni) || dni === '12345678' || rawParam.toLowerCase() === 'david') {
      return {
        exists: true,
        isAdmin: true,
        dni: dni || savedAdminDni,
        name: 'David (Administrador)',
        maskedName: 'David (Administrador)',
        requiresPassword: true
      };
    }

    const saved = safeGetStorage(`barber_client_${dni}`);
    if (saved) {
      try {
        const client = formatStaticClient(JSON.parse(saved));
        return {
          exists: true,
          dni,
          hasPin: true,
          isRegistered: true,
          name: client.name,
          firstName: client.firstName,
          lastName: client.lastName,
          maskedName: `${client.firstName} ${client.lastName ? client.lastName.charAt(0) + '.' : ''}`.trim(),
          phoneHint: `•••${String(client.phone || '2115').slice(-4)}`
        };
      } catch {}
    }
    if (dni === '40123456') {
      return {
        exists: true,
        dni,
        hasPin: true,
        isRegistered: true,
        name: 'Lucas Benítez',
        firstName: 'Lucas',
        lastName: 'Benítez',
        maskedName: 'Lucas B.',
        phoneHint: '•••8899'
      };
    }
    if (dni === '38999888' || dni === '42123456') {
      return {
        exists: true,
        dni,
        hasPin: true,
        isRegistered: true,
        name: 'Mateo Rossi',
        firstName: 'Mateo',
        lastName: 'Rossi',
        maskedName: 'Mateo R.',
        phoneHint: '•••2115'
      };
    }
    return { exists: false, dni, hasPin: false, isRegistered: false };
  }

  // 5. Client Login
  if (path === '/clients/login') {
    const dni = String(body.dni || '40123456').replace(/\D/g, '');
    let client = null;
    const saved = safeGetStorage(`barber_client_${dni}`);
    if (saved) {
      try {
        client = formatStaticClient(JSON.parse(saved));
      } catch {}
    }
    if (!client) {
      if (dni === '40123456') {
        client = formatStaticClient({
          dni,
          firstName: 'Lucas',
          lastName: 'Benítez',
          name: 'Lucas Benítez',
          phone: '3415558899',
          points: 4,
          totalCuts: 4
        });
      } else {
        client = formatStaticClient({
          dni,
          firstName: dni === '38999888' || dni === '42123456' ? 'Mateo' : 'Socio',
          lastName: dni === '38999888' || dni === '42123456' ? 'Rossi' : 'VIP',
          name: dni === '38999888' || dni === '42123456' ? 'Mateo Rossi' : 'Socio ULTRA BARBER',
          phone: '3413762115',
          points: 10,
          totalCuts: 10
        });
      }
      safeSetStorage(`barber_client_${dni}`, JSON.stringify(client));
    }
    const token = `mock-client-token-${dni}`;
    safeSetStorage(CLIENT_TOKEN_KEY, token);
    safeSetStorage('barberfade_current_mock_client', JSON.stringify(client));
    const appointments = getMockAppointments().filter((a) => a.dni === client.dni);
    return { token, client, appointments };
  }

  // 6. Client Register
  if (path === '/clients/register') {
    const dni = String(body.dni || '').replace(/\D/g, '') || '40999111';
    const client = formatStaticClient({
      dni,
      firstName: body.firstName || (body.name ? body.name.split(' ')[0] : 'Nuevo'),
      lastName: body.lastName || (body.name ? body.name.split(' ').slice(1).join(' ') : 'Socio'),
      name: body.name || `${body.firstName || 'Nuevo'} ${body.lastName || 'Socio'}`.trim(),
      phone: body.phone || '3413762115',
      birthDate: body.birthDate || '',
      points: 0,
      totalCuts: 0,
      tier: 'Black Member · Nivel 1'
    });
    safeSetStorage(`barber_client_${dni}`, JSON.stringify(client));
    const token = `mock-client-token-${dni}`;
    safeSetStorage(CLIENT_TOKEN_KEY, token);
    safeSetStorage('barberfade_current_mock_client', JSON.stringify(client));
    return { token, client, appointments: [] };
  }

  // 7. Client Me
  if (path === '/clients/me') {
    let client = null;
    const saved = safeGetStorage('barberfade_current_mock_client');
    if (saved) {
      try {
        client = formatStaticClient(JSON.parse(saved));
      } catch {
        client = null;
      }
    }
    if (!client) {
      client = formatStaticClient({
        dni: '38999888',
        firstName: 'Mateo',
        lastName: 'Rossi',
        name: 'Mateo Rossi',
        phone: '3413762115',
        points: 10,
        totalCuts: 10,
        tier: 'Silver & Gold · Nivel 2'
      });
    }
    const appts = getMockAppointments().filter((a) => a.dni === client.dni);
    return { client, appointments: appts };
  }

  // 8. Request Appointment
  if (path === '/appointments/request') {
    const code = `BF-${Math.floor(1000 + Math.random() * 9000)}`;
    const svc = MOCK_SERVICES.find((s) => s.id === body.serviceId) || MOCK_SERVICES[0];
    let currentClient = null;
    try {
      const saved = safeGetStorage('barberfade_current_mock_client');
      if (saved) currentClient = formatStaticClient(JSON.parse(saved));
    } catch {}
    const clientName = body.clientName || (currentClient ? `${currentClient.firstName} ${currentClient.lastName}`.trim() : 'Cliente');
    const clientPhone = body.clientPhone || currentClient?.phone || '3413762115';
    const clientDni = body.clientDni || currentClient?.dni || '38999888';
    const selectedDrink = body.selectedDrink || body.chosenDrink || (svc.drinkIncluded ? 'Cerveza' : null);
    const expiresAt = Date.now() + 15 * 60 * 1000;

    const newAppt = normalizeMockAppointment({
      id: `mock-${Date.now()}`,
      code,
      dni: clientDni,
      clientName,
      clientPhone,
      serviceId: svc.id,
      serviceName: svc.name,
      price: svc.price,
      selectedDrink,
      date: body.date,
      time: body.time,
      status: 'pendiente',
      expiresAt,
      notes: body.notes || ''
    });

    const appts = [newAppt, ...getMockAppointments()];
    saveMockAppointments(appts);

    const rawMessage = `¡Hola David! Quiero confirmar mi turno:\n\n✂ Servicio: ${svc.name}${selectedDrink ? ` (${selectedDrink})` : ''}\n📅 Fecha: ${body.date}\n⏰ Hora: ${body.time} hs\n👤 Cliente: ${clientName} (DNI ${clientDni})\n🔑 Código: #${code}`;
    const whatsappUrl = `https://wa.me/5493413762115?text=${encodeURIComponent(rawMessage)}`;

    return {
      appointment: newAppt,
      code,
      expiresAt,
      rawMessage,
      whatsappUrl,
      whatsappLink: whatsappUrl,
      holdExpiresAt: expiresAt
    };
  }

  // 8B. Appointment Status
  if (path.startsWith('/appointments/') && !path.includes('busy-slots') && !path.includes('client-cancel')) {
    const idOrCode = decodeURIComponent(path.replace('/appointments/', ''));
    const appts = getMockAppointments();
    const found = appts.find((a) => a.id === idOrCode || a.code === idOrCode) || appts[0];
    const expiresAt = found?.expiresAt || Date.now() + 15 * 60 * 1000;
    const rawMessage = `¡Hola David! Quiero confirmar mi turno:\n\n✂ Servicio: ${found.serviceName}\n📅 Fecha: ${found.date}\n⏰ Hora: ${found.time} hs\n👤 Cliente: ${found.clientName}\n🔑 Código: #${found.code}`;
    const whatsappUrl = `https://wa.me/5493413762115?text=${encodeURIComponent(rawMessage)}`;
    return {
      ...found,
      expiresAt,
      rawMessage,
      whatsappUrl
    };
  }

  // 8C. Cancel My Appointment
  if (path.endsWith('/client-cancel')) {
    const id = decodeURIComponent(path.split('/')[2]);
    const appts = getMockAppointments().map((a) => (a.id === id ? { ...a, status: 'cancelado' } : a));
    saveMockAppointments(appts);
    return { success: true };
  }

  // 8D. Recovery Link
  if (path === '/clients/recovery-link') {
    const msg = `Hola David! Olvidé mi PIN de acceso a ULTRA BARBER Studio (DNI ${body.dni || ''}). ¿Me ayudás a recuperarlo?`;
    return {
      whatsappUrl: `https://wa.me/5493413762115?text=${encodeURIComponent(msg)}`
    };
  }

  // 9. Admin Login
  if (path === '/admin/login') {
    if (body.password === '1234' || body.password === 'barber2026' || body.username === 'david') {
      const token = 'mock-admin-token-david';
      safeSetStorage(ADMIN_TOKEN_KEY, token);
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
    const clients = [
      formatStaticClient({ dni: '38999888', firstName: 'Mateo', lastName: 'Rossi', phone: '3413762115', birthDate: '1995-10-18', points: 10, totalCuts: 10 }),
      formatStaticClient({ dni: '40123456', firstName: 'Lucas', lastName: 'Benítez', phone: '3415558899', birthDate: '1998-10-22', points: 4, totalCuts: 4 }),
      formatStaticClient({ dni: '39112233', firstName: 'Joaquín', lastName: 'Alvarez', phone: '3416778899', birthDate: '1993-04-12', points: 12, totalCuts: 14 })
    ];
    return {
      appointments,
      clients,
      blockedSlots: [],
      payments: [],
      birthdays: {
        thisWeek: [clients[0]],
        thisMonth: [clients[0], clients[1]]
      },
      metrics: {
        todayTurns: appointments.length,
        todayEarnings: appointments.reduce((sum, a) => sum + (a.price || 0), 0),
        pendingConfirmations: appointments.filter((a) => a.status === 'pendiente').length,
        totalClients: clients.length
      },
      services: MOCK_SERVICES,
      config: MOCK_CONFIG
    };
  }

  // 12. Admin appointment actions
  if (path.includes('/confirm')) {
    const id = decodeURIComponent(path.split('/')[3]);
    const appts = getMockAppointments().map((a) => (a.id === id ? { ...a, status: 'confirmado' } : a));
    saveMockAppointments(appts);
    return { success: true };
  }
  if (path.includes('/complete')) {
    const id = decodeURIComponent(path.split('/')[3]);
    const appts = getMockAppointments().map((a) => (a.id === id ? { ...a, status: 'finalizado' } : a));
    saveMockAppointments(appts);
    return { success: true };
  }
  if (path.includes('/cancel') || path.includes('/no-show')) {
    const id = decodeURIComponent(path.split('/')[3]);
    const appts = getMockAppointments().map((a) => (a.id === id ? { ...a, status: 'cancelado' } : a));
    saveMockAppointments(appts);
    return { success: true };
  }

  // 13. Admin Credentials Update Fallback
  if (path === '/admin/credentials') {
    if (body.newDni) {
      safeSetStorage('barber_admin_dni', body.newDni.replace(/\D/g, ''));
    }
    return { success: true };
  }

  return { ok: true };
}

const isStaticHost =
  typeof window !== 'undefined' &&
  (window.location.hostname.includes('github.io') ||
   window.location.protocol === 'file:' ||
   Boolean(import.meta.env.VITE_STATIC_DEMO));

async function request(path, options = {}, authType = null) {
  if (isStaticHost) {
    return handleStaticFallback(path, options);
  }

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

    const contentType = res.headers.get('content-type') || '';
    if (!res.ok || !contentType.includes('application/json')) {
      return handleStaticFallback(path, options);
    }

    const data = await res.json().catch(() => null);
    if (!data) {
      return handleStaticFallback(path, options);
    }
    return data;
  } catch {
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
  loginClientWithPin: async (dni, pin) => {
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
