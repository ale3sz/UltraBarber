import React, { useState } from 'react';
import {
  Flame,
  QrCode,
  ArrowRight,
  Award,
  Gift,
  Camera,
  Maximize2,
  X
} from 'lucide-react';
import { getAssetUrl } from '../../utils/assets';

const getImageSrc = getAssetUrl;

const STUDIO_GALLERY = [
  {
    id: 'look-1',
    src: getAssetUrl('imagenes/corte-bebida.jpg'),
    title: 'Corte + Bebida (Monster Energy)',
    subtitle: 'Fade comprimido + diseño a navaja',
    tag: 'CORTE + BEBIDA'
  },
  {
    id: 'look-2',
    src: getAssetUrl('imagenes/IMG_3526.PNG'),
    title: 'Burst Fade · Diseño 23',
    subtitle: 'Degradado curvo y textura superior',
    tag: 'FADE DE AUTOR'
  },
  {
    id: 'look-3',
    src: getAssetUrl('imagenes/corte-premium.png'),
    title: 'Corte Premium · Relax VIP',
    subtitle: 'Gafas de masaje ocular + pistola cervical',
    tag: 'CORTE PREMIUM'
  },
  {
    id: 'look-4',
    src: getAssetUrl('imagenes/IMG_0989.JPG.jpeg'),
    title: 'Colorimetría & Sesión VIP',
    subtitle: 'Iluminación, reflejos y terminación técnica',
    tag: 'COLOR & TÉCNICA'
  }
];

