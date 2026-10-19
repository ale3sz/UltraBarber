import React, { useState, useEffect } from 'react';
import { MessageCircle, Copy, Check, X, Sparkles, Send } from 'lucide-react';

export default function EditableMessageModal({
  isOpen,
  onClose,
  recipientName = '',
  recipientPhone = '',
  initialMessage = '',
  title = 'Mensaje Personalizado WhatsApp',
  badge = 'MENSAJERÍA VIP',
  suggestedTemplates = []
}) {
  const [message, setMessage] = useState(initialMessage);
  const [copied, setCopied] = useState(false);
  const [activeTemplateIdx, setActiveTemplateIdx] = useState(null);

  useEffect(() => {
    setMessage(initialMessage);
    setActiveTemplateIdx(null);
  }, [initialMessage, isOpen]);

  if (!isOpen) return null;

  const rawPhone = String(recipientPhone || '').replace(/\D/g, '');
  let cleanPhone = rawPhone;
  if (cleanPhone.length === 10 && !cleanPhone.startsWith('54')) {
    cleanPhone = `549${cleanPhone}`;
  } else if (cleanPhone.length === 12 && cleanPhone.startsWith('54') && !cleanPhone.startsWith('549')) {
    cleanPhone = `549${cleanPhone.slice(2)}`;
  }

  const finalWhatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleSend = () => {
    window.open(finalWhatsappUrl, '_blank', 'noopener,noreferrer');
    if (onClose) onClose();
  };

  const handleSelectTemplate = (tpl, idx) => {
    setActiveTemplateIdx(idx);
    setMessage(tpl.text);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-enter">
      <div className="w-full max-w-lg rounded-2xl bg-[#141416] border border-white/[0.1] shadow-2xl text-[#EDEDED] p-5 sm:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#101012] border border-white/[0.1] text-[#D4AF37] flex items-center justify-center">
              <MessageCircle className="w-4 h-4 stroke-[1.5]" />
            </div>
            <div>
              <span className="micro-technical block text-[9px] text-[#D4AF37]">
                {badge}
              </span>
              <h3 className="text-base font-display font-bold text-[#EDEDED] leading-tight">
                {title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-[#8A898E] hover:text-[#EDEDED] hover:bg-white/[0.05] transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Destinatario Pill */}
        <div className="p-3 rounded-md bg-[#101012] border border-white/[0.06] flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-[#8A898E] text-[10px] uppercase">Para:</span>
            <strong className="text-[#EDEDED] font-display font-bold text-sm">
              {recipientName || 'Cliente'}
            </strong>
          </div>
          <span className="text-[#D4AF37] tabular-nums text-xs">
            {recipientPhone || 'Sin teléfono'}
          </span>
        </div>

        {/* Templates Selector (si hay sugeridos) */}
        {suggestedTemplates && suggestedTemplates.length > 0 && (
          <div className="space-y-1.5">
            <span className="micro-technical block text-[9px] text-[#8A898E]">
              PLANTILLAS RÁPIDAS
            </span>
            <div className="flex flex-wrap gap-1.5">
              {suggestedTemplates.map((tpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectTemplate(tpl, idx)}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors border ${
                    activeTemplateIdx === idx
                      ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37] font-semibold'
                      : 'bg-[#101012] border-white/[0.08] hover:border-[#D4AF37]/50 text-[#8A898E] hover:text-[#EDEDED]'
                  }`}
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Editable Message Area */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="wa-message-textarea"
              className="micro-technical block text-[9px] text-[#8A898E]"
            >
              MENSAJE EDITABLE (PODÉS MODIFICARLO LIBREMENTE)
            </label>
            <span className="text-[10px] font-mono text-[#8A898E] tabular-nums">
              {message.length} caracteres
            </span>
          </div>

          <textarea
            id="wa-message-textarea"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-3.5 py-3 rounded-md bg-[#101012] border border-white/[0.1] text-[#EDEDED] text-xs font-sans leading-relaxed focus:outline-none focus:border-[#D4AF37] transition-colors resize-none"
            placeholder="Escribí o editá el mensaje aquí..."
          />
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={handleCopy}
            className="w-full sm:w-auto px-4 py-2.5 rounded-md border border-white/[0.1] hover:border-white/20 text-[#8A898E] hover:text-[#EDEDED] font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2]" />
                <span className="text-emerald-400 font-bold">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 stroke-[1.5]" />
                <span>Copiar texto</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 sm:w-auto px-4 py-2.5 rounded-md border border-white/[0.08] text-[#8A898E] hover:text-[#EDEDED] font-mono text-xs uppercase tracking-wider"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={!cleanPhone || !message.trim()}
              className="w-1/2 sm:w-auto px-5 py-2.5 rounded-md bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-white font-mono font-bold text-xs uppercase tracking-[0.12em] flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5 stroke-[2]" />
              <span>Abrir WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
