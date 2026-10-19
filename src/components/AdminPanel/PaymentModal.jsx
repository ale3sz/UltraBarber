import React, { useState } from 'react';
import { CreditCard, Gift, Banknote, X, Check, Scissors } from 'lucide-react';

export default function PaymentModal({
  appointment,
  client,
  onClose,
  onConfirmPayment
}) {
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [amountPaid, setAmountPaid] = useState(appointment?.price || 18000);
  const [pointsUsed] = useState(10);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!appointment) return null;

  const currentPoints = client?.points || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onConfirmPayment({
        paymentMethod,
        amountPaid: paymentMethod === 'Canje de Puntos' ? 0 : Number(amountPaid),
        pointsUsed: paymentMethod === 'Canje de Puntos' ? pointsUsed : 0,
        notes
      });
      onClose();
    } catch (err) {
      alert('Error al registrar cobro: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-barber-darkSurface border border-barber-darkBorder p-6 text-barber-darkText club-shadow space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-barber-darkBorder">
          <h3 className="text-xl font-display font-bold text-barber-darkText">
            Cobrar y Finalizar Turno
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-barber-pistache hover:text-barber-darkText"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <dl className="divide-y divide-barber-darkBorder text-xs">
          <div className="py-2 flex justify-between">
            <dt className="text-barber-pistache">Socio</dt>
            <dd className="font-bold text-barber-darkText">{appointment.clientName}</dd>
          </div>
          <div className="py-2 flex justify-between">
            <dt className="text-barber-pistache">Servicio</dt>
            <dd className="font-semibold text-barber-darkText">{appointment.serviceName}</dd>
          </div>
          <div className="py-2 flex justify-between">
            <dt className="text-barber-pistache">Balance actual del socio</dt>
            <dd className="font-mono font-bold text-barber-chai tabular-nums">{currentPoints} PTS</dd>
          </div>
        </dl>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <span className="block text-xs font-semibold text-barber-darkText mb-2">
              Método de Pago
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('Efectivo')}
                className={`py-3 px-2 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'Efectivo'
                    ? 'bg-barber-matcha text-white border-barber-matcha'
                    : 'bg-barber-darkBg border-barber-darkBorder text-barber-darkText hover:border-barber-chai'
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span>Efectivo</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Transferencia')}
                className={`py-3 px-2 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'Transferencia'
                    ? 'bg-barber-matcha text-white border-barber-matcha'
                    : 'bg-barber-darkBg border-barber-darkBorder text-barber-darkText hover:border-barber-chai'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Transferencia</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Canje de Puntos')}
                className={`py-3 px-2 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all relative ${
                  paymentMethod === 'Canje de Puntos'
                    ? currentPoints < pointsUsed
                      ? 'bg-red-500/20 text-red-300 border-red-500/50'
                      : 'bg-barber-chai text-barber-lightText border-barber-chai'
                    : currentPoints < pointsUsed
                    ? 'bg-barber-darkBg border-barber-darkBorder text-barber-pistache/50 hover:border-red-500/40'
                    : 'bg-barber-darkBg border-barber-darkBorder text-barber-darkText hover:border-barber-chai'
                }`}
              >
                <Gift className="w-4 h-4" />
                <span>Canje Puntos</span>
                {currentPoints < pointsUsed && (
                  <span className="text-[9px] font-mono font-normal text-red-400">Insuficiente</span>
                )}
              </button>
            </div>
          </div>

          {paymentMethod === 'Canje de Puntos' ? (
            <div className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
              currentPoints < pointsUsed
                ? 'bg-red-500/10 border-red-500/30 text-red-300'
                : 'bg-barber-darkBg border-barber-chai'
            }`}>
              <div className="flex items-center justify-between font-bold">
                <span className={currentPoints < pointsUsed ? 'text-red-300' : 'text-barber-darkText'}>
                  Puntos requeridos:
                </span>
                <span className="font-mono tabular-nums">
                  {pointsUsed} PTS {currentPoints >= pointsUsed ? '(Bonificado)' : `(Saldo: ${currentPoints} PTS)`}
                </span>
              </div>
              {currentPoints < pointsUsed ? (
                <p className="text-red-400 font-semibold text-[11px]">
                  Saldo insuficiente para bonificar el corte. El cliente necesita acumular 10 PTS (saldo actual: {currentPoints} PTS).
                </p>
              ) : (
                <p className="text-barber-pistache">
                  Se descuentan 10 puntos y se suma +1 punto por la nueva visita completada.
                </p>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-barber-darkText mb-1.5">
                Monto cobrado ($)
              </label>
              <input
                type="number"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-barber-darkBg border border-barber-darkBorder text-barber-darkText font-mono font-bold text-lg tabular-nums focus:outline-none focus:border-barber-matcha"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-barber-darkText mb-1">
              Nota rápida del corte (opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Degradé medio con 0.5"
              className="w-full px-3.5 py-2.5 rounded-xl bg-barber-darkBg border border-barber-darkBorder text-barber-darkText placeholder-barber-pistache text-xs"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-barber-pistache pt-1">
            <Scissors className="w-4 h-4 text-barber-matcha shrink-0" />
            <span>Acredita automáticamente +1 visita y +1 punto al DNI del socio.</span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 rounded-xl border border-barber-darkBorder text-xs font-semibold text-barber-pistache"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (paymentMethod === 'Canje de Puntos' && currentPoints < pointsUsed)}
              className="px-5 py-3 rounded-xl bg-barber-matcha text-white font-display font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:brightness-105 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              <span>Confirmar Cobro</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
