import React, { useState, useEffect } from 'react';
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
  Columns,
  Loader2
} from 'lucide-react';
import { getAssetUrl } from '../../utils/assets';
import { api } from '../../services/api';
import InstagramIcon from '../icons/InstagramIcon';

const DEFAULT_PORTFOLIO_ITEMS = [
  {
    id: 'look-1',
    src: getAssetUrl('imagenes/corte-freestyle.webp'),
    image_url: 'imagenes/corte-freestyle.webp',
    title: 'Fade Comprimido & Freestyle',
    subtitle: 'Diseño geométrico a navaja y degradado quirúrgico milimétrico.',
    category: 'freestyle',
    tag: 'DISEÑO FREESTYLE',
    featured: true,
    serviceId: 'corte'
  },
  {
    id: 'look-3',
    src: getAssetUrl('imagenes/corte-premium.webp'),
    image_url: 'imagenes/corte-premium.webp',
    title: 'Corte Premium · Relax VIP',
    subtitle: 'Gafas de presoterapia ocular, masajeador cervical y bebida fría.',
    category: 'premium',
    tag: 'EXPERIENCIA COMPLETA',
    featured: true,
    serviceId: 'experiencia-completa'
  },
  {
    id: 'look-2',
    src: getAssetUrl('imagenes/IMG_3526.webp'),
    image_url: 'imagenes/IMG_3526.webp',
    title: 'Burst Fade · Diseño 23',
    subtitle: 'Degradado curvo milimétrico con textura superior personalizada.',
    category: 'fades',
    tag: 'FADE',
    featured: false,
    serviceId: 'corte'
  },
  {
    id: 'look-4',
    src: getAssetUrl('imagenes/barba-premium.webp'),
    image_url: 'imagenes/barba-premium.webp',
    title: 'Barba Premium · Ritual de Navaja',
    subtitle: 'Perfilado al detalle, toalla caliente y aceites botánicos.',
    category: 'premium',
    tag: 'RITUAL A NAVAJA',
    featured: false,
    serviceId: 'barba-premium'
  },
  {
    id: 'look-5',
    src: getAssetUrl('imagenes/corte-bebida.webp'),
    image_url: 'imagenes/corte-bebida.webp',
    title: 'Corte + Bebida Fría',
    subtitle: 'Fade con cerveza fría, Monster o gaseosa en el sillón.',
    category: 'fades',
    tag: 'CORTE + BEBIDA',
    featured: false,
    serviceId: 'corte-bebida'
  },
  {
    id: 'look-6',
    src: getAssetUrl('imagenes/IMG_0989.webp'),
    image_url: 'imagenes/IMG_0989.webp',
    title: 'Colorimetría & Textura Técnica',
    subtitle: 'Iluminación, reflejos y peinado técnico de alta duración.',
    category: 'freestyle',
    tag: 'COLOR & TÉCNICA',
    featured: false,
    serviceId: 'colorimetria'
  }
];

