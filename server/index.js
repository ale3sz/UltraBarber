import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  db,
  initDatabase,
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
  getConfigObject,
  updateConfigObject
} from './db.js';
import {
  getArgentinaDateString,
  getArgentinaMinutesOfDay,
  argentinaSlotToUtcTimestamp,
  getArgentinaDayOfWeek
} from './timezone.js';

// Inicializar la base de datos y migraciones
initDatabase();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 7201;
const IS_PROD = process.env.NODE_ENV === 'production';

// ============================================================================
// MIDDLEWARES DE SEGURIDAD Y PROTECCIÓN
// ============================================================================

// 1. Helmet: Blindaje de cabeceras HTTP
app.use(helmet({
  contentSecurityPolicy: false, // Permite assets estáticos de Vite/PWA sin bloqueos
  crossOriginEmbedderPolicy: false
}));

// 2. CORS controlado por whitelist / variable de entorno
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
  : ['http://localhost:5173', 'http://localhost:4173', 'http://localhost:7201', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || !IS_PROD || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Acceso no permitido por política CORS'));
  },
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));
app.use('/imagenes', express.static(path.join(__dirname, '..', 'imagenes')));

// 3. Prevención de caché en respuestas dinámicas de la API (Blindaje PWA / Service Worker)
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// 4. Rate Limiters específicos mediante express-rate-limit
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos fallidos
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de acceso administrativo. Cuenta bloqueada temporalmente por 15 minutos.' }
});

const clientAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes de autenticación. Por favor intente más tarde.' }
});

const appointmentBookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Máximo 10 turnos reservados por IP cada 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Límite de solicitudes de reserva alcanzado. Por favor aguarde unos minutos.' }
});

const generalApiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Límite de peticiones excedido. Reduzca la frecuencia de consultas.' }
});

app.use('/api', generalApiLimiter);

// ============================================================================
// HELPERS Y FORMATEADORES (BLINDADOS)
// ============================================================================

// Helper: Formato de cliente seguro (NUNCA expone el PIN en texto plano ni hashes al frontend)
function formatClient(row) {
  if (!row) return null;
  return {
    id: row.id,
    dni: row.dni,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    birthDate: row.birth_date || '',
    points: row.points || 0,
    totalCuts: row.total_cuts || 0,
    notes: row.notes || '',
    hairStyle: row.hair_style || '',
    hairTexture: row.hair_texture || '',
    preferredProduct: row.preferred_product || '',
    preferredDrink: row.preferred_drink || '',
    lastVisitDate: row.last_visit_date || '',
    memberSince: row.member_since,
    hasPin: Boolean(row.pin_hash)
  };
}

// Helper: Formato de turnos
function formatAppointment(row) {
  if (!row) return null;
  return {
    id: row.id,
    code: row.code,
    dni: row.dni,
    clientName: row.client_name,
    clientPhone: row.client_phone,
    serviceId: row.service_id,
    serviceName: row.service_name,
    selectedDrink: row.selected_drink,
    price: row.price,
    date: row.date,
    time: row.time,
    status: row.status,
    paymentMethod: row.payment_method,
    amountPaid: row.amount_paid,
    pointsUsed: row.points_used || 0,
    notes: row.notes || '',
    createdAt: row.created_at,
    expiresAt: row.hold_expires_at || row.expires_at,
    holdExpiresAt: row.hold_expires_at || row.expires_at,
    confirmedAt: row.confirmed_at,
    completedAt: row.completed_at
  };
}

// Helper: Formato de servicios
function formatService(row) {
  if (!row) return null;
  let includes = [];
  try {
    includes = JSON.parse(row.includes_json || '[]');
  } catch {
    includes = [];
  }
  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline || '',
    price: row.price,
    duration: row.duration,
    pointsEarned: row.points_earned || 1,
    drinkIncluded: Boolean(row.drink_included),
    includes,
    imageUrl: row.image_url || '',
    badge: row.badge || '',
    sortOrder: row.sort_order || 0,
    active: Boolean(row.active),
    directConsult: Boolean(row.price === 0 || row.id === 'colorimetria')
  };
}

// Background Worker: Limpieza de turnos con Hold vencido (Apoyado en base de datos)
export function checkExpiredAppointments() {
  const now = Date.now();
  const stmt = db.prepare(`
    UPDATE appointments
    SET status = 'expirado'
    WHERE status = 'pendiente'
      AND (
        (hold_expires_at IS NOT NULL AND hold_expires_at < ?)
        OR (expires_at IS NOT NULL AND expires_at < ?)
      )
  `);
  stmt.run(now, now);
}

// Ejecutar limpieza cada 5 segundos
setInterval(checkExpiredAppointments, 5000);

