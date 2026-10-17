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
      <header className="sticky top-0 z-40 w-full bg-barber-lightSurface/95 dark:bg-barber-darkBg/95 backdrop-blur-md border-b border-barber-lightBorder dark:border-barber-darkBorder transition-colors">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          {/* Brand Identity */}
          <button
            type="button"
            onClick={() => {
              setActiveView('client');
              setClientSubTab('club');
            }}
            className="flex items-center gap-3 text-left group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-2xl bg-barber-darkSurface dark:bg-barber-darkSurface border border-barber-darkBorder flex items-center justify-center text-barber-chai group-hover:border-barber-chai transition-colors">
              <Scissors className="w-5 h-5 -rotate-45" />
            </div>
            <div>
              <span className="font-display font-bold text-lg tracking-tight text-barber-lightText dark:text-barber-darkText block leading-none">
                DAVID BARBER
              </span>
              <span className="text-xs text-barber-lightMuted dark:text-barber-darkMuted font-medium block mt-0.5">
                Studio &amp; Club Privado
              </span>
            </div>
          </button>

          {/* Desktop Navigation Pills */}
          {activeView === 'client' && (
            <nav className="hidden md:flex items-center gap-1 p-1 rounded-2xl bg-barber-lightBg dark:bg-barber-darkSurface border border-barber-lightBorder dark:border-barber-darkBorder">
              <button
                type="button"
                onClick={() => setClientSubTab('club')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  clientSubTab === 'club'
                    ? 'bg-barber-matcha text-white'
                    : 'text-barber-lightText dark:text-barber-darkText hover:bg-barber-almond/40 dark:hover:bg-barber-darkBorder/60'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Mi Pase &amp; Puntos</span>
              </button>

              <button
                type="button"
                onClick={() => setClientSubTab('book')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  clientSubTab === 'book'
                    ? 'bg-barber-matcha text-white'
                    : 'text-barber-lightText dark:text-barber-darkText hover:bg-barber-almond/40 dark:hover:bg-barber-darkBorder/60'
                }`}
              >
                <CalendarPlus className="w-3.5 h-3.5" />
                <span>Reservar Turno</span>
              </button>

              <button
                type="button"
                onClick={() => setClientSubTab('turns')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  clientSubTab === 'turns'
                    ? 'bg-barber-matcha text-white'
                    : 'text-barber-lightText dark:text-barber-darkText hover:bg-barber-almond/40 dark:hover:bg-barber-darkBorder/60'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Mis Turnos</span>
              </button>
            </nav>
          )}

          {/* Right Status & Controls */}
          <div className="flex items-center gap-2">
            {/* Active Client Session Pill */}
            {activeView === 'client' && loggedClient && (
              <div className="flex items-center gap-2 pl-3 pr-1.5 py-1 rounded-xl bg-barber-lightBg dark:bg-barber-darkSurface border border-barber-lightBorder dark:border-barber-darkBorder">
                <UserCheck className="w-3.5 h-3.5 text-barber-matcha shrink-0" />
                <span className="text-xs font-semibold text-barber-lightText dark:text-barber-darkText hidden sm:inline">
                  {loggedClient.firstName || loggedClient.name}
                </span>
                <span className="text-xs font-mono font-bold text-barber-chai tabular-nums">
                  {loggedClient.points} PTS
                </span>
                <button
                  type="button"
                  onClick={onLogoutClient}
                  className="p-1.5 rounded-lg text-barber-lightMuted dark:text-barber-darkMuted hover:text-barber-lightText dark:hover:text-barber-darkText transition-colors"
                  title="Cerrar mi cuenta"
                  aria-label="Cerrar sesión de cliente"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Discreet Admin Switch Button (Only visible if David is authenticated or in Admin View) */}
            {(adminUser || activeView === 'admin') && (
              <button
                type="button"
                onClick={() => setActiveView(activeView === 'admin' ? 'client' : 'admin')}
                className={`relative px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                  activeView === 'admin'
                    ? 'bg-barber-chai text-barber-lightText border-barber-chai'
                    : 'bg-barber-lightBg dark:bg-barber-darkSurface border-barber-lightBorder dark:border-barber-darkBorder text-barber-lightText dark:text-barber-darkText hover:border-barber-chai'
                }`}
              >
                {adminUser ? (
                  <ShieldCheck className="w-3.5 h-3.5" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-barber-chai" />
                )}
                <span className="hidden sm:inline">
                  {activeView === 'admin' ? 'Volver al Club' : 'Panel David'}
                </span>
                {adminUser && pendingCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-barber-matcha text-white tabular-nums">
                    {pendingCount}
                  </span>
                )}
              </button>
            )}

            {/* Admin Logout Button when in Admin View */}
            {activeView === 'admin' && adminUser && (
              <button
                type="button"
                onClick={onLogoutAdmin}
                className="p-2.5 rounded-xl border border-barber-lightBorder dark:border-barber-darkBorder text-barber-lightMuted dark:text-barber-darkMuted hover:text-barber-lightText dark:hover:text-barber-darkText transition-colors"
                title="Cerrar sesión de David"
                aria-label="Cerrar sesión de administrador"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-barber-lightBorder dark:border-barber-darkBorder text-barber-lightText dark:text-barber-darkText hover:border-barber-matcha transition-colors"
              title={isDark ? 'Modo Claro' : 'Modo Oscuro'}
              aria-label="Cambiar tema de color"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-barber-chai" />
              ) : (
                <Moon className="w-4 h-4 text-barber-carob" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Floating Bottom Dock (Inspired by Reference Club App) */}
      {activeView === 'client' && (
        <nav
          aria-label="Navegación principal móvil"
          className="md:hidden fixed bottom-4 inset-x-4 z-40 p-1.5 rounded-2xl bg-barber-lightSurface/95 dark:bg-barber-darkSurface/95 backdrop-blur-md border border-barber-lightBorder dark:border-barber-darkBorder club-shadow flex items-center justify-around"
        >
          <button
            type="button"
            onClick={() => setClientSubTab('club')}
            className={`flex-1 py-2.5 rounded-xl flex flex-col items-center gap-1 text-[11px] font-semibold transition-all ${
              clientSubTab === 'club'
                ? 'bg-barber-matcha text-white'
                : 'text-barber-lightMuted dark:text-barber-darkMuted'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Mi Pase</span>
          </button>

          <button
            type="button"
            onClick={() => setClientSubTab('book')}
            className={`flex-1 py-2.5 rounded-xl flex flex-col items-center gap-1 text-[11px] font-semibold transition-all ${
              clientSubTab === 'book'
                ? 'bg-barber-matcha text-white'
                : 'text-barber-lightMuted dark:text-barber-darkMuted'
            }`}
          >
            <CalendarPlus className="w-4 h-4" />
            <span>Reservar</span>
          </button>

          <button
            type="button"
            onClick={() => setClientSubTab('turns')}
            className={`flex-1 py-2.5 rounded-xl flex flex-col items-center gap-1 text-[11px] font-semibold transition-all ${
              clientSubTab === 'turns'
                ? 'bg-barber-matcha text-white'
                : 'text-barber-lightMuted dark:text-barber-darkMuted'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Turnos</span>
          </button>

          {adminUser && (
            <button
              type="button"
              onClick={() => setActiveView('admin')}
              className="flex-1 py-2.5 rounded-xl flex flex-col items-center gap-1 text-[11px] font-semibold text-barber-lightMuted dark:text-barber-darkMuted"
            >
              <Lock className="w-4 h-4 text-barber-chai" />
              <span>David</span>
            </button>
          )}
        </nav>
      )}
    </>
  );
}
