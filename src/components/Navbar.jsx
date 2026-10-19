import React from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  Scissors,
  Sun,
  Moon,
  CalendarPlus,
  Lock,
  UserCheck,
  LogOut,
  CreditCard,
  Clock,
  ShieldCheck
} from 'lucide-react';
import InstagramIcon from './icons/InstagramIcon';

export default function Navbar({
  activeView,
  setActiveView,
  clientSubTab,
  setClientSubTab,
  loggedClient,
  onLogoutClient,
  adminUser,
  onLogoutAdmin,
  pendingCount = 0
}) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <>
      {/* Top Studio Header */}
      <header className="sticky top-0 z-40 w-full bg-[#0B0B0C]/90 backdrop-blur-md border-b border-white/[0.08] transition-colors">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Brand Identity */}
          <button
            type="button"
            onClick={() => {
              setActiveView('client');
              setClientSubTab('club');
            }}
            className="flex items-center gap-3 text-left group focus:outline-none min-w-0"
          >
            <div className="w-8 h-8 rounded-md bg-[#141416] border border-white/[0.1] flex items-center justify-center text-[#D4AF37] group-hover:border-[#D4AF37]/50 transition-colors shrink-0">
              <Scissors className="w-4 h-4 -rotate-45 stroke-[1.5]" />
            </div>
            <div className="min-w-0">
              <span className="font-display font-bold text-sm sm:text-base tracking-tight text-[#EDEDED] block leading-tight truncate">
                DAVID BARBER
              </span>
              <span className="text-[9px] font-mono tracking-[0.2em] text-[#8A898E] uppercase block truncate">
                Club &amp; Turnos VIP
              </span>
            </div>
          </button>

          {/* Desktop Navigation Tabs */}
          {activeView === 'client' && (
            <nav className="hidden md:flex items-center gap-1 p-1 rounded-md bg-[#141416] border border-white/[0.08]">
              <button
                type="button"
                onClick={() => setClientSubTab('club')}
                className={`px-3.5 py-1.5 rounded text-[11px] font-mono uppercase tracking-[0.12em] flex items-center gap-2 transition-all ${
                  clientSubTab === 'club'
                    ? 'bg-white/[0.08] text-[#EDEDED] border border-white/[0.12]'
                    : 'text-[#8A898E] hover:text-[#EDEDED]'
                }`}
              >
                <CreditCard className={`w-3.5 h-3.5 stroke-[1.5] ${clientSubTab === 'club' ? 'text-[#D4AF37]' : ''}`} />
                <span>Mi Pase</span>
              </button>

              <button
                type="button"
                onClick={() => setClientSubTab('book')}
                className={`px-3.5 py-1.5 rounded text-[11px] font-mono uppercase tracking-[0.12em] flex items-center gap-2 transition-all ${
                  clientSubTab === 'book'
                    ? 'bg-white/[0.08] text-[#EDEDED] border border-white/[0.12]'
                    : 'text-[#8A898E] hover:text-[#EDEDED]'
                }`}
              >
                <CalendarPlus className={`w-3.5 h-3.5 stroke-[1.5] ${clientSubTab === 'book' ? 'text-[#D4AF37]' : ''}`} />
                <span>Reservar</span>
              </button>

              <button
                type="button"
                onClick={() => setClientSubTab('turns')}
                className={`px-3.5 py-1.5 rounded text-[11px] font-mono uppercase tracking-[0.12em] flex items-center gap-2 transition-all ${
                  clientSubTab === 'turns'
                    ? 'bg-white/[0.08] text-[#EDEDED] border border-white/[0.12]'
                    : 'text-[#8A898E] hover:text-[#EDEDED]'
                }`}
              >
                <Clock className={`w-3.5 h-3.5 stroke-[1.5] ${clientSubTab === 'turns' ? 'text-[#D4AF37]' : ''}`} />
                <span>Mis Turnos</span>
              </button>
            </nav>
          )}

          {/* Right Status & Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Active Client Session Pill */}
            {activeView === 'client' && loggedClient && (
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#141416] border border-white/[0.08] shrink-0">
                <UserCheck className="w-3.5 h-3.5 text-[#D4AF37] stroke-[1.5] shrink-0" />
                <span className="text-xs font-semibold text-[#EDEDED] hidden sm:inline">
                  {loggedClient.firstName || loggedClient.name}
                </span>
                <span className="text-[11px] font-mono text-[#D4AF37] tabular-nums">
                  {loggedClient.points} PTS
                </span>
                <button
                  type="button"
                  onClick={onLogoutClient}
                  className="p-1 text-[#8A898E] hover:text-[#EDEDED] transition-colors"
                  title="Cerrar mi cuenta"
                  aria-label="Cerrar sesión de cliente"
                >
                  <LogOut className="w-3 h-3 stroke-[1.5]" />
                </button>
              </div>
            )}

            {/* Admin Switch Button */}
            {(adminUser || activeView === 'admin') && (
              <button
                type="button"
                onClick={() => setActiveView(activeView === 'admin' ? 'client' : 'admin')}
                className={`relative px-3 py-1.5 rounded-md text-[11px] font-mono uppercase tracking-[0.12em] flex items-center gap-1.5 border transition-all ${
                  activeView === 'admin'
                    ? 'bg-white text-[#0B0B0C] border-white font-bold'
                    : 'bg-[#141416] border-white/[0.08] text-[#8A898E] hover:text-[#EDEDED] hover:border-white/20'
                }`}
              >
                {adminUser ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37] stroke-[1.5]" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-[#D4AF37] stroke-[1.5]" />
                )}
                <span className="hidden sm:inline">
                  {activeView === 'admin' ? 'Salir Panel' : 'Panel David'}
                </span>
                {adminUser && pendingCount > 0 && (
                  <span className="px-1 text-[9px] font-mono font-bold rounded bg-[#D4AF37] text-[#0B0B0C] tabular-nums">
                    {pendingCount}
                  </span>
                )}
              </button>
            )}

            {/* Admin Logout when in Admin View */}
            {activeView === 'admin' && adminUser && (
              <button
                type="button"
                onClick={onLogoutAdmin}
                className="p-2 rounded-md border border-white/[0.08] text-[#8A898E] hover:text-[#EDEDED] transition-colors"
                title="Cerrar sesión de David"
                aria-label="Cerrar sesión de administrador"
              >
                <LogOut className="w-3.5 h-3.5 stroke-[1.5]" />
              </button>
            )}

            {/* Instagram Profile Link */}
            <a
              href="https://www.instagram.com/barber_f4de"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-md border border-white/[0.08] text-[#8A898E] hover:text-[#D4AF37] hover:border-[#D4AF37]/40 transition-all flex items-center justify-center group"
              title="Instagram @barber_f4de"
              aria-label="Abrir Instagram @barber_f4de"
            >
              <InstagramIcon className="w-3.5 h-3.5 text-[#8A898E] group-hover:text-[#D4AF37] transition-colors" />
            </a>
          </div>
        </div>
      </header>

      {/* Mobile Sober Bottom Dock (Strictly 3 tabs, stroke 1.5px, contained radius) */}
      {activeView === 'client' && (
        <nav
          aria-label="Navegación principal móvil"
          className="md:hidden fixed bottom-3 inset-x-3 z-40 p-1 rounded-lg bg-[#141416]/95 backdrop-blur-md border border-white/[0.08] shadow-2xl flex items-center justify-around"
        >
          {/* Tab 1: Mi Pase */}
          <button
            type="button"
            onClick={() => setClientSubTab('club')}
            className={`flex-1 py-2 rounded-md flex flex-col items-center gap-1 transition-all ${
              clientSubTab === 'club'
                ? 'bg-white/[0.08] text-[#EDEDED]'
                : 'text-[#8A898E] hover:text-[#EDEDED]'
            }`}
          >
            <CreditCard
              className={`w-4 h-4 stroke-[1.5] ${clientSubTab === 'club' ? 'text-[#D4AF37]' : ''}`}
            />
            <span className="text-[10px] font-mono tracking-[0.12em] uppercase font-semibold">
              Mi Pase
            </span>
          </button>

          {/* Tab 2: Reservar */}
          <button
            type="button"
            onClick={() => setClientSubTab('book')}
            className={`flex-1 py-2 rounded-md flex flex-col items-center gap-1 transition-all ${
              clientSubTab === 'book'
                ? 'bg-white/[0.08] text-[#EDEDED]'
                : 'text-[#8A898E] hover:text-[#EDEDED]'
            }`}
          >
            <CalendarPlus
              className={`w-4 h-4 stroke-[1.5] ${clientSubTab === 'book' ? 'text-[#D4AF37]' : ''}`}
            />
            <span className="text-[10px] font-mono tracking-[0.12em] uppercase font-semibold">
              Reservar
            </span>
          </button>

          {/* Tab 3: Mis Turnos */}
          <button
            type="button"
            onClick={() => setClientSubTab('turns')}
            className={`flex-1 py-2 rounded-md flex flex-col items-center gap-1 transition-all ${
              clientSubTab === 'turns'
                ? 'bg-white/[0.08] text-[#EDEDED]'
                : 'text-[#8A898E] hover:text-[#EDEDED]'
            }`}
          >
            <Clock
              className={`w-4 h-4 stroke-[1.5] ${clientSubTab === 'turns' ? 'text-[#D4AF37]' : ''}`}
            />
            <span className="text-[10px] font-mono tracking-[0.12em] uppercase font-semibold">
              Turnos
            </span>
          </button>
        </nav>
      )}
    </>
  );
}
