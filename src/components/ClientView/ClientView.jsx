import React, { useState, useEffect } from 'react';
import MembershipCard from './MembershipCard';
import DniStep from './DniStep';
import ServiceStep from './ServiceStep';
import DateTimeStep from './DateTimeStep';
import HoldWaitingStep from './HoldWaitingStep';
import { api } from '../../services/api';
import {
  Calendar,
  Clock,
  MessageCircle,
  XCircle,
  CheckCircle2,
  Wine,
  ArrowRight,
  MapPin
} from 'lucide-react';

export default function ClientView({
  subTab,
  setSubTab,
  loggedClient,
  clientAppointments = [],
  onAuthSuccess,
  onLogoutClient,
  onRefreshClientSession,
  studioConfig = {}
}) {
  const [bookingStep, setBookingStep] = useState(1); // 1: Service, 2: DateTime, 3: HoldWaiting
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
          Cargando David Barber Studio...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-28 md:pb-16 space-y-8">
      {/* SUBTAB 1: MI PASE & CLUB */}
      {subTab === 'club' && (
        <div className="space-y-6">
          <MembershipCard
            client={loggedClient}
            studioConfig={studioConfig}
            onStartBooking={() => {
              setSubTab('book');
              setBookingStep(1);
            }}
            onRequestLogin={() => {
              const el = document.getElementById('dni-input');
              if (el) el.focus();
            }}
          />

          {/* Active Turn Alert Card on Home if Client has Pending/Confirmed Turn */}
          {loggedClient && activeTurns.length > 0 && (
            <div className="p-5 sm:p-6 rounded-3xl bg-barber-darkSurface border border-barber-chai club-shadow text-barber-darkText space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-display font-bold text-barber-darkText">
                  Tu próximo turno activo
                </h2>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-barber-matcha text-white tabular-nums">
                  #{activeTurns[0].code} • {activeTurns[0].status}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-barber-pistache">
                <div>
                  <strong className="text-sm text-barber-darkText block">
                    {activeTurns[0].serviceName}
                    {activeTurns[0].selectedDrink ? ` (${activeTurns[0].selectedDrink})` : ''}
                  </strong>
                  <span className="font-mono tabular-nums">
                    Fecha: {activeTurns[0].date} a las {activeTurns[0].time} hs
                  </span>
                </div>

                <div className="flex items-center gap-2">
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
                      className="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-white/20" />
                      <span>Confirmar por WhatsApp</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleCancelTurn(activeTurns[0].id)}
                    className="px-3 py-2.5 rounded-xl border border-barber-darkBorder text-barber-pistache hover:text-red-400 text-xs font-semibold"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Client Auth / Account Card */}
          <DniStep
            loggedClient={loggedClient}
            onAuthSuccess={(client, apts) => onAuthSuccess(client, apts)}
            onLogoutClient={onLogoutClient}
            onContinue={() => {
              setSubTab('book');
              setBookingStep(1);
            }}
          />

          {/* Studio Location & Info Strip */}
          <div className="p-5 rounded-3xl bg-barber-lightSurface dark:bg-barber-darkSurface border border-barber-lightBorder dark:border-barber-darkBorder flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-barber-chai shrink-0" />
              <div>
                <strong className="text-barber-lightText dark:text-barber-darkText block font-semibold">
                  {studioConfig.businessName || 'DAVID BARBER STUDIO'}
                </strong>
                <span className="text-barber-lightMuted dark:text-barber-darkMuted">
                  {studioConfig.address || 'Av. Santa Fe 3240 • Studio Privado'}
                </span>
              </div>
            </div>
            <span className="font-mono text-barber-chai font-semibold">
              Lun a Sáb • 09:00 a 20:00 hs
            </span>
          </div>
        </div>
      )}

      {/* SUBTAB 2: RESERVAR TURNO */}
      {subTab === 'book' && (
        <div className="space-y-6">
          {bookingError && (
            <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-xs text-red-600 dark:text-red-300 font-semibold">
              {bookingError}
            </div>
          )}

          {/* Require Client Auth (DNI + PIN) before booking */}
          {!loggedClient ? (
            <DniStep
              loggedClient={loggedClient}
              onAuthSuccess={(client, apts) => {
                onAuthSuccess(client, apts);
                setBookingStep(1);
              }}
              onLogoutClient={onLogoutClient}
              onContinue={() => setBookingStep(1)}
            />
          ) : (
            <>
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
              )}
            </>
          )}
        </div>
      )}

      {/* SUBTAB 3: MIS TURNOS */}
      {subTab === 'turns' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-display font-bold text-barber-lightText dark:text-barber-darkText">
              Mis{' '}
              <span className="font-editorial italic font-normal text-barber-chai">
                turnos
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-barber-lightMuted dark:text-barber-darkMuted mt-1">
              Seguimiento en vivo de tus reservas y registro histórico de cortes.
            </p>
          </div>

          {!loggedClient ? (
            <DniStep
              loggedClient={loggedClient}
              onAuthSuccess={onAuthSuccess}
              onLogoutClient={onLogoutClient}
            />
          ) : clientAppointments.length === 0 ? (
            <div className="p-8 rounded-3xl bg-barber-lightSurface dark:bg-barber-darkSurface border border-barber-lightBorder dark:border-barber-darkBorder text-center space-y-4">
              <Calendar className="w-8 h-8 text-barber-chai mx-auto" />
              <div>
                <h3 className="text-lg font-display font-bold text-barber-lightText dark:text-barber-darkText">
                  Todavía no tenés turnos registrados
                </h3>
                <p className="text-xs text-barber-lightMuted dark:text-barber-darkMuted mt-1">
                  Reservá tu próximo corte en tres toques y sumá puntos en tu pase de socio.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSubTab('book');
                  setBookingStep(1);
                }}
                className="px-6 py-3.5 rounded-2xl bg-white text-[#0A0A0A] font-display font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 hover:bg-neutral-200 transition-all shadow-md"
              >
                <span>Reservar Turno</span>
                <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {clientAppointments.map((apt) => {
                const isPending = apt.status === 'pendiente';
                const isConfirmed = apt.status === 'confirmado';
                const isDone = apt.status === 'finalizado';

                return (
                  <div
                    key={apt.id}
                    className="p-5 rounded-3xl bg-barber-lightSurface dark:bg-barber-darkSurface border border-barber-lightBorder dark:border-barber-darkBorder flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-sm text-[#D4AF37] tabular-nums">
                          #{apt.code}
                        </span>
                        <h3 className="font-display font-bold text-base text-barber-lightText dark:text-barber-darkText">
                          {apt.serviceName}
                        </h3>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                            isConfirmed
                              ? 'bg-neutral-800 text-white border border-[#D4AF37]/60'
                              : isPending
                              ? 'bg-neutral-800 text-[#D4AF37] border border-[#D4AF37]/60'
                              : isDone
                              ? 'bg-barber-darkBorder text-barber-pistache'
                              : 'bg-red-500/15 text-red-500'
                          }`}
                        >
                          {apt.status}
                        </span>
                      </div>

                      <p className="text-xs font-mono text-barber-lightMuted dark:text-barber-darkMuted tabular-nums">
                        {apt.date} a las {apt.time} hs • ${apt.price?.toLocaleString('es-AR')}
                        {apt.selectedDrink ? ` • Bebida: ${apt.selectedDrink}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
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
                          className="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                        >
                          <MessageCircle className="w-3.5 h-3.5 fill-white/20" />
                          <span>Enviar WhatsApp</span>
                        </button>
                      )}

                      {(isPending || isConfirmed) && (
                        <button
                          type="button"
                          onClick={() => handleCancelTurn(apt.id)}
                          className="px-3.5 py-2.5 rounded-xl border border-barber-lightBorder dark:border-barber-darkBorder text-xs font-semibold text-barber-lightMuted dark:text-barber-darkMuted hover:text-red-500 flex items-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancelar</span>
                        </button>
                      )}

                      {isDone && (
                        <span className="text-xs font-mono font-bold text-barber-matcha flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
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