// Generador de código aleatorio de 4 dígitos único entre activos
function generate4DigitCode() {
  const activeRows = db
    .prepare("SELECT code FROM appointments WHERE status IN ('pendiente', 'confirmado')")
    .all();
  const activeCodes = new Set(activeRows.map(r => r.code));
  for (let i = 0; i < 100; i++) {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    if (!activeCodes.has(code)) return code;
  }
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Horarios comerciales estándar
const VALID_COMMERCIAL_SLOTS = [
  '09:00', '09:45', '10:30', '11:15', '12:00', '12:45',
  '14:00', '14:45', '15:30', '16:15', '17:00', '17:45', '18:30', '19:15'
];

function timeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string' || !timeStr.includes(':')) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

// Control de fuerza bruta por DNI en base de datos
function checkLoginRateLimit(identifier) {
  const now = Date.now();
  const row = db.prepare('SELECT failed_attempts, locked_until FROM login_security WHERE identifier = ?').get(identifier);
  if (!row) return { allowed: true };
  if (row.locked_until && row.locked_until > now) {
    const remainingMinutes = Math.ceil((row.locked_until - now) / 60000);
    return {
      allowed: false,
      remainingMinutes,
      error: `Demasiados intentos fallidos. Tu cuenta está bloqueada temporalmente por ${remainingMinutes} min por seguridad. Contactá a David por WhatsApp para asistencia.`
    };
  }
  return { allowed: true, failedAttempts: row.failed_attempts || 0 };
}

function recordFailedLogin(identifier) {
  const now = Date.now();
  const row = db.prepare('SELECT failed_attempts FROM login_security WHERE identifier = ?').get(identifier);
  const attempts = (row?.failed_attempts || 0) + 1;
  const lockedUntil = attempts >= 5 ? now + 15 * 60 * 1000 : 0;
  db.prepare(`
    INSERT INTO login_security (identifier, failed_attempts, locked_until, last_attempt)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(identifier) DO UPDATE SET
      failed_attempts = ?,
      locked_until = ?,
      last_attempt = ?
  `).run(identifier, attempts, lockedUntil, now, attempts, lockedUntil, now);

  return { attempts, isLocked: attempts >= 5, remainingAttempts: Math.max(0, 5 - attempts) };
}

function resetLoginSecurity(identifier) {
  db.prepare('DELETE FROM login_security WHERE identifier = ?').run(identifier);
}

// Middlewares de autenticación JWT
function getBearerToken(req) {
  const auth = req.headers.authorization || '';
  if (auth.startsWith('Bearer ')) return auth.slice(7).trim();
  return null;
}

function requireAdmin(req, res, next) {
  const token = getBearerToken(req);
  const payload = verifyToken(token);
  if (!payload || payload.role !== 'admin') {
    return res.status(401).json({ error: 'Acceso restringido. Iniciá sesión como Administrador.' });
  }
  req.admin = payload;
  next();
}

function getOptionalClient(req) {
  const token = getBearerToken(req);
  const payload = verifyToken(token);
  if (payload && payload.role === 'client') return payload;
  return null;
}

function formatWhatsAppPhone(rawPhone) {
  const digits = String(rawPhone || '5493413762115').replace(/\D/g, '');
  if (digits.length === 10 && !digits.startsWith('54')) {
    return `549${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('54') && !digits.startsWith('549')) {
    return `549${digits.slice(2)}`;
  }
  return digits || '5493413762115';
}

function getIsoWeekKey(dateStr) {
  const d = new Date(dateStr + 'T12:00:00.000-03:00');
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function getScheduleForDate(config, dateStr) {
  const weekKey = getIsoWeekKey(dateStr);
  const weeklySchedule = config.weeklySchedule || {};
  const weekOverride = weeklySchedule[weekKey];

  const workingDays = (weekOverride && Array.isArray(weekOverride.workingDays))
    ? weekOverride.workingDays
    : (config.workingDays || [1, 2, 3, 4, 5, 6]);

  const disabledSlots = (weekOverride && Array.isArray(weekOverride.disabledSlots))
    ? weekOverride.disabledSlots
    : (config.disabledSlots || []);

  return { workingDays, disabledSlots, weekKey, isWeekOverridden: Boolean(weekOverride) };
}

// ============================================================================
// 1. PUBLIC & BOOTSTRAP ENDPOINTS
// ============================================================================

app.get('/api/public/bootstrap', (req, res) => {
  checkExpiredAppointments();
  const config = getConfigObject();
  const serviceRows = db.prepare('SELECT * FROM services WHERE active = 1 ORDER BY sort_order ASC').all();
  res.json({
    config,
    services: serviceRows.map(formatService),
    drinks: config.drinks || ['Agua mineral', 'Gaseosa', 'Cerveza']
  });
});

app.get('/api/services', (req, res) => {
  const config = getConfigObject();
  const serviceRows = db.prepare('SELECT * FROM services WHERE active = 1 ORDER BY sort_order ASC').all();
  res.json({
    services: serviceRows.map(formatService),
    drinks: config.drinks || ['Agua mineral', 'Gaseosa', 'Cerveza']
  });
});

// ============================================================================
// 2. CLIENT AUTHENTICATION & ANTI-IMPERSONATION (DNI + 4-DIGIT PIN CON BCRYPT)
// ============================================================================

app.get('/api/clients/check/:dni', clientAuthLimiter, (req, res) => {
  const cleanDni = (req.params.dni || '').trim().replace(/\D/g, '');
  const rawParam = (req.params.dni || '').trim().toLowerCase();

  // 1. Verificar si corresponde a David (Admin)
  try {
    const adminRow = db.prepare('SELECT * FROM admins WHERE dni = ? OR LOWER(username) = ?').get(cleanDni || rawParam, rawParam);
    if (adminRow || cleanDni === '11111111' || rawParam === 'david') {
      return res.json({
        exists: true,
        isAdmin: true,
        dni: cleanDni || adminRow?.dni || '11111111',
        maskedName: `${adminRow?.display_name || 'David'} (Administrador)`,
        requiresPassword: true
      });
    }
  } catch (err) {
    console.error('Error al chequear admin DNI:', err);
  }

  if (!cleanDni || cleanDni.length < 6) {
    return res.status(400).json({ error: 'Ingresá un DNI válido (mínimo 6 números)' });
  }

  const row = db.prepare('SELECT * FROM clients WHERE dni = ?').get(cleanDni);
  if (!row) {
    return res.json({ exists: false, dni: cleanDni });
  }

  const maskedLastName = row.last_name ? `${row.last_name.charAt(0)}.` : '';

  res.json({
    exists: true,
    dni: cleanDni,
    hasPin: Boolean(row.pin_hash),
    maskedName: `${row.first_name} ${maskedLastName}`
  });
});

// Login con DNI + PIN de 4 dígitos (Verificación con bcrypt y mitigación de fuerza bruta)
app.post('/api/clients/login', clientAuthLimiter, (req, res) => {
  const { dni, pin } = req.body;
  const cleanDni = (dni || '').trim().replace(/\D/g, '');
  const cleanPin = (pin || '').trim();

  if (!cleanDni || !cleanPin) {
    return res.status(400).json({ error: 'Ingresá tu DNI y tu PIN de 4 dígitos' });
  }

  const rateLimitStatus = checkLoginRateLimit(cleanDni);
  if (!rateLimitStatus.allowed) {
    return res.status(429).json({ error: rateLimitStatus.error });
  }

  const row = db.prepare('SELECT * FROM clients WHERE dni = ?').get(cleanDni);
  if (!row) {
    recordFailedLogin(cleanDni);
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }

  if (!verifyPassword(cleanPin, row.pin_hash)) {
    const failInfo = recordFailedLogin(cleanDni);
    if (failInfo.isLocked) {
      return res.status(429).json({
        error: 'Alcanzaste 5 intentos erróneos. Tu cuenta ha sido bloqueada temporalmente por 15 minutos por seguridad. Tocá "Olvidé mi PIN" para escribirle a David.'
      });
    }
    return res.status(401).json({
      error: `PIN incorrecto (te quedan ${failInfo.remainingAttempts} intento${failInfo.remainingAttempts === 1 ? '' : 's'}). Si no lo recordás, tocá "Olvidé mi PIN" para recuperarlo por WhatsApp.`
    });
  }

  // Migración transparente a bcrypt si tenía hash antiguo
  if (row.pin_hash && !row.pin_hash.startsWith('$2')) {
    db.prepare('UPDATE clients SET pin_hash = ?, pin_code = NULL WHERE id = ?').run(
      hashPassword(cleanPin, 10),
      row.id
    );
  }

  resetLoginSecurity(cleanDni);

  const token = signToken({ role: 'client', dni: row.dni, clientId: row.id });
  const appointments = db
    .prepare('SELECT * FROM appointments WHERE dni = ? ORDER BY created_at DESC LIMIT 20')
    .all(row.dni)
    .map(formatAppointment);

  res.json({
    success: true,
    token,
    client: formatClient(row),
    appointments
  });
});

// Registro de nuevo cliente (PIN almacenado con bcrypt, nunca en texto plano)
app.post('/api/clients/register', clientAuthLimiter, (req, res) => {
  const { dni, firstName, lastName, phone, birthDate, pin } = req.body;
  const cleanDni = (dni || '').trim().replace(/\D/g, '');
  const cleanPin = (pin || '').trim().replace(/\D/g, '');

  if (!cleanDni || cleanDni.length < 6) {
    return res.status(400).json({ error: 'DNI inválido (mínimo 6 dígitos)' });
  }
  if (!firstName?.trim() || !lastName?.trim() || !phone?.trim()) {
    return res.status(400).json({ error: 'Completá Nombre, Apellido y WhatsApp' });
  }
  if (!cleanPin || cleanPin.length !== 4) {
    return res.status(400).json({ error: 'Elegí un PIN de seguridad de 4 números (ej: 1234)' });
  }

  const existing = db.prepare('SELECT id FROM clients WHERE dni = ?').get(cleanDni);
  if (existing) {
    return res.status(409).json({
      error: 'Este DNI ya está registrado. Ingresá con tu PIN de 4 dígitos.'
    });
  }

  const id = `c_${Date.now()}`;
  const memberSince = getArgentinaDateString();

  db.prepare(`
    INSERT INTO clients (id, dni, pin_hash, pin_code, first_name, last_name, phone, birth_date, points, total_cuts, notes, member_since, created_at)
    VALUES (?, ?, ?, NULL, ?, ?, ?, ?, 0, 0, '', ?, ?)
  `).run(
    id,
    cleanDni,
    hashPassword(cleanPin, 10),
    firstName.trim(),
    lastName.trim(),
    phone.trim(),
    birthDate || '',
    memberSince,
    Date.now()
  );

  const newRow = db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
  const token = signToken({ role: 'client', dni: newRow.dni, clientId: newRow.id });

  res.status(201).json({
    success: true,
    token,
    client: formatClient(newRow),
    appointments: []
  });
});

// Configuración inicial de PIN para cliente presencial
app.post('/api/clients/setup-pin', clientAuthLimiter, (req, res) => {
  const { dni, last4Phone, newPin } = req.body;
  const cleanDni = (dni || '').trim().replace(/\D/g, '');
  const cleanPin = (newPin || '').trim().replace(/\D/g, '');

  const row = db.prepare('SELECT * FROM clients WHERE dni = ?').get(cleanDni);
  if (!row) return res.status(404).json({ error: 'Cliente no encontrado' });

  if (row.pin_hash) {
    return res.status(403).json({
      error: 'El cliente ya posee un PIN de seguridad configurado. El blanqueo de PIN solo lo puede realizar David desde el panel de administración.'
    });
  }

  const clientPhoneDigits = (row.phone || '').replace(/\D/g, '');
  if (clientPhoneDigits.slice(-4) !== (last4Phone || '').trim()) {
    return res.status(401).json({ error: 'Los últimos 4 números del celular no coinciden' });
  }
  if (cleanPin.length !== 4) {
    return res.status(400).json({ error: 'El PIN debe tener exactamente 4 números' });
  }

  db.prepare('UPDATE clients SET pin_hash = ?, pin_code = NULL WHERE dni = ?').run(
    hashPassword(cleanPin, 10),
    cleanDni
  );

  const updated = db.prepare('SELECT * FROM clients WHERE dni = ?').get(cleanDni);
  const token = signToken({ role: 'client', dni: updated.dni, clientId: updated.id });
  const appointments = db
    .prepare('SELECT * FROM appointments WHERE dni = ? ORDER BY created_at DESC LIMIT 20')
    .all(updated.dni)
    .map(formatAppointment);

  res.json({
    success: true,
    token,
    client: formatClient(updated),
    appointments
  });
});

// Sesión actual del cliente
app.get('/api/clients/me', (req, res) => {
  checkExpiredAppointments();
  const session = getOptionalClient(req);
  if (!session) {
    return res.status(401).json({ error: 'Sesión no iniciada' });
  }

  const row = db.prepare('SELECT * FROM clients WHERE dni = ?').get(session.dni);
  if (!row) {
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }

  const appointments = db
    .prepare('SELECT * FROM appointments WHERE dni = ? ORDER BY created_at DESC LIMIT 20')
    .all(row.dni)
    .map(formatAppointment);

  res.json({
    client: formatClient(row),
    appointments
  });
});

// Actualizar datos propios del cliente
app.put('/api/clients/me', (req, res) => {
  const session = getOptionalClient(req);
  if (!session) return res.status(401).json({ error: 'No autorizado' });

  const { phone, birthDate, newPin } = req.body;
  const row = db.prepare('SELECT * FROM clients WHERE dni = ?').get(session.dni);
  if (!row) return res.status(404).json({ error: 'No encontrado' });

  const updatedPhone = phone ? phone.trim() : row.phone;
  const updatedBirth = birthDate !== undefined ? birthDate : row.birth_date;

  if (newPin && String(newPin).trim().length === 4) {
    const cleanPin = String(newPin).trim();
    db.prepare('UPDATE clients SET phone = ?, birth_date = ?, pin_hash = ?, pin_code = NULL WHERE dni = ?').run(
      updatedPhone,
      updatedBirth,
      hashPassword(cleanPin, 10),
      session.dni
    );
  } else {
    db.prepare('UPDATE clients SET phone = ?, birth_date = ? WHERE dni = ?').run(
      updatedPhone,
      updatedBirth,
      session.dni
    );
  }

  const updated = db.prepare('SELECT * FROM clients WHERE dni = ?').get(session.dni);
  res.json({ success: true, client: formatClient(updated) });
});

// Enlace de recuperación de PIN por WhatsApp
app.post('/api/clients/recovery-link', (req, res) => {
  const { dni } = req.body;
  const cleanDni = (dni || '').trim().replace(/\D/g, '');
  const config = getConfigObject();
  const davidPhone = formatWhatsAppPhone(config.whatsappPhone);
  const msg = `Hola David! Me olvidé mi PIN de 4 dígitos para entrar a la web de turnos. Mi DNI es ${cleanDni}. ¿Me lo podés recordar o blanquear?`;
  const whatsappUrl = `https://wa.me/${davidPhone}?text=${encodeURIComponent(msg)}`;
  res.json({ whatsappUrl, message: msg });
});

// ============================================================================
// 3. BOOKING & WHATSAPP HANDSHAKE ENDPOINTS (CONCURRENCIA ATÓMICA + TIMEZONES)
// ============================================================================

app.get('/api/appointments/busy-slots', (req, res) => {
  checkExpiredAppointments();
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'Falta fecha' });

  const config = getConfigObject();
  const { workingDays, disabledSlots } = getScheduleForDate(config, date);

  // Día de la semana en horario argentino
  const dayOfWeek = getArgentinaDayOfWeek(date);

  const now = Date.now();
  const activeApts = db
    .prepare(`
      SELECT a.time, a.status, COALESCE(a.hold_expires_at, a.expires_at) as expires_at, COALESCE(s.duration, 45) as duration
      FROM appointments a
      LEFT JOIN services s ON a.service_id = s.id
      WHERE a.date = ? AND (a.status = 'confirmado' OR (a.status = 'pendiente' AND COALESCE(a.hold_expires_at, a.expires_at) > ?))
    `)
    .all(date, now);

  const blockedRows = db
    .prepare('SELECT time, reason FROM blocked_slots WHERE date = ?')
    .all(date);

  const isDayBlocked = blockedRows.some(b => b.time === 'ALL');
  const isWorkingDay = workingDays.includes(dayOfWeek);
  const isDayClosed = isDayBlocked || !isWorkingDay;
  const closedReason = isDayBlocked
    ? (blockedRows.find(b => b.time === 'ALL')?.reason || 'Día cerrado')
    : (!isWorkingDay ? 'David no atiende en este día de la semana' : null);

  const occupiedSlots = new Set();
  for (const apt of activeApts) {
    const aptStart = timeToMinutes(apt.time);
    const aptEnd = aptStart + (apt.duration || 45);
    for (const slot of VALID_COMMERCIAL_SLOTS) {
      const slotStart = timeToMinutes(slot);
      const slotEnd = slotStart + 45;
      if (slotStart < aptEnd && aptStart < slotEnd) {
        occupiedSlots.add(slot);
      }
    }
  }

  for (const b of blockedRows) {
    if (b.time !== 'ALL') occupiedSlots.add(b.time);
  }
  for (const ds of disabledSlots) {
    occupiedSlots.add(ds);
  }

  // Filtrar horarios que ya transcurrieron hoy en horario de Argentina
  const todayStr = getArgentinaDateString();
  if (date === todayStr) {
    const currentMinutes = getArgentinaMinutesOfDay();
    for (const slot of VALID_COMMERCIAL_SLOTS) {
      if (timeToMinutes(slot) <= currentMinutes + 15) {
        occupiedSlots.add(slot);
      }
    }
  }

  res.json({
    date,
    busySlots: Array.from(occupiedSlots),
    isDayClosed,
    closedReason,
    disabledSlots
  });
});

