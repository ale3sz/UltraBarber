import React, { useState } from 'react';
import {
  MessageCircle,
  Copy,
  Check,
  Send,
  X,
  Bell,
  Clock,
  Sparkles
} from 'lucide-react';

export default function ReminderModal({ appointment, onClose }) {
  if (!appointment) return null;

  const clientName = appointment.clientName?.split(' ')[0] || 'amigo';
  const rawPhone = String(appointment.clientPhone || '').replace(/\D/g, '');
  
  // Format to international Argentina format (549...)
  let cleanPhone = rawPhone;
  if (cleanPhone.length === 10 && !cleanPhone.startsWith('54')) {
    cleanPhone = `549${cleanPhone}`;
  } else if (cleanPhone.length === 12 && cleanPhone.startsWith('54') && !cleanPhone.startsWith('549')) {
    cleanPhone = `549${cleanPhone.slice(2)}`;
  }

  const templates = [
    {
      id: 'hoy',
      title: 'Recordatorio Hoy',
      desc: 'Para enviar unas horas antes',
      text: `Hola ${clientName}! Te escribo de David Barber Studio para recordarte tu turno de hoy a las ${appointment.time} hs (${appointment.serviceName}). Te esperamos en el sillón! Si tenés alguna demora o necesitás avisar algo, respondeme por acá.`
    },
    {
      id: 'proximo',
      title: 'En 1 Hora (En camino)',
      desc: 'Aviso inmediato para que salga',
      text: `Hola ${clientName}! En 1 hora te esperamos en el sillón (${appointment.time} hs) para tu sesión de ${appointment.serviceName}. Ya tenemos todo listo en el estudio!`
    },
    {
      id: 'manana',
      title: 'Turno de Mañana',
      desc: 'Para enviar la noche anterior',
      text: `Hola ${clientName}! Te recuerdo tu turno para mañana ${appointment.date} a las ${appointment.time} hs en David Barber Studio (${appointment.serviceName}). Te esperamos puntual. Saludos!`
    }
  ];

  const [selectedTemplateId, setSelectedTemplateId] = useState('hoy');
  const [customText, setCustomText] = useState(templates[0].text);
  const [copied, setCopied] = useState(false);

  const handleSelectTemplate = (t) => {
    setSelectedTemplateId(t.id);
    setCustomText(t.text);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(customText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(customText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-enter">
      <div className="w-full max-w-lg rounded-3xl bg-barber-darkSurface border border-barber-darkBorder p-6 sm:p-7 text-barber-darkText club-shadow space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-barber-darkBorder">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-barber-matcha/20 text-barber-matcha border border-barber-matcha/40 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-display font-bold text-barber-darkText">
                Recordatorio de Turno
              </h3>
              <p className="text-xs text-barber-pistache font-mono">
                {appointment.clientName} • {appointment.date} a las {appointment.time} hs
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-barber-pistache hover:text-barber-darkText transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Templates Pills */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-barber-pistache uppercase tracking-wider text-[10px]">
            Elegí plantilla predeterminada:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {templates.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSelectTemplate(t)}
                className={`p-2.5 rounded-xl text-left border transition-all ${
                  selectedTemplateId === t.id
                    ? 'bg-barber-chai/15 border-barber-chai text-barber-chai'
                    : 'bg-barber-darkBg border-barber-darkBorder text-barber-pistache hover:border-barber-chai/50'
                }`}
              >
                <span className="font-bold text-xs block leading-tight">
                  {t.title}
                </span>
                <span className="text-[10px] opacity-75 line-clamp-1 mt-0.5">
                  {t.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Editable Message Box */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="reminder-text" className="text-xs font-semibold text-barber-pistache uppercase tracking-wider text-[10px]">
              Mensaje a enviar:
            </label>
            <button
              type="button"
              onClick={handleCopy}
              className="text-[11px] font-mono text-barber-chai hover:underline flex items-center gap-1"
            >
              {copied ? <Check className="w-3 h-3 text-barber-matcha" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copiado' : 'Copiar texto'}</span>
            </button>
          </div>
          <textarea
            id="reminder-text"
            rows={4}
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            className="w-full p-3.5 rounded-2xl bg-barber-darkBg border border-barber-darkBorder text-barber-darkText text-xs leading-relaxed focus:outline-none focus:border-barber-chai font-sans resize-none"
            placeholder="Escribí el mensaje de recordatorio..."
          />
        </div>

        {/* Footer info & Send Action */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between text-xs font-mono text-barber-pistache">
            <span>Destino: {appointment.clientPhone || 'Sin teléfono'}</span>
            <span className="text-[10px] text-barber-chai">WhatsApp directo</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="py-3 rounded-xl border border-barber-darkBorder text-barber-pistache hover:text-barber-darkText text-xs font-semibold"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSendWhatsApp}
              disabled={!rawPhone}
              className="py-3 rounded-xl bg-barber-matcha text-white font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:brightness-105 active:scale-95 transition-all shadow-md disabled:opacity-50"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Enviar WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
