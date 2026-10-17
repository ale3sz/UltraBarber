import React, { useState } from 'react';
import {
  Search,
  MessageCircle,
  KeyRound,
  Edit3,
  Cake,
  X,
  Check
} from 'lucide-react';

export default function ClientsDirectory({ clients = [], onUpdateClient }) {
  const [query, setQuery] = useState('');
  const [editingClient, setEditingClient] = useState(null);

  // Edit Form State
  const [eFirstName, setEFirstName] = useState('');
  const [eLastName, setELastName] = useState('');
  const [ePhone, setEPhone] = useState('');
  const [eBirthDate, setEBirthDate] = useState('');
  const [ePoints, setEPoints] = useState(0);
  const [eTotalCuts, setETotalCuts] = useState(0);
  const [ePin, setEPin] = useState('');
  const [eNotes, setENotes] = useState('');

  const openEditModal = (c) => {
    setEditingClient(c);
    setEFirstName(c.firstName || '');
    setELastName(c.lastName || '');
    setEPhone(c.phone || '');
    setEBirthDate(c.birthDate || '');
    setEPoints(c.points || 0);
    setETotalCuts(c.totalCuts || 0);
    setEPin(c.pinCode || '1234');
    setENotes(c.notes || '');
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
      notes: eNotes
    });
    setEditingClient(null);
  };

  const filtered = clients.filter((c) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    const fullName = `${c.firstName || c.name || ''} ${c.lastName || ''}`.toLowerCase();
    return (
      fullName.includes(q) ||
      (c.dni || '').toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="w-4 h-4 text-barber-lightMuted dark:text-barber-darkMuted absolute left-4 top-3.5" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar socio por DNI, nombre o WhatsApp..."
          className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-barber-lightSurface dark:bg-barber-darkSurface border border-barber-lightBorder dark:border-barber-darkBorder text-barber-lightText dark:text-barber-darkText placeholder-barber-lightMuted dark:placeholder-barber-darkMuted text-sm focus:outline-none focus:border-barber-matcha"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((c) => {
          const cleanPhone = (c.phone || '').replace(/\D/g, '');
          const sendPinWaUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
            `Hola ${c.firstName || c.name || 'Socio'}! Te paso tu PIN de acceso de 4 dígitos para la web de David Barber Studio: ${c.pinCode || '1234'} (DNI: ${c.dni}).`
          )}`;

          return (
            <div
              key={c.id || c.dni}
              className="p-5 rounded-3xl bg-barber-lightSurface dark:bg-barber-darkSurface border border-barber-lightBorder dark:border-barber-darkBorder space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-display font-bold text-barber-lightText dark:text-barber-darkText">
                    {c.firstName || c.name || 'Socio'} {c.lastName || ''}
                  </h3>
                  <p className="text-xs font-mono text-barber-lightMuted dark:text-barber-darkMuted tabular-nums">
                    DNI {c.dni} • {c.phone}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEditModal(c)}
                    className="px-3 py-2 rounded-xl bg-barber-lightBg dark:bg-barber-darkBg border border-barber-lightBorder dark:border-barber-darkBorder text-xs font-semibold text-barber-lightText dark:text-barber-darkText hover:border-barber-chai flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-barber-chai" />
                    <span>Editar</span>
                  </button>

                  <a
                    href={sendPinWaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-barber-matcha text-white hover:brightness-110 transition-all"
                    title="Enviar su PIN por WhatsApp"
                    aria-label="Enviar PIN por WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <dl className="grid grid-cols-3 gap-2 pt-3 border-t border-barber-lightBorder dark:border-barber-darkBorder text-xs">
                <div>
                  <dt className="text-barber-lightMuted dark:text-barber-darkMuted font-mono text-[11px]">
                    PUNTOS
                  </dt>
                  <dd className="text-base font-display font-bold text-barber-matcha tabular-nums">
                    +{c.points || 0} PTS
                  </dd>
                </div>

                <div>
                  <dt className="text-barber-lightMuted dark:text-barber-darkMuted font-mono text-[11px]">
                    CORTES
                  </dt>
                  <dd className="text-base font-display font-bold text-barber-lightText dark:text-barber-darkText tabular-nums">
                    {c.totalCuts || 0}
                  </dd>
                </div>

                <div>
                  <dt className="text-barber-lightMuted dark:text-barber-darkMuted font-mono text-[11px] flex items-center gap-1">
                    <KeyRound className="w-3 h-3 text-barber-chai" />
                    <span>PIN WEB</span>
                  </dt>
                  <dd className="text-base font-mono font-bold text-barber-chai tabular-nums">
                    {c.pinCode || '1234'}
                  </dd>
                </div>
              </dl>

              {c.notes && (
                <p className="text-xs text-barber-lightMuted dark:text-barber-darkMuted pt-2 border-t border-barber-lightBorder/60 dark:border-barber-darkBorder">
                  <strong className="text-barber-lightText dark:text-barber-darkText">Ficha técnica:</strong> {c.notes}
                </p>
              )}

              {c.birthDate && (
                <p className="text-xs font-mono text-barber-lightMuted dark:text-barber-darkMuted flex items-center gap-1.5 tabular-nums">
                  <Cake className="w-3.5 h-3.5 text-barber-chai" />
                  <span>Cumpleaños: {c.birthDate}</span>
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal: Editar Cliente / Resetear PIN / Notas de Corte */}
      {editingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-barber-darkSurface border border-barber-darkBorder p-6 text-barber-darkText club-shadow space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-display font-bold text-barber-darkText">
                Editar Socio (DNI {editingClient.dni})
              </h3>
              <button
                type="button"
                onClick={() => setEditingClient(null)}
                className="p-2 text-barber-pistache hover:text-barber-darkText"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    value={eFirstName}
                    onChange={(e) => setEFirstName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-barber-darkBg border border-barber-darkBorder text-barber-darkText"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Apellido</label>
                  <input
                    type="text"
                    required
                    value={eLastName}
                    onChange={(e) => setELastName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-barber-darkBg border border-barber-darkBorder text-barber-darkText"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">WhatsApp</label>
                  <input
                    type="text"
                    value={ePhone}
                    onChange={(e) => setEPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-barber-darkBg border border-barber-darkBorder text-barber-darkText font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Fecha Nacimiento</label>
                  <input
                    type="date"
                    value={eBirthDate}
                    onChange={(e) => setEBirthDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-barber-darkBg border border-barber-darkBorder text-barber-darkText font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Puntos</label>
                  <input
                    type="number"
                    value={ePoints}
                    onChange={(e) => setEPoints(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-barber-darkBg border border-barber-darkBorder text-barber-matcha font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Cortes</label>
                  <input
                    type="number"
                    value={eTotalCuts}
                    onChange={(e) => setETotalCuts(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-barber-darkBg border border-barber-darkBorder text-barber-darkText font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-barber-chai">PIN (4 núm.)</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={ePin}
                    onChange={(e) => setEPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-barber-darkBg border border-barber-chai text-barber-chai font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Notas de corte / Preferencias</label>
                <textarea
                  rows={2}
                  value={eNotes}
                  onChange={(e) => setENotes(e.target.value)}
                  placeholder="Ej: Mid fade con 0.5, no tocar remolino..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-barber-darkBg border border-barber-darkBorder text-barber-darkText"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingClient(null)}
                  className="px-4 py-2.5 rounded-xl border border-barber-darkBorder text-barber-pistache"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-barber-matcha text-white font-display font-bold uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar Ficha</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