// Reserva atómica de turno con Hold de 15 min y protección con BEGIN IMMEDIATE
app.post('/api/appointments/request', appointmentBookingLimiter, (req, res) => {
  checkExpiredAppointments();
  const session = getOptionalClient(req);
  if (!session) {
    return res.status(401).json({
      error: 'Tu sesión expiró. Ingresá con tu DNI y PIN de 4 dígitos para reservar.'
    });
  }

  const { serviceId, selectedDrink, date, time } = req.body;
  if (!serviceId || !date || !time) {
    return res.status(400).json({ error: 'Seleccioná servicio, fecha y horario' });
  }

  if (!VALID_COMMERCIAL_SLOTS.includes(time)) {
    return res.status(400).json({
      error: 'Horario comercial inválido. Elegí uno de los horarios habilitados del estudio.'
    });
  }

  // Normalización temporal contra zona horaria Argentina (GMT-3)
  const slotTimestamp = argentinaSlotToUtcTimestamp(date, time);
  const now = Date.now();
  if (isNaN(slotTimestamp) || slotTimestamp < now + 15 * 60 * 1000) {
    return res.status(400).json({
      error: 'La fecha y horario seleccionados deben ser posteriores al momento actual (mínimo 15 minutos de antelación).'
    });
  }

  const clientRow = db.prepare('SELECT * FROM clients WHERE dni = ?').get(session.dni);
  if (!clientRow) {
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }

  // Límite de cancelaciones/expiraciones en 24h
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const recentAbusiveCancels = db.prepare(`
    SELECT COUNT(*) as count FROM appointments
    WHERE dni = ? AND status IN ('cancelado', 'expirado') AND created_at > ?
  `).get(clientRow.dni, oneDayAgo)?.count || 0;

  if (recentAbusiveCancels >= 3) {
    return res.status(429).json({
      error: 'Has alcanzado el límite de cancelaciones web en las últimas 24 horas. Para solicitar un nuevo turno, comunicate directamente con David por WhatsApp.'
    });
  }

  const config = getConfigObject();
  const { workingDays, disabledSlots } = getScheduleForDate(config, date);

  const dayOfWeek = getArgentinaDayOfWeek(date);
  if (!workingDays.includes(dayOfWeek)) {
    return res.status(409).json({
      error: 'David no atiende en ese día de la semana. Por favor elegí una fecha laboral.'
    });
  }

  if (disabledSlots.includes(time)) {
    return res.status(409).json({
      error: 'Ese horario ha sido retirado de los turnos disponibles por David.'
    });
  }

  const serviceRow = db.prepare('SELECT * FROM services WHERE id = ?').get(serviceId);
  if (!serviceRow) {
    return res.status(404).json({ error: 'Servicio no válido' });
  }

  const requestedDuration = Number(serviceRow.duration) || 45;
  const newStartMin = timeToMinutes(time);
  const newEndMin = newStartMin + requestedDuration;

  if (newEndMin > 1200) {
    return res.status(409).json({
      error: 'La duración de este servicio excede el horario de cierre del estudio (20:00 hs). Por favor seleccioná un horario anterior.'
    });
  }

  const holdMinutes = Number(config.holdDurationMinutes) || 15;
  const code = generate4DigitCode();
  const holdExpiresAt = now + holdMinutes * 60 * 1000;
  const aptId = `apt_${now}_${code}`;
  const fullName = `${clientRow.first_name} ${clientRow.last_name}`.trim();

  // INICIO DE TRANSACCIÓN ATÓMICA BEGIN IMMEDIATE (Exclusión mutua en escrituras SQLite)
  db.exec('BEGIN IMMEDIATE;');
  try {
    // 1. Verificar si el slot está bloqueado
    const blocked = db
      .prepare("SELECT * FROM blocked_slots WHERE date = ? AND (time = 'ALL' OR time = ?)")
      .get(date, time);
    if (blocked) {
      db.exec('ROLLBACK;');
      return res.status(409).json({
        error: 'Este horario no se encuentra disponible en la agenda de David.'
      });
    }

    // 2. Verificar solapamiento con turnos activos bajo lock inmediato
    const activeAppointmentsOnDate = db.prepare(`
      SELECT a.id, a.time, COALESCE(s.duration, 45) as duration
      FROM appointments a
      LEFT JOIN services s ON a.service_id = s.id
      WHERE a.date = ? AND (a.status = 'confirmado' OR (a.status = 'pendiente' AND COALESCE(a.hold_expires_at, a.expires_at) > ?))
    `).all(date, now);

    const hasOverlap = activeAppointmentsOnDate.some(a => {
      const aStart = timeToMinutes(a.time);
      const aEnd = aStart + a.duration;
      return newStartMin < aEnd && aStart < newEndMin;
    });

    if (hasOverlap) {
      db.exec('ROLLBACK;');
      return res.status(409).json({
        error: 'Ese horario o parte de la duración de este servicio se solapa con otro turno reservado. Por favor elegí otro horario disponible.'
      });
    }

    // 3. Impedir que el mismo cliente tenga múltiples turnos en 'pendiente'
    const existingPending = db
      .prepare("SELECT * FROM appointments WHERE dni = ? AND status = 'pendiente' AND COALESCE(hold_expires_at, expires_at) > ?")
      .get(clientRow.dni, now);

    if (existingPending) {
      db.exec('ROLLBACK;');
      return res.status(429).json({
        error: `Ya tenés el turno #${existingPending.code} pendiente de confirmación (${existingPending.date} ${existingPending.time} hs). Confirmalo por WhatsApp o cancelalo antes de pedir otro.`
      });
    }

    // 4. Inserción atómica con columna hold_expires_at
    db.prepare(`
      INSERT INTO appointments (
        id, code, dni, client_name, client_phone, service_id, service_name,
        selected_drink, price, date, time, status, created_at, expires_at, hold_expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente', ?, ?, ?)
    `).run(
      aptId,
      code,
      clientRow.dni,
      fullName,
      clientRow.phone,
      serviceRow.id,
      serviceRow.name,
      serviceRow.drink_included ? (selectedDrink || 'Cerveza') : null,
      serviceRow.price,
      date,
      time,
      now,
      holdExpiresAt,
      holdExpiresAt
    );

    // Confirmar transacción
    db.exec('COMMIT;');
  } catch (err) {
    try { db.exec('ROLLBACK;'); } catch {}
    if (err.message && (err.message.includes('UNIQUE') || err.message.includes('idx_unique_active_slot'))) {
      return res.status(409).json({
        error: 'Ese horario acaba de ser reservado por otro cliente en este mismo instante. Por favor seleccioná otro horario libre.'
      });
    }
    throw err;
  }

  const createdRow = db.prepare('SELECT * FROM appointments WHERE id = ?').get(aptId);
  const davidPhone = formatWhatsAppPhone(config.whatsappPhone);

  const rawMessage = `Hola David! Quiero confirmar mi turno para el ${date} a las ${time} hs. Código de turno: #${code} - Cliente: ${fullName} (DNI: ${clientRow.dni})`;
  const whatsappUrl = `https://wa.me/${davidPhone}?text=${encodeURIComponent(rawMessage)}`;

  res.status(201).json({
    success: true,
    appointment: formatAppointment(createdRow),
    code,
    expiresAt: holdExpiresAt,
    holdDurationMinutes: holdMinutes,
    rawMessage,
    whatsappUrl
  });
});

