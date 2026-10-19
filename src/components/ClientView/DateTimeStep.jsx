import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ArrowLeft, ArrowRight, Ban } from 'lucide-react';
import { api } from '../../services/api';
import { formatLocalDate } from '../../utils/date';

export default function DateTimeStep({
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  selectedDrink,
  onBack,
  onRequestTurn,
  isSubmitting,
  selectedService,
  studioConfig
}) {
  const [busySlots, setBusySlots] = useState([]);
  const [disabledSlots, setDisabledSlots] = useState([]);
  const [isDayClosed, setIsDayClosed] = useState(false);
  const [closedReason, setClosedReason] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);

  const availableDays = React.useMemo(() => {
    const days = [];
    const today = new Date();
    const weeklySchedule = studioConfig?.weeklySchedule || {};
    const defaultWorkingDays = Array.isArray(studioConfig?.workingDays)
      ? studioConfig.workingDays
      : [1, 2, 3, 4, 5, 6];

    // Helper to get ISO Week Key
    const getIsoWeek = (d) => {
      const target = new Date(d.valueOf());
      const dayNr = target.getDay() || 7;
      target.setDate(target.getDate() + 4 - dayNr);
      const yearStart = new Date(target.getFullYear(), 0, 1);
      const weekNo = Math.ceil((((target - yearStart) / 86400000) + 1) / 7);
      return `${target.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
    };

    // Check up to 21 calendar days to find next 6 open working days
    for (let i = 0; i < 21 && days.length < 6; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dayOfWeek = d.getDay();
      const weekKey = getIsoWeek(d);
      const effectiveWorkingDays = weeklySchedule[weekKey]?.workingDays || defaultWorkingDays;

      if (!effectiveWorkingDays.includes(dayOfWeek)) continue;

      const isoDate = formatLocalDate(d);
      const weekdayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

      days.push({
        isoDate,
        dayName: i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : weekdayNames[dayOfWeek],
        dayNumber: d.getDate(),
        monthName: monthNames[d.getMonth()]
      });
    }
    return days;
  }, [studioConfig]);

  useEffect(() => {
    if (!selectedDate && availableDays.length > 0) {
      setSelectedDate(availableDays[0].isoDate);
    }
  }, [availableDays, selectedDate, setSelectedDate]);

  useEffect(() => {
    if (!selectedDate) return;
    let isMounted = true;

    async function loadBusy() {
      setLoadingSlots(true);
      try {
        const res = await api.getBusySlots(selectedDate);
        if (isMounted) {
          setBusySlots(res.busySlots || []);
          setDisabledSlots(res.disabledSlots || []);
          setIsDayClosed(Boolean(res.isDayClosed));
          setClosedReason(res.closedReason || '');
        }
      } catch (err) {
        console.error('Error fetching busy slots:', err);
      } finally {
        if (isMounted) setLoadingSlots(false);
      }
    }

    loadBusy();
    const interval = setInterval(loadBusy, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedDate]);

  const morningSlots = ['09:00', '09:45', '10:30', '11:15', '12:00', '12:45'];
  const afternoonSlots = ['14:00', '14:45', '15:30', '16:15', '17:00', '17:45', '18:30', '19:15'];

  const renderSlotButton = (time) => {
    const isDisabledByDavid = disabledSlots.includes(time);
    const isBusy = busySlots.includes(time);
    const isSelected = selectedTime === time;

    if (isDisabledByDavid) {
      return (
        <div
          key={time}
          className="py-2.5 px-2 rounded-md text-[11px] font-mono tabular-nums border border-white/[0.04] bg-[#0B0B0C] text-[#8A898E]/30 flex flex-col items-center justify-center cursor-not-allowed select-none"
        >
          <span>{time}</span>
          <span className="text-[9px] font-sans">Pausa</span>
        </div>
      );
    }

    return (
      <button
        key={time}
        type="button"
        disabled={isBusy || isDayClosed}
        onClick={() => setSelectedTime(time)}
        className={`py-2.5 px-2 rounded-md text-xs font-mono tabular-nums border transition-all active:scale-[0.98] flex flex-col items-center justify-center ${
          isSelected
            ? 'bg-[#D4AF37] text-[#0B0B0C] font-bold border-[#D4AF37] shadow-sm'
            : isBusy
            ? 'bg-[#0B0B0C] border-white/[0.04] text-[#8A898E]/40 cursor-not-allowed line-through'
            : 'bg-[#101012] border-white/[0.08] text-[#EDEDED] hover:border-white/20'
        }`}
      >
        <span>{time}</span>
        {isBusy && (
          <span className="text-[9px] font-sans text-[#8A898E]/50">
            Ocupado
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {/* Step Progress Bar (02 / 03) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <div>
            <span className="text-[#D4AF37] font-bold">02</span>
            <span className="text-[#8A898E]"> / 03 SEGUNDO PASO</span>
          </div>
          <span className="micro-technical text-[9px] text-[#8A898E]">
            AGENDA DE AUTOR
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 h-[2px]">
          <div className="bg-[#D4AF37]" />
          <div className="bg-[#D4AF37]" />
          <div className="bg-white/[0.08]" />
        </div>
      </div>

      {/* Main Editorial Title */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#EDEDED] leading-tight">
          ¿Cuándo te{' '}
          <span className="font-editorial italic font-normal text-[#D4AF37]">
            esperamos
          </span>{' '}
          en el sillón?
        </h2>
        <p className="text-xs text-[#8A898E] mt-1">
          Al solicitar, tu horario se bloquea por 15 minutos mientras confirmás por WhatsApp con David.
        </p>
      </div>

      {/* Day Selector Grid */}
      <div className="space-y-2">
        <span className="micro-technical block text-[9px] text-[#8A898E]">
          ELEGÍ EL DÍA
        </span>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {availableDays.map((d) => {
            const isSelected = selectedDate === d.isoDate;
            return (
              <button
                key={d.isoDate}
                type="button"
                onClick={() => {
                  setSelectedDate(d.isoDate);
                  setSelectedTime('');
                }}
                className={`p-2.5 rounded-md border text-center transition-all active:scale-[0.98] ${
                  isSelected
                    ? 'bg-[#D4AF37] text-[#0B0B0C] border-[#D4AF37] font-bold shadow-sm'
                    : 'bg-[#101012] border-white/[0.08] text-[#EDEDED] hover:border-white/20'
                }`}
              >
                <span className={`text-[10px] font-mono uppercase block ${
                  isSelected ? 'text-[#0B0B0C]' : 'text-[#8A898E]'
                }`}>
                  {d.dayName}
                </span>
                <span className="text-lg font-display font-bold block my-0.5 tabular-nums">
                  {d.dayNumber}
                </span>
                <span className={`text-[9px] font-mono uppercase block ${
                  isSelected ? 'text-[#0B0B0C]' : 'text-[#8A898E]'
                }`}>
                  {d.monthName}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Closed Day Alert or Time Slots */}
      {isDayClosed ? (
        <div className="p-5 rounded-md card-hairline text-center space-y-2">
          <Ban className="w-6 h-6 text-[#D4AF37] mx-auto stroke-[1.5]" />
          <h3 className="text-sm font-display font-bold text-[#EDEDED]">
            Agenda cerrada en esta fecha
          </h3>
          <p className="text-xs text-[#8A898E]">
            {closedReason || 'David no atiende en esta fecha. Por favor elegí otro día de la semana.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="micro-technical text-[9px] text-[#8A898E] flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-[#D4AF37] stroke-[1.5]" />
                TURNO MAÑANA
              </span>
              {loadingSlots && (
                <span className="text-[10px] font-mono text-[#D4AF37]">
                  Actualizando...
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {morningSlots.map(renderSlotButton)}
            </div>
          </div>

          <div>
            <span className="micro-technical block text-[9px] text-[#8A898E] mb-2 flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-[#D4AF37] stroke-[1.5]" />
              TURNO TARDE
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {afternoonSlots.map(renderSlotButton)}
            </div>
          </div>
        </div>
      )}

      {/* Selected Summary Strip */}
      {selectedService && selectedTime && (
        <div className="p-4 rounded-md card-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-enter">
          <div>
            <span className="font-display font-bold text-sm text-[#EDEDED] block">
              {selectedService.name}
              {selectedService.drinkIncluded && selectedDrink ? ` + ${selectedDrink}` : ''}
            </span>
            <span className="text-[11px] font-mono text-[#8A898E] tabular-nums">
              Fecha: {selectedDate} • Horario: {selectedTime} hs • Barbero: David
            </span>
          </div>
          <div>
            <span className="text-lg font-display font-bold text-[#D4AF37] tabular-nums">
              ${selectedService.price.toLocaleString('es-AR')}
            </span>
          </div>
        </div>
      )}

      {/* Bottom Step Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2.5 rounded-md border border-white/[0.08] text-xs font-mono uppercase tracking-wider text-[#8A898E] hover:text-[#EDEDED] hover:border-white/20 flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[2]" />
          <span>Volver</span>
        </button>

        <button
          type="button"
          disabled={!selectedDate || !selectedTime || isSubmitting || isDayClosed}
          onClick={onRequestTurn}
          className="px-6 py-3 rounded-md bg-[#EDEDED] hover:bg-white active:scale-[0.98] text-[#0B0B0C] font-mono text-xs font-bold uppercase tracking-[0.15em] flex items-center gap-2 disabled:opacity-40 transition-all shadow-sm"
        >
          <span>{isSubmitting ? 'Bloqueando...' : 'Solicitar Turno'}</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
        </button>
      </div>
    </div>
  );
}
