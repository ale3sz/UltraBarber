import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

export default function FloatingHelpButton({ studioConfig }) {
  const [isOpen, setIsOpen] = useState(false);

  const phone = (studioConfig?.whatsappPhone || '5493413762115').replace(/\D/g, '');
  const message = encodeURIComponent('¡Hola David! Te escribo desde la web de ULTRA BARBER Studio, tengo una consulta...');
  const whatsappUrl = `https://wa.me/${phone}?text=${message}`;

  return (
    <div className="fixed bottom-24 sm:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end gap-2 pointer-events-auto">
      {isOpen && (
        <div className="p-4 rounded-3xl bg-neutral-900 border border-neutral-700 text-white shadow-2xl w-72 animate-enter space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-display font-bold uppercase tracking-wider text-neutral-300">
                Atención directa
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-neutral-400 hover:text-white transition-colors"
              aria-label="Cerrar cuadro de ayuda"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <h4 className="text-sm font-display font-bold text-white">
              ¿Tenés alguna duda?
            </h4>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              Escribile a David por WhatsApp para consultar sobre servicios, decoloración o disponibilidad.
            </p>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="w-full py-2.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Chatear con David</span>
          </a>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group px-4 py-3 rounded-full bg-neutral-900/95 hover:bg-neutral-800 text-white border border-[#D4AF37]/60 shadow-xl flex items-center gap-2.5 transition-all active:scale-95 backdrop-blur-md"
        title="Consultas y dudas por WhatsApp"
        aria-label="Botón de dudas por WhatsApp"
      >
        <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center text-white shrink-0 shadow-sm">
          <MessageCircle className="w-4 h-4 fill-white" />
        </div>
        <div className="text-left hidden sm:block pr-1">
          <span className="block text-[11px] font-bold text-white leading-tight">
            ¿Dudas?
          </span>
          <span className="block text-[10px] text-neutral-400 leading-tight">
            Escribile a David
          </span>
        </div>
        <span className="sm:hidden text-xs font-bold text-white">
          Dudas
        </span>
      </button>
    </div>
  );
}
