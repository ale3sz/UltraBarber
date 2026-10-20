import React, { useState, useEffect, useRef } from 'react';

/**
 * IntroScissorsReveal
 * 
 * Curtain reveal animation featuring bespoke champagne gold barber shears
 * performing a razor-sharp diagonal incision across an obsidian curtain.
 * 
 * Performance & CRO Rules:
 * - Total duration: ~950ms (ultra-fast, zero cognitive drag).
 * - Accelerated with composite-only CSS properties (clip-path, transform, opacity).
 * - Click/Tap to skip instantly (< 120ms dismiss).
 * - Remembers session via sessionStorage ('david_intro_seen').
 */
export default function IntroScissorsReveal({ onComplete, forcePlay = false }) {
  const pauseParam = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('intro_pause') : null;
  const [phase, setPhase] = useState(pauseParam || 'entering'); // 'entering' | 'snipping' | 'cutting' | 'opened' | 'done'
  const isSkippedRef = useRef(false);

  useEffect(() => {
    // If explicitly paused for preview, do not trigger sequence
    if (pauseParam) return;

    // Check if user already saw it in this session (unless forcePlay is active)
    if (!forcePlay && typeof window !== 'undefined') {
      const alreadySeen = sessionStorage.getItem('david_intro_seen');
      if (alreadySeen) {
        if (onComplete) onComplete();
        return;
      }
    }

    // Sequence timeline (~2.3s total for rich theatricality):
    // 0ms - 750ms: Curtain steady, branding & luxury shears focus
    // 750ms - 1200ms: Shears perform the crisp physical snip
    // 1200ms - 1650ms: Laser line shoots across the diagonal
    // 1650ms - 2100ms: Panels slide apart revealing the app
    // 2100ms - 2400ms: Final fade out and unmount

    const t1 = setTimeout(() => {
      if (!isSkippedRef.current) setPhase('snipping');
    }, 750);

    const t2 = setTimeout(() => {
      if (!isSkippedRef.current) setPhase('cutting');
    }, 1200);

    const t3 = setTimeout(() => {
      if (!isSkippedRef.current) setPhase('opened');
    }, 1900);

    const t4 = setTimeout(() => {
      handleFinish();
    }, 2350);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [forcePlay]);

  const handleFinish = () => {
    try {
      sessionStorage.setItem('david_intro_seen', 'true');
    } catch {
      // Ignore in private browsing fallback
    }
    setPhase('done');
    if (onComplete) onComplete();
  };

  const handleSkip = () => {
    if (phase === 'done') return;
    isSkippedRef.current = true;
    handleFinish();
  };

  if (phase === 'done') return null;

  const isCut = phase === 'cutting' || phase === 'opened';
  const isOpened = phase === 'opened';
  const isSnipping = phase === 'snipping' || phase === 'cutting' || phase === 'opened';

  return (
    <div
      onClick={handleSkip}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Escape' || e.key === ' ') handleSkip(); }}
      aria-label="Saltar intro"
      className={`fixed inset-0 z-[100] cursor-pointer select-none overflow-hidden transition-opacity duration-300 ${
        isOpened ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
      }`}
      style={{ backgroundColor: 'transparent' }}
    >
      {/* =========================================================================
          PANEL SUPERIOR (Triángulo / Polígono Diagonal Superior)
          Diagonal: de (0, 25%) a (100%, 75%)
          ========================================================================= */}
      <div
        className="absolute inset-0 bg-[#0D0D0F] transition-transform will-change-transform"
        style={{
          clipPath: 'polygon(0 0, 100% 0, 100% 75%, 0 25%)',
          transform: isCut
            ? 'translate3d(-105%, -45%, 0) rotate(-1.5deg)'
            : 'translate3d(0, 0, 0)',
          transitionDuration: isCut ? '750ms' : '0ms',
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Grano sutil de lujo en el fondo */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#E5C378_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>

      {/* =========================================================================
          PANEL INFERIOR (Triángulo / Polígono Diagonal Inferior)
          Diagonal: de (0, 25%) a (100%, 75%)
          ========================================================================= */}
      <div
        className="absolute inset-0 bg-[#0D0D0F] transition-transform will-change-transform"
        style={{
          clipPath: 'polygon(0 25%, 100% 75%, 100% 100%, 0 100%)',
          transform: isCut
            ? 'translate3d(105%, 45%, 0) rotate(1.5deg)'
            : 'translate3d(0, 0, 0)',
          transitionDuration: isCut ? '750ms' : '0ms',
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#E5C378_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>

      {/* =========================================================================
          LÍNEA DE INCISIÓN LÁSER (Se traza sobre la costura diagonal)
          ========================================================================= */}
      <svg
        className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-300 ${
          isCut ? 'opacity-100' : 'opacity-0'
        }`}
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="laserGlow" x1="0%" y1="25%" x2="100%" y2="75%">
            <stop offset="0%" stopColor="#C8A858" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#FFF2C6" stopOpacity="1" />
            <stop offset="100%" stopColor="#C8A858" stopOpacity="0.2" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <line
          x1="0"
          y1="250"
          x2="1000"
          y2="750"
          stroke="url(#laserGlow)"
          strokeWidth="2.5"
          filter="url(#glow)"
          strokeDasharray="1200"
          style={{
            strokeDashoffset: isCut ? '0' : '1200',
            transition: 'stroke-dashoffset 450ms ease-out'
          }}
        />
      </svg>

      {/* =========================================================================
          CONTENIDO CENTRAL: Logotipo Editorial + Tijeras de Autor
          ========================================================================= */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center transition-all pointer-events-none ${
          isCut ? 'scale-105 opacity-0 duration-400' : 'scale-100 opacity-100 duration-300'
        }`}
      >
        {/* Metadato Superior */}
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E5C378] animate-pulse" />
          <span className="text-[10px] font-mono tracking-[0.25em] text-[#E5C378] uppercase">
            Atelier Privado
          </span>
        </div>

        {/* TIJERA DE AUTOR BESPOKE (SVG con Hojas Articuladas) */}
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 my-1">
          <svg
            viewBox="0 0 120 120"
            className="w-full h-full drop-shadow-[0_4px_24px_rgba(229,195,120,0.35)]"
          >
            <defs>
              <linearGradient id="champagneGoldBlade" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF2C6" />
                <stop offset="45%" stopColor="#E5C378" />
                <stop offset="100%" stopColor="#A37E32" />
              </linearGradient>
            </defs>

            {/* HOJA SUPERIOR (Articula con rotación hacia el centro durante el snip) */}
            <g
              style={{
                transformOrigin: '55px 55px',
                transform: isSnipping ? 'rotate(0deg)' : 'rotate(-24deg)',
                transition: 'transform 260ms cubic-bezier(0.2, 0.9, 0.3, 1.2)'
              }}
            >
              {/* Hoja afilada */}
              <path
                d="M 55 55 L 105 25 C 108 24 107 27 101 32 L 55 57 Z"
                fill="url(#champagneGoldBlade)"
              />
              {/* Espiga y Anillo de agarre */}
              <path
                d="M 55 55 L 30 75 C 24 80 18 78 16 72 C 14 66 18 60 25 58 C 30 56 38 60 44 65 Z"
                fill="none"
                stroke="url(#champagneGoldBlade)"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
              {/* Reposa dedo / Tang */}
              <path
                d="M 16 72 C 12 75 8 76 6 74"
                fill="none"
                stroke="url(#champagneGoldBlade)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </g>

            {/* HOJA INFERIOR (Articula con rotación opuesta hacia el centro) */}
            <g
              style={{
                transformOrigin: '55px 55px',
                transform: isSnipping ? 'rotate(0deg)' : 'rotate(24deg)',
                transition: 'transform 260ms cubic-bezier(0.2, 0.9, 0.3, 1.2)'
              }}
            >
              {/* Hoja afilada */}
              <path
                d="M 55 55 L 105 45 C 108 46 107 43 101 38 L 55 53 Z"
                fill="url(#champagneGoldBlade)"
              />
              {/* Espiga y Anillo de agarre inferior */}
              <path
                d="M 55 55 L 35 40 C 30 35 24 35 20 40 C 16 45 18 52 24 55 C 28 57 36 54 44 48 Z"
                fill="none"
                stroke="url(#champagneGoldBlade)"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
            </g>

            {/* TORNILLO PIVOTE / EJE DE PRECISIÓN (Joya central) */}
            <circle cx="55" cy="55" r="4.2" fill="#141417" stroke="url(#champagneGoldBlade)" strokeWidth="1.8" />
            <circle cx="55" cy="55" r="1.6" fill="#FFF2C6" />
          </svg>
        </div>

        {/* Título de Marca */}
        <h2 className="text-xl sm:text-2xl font-display font-bold tracking-[0.2em] text-[#EDEDED] uppercase mt-2">
          David Barber
        </h2>
        <span className="text-[10px] font-mono tracking-[0.18em] text-[#8A898E] mt-1 uppercase">
          Sillón de Autor · Rosario
        </span>

        {/* Tip sutil de salto rápido */}
        <span className="text-[9px] font-mono tracking-widest text-white/30 uppercase mt-6">
          Tocá para ingresar
        </span>
      </div>
    </div>
  );
}
