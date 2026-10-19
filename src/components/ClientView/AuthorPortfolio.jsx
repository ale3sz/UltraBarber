import React, { useState } from 'react';
import {
  Camera,
  Maximize2,
  X,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Flame,
  LayoutGrid,
  Columns
} from 'lucide-react';
import { getAssetUrl } from '../../utils/assets';
import InstagramIcon from '../icons/InstagramIcon';

const getImageSrc = getAssetUrl;

const PORTFOLIO_ITEMS = [
  {
    id: 'look-1',
    src: getAssetUrl('imagenes/corte-freestyle.jpg'),
    title: 'Fade Comprimido & Freestyle',
    subtitle: 'Diseño geométrico a navaja y degradado quirúrgico milimétrico.',
    category: 'freestyle',
    tag: 'DISEÑO FREESTYLE',
    featured: true,
    serviceId: 'corte'
  },
  {
    id: 'look-3',
    src: getAssetUrl('imagenes/corte-premium.png'),
    title: 'Corte Premium · Relax VIP',
    subtitle: 'Gafas de presoterapia ocular, masajeador cervical y bebida fría.',
    category: 'premium',
    tag: 'EXPERIENCIA COMPLETA',
    featured: true,
    serviceId: 'experiencia-completa'
  },
  {
    id: 'look-2',
    src: getAssetUrl('imagenes/IMG_3526.PNG'),
    title: 'Burst Fade · Diseño 23',
    subtitle: 'Degradado curvo milimétrico con textura superior personalizada.',
    category: 'fades',
    tag: 'FADE DE AUTOR',
    featured: false,
    serviceId: 'corte'
  },
  {
    id: 'look-4',
    src: getAssetUrl('imagenes/barba-premium.jpg'),
    title: 'Barba Premium · Ritual de Navaja',
    subtitle: 'Perfilado al detalle, toalla caliente y aceites botánicos.',
    category: 'premium',
    tag: 'RITUAL A NAVAJA',
    featured: false,
    serviceId: 'barba-premium'
  },
  {
    id: 'look-5',
    src: getAssetUrl('imagenes/corte-bebida.jpg'),
    title: 'Corte de Autor + Bebida Fría',
    subtitle: 'Fade con cerveza fría, Monster o gaseosa en el sillón.',
    category: 'fades',
    tag: 'CORTE + BEBIDA',
    featured: false,
    serviceId: 'corte-bebida'
  },
  {
    id: 'look-6',
    src: getAssetUrl('imagenes/IMG_0989.JPG.jpeg'),
    title: 'Colorimetría & Textura Técnica',
    subtitle: 'Iluminación, reflejos y peinado técnico de alta duración.',
    category: 'freestyle',
    tag: 'COLOR & TÉCNICA',
    featured: false,
    serviceId: 'corte'
  }
];

