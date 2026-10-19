import React, { useState } from 'react';
import {
  Search,
  MessageCircle,
  KeyRound,
  Edit3,
  Cake,
  X,
  Check,
  Scissors,
  AlertTriangle,
  Clock,
  Sparkles,
  Beer,
  Crown,
  ChevronRight,
  Filter
} from 'lucide-react';
import EditableMessageModal from './EditableMessageModal';

export default function ClientsDirectory({ clients = [], onUpdateClient }) {
  const [query, setQuery] = useState('');
  const [activeSegment, setActiveSegment] = useState('all'); // 'all' | 'due' | 'risk' | 'inactive' | 'top'
  const [editingClient, setEditingClient] = useState(null);

  // Message Modal State
  const [messageModal, setMessageModal] = useState({
    isOpen: false,
    recipientName: '',
    recipientPhone: '',
    initialMessage: '',
    title: '',
    badge: '',
    suggestedTemplates: []
  });

  // Edit Form State
  const [eFirstName, setEFirstName] = useState('');
  const [eLastName, setELastName] = useState('');
  const [ePhone, setEPhone] = useState('');
  const [eBirthDate, setEBirthDate] = useState('');
  const [ePoints, setEPoints] = useState(0);
  const [eTotalCuts, setETotalCuts] = useState(0);
  const [ePin, setEPin] = useState('');
  const [eNotes, setENotes] = useState('');
  const [eHairStyle, setEHairStyle] = useState('');
  const [eHairTexture, setEHairTexture] = useState('');
  const [ePreferredProduct, setEPreferredProduct] = useState('');
  const [ePreferredDrink, setEPreferredDrink] = useState('');

  const getDaysSinceLastVisit = (dateStr) => {
    if (!dateStr) return null;
    const parts = String(dateStr).split('-');
    if (parts.length !== 3) return null;
    const visitDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - visitDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays : 0;
  };

  const getClientSegment = (c) => {
    const days = getDaysSinceLastVisit(c.lastVisitDate);
    if (days === null) {
      if ((c.totalCuts || 0) === 0) return { id: 'new', label: 'Nuevo', color: 'text-zinc-400 border-zinc-700 bg-zinc-800/40' };
      return { id: 'due', label: 'Sin fecha registrada', color: 'text-zinc-400 border-zinc-700 bg-zinc-800/40' };
    }
    if (days < 25) {
      return { id: 'active', label: `Al día (${days}d)`, color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' };
    }
    if (days <= 35) {
      return { id: 'due', label: `Toca corte (${days}d)`, color: 'text-[#D4AF37] border-[#D4AF37]/30 bg-[#D4AF37]/10' };
    }
    if (days <= 45) {
      return { id: 'risk', label: `En riesgo (${days}d)`, color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' };
    }
    return { id: 'inactive', label: `Inactivo (${days}d)`, color: 'text-rose-400 border-rose-500/30 bg-rose-500/10' };
  };

  const openEditModal = (c) => {
    setEditingClient(c);
    setEFirstName(c.firstName || c.name || '');
    setELastName(c.lastName || '');
    setEPhone(c.phone || '');
    setEBirthDate(c.birthDate || '');
    setEPoints(c.points || 0);
    setETotalCuts(c.totalCuts || 0);
    setEPin(c.pinCode || '1234');
    setENotes(c.notes || '');
    setEHairStyle(c.hairStyle || '');
    setEHairTexture(c.hairTexture || '');
    setEPreferredProduct(c.preferredProduct || '');
    setEPreferredDrink(c.preferredDrink || '');
  };

  const handleSaveClient = async (e) => {
    e.preventDefault();
    if (!editingClient) return;
    await onUpdateClient(editingClient.dni, {
      firstName: eFirstName,
      lastName: eLastName,
      phone: ePhone,
      birthDate: eBirthDate,
      points: Number(ePoints),
      totalCuts: Number(eTotalCuts),
      newPin: ePin,
      notes: eNotes,
      hairStyle: eHairStyle,
      hairTexture: eHairTexture,
      preferredProduct: ePreferredProduct,
      preferredDrink: ePreferredDrink
    });
    setEditingClient(null);
  };

  // Open Message Modal for Sending PIN
  const handleOpenSendPin = (c) => {
    const fullName = `${c.firstName || c.name || 'Socio'} ${c.lastName || ''}`.trim();
    setMessageModal({
      isOpen: true,
      recipientName: fullName,
      recipientPhone: c.phone || '',
      title: 'Enviar PIN de Acceso',
      badge: 'CLAVE DE ACCESO WEB',
      initialMessage: `Hola ${c.firstName || c.name || 'Socio'}! Te paso tu PIN personal de 4 dígitos para ingresar a tu Club Pass en la web de ULTRA BARBER: ${c.pinCode || '1234'} (DNI: ${c.dni}). Guardalo para reservar y ver tus puntos!`,
      suggestedTemplates: [
        {
          label: 'Envío de PIN Estándar',
          text: `Hola ${c.firstName || c.name || 'Socio'}! Te paso tu PIN personal de 4 dígitos para ingresar a tu Club Pass en la web de ULTRA BARBER: ${c.pinCode || '1234'} (DNI: ${c.dni}). Guardalo para reservar y ver tus puntos!`
        },
        {
          label: 'Bienvenida + PIN',
          text: `Hola ${c.firstName || c.name || 'Socio'}, un gusto tenerte en ULTRA BARBER! Tu cuenta ya está activa. Tu PIN de ingreso es ${c.pinCode || '1234'} (con tu DNI ${c.dni}). Con cada visita sumás puntos para cortes bonificados!`
        }
      ]
    });
  };

  // Open Message Modal for Client Reactivation / Touchpoint
  const handleOpenReactivation = (c) => {
    const fullName = `${c.firstName || c.name || 'Socio'} ${c.lastName || ''}`.trim();
    const days = getDaysSinceLastVisit(c.lastVisitDate);
    const styleRef = c.hairStyle ? ` de ${c.hairStyle}` : '';

    setMessageModal({
      isOpen: true,
      recipientName: fullName,
      recipientPhone: c.phone || '',
      title: 'Reactivar Socio / Mensaje Personalizado',
      badge: 'RADAR DE FIDELIZACIÓN',
      initialMessage: `Hola ${c.firstName || c.name || 'Socio'}! ¿Cómo andás? Pasaron unas semanas de tu último corte${styleRef}. ¿Te gustaría que te reserve un lugar en el sillón para estos días y renovar el estilo?`,
      suggestedTemplates: [
        {
          label: 'Renovar Estilo (Habitual)',
          text: `Hola ${c.firstName || c.name || 'Socio'}! ¿Cómo andás? Pasaron unas semanas de tu último corte${styleRef}. ¿Te gustaría que te reserve un lugar en el sillón para estos días y renovar el estilo?`
        },
        {
          label: 'Aprovechar Puntos VIP',
          text: `Hola ${c.firstName || c.name || 'Socio'}! Te escribo de ULTRA BARBER. Tenés acumulados ${c.points || 0} puntos en tu Club Pass. Avisame y te aseguro un turno para esta semana!`
        },
        {
          label: 'Fin de Semana / Reserva',
          text: `Hola ${c.firstName || c.name || 'Socio'}! Se viene el fin de semana y quedan pocos lugares en el estudio. Si querés pasar por el sillón avisame por acá y te anoto!`
        }
      ]
    });
  };

  // Segment Counts
  const counts = {
    all: clients.length,
    due: 0,
    risk: 0,
    inactive: 0,
    top: 0
  };

  clients.forEach((c) => {
    const days = getDaysSinceLastVisit(c.lastVisitDate);
    if ((c.totalCuts || 0) >= 5 || (c.points || 0) >= 5) counts.top++;
    if (days !== null) {
      if (days >= 25 && days <= 35) counts.due++;
      else if (days > 35 && days <= 45) counts.risk++;
      else if (days > 45) counts.inactive++;
    }
  });

  const filtered = clients.filter((c) => {
    // Segment filter
    const days = getDaysSinceLastVisit(c.lastVisitDate);
    if (activeSegment === 'due') {
      if (days === null || days < 25 || days > 35) return false;
    } else if (activeSegment === 'risk') {
      if (days === null || days <= 35 || days > 45) return false;
    } else if (activeSegment === 'inactive') {
      if (days === null || days <= 45) return false;
    } else if (activeSegment === 'top') {
      if ((c.totalCuts || 0) < 5 && (c.points || 0) < 5) return false;
    }

    // Query filter
    const q = query.toLowerCase().trim();
    if (!q) return true;
    const fullName = `${c.firstName || c.name || ''} ${c.lastName || ''}`.toLowerCase();
    const styleInfo = `${c.hairStyle || ''} ${c.preferredProduct || ''} ${c.preferredDrink || ''} ${c.notes || ''}`.toLowerCase();
    return (
      fullName.includes(q) ||
      (c.dni || '').toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q) ||
      styleInfo.includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Radar de Reactivación & Segmentos Bar */}
      <div className="p-4 rounded-2xl bg-[#141416] border border-white/[0.08] shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#101012] border border-white/[0.1] text-[#D4AF37] flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="micro-technical block text-[9px] text-[#D4AF37]">
                RADAR DE REACTIVACIÓN &amp; FIDELIZACIÓN
              </span>
              <h3 className="text-sm font-display font-bold text-[#EDEDED] leading-tight">
                Estado del Padrón de Socios
              </h3>
            </div>
          </div>
          <span className="text-[11px] font-mono text-[#8A898E]">
            {filtered.length} de {clients.length} socios visualizados
          </span>
        </div>

        {/* Segment Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'Todos', count: counts.all, color: 'text-[#EDEDED]' },
            { id: 'due', label: 'Toca Corte (25-35d)', count: counts.due, color: 'text-[#D4AF37]' },
            { id: 'risk', label: 'En Riesgo (36-45d)', count: counts.risk, color: 'text-amber-400' },
            { id: 'inactive', label: 'Inactivos (+45d)', count: counts.inactive, color: 'text-rose-400' },
            { id: 'top', label: 'Top VIPs (+5 cortes)', count: counts.top, color: 'text-[#D4AF37]' }
          ].map((seg) => {
            const isActive = activeSegment === seg.id;
            return (
              <button
                key={seg.id}
                type="button"
                onClick={() => setActiveSegment(seg.id)}
                className={`px-3 py-2 rounded-xl font-mono text-xs whitespace-nowrap transition-all border flex items-center gap-2 ${
                  isActive
                    ? 'bg-white/[0.1] border-[#D4AF37] text-[#EDEDED] font-bold shadow-sm'
                    : 'bg-[#101012] border-white/[0.06] text-[#8A898E] hover:text-[#EDEDED] hover:border-white/[0.15]'
                }`}
              >
                <span>{seg.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold tabular-nums ${
                    isActive ? 'bg-[#D4AF37] text-black' : 'bg-white/[0.06] text-[#EDEDED]'
                  }`}
                >
                  {seg.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#8A898E] absolute left-4 top-3.5" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar socio por DNI, nombre, corte habitual (ej: Fade), WhatsApp..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#141416] border border-white/[0.08] text-[#EDEDED] placeholder-[#8A898E] text-xs font-sans focus:outline-none focus:border-[#D4AF37] transition-colors"
        />
      </div>

      {/* Clients Bento Grid */}
      {filtered.length === 0 ? (
        <div className="p-8 rounded-2xl bg-[#141416] border border-white/[0.08] text-center space-y-2">
          <p className="text-xs font-mono text-[#8A898E]">
            No se encontraron socios con los filtros aplicados.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3.5">
          {filtered.map((c) => {
            const segment = getClientSegment(c);
            const isVip = (c.totalCuts || 0) >= 5 || (c.points || 0) >= 5;

            return (
              <div
                key={c.id || c.dni}
                className="p-4 sm:p-5 rounded-2xl bg-[#141416] border border-white/[0.08] hover:border-white/[0.15] transition-all space-y-3.5 shadow-sm"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-display font-bold text-[#EDEDED]">
                        {c.firstName || c.name || 'Socio'} {c.lastName || ''}
                      </h3>
                      {isVip && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 flex items-center gap-1">
                          <Crown className="w-2.5 h-2.5" />
                          <span>VIP</span>
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold border ${segment.color}`}
                      >
                        {segment.label}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-[#8A898E] tabular-nums">
                      DNI {c.dni} • WA: {c.phone || 'Sin número'}
                    </p>
                  </div>

                  {/* Actions: Edit & WhatsApp */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditModal(c)}
                      className="px-3 py-1.5 rounded-xl bg-[#101012] border border-white/[0.1] text-xs font-mono text-[#EDEDED] hover:border-[#D4AF37] flex items-center gap-1.5 transition-colors"
                      title="Editar ficha completa y ADN de corte"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Ficha VIP</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenSendPin(c)}
                      className="p-2 rounded-xl bg-[#101012] border border-white/[0.1] text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors"
                      title="Enviar PIN web por WhatsApp (editable)"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenReactivation(c)}
                      className="p-2 rounded-xl bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/30 transition-colors"
                      title="Contactar / Reactivar por WhatsApp (editable)"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* ADN de Estilo & Preferencias */}
                <div className="p-3 rounded-xl bg-[#101012] border border-white/[0.06] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="micro-technical text-[9px] text-[#D4AF37] flex items-center gap-1">
                      <Scissors className="w-3 h-3" />
                      <span>ADN DE ESTILO &amp; PREFERENCIAS</span>
                    </span>
                    {c.lastVisitDate && (
                      <span className="text-[10px] font-mono text-[#8A898E]">
                        Última visita: {c.lastVisitDate}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                    <div className="p-1.5 rounded bg-black/40 border border-white/[0.04]">
                      <span className="text-[9px] text-[#8A898E] block uppercase">Corte / Fade</span>
                      <strong className="text-[#EDEDED] truncate block font-medium">
                        {c.hairStyle || 'No asignado'}
                      </strong>
                    </div>

                    <div className="p-1.5 rounded bg-black/40 border border-white/[0.04]">
                      <span className="text-[9px] text-[#8A898E] block uppercase">Textura Sup.</span>
                      <strong className="text-[#EDEDED] truncate block font-medium">
                        {c.hairTexture || 'Estándar'}
                      </strong>
                    </div>

                    <div className="p-1.5 rounded bg-black/40 border border-white/[0.04]">
                      <span className="text-[9px] text-[#8A898E] block uppercase">Producto</span>
                      <strong className="text-[#EDEDED] truncate block font-medium">
                        {c.preferredProduct || 'A definir'}
                      </strong>
                    </div>

                    <div className="p-1.5 rounded bg-black/40 border border-white/[0.04]">
                      <span className="text-[9px] text-[#8A898E] block uppercase flex items-center gap-1">
                        <Beer className="w-2.5 h-2.5 text-[#D4AF37]" />
                        <span>Bebida</span>
                      </span>
                      <strong className="text-[#D4AF37] truncate block font-medium">
                        {c.preferredDrink || 'A definir'}
                      </strong>
                    </div>
                  </div>

                  {c.notes && (
                    <p className="text-[11px] text-[#8A898E] pt-1 border-t border-white/[0.04] leading-relaxed">
                      <strong className="text-[#EDEDED]">Notas técnicas:</strong> {c.notes}
                    </p>
                  )}
                </div>

                {/* Bottom Metrics Bar */}
                <dl className="grid grid-cols-4 gap-2 pt-2 border-t border-white/[0.06] text-xs font-mono tabular-nums">
                  <div>
                    <dt className="text-[10px] text-[#8A898E] uppercase">Puntos</dt>
                    <dd className="text-sm font-bold text-emerald-400">
                      +{c.points || 0} PTS
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] text-[#8A898E] uppercase">Cortes</dt>
                    <dd className="text-sm font-bold text-[#EDEDED]">
                      {c.totalCuts || 0}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] text-[#8A898E] uppercase">PIN Web</dt>
                    <dd className="text-sm font-bold text-[#D4AF37]">
                      {c.pinCode || '1234'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] text-[#8A898E] uppercase">Cumpleaños</dt>
                    <dd className="text-xs font-medium text-[#8A898E] truncate">
                      {c.birthDate || 'Sin cargar'}
                    </dd>
                  </div>
                </dl>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Editar Socio Completo & ADN de Estilo */}
      {editingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-enter">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#141416] border border-white/[0.1] p-5 sm:p-6 text-[#EDEDED] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <span className="micro-technical block text-[9px] text-[#D4AF37]">
                  FICHA TÉCNICA DEL CLIENTE
                </span>
                <h3 className="text-base font-display font-bold text-[#EDEDED]">
                  {editingClient.firstName || editingClient.name} {editingClient.lastName || ''} (DNI {editingClient.dni})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingClient(null)}
                className="p-1.5 rounded-lg text-[#8A898E] hover:text-[#EDEDED] hover:bg-white/[0.05]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="space-y-4 text-xs">
              {/* Sección 1: Datos Personales */}
              <div className="space-y-2">
                <span className="micro-technical block text-[9px] text-[#8A898E]">
                  1. DATOS PERSONALES &amp; CONTACTO
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#8A898E] mb-1">Nombre</label>
                    <input
                      type="text"
                      required
                      value={eFirstName}
                      onChange={(e) => setEFirstName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#101012] border border-white/[0.1] text-[#EDEDED]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#8A898E] mb-1">Apellido</label>
                    <input
                      type="text"
                      value={eLastName}
                      onChange={(e) => setELastName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#101012] border border-white/[0.1] text-[#EDEDED]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#8A898E] mb-1">WhatsApp</label>
                    <input
                      type="text"
                      value={ePhone}
                      onChange={(e) => setEPhone(e.target.value)}
                      placeholder="Ej: 3415551234"
                      className="w-full px-3 py-2 rounded-xl bg-[#101012] border border-white/[0.1] text-[#EDEDED] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#8A898E] mb-1">Fecha Nacimiento</label>
                    <input
                      type="date"
                      value={eBirthDate}
                      onChange={(e) => setEBirthDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#101012] border border-white/[0.1] text-[#EDEDED] font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 2: ADN de Estilo & Preferencias */}
              <div className="space-y-2 pt-2 border-t border-white/[0.08]">
                <span className="micro-technical block text-[9px] text-[#D4AF37]">
                  2. ADN DE ESTILO &amp; PREFERENCIAS EN EL SILLÓN
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#8A898E] mb-1">
                      Corte / Graduación Favorita
                    </label>
                    <input
                      type="text"
                      value={eHairStyle}
                      onChange={(e) => setEHairStyle(e.target.value)}
                      placeholder="Ej: Mid Fade con 0.5, Skin Fade navaja"
                      className="w-full px-3 py-2 rounded-xl bg-[#101012] border border-white/[0.1] text-[#EDEDED]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#8A898E] mb-1">
                      Textura / Acabado Superior
                    </label>
                    <input
                      type="text"
                      value={eHairTexture}
                      onChange={(e) => setEHairTexture(e.target.value)}
                      placeholder="Ej: Texturizado tijera, Hacia atrás"
                      className="w-full px-3 py-2 rounded-xl bg-[#101012] border border-white/[0.1] text-[#EDEDED]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#8A898E] mb-1">
                      Producto de Peinado Habitual
                    </label>
                    <input
                      type="text"
                      value={ePreferredProduct}
                      onChange={(e) => setEPreferredProduct(e.target.value)}
                      placeholder="Ej: Cera mate, Polvo volumizador"
                      className="w-full px-3 py-2 rounded-xl bg-[#101012] border border-white/[0.1] text-[#EDEDED]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#D4AF37] mb-1">
                      Bebida Favorita en el Sillón
                    </label>
                    <input
                      type="text"
                      value={ePreferredDrink}
                      onChange={(e) => setEPreferredDrink(e.target.value)}
                      placeholder="Ej: Cerveza Corona fría, Monster, Café"
                      className="w-full px-3 py-2 rounded-xl bg-[#101012] border border-[#D4AF37]/40 text-[#D4AF37]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#8A898E] mb-1">
                    Notas de remolino, cuero cabelludo o mañas
                  </label>
                  <textarea
                    rows={2}
                    value={eNotes}
                    onChange={(e) => setENotes(e.target.value)}
                    placeholder="Ej: Remolino rebelde en la coronilla, no desgastar patilla izquierda..."
                    className="w-full px-3 py-2 rounded-xl bg-[#101012] border border-white/[0.1] text-[#EDEDED]"
                  />
                </div>
              </div>

              {/* Sección 3: Métricas & Seguridad */}
              <div className="space-y-2 pt-2 border-t border-white/[0.08]">
                <span className="micro-technical block text-[9px] text-[#8A898E]">
                  3. FIDELIDAD &amp; ACCESO WEB
                </span>
                <div className="grid grid-cols-3 gap-3 font-mono">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#8A898E] mb-1">Puntos</label>
                    <input
                      type="number"
                      value={ePoints}
                      onChange={(e) => setEPoints(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#101012] border border-white/[0.1] text-emerald-400 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#8A898E] mb-1">Cortes</label>
                    <input
                      type="number"
                      value={eTotalCuts}
                      onChange={(e) => setETotalCuts(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#101012] border border-white/[0.1] text-[#EDEDED] font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#D4AF37] mb-1">PIN Web (4 dígitos)</label>
                    <input
                      type="text"
                      maxLength={4}
                      value={ePin}
                      onChange={(e) => setEPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className="w-full px-3 py-2 rounded-xl bg-[#101012] border border-[#D4AF37]/50 text-[#D4AF37] font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setEditingClient(null)}
                  className="px-4 py-2 rounded-xl border border-white/[0.1] text-[#8A898E] hover:text-[#EDEDED]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#c29e2f] active:scale-[0.98] text-black font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
                >
                  <Check className="w-4 h-4 stroke-[2]" />
                  <span>Guardar Ficha Técnica</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Reutilizable de Mensajes Editables */}
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