app.get('/api/appointments/:idOrCode', (req, res) => {
  checkExpiredAppointments();
  const { idOrCode } = req.params;
  const row = db
    .prepare('SELECT * FROM appointments WHERE id = ? OR code = ? ORDER BY created_at DESC LIMIT 1')
    .get(idOrCode, idOrCode);

  if (!row) return res.status(404).json({ error: 'Turno no encontrado' });

  const config = getConfigObject();
  const davidPhone = formatWhatsAppPhone(config.whatsappPhone);
  const rawMessage = `Hola David! Quiero confirmar mi turno para el ${row.date} a las ${row.time} hs. Código de turno: #${row.code} - Cliente: ${row.client_name} (DNI: ${row.dni})`;
  const whatsappUrl = `https://wa.me/${davidPhone}?text=${encodeURIComponent(rawMessage)}`;

  res.json({
    ...formatAppointment(row),
    rawMessage,
    whatsappUrl
  });
});

app.post('/api/appointments/:id/client-cancel', (req, res) => {
  const session = getOptionalClient(req);
  if (!session) return res.status(401).json({ error: 'No autorizado' });

  const row = db.prepare('SELECT * FROM appointments WHERE id = ? AND dni = ?').get(req.params.id, session.dni);
  if (!row) return res.status(404).json({ error: 'Turno no encontrado' });

  if (!['pendiente', 'confirmado'].includes(row.status)) {
    return res.status(400).json({ error: 'Este turno ya no puede cancelarse' });
  }

  const appointmentTime = argentinaSlotToUtcTimestamp(row.date, row.time);
  const now = Date.now();
  const twoHoursMs = 2 * 60 * 60 * 1000;

  if (appointmentTime < now) {
    return res.status(400).json({
      error: 'El horario pautado de este turno ya ha comenzado. Comunicate con David por WhatsApp.'
    });
  }

  if (row.status === 'confirmado' && (appointmentTime - now < twoHoursMs)) {
    return res.status(400).json({
      error: 'Las cancelaciones de turnos confirmados con menos de 2 horas de antelación deben realizarse comunicándote directamente con David por WhatsApp.'
    });
  }

  db.prepare("UPDATE appointments SET status = 'cancelado' WHERE id = ?").run(row.id);
  res.json({ success: true });
});

