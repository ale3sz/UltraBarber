/**
 * Módulo de manejo estricto de Timezones y Fechas
 * Zona horaria de referencia: America/Argentina/Buenos_Aires (GMT-3)
 */

export const ARGENTINA_TIMEZONE = 'America/Argentina/Buenos_Aires';
export const ARGENTINA_OFFSET_STR = '-03:00';

/**
 * Obtiene la fecha actual en formato 'YYYY-MM-DD' en la zona horaria de Argentina.
 * @param {Date|number} [date=new Date()]
 * @returns {string} Fecha 'YYYY-MM-DD'
 */
export function getArgentinaDateString(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: ARGENTINA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(d);
}

/**
 * Obtiene los minutos transcurridos en el día (0 - 1439) en la hora de Argentina.
 * @param {Date|number} [date=new Date()]
 * @returns {number}
 */
export function getArgentinaMinutesOfDay(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: ARGENTINA_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).formatToParts(d);

  const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
  const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);
  return hour * 60 + minute;
}

/**
 * Convierte un slot local de Argentina ('YYYY-MM-DD' y 'HH:mm') a timestamp UTC en milisegundos.
 * @param {string} dateStr 'YYYY-MM-DD'
 * @param {string} timeStr 'HH:mm'
 * @returns {number} Timestamp epoch UTC en ms
 */
export function argentinaSlotToUtcTimestamp(dateStr, timeStr) {
  if (!dateStr || !timeStr) return NaN;
  const isoWithOffset = `${dateStr}T${timeStr}:00.000${ARGENTINA_OFFSET_STR}`;
  return new Date(isoWithOffset).getTime();
}

/**
 * Obtiene el día de la semana (0: Domingo, 1: Lunes, ..., 6: Sábado) según el calendario de Argentina.
 * @param {string} dateStr 'YYYY-MM-DD'
 * @returns {number}
 */
export function getArgentinaDayOfWeek(dateStr) {
  // Mediodía en Argentina para evitar desfases de medianoche
  const d = new Date(`${dateStr}T12:00:00.000${ARGENTINA_OFFSET_STR}`);
  return d.getDay();
}