export default function MembershipCard({ client, studioConfig, onStartBooking, onRequestLogin }) {
  const [activeTab, setActiveTab] = useState('puntos'); // 'puntos' | 'premios'
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const points = client?.points || 0;
  const cuts = client?.totalCuts || 0;
  const milestone = 10;
  const progressPct = Math.min(100, Math.round(((points % milestone) / milestone) * 100));
  const remainingForFree = points >= milestone ? 0 : milestone - (points % milestone);

  const clubBenefits = studioConfig?.clubBenefits?.filter(b => b.active !== false) || [
    {
      id: 'ben-corte',
      title: 'Corte de Autor Bonificado',
      description: 'Acumulando 10 puntos con tus visitas en el estudio',
      badge: '10 PTS'
    },
    {
      id: 'ben-bebida',
      title: 'Barra de Cortesía en el Sillón',
      description: 'Cerveza helada, gaseosa o agua mineral en servicios con bebida',
      badge: 'INCLUIDO'
    },
    {
      id: 'ben-cumple',
      title: 'Beneficio Semana de Cumpleaños',
      description: 'Atención preferencial y regalo directo en tu WhatsApp',
      badge: 'SOCIOS'
    }
  ];

  const redeemables = studioConfig?.redeemables?.filter(r => r.active !== false) || [
    {
      id: 'red-corte',
      name: 'Corte de Autor Completo',
      pointsCost: 10,
      stock: 99,
      hasStockLimit: false,
      description: 'Canjeá 10 puntos y tu próximo corte es 100% bonificado.'
    },
    {
      id: 'red-pomada',
      name: 'Pomada Matte de Autor (50g)',
      pointsCost: 6,
      stock: 8,
      hasStockLimit: true,
      description: 'Fijación media y acabado natural mate con aroma exclusivo.'
    },
    {
      id: 'red-aceite',
      name: 'Aceite Nutritivo para Barba',
      pointsCost: 5,
      stock: 5,
      hasStockLimit: true,
      description: 'Hidratación profunda de piel y vello facial con extractos botánicos.'
    }
  ];

  let tierTitle = 'Black Member · Nivel 1';
  if (cuts >= 12) tierTitle = 'Gold VIP · Nivel 3';
  else if (cuts >= 6) tierTitle = 'Silver & Gold · Nivel 2';

  return (
    <div className="space-y-5">
      {/* Top User Greeting Row (Inspired by Reference Video) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-barber-lightSurface dark:bg-barber-darkSurface border border-barber-chai flex items-center justify-center text-barber-chai font-display font-bold text-base">
            {client ? (client.firstName || client.name?.split(' ')[0] || 'S').charAt(0).toUpperCase() : 'D'}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-barber-lightText dark:text-barber-darkText">
              Hola,{' '}
              <span className="font-editorial italic font-normal text-barber-chai">
                {client ? (client.firstName || client.name?.split(' ')[0] || 'Socio') : 'Invitado'}
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="px-3 py-1.5 rounded-full bg-barber-lightSurface dark:bg-barber-darkSurface border border-barber-lightBorder dark:border-barber-darkBorder flex items-center gap-1.5"
            title="Cortes históricos completados"
          >
            <Flame className="w-4 h-4 text-barber-chai fill-barber-chai" />
            <span className="font-mono font-bold text-sm text-barber-lightText dark:text-barber-darkText tabular-nums">
              {cuts}
            </span>
          </div>

          {client && (
            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="p-2.5 rounded-full bg-barber-lightSurface dark:bg-barber-darkSurface border border-barber-lightBorder dark:border-barber-darkBorder text-barber-chai hover:border-barber-chai transition-colors"
              title="Mostrar credencial QR en barbería"
              aria-label="Mostrar código QR de socio"
            >
              <QrCode className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Two-Tab Club Pass Container (Puntos | Premios) */}
      <div>
        <div className="flex items-center gap-2 mb-0">
          <button
            type="button"
            onClick={() => setActiveTab('puntos')}
            className={`px-5 py-2.5 rounded-t-2xl text-xs font-bold tracking-wide transition-colors ${
              activeTab === 'puntos'
                ? 'bg-barber-darkSurface text-barber-chai border-t border-x border-barber-darkBorder'
                : 'text-barber-lightMuted dark:text-barber-darkMuted hover:text-barber-lightText dark:hover:text-barber-darkText'
            }`}
          >
            Puntos
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('premios')}
            className={`px-5 py-2.5 rounded-t-2xl text-xs font-bold tracking-wide transition-colors ${
              activeTab === 'premios'
                ? 'bg-barber-darkSurface text-barber-chai border-t border-x border-barber-darkBorder'
                : 'text-barber-lightMuted dark:text-barber-darkMuted hover:text-barber-lightText dark:hover:text-barber-darkText'
            }`}
          >
            Premios
          </button>
        </div>

        {activeTab === 'puntos' ? (
          <div className="relative rounded-3xl rounded-tl-none overflow-hidden border border-barber-chai/40 club-shadow bg-barber-darkSurface text-barber-darkText animate-enter">
            {/* Subtle botanical warm ambient glow behind the card */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-barber-matcha/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-barber-chai/15 rounded-full blur-3xl pointer-events-none" />

            {/* Upper Dark Obsidian Section */}
            <div className="relative p-6 sm:p-7 z-10">
              <div className="flex items-baseline justify-between gap-4">
                <div className="flex items-baseline gap-2.5">
                  <span className="text-6xl sm:text-7xl font-display font-bold tracking-tight text-barber-darkText tabular-nums leading-none">
                    {points}
                  </span>
                  <span className="text-sm font-mono font-bold uppercase tracking-widest text-barber-pistache">
                    PTS
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono text-barber-pistache block tabular-nums">
                    {cuts} {cuts === 1 ? 'VISITA REGISTRADA' : 'VISITAS REGISTRADAS'}
                  </span>
                  <span className="text-xs text-barber-chai font-semibold block mt-0.5">
                    +1 corte = +1 punto
                  </span>
                </div>
              </div>

              {/* Progress toward 10-point reward */}
              <div className="mt-6">
                <div className="w-full h-2 rounded-full bg-barber-darkBg/80 border border-barber-darkBorder overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-barber-gold to-barber-goldLight rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${points >= milestone ? 100 : progressPct}%` }}
                  />
                </div>
                <p className="mt-2.5 text-xs font-mono uppercase tracking-wider text-barber-pistache flex items-center justify-between">
                  <span>
                    {!client
                      ? 'INGRESÁ CON TU DNI + PIN PARA VER TU BALANCE REAL'
                      : remainingForFree === 0
                      ? 'CORTE BONIFICADO DISPONIBLE PARA CANJEAR'
                      : `FALTAN ${remainingForFree} ${remainingForFree === 1 ? 'PUNTO' : 'PUNTOS'} PARA TU PRÓXIMO CORTE`}
                  </span>
                  <span className="tabular-nums font-bold text-barber-chai">
                    {points % milestone}/10
                  </span>
                </p>
              </div>
            </div>

            {/* Lower Gold Metallic Band (Black & Gold Pass Footer) */}
            <button
              type="button"
              onClick={() => (client ? setShowQrModal(true) : onRequestLogin && onRequestLogin())}
              className="relative z-10 w-full px-6 py-4 bg-gradient-to-r from-barber-chai via-barber-vanilla to-barber-chai text-barber-carob flex items-center justify-between text-left hover:brightness-105 active:scale-[0.99] transition-all"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-11 rounded-lg bg-barber-darkBg text-barber-chai border border-barber-chai/50 flex items-center justify-center shadow-md -rotate-6 transform transition-transform group-hover:rotate-0">
                  <Award className="w-5 h-5 text-barber-chai" />
                </div>
                <div>
                  <span className="font-display font-bold text-sm text-barber-lightText block leading-tight">
                    {tierTitle}
                  </span>
                  <span className="font-mono text-xs font-semibold text-barber-carob tracking-wider block mt-0.5 tabular-nums">
                    {client ? `SOCIO DNI N° ${client.dni}` : 'TOCÁ PARA INGRESAR A TU CUENTA'}
                  </span>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-barber-lightText/10 flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-barber-lightText" />
              </div>
            </button>
          </div>
        ) : (
          /* Premios & Beneficios Dinámicos */
          <div className="rounded-3xl rounded-tl-none p-6 bg-barber-darkSurface border border-barber-darkBorder club-shadow text-barber-darkText space-y-6 animate-enter">
            {/* 1. Canjeables con Puntos y Stock */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-display font-bold text-barber-darkText flex items-center gap-2">
                  <Gift className="w-4 h-4 text-barber-chai" />
                  <span>Canjes de Productos &amp; Cortes</span>
                </h3>
                <span className="text-[11px] font-mono text-barber-pistache">
                  {points} pts disponibles
                </span>
              </div>

              <div className="space-y-3">
                {redeemables.map((item) => {
                  const canAfford = points >= item.pointsCost;
                  const isOutOfStock = item.hasStockLimit && item.stock <= 0;

                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-barber-darkBg border border-barber-darkBorder flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <strong className="text-sm font-semibold text-barber-darkText">
                            {item.name}
                          </strong>
                          {item.hasStockLimit && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                              item.stock > 0
                                ? 'bg-barber-matcha/20 text-barber-matcha'
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {item.stock > 0 ? `${item.stock} en stock` : 'Agotado'}
                            </span>
                          )}
                        </div>
                        <p className="text-barber-pistache leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-barber-darkBorder/60">
                        <span className="font-mono font-bold text-sm text-barber-chai tabular-nums">
                          {item.pointsCost} PTS
                        </span>

                        <span className={`px-3 py-1.5 rounded-xl font-mono text-[11px] font-bold uppercase ${
                          isOutOfStock
                            ? 'bg-barber-darkBorder text-barber-pistache/50'
                            : canAfford
                            ? 'bg-barber-matcha text-white'
                            : 'bg-barber-darkSurface text-barber-pistache border border-barber-darkBorder'
                        }`}>
                          {isOutOfStock ? 'Sin stock' : canAfford ? 'Canjeable' : 'Puntos insuficientes'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Beneficios de Miembro */}
            <div className="pt-4 border-t border-barber-darkBorder">
              <h3 className="text-base font-display font-bold text-barber-darkText mb-3">
                Beneficios permanentes del Studio
              </h3>

              <ul className="divide-y divide-barber-darkBorder text-xs">
                {clubBenefits.map((b) => (
                  <li key={b.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-barber-darkBg border border-barber-darkBorder flex items-center justify-center text-barber-chai shrink-0">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <strong className="text-barber-darkText font-semibold block text-sm">
                          {b.title}
                        </strong>
                        <span className="text-barber-pistache">
                          {b.description}
                        </span>
                      </div>
                    </div>
                    {b.badge && (
                      <span className="px-2.5 py-1 rounded-lg bg-barber-darkBg border border-barber-darkBorder font-mono font-bold text-barber-chai shrink-0 text-[10px]">
                        {b.badge}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Hero Booking Action Banner (Con foto real del estudio de David) */}
      <div className="relative rounded-3xl overflow-hidden border border-barber-lightBorder dark:border-barber-darkBorder bg-barber-darkSurface club-shadow">
        <img
          src={getAssetUrl('imagenes/IMG_0989.JPG.jpeg')}
          alt="David trabajando en el sillón del estudio"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-45"
        />
        <div className="relative z-10 p-6 sm:p-7 bg-gradient-to-r from-barber-darkBg via-barber-darkBg/90 to-barber-darkBg/30 flex flex-col items-start justify-between gap-5">
          <div className="max-w-xs">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-barber-darkText leading-snug">
              Tu próximo corte te está esperando
            </h2>
            <p className="text-xs text-barber-pistache mt-1.5">
              Elegí servicio y horario en tres toques. Confirmación directa con David por WhatsApp.
            </p>
          </div>

          <button
            type="button"
            onClick={onStartBooking}
            className="px-6 py-3.5 rounded-full bg-white text-[#0A0A0A] font-display font-extrabold text-xs uppercase tracking-wider flex items-center gap-2.5 hover:bg-neutral-200 active:scale-95 transition-all shadow-lg border border-white/20"
          >
            <span>SACÁ TU TURNO</span>
            <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
          </button>
        </div>
      </div>

      {/* Lookbook / Galería de Trabajos Reales del Estudio */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-display font-bold text-barber-lightText dark:text-barber-darkText flex items-center gap-2">
            <Camera className="w-4 h-4 text-barber-chai" />
            <span>
              Trabajos reales en el{' '}
              <span className="font-editorial italic font-normal text-barber-chai">
                sillón
              </span>
            </span>
          </h2>
          <span className="text-[11px] font-mono text-barber-lightMuted dark:text-barber-darkMuted">
            TOCÁ PARA AMPLIAR
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
          {STUDIO_GALLERY.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedPhoto(item)}
              className="group relative aspect-[3/4] rounded-2xl sm:rounded-3xl overflow-hidden border border-barber-lightBorder dark:border-barber-darkBorder bg-barber-darkSurface text-left club-shadow focus:outline-none focus:ring-2 focus:ring-barber-chai"
            >
              <img
                src={getImageSrc(item.src)}
                alt={item.title}
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-barber-darkBg via-barber-darkBg/60 to-transparent pointer-events-none" />

              <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-barber-darkBg/85 backdrop-blur-md border border-barber-chai/40 text-[9px] font-mono font-bold text-barber-chai uppercase tracking-wider hidden sm:inline-block">
                {item.tag}
              </span>

              <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-barber-darkBg/75 backdrop-blur-md border border-barber-darkBorder flex items-center justify-center text-barber-darkText opacity-80 group-hover:opacity-100 group-hover:border-barber-chai transition-all">
                <Maximize2 className="w-3 h-3" />
              </div>

              <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3.5">
                <p className="font-display font-bold text-xs sm:text-sm text-barber-darkText leading-tight">
                  {item.title}
                </p>
                <p className="text-[10px] sm:text-xs text-barber-pistache line-clamp-1 mt-0.5">
                  {item.subtitle}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Modal Lightbox para ver foto del corte en tamaño completo */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-enter"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl overflow-hidden bg-barber-darkSurface border border-barber-darkBorder text-barber-darkText club-shadow"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[4/5] w-full bg-barber-darkBg">
              <img
                src={getImageSrc(selectedPhoto.src)}
                alt={selectedPhoto.title}
                className="w-full h-full object-cover object-top"
              />
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-3.5 right-3.5 p-2 rounded-full bg-barber-darkBg/85 backdrop-blur-md border border-barber-darkBorder text-barber-darkText hover:border-barber-chai transition-colors"
                aria-label="Cerrar vista previa"
              >
                <X className="w-4 h-4" />
              </button>
              <span className="absolute top-3.5 left-3.5 px-2.5 py-1 rounded-lg bg-barber-darkBg/85 backdrop-blur-md border border-barber-chai/40 text-[10px] font-mono font-bold text-barber-chai uppercase tracking-wider">
                {selectedPhoto.tag}
              </span>
            </div>

            <div className="p-5 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-display font-bold text-barber-darkText">
                  {selectedPhoto.title}
                </h3>
                <p className="text-xs text-barber-pistache mt-0.5">
                  {selectedPhoto.subtitle}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedPhoto(null);
                  onStartBooking();
                }}
                className="px-4 py-2.5 rounded-xl bg-barber-matcha text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 hover:brightness-105 active:scale-95 transition-all"
              >
                <span>Reservar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Credencial Digital QR para mostrar en el local */}
      {showQrModal && client && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-barber-darkSurface border border-barber-darkBorder p-6 text-center space-y-5 text-barber-darkText club-shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-display font-bold text-barber-darkText">
                Pase Digital de Socio
              </h3>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="p-2 rounded-xl text-barber-pistache hover:text-barber-darkText"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Crisp SVG QR Code */}
            <div className="w-44 h-44 mx-auto p-4 rounded-2xl bg-barber-lightBg flex flex-col items-center justify-center border-2 border-barber-chai">
              <QrCode className="w-28 h-28 text-barber-lightText stroke-[1.5]" />
              <span className="mt-1 font-mono text-xs font-bold text-barber-lightText tabular-nums">
                DNI {client?.dni || ''}
              </span>
            </div>

            <div className="space-y-1">
              <p className="font-display font-bold text-lg text-barber-darkText">
                {client ? `${client.firstName || client.name || 'Socio'} ${client.lastName || ''}`.trim() : 'Socio Invitado'}
              </p>
              <p className="text-xs font-mono text-barber-chai tabular-nums">
                {points} PUNTOS DISPONIBLES • {cuts} CORTES
              </p>
              <p className="text-xs text-barber-pistache pt-1">
                Mostrale este pase a David al momento de cobrar para sumar o canjear tus puntos.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full py-3 rounded-2xl bg-barber-matcha text-white font-semibold text-xs uppercase tracking-wider"
            >
              Listo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
