import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, Settings, Check, X } from 'lucide-react';
import { getCookieConsent, setCookieConsent } from '../../utils/analytics';

export default function CookieConsentBanner() {
  const [consent, setConsent] = useState('pending');
  const [showConfig, setShowConfig] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    const existing = getCookieConsent();
    if (existing) {
      setConsent(existing);
      setAnalyticsEnabled(existing === 'all');
    }

    const handleUpdate = (e) => {
      const val = e.detail;
      setConsent(val);
      setAnalyticsEnabled(val === 'all');
    };

    window.addEventListener('cookie_consent_updated', handleUpdate);
    return () => window.removeEventListener('cookie_consent_updated', handleUpdate);
  }, []);

  const handleAcceptAll = () => {
    setCookieConsent('all');
    setConsent('all');
    setShowConfig(false);
  };

  const handleReject = () => {
    setCookieConsent('essential');
    setConsent('essential');
    setShowConfig(false);
  };

  const handleSaveConfig = () => {
    const choice = analyticsEnabled ? 'all' : 'essential';
    setCookieConsent(choice);
    setConsent(choice);
    setShowConfig(false);
  };

  // Si ya eligió y el modal de configuración no está abierto, no mostrar nada
  if (consent !== 'pending' && !showConfig) {
    return null;
  }

  return (
    <>
      {/* Banner Principal de Consentimiento (No invasivo) */}
      {consent === 'pending' && !showConfig && (
        <aside
          role="region"
          aria-label="Aviso de Cookies y Privacidad"
          className="fixed bottom-20 sm:bottom-4 inset-x-3 sm:inset-x-auto sm:right-6 sm:max-w-md z-50 p-4 sm:p-5 rounded-2xl bg-[#141417]/95 backdrop-blur-xl border border-white/[0.12] shadow-2xl text-[#EDEDED] space-y-3 animate-enter"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0B0B0C] border border-[#E5C378]/30 flex items-center justify-center text-[#E5C378] shrink-0 mt-0.5">
              <Cookie className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-display font-bold uppercase tracking-wider text-[#EDEDED]">
                Privacidad &amp; Cookies
              </h4>
              <p className="text-[11px] leading-relaxed text-[#9CA3AF]">
                Utilizamos cookies esenciales para gestionar tus turnos y sesión del Club. Opcionalmente, usamos cookies de rendimiento para optimizar la experiencia de navegación.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleAcceptAll}
              className="flex-1 py-2 px-3 rounded-lg bg-[#E5C378] hover:bg-[#F3E5AB] text-[#0D0D0F] font-mono font-bold text-[11px] uppercase tracking-wider transition-colors shadow-sm text-center"
            >
              Aceptar todas
            </button>
            <button
              type="button"
              onClick={handleReject}
              className="py-2 px-3 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-[#9CA3AF] hover:text-[#EDEDED] font-mono text-[11px] uppercase tracking-wider transition-colors text-center"
            >
              Rechazar
            </button>
            <button
              type="button"
              onClick={() => setShowConfig(true)}
              className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-[#9CA3AF] hover:text-[#EDEDED] transition-colors"
              title="Configurar cookies"
              aria-label="Configurar cookies"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}

      {/* Modal de Configuración Detallada */}
      {showConfig && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-enter">
          <div className="w-full max-w-md rounded-2xl bg-[#141416] border border-white/[0.12] p-6 text-[#EDEDED] space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#E5C378]" />
                <h3 className="text-sm font-display font-bold">
                  Preferencias de Cookies
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowConfig(false)}
                className="p-1 rounded-lg text-[#9CA3AF] hover:text-[#EDEDED]"
                aria-label="Cerrar modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Cookies Obligatorias */}
              <div className="p-3.5 rounded-xl bg-[#0B0B0C] border border-white/[0.06] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#EDEDED] flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#E5C378]" />
                    Cookies Esenciales
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#E5C378] bg-[#E5C378]/10 px-2 py-0.5 rounded border border-[#E5C378]/20">
                    Obligatorias
                  </span>
                </div>
                <p className="text-[11px] text-[#9CA3AF] leading-relaxed">
                  Necesarias para autenticación de socio con DNI, agendamiento de turnos, seguridad contra ataques y funcionamiento del sitio. No pueden desactivarse.
                </p>
              </div>

              {/* Cookies Opcionales de Analítica */}
              <div className="p-3.5 rounded-xl bg-[#0B0B0C] border border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#EDEDED]">
                    Cookies de Rendimiento &amp; Analítica
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={analyticsEnabled}
                      onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-white/[0.1] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#E5C378]"></div>
                  </label>
                </div>
                <p className="text-[11px] text-[#9CA3AF] leading-relaxed">
                  Permiten recopilar métricas anónimas sobre interacción y velocidad para mejorar el servicio. No almacenan información personal identificable.
                </p>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={handleSaveConfig}
                className="flex-1 py-2.5 rounded-xl bg-[#E5C378] hover:bg-[#F3E5AB] text-[#0D0D0F] font-mono font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
              >
                Guardar preferencias
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
