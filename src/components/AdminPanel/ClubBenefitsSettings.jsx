import React, { useState } from 'react';
import {
  Gift,
  Award,
  Plus,
  Trash2,
  Save,
  CheckCircle,
  Package,
  Layers,
  Sparkles
} from 'lucide-react';

export default function ClubBenefitsSettings({
  clubBenefits = [],
  redeemables = [],
  onSave
}) {
  const [benefitsList, setBenefitsList] = useState(() => (
    clubBenefits.length > 0 ? [...clubBenefits] : [
      { id: 'ben-corte', title: 'Corte de Autor Bonificado', description: 'Acumulando 10 puntos con tus visitas en el estudio', badge: '10 PTS', active: true },
      { id: 'ben-bebida', title: 'Barra de Cortesía en el Sillón', description: 'Cerveza helada, gaseosa o agua mineral en servicios con bebida', badge: 'INCLUIDO', active: true },
      { id: 'ben-cumple', title: 'Beneficio Semana de Cumpleaños', description: 'Atención preferencial y regalo directo en tu WhatsApp', badge: 'SOCIOS', active: true }
    ]
  ));

  const [redeemablesList, setRedeemablesList] = useState(() => (
    redeemables.length > 0 ? [...redeemables] : [
      { id: 'red-corte', name: 'Corte de Autor Completo', pointsCost: 10, stock: 99, hasStockLimit: false, active: true, description: 'Canjeá 10 puntos y tu próximo corte es 100% bonificado.' },
      { id: 'red-pomada', name: 'Pomada Matte de Autor (50g)', pointsCost: 6, stock: 8, hasStockLimit: true, active: true, description: 'Fijación media y acabado natural mate con aroma exclusivo.' },
      { id: 'red-aceite', name: 'Aceite Nutritivo para Barba', pointsCost: 5, stock: 5, hasStockLimit: true, active: true, description: 'Hidratación profunda de piel y vello facial con extractos botánicos.' }
    ]
  ));

  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  // 1. Benefits Handlers
  const handleAddBenefit = () => {
    const newId = `ben_${Date.now()}`;
    setBenefitsList([
      ...benefitsList,
      {
        id: newId,
        title: 'Nuevo Beneficio de Socio',
        description: 'Detalle o condición del beneficio para los clientes del estudio',
        badge: 'EXCLUSIVO',
        active: true
      }
    ]);
  };

  const handleUpdateBenefit = (id, field, value) => {
    setBenefitsList(benefitsList.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const handleRemoveBenefit = (id) => {
    setBenefitsList(benefitsList.filter(b => b.id !== id));
  };

  // 2. Redeemables Handlers
  const handleAddRedeemable = () => {
    const newId = `red_${Date.now()}`;
    setRedeemablesList([
      ...redeemablesList,
      {
        id: newId,
        name: 'Nuevo Canjeable / Producto',
        pointsCost: 5,
        stock: 10,
        hasStockLimit: true,
        active: true,
        description: 'Descripción del canje para los socios del club'
      }
    ]);
  };

  const handleUpdateRedeemable = (id, field, value) => {
    setRedeemablesList(redeemablesList.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleRemoveRedeemable = (id) => {
    setRedeemablesList(redeemablesList.filter(r => r.id !== id));
  };

  const handleSaveAll = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback('');
    try {
      await onSave({
        clubBenefits: benefitsList,
        redeemables: redeemablesList
      });
      setFeedback('Beneficios y canjeables con stock guardados correctamente.');
      setTimeout(() => setFeedback(''), 4000);
    } catch (err) {
      setFeedback(err.message || 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSaveAll} className="space-y-6 text-xs">
      {feedback && (
        <div className="p-3.5 rounded-2xl bg-barber-matcha/20 border border-barber-matcha text-xs text-barber-darkText flex items-center gap-2 font-medium">
          <CheckCircle className="w-4 h-4 text-barber-matcha shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* SECTION 1: PRODUCTOS Y CANJES POR PUNTOS (CON STOCK EDITABLE) */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-barber-darkBorder">
          <div>
            <div className="flex items-center gap-2 font-display font-bold text-sm text-barber-darkText">
              <Package className="w-4 h-4 text-barber-chai" />
              <span>Canjeables de Puntos &amp; Stock de Productos</span>
            </div>
            <p className="text-barber-pistache mt-0.5">
              Definí cuántos puntos cuesta cada canje y controlá el stock físico disponible en el local.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddRedeemable}
            className="px-3.5 py-2 rounded-xl bg-barber-chai text-barber-lightText font-semibold flex items-center gap-1.5 hover:brightness-105 self-start sm:self-auto transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar Canjeable</span>
          </button>
        </div>

        <div className="space-y-3">
          {redeemablesList.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-barber-darkBg border border-barber-darkBorder space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => handleUpdateRedeemable(item.id, 'name', e.target.value)}
                  placeholder="Nombre del canjeable (ej: Pomada Matte 50g)"
                  className="flex-1 px-3 py-2 rounded-xl bg-barber-darkSurface border border-barber-darkBorder text-barber-darkText font-semibold text-xs focus:outline-none focus:border-barber-matcha"
                />

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-barber-darkSurface px-2.5 py-1.5 rounded-xl border border-barber-darkBorder">
                    <span className="text-barber-pistache font-mono">Puntos:</span>
                    <input
                      type="number"
                      min="1"
                      value={item.pointsCost}
                      onChange={(e) => handleUpdateRedeemable(item.id, 'pointsCost', Math.max(1, Number(e.target.value)))}
                      className="w-14 px-1.5 py-0.5 rounded bg-barber-darkBg border border-barber-darkBorder text-barber-chai font-mono font-bold text-center tabular-nums"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveRedeemable(item.id)}
                    className="p-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Eliminar canjeable"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <input
                type="text"
                value={item.description}
                onChange={(e) => handleUpdateRedeemable(item.id, 'description', e.target.value)}
                placeholder="Descripción del producto o servicio canjeable"
                className="w-full px-3 py-1.5 rounded-xl bg-barber-darkSurface border border-barber-darkBorder text-barber-pistache text-xs focus:outline-none focus:border-barber-matcha"
              />

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={item.hasStockLimit}
                    onChange={(e) => handleUpdateRedeemable(item.id, 'hasStockLimit', e.target.checked)}
                    className="rounded bg-barber-darkSurface border-barber-darkBorder text-barber-matcha focus:ring-0"
                  />
                  <span className="text-barber-darkText font-medium">Limitar por Stock físico</span>
                </label>

                {item.hasStockLimit && (
                  <div className="flex items-center gap-2">
                    <span className="text-barber-pistache">Unidades disponibles:</span>
                    <input
                      type="number"
                      min="0"
                      value={item.stock}
                      onChange={(e) => handleUpdateRedeemable(item.id, 'stock', Math.max(0, Number(e.target.value)))}
                      className="w-16 px-2 py-1 rounded-xl bg-barber-darkSurface border border-barber-darkBorder text-barber-darkText font-mono font-bold text-center tabular-nums"
                    />
                    {item.stock <= 0 && (
                      <span className="text-red-400 font-mono font-bold text-[10px] uppercase">
                        (Agotado)
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: BENEFICIOS EXCLUSIVOS DEL CLUB (AGREGAR / QUITAR) */}
      <div className="space-y-3 pt-3 border-t border-barber-darkBorder">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-barber-darkBorder">
          <div>
            <div className="flex items-center gap-2 font-display font-bold text-sm text-barber-darkText">
              <Award className="w-4 h-4 text-barber-matcha" />
              <span>Beneficios Permanentes del Club</span>
            </div>
            <p className="text-barber-pistache mt-0.5">
              Agregá o quitá beneficios de la lista pública que ven los clientes en su tarjeta del club.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddBenefit}
            className="px-3.5 py-2 rounded-xl bg-barber-matcha text-white font-semibold flex items-center gap-1.5 hover:brightness-105 self-start sm:self-auto transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar Beneficio</span>
          </button>
        </div>

        <div className="space-y-3">
          {benefitsList.map((b) => (
            <div
              key={b.id}
              className="p-4 rounded-2xl bg-barber-darkBg border border-barber-darkBorder space-y-2.5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <input
                  type="text"
                  value={b.title}
                  onChange={(e) => handleUpdateBenefit(b.id, 'title', e.target.value)}
                  placeholder="Título del beneficio (ej: Barra de Cortesía)"
                  className="flex-1 px-3 py-2 rounded-xl bg-barber-darkSurface border border-barber-darkBorder text-barber-darkText font-semibold text-xs focus:outline-none focus:border-barber-matcha"
                />

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={b.badge || ''}
                    onChange={(e) => handleUpdateBenefit(b.id, 'badge', e.target.value)}
                    placeholder="Badge (ej: INCLUIDO)"
                    className="w-28 px-2.5 py-2 rounded-xl bg-barber-darkSurface border border-barber-darkBorder text-barber-chai font-mono font-bold text-center text-xs uppercase"
                  />

                  <button
                    type="button"
                    onClick={() => handleRemoveBenefit(b.id)}
                    className="p-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Eliminar beneficio"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <input
                type="text"
                value={b.description}
                onChange={(e) => handleUpdateBenefit(b.id, 'description', e.target.value)}
                placeholder="Descripción del beneficio para el cliente"
                className="w-full px-3 py-1.5 rounded-xl bg-barber-darkSurface border border-barber-darkBorder text-barber-pistache text-xs focus:outline-none focus:border-barber-matcha"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-3 border-t border-barber-darkBorder">
        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-2.5 rounded-xl bg-barber-matcha text-white font-display font-bold uppercase tracking-wider flex items-center gap-2 shadow-md hover:brightness-105 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Guardar Beneficios &amp; Canjeables</span>
        </button>
      </div>
    </form>
  );
}
