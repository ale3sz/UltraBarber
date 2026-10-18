import React from 'react';
import { Check, Clock, Wine, ArrowLeft, ArrowRight } from 'lucide-react';
import { getAssetUrl } from '../../utils/assets';

export default function ServiceStep({
  services = [],
  drinks = [],
  selectedService,
  setSelectedService,
  selectedDrink,
  setSelectedDrink,
  onBack,
  onContinue
}) {
  const activeDrink = selectedDrink || (drinks.length > 0 ? drinks[2] || drinks[0] : 'Cerveza');

  const handleSelectService = (service) => {
    setSelectedService(service);
    if (service.drinkIncluded && !selectedDrink) {
      setSelectedDrink(activeDrink);
    }
  };

  const getObjectPosition = (serviceId) => {
    if (serviceId === 'corte') return 'center 38%';
    if (serviceId === 'corte-bebida') return 'center 20%';
    if (serviceId === 'experiencia-completa') return 'center 35%';
    return 'center center';
  };

  const getImageSrc = (url) => getAssetUrl(url);

  return (
    <div className="space-y-6">
      {/* Step Progress Bar (Inspired by Reference Video 01 / 03) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <div>
            <span className="text-barber-chai font-bold">01</span>
            <span className="text-barber-lightMuted dark:text-barber-darkMuted"> / 03</span>
          </div>
          <span className="font-editorial italic text-sm text-barber-lightMuted dark:text-barber-darkMuted">
            Servicio
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 h-1">
          <div className="bg-barber-chai rounded-full" />
          <div className="bg-barber-lightBorder dark:border-barber-darkBorder rounded-full" />
          <div className="bg-barber-lightBorder dark:border-barber-darkBorder rounded-full" />
        </div>
      </div>

      {/* Main Editorial Title */}
      <div>
        <h2 className="text-3xl sm:text-4xl font-display font-bold text-barber-lightText dark:text-barber-darkText">
          ¿Qué te{' '}
          <span className="font-editorial italic font-normal text-barber-chai">
            servimos
          </span>{' '}
          hoy?
        </h2>
        <p className="text-xs sm:text-sm text-barber-lightMuted dark:text-barber-darkMuted mt-1">
          Seleccioná tu sesión en el sillón. Todos los servicios suman +1 punto en tu pase del club.
        </p>
      </div>

      {/* 2-Column Visual Service Grid (Like Reference Video) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {services.map((service, index) => {
          const isSelected = selectedService?.id === service.id;
          const isLastOdd = index === services.length - 1 && services.length % 2 !== 0;

          return (
            <div
              key={service.id}
              onClick={() => handleSelectService(service)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelectService(service);
                }
              }}
              className={`group rounded-3xl overflow-hidden border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between active:scale-[0.985] animate-enter ${
                isLastOdd ? 'sm:col-span-2' : ''
              } ${
                isSelected
                  ? 'bg-barber-darkSurface border-barber-chai ring-2 ring-barber-chai club-shadow shadow-barber-chai/10'
                  : 'bg-barber-lightSurface dark:bg-barber-darkSurface border-barber-lightBorder dark:border-barber-darkBorder hover:border-barber-chai hover:shadow-lg'
              }`}
            >
              {/* Service Photo Header */}
              <div>
                <div className={`relative w-full overflow-hidden bg-barber-darkBg ${isLastOdd ? 'h-64 sm:h-80' : 'h-64 sm:h-72'}`}>
                  {service.imageUrl && (
                    <img
                      src={getImageSrc(service.imageUrl)}
                      alt={service.name}
                      style={{ objectPosition: getObjectPosition(service.id) }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  )}
                  {/* Subtle fade at the bottom border connecting with card body */}
                  <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-barber-lightSurface dark:from-barber-darkSurface to-transparent pointer-events-none" />

                  {/* Top Right Selection Check */}
                  {isSelected && (
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-barber-matcha text-white text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Elegido</span>
                    </div>
                  )}
                </div>

                {/* Body Content */}
                <div className="p-5 pb-3">
                  {/* Badges positioned cleanly above title without obstructing the photo */}
                  <div className="flex items-center gap-2 mb-2">
                    {service.drinkIncluded ? (
                      <span className="px-2.5 py-0.5 rounded-lg bg-barber-chai/15 border border-barber-chai/40 text-[10px] font-mono font-bold uppercase tracking-wider text-barber-chai flex items-center gap-1.5">
                        <Wine className="w-3 h-3 text-barber-chai" />
                        <span>BEBIDA SIN CARGO</span>
                      </span>
                    ) : (
                      service.badge && (
                        <span className="px-2.5 py-0.5 rounded-lg bg-barber-matcha/15 border border-barber-matcha/40 text-[10px] font-mono font-bold uppercase tracking-wider text-barber-matcha">
                          {service.badge}
                        </span>
                      )
                    )}
                  </div>

                  <h3
                    className={`text-xl font-display font-bold leading-snug ${
                      isSelected
                        ? 'text-barber-darkText'
                        : 'text-barber-lightText dark:text-barber-darkText'
                    }`}
                  >
                    {service.name}
                  </h3>

                  <ul className="mt-2.5 space-y-1">
                    {service.includes.map((item, idx) => (
                      <li
                        key={idx}
                        className={`text-xs flex items-start gap-2 ${
                          isSelected
                            ? 'text-barber-pistache'
                            : 'text-barber-lightMuted dark:text-barber-darkMuted'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 text-barber-matcha shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Price & Points Footer */}
              <div className="px-5 pb-5 pt-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-mono text-barber-chai font-bold">$</span>
                  <span
                    className={`text-2xl font-display font-bold tabular-nums ${
                      isSelected
                        ? 'text-barber-darkText'
                        : 'text-barber-lightText dark:text-barber-darkText'
                    }`}
                  >
                    {service.price.toLocaleString('es-AR')}
                  </span>
                </div>

                <div className="mt-2 pt-2.5 border-t border-barber-lightBorder/60 dark:border-barber-darkBorder flex items-center justify-between text-xs font-mono">
                  <span
                    className={`flex items-center gap-1 tabular-nums ${
                      isSelected
                        ? 'text-barber-pistache'
                        : 'text-barber-lightMuted dark:text-barber-darkMuted'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    {service.duration} min
                  </span>
                  <span className="font-bold text-barber-chai tabular-nums">
                    +{service.pointsEarned || 1} PTO
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Drink Selector Bar when selected service includes a drink */}
      {selectedService?.drinkIncluded && (
        <div className="p-5 rounded-3xl bg-barber-lightSurface dark:bg-barber-darkSurface border border-barber-chai club-shadow space-y-3">
          <div className="flex items-center gap-2 text-sm font-display font-bold text-barber-lightText dark:text-barber-darkText">
            <Wine className="w-4 h-4 text-barber-chai" />
            <span>Elegí tu bebida incluida sin cargo:</span>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {drinks.map((drink) => {
              const active = activeDrink === drink;
              return (
                <button
                  key={drink}
                  type="button"
                  onClick={() => setSelectedDrink(drink)}
                  className={`py-3 px-3 rounded-2xl text-xs font-bold border transition-all ${
                    active
                      ? 'bg-barber-matcha text-white border-barber-matcha'
                      : 'bg-barber-lightBg dark:bg-barber-darkBg border-barber-lightBorder dark:border-barber-darkBorder text-barber-lightText dark:text-barber-darkText hover:border-barber-chai'
                  }`}
                >
                  {drink}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step Footer Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-3.5 rounded-2xl border border-barber-lightBorder dark:border-barber-darkBorder text-xs font-semibold text-barber-lightText dark:text-barber-darkText hover:border-barber-chai flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Anterior</span>
        </button>

        <button
          type="button"
          disabled={!selectedService}
          onClick={onContinue}
          className="px-7 py-4 rounded-2xl bg-white text-[#0A0A0A] font-display font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-neutral-200 disabled:opacity-40 transition-all shadow-md"
        >
          <span>Elegir Día y Horario</span>
          <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
        </button>
      </div>
    </div>
  );
}
