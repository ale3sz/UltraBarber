import React, { useState } from 'react';
import { Cake, MessageCircle, Calendar } from 'lucide-react';

export default function BirthdaySection({
  birthdaysData = { thisWeek: [], thisMonth: [] }
}) {
  const [tab, setTab] = useState('week');

  const { thisWeek = [], thisMonth = [] } = birthdaysData;
  const currentList = tab === 'week' ? thisWeek : thisMonth;

  const handleSendWhatsAppPromo = (client) => {
    const cleanPhone = (client.phone || '').replace(/\D/g, '');
    const message = `Hola ${client.firstName || client.name || 'Socio'}! Feliz cumpleaños de parte de ULTRA BARBER Studio! Te regalamos un beneficio especial en tu próximo corte de autor. ¿Querés agendar tu turno para esta semana?`;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 rounded-3xl bg-barber-lightSurface dark:bg-barber-darkSurface border border-barber-lightBorder dark:border-barber-darkBorder">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-barber-chai text-barber-lightText flex items-center justify-center">
            <Cake className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-display font-bold text-barber-lightText dark:text-barber-darkText">
              Cumpleaños de socios
            </h2>
            <p className="text-xs text-barber-lightMuted dark:text-barber-darkMuted">
              Enviá saludo y promo de cumpleaños a su WhatsApp en un toque.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-2xl bg-barber-lightBg dark:bg-barber-darkBg border border-barber-lightBorder dark:border-barber-darkBorder">
          <button
            type="button"
            onClick={() => setTab('week')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              tab === 'week'
                ? 'bg-barber-matcha text-white'
                : 'text-barber-lightMuted dark:text-barber-darkMuted'
            }`}
          >
            Esta Semana ({thisWeek.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('month')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              tab === 'month'
                ? 'bg-barber-matcha text-white'
                : 'text-barber-lightMuted dark:text-barber-darkMuted'
            }`}
          >
            Este Mes ({thisMonth.length})
          </button>
        </div>
      </div>

      {currentList.length === 0 ? (
        <div className="p-8 rounded-3xl bg-barber-lightSurface dark:bg-barber-darkSurface border border-barber-lightBorder dark:border-barber-darkBorder text-center space-y-2">
          <Cake className="w-7 h-7 text-barber-chai mx-auto" />
          <h3 className="text-base font-display font-bold text-barber-lightText dark:text-barber-darkText">
            Sin cumpleañeros en este período
          </h3>
          <p className="text-xs text-barber-lightMuted dark:text-barber-darkMuted">
            Los socios con cumpleaños cercanos aparecerán automáticamente acá.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentList.map((client) => {
            const isToday = client.isToday;
            const daysUntil = client.daysUntil;

            return (
              <div
                key={client.id || client.dni}
                className={`p-5 rounded-3xl border bg-barber-lightSurface dark:bg-barber-darkSurface flex items-center justify-between gap-4 ${
                  isToday
                    ? 'border-barber-chai ring-2 ring-barber-chai'
                    : 'border-barber-lightBorder dark:border-barber-darkBorder'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-display font-bold text-barber-lightText dark:text-barber-darkText">
                      {client.firstName || client.name || 'Socio'} {client.lastName || ''}
                    </h3>

                    {isToday ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-barber-chai text-barber-lightText">
                        Cumple Hoy
                      </span>
                    ) : daysUntil !== undefined ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-barber-lightBg dark:bg-barber-darkBg text-barber-chai border border-barber-lightBorder dark:border-barber-darkBorder">
                        {daysUntil === 1 ? 'Mañana' : daysUntil > 0 ? `En ${daysUntil} días` : 'Esta semana'}
                      </span>
                    ) : null}
                  </div>

                  <p className="text-xs font-mono text-barber-lightMuted dark:text-barber-darkMuted flex items-center gap-2 tabular-nums">
                    <Calendar className="w-3.5 h-3.5 text-barber-chai" />
                    <span>{client.birthDate}</span>
                    <span>•</span>
                    <span>{client.totalCuts || 0} cortes</span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleSendWhatsAppPromo(client)}
                  className="px-4 py-3 rounded-2xl bg-barber-matcha hover:brightness-110 text-white text-xs font-display font-bold uppercase tracking-wider flex items-center gap-2 shrink-0 transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enviar Promo</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
