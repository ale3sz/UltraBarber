import { db } from './db.js';
import { recordPointsMovement } from './ledger.js';
import { getArgentinaDateString, getArgentinaDayOfWeek } from './timezone.js';

/**
 * Calcula la diferencia en días enteros entre dos fechas YYYY-MM-DD
 */
export function getDaysDifference(dateAStr, dateBStr) {
  if (!dateAStr || !dateBStr) return null;
  const [y1, m1, d1] = dateAStr.split('-').map(Number);
  const [y2, m2, d2] = dateBStr.split('-').map(Number);
  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);
  return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
}

/**
 * Calcula dinámicamente los días de menor demanda (hasta 2 días)
 * basándose en los turnos completados en la última semana activa.
 * 
 * Si no hay suficientes turnos (vacaciones, baja actividad o inicio),
 * recurre al fallback predeterminado: Martes (2) y Miércoles (3).
 * 
 * @returns {number[]} Array con los dayOfWeek que tienen bonus (ej: [2, 3])
 */
export function getDynamicLowDemandDays() {
  const DEFAULT_LOW_DAYS = [2, 3]; // Martes y Miércoles

  try {
    // 1. Obtener la fecha del turno finalizado más reciente
    const latestApt = db.prepare(`
      SELECT date FROM appointments 
      WHERE status = 'finalizado' 
      ORDER BY date DESC 
      LIMIT 1
    `).get();

    if (!latestApt || !latestApt.date) {
      return DEFAULT_LOW_DAYS;
    }

    // 2. Tomar los 7 días previos a ese último turno activo
    const [y, m, d] = latestApt.date.split('-').map(Number);
    const endUtc = Date.UTC(y, m - 1, d);
    const startUtc = endUtc - (7 * 24 * 60 * 60 * 1000);
    const startDateStr = new Date(startUtc).toISOString().slice(0, 10);

    const weekAppointments = db.prepare(`
      SELECT date FROM appointments
      WHERE status = 'finalizado' AND date >= ? AND date <= ?
    `).all(startDateStr, latestApt.date);

    // Si hubo menos de 4 turnos completados en esa semana (vacaciones/inactividad), usar fallback seguro
    if (!weekAppointments || weekAppointments.length < 4) {
      return DEFAULT_LOW_DAYS;
    }

    // Contar visitas por día laborable (1: Lunes, 2: Martes, 3: Miércoles, 4: Jueves, 5: Viernes, 6: Sábado)
    const countsByDay = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    for (const apt of weekAppointments) {
      const day = getArgentinaDayOfWeek(apt.date);
      if (countsByDay[day] !== undefined) {
        countsByDay[day]++;
      }
    }

    // Ordenar días laborales de menor a mayor cantidad de visitas
    const sortedDays = Object.keys(countsByDay)
      .map(Number)
      .sort((a, b) => {
        // En caso de empate, priorizar martes (2) y miércoles (3)
        if (countsByDay[a] === countsByDay[b]) {
          const aDefault = DEFAULT_LOW_DAYS.includes(a) ? 0 : 1;
          const bDefault = DEFAULT_LOW_DAYS.includes(b) ? 0 : 1;
          return aDefault - bDefault;
        }
        return countsByDay[a] - countsByDay[b];
      });

    // Tomar exactamente los 2 días con menor cantidad de turnos
    return sortedDays.slice(0, 2);
  } catch (err) {
    console.error('Error calculando días dinámicos de baja demanda:', err);
    return DEFAULT_LOW_DAYS;
  }
}

/**
 * Nombres legibles en español para los días de la semana
 */
export const DAY_NAMES = {
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
  0: 'Domingo'
};

/**
 * Motor de Caducidad Gradual de Puntos (Points Decay):
 * Regla: Tras 60 días (2 meses) sin cortarse, se descuentan 10 PTS cada 21 días (3 semanas) adicionales de inactividad.
 * Se audita en points_ledger para total transparencia.
 */
