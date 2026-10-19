import React, { useState } from 'react';
import {
  Flame,
  QrCode,
  ArrowRight,
  Award,
  Gift,
  X,
  Scissors,
  Lock,
  Sparkles
} from 'lucide-react';
import OdometerCounter from '../common/OdometerCounter';
import SpotlightCard from '../common/SpotlightCard';
import { getAssetUrl } from '../../utils/assets';

export default function MembershipCard({
  client,
  studioConfig,
  onStartBooking,
  onRequestLogin,
  guestMode = 'socio',
  onSelectService
}) {
  const [activeTab, setActiveTab] = useState('puntos'); // 'puntos' | 'premios'
  const [showQrModal, setShowQrModal] = useState(false);

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
    <div className="space-y-6">
      {/* Top User Greeting Row with Editorial Typography */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-[#141416] border border-white/[0.08] flex items-center justify-center text-[#D4AF37] font-display font-bold text-sm">
            {client ? (client.firstName || client.name?.split(' ')[0] || 'S').charAt(0).toUpperCase() : 'D'}
          </div>
          <div>
            <span className="micro-technical block text-[9px] text-[#8A898E]">
              CLUB PRIVADO · ACCESO
            </span>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-[#EDEDED] leading-tight">
              Hola,{' '}
              <span className="font-editorial italic font-normal text-[#D4AF37]">
                {client ? (client.firstName || client.name?.split(' ')[0] || 'Socio') : 'Invitado'}
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="px-2.5 py-1 rounded bg-[#141416] border border-white/[0.08] flex items-center gap-1.5"
            title="Cortes históricos completados"
          >
            <Flame className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" />
            <span className="font-mono text-xs text-[#EDEDED] tabular-nums font-semibold">
              {cuts}
            </span>
          </div>

          {client && (
            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="p-2 rounded bg-[#141416] border border-white/[0.08] text-[#8A898E] hover:text-[#D4AF37] hover:border-[#D4AF37]/50 transition-colors"
              title="Mostrar credencial QR de socio"
              aria-label="Mostrar credencial QR de socio"
            >
              <QrCode className="w-4 h-4 stroke-[1.5]" />
            </button>
          )}
        </div>
      </div>

      {/* Two-Tab Club Pass Container (Pase de Socio | Canjes) */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 border-b border-white/[0.08] pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('puntos')}
            className={`pb-2 px-1 text-[11px] font-mono uppercase tracking-[0.15em] transition-colors relative ${
              activeTab === 'puntos'
                ? 'text-[#EDEDED] font-bold after:absolute after:bottom-[-5px] after:left-0 after:right-0 after:h-[2px] after:bg-[#D4AF37]'
                : 'text-[#8A898E] hover:text-[#EDEDED]'
            }`}
          >
            Pase de Socio
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('premios')}
            className={`pb-2 px-3 text-[11px] font-mono uppercase tracking-[0.15em] transition-colors relative ${
              activeTab === 'premios'
                ? 'text-[#EDEDED] font-bold after:absolute after:bottom-[-5px] after:left-0 after:right-0 after:h-[2px] after:bg-[#D4AF37]'
                : 'text-[#8A898E] hover:text-[#EDEDED]'
            }`}
          >
            Beneficios &amp; Canjes
          </button>
        </div>

        {activeTab === 'puntos' ? (
          /* Módulo Inspirado en Tarjeta Física Black Card / Apple Wallet */
          <div className={`black-card metal-shimmer p-5 sm:p-6 text-[#EDEDED] space-y-5 animate-enter relative ${
            points >= milestone ? 'black-card-reward' : ''
          }`}>
            {/* Si es Invitado y eligió "Primera vez", mostrar Pase de Socio Bloqueado con efecto Blur */}
            {!client && guestMode === 'primera_vez' && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-black/80 backdrop-blur-[6px] animate-enter">
                <div className="w-12 h-12 rounded-full bg-[#141417] border border-[#E5C378]/60 flex items-center justify-center text-[#E5C378] mb-2.5 shadow-2xl">
                  <Lock className="w-4 h-4 stroke-[2]" />
                </div>
                <span className="badge-champagne mb-1.5 text-[9px]">PASE DE SOCIO · EN ESPERA</span>
                <h4 className="font-display font-bold text-base text-[#EDEDED] leading-snug">
                  Tu 1º corte te espera en el sillón
                </h4>
                <p className="text-[11px] text-[#8A898E] max-w-xs mt-1 leading-relaxed">
                  Tu pase privado se activa automáticamente al reservar tu primer turno sin ninguna seña previa.
                </p>
                <button
                  type="button"
                  onClick={() => onStartBooking && onStartBooking()}
                  className="mt-3.5 px-4 py-2 rounded-md bg-[#EDEDED] hover:bg-white text-[#0B0B0C] font-mono text-[10px] font-bold uppercase tracking-[0.15em] flex items-center gap-1.5 shadow-md active:scale-[0.98] transition-all"
                >
                  <Sparkles className="w-3 h-3 text-[#E5C378]" />
                  <span>Activar con mi primer turno</span>
                  <ArrowRight className="w-3 h-3 text-[#0B0B0C]" />
                </button>
              </div>
            )}

            {/* Header: Marca y Badge Quirúrgico */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-[#E5C378]">
                  <Scissors className="w-3.5 h-3.5 -rotate-45 stroke-[1.5]" />
                </div>
                <div>
                  <span className="text-[10px] font-mono tracking-[0.2em] uppercase font-bold text-[#EDEDED] block leading-none">
                    DAVID BARBER
                  </span>
                  <span className="text-[8px] font-mono tracking-[0.2em] text-[#8A898E] uppercase block mt-0.5">
                    CLIENT CLUB PASS
                  </span>
                </div>
              </div>

              <div className="badge-champagne">
                {points >= milestone ? '★ CORTE $0 LISTO' : tierTitle.split('·')[0].trim()}
              </div>
            </div>

            {/* Reward Ready Celebration Callout (when points >= 10) */}
            {client && points >= milestone && (
              <div className="p-3 rounded-md bg-[#E5C378]/10 border border-[#E5C378]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs animate-enter">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#E5C378] shrink-0" />
                  <span className="text-[#EDEDED] font-semibold text-[11px] leading-tight">
                    Tenés 1 corte de autor $0 bonificado listo para canjear
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onStartBooking && onStartBooking()}
                  className="px-3 py-1 rounded bg-[#E5C378] hover:bg-[#F3E5AB] text-[#0D0D0F] font-mono text-[9px] font-bold uppercase tracking-wider shrink-0 transition-colors shadow-sm"
                >
                  Canjear en mi turno
                </button>
              </div>
            )}

            {/* Middle: Saldo de Puntos & Chip Táctil */}
            <div className="flex items-end justify-between pt-1">
              <div>
                <span className="micro-technical block text-[9px] text-[#8A898E] mb-1">
                  BALANCE DISPONIBLE
                </span>
                <div className="flex items-baseline gap-2">
                  <OdometerCounter
                    value={points}
                    className="text-5xl sm:text-6xl font-display font-bold tracking-tight text-[#EDEDED] tabular-nums leading-none"
                  />
                  <span className="text-xs font-mono font-bold tracking-widest text-[#E5C378]">
                    PTS
                  </span>
                </div>
              </div>

              {/* Emulated tactile chip */}
              <div className="w-10 h-7 rounded border border-white/20 bg-gradient-to-br from-white/10 to-white/5 p-1 flex flex-col justify-between opacity-80">
                <div className="h-[1px] w-full bg-white/20" />
                <div className="flex justify-between">
                  <div className="w-2 h-2 border border-white/20 rounded-sm" />
                  <div className="w-2 h-2 border border-white/20 rounded-sm" />
                </div>
                <div className="h-[1px] w-full bg-white/20" />
              </div>
            </div>

            {/* Barra de Avance Robusta (6px) con brillo satinado */}
            <div className="space-y-2 pt-1">
              <div className="h-1.5 w-full bg-white/[0.08] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#C8A858] via-[#E5C378] to-[#F3E5AB] shadow-[0_0_12px_rgba(229,195,120,0.5)] transition-all duration-700 ease-out rounded-full"
                  style={{ width: `${!client ? 12 : points >= milestone ? 100 : progressPct}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono tracking-[0.12em] uppercase text-[#8A898E]">
                <span>
                  {!client
                    ? '1º VISITA = TU 1º PASO AL CORTE BONIFICADO'
                    : remainingForFree === 0
                    ? 'CORTE BONIFICADO LISTO PARA CANJE'
                    : `FALTAN ${remainingForFree} PARA CORTE BONIFICADO`}
                </span>
                <span className="text-[#EDEDED] font-bold tabular-nums">
                  {!client ? '0 / 10' : `${points % milestone} / 10`}
                </span>
              </div>
            </div>

            {/* Datos de Socio y Botón de Apertura */}
            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-display font-bold tracking-wider text-[#EDEDED] block uppercase">
                  {client ? `${client.firstName || client.name || 'SOCIO'} ${client.lastName || ''}`.trim() : guestMode === 'primera_vez' ? 'NUEVO SOCIO' : 'SOCIO INVITADO'}
                </span>
                <span className="text-[10px] font-mono tracking-widest text-[#8A898E] block mt-0.5 tabular-nums">
                  {client ? `DNI N° ${client.dni}` : guestMode === 'primera_vez' ? 'MEMBRESÍA POR ACTIVAR' : 'RESERVÁ O IDENTIFICATE'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => (client ? setShowQrModal(true) : onRequestLogin && onRequestLogin())}
                className="px-3 py-1.5 rounded bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] hover:border-[#E5C378]/50 text-[10px] font-mono tracking-[0.12em] uppercase text-[#EDEDED] flex items-center gap-1.5 transition-all"
              >
                <QrCode className="w-3.5 h-3.5 text-[#E5C378] stroke-[1.5]" />
                <span>{client ? 'Credencial QR' : 'Entrar'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Pestaña de Premios & Canjes */
          <div className="card-hairline rounded-lg p-5 text-[#EDEDED] space-y-6 animate-enter">
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/[0.08]">
                <span className="micro-technical text-[10px] text-[#EDEDED]">
                  CATÁLOGO DE CANJE
                </span>
                <span className="text-[11px] font-mono text-[#D4AF37] font-bold">
                  {points} PTS DISPONIBLES
                </span>
              </div>

              <div className="space-y-3">
                {redeemables.map((item) => {
                  const canAfford = points >= item.pointsCost;
                  const isOutOfStock = item.hasStockLimit && item.stock <= 0;

                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded bg-[#101012] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <strong className="text-sm font-semibold text-[#EDEDED]">
                            {item.name}
                          </strong>
                          {item.hasStockLimit && (
                            <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider ${
                              item.stock > 0
                                ? 'bg-white/[0.06] text-[#8A898E]'
                                : 'bg-red-500/15 text-red-400'
                            }`}>
                              {item.stock > 0 ? `${item.stock} en stock` : 'Agotado'}
                            </span>
                          )}
                        </div>
                        <p className="text-[#8A898E] text-xs leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.06]">
                        <span className="font-mono font-bold text-sm text-[#D4AF37] tabular-nums">
                          {item.pointsCost} PTS
                        </span>

                        <span className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase tracking-wider ${
                          isOutOfStock
                            ? 'bg-white/[0.04] text-[#8A898E]/50'
                            : canAfford
                            ? 'bg-[#D4AF37] text-[#0B0B0C] font-bold'
                            : 'bg-white/[0.04] text-[#8A898E] border border-white/[0.08]'
                        }`}>
                          {isOutOfStock ? 'Sin stock' : canAfford ? 'Canjeable' : 'Puntos insuficientes'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Beneficios Permanentes */}
            <div className="pt-3 border-t border-white/[0.08]">
              <span className="micro-technical block text-[10px] text-[#8A898E] mb-3">
                BENEFICIOS DE SOCIO
              </span>

              <ul className="divide-y divide-white/[0.06] text-xs">
                {clubBenefits.map((b) => (
                  <li key={b.id} className="py-2.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded bg-[#101012] border border-white/[0.08] flex items-center justify-center text-[#D4AF37] shrink-0">
                        <Award className="w-3.5 h-3.5 stroke-[1.5]" />
                      </div>
                      <div>
                        <strong className="text-[#EDEDED] font-semibold block text-xs">
                          {b.title}
                        </strong>
                        <span className="text-[#8A898E] text-[11px]">
                          {b.description}
                        </span>
                      </div>
                    </div>
                    {b.badge && (
                      <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] font-mono text-[#D4AF37] text-[10px] tracking-wider shrink-0">
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

      {/* Hero Booking Action Banner con Integración Fluida (Mobile only; on desktop it is placed in the right sidebar) */}
      <div className="lg:hidden relative rounded-lg overflow-hidden border border-white/[0.08] bg-[#141416]">
        <img
          src={getAssetUrl('imagenes/IMG_0989.JPG.jpeg')}
          alt="David en el estudio"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-25"
        />
        <div className="relative z-10 p-5 sm:p-6 bg-gradient-to-r from-[#0B0B0C] via-[#0B0B0C]/90 to-transparent flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 max-w-sm">
            <span className="micro-technical block text-[9px] text-[#8A898E]">
              01 / 03 PASO INICIAL · RESERVA SIN SEÑA
            </span>
            <h2 className="text-lg sm:text-xl font-display font-bold text-[#EDEDED] leading-snug">
              Tu próximo corte te{' '}
              <span className="font-editorial italic font-normal text-[#D4AF37]">
                espera
              </span>
            </h2>
            <p className="text-xs text-[#8A898E]">
              Confirmación directa por WhatsApp con David.
            </p>
          </div>

          <button
            type="button"
            onClick={onStartBooking}
            className="px-5 py-3 rounded-md bg-[#EDEDED] hover:bg-white active:scale-[0.98] text-[#0B0B0C] font-mono font-bold text-xs uppercase tracking-[0.15em] flex items-center gap-2 transition-all shadow-sm shrink-0"
          >
            <span>Sacá tu turno</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#0B0B0C] stroke-[2]" />
          </button>
        </div>
      </div>



      {/* Modal Credencial Digital QR */}
      {showQrModal && client && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-enter">
          <div className="w-full max-w-xs rounded-lg bg-[#141416] border border-white/[0.12] p-5 text-center space-y-4 text-[#EDEDED]">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <span className="micro-technical text-[9px]">PASE DIGITAL DE SOCIO</span>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="p-1 text-[#8A898E] hover:text-[#EDEDED]"
              >
                <X className="w-4 h-4 stroke-[1.5]" />
              </button>
            </div>

            {/* Crisp SVG QR Code */}
            <div className="w-36 h-36 mx-auto p-3 rounded bg-white flex flex-col items-center justify-center">
              <QrCode className="w-24 h-24 text-black stroke-[1.5]" />
              <span className="mt-1 font-mono text-[10px] font-bold text-black tabular-nums">
                DNI {client?.dni || ''}
              </span>
            </div>

            <div className="space-y-1">
              <p className="font-display font-bold text-sm text-[#EDEDED] uppercase">
                {client ? `${client.firstName || client.name || 'Socio'} ${client.lastName || ''}`.trim() : 'Socio Invitado'}
              </p>
              <p className="text-[11px] font-mono text-[#D4AF37] tabular-nums">
                {points} PTS DISPONIBLES • {cuts} CORTES
              </p>
              <p className="text-[10px] text-[#8A898E] pt-1">
                Presentá este pase a David para sumar o canjear tus puntos.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded bg-white/[0.08] hover:bg-white/[0.12] text-[#EDEDED] font-mono text-xs uppercase tracking-wider"
            >
              Listo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
