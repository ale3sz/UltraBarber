import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Clock,
  MessageCircle,
  Copy,
  Check,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';
import { api } from '../../services/api';
import AddToCalendarButton from './AddToCalendarButton';

export default function HoldWaitingStep({
  appointmentData,
  onResetToNewBooking,
  onConfirmed
}) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [status, setStatus] = useState(appointmentData?.appointment?.status || 'pendiente');
  const [copied, setCopied] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  const { appointment, code, expiresAt, whatsappUrl, rawMessage } = appointmentData || {};

  const formatTime = (ms) => {
    if (ms <= 0) return '00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!expiresAt) return;
    const updateTimer = () => {
      const remaining = expiresAt - Date.now();
      if (remaining <= 0) {
        setTimeLeft(0);
        setIsExpired(true);
        setStatus('expirado');
      } else {
        setTimeLeft(remaining);
      }
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  useEffect(() => {
    if (!appointment?.id || status === 'confirmado' || isExpired) return;

    const checkStatus = async () => {
      try {
        const res = await api.getAppointmentStatus(appointment.id);
        if (res && res.status) {
          setStatus(res.status);
          if (res.status === 'confirmado') {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#D4AF37', '#F3E5AB', '#FFFFFF', '#141414']
            });
            if (onConfirmed) onConfirmed(res);
          } else if (res.status === 'expirado' || res.status === 'cancelado') {
            setIsExpired(true);
          }
        }
      } catch (err) {
        console.error('Error polling status:', err);
      }
    };

    const pollInterval = setInterval(checkStatus, 3000);
    return () => clearInterval(pollInterval);
  }, [appointment?.id, status, isExpired, onConfirmed]);

  const handleCopyMessage = () => {
    if (rawMessage) {
      navigator.clipboard.writeText(rawMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleOpenWhatsApp = () => {
    if (whatsappUrl) {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // CASE 1: CONFIRMED BY DAVID
  if (status === 'confirmado') {
    return (
      <div className="p-6 sm:p-8 rounded-3xl bg-barber-darkSurface border border-barber-matcha club-shadow text-center space-y-6 text-barber-darkText">
        <div className="w-16 h-16 rounded-full bg-barber-matcha text-white flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-barber-darkText">
            Turno confirmado por David
          </h2>
          <p className="text-xs sm:text-sm text-barber-pistache mt-1.5">
            Tu horario quedó reservado en la agenda oficial del estudio.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-barber-darkBg border border-barber-darkBorder text-left space-y-2.5 text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-barber-darkBorder">
            <span className="text-barber-pistache">Código de turno</span>
            <strong className="font-mono text-base font-bold text-barber-chai tabular-nums">
              #{code}
            </strong>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-barber-pistache">Socio</span>
            <strong className="text-barber-darkText">{appointment.clientName}</strong>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-barber-pistache">Servicio</span>
            <strong className="text-barber-darkText">{appointment.serviceName}</strong>
          </div>
          {appointment.selectedDrink && (
            <div className="flex justify-between items-center">
              <span className="text-barber-pistache">Bebida elegida</span>
              <strong className="text-barber-chai">{appointment.selectedDrink}</strong>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-barber-pistache">Fecha y hora</span>
            <strong className="text-barber-darkText font-mono tabular-nums">
              {appointment.date} • {appointment.time} hs
            </strong>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-barber-darkBorder">
            <span className="text-barber-pistache">Puntos al finalizar</span>
            <span className="text-barber-matcha font-mono font-bold">+1 PTO</span>
          </div>
        </div>

        <div className="space-y-2.5">
          <AddToCalendarButton
            appointment={appointment}
            className="w-full flex justify-center"
          />
          <button
            type="button"
            onClick={onResetToNewBooking}
            className="w-full py-3.5 rounded-2xl bg-white text-[#0A0A0A] font-display font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-all shadow-md"
          >
            Ver en Mis Turnos
          </button>
        </div>
      </div>
    );
  }

  // CASE 2: EXPIRED AFTER 15 MINUTES
  if (isExpired || status === 'expirado') {
    return (
      <div className="p-6 sm:p-8 rounded-3xl bg-barber-lightSurface dark:bg-barber-darkSurface border border-red-500/40 club-shadow text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-red-500/15 text-red-500 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div>
          <h2 className="text-2xl font-display font-bold text-barber-lightText dark:text-barber-darkText">
            El bloqueo de 15 minutos expiró
          </h2>
          <p className="text-xs sm:text-sm text-barber-lightMuted dark:text-barber-darkMuted mt-1.5">
            No se registró la confirmación a tiempo y el horario volvió a quedar libre en la agenda.
          </p>
        </div>

        <button
          type="button"
          onClick={onResetToNewBooking}
          className="w-full py-4 rounded-2xl bg-white text-[#0A0A0A] font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-neutral-200 transition-all shadow-md"
        >
          <ArrowLeft className="w-4 h-4 text-[#D4AF37]" />
          <span>Elegir otro horario</span>
        </button>
      </div>
    );
  }

  // CASE 3: PENDING WHATSAPP HANDSHAKE (15-MINUTE LOCK)
  return (
    <div className="space-y-5">
      {/* Step Progress Bar (03 / 03) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <div>
            <span className="text-barber-chai font-bold">03</span>
            <span className="text-barber-lightMuted dark:text-barber-darkMuted"> / 03</span>
          </div>
          <span className="font-editorial italic text-sm text-barber-lightMuted dark:text-barber-darkMuted">
            Verificación por WhatsApp
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 h-1">
          <div className="bg-barber-matcha rounded-full" />
          <div className="bg-barber-matcha rounded-full" />
          <div className="bg-barber-chai rounded-full" />
        </div>
      </div>

      <div className="rounded-3xl p-6 sm:p-7 bg-barber-darkSurface border border-barber-chai/50 club-shadow text-barber-darkText space-y-6 animate-enter">
        {/* Top Status & Live Countdown */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-barber-darkBorder">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-barber-chai opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-barber-chai" />
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-barber-chai">
              Horario bloqueado por 15 min
            </span>
          </div>

          <div className="px-3.5 py-1.5 rounded-full bg-barber-darkBg border border-barber-darkBorder flex items-center gap-2 text-barber-chai shadow-inner">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-mono font-bold tabular-nums">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* Big 4-Digit Code Display */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-barber-darkText">
            Confirmá tu código con David
          </h2>
          <p className="text-xs text-barber-pistache max-w-md mx-auto">
            Tocá el botón de abajo para abrir WhatsApp con el mensaje prearmado. En cuanto David presione Confirmar, tu turno queda fijo.
          </p>

          <div className="py-4">
            <div className="inline-block px-8 py-4 rounded-2xl bg-barber-darkBg border-2 border-barber-chai shadow-lg shadow-barber-chai/10">
              <span className="text-4xl sm:text-5xl font-mono font-extrabold tracking-widest text-barber-chai tabular-nums">
                #{code}
              </span>
            </div>
          </div>
        </div>

        {/* Primary WhatsApp Handshake Button */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="w-full py-4 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] active:scale-[0.985] text-white font-display font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-3 shadow-lg transition-all"
          >
            <MessageCircle className="w-5 h-5 fill-white/20" />
            <span>Enviar confirmación por WhatsApp</span>
            <ExternalLink className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleCopyMessage}
            className="w-full py-3 px-4 rounded-xl bg-barber-darkBg border border-barber-darkBorder text-xs font-semibold text-barber-pistache hover:text-barber-darkText flex items-center justify-center gap-2 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-barber-matcha" />
                <span className="text-barber-matcha">Mensaje copiado al portapapeles</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar texto del mensaje manualmente</span>
              </>
            )}
          </button>
        </div>

        {/* Pre-built Message Preview */}
        <div className="p-4 rounded-2xl bg-barber-darkBg border border-barber-darkBorder text-left space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-barber-pistache block">
            Mensaje prearmado:
          </span>
          <p className="text-xs font-mono text-barber-darkText leading-relaxed">
            &ldquo;{rawMessage}&rdquo;
          </p>
        </div>

        <div className="pt-2 border-t border-barber-darkBorder flex items-center justify-between text-xs text-barber-pistache">
          <span>Esperando confirmación en vivo...</span>
          <button
            type="button"
            onClick={onResetToNewBooking}
            className="text-barber-chai font-semibold hover:underline"
          >
            Ver Mis Turnos
          </button>
        </div>
      </div>
    </div>
  );
}
