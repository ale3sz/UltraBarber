import { db } from './db.js';

/**
 * Registra un movimiento atómico en el ledger de puntos y actualiza el saldo del cliente
 * @param {Object} params
 * @param {string} params.dni - DNI del cliente
 * @param {number} params.delta - Variación (+100, -500, +25)
 * @param {string} params.reason - Concepto ('CORTE_FINALIZADO', 'CANJE_PREMIO', 'REFERIDO_REGISTRO', 'BONUS_MANUAL', 'ROLLBACK_CORTE')
 * @param {string} [params.referenceId] - ID del turno, canje o cliente referido
 * @returns {number} Nuevo saldo total de puntos
 */
export function recordPointsMovement({ dni, delta, reason, referenceId = null }) {
  const client = db.prepare('SELECT id, points FROM clients WHERE dni = ?').get(dni);
  if (!client) {
    throw new Error(`Cliente con DNI ${dni} no encontrado para movimiento de puntos.`);
  }

  const currentPoints = Number(client.points) || 0;
  const newBalance = Math.max(0, currentPoints + delta);
  const ledgerId = `ple_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = Date.now();

  db.prepare(`
    INSERT INTO points_ledger (id, client_dni, delta, balance_after, reason, reference_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(ledgerId, dni, delta, newBalance, reason, referenceId, now);

  db.prepare('UPDATE clients SET points = ? WHERE dni = ?').run(newBalance, dni);

  return newBalance;
}

/**
 * Consulta el historial de puntos de un cliente ordenado cronológicamente
 */
export function getPointsHistory(dni, limit = 20) {
  return db.prepare(`
    SELECT id, delta, balance_after, reason, reference_id, created_at
    FROM points_ledger
    WHERE client_dni = ?
    ORDER BY created_at DESC
    LIMIT ?
  `).all(dni, limit);
}
