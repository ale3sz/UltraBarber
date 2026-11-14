import React from 'react';
import { Scissors, ArrowLeft, Home } from 'lucide-react';

export default function NotFoundView({ onGoHome }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 sm:p-12 animate-enter">
      <div className="w-16 h-16 rounded-2xl bg-[#141417] border border-[#E5C378]/30 flex items-center justify-center text-[#E5C378] mb-6 shadow-2xl">
        <Scissors className="w-8 h-8 -rotate-45 stroke-[1.5]" />
      </div>

      <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#E5C378] mb-2 font-bold">
        Error 404 • Fuera de Agenda
      </span>

      <h1 className="text-2xl sm:text-4xl font-display font-bold text-[#EDEDED] max-w-md leading-tight mb-3">
        El corte o sección que buscás no existe
      </h1>

      <p className="text-xs sm:text-sm text-[#9CA3AF] max-w-md leading-relaxed mb-8">
        La página o el enlace al que intentaste acceder ha cambiado de lugar o fue retirado de la programación de David.
      </p>

      <button
        type="button"
        onClick={onGoHome}
        className="py-3 px-6 rounded-xl bg-[#E5C378] hover:bg-[#F3E5AB] text-[#0D0D0F] font-mono font-bold text-xs uppercase tracking-[0.16em] flex items-center gap-2 shadow-lg transition-all active:scale-[0.98]"
      >
        <Home className="w-4 h-4 text-[#0D0D0F]" />
        <span>Volver al inicio</span>
      </button>
    </div>
  );
}
