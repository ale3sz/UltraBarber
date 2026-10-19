import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Calendar,
  DollarSign,
  UserX,
  Plus,
  Ban,
  Trash2,
  X,
  Check,
  Bell,
  MessageCircle,
  Scissors,
  Beer,
  Sparkles,
  Clock,
  ChevronLeft,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import EditableMessageModal from './EditableMessageModal';
import { formatLocalDate } from '../../utils/date';

export default function DailyAgenda({
  appointments = [],
  clients = [],
  services = [],
  blockedSlots = [],
  selectedDate,
  setSelectedDate,
  onOpenPaymentModal,
  onNoShow,
  onConfirm,
  onCreateManualTurn,
  onAddBlockedSlot,
  onRemoveBlockedSlot
}) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [showManualModal, setShowManualModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);

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

  // Manual Turn Form State
  const [mDni, setMDni] = useState('');
  const [mFirstName, setMFirstName] = useState('');
  const [mLastName, setMLastName] = useState('');
  const [mPhone, setMPhone] = useState('');
  const [mServiceId, setMServiceId] = useState(services[0]?.id || 'corte');
  const [mTime, setMTime] = useState('16:15');

  // Block Slot Form State
  const [bTime, setBTime] = useState('12:45');
  const [bReason, setBReason] = useState('Almuerzo / Trámite personal');

  const scheduleSlots = [
    '09:00', '09:45', '10:30', '11:15', '12:00', '12:45',
    '14:00', '14:45', '15:30', '16:15', '17:00', '17:45', '18:30', '19:15'
  ];

  // Quick Date Navigation
  const handleShiftDate = (days) => {
    const parts = selectedDate.split('-');
    const cur = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    cur.setDate(cur.getDate() + days);
    setSelectedDate(formatLocalDate(cur));
  };

  const handleSetToday = () => {
    setSelectedDate(formatLocalDate(new Date()));
  };

  const handleSetTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    setSelectedDate(formatLocalDate(d));
  };

  // Appointments for the currently selected date
  const dateAppointments = appointments.filter((apt) => apt.date === selectedDate);

  const filtered = dateAppointments.filter((apt) => {
    if (filterStatus === 'all') return true;
    return apt.status === filterStatus;
  });

  const dateBlocks = blockedSlots.filter((b) => b.date === selectedDate);

  // Daily KPI calculations
  const confirmedCount = dateAppointments.filter((a) => a.status === 'confirmado').length;
  const finalizedCount = dateAppointments.filter((a) => a.status === 'finalizado').length;
  const pendingCount = dateAppointments.filter((a) => a.status === 'pendiente').length;

  const projectedRevenue = dateAppointments
    .filter((a) => a.status !== 'cancelado' && a.status !== 'no_asistio')
    .reduce((sum, a) => sum + (Number(a.price) || 0), 0);

  const collectedRevenue = dateAppointments
    .filter((a) => a.status === 'finalizado')
    .reduce((sum, a) => sum + (Number(a.amountPaid) || 0), 0);

  const occupancyRate = Math.min(100, Math.round((dateAppointments.length / scheduleSlots.length) * 100));

  // Client lookup map for instant style DNA retrieval
  const clientsMap = React.useMemo(() => {
    const map = new Map();
    clients.forEach((c) => {
      if (c.dni) map.set(String(c.dni).trim(), c);
    });
    return map;
  }, [clients]);

  // Open Message Modal for single appointment reminder
  const handleOpenReminderModal = (apt) => {
    const clientName = apt.clientName?.split(' ')[0] || 'amigo';
    const client = clientsMap.get(String(apt.dni).trim());
    const hairStyle = client?.hairStyle ? ` (${client.hairStyle})` : '';

    const templates = [
      {
        label: 'Hoy (Unas horas antes)',
        text: `Hola ${clientName}! Te escribe David para recordarte tu turno de hoy a las ${apt.time} hs (${apt.serviceName}${hairStyle}). Te espero puntual en el sillón! Avisame cualquier duda.`
      },
      {
        label: 'En 1 Hora (En camino)',
        text: `Hola ${clientName}! En 1 hora te espero en el sillón (${apt.time} hs) para tu sesión de ${apt.serviceName}. Ya tengo todo listo!`
      },
      {
        label: 'Turno de Mañana',
        text: `Hola ${clientName}! Te recuerdo tu turno para mañana ${apt.date} a las ${apt.time} hs conmigo (${apt.serviceName}). Te espero puntual en el sillón!`
      },
      {
        label: 'Confirmación Urgente',
        text: `Hola ${clientName}! Por favor confirmame si asistís a tu turno de hoy a las ${apt.time} hs conmigo. Respondeme por acá así te guardo el lugar. Gracias!`
      }
    ];

    setMessageModal({
      isOpen: true,
      recipientName: apt.clientName || 'Cliente',
      recipientPhone: apt.clientPhone || client?.phone || '',
      title: 'Recordatorio de Turno WhatsApp',
      badge: `TURNO #${apt.code} • ${apt.time} HS`,
      initialMessage: templates[0].text,
      suggestedTemplates: templates
    });
  };

  // Batch action: Tomorrow's confirmed appointments
  const tomorrowStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return formatLocalDate(d);
  })();

  const tomorrowConfirmed = appointments.filter(
    (a) => a.date === tomorrowStr && a.status === 'confirmado'
  );

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!mDni || !mFirstName || !mTime) return;
    await onCreateManualTurn({
      dni: mDni,
      firstName: mFirstName,
      lastName: mLastName,
      phone: mPhone,
      serviceId: mServiceId,
      date: selectedDate,
      time: mTime
    });
    setShowManualModal(false);
    setMDni('');
    setMFirstName('');
    setMLastName('');
    setMPhone('');
  };

  const handleBlockSubmit = async (e) => {
    e.preventDefault();
    await onAddBlockedSlot({
      date: selectedDate,
      time: bTime,
      reason: bReason
    });
    setShowBlockModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Executive Daily Bento Header (100% Space Utilization) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#141416] border border-white/[0.08] shadow-sm space-y-4">
        {/* Row 1: Date Navigation & Quick Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-[#101012] border border-white/[0.1] rounded-xl p-1">
              <button
                type="button"
                onClick={() => handleShiftDate(-1)}
                className="p-1.5 rounded-lg text-[#8A898E] hover:text-[#EDEDED] hover:bg-white/[0.05]"
                title="Día anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 px-2">
                <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-[#EDEDED] text-xs font-mono font-bold focus:outline-none cursor-pointer"
                />
              </div>

              <button
                type="button"
                onClick={() => handleShiftDate(1)}
                className="p-1.5 rounded-lg text-[#8A898E] hover:text-[#EDEDED] hover:bg-white/[0.05]"
                title="Día siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick date jumps */}
            <div className="flex items-center gap-1 text-xs font-mono">
              <button
                type="button"
                onClick={handleSetToday}
                className="px-2.5 py-1.5 rounded-xl bg-[#101012] border border-white/[0.08] hover:border-white/[0.2] text-[#8A898E] hover:text-[#EDEDED]"
              >
                Hoy
              </button>
              <button
                type="button"
                onClick={handleSetTomorrow}
                className="px-2.5 py-1.5 rounded-xl bg-[#101012] border border-white/[0.08] hover:border-white/[0.2] text-[#8A898E] hover:text-[#EDEDED]"
              >
                Mañana
              </button>
            </div>
          </div>

          {/* Quick Schedule Management Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {tomorrowConfirmed.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  const first = tomorrowConfirmed[0];
                  handleOpenReminderModal(first);
                }}
                className="px-3 py-2 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/25 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
                title="Enviar recordatorio por WhatsApp a los confirmados de mañana"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Recordar Mañana ({tomorrowConfirmed.length})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowBlockModal(true)}
              className="px-3 py-2 rounded-xl bg-[#101012] border border-white/[0.1] text-xs font-mono text-[#8A898E] hover:text-[#EDEDED] hover:border-white/[0.2] flex items-center gap-1.5 transition-colors"
            >
              <Ban className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Bloquear Horario</span>
            </button>

            <button
              type="button"
              onClick={() => setShowManualModal(true)}
              className="px-3.5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#c29e2f] active:scale-[0.98] text-black text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2]" />
              <span>Turno Manual</span>
            </button>
          </div>
        </div>

        {/* Row 2: Daily Executive KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-[#101012] border border-white/[0.06]">
            <span className="text-[10px] text-[#8A898E] block uppercase">Agendados Hoy</span>
            <strong className="text-base font-bold text-[#EDEDED] block tabular-nums">
              {dateAppointments.length} turnos
            </strong>
          </div>

          <div className="p-2.5 rounded-xl bg-[#101012] border border-white/[0.06]">
            <span className="text-[10px] text-[#8A898E] block uppercase">Confirmados</span>
            <strong className="text-base font-bold text-emerald-400 block tabular-nums">
              {confirmedCount}
            </strong>
          </div>

          <div className="p-2.5 rounded-xl bg-[#101012] border border-white/[0.06]">
            <span className="text-[10px] text-[#8A898E] block uppercase">Cobrados</span>
            <strong className="text-base font-bold text-[#D4AF37] block tabular-nums">
              {finalizedCount}
            </strong>
          </div>

          <div className="p-2.5 rounded-xl bg-[#101012] border border-white/[0.06]">
            <span className="text-[10px] text-[#8A898E] block uppercase">Caja Hoy</span>
            <strong className="text-base font-bold text-emerald-400 block tabular-nums">
              ${collectedRevenue.toLocaleString('es-AR')}
            </strong>
            <span className="text-[9px] text-[#8A898E] block tabular-nums">
              Proy: ${projectedRevenue.toLocaleString('es-AR')}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#101012] border border-white/[0.06]">
            <span className="text-[10px] text-[#8A898E] block uppercase">Ocupación Sillón</span>
            <div className="flex items-center gap-2 mt-0.5">
              <strong className="text-base font-bold text-[#EDEDED] tabular-nums">
                {occupancyRate}%
              </strong>
              <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#D4AF37] h-full rounded-full transition-all"
                  style={{ width: `${occupancyRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 text-xs">
          {[
            { id: 'all', label: 'Todos', count: dateAppointments.length },
            { id: 'confirmado', label: 'Confirmados', count: confirmedCount },
            { id: 'finalizado', label: 'Cobrados', count: finalizedCount },
            { id: 'pendiente', label: 'Pendientes', count: pendingCount },
            { id: 'no_asistio', label: 'No Asistió', count: dateAppointments.filter(a => a.status === 'no_asistio').length }
          ].map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => setFilterStatus(st.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                filterStatus === st.id
                  ? 'bg-white/[0.1] border-[#D4AF37] text-[#EDEDED] font-bold'
                  : 'bg-[#101012] border-white/[0.06] text-[#8A898E] hover:text-[#EDEDED]'
              }`}
            >
              <span>{st.label}</span>
              <span className="text-[10px] font-bold tabular-nums text-[#D4AF37]">
                ({st.count})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Blocked Slots */}
      {dateBlocks.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-[#141416] border border-white/[0.08] flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-mono text-xs text-[#D4AF37] flex items-center gap-1.5">
            <Ban className="w-3.5 h-3.5" />
            <span>Bloqueos activos en esta fecha:</span>
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {dateBlocks.map((b) => (
              <span
                key={b.id}
                className="px-2.5 py-1 rounded-xl bg-[#101012] border border-white/[0.08] font-mono text-xs text-[#EDEDED] flex items-center gap-2"
              >
                <span>
                  {b.time === 'ALL' ? 'DÍA COMPLETO CERRADO' : `${b.time} hs`} ({b.reason})
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveBlockedSlot(b.id)}
                  className="text-rose-400 hover:text-rose-300 p-0.5"
                  title="Desbloquear horario"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Appointments List (High Efficiency Bento Grid) */}
      {filtered.length === 0 ? (
        <div className="p-8 rounded-2xl bg-[#141416] border border-white/[0.08] text-center space-y-2">
          <Clock className="w-6 h-6 text-[#8A898E] mx-auto stroke-[1.5]" />
          <h3 className="text-sm font-display font-bold text-[#EDEDED]">
            No hay turnos registrados para esta fecha
          </h3>
          <p className="text-xs font-mono text-[#8A898E]">
            Podés agendar un turno manual o seleccionar otra fecha con el calendario superior.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((apt) => {
            const isConfirmed = apt.status === 'confirmado';
            const isFinalized = apt.status === 'finalizado';
            const isPending = apt.status === 'pendiente';
            const isNoShow = apt.status === 'no_asistio';

            const client = clientsMap.get(String(apt.dni).trim());

            return (
              <div
                key={apt.id}
                className="p-4 sm:p-5 rounded-2xl bg-[#141416] border border-white/[0.08] hover:border-white/[0.15] transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm"
              >
                {/* Left: Time badge & Client Identity */}
                <div className="flex items-start gap-4">
                  <div className="px-3.5 py-2 rounded-xl bg-[#101012] text-center border border-white/[0.08] shrink-0">
                    <span className="text-lg font-mono font-extrabold text-[#D4AF37] block tabular-nums">
                      {apt.time}
                    </span>
                    <span className="text-[10px] font-mono text-[#8A898E] tabular-nums block">
                      #{apt.code}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-display font-bold text-[#EDEDED]">
                        {apt.clientName}
                      </h3>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                          isConfirmed
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : isFinalized
                            ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30'
                            : isNoShow
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            : 'bg-white/[0.05] text-[#8A898E] border border-white/[0.1]'
                        }`}
                      >
                        {apt.status === 'no_asistio' ? 'No Asistió' : apt.status}
                      </span>

                      {client && (client.totalCuts || 0) >= 5 && (
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                          SOCIO VIP
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#8A898E] font-mono tabular-nums">
                      DNI {apt.dni} • {apt.serviceName}
                      {apt.selectedDrink ? ` (${apt.selectedDrink})` : ''} • ${apt.price?.toLocaleString('es-AR')}
                    </p>

                    {/* ADN de Estilo Pill (Instant Intelligence for David) */}
                    {client && (client.hairStyle || client.preferredDrink || client.preferredProduct) && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        {client.hairStyle && (
                          <span className="px-2 py-0.5 rounded bg-[#101012] border border-white/[0.06] text-[10px] font-mono text-[#EDEDED] flex items-center gap-1">
                            <Scissors className="w-2.5 h-2.5 text-[#D4AF37]" />
                            <span>{client.hairStyle}</span>
                          </span>
                        )}
                        {client.preferredDrink && (
                          <span className="px-2 py-0.5 rounded bg-[#101012] border border-white/[0.06] text-[10px] font-mono text-[#D4AF37] flex items-center gap-1">
                            <Beer className="w-2.5 h-2.5" />
                            <span>{client.preferredDrink}</span>
                          </span>
                        )}
                        {client.preferredProduct && (
                          <span className="px-2 py-0.5 rounded bg-[#101012] border border-white/[0.06] text-[10px] font-mono text-[#8A898E]">
                            🧴 {client.preferredProduct}
                          </span>
                        )}
                      </div>
                    )}

                    {isFinalized && (
                      <p className="text-xs font-mono font-semibold text-emerald-400 tabular-nums">
                        ✓ Cobrado: ${apt.amountPaid?.toLocaleString('es-AR')} ({apt.paymentMethod}) • +1 PTO sumado
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Action Buttons */}
                <div className="flex items-center gap-2 justify-end flex-wrap shrink-0">
                  {/* WhatsApp Reminder (100% Editable) */}
                  {(isConfirmed || isPending) && (
                    <button
                      type="button"
                      onClick={() => handleOpenReminderModal(apt)}
                      className="px-3 py-2 rounded-xl border border-white/[0.1] bg-[#101012] text-[#D4AF37] hover:border-[#D4AF37] text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors"
                      title="Enviar recordatorio editable por WhatsApp"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>Recordar (WA)</span>
                    </button>
                  )}

                  {isConfirmed && (
                    <>
                      <button
                        type="button"
                        onClick={() => onNoShow(apt.id)}
                        className="px-3 py-2 rounded-xl border border-white/[0.08] text-xs font-mono text-[#8A898E] hover:text-rose-400 hover:border-rose-500/30 flex items-center gap-1.5 transition-colors"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>No Asistió</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenPaymentModal(apt)}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-black text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        <DollarSign className="w-4 h-4 stroke-[2]" />
                        <span>Cobrar y Finalizar</span>
                      </button>
                    </>
                  )}

                  {isPending && (
                    <button
                      type="button"
                      onClick={() => onConfirm(apt.id)}
                      className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#c29e2f] active:scale-[0.98] text-black text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <Check className="w-4 h-4 stroke-[2]" />
                      <span>Confirmar</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Nuevo Turno Manual */}
      {showManualModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-enter">
          <div className="w-full max-w-md rounded-2xl bg-[#141416] border border-white/[0.1] p-6 text-[#EDEDED] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <span className="micro-technical block text-[9px] text-[#D4AF37]">
                  ADMINISTRACIÓN RÁPIDA
                </span>
                <h3 className="text-base font-display font-bold text-[#EDEDED]">
                  Agendar Turno Manual ({selectedDate})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowManualModal(false)}
                className="p-1.5 rounded-lg text-[#8A898E] hover:text-[#EDEDED]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#8A898E] mb-1">DNI del Cliente</label>
                  <input
                    type="text"
                    required
                    value={mDni}
                    onChange={(e) => setMDni(e.target.value.replace(/\D/g, ''))}
                    placeholder="Ej: 42123456"
                    className="w-full px-3 py-2 rounded-xl bg-[#101012] border border-white/[0.1] text-[#EDEDED] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#8A898E] mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    value={mFirstName}
                    onChange={(e) => setMFirstName(e.target.value)}
                    placeholder="Ej: Juan"
                    className="w-full px-3 py-2 rounded-xl bg-[#101012] border border-white/[0.1] text-[#EDEDED]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#8A898E] mb-1">Apellido (opcional)</label>
                  <input
                    type="text"
                    value={mLastName}
                    onChange={(e) => setMLastName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#101012] border border-white/[0.1] text-[#EDEDED]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#8A898E] mb-1">WhatsApp</label>
                  <input
                    type="text"
                    value={mPhone}
                    onChange={(e) => setMPhone(e.target.value)}
                    placeholder="Ej: 3415551234"
                    className="w-full px-3 py-2 rounded-xl bg-[#101012] border border-white/[0.1] text-[#EDEDED] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#8A898E] mb-1">Servicio</label>
                  <select
                    value={mServiceId}
                    onChange={(e) => setMServiceId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#101012] border border-white/[0.1] text-[#EDEDED]"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} {s.price > 0 ? `($${s.price.toLocaleString('es-AR')})` : '(A coordinar)'}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#8A898E] mb-1">Horario</label>
                  <select
                    value={mTime}
                    onChange={(e) => setMTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#101012] border border-white/[0.1] text-[#EDEDED] font-mono"
                  >
                    {scheduleSlots.map((time) => (
                      <option key={time} value={time}>
                        {time} hs
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 rounded-xl border border-white/[0.1] text-[#8A898E]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#c29e2f] text-black font-mono font-bold uppercase tracking-wider"
                >
                  Confirmar Turno
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal: Bloquear Horario */}
      {showBlockModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-enter">
          <div className="w-full max-w-sm rounded-2xl bg-[#141416] border border-white/[0.1] p-6 text-[#EDEDED] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <span className="micro-technical block text-[9px] text-[#D4AF37]">
                  DISPONIBILIDAD
                </span>
                <h3 className="text-base font-display font-bold text-[#EDEDED]">
                  Bloquear Horario ({selectedDate})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBlockModal(false)}
                className="p-1.5 rounded-lg text-[#8A898E] hover:text-[#EDEDED]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBlockSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#8A898E] mb-1">Horario a bloquear</label>
                <select
                  value={bTime}
                  onChange={(e) => setBTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#101012] border border-white/[0.1] text-[#EDEDED] font-mono"
                >
                  <option value="ALL">DÍA COMPLETO (Cerrado)</option>
                  {scheduleSlots.map((time) => (
                    <option key={time} value={time}>
                      {time} hs
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#8A898E] mb-1">Motivo</label>
                <input
                  type="text"
                  value={bReason}
                  onChange={(e) => setBReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#101012] border border-white/[0.1] text-[#EDEDED]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowBlockModal(false)}
                  className="px-4 py-2 rounded-xl border border-white/[0.1] text-[#8A898E]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-mono font-bold uppercase tracking-wider"
                >
                  Bloquear
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
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
