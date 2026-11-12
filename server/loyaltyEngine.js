import { db } from './db.js';
import { recordPointsMovement } from './ledger.js';
import { getArgentinaDateString } from './timezone.js';

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

    // Calcular cuántos tramos de 21 días corresponden tras los 60 días iniciales
    // Días tras los 60: (daysInactive - 60)
    // Tramos acumulados = 1 + Math.floor((daysInactive - 60) / 21)
    const expectedDecaySteps = 1 + Math.floor((daysInactive - 60) / 21);

    // Contar cuántos decays ya se le aplicaron desde su última visita
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
 * 2. Horario valle / Happy hour (+5 PTS los martes o miércoles)
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
      breakdown.push({ label: 'Racha de recurrencia (menos de 21 días)', points: 5 });
    }
  }

  // 2. Horario valle / Día flojo (Martes o Miércoles)
  if (appointmentDate) {
    const [y, m, d] = appointmentDate.split('-').map(Number);
    const dayOfWeek = new Date(Date.UTC(y, m - 1, d, 12, 0, 0)).getUTCDay(); // 2: Martes, 3: Miércoles
    if (dayOfWeek === 2 || dayOfWeek === 3) {
      total += 5;
      breakdown.push({ label: 'Horario valle (Martes o Miércoles)', points: 5 });
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
