import React, { useState } from 'react';
import { Scissors, MessageCircle, MapPin, Sparkles, Clock, ArrowUpRight } from 'lucide-react';
import InstagramIcon from './icons/InstagramIcon';

export default function ComingSoon({ onEnterApp }) {
  const [clickCount, setClickCount] = useState(0);

  const handleSecretClick = () => {
    const next = clickCount + 1;
    setClickCount(next);
    if (next >= 4 && onEnterApp) {
      onEnterApp();
    }
  };

  return (
    <div className="min-h-screen bg-[#070707] text-[#EDE8D0] flex flex-col justify-between selection:bg-[#D4AF37] selection:text-black relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[#D4AF37]/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-amber-500/5 blur-[120px] pointer-events-none rounded-full" />

      {/* Top Studio Brand Bar */}
      <header className="relative z-10 max-w-4xl w-full mx-auto px-6 pt-8 pb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={handleSecretClick}
          className="flex items-center gap-3 text-left focus:outline-none group"
          title="ULTRA BARBER STUDIO"
        >
          <div className="w-10 h-10 rounded-2xl bg-neutral-900 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shadow-lg group-hover:border-[#D4AF37] transition-all">
            <Scissors className="w-5 h-5 -rotate-45" />
          </div>
          <div>
            <span className="font-display font-bold text-base sm:text-lg tracking-tight text-white block leading-tight">
              ULTRA BARBER
            </span>
            <span className="text-[11px] font-mono text-[#8A898E] tracking-wider uppercase block">
              David • Studio Privado
            </span>
          </div>
        </button>

        <span className="px-3 py-1 rounded-full bg-neutral-900 border border-[#D4AF37]/30 text-[#D4AF37] text-[11px] font-mono uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse"></span>
          <span>En construcción</span>
        </span>
      </header>

      {/* Main Hero Card */}
      <main className="relative z-10 max-w-xl w-full mx-auto px-6 py-12 flex-1 flex flex-col justify-center text-center space-y-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-800 text-xs font-mono text-neutral-300 mx-auto shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Nueva plataforma de reservas y club exclusivo</span>
        </div>

        {/* Big Typography */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-6xl font-display font-bold text-white tracking-tight leading-[1.1]">
            Próximamente
          </h1>
          <p className="text-xl sm:text-2xl font-editorial italic text-[#D4AF37] font-normal">
            Estamos preparando algo único para vos
          </p>
        </div>

        {/* Narrative Description */}
        <p className="text-sm sm:text-base text-neutral-400 leading-relaxed max-w-md mx-auto">
          Muy pronto vas a poder reservar tus turnos en vivo, acceder a tu pase de socio y disfrutar de beneficios exclusivos en cada visita.
        </p>

        {/* Primary Call To Action Box (Instagram Focus) */}
        <div className="p-6 sm:p-7 rounded-3xl bg-neutral-900/80 border border-[#D4AF37]/40 shadow-2xl backdrop-blur-sm space-y-5">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest text-[#D4AF37] font-semibold block">
              Mientras tanto
            </span>
            <h2 className="text-lg sm:text-xl font-display font-bold text-white">
              Visítame en Instagram
            </h2>
            <p className="text-xs text-neutral-400">
              Conocé los últimos cortes de autor, trabajos en el estudio y turnos de la semana:
            </p>
          </div>

          <a
            href="https://www.instagram.com/barber_f4de"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-neutral-950 hover:brightness-105 active:scale-[0.99] font-display font-bold text-sm sm:text-base uppercase tracking-wider flex items-center justify-center gap-3 transition-all shadow-lg group"
          >
            <InstagramIcon className="w-5 h-5 text-neutral-950 transition-transform group-hover:scale-110" />
            <span>@barber_f4de en Instagram</span>
            <ArrowUpRight className="w-4 h-4 text-neutral-950" />
          </a>

          {/* Secondary WhatsApp Direct Contact */}
          <div className="pt-2 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400">
            <span>¿Necesitás agendar un turno ahora?</span>
            <a
              href="https://wa.me/5493413762115?text=Hola%20David%2C%20te%20escribo%20desde%20la%20web%20para%20consultar%20por%20un%20turno"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Escribime directo por WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Studio Location Info */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-neutral-400 pt-2">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Eva Perón 52 • Capitán Bermúdez, Santa Fe</span>
          </div>
          <span className="hidden sm:inline text-neutral-600">•</span>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Atención exclusiva con turno previo</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-4xl w-full mx-auto px-6 py-6 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
        <div>
          © {new Date().getFullYear()} ULTRA BARBER STUDIO • David. Todos los derechos reservados.
        </div>

        {/* Discreet access for developer / testing */}
        {onEnterApp && (
          <button
            type="button"
            onClick={onEnterApp}
            className="text-[11px] font-mono text-neutral-600 hover:text-[#D4AF37] transition-colors"
          >
            Acceso privado
          </button>
        )}
      </footer>
    </div>
  );
}
