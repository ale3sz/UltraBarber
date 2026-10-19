import React, { useState } from 'react';
import {
  Phone,
  Clock,
  Save,
  X,
  CheckCircle,
  Shield,
  KeyRound,
  Scissors,
  Calendar,
  ToggleLeft,
  ToggleRight,
  CalendarDays,
  Gift
} from 'lucide-react';
import { api } from '../../services/api';
import AnnualCalendarSchedule from './AnnualCalendarSchedule';
import ClubBenefitsSettings from './ClubBenefitsSettings';

export default function SettingsModal({
  config = {},
  services = [],
  onClose,
  onSaved
}) {
  const [activeTab, setActiveTab] = useState('annual'); // 'annual' | 'schedule' | 'club' | 'general' | 'prices' | 'security'
  const [whatsappPhone, setWhatsappPhone] = useState(config.whatsappPhone || '5493413762115');
  const [holdDurationMinutes, setHoldDurationMinutes] = useState(config.holdDurationMinutes || 15);
  const [address, setAddress] = useState(config.address || 'Eva Perón 52 • Studio Privado');

  // Working days (0: Dom, 1: Lun, 2: Mar, 3: Mié, 4: Jue, 5: Vie, 6: Sáb)
  const [workingDays, setWorkingDays] = useState(config.workingDays || [1, 2, 3, 4, 5, 6]);

  // Disabled regular slots (David can toggle off slots he does not want to offer, e.g. '12:45' or '14:00')
  const [disabledSlots, setDisabledSlots] = useState(config.disabledSlots || []);

  // Weekly schedule map { '2026-W42': { workingDays: [...], disabledSlots: [...] } }
  const [weeklySchedule, setWeeklySchedule] = useState(config.weeklySchedule || {});

  // Club benefits and redeemables
  const [clubBenefits, setClubBenefits] = useState(config.clubBenefits || []);
  const [redeemables, setRedeemables] = useState(config.redeemables || []);

  const [servicePrices, setServicePrices] = useState(() => {
    const map = {};
    services.forEach((s) => {
      map[s.id] = s.price;
    });
    return map;
  });

  // Security password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newDni, setNewDni] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const allPossibleSlots = [
    '09:00', '09:45', '10:30', '11:15', '12:00', '12:45',
    '14:00', '14:45', '15:30', '16:15', '17:00', '17:45', '18:30', '19:15'
  ];

  const daysOfWeek = [
    { id: 1, name: 'Lunes' },
    { id: 2, name: 'Martes' },
    { id: 3, name: 'Miércoles' },
    { id: 4, name: 'Jueves' },
    { id: 5, name: 'Viernes' },
    { id: 6, name: 'Sábado' },
    { id: 0, name: 'Domingo' }
  ];

  const toggleDay = (dayId) => {
    if (workingDays.includes(dayId)) {
      setWorkingDays(workingDays.filter((d) => d !== dayId));
    } else {
      setWorkingDays([...workingDays, dayId].sort());
    }
  };

  const toggleSlot = (timeStr) => {
    if (disabledSlots.includes(timeStr)) {
      setDisabledSlots(disabledSlots.filter((t) => t !== timeStr));
    } else {
      setDisabledSlots([...disabledSlots, timeStr]);
    }
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedbackMsg('');
    try {
      const res = await api.updateConfigByAdmin({
        workingDays,
        disabledSlots
      });
      if (onSaved) onSaved(res.config);
      setFeedbackMsg('Días de atención y horarios actualizados correctamente.');
    } catch (err) {
      setFeedbackMsg(err.message || 'Error al guardar.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveGeneral = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedbackMsg('');
    try {
      const res = await api.updateConfigByAdmin({
        whatsappPhone: whatsappPhone.trim(),
        holdDurationMinutes: Number(holdDurationMinutes),
        address: address.trim()
      });
      if (onSaved) onSaved(res.config);
      setFeedbackMsg('Datos de contacto y local actualizados.');
    } catch (err) {
      setFeedbackMsg(err.message || 'Error al guardar.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePrices = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedbackMsg('');
    try {
      for (const s of services) {
        const updatedPrice = Number(servicePrices[s.id]);
        if (updatedPrice && updatedPrice !== s.price) {
          await api.updateServiceByAdmin(s.id, { price: updatedPrice });
        }
      }
      if (onSaved) onSaved();
      setFeedbackMsg('Lista de precios actualizada en vivo.');
    } catch (err) {
      setFeedbackMsg(err.message || 'Error al actualizar precios.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCredentials = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedbackMsg('');
    try {
      await api.updateAdminCredentials({
        currentPassword,
        newUsername: newUsername.trim() || undefined,
        newPassword: newPassword.trim() || undefined,
        newDni: newDni.trim() || undefined
      });
      setCurrentPassword('');
      setNewPassword('');
      setFeedbackMsg('Credenciales y DNI de acceso de David actualizados.');
    } catch (err) {
      setFeedbackMsg(err.message || 'Contraseña actual incorrecta.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAnnualSchedule = async (schedulePayload) => {
    setIsSaving(true);
    setFeedbackMsg('');
    try {
      const res = await api.updateConfigByAdmin(schedulePayload);
      if (schedulePayload.weeklySchedule) setWeeklySchedule(schedulePayload.weeklySchedule);
      if (schedulePayload.workingDays) setWorkingDays(schedulePayload.workingDays);
      if (schedulePayload.disabledSlots) setDisabledSlots(schedulePayload.disabledSlots);
      if (onSaved) onSaved(res.config);
      setFeedbackMsg('Calendario anual de semanas actualizado correctamente.');
    } catch (err) {
      setFeedbackMsg(err.message || 'Error al guardar calendario.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveClubSettings = async (clubPayload) => {
    setIsSaving(true);
    setFeedbackMsg('');
    try {
      const res = await api.updateConfigByAdmin(clubPayload);
      if (clubPayload.clubBenefits) setClubBenefits(clubPayload.clubBenefits);
      if (clubPayload.redeemables) setRedeemables(clubPayload.redeemables);
      if (onSaved) onSaved(res.config);
      setFeedbackMsg('Beneficios y canjeables actualizados.');
    } catch (err) {
      setFeedbackMsg(err.message || 'Error al guardar beneficios.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-4xl rounded-3xl bg-barber-darkSurface border border-barber-darkBorder text-barber-darkText club-shadow flex flex-col max-h-[90vh] overflow-hidden">
        {/* Sticky Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-barber-darkBorder shrink-0 bg-barber-darkSurface">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-barber-chai" />
            <h3 className="text-lg font-display font-bold text-barber-darkText">
              Configuración de ULTRA BARBER Studio
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-barber-pistache hover:text-barber-darkText transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 pt-4 space-y-5 overflow-y-auto">

        {/* Subtabs */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-1.5 p-1 rounded-2xl bg-barber-darkBg border border-barber-darkBorder text-xs font-bold">
          <button
            type="button"
            onClick={() => { setActiveTab('annual'); setFeedbackMsg(''); }}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'annual' ? 'bg-barber-matcha text-white' : 'text-barber-pistache'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Calendario</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('schedule'); setFeedbackMsg(''); }}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'schedule' ? 'bg-barber-matcha text-white' : 'text-barber-pistache'
            }`}
          >
            Plantilla
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('club'); setFeedbackMsg(''); }}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'club' ? 'bg-barber-matcha text-white' : 'text-barber-pistache'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Beneficios</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('general'); setFeedbackMsg(''); }}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'general' ? 'bg-barber-matcha text-white' : 'text-barber-pistache'
            }`}
          >
            Local
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('prices'); setFeedbackMsg(''); }}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'prices' ? 'bg-barber-matcha text-white' : 'text-barber-pistache'
            }`}
          >
            Precios
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('security'); setFeedbackMsg(''); }}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'security' ? 'bg-barber-matcha text-white' : 'text-barber-pistache'
            }`}
          >
            Clave
          </button>
        </div>

        {feedbackMsg && (
          <div className="p-3.5 rounded-2xl bg-barber-matcha/20 border border-barber-matcha text-xs text-barber-darkText flex items-center gap-2 font-medium">
            <CheckCircle className="w-4 h-4 text-barber-matcha shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* 0. CALENDARIO ANUAL POR SEMANAS */}
        {activeTab === 'annual' && (
          <div className="space-y-4">
            <AnnualCalendarSchedule
              defaultWorkingDays={workingDays}
              defaultDisabledSlots={disabledSlots}
              weeklySchedule={weeklySchedule}
              onSaveSchedule={handleSaveAnnualSchedule}
              allSlots={allPossibleSlots}
            />
          </div>
        )}

        {/* 0B. BENEFICIOS Y CANJEABLES CON STOCK */}
        {activeTab === 'club' && (
          <div className="space-y-4">
            <ClubBenefitsSettings
              clubBenefits={clubBenefits}
              redeemables={redeemables}
              onSave={handleSaveClubSettings}
            />
          </div>
        )}

        {/* 1. PLANTILLA SEMANAL GENERAL (Control predeterminado) */}
        {activeTab === 'schedule' && (
          <form onSubmit={handleSaveSchedule} className="space-y-5 text-xs">
            <div>
              <div className="flex items-center gap-2 mb-2 font-display font-bold text-sm text-barber-darkText">
                <Calendar className="w-4 h-4 text-barber-chai" />
                <span>Días en los que trabajás</span>
              </div>
              <p className="text-barber-pistache mb-3">
                Seleccioná qué días de la semana estás en el local. Los días desmarcados no aparecerán para reservar turnos.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {daysOfWeek.map((day) => {
                  const isActive = workingDays.includes(day.id);
                  return (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => toggleDay(day.id)}
                      className={`p-3 rounded-2xl border text-center transition-all flex items-center justify-between font-semibold ${
                        isActive
                          ? 'bg-barber-matcha text-white border-barber-matcha'
                          : 'bg-barber-darkBg border-barber-darkBorder text-barber-pistache opacity-50'
                      }`}
                    >
                      <span>{day.name}</span>
                      {isActive ? (
                        <CheckCircle className="w-4 h-4 text-white" />
                      ) : (
                        <span className="text-[10px] uppercase font-mono">Cerrado</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-barber-darkBorder">
              <div className="flex items-center gap-2 mb-2 font-display font-bold text-sm text-barber-darkText">
                <Clock className="w-4 h-4 text-barber-chai" />
                <span>Horarios de turnos disponibles</span>
              </div>
              <p className="text-barber-pistache mb-3">
                Tocá los horarios que querés <strong className="text-barber-chai">habilitar</strong> o <strong className="text-red-400">quitar de la grilla</strong> (por ejemplo: horario de almuerzo o descansos).
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {allPossibleSlots.map((timeStr) => {
                  const isDisabled = disabledSlots.includes(timeStr);
                  return (
                    <button
                      key={timeStr}
                      type="button"
                      onClick={() => toggleSlot(timeStr)}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center font-mono ${
                        !isDisabled
                          ? 'bg-barber-darkBg border-barber-chai text-barber-darkText font-bold'
                          : 'bg-barber-darkBg/40 border-barber-darkBorder text-barber-pistache opacity-40 line-through'
                      }`}
                    >
                      <span className="text-sm tabular-nums">{timeStr} hs</span>
                      <span className={`text-[10px] font-sans mt-0.5 ${!isDisabled ? 'text-barber-matcha font-semibold' : 'text-red-400'}`}>
                        {!isDisabled ? 'Habilitado' : 'Quitado'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-barber-darkBorder text-barber-pistache"
              >
                Cerrar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl bg-barber-matcha text-white font-display font-bold uppercase tracking-wider flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Días y Horarios</span>
              </button>
            </div>
          </form>
        )}

        {/* 2. GENERAL (WHATSAPP & LOCAL) */}
        {activeTab === 'general' && (
          <form onSubmit={handleSaveGeneral} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-barber-matcha" />
                <span>WhatsApp receptor de David (sin + ni espacios)</span>
              </label>
              <input
                type="text"
                required
                value={whatsappPhone}
                onChange={(e) => setWhatsappPhone(e.target.value)}
                placeholder="5491123456789"
                className="w-full px-3.5 py-3 rounded-xl bg-barber-darkBg border border-barber-darkBorder text-barber-darkText font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-barber-chai" />
                <span>Minutos de bloqueo temporal antes de liberar horario</span>
              </label>
              <input
                type="number"
                min="1"
                max="60"
                required
                value={holdDurationMinutes}
                onChange={(e) => setHoldDurationMinutes(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl bg-barber-darkBg border border-barber-darkBorder text-barber-darkText font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Dirección del estudio</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl bg-barber-darkBg border border-barber-darkBorder text-barber-darkText"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-barber-darkBorder text-barber-pistache"
              >
                Cerrar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl bg-barber-matcha text-white font-display font-bold uppercase tracking-wider flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Guardar</span>
              </button>
            </div>
          </form>
        )}

        {/* 3. PRECIOS */}
        {activeTab === 'prices' && (
          <form onSubmit={handleSavePrices} className="space-y-3 text-xs">
            {services.map((s) => (
              <div
                key={s.id}
                className="p-3 rounded-2xl bg-barber-darkBg border border-barber-darkBorder flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2">
                  <Scissors className="w-3.5 h-3.5 text-barber-chai" />
                  <span className="font-semibold text-barber-darkText">{s.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-barber-chai font-bold">$</span>
                  <input
                    type="number"
                    value={servicePrices[s.id] ?? s.price}
                    onChange={(e) =>
                      setServicePrices((prev) => ({ ...prev, [s.id]: e.target.value }))
                    }
                    className="w-28 px-3 py-1.5 rounded-xl bg-barber-darkSurface border border-barber-darkBorder text-barber-darkText font-mono font-bold text-right tabular-nums"
                  />
                </div>
              </div>
            ))}

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-barber-darkBorder text-barber-pistache"
              >
                Cerrar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl bg-barber-matcha text-white font-display font-bold uppercase tracking-wider flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Actualizar Precios</span>
              </button>
            </div>
          </form>
        )}

        {/* 4. CLAVE */}
        {activeTab === 'security' && (
          <form onSubmit={handleSaveCredentials} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold mb-1">Contraseña actual *</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Contraseña actual (ej: barber2026)"
                className="w-full px-3.5 py-3 rounded-xl bg-barber-darkBg border border-barber-darkBorder text-barber-darkText font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Nuevo usuario (opcional)</label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="david"
                className="w-full px-3.5 py-3 rounded-xl bg-barber-darkBg border border-barber-darkBorder text-barber-darkText font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">DNI de Administrador (para acceso seguro)</label>
              <input
                type="text"
                value={newDni}
                onChange={(e) => setNewDni(e.target.value.replace(/\D/g, ''))}
                placeholder="Predeterminado: 11111111 (ingresá tu DNI real)"
                className="w-full px-3.5 py-3 rounded-xl bg-barber-darkBg border border-barber-darkBorder text-barber-darkText font-mono"
              />
              <span className="text-[11px] text-[#8A898E] mt-1 block">
                Cuando ingreses este DNI en la pantalla principal y toques &quot;Validar DNI&quot;, el sistema cambiará a contraseña para acceder al panel.
              </span>
            </div>

            <div>
              <label className="block font-semibold mb-1 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-barber-chai" />
                <span>Nueva contraseña (opcional)</span>
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Dejar en blanco si no querés cambiarla"
                className="w-full px-3.5 py-3 rounded-xl bg-barber-darkBg border border-barber-darkBorder text-barber-darkText font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-barber-darkBorder text-barber-pistache"
              >
                Cerrar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl bg-barber-chai text-barber-lightText font-display font-bold uppercase tracking-wider flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Cambiar Clave</span>
              </button>
            </div>
          </form>
        )}
        </div>
      </div>
    </div>
  );
}