export default function AuthorPortfolio({ onSelectService, onStartBooking }) {
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'fades' | 'freestyle' | 'premium'
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const filteredItems = PORTFOLIO_ITEMS.filter((item) => {
    if (activeFilter === 'all') return true;
    return item.category === activeFilter;
  });

  const handleSelectStyle = (serviceId) => {
    if (onSelectService) {
      onSelectService(serviceId);
    } else if (onStartBooking) {
      onStartBooking();
    }
  };

  const openLightbox = (item) => {
    const idx = filteredItems.findIndex((it) => it.id === item.id);
    setLightboxIndex(idx >= 0 ? idx : 0);
  };

  const handlePrevPhoto = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
  };

  const handleNextPhoto = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
  };

  const activePhoto = lightboxIndex !== null ? filteredItems[lightboxIndex] : null;

  return (
    <section className="w-full space-y-6 pt-6 sm:pt-10">
      {/* Header Editorial de la Galería */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
            <span className="micro-technical text-[#D4AF37]">
              LOOKBOOK &amp; PORTFOLIO EXCLUSIVO DE DAVID
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#EDEDED] flex items-center gap-2.5">
            <Camera className="w-6 h-6 text-[#D4AF37] stroke-[1.5]" />
            <span>
              Trabajos de{' '}
              <span className="font-editorial italic font-normal text-[#D4AF37]">
                autor
              </span>
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8A898E] max-w-2xl">
            Galería en gran formato de degradados quirúrgicos, diseños y rituales ejecutados en el sillón de David.
          </p>
        </div>

        {/* Filter Pills & Instagram Link */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#141416] border border-white/[0.08] text-xs font-mono">
            {[
              { id: 'all', label: 'Todos (6)' },
              { id: 'fades', label: 'Fades' },
              { id: 'freestyle', label: 'Freestyle' },
              { id: 'premium', label: 'Premium & Barba' }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeFilter === f.id
                    ? 'bg-white/[0.12] text-[#EDEDED] font-bold border border-[#D4AF37]'
                    : 'text-[#8A898E] hover:text-[#EDEDED]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <a
            href="https://www.instagram.com/barber_f4de"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-[#141416] border border-white/[0.08] hover:border-[#D4AF37]/50 text-xs font-mono text-[#8A898E] hover:text-[#EDEDED] flex items-center gap-1.5 transition-colors shadow-sm"
            title="Ver más en Instagram @barber_f4de"
          >
            <InstagramIcon className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="hidden sm:inline">@barber_f4de</span>
          </a>
        </div>
      </div>

      {/* Grid de Gran Formato en PC (3 Columnas Amplias: Fotos Grandes y Claras) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="group relative rounded-2xl overflow-hidden border border-white/[0.08] hover:border-[#D4AF37]/60 bg-[#141416] text-left transition-all duration-300 shadow-lg hover:shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col justify-end min-h-[460px] sm:min-h-[490px]"
          >
            {/* Foto de fondo con zoom suave */}
            <img
              src={getImageSrc(item.src)}
              alt={item.title}
              className="absolute inset-0 w-full h-full object-cover object-top filter contrast-[1.03] group-hover:scale-[1.04] transition-transform duration-700 ease-out cursor-pointer"
              loading="lazy"
              onClick={() => openLightbox(item)}
            />

            {/* Degradado Cinematográfico para legibilidad perfecta */}
            <div
              className="absolute inset-0 bg-gradient-to-t from-[#0B0B0C] via-[#0B0B0C]/45 to-transparent group-hover:from-[#0B0B0C]/95 group-hover:via-[#0B0B0C]/55 transition-colors pointer-events-none"
            />

            {/* Badges superiores */}
            <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between pointer-events-none">
              <span className="px-2.5 py-1 rounded-md bg-[#0B0B0C]/85 backdrop-blur-md border border-white/[0.12] text-[10px] font-mono text-[#D4AF37] uppercase tracking-wider font-bold">
                {item.tag}
              </span>

              {item.featured && (
                <span className="px-2 py-0.5 rounded-md bg-[#D4AF37] text-black text-[9px] font-mono uppercase tracking-widest font-extrabold flex items-center gap-1 shadow-md">
                  <Flame className="w-3 h-3 fill-black" />
                  <span>DESTACADO</span>
                </span>
              )}
            </div>

            {/* Botón flotante para ampliar imagen */}
            <button
              type="button"
              onClick={() => openLightbox(item)}
              className="absolute top-12 right-3.5 w-8 h-8 rounded-lg bg-[#0B0B0C]/80 backdrop-blur-md border border-white/[0.12] flex items-center justify-center text-[#EDEDED] opacity-75 hover:opacity-100 hover:border-[#D4AF37]/60 transition-all shadow-md z-10"
              title="Ampliar fotografía a pantalla completa"
              aria-label="Ampliar fotografía"
            >
              <Maximize2 className="w-4 h-4 stroke-[1.5]" />
            </button>

            {/* Tarjeta de información inferior */}
            <div className="relative z-10 p-5 sm:p-6 space-y-3 bg-gradient-to-t from-[#0B0B0C] to-transparent">
              <div
                className="cursor-pointer space-y-1"
                onClick={() => openLightbox(item)}
              >
                <h3 className="font-display font-bold text-base sm:text-lg text-[#EDEDED] leading-snug group-hover:text-white transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs font-sans text-[#8A898E] leading-relaxed line-clamp-2">
                  {item.subtitle}
                </p>
              </div>

              {/* Botón CTA: Elegir este estilo */}
              <button
                type="button"
                onClick={() => handleSelectStyle(item.serviceId)}
                className="w-full py-2.5 px-4 rounded-xl bg-white/[0.08] hover:bg-[#D4AF37] text-[#EDEDED] hover:text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-white/[0.12] hover:border-[#D4AF37] transition-all shadow-sm active:scale-[0.98]"
              >
                <span>Elegir este estilo</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox a Pantalla Completa con Navegación Anterior / Siguiente */}
      {activePhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/92 backdrop-blur-md animate-enter"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="relative w-full max-w-2xl rounded-2xl overflow-hidden bg-[#141416] border border-white/[0.15] text-[#EDEDED] shadow-2xl space-y-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Contenedor de la foto con controles Prev / Next */}
            <div className="relative aspect-[4/5] sm:aspect-[3/4] max-h-[70vh] w-full bg-[#0B0B0C] flex items-center justify-center overflow-hidden">
              <img
                src={getImageSrc(activePhoto.src)}
                alt={activePhoto.title}
                className="w-full h-full object-cover object-top"
              />

              {/* Botón Cerrar */}
              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                className="absolute top-3.5 right-3.5 p-2 rounded-xl bg-[#0B0B0C]/85 backdrop-blur-md border border-white/[0.15] text-[#EDEDED] hover:text-white hover:border-[#D4AF37]/60 transition-colors shadow-lg z-20"
                aria-label="Cerrar vista previa"
              >
                <X className="w-5 h-5 stroke-[1.5]" />
              </button>

              {/* Badge */}
              <div className="absolute top-3.5 left-3.5 flex items-center gap-2 z-20">
                <span className="px-3 py-1 rounded-md bg-[#0B0B0C]/85 backdrop-blur-md border border-white/[0.12] text-xs font-mono text-[#D4AF37] uppercase tracking-wider font-bold">
                  {activePhoto.tag}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white/[0.1] backdrop-blur-md text-[10px] font-mono text-[#8A898E]">
                  {lightboxIndex + 1} de {filteredItems.length}
                </span>
              </div>

              {/* Flecha Anterior */}
              <button
                type="button"
                onClick={handlePrevPhoto}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-[#0B0B0C]/80 hover:bg-[#D4AF37] text-white hover:text-black border border-white/[0.15] hover:border-[#D4AF37] transition-all shadow-lg z-20"
                aria-label="Foto anterior"
              >
                <ChevronLeft className="w-5 h-5 stroke-[2]" />
              </button>

              {/* Flecha Siguiente */}
              <button
                type="button"
                onClick={handleNextPhoto}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-[#0B0B0C]/80 hover:bg-[#D4AF37] text-white hover:text-black border border-white/[0.15] hover:border-[#D4AF37] transition-all shadow-lg z-20"
                aria-label="Foto siguiente"
              >
                <ChevronRight className="w-5 h-5 stroke-[2]" />
              </button>
            </div>

            {/* Barra de descripción y CTA inferior */}
            <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#141416] border-t border-white/[0.08]">
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-display font-bold text-[#EDEDED]">
                  {activePhoto.title}
                </h3>
                <p className="text-xs text-[#8A898E] max-w-md">
                  {activePhoto.subtitle}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const svcId = activePhoto.serviceId;
                  setLightboxIndex(null);
                  handleSelectStyle(svcId);
                }}
                className="px-5 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#c29e2f] text-black font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-md shrink-0"
              >
                <span>Pedir este corte</span>
                <ArrowRight className="w-4 h-4 stroke-[2]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
