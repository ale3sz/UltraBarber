import React from 'react';
import { Check, Clock, Wine, ArrowLeft, ArrowRight, MessageCircle, AlertCircle } from 'lucide-react';
import { getAssetUrl } from '../../utils/assets';

export default function ServiceStep({
  services = [],
  drinks = [],
  selectedService,
  setSelectedService,
  selectedDrink,
  setSelectedDrink,
  onBack,
  onContinue,
  whatsappPhone = '5493413762115'
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
    if (serviceId === 'colorimetria') return 'center 30%';
    return 'center center';
  };

  const getImageSrc = (url) => getAssetUrl(url);

  const isDirectConsult = (service) => {
    return Boolean(
      service?.directConsult ||
      service?.price === 0 ||
      service?.id === 'colorimetria'
    );
  };

  const isSelectedDirectConsult = isDirectConsult(selectedService);

  return (
    <div className="space-y-6">
      {/* Step Progress Line */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <div>
            <span className="text-[#D4AF37] font-bold">01</span>
            <span className="text-[#8A898E]"> / 03 PASO INICIAL</span>
          </div>
          <span className="micro-technical text-[9px] text-[#8A898E]">
            SESIÓN &amp; EXPERIENCIA
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 h-[2px]">
          <div className="bg-[#D4AF37]" />
          <div className="bg-white/[0.08]" />
          <div className="bg-white/[0.08]" />
        </div>
      </div>

      {/* Main Editorial Title */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#EDEDED] leading-tight">
          ¿Qué te{' '}
          <span className="font-editorial italic font-normal text-[#D4AF37]">
            servimos
          </span>{' '}
          hoy?
        </h2>
        <p className="text-xs text-[#8A898E] mt-1">
          Seleccioná tu servicio en el sillón de David. Cada visita suma +1 punto en tu pase del club.
        </p>
      </div>

      {/* 2-Column Visual Service Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {services.map((service, index) => {
          const isSelected = selectedService?.id === service.id;
          const isLastOdd = index === services.length - 1 && services.length % 2 !== 0;
          const directConsultService = isDirectConsult(service);

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
              className={`group rounded-md overflow-hidden text-left transition-all duration-200 cursor-pointer flex flex-col justify-between active:scale-[0.99] animate-enter ${
                isLastOdd ? 'sm:col-span-2' : ''
              } ${
                isSelected
                  ? 'bg-[#141416] border border-[#D4AF37] ring-1 ring-[#D4AF37]/50 shadow-lg'
                  : 'bg-[#141416] border border-white/[0.08] hover:border-white/20'
              }`}
            >
              {/* Service Photo Header */}
              <div>
                <div className={`relative w-full overflow-hidden bg-[#0B0B0C] ${isLastOdd ? 'h-60 sm:h-72' : 'h-60 sm:h-64'}`}>
                  {service.imageUrl && (
                    <img
                      src={getImageSrc(service.imageUrl)}
                      alt={service.name}
                      style={{ objectPosition: getObjectPosition(service.id) }}
                      className="w-full h-full object-cover filter contrast-[1.05] group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  )}
                  {/* Subtle fade to card surface */}
                  <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#141416] to-transparent pointer-events-none" />

                  {/* Top Right Selection Indicator */}
                  {isSelected && (
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-[#D4AF37] text-[#0B0B0C] text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Elegido</span>
                    </div>
                  )}
                </div>

                {/* Body Content */}
                <div className="p-4 pb-2 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {directConsultService ? (
                      <span className="px-2 py-0.5 rounded bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[8px] font-mono font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1">
                        <MessageCircle className="w-2.5 h-2.5" />
                        <span>CONSULTA DIRECTA</span>
                      </span>
                    ) : service.drinkIncluded ? (
                      <span className="badge-champagne flex items-center gap-1 text-[8px]">
                        <Wine className="w-2.5 h-2.5 stroke-[1.5]" />
                        <span>BEBIDA SIN CARGO</span>
                      </span>
                    ) : (
                      service.badge && (
                        <span className="px-2 py-0.5 rounded bg-white/[0.06] border border-white/[0.1] text-[8px] font-mono text-[#8A898E] uppercase tracking-wider">
                          {service.badge}
                        </span>
                      )
                    )}

                    {directConsultService && service.drinkIncluded && (
                      <span className="badge-champagne flex items-center gap-1 text-[8px]">
                        <Wine className="w-2.5 h-2.5 stroke-[1.5]" />
                        <span>BEBIDA INCLUIDA</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-display font-bold text-[#EDEDED] leading-snug">
                    {service.name}
                  </h3>

                  <ul className="mt-2 space-y-1">
                    {service.includes.map((item, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-[#8A898E] flex items-start gap-1.5"
                      >
                        <Check className="w-3 h-3 text-[#D4AF37] shrink-0 mt-0.5 stroke-[2]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Banner informativo específico para servicios de consulta directa */}
                  {directConsultService && (
                    <div className="mt-3 p-3 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/25 text-xs text-[#EDEDED] flex items-start gap-2.5">
                      <MessageCircle className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <p className="font-semibold text-[#D4AF37] text-xs">
                          Organización personal con David
                        </p>
                        <p className="text-[#8A898E] text-[11px] leading-relaxed">
                          Este servicio consume entre 2 y 3 horas y requiere evaluación previa del cabello. La fecha y el presupuesto se coordinan de forma personalizada con David por WhatsApp.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Price & Specs Footer */}
              <div className="px-4 pb-4 pt-2">
                {directConsultService ? (
                  <div className="space-y-0.5">
                    <span className="text-base sm:text-lg font-display font-bold text-[#D4AF37]">
                      A coordinar
                    </span>
                    <p className="text-[10px] font-mono text-[#8A898E]">
                      Presupuesto según trabajo y largo de cabello
                    </p>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-mono text-[#D4AF37] font-bold">$</span>
                    <span className="text-xl font-display font-bold text-[#EDEDED] tabular-nums">
                      {service.price.toLocaleString('es-AR')}
                    </span>
                  </div>
                )}

                <div className="mt-2 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#8A898E] flex items-center gap-1">
                    <Clock className="w-3 h-3 stroke-[1.5]" />
                    {directConsultService ? 'Tiempo a coordinar (+2 hs)' : `${service.duration} MIN`}
                  </span>
                  <span className="font-bold text-[#D4AF37] tracking-wider">
                    {directConsultService ? 'WHATSAPP DIRECTO' : `+${service.pointsEarned || 1} PTO`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Drink Selector Bar (si aplica bebida y no es de consulta directa) */}
      {selectedService?.drinkIncluded && !isSelectedDirectConsult && (
        <div className="card-hairline rounded-md p-4 text-[#EDEDED] space-y-2.5 animate-enter">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.12em] text-[#EDEDED]">
            <Wine className="w-3.5 h-3.5 text-[#D4AF37] stroke-[1.5]" />
            <span>Elegí tu bebida de cortesía:</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {drinks.map((drink) => {
              const active = activeDrink === drink;
              return (
                <button
                  key={drink}
                  type="button"
                  onClick={() => setSelectedDrink(drink)}
                  className={`py-2 px-2.5 rounded text-xs font-mono uppercase tracking-wider transition-all ${
                    active
                      ? 'bg-[#D4AF37] text-[#0B0B0C] font-bold shadow-sm'
                      : 'bg-[#101012] border border-white/[0.08] text-[#8A898E] hover:text-[#EDEDED]'
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/[0.08]">
        <button
          type="button"
          onClick={onBack}
          className="w-full sm:w-auto px-4 py-2.5 rounded-md border border-white/[0.08] text-xs font-mono uppercase tracking-wider text-[#8A898E] hover:text-[#EDEDED] hover:border-white/20 flex items-center justify-center gap-2 transition-colors order-2 sm:order-1"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[2]" />
          <span>Volver</span>
        </button>

        <div className="w-full sm:w-auto order-1 sm:order-2">
          {isSelectedDirectConsult ? (
            <a
              href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
                'Hola David! 👋 Me gustaría consultar por el servicio de Colorimetría & Textura Técnica. Quería consultar sobre presupuesto y disponibilidad para coordinar el trabajo en el sillón.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3 rounded-md bg-[#25D366] hover:bg-[#20ba5a] active:scale-[0.98] text-white font-mono text-xs font-bold uppercase tracking-[0.12em] flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-white/20" />
              <span>Coordinar con David por WhatsApp</span>
            </a>
          ) : (
            <button
              type="button"
              disabled={!selectedService}
              onClick={onContinue}
              className="w-full sm:w-auto px-6 py-3 rounded-md bg-[#EDEDED] hover:bg-white active:scale-[0.98] text-[#0B0B0C] font-mono text-xs font-bold uppercase tracking-[0.15em] flex items-center justify-center gap-2 disabled:opacity-40 transition-all shadow-sm"
            >
              <span>Elegir Día y Horario</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
