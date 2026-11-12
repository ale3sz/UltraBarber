import { db } from './db.js';

export function migratePointsToHundredsScale() {
  const scaledKey = db.prepare("SELECT value FROM config WHERE key = 'points_scale_v2'").get();
  if (scaledKey && JSON.parse(scaledKey.value) === true) {
    return; // Ya migrado
  }

  db.exec('BEGIN IMMEDIATE;');
  try {
    // 1. Escalar puntos de clientes actuales (x10)
    db.prepare('UPDATE clients SET points = points * 10 WHERE points > 0;').run();

    // 2. Escalar servicios points_earned (de 1 a 10)
    db.prepare('UPDATE services SET points_earned = 10;').run();

    // 3. Escalar config pointsForFreeCut (de 10 a 100)
    db.prepare("UPDATE config SET value = '100' WHERE key = 'pointsForFreeCut'").run();

    // 4. Escalar redeemables (x10)
    const redeemablesRow = db.prepare("SELECT value FROM config WHERE key = 'redeemables'").get();
    if (redeemablesRow) {
      const items = JSON.parse(redeemablesRow.value);
      const updatedItems = items.map(it => {
        let newCost = (it.pointsCost || 10) * 10;
        let newDesc = it.description || '';
        newDesc = newDesc.replace(/\b10 puntos\b/g, '100 puntos');
        newDesc = newDesc.replace(/\b10 pts\b/gi, '100 pts');
        return {
          ...it,
          pointsCost: newCost,
          description: newDesc
        };
      });
      db.prepare("UPDATE config SET value = ? WHERE key = 'redeemables'").run(JSON.stringify(updatedItems));
    }

    // 5. Escalar clubBenefits badges
    const benefitsRow = db.prepare("SELECT value FROM config WHERE key = 'clubBenefits'").get();
    if (benefitsRow) {
      const benefits = JSON.parse(benefitsRow.value);
      const updatedBenefits = benefits.map(b => {
        if (b.badge === '10 PTS') {
          return {
            ...b,
            badge: '100 PTS',
            description: b.description.replace('10 puntos', '100 puntos')
          };
        }
        return b;
      });
      db.prepare("UPDATE config SET value = ? WHERE key = 'clubBenefits'").run(JSON.stringify(updatedBenefits));
    }

    // 6. Marcar migración como completada
    db.prepare("INSERT OR REPLACE INTO config (key, value) VALUES ('points_scale_v2', 'true')").run();

    db.exec('COMMIT;');
    console.log('✅ Escala de puntos migrada a centenas (x10) con éxito.');
  } catch (err) {
    db.exec('ROLLBACK;');
    console.error('❌ Error migrando escala de puntos:', err);
    throw err;
  }
}