// ============================================================================
// 4. DAVID ADMIN AUTHENTICATION & PROTECTED OPERATIONS
// ============================================================================

app.post('/api/admin/login', adminLoginLimiter, (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Ingresá usuario o DNI y contraseña' });
  }

  const cleanUser = username.trim().toLowerCase();
  const cleanDni = username.trim().replace(/\D/g, '');
  const adminRow = db.prepare('SELECT * FROM admins WHERE LOWER(username) = ? OR dni = ?').get(cleanUser, cleanDni);

  if (!adminRow || !verifyPassword(password, adminRow.password_hash)) {
    return res.status(401).json({ error: 'Credenciales de administrador incorrectas' });
  }

  // Migración transparente a bcrypt si tenía hash antiguo
  if (!adminRow.password_hash.startsWith('$2')) {
    db.prepare('UPDATE admins SET password_hash = ? WHERE id = ?').run(
      hashPassword(password, 10),
      adminRow.id
    );
  }

  const token = signToken({
    role: 'admin',
    adminId: adminRow.id,
    username: adminRow.username,
    dni: adminRow.dni,
    displayName: adminRow.display_name
  });

  res.json({
    success: true,
    token,
    admin: {
      id: adminRow.id,
      username: adminRow.username,
      dni: adminRow.dni,
      displayName: adminRow.display_name
    }
  });
});

