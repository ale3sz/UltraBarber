import React, { useState, useEffect } from 'react';
import { Clock, Check, X, MessageCircle, Phone, Calendar, User, Scissors, Wine } from 'lucide-react';

export default function PendingAppointments({
  pendingList = [],
  onConfirm,
  onCancel
}) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (pendingList.length === 0) {
    return (
      <div className="p-8 rounded-3xl bg-barber-lightSurface dark:bg-barber-darkSurface border border-barber-lightBorder dark:border-barber-darkBorder text-center space-y-2">
        <Clock className="w-7 h-7 text-barber-chai mx-auto" />
        <h3 className="text-lg font-display font-bold text-barber-lightText dark:text-barber-darkText">
          Sin códigos pendientes de confirmación
        </h3>
        <p className="text-xs text-barber-lightMuted dark:text-barber-darkMuted max-w-md mx-auto">
          Cuando un socio solicite un turno en la web y te escriba al WhatsApp con su código de 4 dígitos, aparecerá acá para que lo confirmes en un toque.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold text-barber-lightText dark:text-barber-darkText">
          Solicitudes en espera de WhatsApp ({pendingList.length})
        </h2>
        <span className="text-xs font-mono text-barber-lightMuted dark:text-barber-darkMuted">
          Expiran a los 15 min
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pendingList.map((apt) => {
          const remainingMs = Math.max(0, (apt.expiresAt || 0) - now);
          const totalMs = 15 * 60 * 1000;
          const progressPercent = Math.min(100, Math.max(0, (remainingMs / totalMs) * 100));
          const totalSec = Math.floor(remainingMs / 1000);
          const mins = Math.floor(totalSec / 60);
          const secs = totalSec % 60;
          const formattedRemaining = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

          const cleanPhone = (apt.clientPhone || '').replace(/\D/g, '');
          const clientChatUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
            `Hola ${apt.clientName}! Recibí tu código #${apt.code}. Tu turno para el ${apt.date} a las ${apt.time} hs ya quedó confirmado.`
          )}`;

          return (
            <div
              key={apt.id}
              className="rounded-3xl p-5 border border-barber-chai bg-barber-darkSurface text-barber-darkText club-shadow space-y-4 relative overflow-hidden"
            >
              {/* Top 15-min countdown bar */}
              <div className="w-full h-1.5 rounded-full bg-barber-darkBg overflow-hidden">
                <div
                  className="h-full bg-barber-chai transition-all duration-1000"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl font-mono font-extrabold text-barber-chai tabular-nums">
                    #{apt.code}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-barber-darkBg border border-barber-darkBorder text-barber-pistache">
                    Pendiente
                  </span>
                </div>

                <div className="px-3 py-1 rounded-xl bg-barber-darkBg border border-barber-darkBorder text-xs font-mono font-bold text-barber-chai flex items-center gap-1.5 tabular-nums">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formattedRemaining}</span>
                </div>
              </div>

              <dl className="divide-y divide-barber-darkBorder text-xs">
                <div className="py-2 flex items-center justify-between">
                  <dt className="text-barber-pistache flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-barber-matcha" />
                    <span>Cliente</span>
                  </dt>
                  <dd className="font-bold text-barber-darkText text-sm">
                    {apt.clientName}
                  </dd>
                </div>

                <div className="py-2 flex items-center justify-between">
                  <dt className="text-barber-pistache flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-barber-matcha" />
                    <span>DNI / WhatsApp</span>
                  </dt>
                  <dd className="font-mono text-barber-darkText tabular-nums">
                    {apt.dni} • {apt.clientPhone}
                  </dd>
                </div>

                <div className="py-2 flex items-center justify-between">
                  <dt className="text-barber-pistache flex items-center gap-1.5">
                    <Scissors className="w-3.5 h-3.5 text-barber-chai" />
                    <span>Servicio</span>
                  </dt>
                  <dd className="font-semibold text-barber-darkText">
                    {apt.serviceName}
                    {apt.selectedDrink ? ` (${apt.selectedDrink})` : ''}
                  </dd>
                </div>

                <div className="py-2 flex items-center justify-between">
                  <dt className="text-barber-pistache flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-barber-matcha" />
                    <span>Fecha y hora</span>
                  </dt>
                  <dd className="font-mono font-bold text-barber-chai tabular-nums">
                    {apt.date} • {apt.time} hs
                  </dd>
                </div>
              </dl>

              <div className="flex items-center gap-2 pt-1">
                <a
                  href={clientChatUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-3 rounded-xl bg-barber-darkBg border border-barber-darkBorder text-barber-darkText hover:border-barber-chai text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-barber-matcha" />
                  <span>Responder WA</span>
                </a>

                <button
                  type="button"
                  onClick={() => onCancel(apt.id)}
                  className="px-3 py-3 rounded-xl bg-barber-darkBg border border-barber-darkBorder text-barber-pistache hover:text-red-400 text-xs font-semibold transition-colors"
                  title="Rechazar solicitud"
                  aria-label="Rechazar solicitud"
                >
                  <X className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onConfirm(apt.id)}
                  className="flex-1 py-3 px-4 rounded-xl bg-barber-matcha hover:brightness-110 text-white font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Confirmar</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