export function applyPointsDecay() {
  const todayStr = getArgentinaDateString();
  const clientsWithPoints = db.prepare('SELECT id, dni, points, last_visit_date, member_since FROM clients WHERE points > 0').all();

  for (const client of clientsWithPoints) {
    const baselineDate = client.last_visit_date || client.member_since;
    if (!baselineDate) continue;

    const daysInactive = getDaysDifference(baselineDate, todayStr);
    if (daysInactive === null || daysInactive < 60) continue;

    const expectedDecaySteps = 1 + Math.floor((daysInactive - 60) / 21);

    const appliedDecaysCount = db.prepare(`
      SELECT COUNT(*) as count FROM points_ledger
      WHERE client_dni = ? AND reason LIKE 'DECAY_INACTIVIDAD_%'
      AND created_at > (
        SELECT COALESCE(MAX(completed_at), 0) FROM appointments WHERE dni = ? AND status = 'finalizado'
      )
    `).get(client.dni, client.dni)?.count || 0;

    const pendingSteps = expectedDecaySteps - appliedDecaysCount;
    if (pendingSteps > 0) {
      for (let i = 0; i < pendingSteps; i++) {
        const currentBalance = db.prepare('SELECT points FROM clients WHERE dni = ?').get(client.dni)?.points || 0;
        if (currentBalance <= 0) break;

        const deduction = Math.min(10, currentBalance);
        recordPointsMovement({
          dni: client.dni,
          delta: -deduction,
          reason: `DECAY_INACTIVIDAD_PASO_${appliedDecaysCount + i + 1}`,
          referenceId: `inact_${daysInactive}d`
        });
      }
    }
  }
}

/**
 * Evalúa los bonus de fidelización en un corte:
 * 1. Base del servicio (normalmente 10 PTS)
 * 2. Horario valle dinámico (máx. 2 días semanales calculados según la última semana activa, default Martes/Miércoles) (+5 PTS)
 * 3. Racha de recurrencia (+5 PTS si volvió en 21 días o menos desde su última visita)
 */
export function calculateEarnedPoints({ servicePointsEarned, appointmentDate, appointmentTime, lastVisitDate }) {
  let total = servicePointsEarned !== undefined ? Number(servicePointsEarned) : 10;
  const breakdown = [];

  breakdown.push({ label: 'Corte completado', points: total });

  // 1. Racha de recurrencia (< 21 días)
  if (lastVisitDate && appointmentDate) {
    const daysSinceLast = getDaysDifference(lastVisitDate, appointmentDate);
    if (daysSinceLast !== null && daysSinceLast >= 1 && daysSinceLast <= 21) {
      total += 5;
      breakdown.push({ label: 'Racha de recurrencia (≤ 21 días)', points: 5 });
    }
  }

  // 2. Horario valle automático (máx. 2 días por semana)
  if (appointmentDate) {
    const dayOfWeek = getArgentinaDayOfWeek(appointmentDate);
    const lowDemandDays = getDynamicLowDemandDays();

    if (lowDemandDays.includes(dayOfWeek)) {
      total += 5;
      const dayName = DAY_NAMES[dayOfWeek] || 'Horario valle';
      breakdown.push({ label: `Día de menor demanda (${dayName})`, points: 5 });
    }
  }

  return { total, breakdown };
}

/**
 * Valida si el cliente califica para Bebida de Cumpleaños de Regalo:
 * Regla:
 * - Cumpleaños dentro del rango de 2 días antes o 2 días después (en el mes actual).
 * - Tuvo corte previo registrado en los últimos 35 días.
 */
export function checkBirthdayDrinkEligibility(client, appointmentDate) {
  if (!client || !client.birth_date && !client.birthDate) return { eligible: false, reason: 'Sin fecha de cumpleaños registrada' };
  const birthDate = client.birth_date || client.birthDate;
  const parts = birthDate.split('-');
  if (parts.length < 3) return { eligible: false, reason: 'Fecha de cumpleaños inválida' };

  const targetDate = appointmentDate || getArgentinaDateString();
  const [curY, curM, curD] = targetDate.split('-').map(Number);
  const bMonth = parseInt(parts[1], 10);
  const bDay = parseInt(parts[2], 10);

  // Mismo mes y diferencia de días entre -2 y +2
  if (bMonth !== curM) {
    return { eligible: false, reason: 'No coincide con el mes de cumpleaños' };
  }

  const diffDays = curD - bDay;
  if (diffDays < -2 || diffDays > 2) {
    return { eligible: false, reason: 'Fuera de la ventana de ±2 días del cumpleaños' };
  }

  // Verificar si se cortó en los últimos 35 días
  const lastVisit = client.last_visit_date || client.lastVisitDate;
  if (!lastVisit) {
    return { eligible: false, reason: 'Requiere haber visitado el sillón en los últimos 35 días' };
  }

  const daysSinceVisit = getDaysDifference(lastVisit, targetDate);
  if (daysSinceVisit === null || daysSinceVisit > 35) {
    return { eligible: false, reason: `Último corte hace ${daysSinceVisit} días (máx. 35 días)` };
  }

  return { eligible: true, message: '¡Bebida de cortesía por cumpleaños disponible!' };
}