app.get('/api/admin/me', requireAdmin, (req, res) => {
  res.json({ admin: req.admin });
});

app.put('/api/admin/credentials', requireAdmin, (req, res) => {
  const { currentPassword, newUsername, newPassword, newDni } = req.body;
  const adminRow = db.prepare('SELECT * FROM admins WHERE id = ?').get(req.admin.adminId);
  if (!adminRow) return res.status(404).json({ error: 'Admin no encontrado' });

  if (!verifyPassword(currentPassword, adminRow.password_hash)) {
    return res.status(401).json({ error: 'La contraseña actual es incorrecta' });
  }

  const updatedUser = newUsername?.trim() ? newUsername.trim().toLowerCase() : adminRow.username;
  const updatedHash = newPassword?.trim() ? hashPassword(newPassword.trim(), 10) : adminRow.password_hash;
  const updatedDni = newDni?.trim() ? newDni.trim().replace(/\D/g, '') : (adminRow.dni || '11111111');

  db.prepare('UPDATE admins SET username = ?, password_hash = ?, dni = ? WHERE id = ?').run(
    updatedUser,
    updatedHash,
    updatedDni,
    adminRow.id
  );

  res.json({ success: true, username: updatedUser, dni: updatedDni });
});

app.get('/api/admin/dashboard', requireAdmin, (req, res) => {
  checkExpiredAppointments();
  const config = getConfigObject();

  const appointments = db
    .prepare('SELECT * FROM appointments ORDER BY date DESC, time ASC')
    .all()
    .map(formatAppointment);

  const clients = db
    .prepare('SELECT * FROM clients ORDER BY total_cuts DESC, first_name ASC')
    .all()
    .map(formatClient);

  const services = db
    .prepare('SELECT * FROM services ORDER BY sort_order ASC')
    .all()
    .map(formatService);

  const blockedSlots = db
    .prepare('SELECT * FROM blocked_slots ORDER BY date ASC, time ASC')
    .all();

  const payments = db
    .prepare('SELECT * FROM payments ORDER BY created_at DESC LIMIT 100')
    .all();

  // Cumpleaños basados en fecha actual argentina
  const todayParts = getArgentinaDateString().split('-');
  const currentMonth = parseInt(todayParts[1], 10);
  const currentDay = parseInt(todayParts[2], 10);

  const thisMonth = [];
  const thisWeek = [];

  for (const c of clients) {
    if (c.birthDate && c.birthDate.length >= 8) {
      const parts = c.birthDate.split('-');
      if (parts.length >= 3) {
        const bMonth = parseInt(parts[1], 10);
        const bDay = parseInt(parts[2], 10);
        if (bMonth === currentMonth) {
          const dayDiff = bDay - currentDay;
          const enriched = {
            ...c,
            birthDay: bDay,
            birthMonth: bMonth,
            daysUntil: dayDiff,
            isToday: dayDiff === 0
          };
          thisMonth.push(enriched);
          if (dayDiff >= -2 && dayDiff <= 7) {
            thisWeek.push(enriched);
          }
        }
      }
    }
  }

  thisWeek.sort((a, b) => a.daysUntil - b.daysUntil);
  thisMonth.sort((a, b) => a.birthDay - b.birthDay);

  res.json({
    config,
    appointments,
    clients,
    services,
    blockedSlots,
    payments,
    birthdays: {
      thisWeek,
      thisMonth
    }
  });
});

app.post('/api/admin/appointments/:id/confirm', requireAdmin, (req, res) => {
  const row = db
    .prepare('SELECT * FROM appointments WHERE id = ? OR code = ?')
    .get(req.params.id, req.params.id);

  if (!row) return res.status(404).json({ error: 'Turno no encontrado' });

  if (row.status !== 'pendiente') {
    return res.status(409).json({
      error: `No se puede confirmar un turno con estado '${row.status}'. Solo se pueden confirmar turnos en estado 'pendiente'.`
    });
  }

  db.prepare('UPDATE appointments SET status = ?, confirmed_at = ? WHERE id = ?').run(
    'confirmado',
    Date.now(),
    row.id
  );

  const updated = db.prepare('SELECT * FROM appointments WHERE id = ?').get(row.id);
  res.json({ success: true, appointment: formatAppointment(updated) });
});

