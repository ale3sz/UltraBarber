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
      <div className="p-6 sm:p-8 rounded-lg card-hairline bg-[#141416] text-center space-y-6 text-[#EDEDED]">
        <div className="w-14 h-14 rounded-md bg-[#EDEDED] text-[#0B0B0C] flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <span className="micro-technical text-[#D4AF37] block mb-1.5">CONFIRMACIÓN OFICIAL</span>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#EDEDED] tracking-tight">
            Turno confirmado por <span className="font-editorial italic font-normal text-[#D4AF37]">David</span>
          </h2>
          <p className="text-xs text-[#8A898E] mt-1.5 max-w-sm mx-auto">
            Tu horario quedó registrado en la agenda del club privado.
          </p>
        </div>

        <div className="p-4 rounded-md bg-[#0B0B0C] card-hairline text-left space-y-2 text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-white/[0.08]">
            <span className="micro-technical text-[#8A898E]">CÓDIGO DE RESERVA</span>
            <strong className="font-mono text-base font-bold text-[#D4AF37] tabular-nums">
              #{code}
            </strong>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#8A898E]">Socio</span>
            <strong className="text-[#EDEDED]">{appointment.clientName}</strong>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#8A898E]">Servicio</span>
            <strong className="text-[#EDEDED]">{appointment.serviceName}</strong>
          </div>
          {appointment.selectedDrink && (
            <div className="flex justify-between items-center">
              <span className="text-[#8A898E]">Cortesía bar</span>
              <strong className="text-[#D4AF37]">{appointment.selectedDrink}</strong>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-[#8A898E]">Fecha y hora</span>
            <strong className="text-[#EDEDED] font-mono tabular-nums">
              {appointment.date} • {appointment.time} hs
            </strong>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-white/[0.08]">
            <span className="text-[#8A898E]">Puntos al finalizar</span>
            <span className="text-[#D4AF37] font-mono font-bold">+1 PTO</span>
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
            className="w-full py-3.5 rounded-md bg-[#EDEDED] hover:bg-white text-[#0B0B0C] font-display font-bold text-xs uppercase tracking-[0.15em] transition-all"
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
      <div className="p-6 sm:p-8 rounded-lg card-hairline bg-[#141416] text-center space-y-5">
        <div className="w-12 h-12 rounded-md bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div>
          <span className="micro-technical text-red-400 block mb-1">TIEMPO EXPIRADO</span>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-[#EDEDED] tracking-tight">
            El bloqueo de 15 min <span className="font-editorial italic font-normal text-red-400">expiró</span>
          </h2>
          <p className="text-xs text-[#8A898E] mt-1.5 max-w-sm mx-auto">
            No se registró la confirmación a tiempo y el horario volvió a quedar libre en la agenda.
          </p>
        </div>

        <button
          type="button"
          onClick={onResetToNewBooking}
          className="w-full py-3.5 rounded-md bg-[#EDEDED] hover:bg-white text-[#0B0B0C] font-display font-bold text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-[#0B0B0C]" />
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
            <span className="text-[#D4AF37] font-bold">03</span>
            <span className="text-[#8A898E]"> / 03</span>
            <span className="micro-technical text-[#8A898E] ml-2">CONFIRMACIÓN</span>
          </div>
          <span className="font-editorial italic text-xs text-[#8A898E]">
            Validación WhatsApp
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 h-[2px]">
          <div className="bg-[#EDEDED] rounded-none" />
          <div className="bg-[#EDEDED] rounded-none" />
          <div className="bg-[#D4AF37] rounded-none" />
        </div>
      </div>

      <div className="rounded-lg p-6 sm:p-7 bg-[#141417] card-hairline text-[#EDEDED] space-y-6 animate-enter">
        {/* Top Status & Live Countdown */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                timeLeft < 180000 ? 'bg-amber-400' : 'bg-[#E5C378]'
              }`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                timeLeft < 180000 ? 'bg-amber-400' : 'bg-[#E5C378]'
              }`} />
            </span>
            <span className={`micro-technical ${timeLeft < 180000 ? 'text-amber-400 font-bold' : 'text-[#E5C378]'}`}>
              {timeLeft < 180000 ? 'ÚLTIMOS MINUTOS · BLOQUEO ACTIVO' : 'BLOQUEO ACTIVO • 15 MIN'}
            </span>
          </div>

          <div className={`px-3 py-1 rounded-md bg-[#0D0D0F] card-hairline flex items-center gap-2 ${
            timeLeft < 180000 ? 'text-amber-400 border-amber-500/30' : 'text-[#E5C378]'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs font-mono font-bold tabular-nums">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* Big 4-Digit Code Display — Laser-Etched Security Keyplate */}
        <div className="text-center space-y-3">
          <span className="micro-technical text-[#8A898E] block">LLAVE DE RESERVA PRIVADA</span>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#EDEDED] tracking-tight">
            Confirmá tu llave con <span className="font-editorial italic font-normal text-[#E5C378]">David</span>
          </h2>
          <p className="text-xs text-[#8A898E] max-w-md mx-auto leading-relaxed">
            David ya tiene tu sillón preparado. Tocá el botón de abajo para enviar tu llave por WhatsApp y asegurar tu lugar antes de que expire el bloqueo temporal.
          </p>

          <div className="py-2">
            <div className="inline-block px-8 py-3.5 rounded-lg security-keyplate">
              <span className="text-3xl sm:text-4xl font-mono font-extrabold tracking-[0.25em] text-[#F5E6C8] tabular-nums select-all">
                #{code}
              </span>
            </div>
          </div>
        </div>

        {/* Primary WhatsApp Handshake Button — Tailored Luxury High-Craft */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="w-full py-4 px-6 rounded-md btn-whatsapp-luxury active:scale-[0.99] text-white font-display font-bold text-xs uppercase tracking-[0.16em] flex items-center justify-center gap-2.5 transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-white/20 stroke-[2]" />
            <span>Enviar confirmación por WhatsApp</span>
            <ExternalLink className="w-3.5 h-3.5 stroke-[2]" />
          </button>

          <button
            type="button"
            onClick={handleCopyMessage}
            className="w-full py-2.5 px-4 rounded-md bg-[#0B0B0C] card-hairline text-xs font-mono text-[#8A898E] hover:text-[#EDEDED] flex items-center justify-center gap-2 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="text-[#D4AF37]">Mensaje copiado al portapapeles</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar texto del mensaje</span>
              </>
            )}
          </button>
        </div>

        {/* Pre-built Message Preview */}
        <div className="p-3.5 rounded-md bg-[#0B0B0C] card-hairline text-left space-y-1">
          <span className="micro-technical text-[#8A898E] block">
            MENSAJE PREARMADO:
          </span>
          <p className="text-[11px] font-mono text-[#EDEDED]/90 leading-relaxed">
            &ldquo;{rawMessage}&rdquo;
          </p>
        </div>

        <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-xs text-[#8A898E]">
          <span className="text-[11px]">Sincronizando estado en vivo...</span>
          <button
            type="button"
            onClick={onResetToNewBooking}
            className="text-xs font-mono text-[#D4AF37] hover:underline"
          >
            Ver Mis Turnos &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
