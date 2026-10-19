import React, { useState } from 'react';
import { Cake, MessageCircle, Calendar, Sparkles, Gift } from 'lucide-react';
import EditableMessageModal from './EditableMessageModal';

export default function BirthdaySection({
  birthdaysData = { thisWeek: [], thisMonth: [] }
}) {
  const [tab, setTab] = useState('week');

  const { thisWeek = [], thisMonth = [] } = birthdaysData;
  const currentList = tab === 'week' ? thisWeek : thisMonth;

  // Editable Message Modal State
  const [messageModal, setMessageModal] = useState({
    isOpen: false,
    recipientName: '',
    recipientPhone: '',
    initialMessage: '',
    title: '',
    badge: '',
    suggestedTemplates: []
  });

  const handleOpenBirthdayGreeting = (client) => {
    const firstName = client.firstName || client.name || 'Socio';
    const templates = [
      {
        label: 'Promo Regalo VIP',
        text: `Hola ${firstName}! Muy feliz cumpleaños! Quería regalarte un beneficio especial en tu próximo corte de autor conmigo. ¿Querés que te reserve un lugar en el sillón para esta semana?`
      },
      {
        label: 'Bebida de Cortesía + Corte',
        text: `Muy feliz cumple ${firstName}! En tu semana de cumpleaños, venite que el brindis en el sillón va por mi cuenta mientras renovás tu estilo. Avisame y te aseguro turno!`
      },
      {
        label: 'Saludo Personalizado',
        text: `Hola ${firstName}! Te mando un gran saludo de cumpleaños! Que disfrutes mucho tu día. Cuando quieras renovar corte, avisame y te guardo un lugar en el sillón!`
      }
    ];

    setMessageModal({
      isOpen: true,
      recipientName: `${client.firstName || client.name || 'Socio'} ${client.lastName || ''}`.trim(),
      recipientPhone: client.phone || '',
      title: 'Saludo de Cumpleaños VIP',
      badge: client.isToday ? '¡CUMPLE HOY!' : 'SALUDO DE CUMPLEAÑOS',
      initialMessage: templates[0].text,
      suggestedTemplates: templates
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-[#141416] border border-white/[0.08] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#101012] border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center">
            <Cake className="w-5 h-5 stroke-[1.5]" />
          </div>
          <div>
            <span className="micro-technical block text-[9px] text-[#D4AF37]">
              PROGRAMA DE FIDELIDAD VIP
            </span>
            <h2 className="text-base font-display font-bold text-[#EDEDED]">
              Cumpleaños de Socios
            </h2>
            <p className="text-xs text-[#8A898E]">
              Enviá saludos y beneficios especiales con plantillas 100% editables.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#101012] border border-white/[0.08]">
          <button
            type="button"
            onClick={() => setTab('week')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
              tab === 'week'
                ? 'bg-white/[0.1] text-[#EDEDED] border border-[#D4AF37] font-bold'
                : 'text-[#8A898E] hover:text-[#EDEDED]'
            }`}
          >
            Esta Semana ({thisWeek.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('month')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
              tab === 'month'
                ? 'bg-white/[0.1] text-[#EDEDED] border border-white/[0.2] font-bold'
                : 'text-[#8A898E] hover:text-[#EDEDED]'
            }`}
          >
            Este Mes ({thisMonth.length})
          </button>
        </div>
      </div>

      {/* Birthday Cards Grid */}
      {currentList.length === 0 ? (
        <div className="p-8 rounded-2xl bg-[#141416] border border-white/[0.08] text-center space-y-2">
          <Cake className="w-7 h-7 text-[#8A898E] mx-auto stroke-[1.5]" />
          <h3 className="text-sm font-display font-bold text-[#EDEDED]">
            Sin cumpleañeros en este período
          </h3>
          <p className="text-xs font-mono text-[#8A898E]">
            Los socios que cumplan años próximamente aparecerán acá automáticamente.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {currentList.map((client) => {
            const isToday = client.isToday;
            const daysUntil = client.daysUntil;

            return (
              <div
                key={client.id || client.dni}
                className={`p-4 sm:p-5 rounded-2xl border bg-[#141416] flex items-center justify-between gap-4 transition-all shadow-sm ${
                  isToday
                    ? 'border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.15)] ring-1 ring-[#D4AF37]'
                    : 'border-white/[0.08] hover:border-white/[0.15]'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-display font-bold text-[#EDEDED]">
                      {client.firstName || client.name || 'Socio'} {client.lastName || ''}
                    </h3>

                    {isToday ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-[#D4AF37] text-black flex items-center gap-1">
                        <Gift className="w-2.5 h-2.5" />
                        <span>Cumple Hoy</span>
                      </span>
                    ) : daysUntil !== undefined ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-[#101012] text-[#D4AF37] border border-[#D4AF37]/30">
                        {daysUntil === 1 ? 'Mañana' : daysUntil > 0 ? `En ${daysUntil} días` : 'Esta semana'}
                      </span>
                    ) : null}
                  </div>

                  <p className="text-xs font-mono text-[#8A898E] tabular-nums">
                    DNI {client.dni} • Fecha: {client.birthDate} • {client.phone || 'Sin WhatsApp'}
                  </p>

                  <p className="text-xs font-mono text-emerald-400 tabular-nums">
                    {client.totalCuts || 0} cortes realizados • {client.points || 0} PTS
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenBirthdayGreeting(client)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm shrink-0 ${
                    isToday
                      ? 'bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-white'
                      : 'bg-[#101012] border border-white/[0.1] text-[#EDEDED] hover:border-[#D4AF37]'
                  }`}
                  title="Enviar saludo editable por WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5 stroke-[2]" />
                  <span>Saludar</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Reutilizable de Mensajes Editables */}
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
