import 'dotenv/config';
import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_FILE = path.join(DATA_DIR, 'barberfade.sqlite');
export const db = new DatabaseSync(DB_FILE);

// Hardened SQLite PRAGMAs for concurrency and data integrity
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA busy_timeout = 5000;');
db.exec('PRAGMA foreign_keys = ON;');

// Strict Secret Management
const IS_PROD = process.env.NODE_ENV === 'production';
let JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  if (IS_PROD) {
    throw new Error('❌ FATAL: JWT_SECRET no está definido en process.env. En producción es obligatorio definir una clave secreta segura.');
  } else {
    JWT_SECRET = 'david-barber-dev-insecure-secret-change-in-production-2026';
    console.warn('⚠️ ADVERTENCIA DE SEGURIDAD: JWT_SECRET no definido en .env. Usando secreto de desarrollo temporal.');
  }
}

/**
 * Hash seguro de contraseñas y PINes con bcrypt (cost factor >= 10)
 * @param {string|number} plain
 * @param {number} [rounds=10]
 * @returns {string}
 */
export function hashPassword(plain, rounds = 10) {
  return bcrypt.hashSync(String(plain), rounds);
}

/**
 * Verificación segura de contraseñas y PINes con soporte para migración transparente
 * @param {string|number} plain
 * @param {string} hashed
 * @returns {boolean}
 */
export function verifyPassword(plain, hashed) {
  if (!plain || !hashed) return false;
  const strPlain = String(plain);

  // Formato bcrypt estándar ($2a$, $2b$, $2y$)
  if (hashed.startsWith('$2')) {
    return bcrypt.compareSync(strPlain, hashed);
  }

  // Compatibilidad hacia atrás: legacy HMAC-SHA256 para migración sin desconexión
  const legacyHashCurrent = crypto.createHmac('sha256', JWT_SECRET).update(strPlain).digest('hex');
  if (legacyHashCurrent === hashed) {
    return true;
  }

  const legacyHashOld = crypto.createHmac('sha256', 'david-barber-studio-secret-key-2026-botanical').update(strPlain).digest('hex');
  if (legacyHashOld === hashed) {
    return true;
  }

  return false;
}

// Alias para compatibilidad con código existente
export const hashSecret = hashPassword;

/**
 * Genera un token JWT firmado de forma criptográfica
 */
