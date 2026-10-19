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
import {
  Calendar,
  Clock,
  MessageCircle,
  XCircle,
  CheckCircle2,
  Wine,
  ArrowRight,
  MapPin,
  Navigation
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
  const [bookingStep, setBookingStep] = useState(1); // 1: Service, 2: DateTime, 3: HoldWaiting
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

  const handleRequestTurn = async () => {
    if (!loggedClient) return;
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
      setBookingStep(3);
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
      {/* SUBTAB 1: MI PASE & CLUB (BENTO GRID & PORTFOLIO DE AUTOR) */}
      {subTab === 'club' && (
        <div className="space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Column: Pase de Socio Black Card & Galería Lookbook de Autor */}
          <div className="lg:col-span-7 space-y-6">
            <MembershipCard
              client={loggedClient}
              studioConfig={studioConfig}
              guestMode={guestMode}
              onSelectService={(svcId) => {
                const found = services.find((s) => s.id === svcId);
                if (found) setSelectedService(found);
                setSubTab('book');
                setBookingStep(2);
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

          {/* Right Column / Sticky Sidebar: Turno Activo, Hero CTA con MagneticButton, Identificación y Ubicación */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            {/* 1. Turno Activo Card (si existe) */}
            {loggedClient && activeTurns.length > 0 && (
              <div className="p-5 rounded-lg bg-[#141416] card-hairline text-[#EDEDED] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="micro-technical text-[#D4AF37] block mb-0.5">TURNO EN CURSO</span>
                    <h2 className="text-base font-display font-bold text-[#EDEDED]">
                      Próxima visita al <span className="font-editorial italic font-normal text-[#D4AF37]">estudio</span>
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
                          setBookingStep(3);
                        }}
                        className="px-3.5 py-2 rounded-md bg-[#25D366] hover:bg-[#20ba5a] text-white font-display font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-white/20" />
                        <span>WhatsApp</span>
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

            {/* 2. Hero Card de Reserva Directa con MagneticButton */}
            <div className="relative rounded-lg overflow-hidden border border-white/[0.08] bg-[#141416]">
              <img
                src={getAssetUrl('imagenes/IMG_0989.JPG.jpeg')}
                alt="David en el estudio"
                className="absolute inset-0 w-full h-full object-cover object-center opacity-25"
              />
              <div className="relative z-10 p-6 bg-gradient-to-b from-[#0B0B0C]/80 via-[#0B0B0C]/90 to-[#0B0B0C] space-y-4">
                <div className="space-y-1.5">
                  <span className="micro-technical block text-[9px] text-[#8A898E]">
                    01 / 03 PASO INICIAL · RESERVA SIN SEÑA
                  </span>
                  <h2 className="text-xl font-display font-bold text-[#EDEDED] leading-snug">
                    Tu próximo corte te{' '}
                    <span className="font-editorial italic font-normal text-[#D4AF37]">
                      espera
                    </span>
                  </h2>
                  <p className="text-xs text-[#8A898E] leading-relaxed">
                    Experiencia de autor en sillón privado con David. Reserva instantánea sin seña previa.
                  </p>
                </div>

                <MagneticButton
                  onClick={() => {
                    setSubTab('book');
                    setBookingStep(1);
                  }}
                  className="w-full py-3.5 rounded-md bg-[#EDEDED] hover:bg-white text-[#0B0B0C] font-mono font-bold text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Sacá tu turno</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#0B0B0C] stroke-[2]" />
                </MagneticButton>
              </div>
            </div>

            {/* 3. DniStep (Identificación / Cuenta de Socio con toggle Ya soy socio / Primera vez) */}
            <DniStep
              loggedClient={loggedClient}
              guestMode={guestMode}
              setGuestMode={setGuestMode}
              onAuthSuccess={(client, apts) => onAuthSuccess(client, apts)}
              onAdminAuthSuccess={onAdminAuthSuccess}
              onLogoutClient={onLogoutClient}
              onContinue={() => {
                setSubTab('book');
                setBookingStep(1);
              }}
            />

            {/* 4. Location & Cómo llegar */}
            <div className="p-5 rounded-lg bg-[#141416] card-hairline space-y-3.5 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-[#0B0B0C] card-hairline flex items-center justify-center text-[#D4AF37] shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <strong className="text-[#EDEDED] font-display font-bold text-sm tracking-tight">
                      {studioConfig.barbershopName || 'V.I.P BARBERÍAS'}
                    </strong>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                      SILLÓN DE DAVID
                    </span>
                  </div>
                  <span className="text-[#8A898E] text-xs">
                    {studioConfig.address || 'Eva Perón 52'} • {studioConfig.city || 'Capitán Bermúdez'}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
                <span className="micro-technical text-[#D4AF37]">
                  LUN A SÁB • 09 A 20 HS
                </span>
                <a
                  href={studioConfig.googleMapsUrl || 'https://www.google.com/maps/place/V.I.P+BARBER%C3%8DAS/@-32.8300541,-60.7128648,18.5z'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-md bg-[#EDEDED] hover:bg-white text-[#0B0B0C] font-display font-bold text-xs uppercase tracking-[0.15em] flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#0B0B0C]" />
                  <span>Cómo llegar</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Galería / Lookbook de Autor de Ancho Completo */}
        <AuthorPortfolio
          onSelectService={(svcId) => {
            const found = services.find((s) => s.id === svcId);
            if (found) setSelectedService(found);
            setSubTab('book');
            setBookingStep(2);
          }}
          onStartBooking={() => {
            setSubTab('book');
            setBookingStep(1);
          }}
        />
      </div>
      )}

      {/* SUBTAB 2: RESERVAR TURNO */}
      {subTab === 'book' && (
        <div className="max-w-4xl mx-auto space-y-6">
          {bookingError && (
            <div className="p-4 rounded-md bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-mono">
              {bookingError}
            </div>
          )}

          {/* Require Client Auth (DNI + PIN) before booking */}
          {!loggedClient ? (
            <div className="max-w-md mx-auto">
              <DniStep
                loggedClient={loggedClient}
                guestMode={guestMode}
                setGuestMode={setGuestMode}
                onAuthSuccess={(client, apts) => {
                  onAuthSuccess(client, apts);
                  setBookingStep(1);
                }}
                onAdminAuthSuccess={onAdminAuthSuccess}
                onLogoutClient={onLogoutClient}
                onContinue={() => setBookingStep(1)}
              />
            </div>
          ) : (
            <div key={bookingStep} className="animate-stepper-morph">
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
                />
              )}

              {bookingStep === 2 && (
                <DateTimeStep
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  selectedTime={selectedTime}
                  setSelectedTime={setSelectedTime}
                  selectedDrink={selectedDrink}
                  onBack={() => setBookingStep(1)}
                  onRequestTurn={handleRequestTurn}
                  isSubmitting={isSubmitting}
                  selectedService={selectedService}
                  studioConfig={studioConfig}
                />
              )}

              {bookingStep === 3 && appointmentResponse && (
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
          )}
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
                            setBookingStep(3);
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
