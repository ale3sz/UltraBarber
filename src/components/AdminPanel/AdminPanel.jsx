import React, { useState, useEffect, useCallback } from 'react';
import AdminLogin from './AdminLogin';
import PendingAppointments from './PendingAppointments';
import DailyAgenda from './DailyAgenda';
import BirthdaySection from './BirthdaySection';
import ClientsDirectory from './ClientsDirectory';
import PaymentModal from './PaymentModal';
import SettingsModal from './SettingsModal';
import { api } from '../../services/api';
import { formatLocalDate } from '../../utils/date';
import confetti from 'canvas-confetti';
import {
  Clock,
  Calendar,
  Cake,
  Users,
  Settings,
  RefreshCw,
  Wallet
} from 'lucide-react';

export default function AdminPanel({
  adminUser,
  onAdminLoginSuccess,
  onAdminLogout,
  onPendingCountChange
}) {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'agenda' | 'finance' | 'birthdays' | 'clients'
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [payments, setPayments] = useState([]);
  const [birthdaysData, setBirthdaysData] = useState({ thisWeek: [], thisMonth: [] });
  const [config, setConfig] = useState({});

  const [selectedDate, setSelectedDate] = useState(() => formatLocalDate(new Date()));
  const [payingAppointment, setPayingAppointment] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const loadDashboard = useCallback(async () => {
    if (!adminUser) return;
    try {
      const data = await api.getAdminDashboard();
      setAppointments(data.appointments || []);
      setClients(data.clients || []);
      setServices(data.services || []);
      setBlockedSlots(data.blockedSlots || []);
      setPayments(data.payments || []);
      setBirthdaysData(data.birthdays || { thisWeek: [], thisMonth: [] });
      setConfig(data.config || {});

      const pendingCount = (data.appointments || []).filter((a) => a.status === 'pendiente').length;
      if (onPendingCountChange) onPendingCountChange(pendingCount);
    } catch (err) {
      if (err.status === 401 && onAdminLogout) {
        onAdminLogout();
      }
    }
  }, [adminUser, onPendingCountChange, onAdminLogout]);

  useEffect(() => {
    if (!adminUser) return;
    loadDashboard();
    const interval = setInterval(loadDashboard, 4000);
    return () => clearInterval(interval);
  }, [adminUser, loadDashboard]);

  // Gate: If not logged in as David, show protected login screen
  if (!adminUser) {
    return <AdminLogin onLoginSuccess={onAdminLoginSuccess} />;
  }

  const pendingAppointments = appointments.filter((a) => a.status === 'pendiente');

  const handleConfirmAppointment = async (id) => {
    try {
      await api.confirmAppointment(id);
      confetti({
        particleCount: 50,
        spread: 60,
        colors: ['#D4AF37', '#F3E5AB', '#FFFFFF']
      });
      await loadDashboard();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('¿Querés cancelar o rechazar este turno?')) return;
    try {
      await api.cancelAppointment(id);
      await loadDashboard();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleNoShow = async (id) => {
    if (!window.confirm('¿Marcar como No Asistió? (El turno se cancela sin sumar puntos)')) return;
    try {
      await api.noShowAppointment(id);
      await loadDashboard();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleConfirmPayment = async (paymentData) => {
    if (!payingAppointment) return;
    await api.completeAppointment(payingAppointment.id, paymentData);
    confetti({
      particleCount: 70,
      spread: 80,
      colors: ['#D4AF37', '#F3E5AB', '#FFFFFF', '#0A0A0A']
    });
    await loadDashboard();
  };

  const handleCreateManualTurn = async (payload) => {
    try {
      await api.createManualAppointment(payload);
      await loadDashboard();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddBlockedSlot = async (payload) => {
    try {
      await api.addBlockedSlot(payload);
      await loadDashboard();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRemoveBlockedSlot = async (id) => {
    try {
      await api.removeBlockedSlot(id);
      await loadDashboard();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateClient = async (dni, payload) => {
    try {
      await api.updateClientByAdmin(dni, payload);
      await loadDashboard();
    } catch (err) {
      alert(err.message);
    }
  };

  const clientForPayment = payingAppointment
    ? clients.find((c) => c.dni.replace(/\D/g, '') === payingAppointment.dni.replace(/\D/g, ''))
    : null;

  // Calculate Finance Summary
  const totalRevenue = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const cashRevenue = payments
    .filter((p) => p.payment_method === 'Efectivo')
    .reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const transferRevenue = payments
    .filter((p) => p.payment_method === 'Transferencia')
    .reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const redemptionsCount = payments.filter((p) => p.payment_method === 'Canje de Puntos').length;

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      {/* Studio Command Header */}
      <div className="p-6 rounded-3xl bg-barber-darkSurface border border-barber-darkBorder club-shadow text-barber-darkText flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-barber-darkText">
            Consola de{' '}
            <span className="font-editorial italic font-normal text-barber-chai">
              {adminUser.displayName || 'David'}
            </span>
          </h1>
          <p className="text-xs text-barber-pistache mt-1 font-mono tabular-nums">
            Base de datos SQLite activa • {pendingAppointments.length} pendientes WA • {clients.length} socios registrados
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadDashboard}
            className="p-3 rounded-2xl bg-barber-darkBg border border-barber-darkBorder text-barber-pistache hover:text-barber-darkText transition-colors"
            title="Actualizar consola"
            aria-label="Actualizar datos"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="px-4 py-3 rounded-2xl bg-barber-darkBg border border-barber-darkBorder text-barber-darkText hover:border-barber-chai text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Settings className="w-4 h-4 text-barber-chai" />
            <span>Precios &amp; Config</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-barber-lightSurface dark:bg-barber-darkSurface border border-barber-lightBorder dark:border-barber-darkBorder overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'pending'
              ? 'bg-barber-matcha text-white'
              : 'text-barber-lightMuted dark:text-barber-darkMuted hover:text-barber-lightText dark:hover:text-barber-darkText'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Handshake WA</span>
          {pendingAppointments.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-barber-chai text-barber-lightText text-[10px] font-mono font-extrabold tabular-nums">
              {pendingAppointments.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('agenda')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'agenda'
              ? 'bg-barber-matcha text-white'
              : 'text-barber-lightMuted dark:text-barber-darkMuted hover:text-barber-lightText dark:hover:text-barber-darkText'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Agenda &amp; Bloqueos</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('finance')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'finance'
              ? 'bg-barber-matcha text-white'
              : 'text-barber-lightMuted dark:text-barber-darkMuted hover:text-barber-lightText dark:hover:text-barber-darkText'
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>Caja &amp; Cobros</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('birthdays')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'birthdays'
              ? 'bg-barber-matcha text-white'
              : 'text-barber-lightMuted dark:text-barber-darkMuted hover:text-barber-lightText dark:hover:text-barber-darkText'
          }`}
        >
          <Cake className="w-3.5 h-3.5" />
          <span>Cumpleaños ({birthdaysData.thisWeek.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('clients')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'clients'
              ? 'bg-barber-matcha text-white'
              : 'text-barber-lightMuted dark:text-barber-darkMuted hover:text-barber-lightText dark:hover:text-barber-darkText'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Socios &amp; PINs ({clients.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'pending' && (
        <PendingAppointments
          pendingList={pendingAppointments}
          onConfirm={handleConfirmAppointment}
          onCancel={handleCancelAppointment}
        />
      )}

      {activeTab === 'agenda' && (
        <DailyAgenda
          appointments={appointments}
          services={services}
          blockedSlots={blockedSlots}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          onOpenPaymentModal={setPayingAppointment}
          onNoShow={handleNoShow}
          onConfirm={handleConfirmAppointment}
          onCreateManualTurn={handleCreateManualTurn}
          onAddBlockedSlot={handleAddBlockedSlot}
          onRemoveBlockedSlot={handleRemoveBlockedSlot}
        />
      )}

      {activeTab === 'finance' && (
        <div className="space-y-5">
          {/* Revenue Summary Bar */}
          <div className="p-6 rounded-3xl bg-barber-darkSurface border border-barber-darkBorder text-barber-darkText flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-display font-bold text-barber-darkText">
                Recaudación acumulada en caja
              </h2>
              <p className="text-3xl sm:text-4xl font-display font-bold text-barber-chai mt-1 tabular-nums">
                ${totalRevenue.toLocaleString('es-AR')}
              </p>
            </div>

            <dl className="flex flex-wrap gap-6 text-xs font-mono tabular-nums">
              <div>
                <dt className="text-barber-pistache">EFECTIVO</dt>
                <dd className="text-base font-bold text-barber-darkText mt-0.5">
                  ${cashRevenue.toLocaleString('es-AR')}
                </dd>
              </div>
              <div>
                <dt className="text-barber-pistache">TRANSFERENCIA</dt>
                <dd className="text-base font-bold text-barber-darkText mt-0.5">
                  ${transferRevenue.toLocaleString('es-AR')}
                </dd>
              </div>
              <div>
                <dt className="text-barber-pistache">CANJES DE PUNTOS</dt>
                <dd className="text-base font-bold text-barber-matcha mt-0.5">
                  {redemptionsCount} canjes
                </dd>
              </div>
            </dl>
          </div>

          {/* Payments History Table */}
          <div className="rounded-3xl bg-barber-lightSurface dark:bg-barber-darkSurface border border-barber-lightBorder dark:border-barber-darkBorder overflow-hidden">
            <div className="p-5 border-b border-barber-lightBorder dark:border-barber-darkBorder">
              <h3 className="text-base font-display font-bold text-barber-lightText dark:text-barber-darkText">
                Movimientos de caja registrados
              </h3>
            </div>

            {payments.length === 0 ? (
              <p className="p-6 text-xs text-barber-lightMuted dark:text-barber-darkMuted text-center">
                Todavía no se registraron cobros en esta sesión. Cobrá un turno confirmado desde la pestaña Agenda.
              </p>
            ) : (
              <div className="divide-y divide-barber-lightBorder dark:divide-barber-darkBorder text-xs">
                {payments.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 flex items-center justify-between gap-4"
                  >
                    <div>
                      <strong className="font-display font-bold text-sm text-barber-lightText dark:text-barber-darkText block">
                        {p.client_name} • {p.service_name}
                      </strong>
                      <span className="font-mono text-barber-lightMuted dark:text-barber-darkMuted tabular-nums">
                        Turno #{p.code} • DNI {p.client_dni} • {p.payment_method}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-base text-barber-matcha tabular-nums">
                      ${Number(p.amount || 0).toLocaleString('es-AR')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'birthdays' && (
        <BirthdaySection birthdaysData={birthdaysData} />
      )}

      {activeTab === 'clients' && (
        <ClientsDirectory
          clients={clients}
          onUpdateClient={handleUpdateClient}
        />
      )}

      {payingAppointment && (
        <PaymentModal
          appointment={payingAppointment}
          client={clientForPayment}
          onClose={() => setPayingAppointment(null)}
          onConfirmPayment={handleConfirmPayment}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal
          config={config}
          services={services}
          onClose={() => setIsSettingsOpen(false)}
          onSaved={() => loadDashboard()}
        />
      )}
    </div>
  );
}
