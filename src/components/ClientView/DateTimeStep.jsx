import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ArrowLeft, ArrowRight, Ban, Wine } from 'lucide-react';
import { api } from '../../services/api';

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

    // Helper inside useMemo to get ISO Week Key
    const getIsoWeek = (d) => {
      const target = new Date(d.valueOf());
      const dayNr = target.getDay() || 7;
      target.setDate(target.getDate() + 4 - dayNr);
      const yearStart = new Date(target.getFullYear(), 0, 1);
      const weekNo = Math.ceil((((target - yearStart) / 86400000) + 1) / 7);
      return `${target.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
    };

    // Check up to 21 calendar days to find the next 6 open working days
    for (let i = 0; i < 21 && days.length < 6; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dayOfWeek = d.getDay();
      const weekKey = getIsoWeek(d);
      const effectiveWorkingDays = weeklySchedule[weekKey]?.workingDays || defaultWorkingDays;

      if (!effectiveWorkingDays.includes(dayOfWeek)) continue; // Día no laborable

      const isoDate = d.toISOString().split('T')[0];
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

    // Si David deshabilitó el turno globalmente, no se muestra o se muestra como no laborable
    if (isDisabledByDavid) {
      return (
        <div
          key={time}
          className="py-3 px-2 rounded-2xl text-xs font-mono tabular-nums border border-barber-lightBorder/40 dark:border-barber-darkBorder/40 bg-barber-lightBg/50 dark:bg-barber-darkBg/50 text-barber-lightMuted/40 dark:text-barber-darkMuted/40 flex flex-col items-center justify-center cursor-not-allowed select-none"
        >
          <span>{time} hs</span>
          <span className="text-[10px] font-sans">Pausa</span>
        </div>
      );
    }

    return (
      <button
        key={time}
        type="button"
        disabled={isBusy || isDayClosed}
        onClick={() => setSelectedTime(time)}
        className={`py-3.5 px-3 rounded-2xl text-xs sm:text-sm font-mono tabular-nums border transition-all duration-150 active:scale-[0.97] flex flex-col items-center justify-center ${
          isSelected
            ? 'bg-barber-matcha text-white border-barber-matcha font-bold shadow-md ring-2 ring-barber-matcha scale-[1.02]'
            : isBusy
            ? 'bg-barber-lightBg dark:bg-barber-darkBg border-barber-lightBorder dark:border-barber-darkBorder text-barber-lightMuted dark:text-barber-darkMuted opacity-60 cursor-not-allowed line-through'
            : 'bg-barber-lightSurface dark:bg-barber-darkSurface border-barber-lightBorder dark:border-barber-darkBorder text-barber-lightText dark:text-barber-darkText hover:border-barber-chai hover:shadow-sm'
        }`}
      >
        <span>{time} hs</span>
        {isBusy && (
          <span className="text-[10px] font-sans font-semibold text-barber-lightMuted dark:text-barber-darkMuted mt-0.5">
            Reservado
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
            <span className="text-barber-chai font-bold">02</span>
            <span className="text-barber-lightMuted dark:text-barber-darkMuted"> / 03</span>
          </div>
          <span className="font-editorial italic text-sm text-barber-lightMuted dark:text-barber-darkMuted">
            Agenda y Horario
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 h-1">
          <div className="bg-barber-matcha rounded-full" />
          <div className="bg-barber-chai rounded-full" />
          <div className="bg-barber-lightBorder dark:bg-barber-darkBorder rounded-full" />
        </div>
      </div>

      {/* Main Editorial Title */}
      <div>
        <h2 className="text-3xl sm:text-4xl font-display font-bold text-barber-lightText dark:text-barber-darkText">
          ¿Cuándo te{' '}
          <span className="font-editorial italic font-normal text-barber-chai">
            esperamos
          </span>{' '}
          en el sillón?
        </h2>
        <p className="text-xs sm:text-sm text-barber-lightMuted dark:text-barber-darkMuted mt-1">
          Al solicitar tu horario se bloquea por 15 minutos mientras enviás el código de confirmación por WhatsApp.
        </p>
      </div>

      {/* Day Selector Grid */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-barber-lightText dark:text-barber-darkText mb-2.5">
          <Calendar className="w-4 h-4 text-barber-chai" />
          <span>Seleccioná el día</span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
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
                className={`p-3 rounded-2xl border text-center transition-all duration-150 active:scale-[0.97] ${
                  isSelected
                    ? 'bg-barber-chai text-barber-lightText border-barber-chai font-bold shadow-md ring-2 ring-barber-chai/40'
                    : 'bg-barber-lightSurface dark:bg-barber-darkSurface border-barber-lightBorder dark:border-barber-darkBorder text-barber-lightText dark:text-barber-darkText hover:border-barber-chai hover:shadow-sm'
                }`}
              >
                <span
                  className={`text-[11px] uppercase font-semibold block ${
                    isSelected
                      ? 'text-barber-lightText'
                      : 'text-barber-lightMuted dark:text-barber-darkMuted'
                  }`}
                >
                  {d.dayName}
                </span>
                <span className="text-xl font-display font-bold block my-0.5 tabular-nums">
                  {d.dayNumber}
                </span>
                <span
                  className={`text-[10px] font-mono uppercase block ${
                    isSelected
                      ? 'text-barber-carob font-bold'
                      : 'text-barber-lightMuted dark:text-barber-darkMuted'
                  }`}
                >
                  {d.monthName}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Closed Day Alert or Time Slots */}
      {isDayClosed ? (
        <div className="p-6 rounded-3xl bg-barber-lightSurface dark:bg-barber-darkSurface border border-barber-lightBorder dark:border-barber-darkBorder text-center space-y-2">
          <Ban className="w-8 h-8 text-barber-chai mx-auto" />
          <h3 className="text-base font-display font-bold text-barber-lightText dark:text-barber-darkText">
            Agenda cerrada en esta fecha
          </h3>
          <p className="text-xs text-barber-lightMuted dark:text-barber-darkMuted">
            {closedReason || 'David no atiende en esta fecha. Por favor elegí otro día de la semana.'}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold text-barber-lightText dark:text-barber-darkText flex items-center gap-2">
                <Clock className="w-4 h-4 text-barber-matcha" />
                Turno Mañana
              </span>
              {loadingSlots && (
                <span className="text-xs font-mono text-barber-matcha">
                  Actualizando agenda...
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
              {morningSlots.map(renderSlotButton)}
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-barber-lightText dark:text-barber-darkText flex items-center gap-2 mb-2.5">
              <Clock className="w-4 h-4 text-barber-chai" />
              Turno Tarde
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
              {afternoonSlots.map(renderSlotButton)}
            </div>
          </div>
        </div>
      )}

      {/* Selected Summary Strip */}
      {selectedService && selectedTime && (
        <div className="p-4 sm:p-5 rounded-3xl bg-barber-darkSurface border border-barber-chai text-barber-darkText flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="font-display font-bold text-base text-barber-darkText block">
              {selectedService.name}
              {selectedService.drinkIncluded && selectedDrink ? ` + ${selectedDrink}` : ''}
            </span>
            <span className="text-xs font-mono text-barber-pistache tabular-nums">
              Fecha: {selectedDate} • Horario: {selectedTime} hs • Barbero: David
            </span>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xl font-display font-bold text-barber-chai tabular-nums">
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
          className="px-4 py-3.5 rounded-2xl border border-barber-lightBorder dark:border-barber-darkBorder text-xs font-semibold text-barber-lightText dark:text-barber-darkText hover:border-barber-chai flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cambiar Servicio</span>
        </button>

        <button
          type="button"
          disabled={!selectedDate || !selectedTime || isSubmitting || isDayClosed}
          onClick={onRequestTurn}
          className="px-7 py-4 rounded-2xl bg-white text-[#0A0A0A] font-display font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-neutral-200 disabled:opacity-40 transition-all shadow-md"
        >
          <span>{isSubmitting ? 'Bloqueando horario...' : 'Solicitar Turno'}</span>
          <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
        </button>
      </div>
    </div>
  );
}
