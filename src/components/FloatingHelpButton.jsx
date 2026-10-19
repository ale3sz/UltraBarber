import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import MagneticButton from './common/MagneticButton';

export default function FloatingHelpButton({ studioConfig }) {
  const [isOpen, setIsOpen] = useState(false);

  const phone = (studioConfig?.whatsappPhone || '5493413762115').replace(/\D/g, '');
  const message = encodeURIComponent('¡Hola David! Te escribo desde tu web de turnos, tengo una consulta...');
  const whatsappUrl = `https://wa.me/${phone}?text=${message}`;

  return (
    <div className="fixed bottom-24 sm:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end gap-2 pointer-events-auto">
      {isOpen && (
        <div className="p-4 rounded-lg bg-[#141416] card-hairline text-[#EDEDED] shadow-2xl w-72 animate-enter space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
              <span className="micro-technical text-[#D4AF37]">
                CONSERJERÍA PRIVADA
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-[#8A898E] hover:text-[#EDEDED] transition-colors"
              aria-label="Cerrar cuadro de ayuda"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <h4 className="text-sm font-display font-bold text-[#EDEDED]">
              ¿Tenés alguna consulta?
            </h4>
            <p className="text-xs text-[#8A898E] mt-1 leading-relaxed">
              Escribile directo a David por WhatsApp para coordinar servicios, dudas o solicitudes especiales.
            </p>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="w-full py-2.5 px-4 rounded-md bg-[#25D366] hover:bg-[#20ba59] text-white font-display font-bold text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Chatear con David</span>
          </a>
        </div>
      )}

      <MagneticButton
        onClick={() => setIsOpen(!isOpen)}
        className="group px-3.5 py-2.5 rounded-md bg-[#141416]/95 hover:bg-[#1a1a1d] text-[#EDEDED] card-hairline shadow-lg flex items-center gap-2 backdrop-blur-md"
        title="Consultas y dudas por WhatsApp"
        aria-label="Botón de dudas por WhatsApp"
      >
        <div className="w-6 h-6 rounded-sm bg-[#0B0B0C] border border-white/[0.12] flex items-center justify-center text-[#D4AF37] shrink-0">
          <MessageCircle className="w-3.5 h-3.5" />
        </div>
        <div className="text-left hidden sm:block pr-1">
          <span className="block text-[11px] font-bold text-[#EDEDED] leading-tight font-display">
            ¿Dudas?
          </span>
          <span className="block text-[10px] text-[#8A898E] leading-tight font-mono">
            Escribile a David
          </span>
        </div>
        <span className="sm:hidden text-xs font-mono text-[#EDEDED]">
          Dudas
        </span>
      </MagneticButton>
    </div>
  );
}