app.post('/api/admin/appointments/:id/complete', requireAdmin, (req, res) => {
  const { paymentMethod, amountPaid, pointsUsed = 0, notes = '' } = req.body;
  if (!paymentMethod) {
    return res.status(400).json({ error: 'Seleccioná el método de pago' });
  }

  const row = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Turno no encontrado' });

  if (row.status !== 'confirmado') {
    return res.status(409).json({
      error: `Solo se pueden cobrar y finalizar turnos en estado 'confirmado' (estado actual: '${row.status}').`
    });
  }

  const now = Date.now();
  const config = getConfigObject();
  const pointsPerCut = Number(config.pointsForFreeCut) || 10;
  const usedPts = paymentMethod === 'Canje de Puntos' ? (Number(pointsUsed) || pointsPerCut) : 0;
  const clientRow = db.prepare('SELECT * FROM clients WHERE dni = ?').get(row.dni);

  if (paymentMethod === 'Canje de Puntos') {
    const availablePts = clientRow?.points || 0;
    if (availablePts < usedPts) {
      return res.status(422).json({
        error: `Saldo de puntos insuficiente para realizar el canje. El cliente posee ${availablePts} PTS y se requieren ${usedPts} PTS.`
      });
    }
  }

  const finalAmount = paymentMethod === 'Canje de Puntos' ? 0 : (amountPaid !== undefined ? Number(amountPaid) : row.price);

  db.exec('BEGIN IMMEDIATE;');
  try {
    if (clientRow) {
      const newTotalCuts = (clientRow.total_cuts || 0) + 1;
      const currentPts = clientRow.points || 0;
      const newPoints = paymentMethod === 'Canje de Puntos'
        ? Math.max(0, currentPts - usedPts + 1)
        : currentPts + 1;

      db.prepare('UPDATE clients SET total_cuts = ?, points = ?, last_visit_date = ? WHERE id = ?').run(
        newTotalCuts,
        newPoints,
        row.date || getArgentinaDateString(),
        clientRow.id
      );
    }

    db.prepare(`
      UPDATE appointments
      SET status = 'finalizado', payment_method = ?, amount_paid = ?, points_used = ?, notes = ?, completed_at = ?
      WHERE id = ?
    `).run(paymentMethod, finalAmount, usedPts, notes, now, row.id);

    db.prepare(`
      INSERT INTO payments (id, appointment_id, code, client_dni, client_name, service_name, payment_method, amount, points_used, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `pay_${now}`,
      row.id,
      row.code,
      row.dni,
      row.client_name,
      row.service_name,
      paymentMethod,
      finalAmount,
      usedPts,
      now
    );

    db.exec('COMMIT;');
  } catch (err) {
    try { db.exec('ROLLBACK;'); } catch {}
    throw err;
  }

  const updatedApt = db.prepare('SELECT * FROM appointments WHERE id = ?').get(row.id);
  const updatedClient = db.prepare('SELECT * FROM clients WHERE dni = ?').get(row.dni);

  res.json({
    success: true,
    appointment: formatAppointment(updatedApt),
    client: formatClient(updatedClient)
  });
});

app.post('/api/admin/appointments/:id/no-show', requireAdmin, (req, res) => {
  const row = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Turno no encontrado' });

  if (row.status === 'finalizado') {
    return res.status(409).json({ error: 'No podés marcar no-show sobre un turno ya cobrado y finalizado' });
  }

  db.prepare("UPDATE appointments SET status = 'no_asistio' WHERE id = ?").run(row.id);
  const updated = db.prepare('SELECT * FROM appointments WHERE id = ?').get(row.id);
  res.json({ success: true, appointment: formatAppointment(updated) });
});

app.post('/api/admin/appointments/:id/cancel', requireAdmin, (req, res) => {
  const row = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Turno no encontrado' });

  if (row.status === 'finalizado') {
    return res.status(409).json({
      error: 'Un turno ya finalizado y cobrado no puede cancelarse directamente. Utilizá la opción de anulación y reembolso para revertir puntos y pagos de forma controlada.'
    });
  }

  db.prepare("UPDATE appointments SET status = 'cancelado' WHERE id = ?").run(row.id);
  const updated = db.prepare('SELECT * FROM appointments WHERE id = ?').get(row.id);
  res.json({ success: true, appointment: formatAppointment(updated) });
});

app.post('/api/admin/appointments/:id/refund', requireAdmin, (req, res) => {
  const { reason = 'Anulación de servicio' } = req.body;
  const row = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Turno no encontrado' });

  if (row.status !== 'finalizado') {
    return res.status(409).json({ error: 'Solo se pueden anular y reembolsar turnos en estado finalizado' });
  }

  const clientRow = db.prepare('SELECT * FROM clients WHERE dni = ?').get(row.dni);
  const now = Date.now();

  db.exec('BEGIN IMMEDIATE;');
  try {
    if (clientRow) {
      let restoredPoints = clientRow.points || 0;
      restoredPoints = Math.max(0, restoredPoints - 1);
      if (row.points_used > 0) {
        restoredPoints += row.points_used;
      }
      const newTotalCuts = Math.max(0, (clientRow.total_cuts || 1) - 1);

      db.prepare('UPDATE clients SET points = ?, total_cuts = ? WHERE id = ?').run(
        restoredPoints,
        newTotalCuts,
        clientRow.id
      );
    }

    if (row.amount_paid && row.amount_paid > 0) {
      db.prepare(`
        INSERT INTO payments (id, appointment_id, code, client_dni, client_name, service_name, payment_method, amount, points_used, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        `ref_${now}`,
        row.id,
        row.code,
        row.dni,
        row.client_name,
        `${row.service_name} (REEMBOLSO: ${reason})`,
        row.payment_method || 'Reembolso',
        -Math.abs(row.amount_paid),
        0,
        now
      );
    }

    db.prepare(`
      UPDATE appointments
      SET status = 'anulado', notes = notes || ?
      WHERE id = ?
    `).run(` [ANULADO: ${reason}]`, row.id);

    db.exec('COMMIT;');
  } catch (err) {
    try { db.exec('ROLLBACK;'); } catch {}
    throw err;
  }

  const updatedApt = db.prepare('SELECT * FROM appointments WHERE id = ?').get(row.id);
  const updatedClient = clientRow ? db.prepare('SELECT * FROM clients WHERE id = ?').get(clientRow.id) : null;

  res.json({
    success: true,
    appointment: formatAppointment(updatedApt),
    client: updatedClient ? formatClient(updatedClient) : null
  });
});

app.post('/api/admin/appointments/manual', requireAdmin, (req, res) => {
  const { dni, firstName, lastName, phone, serviceId, selectedDrink, date, time, pin } = req.body;
  const cleanDni = (dni || '').trim().replace(/\D/g, '');
  if (!cleanDni || !firstName || !serviceId || !date || !time) {
    return res.status(400).json({ error: 'Completá DNI, Nombre, Servicio, Fecha y Hora' });
  }

  let clientRow = db.prepare('SELECT * FROM clients WHERE dni = ?').get(cleanDni);
  if (!clientRow) {
    const id = `c_${Date.now()}`;
    const defaultPin = (pin || '1234').trim();
    db.prepare(`
      INSERT INTO clients (id, dni, pin_hash, pin_code, first_name, last_name, phone, birth_date, points, total_cuts, notes, member_since, created_at)
      VALUES (?, ?, ?, NULL, ?, ?, ?, '', 0, 0, '', ?, ?)
    `).run(
      id,
      cleanDni,
      hashPassword(defaultPin, 10),
      firstName.trim(),
      (lastName || '').trim(),
      (phone || '').trim(),
      getArgentinaDateString(),
      Date.now()
    );
    clientRow = db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
  }

  const serviceRow = db.prepare('SELECT * FROM services WHERE id = ?').get(serviceId);
  const code = generate4DigitCode();
  const now = Date.now();
  const aptId = `apt_${now}_${code}`;
  const fullName = `${clientRow.first_name} ${clientRow.last_name}`.trim();

  db.prepare(`
    INSERT INTO appointments (
      id, code, dni, client_name, client_phone, service_id, service_name,
      selected_drink, price, date, time, status, created_at, confirmed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmado', ?, ?)
  `).run(
    aptId,
    code,
    clientRow.dni,
    fullName,
    clientRow.phone,
    serviceRow ? serviceRow.id : serviceId,
    serviceRow ? serviceRow.name : 'Corte',
    selectedDrink || null,
    serviceRow ? serviceRow.price : 18000,
    date,
    time,
    now,
    now
  );

  const created = db.prepare('SELECT * FROM appointments WHERE id = ?').get(aptId);
  res.status(201).json({ success: true, appointment: formatAppointment(created) });
});

