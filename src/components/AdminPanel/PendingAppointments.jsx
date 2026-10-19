import React, { useState, useEffect } from 'react';
import { Clock, Check, X, MessageCircle, Phone, Calendar, User, Scissors, Wine, Sparkles } from 'lucide-react';
import EditableMessageModal from './EditableMessageModal';

export default function PendingAppointments({
  pendingList = [],
  onConfirm,
  onCancel
}) {
  const [now, setNow] = useState(Date.now());
  const [messageModal, setMessageModal] = useState({
    isOpen: false,
    recipientName: '',
    recipientPhone: '',
    initialMessage: '',
    title: '',
    badge: '',
    suggestedTemplates: []
  });

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleOpenResponseModal = (apt) => {
    const templates = [
      {
        label: 'Confirmar y Recibir',
        text: `Hola ${apt.clientName}! Recibí tu solicitud #${apt.code}. Tu turno para el ${apt.date} a las ${apt.time} hs (${apt.serviceName}) ya quedó confirmado. Te esperamos en el sillón de ULTRA BARBER!`
      },
      {
        label: 'Aviso de Demora / Ajuste',
        text: `Hola ${apt.clientName}! Vi tu solicitud #${apt.code} para las ${apt.time} hs. ¿Te queda bien moverlo unos minutos o preferís mantener este horario exacto? Avisame por acá así coordinamos!`
      },
      {
        label: 'Confirmar con Bebida',
        text: `Hola ${apt.clientName}! Turno #${apt.code} para el ${apt.date} a las ${apt.time} hs confirmado. Ya te dejamos lista tu sesión y la bebida fría para cuando llegues!`
      }
    ];

    setMessageModal({
      isOpen: true,
      recipientName: apt.clientName || 'Cliente',
      recipientPhone: apt.clientPhone || '',
      title: 'Responder por WhatsApp',
      badge: `SOLICITUD #${apt.code}`,
      initialMessage: templates[0].text,
      suggestedTemplates: templates
    });
  };

  if (pendingList.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-[#141416] border border-white/[0.08] text-center space-y-2">
        <Clock className="w-7 h-7 text-[#8A898E] mx-auto stroke-[1.5]" />
        <h3 className="text-base font-display font-bold text-[#EDEDED]">
          Sin solicitudes pendientes de confirmación
        </h3>
        <p className="text-xs font-mono text-[#8A898E] max-w-md mx-auto">
          Cuando un socio solicite un turno en la web y te escriba por WhatsApp con su código de 4 dígitos, aparecerá acá para confirmarlo en un toque.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 rounded-2xl bg-[#141416] border border-white/[0.08]">
        <div>
          <span className="micro-technical block text-[9px] text-[#D4AF37]">
            HANDSHAKE DE ENTRADA
          </span>
          <h2 className="text-base font-display font-bold text-[#EDEDED]">
            Solicitudes en Espera de WhatsApp ({pendingList.length})
          </h2>
        </div>
        <span className="text-xs font-mono text-[#8A898E]">
          Expiran a los 15 min de solicitados
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

          return (
            <div
              key={apt.id}
              className="rounded-2xl p-5 border border-[#D4AF37]/50 bg-[#141416] text-[#EDEDED] shadow-[0_0_25px_rgba(212,175,55,0.08)] space-y-4 relative overflow-hidden"
            >
              {/* Countdown bar */}
              <div className="w-full h-1.5 rounded-full bg-black/60 overflow-hidden">
                <div
                  className="h-full bg-[#D4AF37] transition-all duration-1000"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl font-mono font-extrabold text-[#D4AF37] tabular-nums">
                    #{apt.code}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37]">
                    Pendiente
                  </span>
                </div>

                <div className="px-2.5 py-1 rounded-xl bg-[#101012] border border-white/[0.1] text-xs font-mono font-bold text-[#EDEDED] flex items-center gap-1.5 tabular-nums">
                  <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{formattedRemaining}</span>
                </div>
              </div>

              <dl className="divide-y divide-white/[0.06] text-xs font-mono">
                <div className="py-2 flex items-center justify-between">
                  <dt className="text-[#8A898E] flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Cliente</span>
                  </dt>
                  <dd className="font-bold text-[#EDEDED] text-sm">
                    {apt.clientName}
                  </dd>
                </div>

                <div className="py-2 flex items-center justify-between">
                  <dt className="text-[#8A898E] flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>DNI / WhatsApp</span>
                  </dt>
                  <dd className="text-[#EDEDED] tabular-nums">
                    {apt.dni} • {apt.clientPhone}
                  </dd>
                </div>

                <div className="py-2 flex items-center justify-between">
                  <dt className="text-[#8A898E] flex items-center gap-1.5">
                    <Scissors className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Servicio</span>
                  </dt>
                  <dd className="font-semibold text-[#EDEDED]">
                    {apt.serviceName}
                    {apt.selectedDrink ? ` (${apt.selectedDrink})` : ''}
                  </dd>
                </div>

                <div className="py-2 flex items-center justify-between">
                  <dt className="text-[#8A898E] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Fecha y hora</span>
                  </dt>
                  <dd className="font-bold text-[#D4AF37] tabular-nums">
                    {apt.date} • {apt.time} hs
                  </dd>
                </div>
              </dl>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleOpenResponseModal(apt)}
                  className="px-3.5 py-2.5 rounded-xl bg-[#101012] border border-white/[0.1] text-[#EDEDED] hover:border-[#D4AF37] text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors"
                  title="Responder con mensaje editable de WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>Responder WA</span>
                </button>

                <button
                  type="button"
                  onClick={() => onCancel(apt.id)}
                  className="px-3.5 py-2.5 rounded-xl bg-[#101012] border border-white/[0.1] text-[#8A898E] hover:text-rose-400 hover:border-rose-500/30 text-xs font-mono font-semibold transition-colors"
                  title="Rechazar solicitud"
                >
                  <X className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onConfirm(apt.id)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#D4AF37] hover:bg-[#c29e2f] active:scale-[0.98] text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <Check className="w-4 h-4 stroke-[2]" />
                  <span>Confirmar</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <EditableMessageModal
        isOpen={messageModal.isOpen}
        onClose={() => setMessageModal((prev) => ({ ...prev, isOpen: false }))}
        recipientName={messageModal.recipientName}
        recipientPhone={messageModal.recipientPhone}
        initialMessage={messageModal.initialMessage}
        title={messageModal.title}
        badge={messageModal.badge}
        suggestedTemplates={messageModal.suggestedTemplates}
      />
    </div>
  );
}
