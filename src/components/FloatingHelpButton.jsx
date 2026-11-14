import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import MagneticButton from './common/MagneticButton';
import { analytics } from '../utils/analytics';

export default function FloatingHelpButton({ studioConfig }) {
  const [isOpen, setIsOpen] = useState(false);

  const phone = (studioConfig?.whatsappPhone || '5493413762115').replace(/\D/g, '');
  const message = encodeURIComponent('¡Hola David! Te escribo desde tu web de turnos, tengo una consulta...');
  const whatsappUrl = `https://wa.me/${phone}?text=${message}`;

  const handleOpenChat = () => {
    analytics.trackWhatsAppClick('floating_modal');
    setIsOpen(false);
  };

  return (
    <div className="flex fixed bottom-20 right-3 sm:bottom-6 sm:right-6 z-40 flex-col items-end gap-2 pointer-events-auto">
      {isOpen && (
        <div className="p-4 rounded-xl bg-[#141417] card-hairline text-[#EDEDED] shadow-2xl w-72 animate-enter space-y-3.5 border border-white/[0.1]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E5C378] animate-pulse" />
              <span className="micro-technical text-[#E5C378]">
                CONSERJERÍA PRIVADA
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-[#9CA3AF] hover:text-[#EDEDED] transition-colors"
              aria-label="Cerrar cuadro de ayuda"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <h4 className="text-sm font-display font-semibold text-[#EDEDED] tracking-wide">
              ¿Tenés alguna consulta?
            </h4>
            <p className="text-xs text-[#9CA3AF] mt-1 leading-relaxed">
              Escribile directo a David por WhatsApp para coordinar servicios, dudas o solicitudes especiales.
            </p>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleOpenChat}
            className="w-full py-2.5 px-4 rounded-lg btn-whatsapp-luxury text-white font-display font-bold text-[11px] uppercase tracking-[0.16em] flex items-center justify-center gap-2 transition-all active:scale-98 shadow-md"
          >
            <MessageCircle className="w-4 h-4 fill-white shrink-0" />
            <span>Chatear con David</span>
          </a>
        </div>
      )}

      <MagneticButton
        onClick={() => {
          if (!isOpen) {
            analytics.trackWhatsAppClick('floating_button_toggle');
          }
          setIsOpen(!isOpen);
        }}
        className="group px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-[#141417]/95 hover:bg-[#1a1a1f] text-[#EDEDED] card-hairline shadow-2xl flex items-center gap-2 backdrop-blur-md border border-white/[0.12] transition-all active:scale-95"
        title="Consultas y dudas por WhatsApp"
        aria-label="Botón de dudas por WhatsApp"
      >
        <div className="w-7 h-7 sm:w-6 sm:h-6 rounded-lg bg-[#0D0D0F] border border-white/[0.1] flex items-center justify-center text-[#25D366] shrink-0">
          <MessageCircle className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
        </div>
        <div className="text-left hidden sm:block pr-1">
          <span className="block text-[11px] font-bold text-[#EDEDED] leading-tight font-display tracking-wide">
            ¿Dudas?
          </span>
          <span className="block text-[10px] text-[#9CA3AF] leading-tight font-mono">
            Escribile a David
          </span>
        </div>
        <span className="sm:hidden text-[11px] font-mono text-[#EDEDED] font-semibold pr-1">
          WhatsApp
        </span>
      </MagneticButton>
    </div>
  );
}