app.post('/api/admin/blocked-slots', requireAdmin, (req, res) => {
  const { date, time, reason } = req.body;
  if (!date || !time) return res.status(400).json({ error: 'Falta fecha u horario' });

  const id = `blk_${Date.now()}`;
  db.prepare('INSERT INTO blocked_slots (id, date, time, reason, created_at) VALUES (?, ?, ?, ?, ?)').run(
    id,
    date,
    time,
    reason || 'Bloqueado por David',
    Date.now()
  );

  let affectedQuery = "SELECT * FROM appointments WHERE date = ? AND status IN ('pendiente', 'confirmado')";
  const params = [date];
  if (time !== 'ALL') {
    affectedQuery += " AND time = ?";
    params.push(time);
  }

  const affectedApts = db.prepare(affectedQuery).all(...params);
  const affectedList = [];

  for (const apt of affectedApts) {
    db.prepare("UPDATE appointments SET status = 'cancelado_por_estudio', notes = notes || ? WHERE id = ?").run(
      ` [CANCELADO POR ESTUDIO: ${reason || 'Imprevisto'}]`,
      apt.id
    );

    const clientPhone = (apt.client_phone || '').replace(/\D/g, '');
    const cancelMsg = `Hola ${apt.client_name}! Te escribe David. Por un motivo de fuerza mayor (${reason || 'imprevisto'}), tuve que cancelar el turno #${apt.code} del ${apt.date} a las ${apt.time} hs. Te pido mil disculpas. Escribime por acá para reprogramar tu atención con prioridad absoluta.`;
    const whatsappUrl = `https://wa.me/${clientPhone}?text=${encodeURIComponent(cancelMsg)}`;

    affectedList.push({
      id: apt.id,
      code: apt.code,
      clientName: apt.client_name,
      phone: apt.client_phone,
      time: apt.time,
      whatsappUrl
    });
  }

  res.status(201).json({
    success: true,
    id,
    affectedCount: affectedList.length,
    affectedAppointments: affectedList
  });
});

app.delete('/api/admin/blocked-slots/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM blocked_slots WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

app.put('/api/admin/clients/:dni', requireAdmin, (req, res) => {
  const { dni } = req.params;
  const {
    firstName,
    lastName,
    phone,
    birthDate,
    points,
    totalCuts,
    notes,
    newPin,
    hairStyle,
    hairTexture,
    preferredProduct,
    preferredDrink,
    lastVisitDate
  } = req.body;

  const row = db.prepare('SELECT * FROM clients WHERE dni = ?').get(dni);
  if (!row) return res.status(404).json({ error: 'Cliente no encontrado' });

  const updatedPinHash = newPin && String(newPin).trim().length === 4
    ? hashPassword(String(newPin).trim(), 10)
    : row.pin_hash;

  db.prepare(`
    UPDATE clients
    SET first_name = ?, last_name = ?, phone = ?, birth_date = ?, points = ?, total_cuts = ?, notes = ?,
        hair_style = ?, hair_texture = ?, preferred_product = ?, preferred_drink = ?, last_visit_date = ?,
        pin_hash = ?, pin_code = NULL
    WHERE dni = ?
  `).run(
    firstName !== undefined ? firstName.trim() : row.first_name,
    lastName !== undefined ? lastName.trim() : row.last_name,
    phone !== undefined ? phone.trim() : row.phone,
    birthDate !== undefined ? birthDate : row.birth_date,
    points !== undefined ? Number(points) : row.points,
    totalCuts !== undefined ? Number(totalCuts) : row.total_cuts,
    notes !== undefined ? notes : row.notes,
    hairStyle !== undefined ? hairStyle.trim() : (row.hair_style || ''),
    hairTexture !== undefined ? hairTexture.trim() : (row.hair_texture || ''),
    preferredProduct !== undefined ? preferredProduct.trim() : (row.preferred_product || ''),
    preferredDrink !== undefined ? preferredDrink.trim() : (row.preferred_drink || ''),
    lastVisitDate !== undefined ? lastVisitDate : (row.last_visit_date || ''),
    updatedPinHash,
    dni
  );

  const updated = db.prepare('SELECT * FROM clients WHERE dni = ?').get(dni);
  res.json({ success: true, client: formatClient(updated) });
});

app.put('/api/admin/services/:id', requireAdmin, (req, res) => {
  const { name, tagline, price, duration, drinkIncluded, includes, badge } = req.body;
  const row = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Servicio no encontrado' });

  db.prepare(`
    UPDATE services
    SET name = ?, tagline = ?, price = ?, duration = ?, drink_included = ?, includes_json = ?, badge = ?
    WHERE id = ?
  `).run(
    name !== undefined ? name : row.name,
    tagline !== undefined ? tagline : row.tagline,
    price !== undefined ? Number(price) : row.price,
    duration !== undefined ? Number(duration) : row.duration,
    drinkIncluded !== undefined ? (drinkIncluded ? 1 : 0) : row.drink_included,
    includes !== undefined ? JSON.stringify(includes) : row.includes_json,
    badge !== undefined ? badge : row.badge,
    row.id
  );

  const updated = db.prepare('SELECT * FROM services WHERE id = ?').get(row.id);
  res.json({ success: true, service: formatService(updated) });
});

app.put('/api/admin/config', requireAdmin, (req, res) => {
  const updated = updateConfigObject(req.body);
  res.json({ success: true, config: updated });
});

// ============================================================================
// 5. MANEJO GLOBAL DE ERRORES Y RUTAS NO ENCONTRADAS
// ============================================================================

// Manejo de 404 para endpoints de API
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada en la API' });
});

// Middleware global de manejo de errores (Nunca expone el stack trace en producción)
app.use((err, req, res, next) => {
  console.error(`[SERVER ERROR] ${req.method} ${req.originalUrl}:`, err);

  const statusCode = err.status || err.statusCode || (err.message && err.message.includes('CORS') ? 403 : 500);
  const response = {
    error: (IS_PROD && statusCode === 500)
      ? 'Ocurrió un error interno en el servidor. Por favor intente más tarde.'
      : (err.message || 'Error interno del servidor')
  };

  res.status(statusCode).json(response);
});

// ============================================================================
// 6. INICIO DE SERVIDOR Y APAGADO SEGURO (GRACEFUL SHUTDOWN)
// ============================================================================

const server = app.listen(PORT, () => {
  console.log(`🚀 ULTRA BARBER Studio Hardened SQLite Server running on http://localhost:${PORT}`);
});

function gracefulShutdown(signal) {
  console.log(`\nRecibida señal ${signal}. Cerrando conexiones de forma segura...`);
  server.close(() => {
    console.log('Servidor HTTP cerrado.');
    try {
      db.close();
      console.log('Conexión SQLite cerrada limpiamente.');
    } catch (e) {
      console.error('Error al cerrar SQLite:', e);
    }
    process.exit(0);
  });
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
