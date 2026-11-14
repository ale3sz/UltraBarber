import React, { useState, useEffect } from 'react';
import MembershipCard from './MembershipCard';
import DniStep from './DniStep';
import ServiceStep from './ServiceStep';
import DateTimeStep from './DateTimeStep';
import HoldWaitingStep from './HoldWaitingStep';
import AuthorPortfolio from './AuthorPortfolio';
import { api } from '../../services/api';
import AddToCalendarButton from './AddToCalendarButton';
import { getAssetUrl } from '../../utils/assets';
import MagneticButton from '../common/MagneticButton';
import { analytics } from '../../utils/analytics';
import {
  Camera,
  Calendar,
  Clock,
  MessageCircle,
  XCircle,
  CheckCircle2,
  Wine,
  ArrowRight,
  MapPin,
  Navigation,
  Scissors,
  Sparkles,
  Award,
  UserCheck
} from 'lucide-react';

export default function ClientView({
  subTab,
  setSubTab,
  loggedClient,
  clientAppointments = [],
  onAuthSuccess,
  onAdminAuthSuccess,
  onLogoutClient,
  onRefreshClientSession,
  studioConfig = {}
}) {
  const [bookingStep, setBookingStep] = useState(1);
  const [showSocioLogin, setShowSocioLogin] = useState(false); // 1: Service, 2: DateTime, 3: HoldWaiting
  const [guestMode, setGuestMode] = useState('socio'); // 'socio' | 'primera_vez'
  const [services, setServices] = useState([]);
  const [drinks, setDrinks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedService, setSelectedService] = useState(null);
  const [selectedDrink, setSelectedDrink] = useState('Cerveza');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [appointmentResponse, setAppointmentResponse] = useState(null);

  useEffect(() => {
    async function loadCatalog() {
      try {
        const res = await api.getServices();
        setServices(res.services || []);
        setDrinks(res.drinks || ['Agua mineral', 'Gaseosa', 'Cerveza']);
        if (res.services?.length > 0) {
          setSelectedService(res.services[0]);
        }
      } catch (err) {
        console.error('Error loading services:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, []);

  const handleRequestTurn = async (clientOverride = null) => {
    const clientToUse = clientOverride || loggedClient;
    if (!clientToUse) {
      setBookingStep(3);
      return;
    }
    if (!selectedService || !selectedDate || !selectedTime) {
      setBookingError('Seleccioná un servicio, fecha y horario libre.');
      return;
    }

    setIsSubmitting(true);
    setBookingError('');
    try {
      const res = await api.requestAppointment({
        serviceId: selectedService.id,
        selectedDrink: selectedService.drinkIncluded ? selectedDrink : null,
        date: selectedDate,
        time: selectedTime
      });
      setAppointmentResponse(res);
      setBookingStep(4);
      if (onRefreshClientSession) onRefreshClientSession();
    } catch (err) {
      setBookingError(err.message || 'No se pudo solicitar el turno.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelTurn = async (aptId) => {
    if (!window.confirm('¿Querés cancelar este turno y liberar el horario?')) return;
    try {
      await api.cancelMyAppointment(aptId);
      if (onRefreshClientSession) onRefreshClientSession();
    } catch (err) {
      alert(err.message || 'No se pudo cancelar el turno.');
    }
  };

  const activeTurns = clientAppointments.filter(
    (a) => a.status === 'pendiente' || a.status === 'confirmado'
  );

  if (loading) {
    return (
      <div className="py-24 text-center">
        <p className="text-xs font-mono uppercase tracking-widest text-barber-lightMuted dark:text-barber-darkMuted">
          Cargando ULTRA BARBER Studio...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl w-full mx-auto pb-28 md:pb-16 space-y-8">
            {/* PANTALLA 1: INICIO / HOME */}
      {(subTab === 'home' || !subTab) && (
        <div className="space-y-10 animate-enter">
          {/* Turno Activo Card (si existe turno en curso) */}
          {loggedClient && activeTurns.length > 0 && (
            <div className="p-5 rounded-2xl bg-[#141416] card-hairline text-[#EDEDED] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#E5C378] tracking-wider uppercase block mb-0.5">Turno en curso</span>
                  <h2 className="text-base font-display font-bold text-[#EDEDED]">
                    Próxima visita al <span className="font-editorial italic font-normal text-[#E5C378]">estudio</span>
                  </h2>
                </div>
                <span className="badge-champagne font-mono font-bold uppercase tracking-wider text-[11px] tabular-nums">
                  #{activeTurns[0].code} • {activeTurns[0].status}
                </span>
              </div>

              <div className="flex flex-col gap-3 text-xs text-[#8A898E]">
                <div>
                  <strong className="text-sm text-[#EDEDED] block font-display">
                    {activeTurns[0].serviceName}
                    {activeTurns[0].selectedDrink ? ` • ${activeTurns[0].selectedDrink}` : ''}
                  </strong>
                  <span className="font-mono tabular-nums text-xs text-[#8A898E]">
                    {activeTurns[0].date} • {activeTurns[0].time} hs
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/[0.06]">
                  <AddToCalendarButton appointment={activeTurns[0]} studioConfig={studioConfig} />

                  {activeTurns[0].status === 'pendiente' && (
                    <button
                      type="button"
                      onClick={async () => {
                        const statusData = await api.getAppointmentStatus(activeTurns[0].id);
                        setAppointmentResponse({
                          appointment: statusData,
                          code: statusData.code,
                          expiresAt: statusData.expiresAt,
                          rawMessage: statusData.rawMessage,
                          whatsappUrl: statusData.whatsappUrl
                        });
                        setSubTab('book');
                        setBookingStep(4);
                      }}
                      className="px-3.5 py-2 rounded-md btn-whatsapp-luxury text-white font-display font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-white/20 stroke-[2]" />
                      <span>Confirmar WhatsApp</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleCancelTurn(activeTurns[0].id)}
                    className="px-3 py-2 rounded-md border border-white/[0.08] hover:border-red-500/40 text-[#8A898E] hover:text-red-400 text-xs font-mono transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Hero Principal con Fotografía de David (LCP Optimizado para Core Web Vitals) */}
          <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-[#141417] shadow-2xl">
            <img
              src={getAssetUrl('imagenes/IMG_0989.JPG.jpeg')}
              alt="David Barber en su sillón exclusivo de barbería en Capitán Bermúdez"
              width={1200}
              height={600}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              className="absolute inset-0 w-full h-full object-cover object-center opacity-30"
            />
            <div className="relative z-10 p-6 sm:p-10 md:p-12 bg-gradient-to-t from-[#0D0D0F] via-[#0D0D0F]/85 to-[#0D0D0F]/60 flex flex-col justify-end min-h-[300px] sm:min-h-[360px] space-y-6">
              <div className="space-y-2 max-w-xl">
                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] text-[#E5C378]">
                  Sillón en {studioConfig.barbershopName || 'V.I.P Barberías'}
                </span>
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-display font-bold text-[#EDEDED] leading-tight">
                  Cortes y fades con{' '}
                  <span className="font-editorial italic font-normal text-[#E5C378]">
                    David
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-[#A0A0A5] leading-relaxed max-w-lg">
                  Atención personalizada y exclusiva en sillón privado. Reserva instantánea en tres simples pasos sin seña previa.
                </p>
              </div>

              {/* Feature Badges / Quiet luxury pills */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[11px] font-mono text-[#8A898E]">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06]">
                  <Scissors className="w-3 h-3 text-[#E5C378]" />
                  1 a 1 en sillón privado
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06]">
                  <Sparkles className="w-3 h-3 text-[#E5C378]" />
                  Sin seña previa
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06]">
                  <Award className="w-3 h-3 text-[#E5C378]" />
                  Club de beneficios
                </span>
              </div>

              {/* Botones de Acción - CTA Principal Único y Focalizado (Punto 20) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <MagneticButton
                  onClick={() => {
                    analytics.trackBookingStart('hero_sacar_turno');
                    setSubTab('book');
                    setBookingStep(1);
                  }}
                  className="py-3.5 px-8 rounded-lg bg-[#E5C378] hover:bg-[#F3E5AB] text-[#0D0D0F] font-mono font-bold text-xs uppercase tracking-[0.16em] flex items-center justify-center gap-2 shadow-[0_0_25px_-5px_rgba(229,195,120,0.4)] transition-all"
                >
                  <span>Sacá tu turno</span>
                  <ArrowRight className="w-4 h-4 text-[#0D0D0F] stroke-[2.5]" />
                </MagneticButton>

                <button
                  type="button"
                  onClick={() => {
                    analytics.trackGalleryView();
                    setSubTab('portfolio');
                  }}
                  className="py-3.5 px-6 rounded-lg border border-white/[0.12] hover:border-[#E5C378]/50 bg-white/[0.03] hover:bg-white/[0.06] text-[#EDEDED] font-mono text-xs uppercase tracking-[0.12em] flex items-center justify-center gap-2 transition-all"
                >
                  <Camera className="w-4 h-4 text-[#E5C378]" />
                  <span>Ver Galería de Cortes</span>
                </button>
              </div>
            </div>
          </div>

          {/* Banner resumen para socio logueado o acceso para invitados */}
          {loggedClient ? (
            <div className="p-5 rounded-2xl bg-[#141416] card-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0B0B0C] border border-[#E5C378]/30 flex items-center justify-center text-[#E5C378] font-bold">
                  {(loggedClient.firstName || 'S').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-display font-bold text-[#EDEDED]">
                    Hola, {loggedClient.firstName || loggedClient.name}
                  </h3>
                  <p className="text-xs font-mono text-[#E5C378]">
                    {loggedClient.points || 0} PTS disponibles • {loggedClient.points >= 100 ? '★ ¡Corte bonificado listo!' : `${10 - ((loggedClient.points || 0) % 10)} visitas para tu corte bonificado`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSubTab('club')}
                className="px-4 py-2.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-xs font-mono text-[#EDEDED] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
              >
                <span>Ver Mi Pase &amp; Canjes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowSocioLogin(!showSocioLogin)}
                className="inline-flex items-center gap-2 text-xs font-mono text-[#8A898E] hover:text-[#E5C378] tracking-wider transition-colors py-2 px-4 rounded-lg hover:bg-white/[0.03]"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#E5C378]" />
                <span>{showSocioLogin ? 'Ocultar acceso' : '¿Ya sos socio del Club? Ingresá con tu DNI'}</span>
              </button>

              {showSocioLogin && (
                <div className="max-w-md mx-auto mt-4 p-6 rounded-2xl bg-[#141416] border border-[#E5C378]/30 shadow-2xl animate-enter text-left">
                  <DniStep
                    loggedClient={loggedClient}
                    guestMode={guestMode}
                    setGuestMode={setGuestMode}
                    onAuthSuccess={(client, apts) => {
                      onAuthSuccess(client, apts);
                      setShowSocioLogin(false);
                      setSubTab('club');
                    }}
                    onAdminAuthSuccess={onAdminAuthSuccess}
                    onLogoutClient={onLogoutClient}
                    onContinue={() => {
                      setShowSocioLogin(false);
                      setSubTab('club');
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Ubicación & Cómo llegar */}
          <div className="p-6 rounded-2xl bg-[#141416] card-hairline flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-[#0B0B0C] card-hairline flex items-center justify-center text-[#E5C378] shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <strong className="text-[#EDEDED] font-display font-bold text-sm tracking-tight">
                    {studioConfig.barbershopName || 'V.I.P BARBERÍAS'}
                  </strong>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider bg-[#E5C378]/15 text-[#E5C378] border border-[#E5C378]/30">
                    SILLÓN DE DAVID
                  </span>
                </div>
                <p className="text-[#8A898E] text-xs mt-0.5">
                  {studioConfig.address || 'Eva Perón 52'} • {studioConfig.city || 'Capitán Bermúdez'} • Lun a Sáb de 09 a 20 hs
                </p>
              </div>
            </div>

            <a
              href={studioConfig.googleMapsUrl || 'https://maps.app.goo.gl/JK9s2uNjGVHNvEuS8'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-[#EDEDED] font-mono font-bold text-xs uppercase tracking-[0.14em] flex items-center justify-center gap-2 border border-white/[0.1] transition-all"
            >
              <Navigation className="w-3.5 h-3.5 text-[#E5C378]" />
              <span>Cómo llegar</span>
            </a>
          </div>
        </div>
      )}

      {/* PANTALLA 2: TRABAJOS DE AUTOR / PORTFOLIO */}
      {subTab === 'portfolio' && (
        <div className="space-y-6 animate-enter">
          <AuthorPortfolio
            onSelectService={(svcId) => {
              const found = services.find((s) => s.id === svcId);
              if (found) setSelectedService(found);
              setSubTab('book');
              if (svcId === 'colorimetria' || found?.directConsult) {
                setBookingStep(1);
              } else {
                setBookingStep(2);
              }
            }}
            onStartBooking={() => {
              setSubTab('book');
              setBookingStep(1);
            }}
          />
        </div>
      )}

      {/* PANTALLA 3: MI PASE & CLUB DE SOCIOS */}
      {subTab === 'club' && (
        <div className="space-y-8 animate-enter">
          {loggedClient ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Main Column: Pase de Socio Black Card */}
              <div className="lg:col-span-7 space-y-6">
                <MembershipCard
                  client={loggedClient}
                  studioConfig={studioConfig}
                  guestMode={guestMode}
                  onRefreshClientSession={onRefreshClientSession}
                  onSelectService={(svcId) => {
                    const found = services.find((s) => s.id === svcId);
                    if (found) setSelectedService(found);
                    setSubTab('book');
                    if (svcId === 'colorimetria' || found?.directConsult) {
                      setBookingStep(1);
                    } else {
                      setBookingStep(2);
                    }
                  }}
                  onStartBooking={() => {
                    setSubTab('book');
                    setBookingStep(1);
                  }}
                  onRequestLogin={() => {
                    const el = document.getElementById('dni-input');
                    if (el) el.focus();
                  }}
                />
              </div>

              {/* Right Column: Turno Activo & Quick Booking CTA */}
              <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
                {/* Turno Activo Card */}
                {activeTurns.length > 0 && (
                  <div className="p-5 rounded-lg bg-[#141416] card-hairline text-[#EDEDED] space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-[#E5C378] tracking-wider uppercase block mb-0.5">Turno en curso</span>
                        <h2 className="text-base font-display font-bold text-[#EDEDED]">
                          Próxima visita al <span className="font-editorial italic font-normal text-[#E5C378]">estudio</span>
                        </h2>
                      </div>
                      <span className="badge-champagne font-mono font-bold uppercase tracking-wider text-[11px] tabular-nums">
                        #{activeTurns[0].code} • {activeTurns[0].status}
                      </span>
                    </div>

                    <div className="flex flex-col gap-3 text-xs text-[#8A898E]">
                      <div>
                        <strong className="text-sm text-[#EDEDED] block font-display">
                          {activeTurns[0].serviceName}
                          {activeTurns[0].selectedDrink ? ` • ${activeTurns[0].selectedDrink}` : ''}
                        </strong>
                        <span className="font-mono tabular-nums text-xs text-[#8A898E]">
                          {activeTurns[0].date} • {activeTurns[0].time} hs
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/[0.06]">
                        <AddToCalendarButton appointment={activeTurns[0]} studioConfig={studioConfig} />

                        {activeTurns[0].status === 'pendiente' && (
                          <button
                            type="button"
                            onClick={async () => {
                              const statusData = await api.getAppointmentStatus(activeTurns[0].id);
                              setAppointmentResponse({
                                appointment: statusData,
                                code: statusData.code,
                                expiresAt: statusData.expiresAt,
                                rawMessage: statusData.rawMessage,
                                whatsappUrl: statusData.whatsappUrl
                              });
                              setSubTab('book');
                              setBookingStep(4);
                            }}
                            className="px-3.5 py-2 rounded-md btn-whatsapp-luxury text-white font-display font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all"
                          >
                            <MessageCircle className="w-3.5 h-3.5 fill-white/20 stroke-[2]" />
                            <span>Confirmar WhatsApp</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleCancelTurn(activeTurns[0].id)}
                          className="px-3 py-2 rounded-md border border-white/[0.08] hover:border-red-500/40 text-[#8A898E] hover:text-red-400 text-xs font-mono transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Booking CTA */}
                <div className="p-6 rounded-lg bg-[#141416] card-hairline space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-display font-bold text-[#EDEDED]">
                      {loggedClient.points >= 100 ? '¡Tenés un corte bonificado listo!' : '¿Querés agendar tu próximo corte?'}
                    </h3>
                    <p className="text-xs text-[#8A898E]">
                      {loggedClient.points >= 100
                        ? 'Canjeá tus 100 puntos acumulados directamente en tu próxima visita.'
                        : 'Elegí fecha y horario disponible en segundos.'}
                    </p>
                  </div>

                  <MagneticButton
                    onClick={() => {
                      setSubTab('book');
                      setBookingStep(1);
                    }}
                    className="w-full py-3.5 rounded-md bg-[#E5C378] hover:bg-[#F3E5AB] text-[#0D0D0F] font-mono font-bold text-xs uppercase tracking-[0.16em] flex items-center justify-center gap-2 shadow-[0_0_20px_-4px_rgba(229,195,120,0.35)]"
                  >
                    <span>{loggedClient.points >= 100 ? 'Canjear corte bonificado' : 'Sacá tu turno'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#0D0D0F] stroke-[2.5]" />
                  </MagneticButton>
                </div>
              </div>
            </div>
          ) : (
            /* Pantalla de Invitación al Club para no identificados */
            <div className="max-w-xl mx-auto space-y-6">
              <div className="text-center space-y-2 pb-2">
                <span className="text-[10px] font-mono text-[#E5C378] uppercase tracking-[0.2em] block">
                  Club Privado · Beneficios Exclusivos
                </span>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#EDEDED]">
                  Pase de <span className="font-editorial italic font-normal text-[#E5C378]">socio</span>
                </h2>
                <p className="text-xs sm:text-sm text-[#8A898E] max-w-md mx-auto">
                  Acumulá 1 punto por cada corte en el sillón privado. Tu 10° corte es 100% bonificado con barra de cortesía incluida.
                </p>
              </div>

              <DniStep
                loggedClient={loggedClient}
                guestMode={guestMode}
                setGuestMode={setGuestMode}
                onAuthSuccess={(client, apts) => {
                  onAuthSuccess(client, apts);
                }}
                onAdminAuthSuccess={onAdminAuthSuccess}
                onLogoutClient={onLogoutClient}
                onContinue={() => {
                  setSubTab('book');
                  setBookingStep(1);
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: RESERVAR TURNO (Flujo Canónico: Valor Primero -> Identificación al Final) */}
      {subTab === 'book' && (
        <div className="max-w-4xl mx-auto space-y-6">
          {bookingError && (
            <div className="p-4 rounded-md bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-mono">
              {bookingError}
            </div>
          )}

          <div key={bookingStep} className="animate-stepper-morph">
            {/* Paso 1: Servicios & Bento Grid */}
            {bookingStep === 1 && (
              <ServiceStep
                services={services}
                drinks={drinks}
                selectedService={selectedService}
                setSelectedService={setSelectedService}
                selectedDrink={selectedDrink}
                setSelectedDrink={setSelectedDrink}
                onBack={() => setSubTab('club')}
                onContinue={() => setBookingStep(2)}
                whatsappPhone={studioConfig?.whatsappPhone || '5493413762115'}
              />
            )}

            {/* Paso 2: Fecha y Horario */}
            {bookingStep === 2 && (
              <DateTimeStep
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                selectedTime={selectedTime}
                setSelectedTime={setSelectedTime}
                selectedDrink={selectedDrink}
                onBack={() => setBookingStep(1)}
                onRequestTurn={() => {
                  if (loggedClient) {
                    handleRequestTurn();
                  } else {
                    setBookingStep(3);
                  }
                }}
                isSubmitting={isSubmitting}
                selectedService={selectedService}
                studioConfig={studioConfig}
              />
            )}

            {/* Paso 3: Identificación / Check-in sólo para Invitados antes de confirmar */}
            {bookingStep === 3 && !loggedClient && (
              <div className="max-w-md mx-auto space-y-4 animate-enter">
                <div className="text-center pb-2">
                  <span className="micro-technical text-[#E5C378] block mb-1">
                    Paso 3 de 3 · Identificación
                  </span>
                  <h3 className="text-xl font-display font-bold text-[#EDEDED]">
                    ¿A nombre de quién reservamos el sillón?
                  </h3>
                  <p className="text-xs text-[#8A898E] mt-1">
                    Ingresá tu DNI para confirmar el turno y sumar puntos en tu pase de socio.
                  </p>
                </div>

                <DniStep
                  loggedClient={loggedClient}
                  guestMode={guestMode}
                  setGuestMode={setGuestMode}
                  onAuthSuccess={async (client, apts) => {
                    onAuthSuccess(client, apts);
                    await handleRequestTurn(client);
                  }}
                  onAdminAuthSuccess={onAdminAuthSuccess}
                  onLogoutClient={onLogoutClient}
                  onContinue={() => {
                    if (loggedClient) handleRequestTurn();
                  }}
                />

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setBookingStep(2)}
                    className="text-xs font-mono text-[#8A898E] hover:text-[#EDEDED] uppercase tracking-wider"
                  >
                    ← Cambiar día u horario
                  </button>
                </div>
              </div>
            )}

            {/* Paso 4 (o Paso 3 si ya estaba logueado): Bloqueo temporal Hold y WhatsApp Handshake */}
            {(bookingStep === 4 || (bookingStep === 3 && loggedClient)) && appointmentResponse && (
              <div className="max-w-xl mx-auto">
                <HoldWaitingStep
                  appointmentData={appointmentResponse}
                  onResetToNewBooking={() => {
                    if (onRefreshClientSession) onRefreshClientSession();
                    setSubTab('turns');
                  }}
                  onConfirmed={() => {
                    if (onRefreshClientSession) onRefreshClientSession();
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 3: MIS TURNOS */}
      {subTab === 'turns' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <span className="micro-technical text-[#D4AF37] block mb-1">REGISTRO DE SOCIO</span>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#EDEDED] tracking-tight">
              Mis{' '}
              <span className="font-editorial italic font-normal text-[#D4AF37]">
                turnos
              </span>
            </h2>
            <p className="text-xs text-[#8A898E] mt-1">
              Seguimiento en vivo de tus reservas y registro histórico de cortes.
            </p>
          </div>

          {!loggedClient ? (
            <DniStep
              loggedClient={loggedClient}
              onAuthSuccess={onAuthSuccess}
              onAdminAuthSuccess={onAdminAuthSuccess}
              onLogoutClient={onLogoutClient}
            />
          ) : clientAppointments.length === 0 ? (
            <div className="p-8 rounded-lg bg-[#141416] card-hairline text-center space-y-4">
              <Calendar className="w-8 h-8 text-[#D4AF37] mx-auto" />
              <div>
                <h3 className="text-base font-display font-bold text-[#EDEDED]">
                  Todavía no tenés turnos registrados
                </h3>
                <p className="text-xs text-[#8A898E] mt-1 max-w-sm mx-auto">
                  Reservá tu próximo corte en tres toques y acumulá visitas en tu membresía privada.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSubTab('book');
                  setBookingStep(1);
                }}
                className="px-5 py-3 rounded-md bg-[#EDEDED] hover:bg-white text-[#0B0B0C] font-display font-bold text-xs uppercase tracking-[0.15em] inline-flex items-center gap-2 transition-all shadow-sm"
              >
                <span>Reservar Turno</span>
                <ArrowRight className="w-4 h-4 text-[#0B0B0C]" />
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {clientAppointments.map((apt) => {
                const isPending = apt.status === 'pendiente';
                const isConfirmed = apt.status === 'confirmado';
                const isDone = apt.status === 'finalizado';

                return (
                  <div
                    key={apt.id}
                    className="p-4 sm:p-5 rounded-lg bg-[#141416] card-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-xs text-[#D4AF37] tabular-nums">
                          #{apt.code}
                        </span>
                        <h3 className="font-display font-bold text-sm text-[#EDEDED]">
                          {apt.serviceName}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded-sm text-[10px] font-mono uppercase tracking-wider ${
                            isConfirmed
                              ? 'bg-white/[0.08] text-[#EDEDED] border border-white/[0.15]'
                              : isPending
                              ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30'
                              : isDone
                              ? 'bg-white/[0.04] text-[#8A898E]'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}
                        >
                          {apt.status}
                        </span>
                      </div>

                      <p className="text-xs font-mono text-[#8A898E] tabular-nums">
                        {apt.date} • {apt.time} hs • ${apt.price?.toLocaleString('es-AR')}
                        {apt.selectedDrink ? ` • Cortesía: ${apt.selectedDrink}` : ''}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {(isPending || isConfirmed) && (
                        <AddToCalendarButton appointment={apt} studioConfig={studioConfig} />
                      )}

                      {isPending && (
                        <button
                          type="button"
                          onClick={async () => {
                            const statusData = await api.getAppointmentStatus(apt.id);
                            setAppointmentResponse({
                              appointment: statusData,
                              code: statusData.code,
                              expiresAt: statusData.expiresAt,
                              rawMessage: statusData.rawMessage,
                              whatsappUrl: statusData.whatsappUrl
                            });
                            setSubTab('book');
                            setBookingStep(4);
                          }}
                          className="px-3 py-2 rounded-md bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-display font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all"
                        >
                          <MessageCircle className="w-3.5 h-3.5 fill-white/20" />
                          <span>WhatsApp</span>
                        </button>
                      )}

                      {(isPending || isConfirmed) && (
                        <button
                          type="button"
                          onClick={() => handleCancelTurn(apt.id)}
                          className="px-3 py-2 rounded-md border border-white/[0.08] hover:border-red-500/40 text-xs font-mono text-[#8A898E] hover:text-red-400 flex items-center gap-1.5 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancelar</span>
                        </button>
                      )}

                      {isDone && (
                        <span className="text-xs font-mono font-bold text-[#D4AF37] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          +1 PTO SUMADO
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
