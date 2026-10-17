import React, { useState, useMemo } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Sliders,
  CalendarDays
} from 'lucide-react';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAY_NAMES = [
  { id: 1, label: 'Lun', full: 'Lunes' },
  { id: 2, label: 'Mar', full: 'Martes' },
  { id: 3, label: 'Mié', full: 'Miércoles' },
  { id: 4, label: 'Jue', full: 'Jueves' },
  { id: 5, label: 'Vie', full: 'Viernes' },
  { id: 6, label: 'Sáb', full: 'Sábado' },
  { id: 0, label: 'Dom', full: 'Domingo' }
];

export function getIsoWeekInfo(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  const weekYear = d.getUTCFullYear();
  const weekKey = `${weekYear}-W${String(weekNo).padStart(2, '0')}`;

  // Find Monday of this ISO week
  const monday = new Date(d);
  monday.setUTCDate(d.getUTCDate() - 3);

  // Find Sunday of this ISO week
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);

  return { weekKey, weekNo, weekYear, monday, sunday };
}

export default function AnnualCalendarSchedule({
  defaultWorkingDays = [1, 2, 3, 4, 5, 6],
  defaultDisabledSlots = [],
  weeklySchedule = {},
  onSaveSchedule,
  allSlots = [
    '09:00', '09:45', '10:30', '11:15', '12:00', '12:45',
    '14:00', '14:45', '15:30', '16:15', '17:00', '17:45', '18:30', '19:15'
  ]
}) {
  const today = useMemo(() => new Date(), []);
  const [selectedYear, setSelectedYear] = useState(() => today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(() => today.getMonth());

  // Current active week being edited
  const initialWeekInfo = useMemo(() => getIsoWeekInfo(today), [today]);
  const [activeWeekKey, setActiveWeekKey] = useState(initialWeekInfo.weekKey);

  // Local draft of weeklySchedule
  const [draftWeekly, setDraftWeekly] = useState(() => ({ ...weeklySchedule }));
  const [saveStatus, setSaveStatus] = useState('');

  // Calculate current week editing state
  const isWeekCustomized = Boolean(draftWeekly[activeWeekKey]);

  const activeWorkingDays = isWeekCustomized
    ? (draftWeekly[activeWeekKey].workingDays || defaultWorkingDays)
    : defaultWorkingDays;

  const activeDisabledSlots = isWeekCustomized
    ? (draftWeekly[activeWeekKey].disabledSlots || defaultDisabledSlots)
    : defaultDisabledSlots;

  // Compute weeks present in the selected month
  const monthWeeks = useMemo(() => {
    const firstDay = new Date(selectedYear, selectedMonth, 1);
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0);

    const weeks = [];
    const seen = new Set();

    let cur = new Date(firstDay);
    // Align with Monday of first day's week
    const dayOfWeek = cur.getDay() || 7;
    cur.setDate(cur.getDate() - (dayOfWeek - 1));

    while (cur <= lastDay || cur.getMonth() === selectedMonth) {
      const info = getIsoWeekInfo(cur);
      if (!seen.has(info.weekKey)) {
        seen.add(info.weekKey);
        weeks.push(info);
      }
      cur.setDate(cur.getDate() + 7);
      if (weeks.length >= 6) break;
    }
    return weeks;
  }, [selectedYear, selectedMonth]);

  // Active week detail info
  const activeWeekInfo = useMemo(() => {
    const parts = activeWeekKey.split('-W');
    const y = parseInt(parts[0], 10);
    const w = parseInt(parts[1], 10);
    // Approximate date from year and week
    const simple = new Date(Date.UTC(y, 0, 1 + (w - 1) * 7));
    return getIsoWeekInfo(simple);
  }, [activeWeekKey]);

  const handleToggleDay = (dayId) => {
    const currentDays = activeWorkingDays;
    const nextDays = currentDays.includes(dayId)
      ? currentDays.filter((d) => d !== dayId)
      : [...currentDays, dayId].sort();

    setDraftWeekly((prev) => ({
      ...prev,
      [activeWeekKey]: {
        workingDays: nextDays,
        disabledSlots: activeDisabledSlots
      }
    }));
  };

  const handleToggleSlot = (slotTime) => {
    const currentSlots = activeDisabledSlots;
    const nextSlots = currentSlots.includes(slotTime)
      ? currentSlots.filter((t) => t !== slotTime)
      : [...currentSlots, slotTime];

    setDraftWeekly((prev) => ({
      ...prev,
      [activeWeekKey]: {
        workingDays: activeWorkingDays,
        disabledSlots: nextSlots
      }
    }));
  };

  const handleResetToDefault = () => {
    setDraftWeekly((prev) => {
      const copy = { ...prev };
      delete copy[activeWeekKey];
      return copy;
    });
  };

  const handleApplyToAllFutureWeeks = () => {
    if (!window.confirm('¿Querés guardar esta configuración como el nuevo horario predeterminado para todo el año?')) return;
    onSaveSchedule({
      workingDays: activeWorkingDays,
      disabledSlots: activeDisabledSlots,
      weeklySchedule: draftWeekly
    });
    setSaveStatus('Configuración establecida como predeterminada.');
    setTimeout(() => setSaveStatus(''), 4000);
  };

  const handleSaveAll = async () => {
    try {
      await onSaveSchedule({
        weeklySchedule: draftWeekly
      });
      setSaveStatus('Calendario de semanas guardado con éxito.');
      setTimeout(() => setSaveStatus(''), 4000);
    } catch (err) {
      setSaveStatus(err.message || 'Error al guardar');
    }
  };

  const formatDateRange = (mon, sun) => {
    const d1 = mon.getDate();
    const m1 = MONTH_NAMES[mon.getMonth()].slice(0, 3);
    const d2 = sun.getDate();
    const m2 = MONTH_NAMES[sun.getMonth()].slice(0, 3);
    return `${d1} ${m1} — ${d2} ${m2}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Annual & Month Navigator */}
      <div className="p-4 sm:p-5 rounded-3xl bg-barber-darkBg border border-barber-darkBorder space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-barber-chai" />
            <h4 className="text-base font-display font-bold text-barber-darkText">
              Calendario Anual de Horarios
            </h4>
          </div>

          <div className="flex items-center gap-2">
            {/* Year selector buttons */}
            <div className="flex items-center rounded-xl bg-barber-darkSurface border border-barber-darkBorder p-0.5 text-xs font-mono font-bold">
              <button
                type="button"
                onClick={() => setSelectedYear((y) => y - 1)}
                className="px-2.5 py-1.5 rounded-lg hover:text-white"
                title="Año anterior"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-barber-chai">{selectedYear}</span>
              <button
                type="button"
                onClick={() => setSelectedYear((y) => y + 1)}
                className="px-2.5 py-1.5 rounded-lg hover:text-white"
                title="Año siguiente"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 12 Months horizontal pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {MONTH_NAMES.map((mName, idx) => {
            const isSelected = selectedMonth === idx;
            return (
              <button
                key={mName}
                type="button"
                onClick={() => setSelectedMonth(idx)}
                className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-barber-chai text-barber-lightText font-bold shadow-sm'
                    : 'bg-barber-darkSurface text-barber-pistache hover:text-white border border-barber-darkBorder/60'
                }`}
              >
                {mName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Weeks of the selected month */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-barber-darkText flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-barber-matcha" />
            <span>Semanas de {MONTH_NAMES[selectedMonth]} {selectedYear}:</span>
          </span>
          <span className="text-[11px] font-mono text-barber-pistache">
            Tocá una semana para editarla por separado
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {monthWeeks.map((wInfo) => {
            const isSelected = activeWeekKey === wInfo.weekKey;
            const hasCustom = Boolean(draftWeekly[wInfo.weekKey]);
            const isCurrentWeek = wInfo.weekKey === initialWeekInfo.weekKey;

            return (
              <button
                key={wInfo.weekKey}
                type="button"
                onClick={() => setActiveWeekKey(wInfo.weekKey)}
                className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                  isSelected
                    ? 'bg-barber-matcha text-white border-barber-matcha font-bold shadow-md ring-2 ring-barber-matcha/50'
                    : 'bg-barber-darkSurface border-barber-darkBorder text-barber-darkText hover:border-barber-chai'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider">
                    Semana {wInfo.weekNo}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {isCurrentWeek && (
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold ${
                        isSelected ? 'bg-white text-barber-matcha' : 'bg-barber-matcha/20 text-barber-matcha'
                      }`}>
                        Actual
                      </span>
                    )}
                    {hasCustom && (
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold ${
                        isSelected ? 'bg-barber-chai text-barber-lightText' : 'bg-barber-chai/20 text-barber-chai'
                      }`}>
                        Personalizada
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-1 text-xs tabular-nums">
                  {formatDateRange(wInfo.monday, wInfo.sunday)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Editor Box for the active selected week */}
      <div className="p-5 sm:p-6 rounded-3xl bg-barber-darkSurface border border-barber-chai/40 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-barber-darkBorder">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-barber-chai" />
              <h5 className="text-base font-display font-bold text-barber-darkText">
                Modificando Semana {activeWeekInfo.weekNo} ({formatDateRange(activeWeekInfo.monday, activeWeekInfo.sunday)})
              </h5>
            </div>
            <p className="text-xs text-barber-pistache mt-0.5">
              {isWeekCustomized
                ? 'Esta semana tiene cambios específicos que reemplazan el horario general.'
                : 'Esta semana sigue el horario predeterminado general. Modificá cualquier día u hora para personalizarla.'}
            </p>
          </div>

          {isWeekCustomized && (
            <button
              type="button"
              onClick={handleResetToDefault}
              className="px-3 py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer a general</span>
            </button>
          )}
        </div>

        {/* 1. Working Days in this week */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-barber-darkText">
            Días de atención en esta semana:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
            {DAY_NAMES.map((d) => {
              const isActive = activeWorkingDays.includes(d.id);
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => handleToggleDay(d.id)}
                  className={`p-2.5 rounded-xl border text-center transition-all flex items-center justify-between font-semibold ${
                    isActive
                      ? 'bg-barber-matcha text-white border-barber-matcha font-bold'
                      : 'bg-barber-darkBg border-barber-darkBorder text-barber-pistache/50'
                  }`}
                >
                  <span>{d.full}</span>
                  {isActive ? (
                    <CheckCircle className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <span className="text-[9px] uppercase font-mono">Off</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Disabled Slots in this week */}
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-semibold text-barber-darkText">
            Horarios disponibles en esta semana (tocá para quitar pausas o descansos):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {allSlots.map((slot) => {
              const isDisabled = activeDisabledSlots.includes(slot);
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => handleToggleSlot(slot)}
                  className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center font-mono ${
                    !isDisabled
                      ? 'bg-barber-darkBg border-barber-chai text-barber-darkText font-bold'
                      : 'bg-barber-darkBg/30 border-barber-darkBorder text-barber-pistache/40 line-through'
                  }`}
                >
                  <span className="text-xs tabular-nums">{slot} hs</span>
                  <span className={`text-[9px] font-sans mt-0.5 ${!isDisabled ? 'text-barber-matcha font-semibold' : 'text-red-400'}`}>
                    {!isDisabled ? 'Activo' : 'Pausa'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback message */}
        {saveStatus && (
          <div className="p-3.5 rounded-2xl bg-barber-matcha/20 border border-barber-matcha text-xs text-barber-darkText flex items-center gap-2 font-medium">
            <CheckCircle className="w-4 h-4 text-barber-matcha shrink-0" />
            <span>{saveStatus}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-barber-darkBorder">
          <button
            type="button"
            onClick={handleApplyToAllFutureWeeks}
            className="px-4 py-2.5 rounded-xl border border-barber-darkBorder text-xs text-barber-pistache hover:text-white transition-colors"
          >
            Usar como horario predeterminado general
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            className="px-6 py-2.5 rounded-xl bg-barber-matcha text-white font-display font-bold text-xs uppercase tracking-wider hover:brightness-105 shadow-md flex items-center justify-center gap-2 transition-all"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Guardar Calendario Anual</span>
          </button>
        </div>
      </div>
    </div>
  );
}
