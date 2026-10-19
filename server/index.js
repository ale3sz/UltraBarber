import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  db,
  initDatabase,
  hashSecret,
  signToken,
  verifyToken,
  getConfigObject,
  updateConfigObject
} from './db.js';

initDatabase();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 7201;

app.use(cors());
app.use(express.json());
app.use('/imagenes', express.static(path.join(__dirname, '..', 'imagenes')));

// Helper: Format DB client row to camelCase
function formatClient(row, includeSensitivePin = false) {
  if (!row) return null;
  const formatted = {
    id: row.id,
    dni: row.dni,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    birthDate: row.birth_date || '',
    points: row.points || 0,
    totalCuts: row.total_cuts || 0,
    notes: row.notes || '',
    memberSince: row.member_since,
    hasPin: Boolean(row.pin_hash)
  };
  if (includeSensitivePin) {
    formatted.pinCode = row.pin_code || '1234';
  }
  return formatted;
}

function getLocalDateString(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper: Format DB appointment row to camelCase
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
    expiresAt: row.expires_at,
    confirmedAt: row.confirmed_at,
    completedAt: row.completed_at
  };
}

// Helper: Format DB service row
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
    active: Boolean(row.active)
  };
}

// Background worker: auto-expire pending appointments after 15 minutes
export function checkExpiredAppointments() {
  const now = Date.now();
  const stmt = db.prepare(`
    UPDATE appointments
    SET status = 'expirado'
    WHERE status = 'pendiente' AND expires_at IS NOT NULL AND expires_at < ?
  `);
  stmt.run(now);
}

setInterval(checkExpiredAppointments, 5000);

// Generate unique 4-digit code
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

// Auth Middlewares
function getBearerToken(req) {
  const auth = req.headers.authorization || '';
  if (auth.startsWith('Bearer ')) return auth.slice(7).trim();
  return null;
}