export function signToken(payload, expiresInHours = 24 * 30) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const exp = Date.now() + expiresInHours * 3600 * 1000;
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${signature}`;
}

/**
 * Valida un token JWT con protección estricta contra timing attacks
 */
export function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, sig] = parts;

  const expectedSig = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');

  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);

  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      dni TEXT UNIQUE NOT NULL,
      pin_hash TEXT,
      pin_code TEXT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      birth_date TEXT DEFAULT '',
      points INTEGER DEFAULT 0,
      total_cuts INTEGER DEFAULT 0,
      notes TEXT DEFAULT '',
      member_since TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      tagline TEXT DEFAULT '',
      price INTEGER NOT NULL,
      duration INTEGER NOT NULL,
      points_earned INTEGER DEFAULT 1,
      drink_included INTEGER DEFAULT 0,
      includes_json TEXT NOT NULL,
      image_url TEXT DEFAULT '',
      badge TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      dni TEXT NOT NULL,
      client_name TEXT NOT NULL,
      client_phone TEXT NOT NULL,
      service_id TEXT NOT NULL,
      service_name TEXT NOT NULL,
      selected_drink TEXT,
      price INTEGER NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      status TEXT NOT NULL,
      payment_method TEXT,
      amount_paid INTEGER,
      points_used INTEGER DEFAULT 0,
      notes TEXT DEFAULT '',
      created_at INTEGER NOT NULL,
      expires_at INTEGER,
      hold_expires_at INTEGER,
      confirmed_at INTEGER,
      completed_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS blocked_slots (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      reason TEXT DEFAULT '',
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      appointment_id TEXT,
      code TEXT,
      client_dni TEXT,
      client_name TEXT,
      service_name TEXT,
      payment_method TEXT NOT NULL,
      amount INTEGER NOT NULL,
      points_used INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_slot
    ON appointments(date, time)
    WHERE status IN ('pendiente', 'confirmado');

    CREATE TABLE IF NOT EXISTS login_security (
      identifier TEXT PRIMARY KEY,
      failed_attempts INTEGER DEFAULT 0,
      locked_until INTEGER DEFAULT 0,
      last_attempt INTEGER NOT NULL
    );

        CREATE TABLE IF NOT EXISTS portfolio (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subtitle TEXT,
      category TEXT NOT NULL,
      tag TEXT,
      image_url TEXT NOT NULL,
      service_id TEXT,
      featured INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS redemptions (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      client_id TEXT NOT NULL,
      client_dni TEXT NOT NULL,
      client_name TEXT NOT NULL,
      client_phone TEXT,
      item_id TEXT NOT NULL,
      item_name TEXT NOT NULL,
      points_cost INTEGER NOT NULL,
      status TEXT NOT NULL,
      notes TEXT DEFAULT ' ',
      created_at INTEGER NOT NULL,
      processed_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS points_ledger (
      id TEXT PRIMARY KEY,
      client_dni TEXT NOT NULL,
      delta INTEGER NOT NULL,
      balance_after INTEGER NOT NULL,
      reason TEXT NOT NULL,
      reference_id TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL,
      data_json TEXT,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);

  // Migraciones automáticas de esquema
  try { db.exec("ALTER TABLE clients ADD COLUMN referral_code TEXT;"); } catch {}
  try { db.exec("ALTER TABLE clients ADD COLUMN referred_by_dni TEXT;"); } catch {}
  try { db.exec("ALTER TABLE clients ADD COLUMN no_show_count INTEGER DEFAULT 0;"); } catch {}
  try { db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_referral_code ON clients(referral_code) WHERE referral_code IS NOT NULL;"); } catch {}
  try {
    db.exec("ALTER TABLE admins ADD COLUMN dni TEXT DEFAULT '11111111';");
  } catch {}
  try {
    db.exec("UPDATE admins SET dni = '11111111' WHERE dni IS NULL OR dni = '';");
  } catch {}

  // Migración para hold_expires_at en appointments
  try {
    db.exec("ALTER TABLE appointments ADD COLUMN hold_expires_at INTEGER;");
  } catch {}
  try {
    db.exec("UPDATE appointments SET hold_expires_at = expires_at WHERE hold_expires_at IS NULL AND expires_at IS NOT NULL;");
  } catch {}

  // Hardening: Limpieza obligatoria de PINes en texto plano en la tabla de clientes
  try {
    db.exec("UPDATE clients SET pin_code = NULL WHERE pin_code IS NOT NULL;");
  } catch {}

  // Migración de perfil de cliente
  try { db.exec("ALTER TABLE clients ADD COLUMN hair_style TEXT DEFAULT '';"); } catch {}
  try { db.exec("ALTER TABLE clients ADD COLUMN hair_texture TEXT DEFAULT '';"); } catch {}
  try { db.exec("ALTER TABLE clients ADD COLUMN preferred_product TEXT DEFAULT '';"); } catch {}
  try { db.exec("ALTER TABLE clients ADD COLUMN preferred_drink TEXT DEFAULT '';"); } catch {}
  try { db.exec("ALTER TABLE clients ADD COLUMN last_visit_date TEXT DEFAULT '';"); } catch {}

  // Seed Admin por defecto (David) con bcrypt
  const adminCount = db.prepare('SELECT COUNT(*) as count FROM admins').get().count;
  if (adminCount === 0) {
    db.prepare(
      'INSERT INTO admins (username, password_hash, display_name, dni, created_at) VALUES (?, ?, ?, ?, ?)'
    ).run('david', hashPassword('barber2026', 10), 'David', '11111111', Date.now());
  } else {
    // Si el admin existente usa hash SHA-256 legacy, actualizarlo a bcrypt
    const currentAdmin = db.prepare('SELECT id, password_hash FROM admins WHERE username = ?').get('david');
    if (currentAdmin && !currentAdmin.password_hash.startsWith('$2')) {
      db.prepare('UPDATE admins SET password_hash = ? WHERE id = ?').run(
        hashPassword('barber2026', 10),
        currentAdmin.id
      );
    }
  }

  // Seed Configuración por defecto
  const defaultConfig = {
    barberName: 'David',
    businessName: 'DAVID BARBER',
    barbershopName: 'V.I.P Barberías',
    whatsappPhone: '5493413762115',
    holdDurationMinutes: 15,
    pointsForFreeCut: 10,
    address: 'Eva Perón 52',
    city: 'Capitán Bermúdez',
    locationNote: 'Sillón de David en V.I.P Barberías',
    googleMapsUrl: 'https://maps.app.goo.gl/JK9s2uNjGVHNvEuS8',
    instagram: '@barber_f4de',
    workHours: {
      start: '09:00',
      end: '20:00',
      slotDuration: 45
    },
    workingDays: [1, 2, 3, 4, 5, 6],
    disabledSlots: [],
    weeklySchedule: {},
    drinks: ['Agua mineral', 'Gaseosa', 'Cerveza'],
    clubBenefits: [
      {
        id: 'ben-corte',
        title: 'Corte Bonificado',
        description: 'Acumulando 10 puntos con tus visitas en el sillón',
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
        name: 'Corte Completo',
        pointsCost: 10,
        stock: 99,
        hasStockLimit: false,
        active: true,
        description: 'Canjeá 10 puntos y tu próximo corte es 100% bonificado.'
      },
      {
        id: 'red-pomada',
        name: 'Pomada Matte (50g)',
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

  const insertCfg = db.prepare('INSERT OR IGNORE INTO config (key, value) VALUES (?, ?)');
  for (const [k, v] of Object.entries(defaultConfig)) {
    insertCfg.run(k, JSON.stringify(v));
  }

  // Asegurar que el WhatsApp de David sea el real
  db.prepare("UPDATE config SET value = ? WHERE key = 'whatsappPhone' AND (value = '\"5491123456789\"' OR value = '\"3413762115\"')").run(JSON.stringify('5493413762115'));

  // Asegurar ubicación actual de David en V.I.P Barberías y link de Google Maps
  db.prepare("UPDATE config SET value = ? WHERE key = 'googleMapsUrl'").run(JSON.stringify('https://maps.app.goo.gl/JK9s2uNjGVHNvEuS8'));
  db.prepare("UPDATE config SET value = ? WHERE key = 'barbershopName' AND (value = '\"Studio de Autor\"' OR value IS NULL)").run(JSON.stringify('V.I.P Barberías'));
  db.prepare("UPDATE config SET value = ? WHERE key = 'address' AND (value = '\"Ubicación coordinada por WhatsApp\"' OR value IS NULL)").run(JSON.stringify('Eva Perón 52'));
  db.prepare("UPDATE config SET value = ? WHERE key = 'city' AND (value = '\"\"' OR value IS NULL)").run(JSON.stringify('Capitán Bermúdez'));
  db.prepare("UPDATE config SET value = ? WHERE key = 'locationNote' AND (value = '\"Sillón de David en Studio de Autor\"' OR value IS NULL)").run(JSON.stringify('Sillón de David en V.I.P Barberías'));

  // Asegurar portfolio de autor inicial
  try {
    const portfolioCount = db.prepare('SELECT COUNT(*) as count FROM portfolio').get().count;
    if (portfolioCount === 0) {
      const initialPortfolio = [
        {
          id: 'look-1',
          title: 'Fade Comprimido & Freestyle',
          subtitle: 'Diseño geométrico a navaja y degradado quirúrgico milimétrico.',
          category: 'freestyle',
          tag: 'DISEÑO FREESTYLE',
          image_url: 'imagenes/corte-freestyle.webp',
          service_id: 'corte',
          featured: 1,
          sort_order: 1
        },
        {
          id: 'look-3',
          title: 'Corte Premium · Relax VIP',
          subtitle: 'Gafas de presoterapia ocular, masajeador cervical y bebida fría.',
          category: 'premium',
          tag: 'EXPERIENCIA COMPLETA',
          image_url: 'imagenes/corte-premium.webp',
          service_id: 'experiencia-completa',
          featured: 1,
          sort_order: 2
        },
        {
          id: 'look-2',
          title: 'Burst Fade · Diseño 23',
          subtitle: 'Degradado curvo milimétrico con textura superior personalizada.',
          category: 'fades',
          tag: 'FADE',
          image_url: 'imagenes/IMG_3526.webp',
          service_id: 'corte',
          featured: 0,
          sort_order: 3
        },
        {
          id: 'look-4',
          title: 'Barba Premium · Ritual de Navaja',
          subtitle: 'Perfilado al detalle, toalla caliente y aceites botánicos.',
          category: 'premium',
          tag: 'RITUAL A NAVAJA',
          image_url: 'imagenes/barba-premium.webp',
          service_id: 'barba-premium',
          featured: 0,
          sort_order: 4
        },
        {
          id: 'look-5',
          title: 'Corte + Bebida Fría',
          subtitle: 'Fade con cerveza fría, Monster o gaseosa en el sillón.',
          category: 'fades',
          tag: 'CORTE + BEBIDA',
          image_url: 'imagenes/corte-bebida.webp',
          service_id: 'corte-bebida',
          featured: 0,
          sort_order: 5
        },
        {
          id: 'look-6',
          title: 'Colorimetría & Textura Técnica',
          subtitle: 'Iluminación, reflejos y peinado técnico de alta duración.',
          category: 'freestyle',
          tag: 'COLOR & TÉCNICA',
          image_url: 'imagenes/IMG_0989.webp',
          service_id: 'colorimetria',
          featured: 0,
          sort_order: 6
        }
      ];

      const insertPort = db.prepare(`
        INSERT INTO portfolio (id, title, subtitle, category, tag, image_url, service_id, featured, sort_order, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const item of initialPortfolio) {
        insertPort.run(
          item.id,
          item.title,
          item.subtitle,
          item.category,
          item.tag,
          item.image_url,
          item.service_id,
          item.featured,
          item.sort_order,
          new Date().toISOString()
        );
      }
    }
  } catch (err) {
    console.error('Error seeding portfolio:', err);
  }

  // Asegurar servicios
  const serviceCount = db.prepare('SELECT COUNT(*) as count FROM services').get().count;
  if (serviceCount === 0) {
    const initialServices = [
      {
        id: 'corte',
        name: 'Corte',
        tagline: 'Fade & Corte',
        price: 18000,
        duration: 45,
        points_earned: 1,
        drink_included: 0,
        badge: 'CLÁSICO DE LA CASA',
        image_url: '/imagenes/IMG_3526.webp',
        includes: [
          'Corte personalizado',
          'Perfilado',
          'Diseños simples',
          'Asesoramiento de imagen',
          'Finalización con productos profesionales'
        ],
        sort_order: 1
      },
      {
        id: 'corte-bebida',
        name: 'Corte + Bebida',
        tagline: 'Fade + Barra Libre 1 Bebida',
        price: 20000,
        duration: 45,
        points_earned: 1,
        drink_included: 1,
        badge: 'MÁS ELEGIDO',
        image_url: '/imagenes/corte-bebida.webp',
        includes: [
          'Corte personalizado',
          'Perfilado',
          'Diseños simples',
          'Asesoramiento de imagen',
          '1 bebida a elección (agua mineral, gaseosa o cerveza)',
          'Finalización con productos profesionales'
        ],
        sort_order: 2
      },
      {
        id: 'barba-premium',
        name: 'Barba Premium',
        tagline: 'Ritual de Navaja & Toalla',
        price: 20000,
        duration: 45,
        points_earned: 1,
        drink_included: 0,
        badge: 'PERFILADO PRO',
        image_url: '/imagenes/barba-premium.webp',
        includes: [
          'Diseño de barba',
          'Perfilado con navaja',
          'Hidratación y terminación profesional'
        ],
        sort_order: 3
      },
      {
        id: 'barba-premium-bebida',
        name: 'Barba Premium + Bebida',
        tagline: 'Ritual de Barba + 1 Bebida',
        price: 22000,
        duration: 45,
        points_earned: 1,
        drink_included: 1,
        badge: 'BARBA + TRAGO',
        image_url: '/imagenes/barba-premium-bebida.webp',
        includes: [
          'Diseño de barba',
          'Perfilado con navaja',
          '1 bebida a elección (agua mineral, gaseosa o cerveza)',
          'Hidratación y terminación profesional'
        ],
        sort_order: 4
      },
      {
        id: 'experiencia-completa',
        name: 'Corte Premium · Experiencia Completa',
        tagline: 'Corte + Relax Ocular & Masaje + Bebida',
        price: 24000,
        duration: 60,
        points_earned: 1,
        drink_included: 1,
        badge: 'CORTE PREMIUM VIP',
        image_url: '/imagenes/corte-premium.webp',
        includes: [
          'Corte personalizado y perfilado al detalle',
          'Sesión relax con gafas de masaje ocular y masajeador cervical',
          'Limpieza facial express',
          'Productos de cuidado para cabello y barba',
          '1 bebida a elección (agua mineral, gaseosa o cerveza)'
        ],
        sort_order: 5
      }
    ];

    const insertSvc = db.prepare(`
      INSERT INTO services (id, name, tagline, price, duration, points_earned, drink_included, includes_json, image_url, badge, sort_order, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);

    for (const s of initialServices) {
      insertSvc.run(
        s.id,
        s.name,
        s.tagline,
        s.price,
        s.duration,
        s.points_earned,
        s.drink_included,
        JSON.stringify(s.includes),
        s.image_url,
        s.badge,
        s.sort_order
      );
    }
  }

  // Inicialización de clientes (Puesta a punto lista para producción - sin cuentas falsas)
  const legacyClients = db.prepare('SELECT id, pin_hash FROM clients').all();
  for (const cl of legacyClients) {
    if (cl.pin_hash && !cl.pin_hash.startsWith('$2')) {
      const is1234 = verifyPassword('1234', cl.pin_hash);
      if (is1234) {
        db.prepare('UPDATE clients SET pin_hash = ?, pin_code = NULL WHERE id = ?').run(
          hashPassword('1234', 10),
          cl.id
        );
      }
    }
  }
}

export function getConfigObject() {
  const rows = db.prepare('SELECT key, value FROM config').all();
  const cfg = {};
  for (const r of rows) {
    try {
      cfg[r.key] = JSON.parse(r.value);
    } catch {
      cfg[r.key] = r.value;
    }
  }
  return cfg;
}

export function updateConfigObject(updates) {
  const upsert = db.prepare('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)');
  for (const [k, v] of Object.entries(updates)) {
    upsert.run(k, JSON.stringify(v));
  }
  return getConfigObject();
}

export function getPortfolioItems() {
  return db.prepare('SELECT * FROM portfolio ORDER BY sort_order ASC, created_at DESC').all();
}

export function insertPortfolioItem({ id, title, subtitle, category, tag, image_url, service_id, featured, sort_order }) {
  const insert = db.prepare(`
    INSERT INTO portfolio (id, title, subtitle, category, tag, image_url, service_id, featured, sort_order, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const now = new Date().toISOString();
  insert.run(
    id,
    title,
    subtitle || '',
    category || 'fades',
    tag || '',
    image_url,
    service_id || null,
    featured ? 1 : 0,
    sort_order || 0,
    now
  );
  return db.prepare('SELECT * FROM portfolio WHERE id = ?').get(id);
}

export function updatePortfolioItem(id, updates) {
  const current = db.prepare('SELECT * FROM portfolio WHERE id = ?').get(id);
  if (!current) return null;

  const title = updates.title !== undefined ? updates.title : current.title;
  const subtitle = updates.subtitle !== undefined ? updates.subtitle : current.subtitle;
  const category = updates.category !== undefined ? updates.category : current.category;
  const tag = updates.tag !== undefined ? updates.tag : current.tag;
  const image_url = updates.image_url !== undefined ? updates.image_url : current.image_url;
  const service_id = updates.service_id !== undefined ? updates.service_id : current.service_id;
  const featured = updates.featured !== undefined ? (updates.featured ? 1 : 0) : current.featured;
  const sort_order = updates.sort_order !== undefined ? updates.sort_order : current.sort_order;

  db.prepare(`
    UPDATE portfolio
    SET title = ?, subtitle = ?, category = ?, tag = ?, image_url = ?, service_id = ?, featured = ?, sort_order = ?
    WHERE id = ?
  `).run(title, subtitle, category, tag, image_url, service_id, featured, sort_order, id);

  return db.prepare('SELECT * FROM portfolio WHERE id = ?').get(id);
}

export function deletePortfolioItem(id) {
  return db.prepare('DELETE FROM portfolio WHERE id = ?').run(id);
}
