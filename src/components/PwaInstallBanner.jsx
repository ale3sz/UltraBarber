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
      <div className="bg-[#141416] border-b border-white/[0.08] px-4 py-2.5 text-xs text-[#EDEDED] flex items-center justify-between gap-3 sticky top-16 z-30 animate-enter">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-md bg-[#0B0B0C] card-hairline flex items-center justify-center text-[#D4AF37] shrink-0">
            <Smartphone className="w-3.5 h-3.5" />
          </div>
          <div className="truncate">
            <strong className="font-display font-bold text-[#EDEDED] block truncate text-xs">
              Membresía Digital en Pantalla de Inicio
            </strong>
            <span className="text-[11px] text-[#8A898E] block truncate font-mono">
              Acceso directo rápido a tus turnos y beneficios
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleInstallClick}
            className="px-3 py-1.5 rounded-md bg-[#EDEDED] hover:bg-white text-[#0B0B0C] font-display font-bold text-[10px] uppercase tracking-[0.15em] flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Download className="w-3 h-3 text-[#0B0B0C]" />
            <span>Instalar</span>
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 rounded-md text-[#8A898E] hover:text-[#EDEDED] transition-colors"
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
            className="w-full max-w-sm rounded-lg bg-[#141416] card-hairline p-6 text-[#EDEDED] text-center space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-10 rounded-md bg-[#0B0B0C] card-hairline flex items-center justify-center text-[#D4AF37] mx-auto">
              <Smartphone className="w-5 h-5" />
            </div>

            <div>
              <span className="micro-technical text-[#D4AF37] block mb-1">ACCESO APPLE WALLET STYLE</span>
              <h3 className="font-display font-bold text-base text-[#EDEDED]">
                Instalar en iPhone
              </h3>
              <p className="text-xs text-[#8A898E] mt-1 leading-relaxed">
                Seguí estos 2 pasos en Safari para tener el pase directo:
              </p>
            </div>

            <div className="p-4 rounded-md bg-[#0B0B0C] card-hairline text-left text-xs space-y-2.5">
              <div className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-sm bg-[#EDEDED] text-[#0B0B0C] font-bold font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <p className="text-[#8A898E]">
                  Tocá el botón <strong className="text-[#EDEDED]">Compartir</strong> (ícono de recuadro con flecha) en Safari.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-sm bg-[#EDEDED] text-[#0B0B0C] font-bold font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <p className="text-[#8A898E]">
                  Elegí <strong className="text-[#EDEDED]">"Agregar a pantalla de inicio"</strong>.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="w-full py-3 rounded-md bg-[#EDEDED] hover:bg-white text-[#0B0B0C] font-display font-bold text-xs uppercase tracking-[0.15em] transition-all"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
