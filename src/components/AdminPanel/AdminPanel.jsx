import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AdminLogin from './AdminLogin';
import PendingAppointments from './PendingAppointments';
import DailyAgenda from './DailyAgenda';
import BirthdaySection from './BirthdaySection';
import ClientsDirectory from './ClientsDirectory';
import PaymentModal from './PaymentModal';
import SettingsModal from './SettingsModal';
import EditableMessageModal from './EditableMessageModal';
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
  Wallet,
  TrendingUp,
  Award,
  Search,
  Filter,
  MessageCircle,
  LogOut,
  ShieldCheck,
  Crown,
  ChevronRight,
  ArrowUpRight,
  DollarSign
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

  // Finance Tab local state
  const [financeSearch, setFinanceSearch] = useState('');
  const [financeMethodFilter, setFinanceMethodFilter] = useState('all');

  // Message modal state for VIP recognition
  const [messageModal, setMessageModal] = useState({
    isOpen: false,
    recipientName: '',
    recipientPhone: '',
    initialMessage: '',
    title: '',
    badge: '',
    suggestedTemplates: []
  });

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
  const todayStr = formatLocalDate(new Date());
  const todayAppointments = appointments.filter((a) => a.date === todayStr);

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

  // Executive Financial & BI Calculations
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const weekStart = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const totalRevenue = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const todayRevenue = payments
    .filter((p) => (p.created_at || 0) >= todayStart)
    .reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const weekRevenue = payments
    .filter((p) => (p.created_at || 0) >= weekStart)
    .reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const monthRevenue = payments
    .filter((p) => (p.created_at || 0) >= monthStart)
    .reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

  const cashRevenue = payments
    .filter((p) => p.payment_method === 'Efectivo')
    .reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const transferRevenue = payments
    .filter((p) => p.payment_method === 'Transferencia')
    .reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const redemptionsCount = payments.filter((p) => p.payment_method === 'Canje de Puntos').length;

  const paidTransactionsCount = payments.filter((p) => Number(p.amount) > 0).length;
  const averageTicket = paidTransactionsCount > 0 ? Math.round(totalRevenue / paidTransactionsCount) : 0;

  // Leaderboard: Top 10 VIP Clients
  const topVipClients = useMemo(() => {
    return [...clients]
      .sort((a, b) => ((b.totalCuts || 0) * 100 + (b.points || 0)) - ((a.totalCuts || 0) * 100 + (a.points || 0)))
      .slice(0, 10);
  }, [clients]);

  // Filtered Payments History
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (financeMethodFilter !== 'all' && p.payment_method !== financeMethodFilter) return false;
      if (!financeSearch.trim()) return true;
      const q = financeSearch.toLowerCase().trim();
      const clientStr = `${p.client_name || ''} ${p.client_dni || ''} ${p.code || ''} ${p.service_name || ''}`.toLowerCase();
      return clientStr.includes(q);
    });
  }, [payments, financeMethodFilter, financeSearch]);

  const handleOpenVipRewardModal = (c) => {
    const fullName = `${c.firstName || c.name || 'Socio'} ${c.lastName || ''}`.trim();
    const templates = [
      {
        label: 'Agradecimiento VIP + Trago',
        text: `Hola ${c.firstName || c.name || 'Socio'}! Queremos agradecerte por ser uno de los socios más fieles de ULTRA BARBER Studio (${c.totalCuts || 0} cortes realizados). En tu próxima visita tenés un beneficio especial de cortesía en el sillón!`
      },
      {
        label: 'Doble Puntaje',
        text: `Hola ${c.firstName || c.name || 'Socio'}! Por tu fidelidad en ULTRA BARBER Studio, tu próximo turno sumará DOBLE PUNTO en tu Pase de Socio para acelerar tu corte bonificado. ¿Querés agendar para esta semana?`
      }
    ];

    setMessageModal({
      isOpen: true,
      recipientName: fullName,
      recipientPhone: c.phone || '',
      title: 'Reconocimiento a Socio VIP',
      badge: 'TOP LEADERBOARD VIP',
      initialMessage: templates[0].text,
      suggestedTemplates: templates
    });
  };

  return (
    <div className="space-y-5 pb-20 w-full max-w-7xl mx-auto px-3 sm:px-6 animate-enter">
      {/* Studio Command Header (Full Space Utilization) */}
      <div className="p-4 sm:p-6 rounded-2xl bg-[#141416] border border-white/[0.08] shadow-md text-[#EDEDED] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="micro-technical text-[9px] text-[#D4AF37]">
              SILLÓN ACTIVO • ULTRA BARBER STUDIO
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-[#EDEDED]">
            Consola Operativa de{' '}
            <span className="font-editorial italic font-normal text-[#D4AF37]">
              {adminUser.displayName || 'David'}
            </span>
          </h1>
          <p className="text-xs text-[#8A898E] font-mono tabular-nums">
            SQLite activo • {pendingAppointments.length} solicitudes WA • {clients.length} socios registrados
          </p>
        </div>

        {/* Live KPI Pills & Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#101012] border border-white/[0.06] text-xs font-mono">
            <span className="text-[#8A898E]">Caja Hoy:</span>
            <strong className="text-emerald-400 font-bold tabular-nums">
              ${todayRevenue.toLocaleString('es-AR')}
            </strong>
          </div>

          <button
            type="button"
            onClick={loadDashboard}
            className="p-2.5 rounded-xl bg-[#101012] border border-white/[0.1] text-[#8A898E] hover:text-[#EDEDED] hover:border-white/[0.2] transition-colors"
            title="Actualizar datos"
            aria-label="Actualizar datos"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-[#101012] border border-white/[0.1] text-[#EDEDED] hover:border-[#D4AF37] text-xs font-mono font-semibold flex items-center gap-2 transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Precios &amp; Config</span>
          </button>

          {onAdminLogout && (
            <button
              type="button"
              onClick={onAdminLogout}
              className="p-2.5 rounded-xl bg-[#101012] border border-white/[0.1] text-[#8A898E] hover:text-rose-400 hover:border-rose-500/30 transition-colors"
              title="Cerrar sesión segura"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#141416] border border-white/[0.08] overflow-x-auto text-xs font-mono">
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
            activeTab === 'pending'
              ? 'bg-white/[0.1] border border-[#D4AF37] text-[#EDEDED] font-bold shadow-sm'
              : 'text-[#8A898E] hover:text-[#EDEDED]'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Handshake WA</span>
          {pendingAppointments.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-md bg-[#D4AF37] text-black text-[10px] font-bold tabular-nums">
              {pendingAppointments.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('agenda')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
            activeTab === 'agenda'
              ? 'bg-white/[0.1] border border-[#D4AF37] text-[#EDEDED] font-bold shadow-sm'
              : 'text-[#8A898E] hover:text-[#EDEDED]'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Agenda &amp; Sillón</span>
          <span className="text-[10px] text-[#8A898E] tabular-nums">
            ({todayAppointments.length} hoy)
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('clients')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
            activeTab === 'clients'
              ? 'bg-white/[0.1] border border-[#D4AF37] text-[#EDEDED] font-bold shadow-sm'
              : 'text-[#8A898E] hover:text-[#EDEDED]'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Radar &amp; Socios VIP ({clients.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('finance')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
            activeTab === 'finance'
              ? 'bg-white/[0.1] border border-[#D4AF37] text-[#EDEDED] font-bold shadow-sm'
              : 'text-[#8A898E] hover:text-[#EDEDED]'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Métricas BI &amp; Caja</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('birthdays')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
            activeTab === 'birthdays'
              ? 'bg-white/[0.1] border border-[#D4AF37] text-[#EDEDED] font-bold shadow-sm'
              : 'text-[#8A898E] hover:text-[#EDEDED]'
          }`}
        >
          <Cake className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Cumpleaños ({birthdaysData.thisWeek.length})</span>
        </button>
      </div>

      {/* Tab 1: Handshake WhatsApp */}
      {activeTab === 'pending' && (
        <PendingAppointments
          pendingList={pendingAppointments}
          onConfirm={handleConfirmAppointment}
          onCancel={handleCancelAppointment}
        />
      )}

      {/* Tab 2: Daily Agenda */}
      {activeTab === 'agenda' && (
        <DailyAgenda
          appointments={appointments}
          clients={clients}
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

      {/* Tab 3: Radar de Reactivación & Socios VIP */}
      {activeTab === 'clients' && (
        <ClientsDirectory
          clients={clients}
          onUpdateClient={handleUpdateClient}
        />
      )}

      {/* Tab 4: Métricas BI, Rentabilidad & Caja */}
      {activeTab === 'finance' && (
        <div className="space-y-4">
          {/* Section 1: Executive KPI Bento Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-[#141416] border border-white/[0.08] shadow-sm space-y-1">
              <span className="micro-technical block text-[9px] text-[#8A898E]">
                FACTURACIÓN HOY
              </span>
              <p className="text-2xl sm:text-3xl font-display font-bold text-emerald-400 tabular-nums">
                ${todayRevenue.toLocaleString('es-AR')}
              </p>
              <span className="text-[10px] font-mono text-[#8A898E] block">
                {payments.filter((p) => (p.created_at || 0) >= todayStart).length} turnos cobrados
              </span>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-[#141416] border border-white/[0.08] shadow-sm space-y-1">
              <span className="micro-technical block text-[9px] text-[#8A898E]">
                ESTA SEMANA (ÚLT. 7 DÍAS)
              </span>
              <p className="text-2xl sm:text-3xl font-display font-bold text-[#EDEDED] tabular-nums">
                ${weekRevenue.toLocaleString('es-AR')}
              </p>
              <span className="text-[10px] font-mono text-[#8A898E] block">
                {payments.filter((p) => (p.created_at || 0) >= weekStart).length} operaciones
              </span>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-[#141416] border border-white/[0.08] shadow-sm space-y-1">
              <span className="micro-technical block text-[9px] text-[#D4AF37]">
                MES ACTUAL
              </span>
              <p className="text-2xl sm:text-3xl font-display font-bold text-[#D4AF37] tabular-nums">
                ${monthRevenue.toLocaleString('es-AR')}
              </p>
              <span className="text-[10px] font-mono text-[#8A898E] block">
                {payments.filter((p) => (p.created_at || 0) >= monthStart).length} operaciones en el mes
              </span>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-[#141416] border border-white/[0.08] shadow-sm space-y-1">
              <span className="micro-technical block text-[9px] text-[#8A898E]">
                TICKET PROMEDIO
              </span>
              <p className="text-2xl sm:text-3xl font-display font-bold text-[#EDEDED] tabular-nums">
                ${averageTicket.toLocaleString('es-AR')}
              </p>
              <span className="text-[10px] font-mono text-[#8A898E] block">
                Total acumulado: ${totalRevenue.toLocaleString('es-AR')}
              </span>
            </div>
          </div>

          {/* Section 2: Métodos de Pago & Breakdown */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#141416] border border-white/[0.08] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="micro-technical text-[9px] text-[#D4AF37] flex items-center gap-1.5">
                <Wallet className="w-3 h-3" />
                <span>DESGLOSE POR MEDIO DE COBRO</span>
              </span>
              <span className="text-xs font-mono text-[#8A898E]">
                Total: ${totalRevenue.toLocaleString('es-AR')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#101012] border border-white/[0.06] space-y-1">
                <div className="flex items-center justify-between text-[#8A898E]">
                  <span>EFECTIVO</span>
                  <span className="text-[#EDEDED] font-bold">
                    {totalRevenue > 0 ? Math.round((cashRevenue / totalRevenue) * 100) : 0}%
                  </span>
                </div>
                <strong className="text-base font-bold text-[#EDEDED] block tabular-nums">
                  ${cashRevenue.toLocaleString('es-AR')}
                </strong>
                <div className="w-full bg-white/[0.06] rounded-full h-1 overflow-hidden mt-1">
                  <div
                    className="bg-emerald-400 h-full rounded-full"
                    style={{ width: `${totalRevenue > 0 ? (cashRevenue / totalRevenue) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#101012] border border-white/[0.06] space-y-1">
                <div className="flex items-center justify-between text-[#8A898E]">
                  <span>TRANSFERENCIA</span>
                  <span className="text-[#EDEDED] font-bold">
                    {totalRevenue > 0 ? Math.round((transferRevenue / totalRevenue) * 100) : 0}%
                  </span>
                </div>
                <strong className="text-base font-bold text-[#EDEDED] block tabular-nums">
                  ${transferRevenue.toLocaleString('es-AR')}
                </strong>
                <div className="w-full bg-white/[0.06] rounded-full h-1 overflow-hidden mt-1">
                  <div
                    className="bg-[#D4AF37] h-full rounded-full"
                    style={{ width: `${totalRevenue > 0 ? (transferRevenue / totalRevenue) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#101012] border border-white/[0.06] space-y-1">
                <div className="flex items-center justify-between text-[#8A898E]">
                  <span>CANJES DE PUNTOS</span>
                  <span className="text-[#D4AF37] font-bold">{redemptionsCount} canjes</span>
                </div>
                <strong className="text-base font-bold text-[#D4AF37] block tabular-nums">
                  Cortes Bonificados
                </strong>
                <span className="text-[10px] text-[#8A898E] block">
                  Puntos invertidos en fidelidad
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Leaderboard Top 10 Socios VIP */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#141416] border border-white/[0.08] shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#101012] border border-white/[0.1] text-[#D4AF37] flex items-center justify-center">
                  <Award className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="micro-technical block text-[9px] text-[#D4AF37]">
                    LEADERBOARD DE FIDELIZACIÓN
                  </span>
                  <h3 className="text-sm font-display font-bold text-[#EDEDED]">
                    Top 10 Socios Más Fieles del Estudio
                  </h3>
                </div>
              </div>
              <span className="text-[11px] font-mono text-[#8A898E]">
                Ordenados por frecuencia histórica y puntos
              </span>
            </div>

            {topVipClients.length === 0 ? (
              <p className="p-6 text-xs font-mono text-[#8A898E] text-center">
                Aún no hay suficientes socios con cortes registrados.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {topVipClients.map((c, idx) => {
                  const rankBadge =
                    idx === 0
                      ? 'bg-[#D4AF37] text-black font-extrabold'
                      : idx === 1
                      ? 'bg-zinc-300 text-black font-extrabold'
                      : idx === 2
                      ? 'bg-amber-700 text-white font-extrabold'
                      : 'bg-[#101012] text-[#8A898E] border border-white/[0.08]';

                  return (
                    <div
                      key={c.id || c.dni}
                      className="p-3.5 rounded-xl bg-[#101012] border border-white/[0.06] hover:border-white/[0.15] flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono shrink-0 ${rankBadge}`}
                        >
                          #{idx + 1}
                        </span>

                        <div className="space-y-0.5">
                          <strong className="text-xs font-display font-bold text-[#EDEDED] block">
                            {c.firstName || c.name || 'Socio'} {c.lastName || ''}
                          </strong>
                          <span className="text-[10px] font-mono text-[#8A898E] block tabular-nums">
                            DNI {c.dni} • {c.totalCuts || 0} cortes • {c.points || 0} PTS
                          </span>
                          {c.hairStyle && (
                            <span className="text-[10px] font-mono text-[#D4AF37] block">
                              ✂ {c.hairStyle}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenVipRewardModal(c)}
                        className="px-2.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-[#D4AF37]/15 border border-white/[0.08] hover:border-[#D4AF37]/40 text-[#8A898E] hover:text-[#D4AF37] text-[11px] font-mono font-medium flex items-center gap-1 transition-colors shrink-0"
                        title="Enviar beneficio VIP editable por WhatsApp"
                      >
                        <MessageCircle className="w-3 h-3 stroke-[2]" />
                        <span>Premio VIP</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 4: Movimientos de Caja Registrados */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#141416] border border-white/[0.08] shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="micro-technical block text-[9px] text-[#D4AF37]">
                  LIBRO DIARIO DE COBROS
                </span>
                <h3 className="text-sm font-display font-bold text-[#EDEDED]">
                  Historial de Movimientos de Caja
                </h3>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#8A898E] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={financeSearch}
                    onChange={(e) => setFinanceSearch(e.target.value)}
                    placeholder="Buscar por cliente o código..."
                    className="pl-8 pr-3 py-1.5 rounded-xl bg-[#101012] border border-white/[0.08] text-xs font-mono text-[#EDEDED] placeholder-[#8A898E] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="flex items-center gap-1 p-0.5 rounded-xl bg-[#101012] border border-white/[0.08] text-xs font-mono">
                  {['all', 'Efectivo', 'Transferencia', 'Canje de Puntos'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setFinanceMethodFilter(m)}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        financeMethodFilter === m
                          ? 'bg-white/[0.1] text-[#EDEDED] font-bold border border-[#D4AF37]'
                          : 'text-[#8A898E] hover:text-[#EDEDED]'
                      }`}
                    >
                      {m === 'all' ? 'Todos' : m === 'Canje de Puntos' ? 'Canjes' : m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {filteredPayments.length === 0 ? (
              <p className="p-6 text-xs font-mono text-[#8A898E] text-center">
                No se registraron movimientos con los filtros seleccionados.
              </p>
            ) : (
              <div className="divide-y divide-white/[0.06] text-xs font-mono">
                {filteredPayments.map((p) => {
                  const paymentDate = p.created_at ? new Date(p.created_at).toLocaleDateString('es-AR') : '';
                  return (
                    <div
                      key={p.id}
                      className="py-3 flex items-center justify-between gap-4"
                    >
                      <div>
                        <strong className="font-display font-bold text-xs text-[#EDEDED] block">
                          {p.client_name} • {p.service_name}
                        </strong>
                        <span className="text-[10px] text-[#8A898E] tabular-nums">
                          Turno #{p.code} • DNI {p.client_dni} • {p.payment_method} {paymentDate ? `• ${paymentDate}` : ''}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-sm text-emerald-400 tabular-nums">
                        ${Number(p.amount || 0).toLocaleString('es-AR')}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Birthday Section */}
      {activeTab === 'birthdays' && (
        <BirthdaySection birthdaysData={birthdaysData} />
      )}

      {/* Payment Checkout Modal */}
      {payingAppointment && (
        <PaymentModal
          appointment={payingAppointment}
          client={clientForPayment}
          onClose={() => setPayingAppointment(null)}
          onConfirmPayment={handleConfirmPayment}
        />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          config={config}
          services={services}
          onClose={() => setIsSettingsOpen(false)}
          onSaved={() => loadDashboard()}
        />
      )}

      {/* Global Editable Message Modal */}
      <EditableMessageModal
        isOpen={messageModal.isOpen}
        onClose={() => setMessageModal((prev) => ({ ...prev, isOpen: false }))}
        recipientName={messageModal.recipientName}
        recipientPhone={messageModal.recipientPhone}
        initialMessage={messageModal.initialMessage}
        title={messageModal.title}
        badge={messageModal.badge}
        suggestedTemplates={messageModal.suggestedTemplates}
      />
    </div>
  );
}