export default function AuthorPortfolio({ onSelectService, onStartBooking }) {
  const [items, setItems] = useState(DEFAULT_PORTFOLIO_ITEMS);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchItems() {
      try {
        const res = await api.getPortfolio();
        if (isMounted && res.items && Array.isArray(res.items) && res.items.length > 0) {
          const normalized = res.items.map((it) => {
            let src = it.src;
            if (!src) {
              if (it.image_url?.startsWith('data:image/') || it.image_url?.startsWith('http')) {
                src = it.image_url;
              } else if (it.image_url) {
                src = getAssetUrl(it.image_url);
              } else {
                src = getAssetUrl('imagenes/IMG_3526.webp');
              }
            }
            return {
              ...it,
              src,
              serviceId: it.service_id || it.serviceId || 'corte',
              featured: Boolean(it.featured)
            };
          });
          setItems(normalized);
        }
      } catch (err) {
        // Fallback to static
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchItems();
    return () => {
      isMounted = false;
    };
  }, []);

  const categories = [
    { id: 'all', label: `Todos (${items.length})` },
    { id: 'fades', label: 'Fades' },
    { id: 'freestyle', label: 'Freestyle' },
    { id: 'premium', label: 'Premium & Barba' },
    { id: 'colorimetria', label: 'Colorimetría' }
  ].filter((cat) => cat.id === 'all' || items.some((it) => it.category === cat.id));

  const filteredItems = items.filter((item) => {
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
    <section className="w-full space-y-6 animate-enter">
      {/* Header Editorial de la Galería */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E5C378]" />
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] text-[#E5C378]">
              Galería &amp; Lookbook de David
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#EDEDED] flex items-center gap-2.5">
            <Camera className="w-6 h-6 text-[#E5C378] stroke-[1.5]" />
            <span>
              Cortes y{' '}
              <span className="font-editorial italic font-normal text-[#E5C378]">
                fades
              </span>
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8A898E] max-w-2xl">
            Galería exclusiva de degradados quirúrgicos, diseños a navaja y rituales ejecutados en el sillón privado de David.
          </p>
        </div>

        {/* Filter Pills & Instagram Link */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#141416] border border-white/[0.08] text-xs font-mono">
            {categories.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeFilter === f.id
                    ? 'bg-white/[0.12] text-[#EDEDED] font-bold border border-[#E5C378]'
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
            className="px-3.5 py-2 rounded-xl bg-[#141416] border border-white/[0.08] hover:border-[#E5C378]/50 text-xs font-mono text-[#8A898E] hover:text-[#EDEDED] flex items-center gap-1.5 transition-colors shadow-sm"
            title="Ver más en Instagram @barber_f4de"
          >
            <InstagramIcon className="w-3.5 h-3.5 text-[#E5C378]" />
            <span className="hidden sm:inline">@barber_f4de</span>
          </a>
        </div>
      </div>

      {/* Grid de Gran Formato en PC (3 Columnas Amplias: Fotos Grandes y Claras) */}
      {loading ? (
        <div className="py-24 text-center flex items-center justify-center gap-2 text-xs font-mono text-[#8A898E]">
          <Loader2 className="w-4 h-4 animate-spin text-[#E5C378]" />
          <span>Cargando galería de cortes...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-[#141416] card-hairline space-y-2">
          <p className="text-sm font-display text-[#EDEDED]">No hay cortes en esta categoría</p>
          <p className="text-xs text-[#8A898E]">Seleccioná otra categoría para explorar los trabajos de David.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-2xl overflow-hidden border border-white/[0.08] hover:border-[#E5C378]/60 bg-[#141416] text-left transition-all duration-300 shadow-lg hover:shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col justify-end min-h-[460px] sm:min-h-[490px]"
            >
              {/* Foto de fondo con zoom suave */}
              <img
                src={item.src}
                alt={`${item.title} - ${item.tag || 'Corte de autor'} realizado por David Barber`}
                decoding="async"
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
                <span className="px-2.5 py-1 rounded-md bg-[#0B0B0C]/85 backdrop-blur-md border border-white/[0.12] text-[10px] font-mono text-[#E5C378] uppercase tracking-wider font-bold">
                  {item.tag}
                </span>

                {item.featured && (
                  <span className="px-2 py-0.5 rounded-md bg-[#E5C378] text-[#0D0D0F] text-[9px] font-mono uppercase tracking-widest font-extrabold flex items-center gap-1 shadow-md">
                    <Flame className="w-3 h-3 fill-[#0D0D0F]" />
                    <span>DESTACADO</span>
                  </span>
                )}
              </div>

              {/* Botón flotante para ampliar imagen */}
              <button
                type="button"
                onClick={() => openLightbox(item)}
                className="absolute top-12 right-3.5 w-8 h-8 rounded-lg bg-[#0B0B0C]/80 backdrop-blur-md border border-white/[0.12] flex items-center justify-center text-[#EDEDED] opacity-75 hover:opacity-100 hover:border-[#E5C378]/60 transition-all shadow-md z-10"
                title="Ampliar fotografía a pantalla completa"
                aria-label="Ampliar fotografía"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>

              {/* Tarjeta de Información & Reserva Directa */}
              <div className="relative z-10 p-5 sm:p-6 space-y-3.5">
                <div className="space-y-1">
                  <h3 className="text-xl sm:text-2xl font-display font-bold text-[#EDEDED] tracking-tight leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#8A898E] leading-relaxed line-clamp-2">
                    {item.subtitle}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between gap-3 border-t border-white/[0.08]">
                  <span className="text-[10px] font-mono tracking-wider text-[#8A898E] uppercase flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-[#E5C378]" />
                    Ejecutado por David
                  </span>

                  <button
                    type="button"
                    onClick={() => handleSelectStyle(item.serviceId)}
                    className="px-3.5 py-2 rounded-lg bg-[#E5C378] hover:bg-[#F3E5AB] text-[#0D0D0F] font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-[0.98] transition-all"
                  >
                    <span>Quiero este corte</span>
                    <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal a Pantalla Completa */}
      {activePhoto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-8 animate-enter"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Top Bar: Título, categoría y botón cerrar */}
          <div
            className="flex items-center justify-between gap-4 max-w-6xl w-full mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <span className="text-[10px] font-mono tracking-[0.2em] text-[#E5C378] uppercase">
                {activePhoto.tag} • LOOKBOOK
              </span>
              <h4 className="text-lg sm:text-xl font-display font-bold text-[#EDEDED]">
                {activePhoto.title}
              </h4>
            </div>

            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              className="p-2 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-[#EDEDED] transition-colors"
              title="Cerrar visor"
              aria-label="Cerrar visor"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Central Photo View with Next/Prev navigation buttons */}
          <div
            className="relative flex-1 flex items-center justify-center my-4 max-w-6xl w-full mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={handlePrevPhoto}
              className="absolute left-2 sm:left-4 z-10 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/[0.12] transition-all hover:scale-110"
              title="Corte anterior"
              aria-label="Corte anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <img
              src={activePhoto.src}
              alt={`${activePhoto.title} en detalle - Trabajo realizado por David Barber`}
              decoding="async"
              className="max-h-[72vh] max-w-full rounded-xl object-contain shadow-2xl border border-white/[0.08]"
            />

            <button
              type="button"
              onClick={handleNextPhoto}
              className="absolute right-2 sm:right-4 z-10 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/[0.12] transition-all hover:scale-110"
              title="Corte siguiente"
              aria-label="Corte siguiente"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Bottom Bar: Descripción y CTA Directo */}
          <div
            className="max-w-2xl w-full mx-auto text-center space-y-3 pb-2"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs sm:text-sm text-[#A0A0A5] leading-relaxed">
              {activePhoto.subtitle}
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setLightboxIndex(null);
                  handleSelectStyle(activePhoto.serviceId);
                }}
                className="px-6 py-3 rounded-lg bg-[#E5C378] hover:bg-[#F3E5AB] text-[#0D0D0F] font-mono font-bold text-xs uppercase tracking-[0.16em] flex items-center gap-2 shadow-[0_0_25px_-5px_rgba(229,195,120,0.5)] transition-all"
              >
                <span>Reservar este corte con David</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
