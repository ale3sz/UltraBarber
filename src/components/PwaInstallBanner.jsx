import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

export default function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) return;

    // Check if iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // Check dismissed in session
    if (sessionStorage.getItem('pwa_dismissed')) return;

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // On iOS, show banner once if not installed
    if (isIosDevice && !isStandalone) {
      setShowBanner(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosGuide(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('pwa_dismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <>
      <div className="bg-neutral-900 border-b border-[#D4AF37]/40 px-4 py-2.5 text-xs text-white flex items-center justify-between gap-3 sticky top-16 z-30 animate-enter">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-neutral-800 border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] shrink-0">
            <Smartphone className="w-4 h-4" />
          </div>
          <div className="truncate">
            <strong className="font-bold text-white block truncate">
              Instalá David Barber Studio
            </strong>
            <span className="text-[11px] text-neutral-400 block truncate">
              Acceso directo rápido y turnos siempre a mano
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleInstallClick}
            className="px-3 py-1.5 rounded-lg bg-white text-[#0A0A0A] hover:bg-neutral-200 font-display font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Instalar</span>
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 rounded-lg text-neutral-400 hover:text-white transition-colors"
            aria-label="Cerrar aviso de instalación"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showIosGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-enter"
          onClick={() => setShowIosGuide(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-neutral-900 border border-neutral-700 p-6 text-white text-center space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-neutral-800 border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] mx-auto">
              <Smartphone className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-display font-bold text-lg text-white">
                Cómo instalar en iPhone
              </h3>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Seguí estos 2 pasos en Safari para agregar la app a tu pantalla de inicio:
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-800/80 border border-neutral-700 text-left text-xs space-y-2.5">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#D4AF37] text-[#0A0A0A] font-bold font-mono text-xs flex items-center justify-center shrink-0">
                  1
                </span>
                <p className="text-neutral-300">
                  Tocá el botón <strong>Compartir</strong> (el ícono del cuadradito con flecha hacia arriba) en la barra inferior de Safari.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#D4AF37] text-[#0A0A0A] font-bold font-mono text-xs flex items-center justify-center shrink-0">
                  2
                </span>
                <p className="text-neutral-300">
                  Deslizá y elegí <strong>"Agregar a pantalla de inicio"</strong>.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="w-full py-3 rounded-2xl bg-white text-[#0A0A0A] font-display font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-all shadow-md"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