function requireAdmin(req, res, next) {
  const token = getBearerToken(req);
  const payload = verifyToken(token);
  if (!payload || payload.role !== 'admin') {
    return res.status(401).json({ error: 'Acceso restringido. Iniciá sesión como David (Administrador).' });
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
// 2. CLIENT AUTHENTICATION & ANTI-IMPERSONATION (DNI + 4-DIGIT PIN)
// ============================================================================

// Step 1: Check DNI safely (NEVER leaks private data without PIN!)
app.get('/api/clients/check/:dni', (req, res) => {
  const cleanDni = (req.params.dni || '').trim().replace(/\D/g, '');
  const rawParam = (req.params.dni || '').trim().toLowerCase();

  // 1. Check if DNI or username belongs to David (Admin)
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
    console.error('Error checking admin DNI:', err);
  }

  if (!cleanDni || cleanDni.length < 6) {
    return res.status(400).json({ error: 'Ingresá un DNI válido (mínimo 6 números)' });
  }

  const row = db.prepare('SELECT * FROM clients WHERE dni = ?').get(cleanDni);
  if (!row) {
    return res.json({ exists: false, dni: cleanDni });
  }

  // Mask name and phone so strangers cannot spy on other people's data
  const maskedLastName = row.last_name ? `${row.last_name.charAt(0)}.` : '';
  const cleanPhone = (row.phone || '').replace(/\D/g, '');
  const last4Phone = cleanPhone.slice(-4);

  res.json({
    exists: true,
    dni: cleanDni,
    hasPin: Boolean(row.pin_hash),
    maskedName: `${row.first_name} ${maskedLastName}`,
    phoneHint: last4Phone ? `terminado en ***${last4Phone}` : ''
  });
});

// Step 2A: Login with DNI + 4-digit PIN
app.post('/api/clients/login', (req, res) => {
  const { dni, pin } = req.body;
  const cleanDni = (dni || '').trim().replace(/\D/g, '');
  const cleanPin = (pin || '').trim();

  if (!cleanDni || !cleanPin) {
    return res.status(400).json({ error: 'Ingresá tu DNI y tu PIN de 4 dígitos' });
  }

  const row = db.prepare('SELECT * FROM clients WHERE dni = ?').get(cleanDni);
  if (!row) {
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }

  if (row.pin_hash !== hashSecret(cleanPin)) {
    return res.status(401).json({
      error: 'PIN incorrecto. Si sos vos y te olvidaste el PIN, tocá "Olvidé mi PIN" para recuperarlo por WhatsApp.'
    });
  }

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

// Step 2B: Register new client with DNI + Data + 4-digit PIN
app.post('/api/clients/register', (req, res) => {
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
  const memberSince = getLocalDateString();

  db.prepare(`
    INSERT INTO clients (id, dni, pin_hash, pin_code, first_name, last_name, phone, birth_date, points, total_cuts, notes, member_since, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, '', ?, ?)
  `).run(
    id,
    cleanDni,
    hashSecret(cleanPin),
    cleanPin,
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

// Step 2C: Set initial PIN for a walk-in client created by David (verifying last 4 digits of phone)
app.post('/api/clients/setup-pin', (req, res) => {
  const { dni, last4Phone, newPin } = req.body;
  const cleanDni = (dni || '').trim().replace(/\D/g, '');
  const cleanPin = (newPin || '').trim().replace(/\D/g, '');

  const row = db.prepare('SELECT * FROM clients WHERE dni = ?').get(cleanDni);
  if (!row) return res.status(404).json({ error: 'Cliente no encontrado' });

  const clientPhoneDigits = (row.phone || '').replace(/\D/g, '');
  if (clientPhoneDigits.slice(-4) !== (last4Phone || '').trim()) {
    return res.status(401).json({ error: 'Los últimos 4 números del celular no coinciden' });
  }
  if (cleanPin.length !== 4) {
    return res.status(400).json({ error: 'El PIN debe tener exactamente 4 números' });
  }

  db.prepare('UPDATE clients SET pin_hash = ?, pin_code = ? WHERE dni = ?').run(
    hashSecret(cleanPin),
    cleanPin,
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

// Get logged-in client session profile & appointments
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

// Update client profile (authenticated client)
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
    db.prepare('UPDATE clients SET phone = ?, birth_date = ?, pin_hash = ?, pin_code = ? WHERE dni = ?').run(
      updatedPhone,
      updatedBirth,
      hashSecret(cleanPin),
      cleanPin,
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

// Helper to ensure Argentina WhatsApp numbers (like 3413762115) have 549 prefix for wa.me
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

// PIN recovery via WhatsApp link
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
// 3. BOOKING & WHATSAPP HANDSHAKE ENDPOINTS
// ============================================================================

// Helper to calculate ISO Week Key (e.g. "2026-W42")
function getIsoWeekKey(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
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

app.get('/api/appointments/busy-slots', (req, res) => {
  checkExpiredAppointments();
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'Falta fecha' });

  const config = getConfigObject();
  const { workingDays, disabledSlots } = getScheduleForDate(config, date);

  // Verificar si el día de la semana está habilitado en la configuración de David para esa semana
  const dateObj = new Date(date + 'T12:00:00');
  const dayOfWeek = dateObj.getDay(); // 0: Dom, 1: Lun, etc.

  const now = Date.now();
  const activeApts = db
    .prepare(`
      SELECT time, status, expires_at FROM appointments
      WHERE date = ? AND (status = 'confirmado' OR (status = 'pendiente' AND expires_at > ?))
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

  const busySlots = [
    ...activeApts.map(a => a.time),
    ...blockedRows.filter(b => b.time !== 'ALL').map(b => b.time),
    ...disabledSlots
  ];

  res.json({
    date,
    busySlots: Array.from(new Set(busySlots)),
    isDayClosed,
    closedReason,
    disabledSlots
  });
});

// Request Appointment (Requires Authenticated Client Session)
app.post('/api/appointments/request', (req, res) => {
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

  const clientRow = db.prepare('SELECT * FROM clients WHERE dni = ?').get(session.dni);
  if (!clientRow) {
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }

  const now = Date.now();

  const config = getConfigObject();
  const { workingDays, disabledSlots } = getScheduleForDate(config, date);

  const dateObj = new Date(date + 'T12:00:00');
  const dayOfWeek = dateObj.getDay();
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

  // Check if day or slot is blocked by David
  const blocked = db
    .prepare("SELECT * FROM blocked_slots WHERE date = ? AND (time = 'ALL' OR time = ?)")
    .get(date, time);
  if (blocked) {
    return res.status(409).json({
      error: 'Este horario no se encuentra disponible en la agenda de David.'
    });
  }

  // Check if slot is already taken
  const occupied = db
    .prepare(`
      SELECT id FROM appointments
      WHERE date = ? AND time = ? AND (status = 'confirmado' OR (status = 'pendiente' AND expires_at > ?))
    `)
    .get(date, time, now);

  if (occupied) {
    return res.status(409).json({
      error: 'Ese horario acaba de ser tomado o está bloqueado en confirmación. Elegí otro horario libre.'
    });
  }

  // Anti-spam check: prevent client from locking multiple slots simultaneously
  const existingPending = db
    .prepare("SELECT * FROM appointments WHERE dni = ? AND status = 'pendiente' AND expires_at > ?")
    .get(clientRow.dni, now);

  if (existingPending) {
    return res.status(429).json({
      error: `Ya tenés el turno #${existingPending.code} pendiente de confirmación (${existingPending.date} ${existingPending.time} hs). Confirmalo por WhatsApp o cancelalo antes de pedir otro.`
    });
  }

  const serviceRow = db.prepare('SELECT * FROM services WHERE id = ?').get(serviceId);
  if (!serviceRow) {
    return res.status(404).json({ error: 'Servicio no válido' });
  }

  const holdMinutes = Number(config.holdDurationMinutes) || 15;
  const code = generate4DigitCode();
  const expiresAt = now + holdMinutes * 60 * 1000;
  const aptId = `apt_${now}_${code}`;
  const fullName = `${clientRow.first_name} ${clientRow.last_name}`;

  db.prepare(`
    INSERT INTO appointments (
      id, code, dni, client_name, client_phone, service_id, service_name,
      selected_drink, price, date, time, status, created_at, expires_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente', ?, ?)
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
    expiresAt
  );

  const createdRow = db.prepare('SELECT * FROM appointments WHERE id = ?').get(aptId);
  const davidPhone = formatWhatsAppPhone(config.whatsappPhone);

  // Exact required WhatsApp message:
  const rawMessage = `Hola David! Quiero confirmar mi turno para el ${date} a las ${time} hs. Código de turno: #${code} - Cliente: ${fullName} (DNI: ${clientRow.dni})`;
  const whatsappUrl = `https://wa.me/${davidPhone}?text=${encodeURIComponent(rawMessage)}`;

  res.status(201).json({
    success: true,
    appointment: formatAppointment(createdRow),
    code,
    expiresAt,
    holdDurationMinutes: holdMinutes,
    rawMessage,
    whatsappUrl
  });
});

// Live status polling for an appointment
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

// Client cancels their own turn
app.post('/api/appointments/:id/client-cancel', (req, res) => {
  const session = getOptionalClient(req);
  if (!session) return res.status(401).json({ error: 'No autorizado' });

  const row = db.prepare('SELECT * FROM appointments WHERE id = ? AND dni = ?').get(req.params.id, session.dni);
  if (!row) return res.status(404).json({ error: 'Turno no encontrado' });

  if (!['pendiente', 'confirmado'].includes(row.status)) {
    return res.status(400).json({ error: 'Este turno ya no puede cancelarse' });
  }

  db.prepare("UPDATE appointments SET status = 'cancelado' WHERE id = ?").run(row.id);
  res.json({ success: true });
});

// ============================================================================
// 4. DAVID ADMIN AUTHENTICATION & PROTECTED OPERATIONS
// ============================================================================

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Ingresá usuario o DNI y contraseña' });
  }

  const cleanUser = username.trim().toLowerCase();
  const cleanDni = username.trim().replace(/\D/g, '');
  const adminRow = db.prepare('SELECT * FROM admins WHERE LOWER(username) = ? OR dni = ?').get(cleanUser, cleanDni);

  if (!adminRow || adminRow.password_hash !== hashSecret(password)) {
    return res.status(401).json({ error: 'Contraseña de administrador incorrecta' });
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

  if (adminRow.password_hash !== hashSecret(currentPassword)) {
    return res.status(401).json({ error: 'La contraseña actual es incorrecta' });
  }

  const updatedUser = newUsername?.trim() ? newUsername.trim().toLowerCase() : adminRow.username;
  const updatedHash = newPassword?.trim() ? hashSecret(newPassword.trim()) : adminRow.password_hash;
  const updatedDni = newDni?.trim() ? newDni.trim().replace(/\D/g, '') : (adminRow.dni || '11111111');

  db.prepare('UPDATE admins SET username = ?, password_hash = ?, dni = ? WHERE id = ?').run(
    updatedUser,
    updatedHash,
    updatedDni,
    adminRow.id
  );

  res.json({ success: true, username: updatedUser, dni: updatedDni });
});

// Comprehensive Admin Dashboard Snapshot
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
    .map(r => formatClient(r, true));

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

  // Compute Birthdays (week & month)
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

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

// Confirm Pending Appointment
app.post('/api/admin/appointments/:id/confirm', requireAdmin, (req, res) => {
  const row = db
    .prepare('SELECT * FROM appointments WHERE id = ? OR code = ?')
    .get(req.params.id, req.params.id);

  if (!row) return res.status(404).json({ error: 'Turno no encontrado' });

  db.prepare('UPDATE appointments SET status = ?, confirmed_at = ? WHERE id = ?').run(
    'confirmado',
    Date.now(),
    row.id
  );

  const updated = db.prepare('SELECT * FROM appointments WHERE id = ?').get(row.id);
  res.json({ success: true, appointment: formatAppointment(updated) });
});

// Complete & Charge Appointment (+1 Cut & +1 Point automatically)
app.post('/api/admin/appointments/:id/complete', requireAdmin, (req, res) => {
  const { paymentMethod, amountPaid, pointsUsed = 0, notes = '' } = req.body;
  if (!paymentMethod) {
    return res.status(400).json({ error: 'Seleccioná el método de pago' });
  }

  const row = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Turno no encontrado' });
  if (row.status === 'finalizado') {
    return res.status(400).json({ error: 'Este turno ya fue cobrado y finalizado' });
  }

  const now = Date.now();
  const finalAmount = paymentMethod === 'Canje de Puntos' ? 0 : (amountPaid !== undefined ? Number(amountPaid) : row.price);
  const config = getConfigObject();
  const pointsPerCut = Number(config.pointsForFreeCut) || 10;
  const usedPts = paymentMethod === 'Canje de Puntos' ? (Number(pointsUsed) || pointsPerCut) : 0;

  // Update client points and total cuts
  const clientRow = db.prepare('SELECT * FROM clients WHERE dni = ?').get(row.dni);
  if (clientRow) {
    const newTotalCuts = (clientRow.total_cuts || 0) + 1;
    const currentPts = clientRow.points || 0;
    const newPoints = paymentMethod === 'Canje de Puntos'
      ? Math.max(0, currentPts - usedPts + 1)
      : currentPts + 1;

    db.prepare('UPDATE clients SET total_cuts = ?, points = ? WHERE id = ?').run(
      newTotalCuts,
      newPoints,
      clientRow.id
    );
  }

  // Update appointment
  db.prepare(`
    UPDATE appointments
    SET status = 'finalizado', payment_method = ?, amount_paid = ?, points_used = ?, notes = ?, completed_at = ?
    WHERE id = ?
  `).run(paymentMethod, finalAmount, usedPts, notes, now, row.id);

  // Record payment in history
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

  const updatedApt = db.prepare('SELECT * FROM appointments WHERE id = ?').get(row.id);
  const updatedClient = db.prepare('SELECT * FROM clients WHERE dni = ?').get(row.dni);

  res.json({
    success: true,
    appointment: formatAppointment(updatedApt),
    client: formatClient(updatedClient, true)
  });
});

// Mark No-Show (Cancels without adding points)
app.post('/api/admin/appointments/:id/no-show', requireAdmin, (req, res) => {
  const row = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Turno no encontrado' });

  db.prepare("UPDATE appointments SET status = 'no_asistio' WHERE id = ?").run(row.id);
  const updated = db.prepare('SELECT * FROM appointments WHERE id = ?').get(row.id);
  res.json({ success: true, appointment: formatAppointment(updated) });
});

// Cancel Appointment
app.post('/api/admin/appointments/:id/cancel', requireAdmin, (req, res) => {
  const row = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Turno no encontrado' });

  db.prepare("UPDATE appointments SET status = 'cancelado' WHERE id = ?").run(row.id);
  const updated = db.prepare('SELECT * FROM appointments WHERE id = ?').get(row.id);
  res.json({ success: true, appointment: formatAppointment(updated) });
});

// Manual Appointment Creation by David (Walk-in / WhatsApp direct booking)
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
      VALUES (?, ?, ?, ?, ?, ?, ?, '', 0, 0, '', ?, ?)
    `).run(
      id,
      cleanDni,
      hashSecret(defaultPin),
      defaultPin,
      firstName.trim(),
      (lastName || '').trim(),
      (phone || '').trim(),
      getLocalDateString(),
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

// Block / Unblock Time Slots or Full Days
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

  res.status(201).json({ success: true, id });
});

app.delete('/api/admin/blocked-slots/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM blocked_slots WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Update Client from Admin (Notes, Points, Reset PIN, Phone, Birthdate)
app.put('/api/admin/clients/:dni', requireAdmin, (req, res) => {
  const { dni } = req.params;
  const { firstName, lastName, phone, birthDate, points, totalCuts, notes, newPin } = req.body;

  const row = db.prepare('SELECT * FROM clients WHERE dni = ?').get(dni);
  if (!row) return res.status(404).json({ error: 'Cliente no encontrado' });

  const updatedPinHash = newPin && String(newPin).trim().length === 4
    ? hashSecret(String(newPin).trim())
    : row.pin_hash;
  const updatedPinCode = newPin && String(newPin).trim().length === 4
    ? String(newPin).trim()
    : row.pin_code;

  db.prepare(`
    UPDATE clients
    SET first_name = ?, last_name = ?, phone = ?, birth_date = ?, points = ?, total_cuts = ?, notes = ?, pin_hash = ?, pin_code = ?
    WHERE dni = ?
  `).run(
    firstName !== undefined ? firstName.trim() : row.first_name,
    lastName !== undefined ? lastName.trim() : row.last_name,
    phone !== undefined ? phone.trim() : row.phone,
    birthDate !== undefined ? birthDate : row.birth_date,
    points !== undefined ? Number(points) : row.points,
    totalCuts !== undefined ? Number(totalCuts) : row.total_cuts,
    notes !== undefined ? notes : row.notes,
    updatedPinHash,
    updatedPinCode,
    dni
  );

  const updated = db.prepare('SELECT * FROM clients WHERE dni = ?').get(dni);
  res.json({ success: true, client: formatClient(updated, true) });
});

// Update Service Price / Details from Admin
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

// Update Studio Config from Admin
app.put('/api/admin/config', requireAdmin, (req, res) => {
  const updated = updateConfigObject(req.body);
  res.json({ success: true, config: updated });
});

app.listen(PORT, () => {
  console.log(`🚀 ULTRA BARBER Studio SQLite Server running on http://localhost:${PORT}`);
});
