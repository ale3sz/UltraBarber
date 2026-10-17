import React, { useState } from 'react';
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
  MessageCircle
} from 'lucide-react';
import ReminderModal from './ReminderModal';

export default function DailyAgenda({
  appointments = [],
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
  const [reminderAppointment, setReminderAppointment] = useState(null);

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

  const filtered = appointments.filter((apt) => {
    if (selectedDate && apt.date !== selectedDate) return false;
    if (filterStatus === 'all') return true;
    return apt.status === filterStatus;
  });

  const dateBlocks = blockedSlots.filter((b) => b.date === selectedDate);

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
    <div className="space-y-5">
      {/* Top Action & Filter Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-barber-lightSurface dark:bg-barber-darkSurface border border-barber-lightBorder dark:border-barber-darkBorder flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-barber-chai" />
            <label htmlFor="agenda-date" className="text-xs font-semibold text-barber-lightText dark:text-barber-darkText">
              Fecha:
            </label>
            <input
              id="agenda-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 rounded-xl bg-barber-lightBg dark:bg-barber-darkBg border border-barber-lightBorder dark:border-barber-darkBorder text-barber-lightText dark:text-barber-darkText text-xs font-mono font-bold focus:outline-none focus:border-barber-matcha"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'confirmado', label: 'Confirmados' },
              { id: 'finalizado', label: 'Cobrados' },
              { id: 'pendiente', label: 'Pendientes' },
              { id: 'no_asistio', label: 'No Asistió' }
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setFilterStatus(st.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  filterStatus === st.id
                    ? 'bg-barber-matcha text-white'
                    : 'bg-barber-lightBg dark:bg-barber-darkBg text-barber-lightMuted dark:text-barber-darkMuted hover:text-barber-lightText dark:hover:text-barber-darkText'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Barber Quick Actions: Manual Turn & Block Schedule */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowBlockModal(true)}
            className="px-3.5 py-2.5 rounded-xl border border-barber-lightBorder dark:border-barber-darkBorder text-xs font-semibold text-barber-lightText dark:text-barber-darkText hover:border-barber-chai flex items-center gap-1.5 transition-colors"
          >
            <Ban className="w-3.5 h-3.5 text-barber-chai" />
            <span>Bloquear Horario</span>
          </button>

          <button
            type="button"
            onClick={() => setShowManualModal(true)}
            className="px-4 py-2.5 rounded-xl bg-barber-chai text-barber-lightText text-xs font-display font-bold uppercase tracking-wider flex items-center gap-1.5 hover:brightness-105 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Turno Manual</span>
          </button>
        </div>
      </div>

      {/* Active Blocked Slots for Selected Date */}
      {dateBlocks.length > 0 && (
        <div className="p-4 rounded-2xl bg-barber-darkSurface border border-barber-darkBorder flex flex-wrap items-center justify-between gap-2 text-xs text-barber-darkText">
          <span className="font-semibold text-barber-chai">
            Bloqueos activos en esta fecha:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {dateBlocks.map((b) => (
              <span
                key={b.id}
                className="px-3 py-1.5 rounded-xl bg-barber-darkBg border border-barber-darkBorder font-mono flex items-center gap-2"
              >
                <span>
                  {b.time === 'ALL' ? 'DÍA COMPLETO CERRADO' : `${b.time} hs`} ({b.reason})
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveBlockedSlot(b.id)}
                  className="text-red-400 hover:text-red-300"
                  title="Desbloquear horario"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Appointments List */}
      {filtered.length === 0 ? (
        <div className="p-8 rounded-3xl bg-barber-lightSurface dark:bg-barber-darkSurface border border-barber-lightBorder dark:border-barber-darkBorder text-center space-y-2">
          <h3 className="text-base font-display font-bold text-barber-lightText dark:text-barber-darkText">
            Sin turnos para el filtro seleccionado ({selectedDate})
          </h3>
          <p className="text-xs text-barber-lightMuted dark:text-barber-darkMuted">
            Podés cargar un turno presencial con el botón &ldquo;Turno Manual&rdquo; o cambiar la fecha.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((apt) => {
            const isConfirmed = apt.status === 'confirmado';
            const isFinalized = apt.status === 'finalizado';
            const isNoShow = apt.status === 'no_asistio';
            const isPending = apt.status === 'pendiente';

            return (
              <div
                key={apt.id}
                className="p-5 rounded-3xl bg-barber-lightSurface dark:bg-barber-darkSurface border border-barber-lightBorder dark:border-barber-darkBorder flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="px-3.5 py-2.5 rounded-2xl bg-barber-darkBg text-center border border-barber-darkBorder shrink-0">
                    <span className="text-lg font-mono font-extrabold text-barber-chai block tabular-nums">
                      {apt.time}
                    </span>
                    <span className="text-[11px] font-mono text-barber-pistache tabular-nums">
                      #{apt.code}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-display font-bold text-barber-lightText dark:text-barber-darkText">
                        {apt.clientName}
                      </h3>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                          isConfirmed
                            ? 'bg-barber-matcha text-white'
                            : isFinalized
                            ? 'bg-barber-chai text-barber-lightText'
                            : isNoShow
                            ? 'bg-red-500/20 text-red-500'
                            : 'bg-barber-darkBg text-barber-pistache border border-barber-darkBorder'
                        }`}
                      >
                        {apt.status === 'no_asistio' ? 'No Asistió' : apt.status}
                      </span>
                    </div>

                    <p className="text-xs text-barber-lightMuted dark:text-barber-darkMuted font-mono tabular-nums">
                      DNI {apt.dni} • {apt.serviceName}
                      {apt.selectedDrink ? ` (${apt.selectedDrink})` : ''} • ${apt.price?.toLocaleString('es-AR')}
                    </p>

                    {isFinalized && (
                      <p className="text-xs font-mono font-semibold text-barber-matcha tabular-nums">
                        Cobrado: ${apt.amountPaid?.toLocaleString('es-AR')} ({apt.paymentMethod}) • +1 PTO acreditado
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 justify-end flex-wrap">
                  {/* Recordatorio Prescrito por WhatsApp */}
                  {(isConfirmed || isPending) && (
                    <button
                      type="button"
                      onClick={() => setReminderAppointment(apt)}
                      className="px-3.5 py-2.5 rounded-xl border border-barber-chai/40 bg-barber-chai/10 text-barber-chai hover:bg-barber-chai/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      title="Enviar recordatorio preescrito por WhatsApp"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>Recordar</span>
                    </button>
                  )}
                  {isConfirmed && (
                    <>
                      <button
                        type="button"
                        onClick={() => onNoShow(apt.id)}
                        className="px-3.5 py-2.5 rounded-xl border border-barber-lightBorder dark:border-barber-darkBorder text-xs font-semibold text-barber-lightMuted dark:text-barber-darkMuted hover:text-red-500 flex items-center gap-1.5 transition-colors"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>No Asistió</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenPaymentModal(apt)}
                        className="px-4 py-2.5 rounded-xl bg-barber-matcha text-white text-xs font-display font-bold uppercase tracking-wider flex items-center gap-1.5 hover:brightness-105 transition-all"
                      >
                        <DollarSign className="w-4 h-4" />
                        <span>Cobrar y Finalizar</span>
                      </button>
                    </>
                  )}

                  {isPending && (
                    <button
                      type="button"
                      onClick={() => onConfirm(apt.id)}
                      className="px-4 py-2.5 rounded-xl bg-barber-matcha text-white text-xs font-display font-bold uppercase tracking-wider flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
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
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-barber-darkSurface border border-barber-darkBorder p-6 text-barber-darkText club-shadow space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-display font-bold text-barber-darkText">
                Agendar Turno Manual ({selectedDate})
              </h3>
              <button
                type="button"
                onClick={() => setShowManualModal(false)}
                className="p-2 text-barber-pistache hover:text-barber-darkText"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">DNI del cliente *</label>
                  <input
                    type="text"
                    required
                    value={mDni}
                    onChange={(e) => setMDni(e.target.value.replace(/\D/g, ''))}
                    placeholder="40123456"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-barber-darkBg border border-barber-darkBorder text-barber-darkText font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Celular</label>
                  <input
                    type="text"
                    value={mPhone}
                    onChange={(e) => setMPhone(e.target.value)}
                    placeholder="+54 9 11..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-barber-darkBg border border-barber-darkBorder text-barber-darkText font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={mFirstName}
                    onChange={(e) => setMFirstName(e.target.value)}
                    placeholder="Facundo"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-barber-darkBg border border-barber-darkBorder text-barber-darkText"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Apellido</label>
                  <input
                    type="text"
                    value={mLastName}
                    onChange={(e) => setMLastName(e.target.value)}
                    placeholder="López"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-barber-darkBg border border-barber-darkBorder text-barber-darkText"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Servicio *</label>
                  <select
                    value={mServiceId}
                    onChange={(e) => setMServiceId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-barber-darkBg border border-barber-darkBorder text-barber-darkText"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (${s.price.toLocaleString('es-AR')})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Horario *</label>
                  <select
                    value={mTime}
                    onChange={(e) => setMTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-barber-darkBg border border-barber-darkBorder text-barber-darkText font-mono"
                  >
                    {scheduleSlots.map((t) => (
                      <option key={t} value={t}>
                        {t} hs
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-barber-darkBorder text-barber-pistache"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-barber-matcha text-white font-display font-bold uppercase tracking-wider"
                >
                  Confirmar en Agenda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Bloquear Horario o Día Completo */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-barber-darkSurface border border-barber-darkBorder p-6 text-barber-darkText club-shadow space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-display font-bold text-barber-darkText">
                Bloquear Horario ({selectedDate})
              </h3>
              <button
                type="button"
                onClick={() => setShowBlockModal(false)}
                className="p-2 text-barber-pistache hover:text-barber-darkText"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBlockSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Horario a bloquear</label>
                <select
                  value={bTime}
                  onChange={(e) => setBTime(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl bg-barber-darkBg border border-barber-darkBorder text-barber-darkText font-mono"
                >
                  <option value="ALL">CERRAR DÍA COMPLETO (Feriado / Franco)</option>
                  {scheduleSlots.map((t) => (
                    <option key={t} value={t}>
                      Bloquear solo {t} hs
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Motivo</label>
                <input
                  type="text"
                  value={bReason}
                  onChange={(e) => setBReason(e.target.value)}
                  placeholder="Almuerzo / Médico / Franco"
                  className="w-full px-3.5 py-3 rounded-xl bg-barber-darkBg border border-barber-darkBorder text-barber-darkText"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBlockModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-barber-darkBorder text-barber-pistache"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-barber-chai text-barber-lightText font-display font-bold uppercase tracking-wider"
                >
                  Aplicar Bloqueo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Recordatorio por WhatsApp */}
      {reminderAppointment && (
        <ReminderModal
          appointment={reminderAppointment}
          onClose={() => setReminderAppointment(null)}
        />
      )}
    </div>
  );
}
