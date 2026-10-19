import React, { useState } from 'react';
import {
  Search,
  Lock,
  UserCheck,
  UserPlus,
  Phone,
  Calendar,
  ArrowRight,
  MessageCircle,
  ShieldCheck,
  RotateCcw,
  KeyRound,
  Eye,
  EyeOff,
  Shield,
  Sparkles
} from 'lucide-react';
import { api } from '../../services/api';
import SpotlightCard from '../common/SpotlightCard';

export default function DniStep({
  loggedClient,
  onAuthSuccess,
  onLogoutClient,
  onContinue,
  onAdminAuthSuccess,
  guestMode = 'socio',
  setGuestMode
}) {
  const [dniInput, setDniInput] = useState('');
  const [checkResult, setCheckResult] = useState(null); // { exists, dni, hasPin, maskedName, phoneHint, isAdmin }
  const [pinInput, setPinInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // First-time registration fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [newPin, setNewPin] = useState('');

  // If client already has an active JWT session
  if (loggedClient) {
    return (
      <div className="card-hairline rounded-lg p-5 sm:p-6 text-[#EDEDED] space-y-5 animate-enter">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-[#101012] border border-white/[0.08] text-[#D4AF37] flex items-center justify-center">
              <UserCheck className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <span className="micro-technical block text-[9px] text-[#8A898E]">
                SESIÓN ACTIVA
              </span>
              <h2 className="text-base sm:text-lg font-display font-bold text-[#EDEDED] leading-tight">
                {loggedClient.firstName || loggedClient.name} {loggedClient.lastName || ''}
              </h2>
              <p className="text-[11px] font-mono text-[#8A898E] tabular-nums mt-0.5">
                DNI {loggedClient.dni} • {loggedClient.phone}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogoutClient}
            className="px-2.5 py-1.5 rounded-md border border-white/[0.08] text-[10px] font-mono tracking-wider uppercase text-[#8A898E] hover:text-[#EDEDED] hover:border-white/20 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3 h-3 stroke-[1.5]" />
            <span>Cambiar</span>
          </button>
        </div>

        <div className="p-3.5 rounded-md bg-[#101012] border border-white/[0.06] flex items-center justify-between text-xs">
          <span className="text-[#8A898E] flex items-center gap-2 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37] stroke-[1.5]" />
            Cuenta verificada con PIN
          </span>
          <span className="font-mono font-bold text-[#D4AF37] text-[11px] tabular-nums">
            {loggedClient.points} PTS • {loggedClient.totalCuts} CORTES
          </span>
        </div>

        {onContinue && (
          <button
            type="button"
            onClick={onContinue}
            className="w-full py-3.5 rounded-md bg-[#EDEDED] hover:bg-white text-[#0B0B0C] font-mono font-bold text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98]"
          >
            <span>Elegir servicio y horario</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
          </button>
        )}
      </div>
    );
  }

  // Step 1: Check DNI
  const handleCheckDni = async (e) => {
    if (e) e.preventDefault();
    const cleanDni = dniInput.trim().replace(/\D/g, '') || dniInput.trim().toLowerCase();
    if (cleanDni.length < 4) {
      setErrorMsg('Ingresá un número de DNI válido.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await api.checkDni(cleanDni);
      setCheckResult(res);
      setPinInput('');
      setPasswordInput('');
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo verificar el DNI.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2A (David Admin): Login with Password
  const handleLoginAdminPassword = async (e) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      setErrorMsg('Ingresá tu contraseña de administrador.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await api.loginAdmin(checkResult?.dni || 'david', passwordInput.trim());
      if (onAdminAuthSuccess) {
        onAdminAuthSuccess(res.admin);
      } else if (onAuthSuccess) {
        onAuthSuccess(res.admin, [], true);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Contraseña de administrador incorrecta.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2B: Regular Client -> Login with PIN
  const handleLoginPin = async (e) => {
    e.preventDefault();
    if (pinInput.trim().length < 4) {
      setErrorMsg('Ingresá tu PIN de 4 dígitos.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await api.loginClientWithPin(checkResult.dni, pinInput.trim());
      onAuthSuccess(res.client, res.appointments || []);
      if (onContinue) onContinue();
    } catch (err) {
      setErrorMsg(err.message || 'PIN incorrecto.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2C: Register new client with PIN (from checkResult or direct 'Primera vez')
  const handleRegister = async (e) => {
    e.preventDefault();
    const cleanDni = (checkResult?.dni || dniInput).trim().replace(/\D/g, '');
    const cleanPin = newPin.trim().replace(/\D/g, '');
    if (cleanDni.length < 6) {
      setErrorMsg('Ingresá un número de DNI válido (mínimo 6 dígitos).');
      return;
    }
    if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
      setErrorMsg('Completá Nombre, Apellido y WhatsApp.');
      return;
    }
    if (cleanPin.length !== 4) {
      setErrorMsg('Creá un PIN numérico de 4 dígitos para proteger tu cuenta.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await api.registerClient({
        dni: cleanDni,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        birthDate: birthDate || undefined,
        pin: cleanPin
      });
      onAuthSuccess(res.client, res.appointments || []);
      if (onContinue) onContinue();
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo crear la cuenta.');
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot PIN -> WhatsApp Recovery with David
  const handleForgotPin = async () => {
    if (!checkResult?.dni) return;
    try {
      const res = await api.getRecoveryLink(checkResult.dni);
      if (res.whatsappUrl) {
        window.open(res.whatsappUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      setErrorMsg('No se pudo abrir WhatsApp.');
    }
  };

  return (
    <SpotlightCard className="p-5 sm:p-6 text-[#EDEDED] space-y-5 animate-enter">
      <div>
        <span className="micro-technical block text-[9px] text-[#8A898E]">
          01 / 02 AUTENTICACIÓN · PRIVADA
        </span>
        <h2 className="text-lg sm:text-xl font-display font-bold text-[#EDEDED] mt-0.5">
          Identificación de{' '}
          <span className="font-editorial italic font-normal text-[#D4AF37]">
            socio
          </span>
        </h2>
        <p className="text-xs text-[#8A898E] mt-1">
          Tu cuenta está protegida con tu DNI y un PIN de 4 dígitos para resguardar tus visitas y puntos.
        </p>
      </div>

      {/* 2-State Segmented Control: [ Ya soy socio ] / [ Primera vez ] */}
      <div className="grid grid-cols-2 p-1 rounded-md bg-[#101012] border border-white/[0.08] text-xs font-mono">
        <button
          type="button"
          onClick={() => {
            if (setGuestMode) setGuestMode('socio');
            setErrorMsg('');
          }}
          className={`py-2 px-3 rounded text-center transition-all flex items-center justify-center gap-1.5 ${
            guestMode === 'socio'
              ? 'bg-[#EDEDED] text-[#0B0B0C] font-bold shadow-sm'
              : 'text-[#8A898E] hover:text-[#EDEDED]'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5 stroke-[1.5]" />
          <span>Ya soy socio</span>
        </button>
        <button
          type="button"
          onClick={() => {
            if (setGuestMode) setGuestMode('primera_vez');
            setErrorMsg('');
          }}
          className={`py-2 px-3 rounded text-center transition-all flex items-center justify-center gap-1.5 ${
            guestMode === 'primera_vez'
              ? 'bg-[#EDEDED] text-[#0B0B0C] font-bold shadow-sm'
              : 'text-[#8A898E] hover:text-[#EDEDED]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] stroke-[1.5]" />
          <span>Primera vez</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-mono">
          {errorMsg}
        </div>
      )}

      {/* VIEW A: YA SOY SOCIO */}
      {guestMode === 'socio' && (
        <div className="space-y-4">
          {/* DNI Input Form */}
          <form onSubmit={handleCheckDni} className="space-y-3">
            <label
              htmlFor="dni-input"
              className="micro-technical block text-[10px] text-[#8A898E]"
            >
              Número de DNI (sin puntos)
            </label>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                id="dni-input"
                type="tel"
                inputMode="numeric"
                value={dniInput}
                onChange={(e) => {
                  setDniInput(e.target.value.replace(/\D/g, ''));
                  setCheckResult(null);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Ingresá tu DNI (ej: 40123456)"
                className="w-full flex-1 min-w-0 px-3.5 py-3 rounded-md bg-[#101012] border border-white/[0.08] text-[#EDEDED] placeholder-[#8A898E]/40 text-sm font-mono tracking-wider tabular-nums focus:outline-none focus:border-[#D4AF37] transition-colors"
              />
              <button
                type="submit"
                disabled={isLoading || dniInput.length < 4}
                className="w-full sm:w-auto px-5 py-3 rounded-md bg-[#EDEDED] hover:bg-white text-[#0B0B0C] font-mono text-xs font-bold uppercase tracking-[0.15em] flex items-center justify-center gap-2 disabled:opacity-40 transition-all shrink-0 active:scale-[0.98]"
              >
                <Search className="w-3.5 h-3.5 text-[#0B0B0C] stroke-[2]" />
                <span>Validar DNI</span>
              </button>
            </div>

            {/* Demo Quick Fill */}
            {!checkResult && (
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1 text-xs">
                <span className="micro-technical text-[9px] text-[#8A898E]">Demo rápido:</span>
                <button
                  type="button"
                  onClick={() => {
                    setDniInput('40123456');
                    api.checkDni('40123456').then(setCheckResult);
                    setPinInput('1234');
                  }}
                  className="px-2 py-0.5 rounded bg-[#101012] border border-white/[0.06] hover:border-[#D4AF37]/50 font-mono text-[10px] text-[#8A898E] hover:text-[#EDEDED] transition-colors"
                >
                  Lucas (40123456 • PIN 1234)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDniInput('38999888');
                    api.checkDni('38999888').then(setCheckResult);
                    setPinInput('1234');
                  }}
                  className="px-2 py-0.5 rounded bg-[#101012] border border-white/[0.06] hover:border-[#D4AF37]/50 font-mono text-[10px] text-[#8A898E] hover:text-[#EDEDED] transition-colors"
                >
                  Mateo (10 PTS • PIN 1234)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDniInput('11111111');
                    api.checkDni('11111111').then(setCheckResult);
                    setPasswordInput('barber2026');
                  }}
                  className="px-2 py-0.5 rounded bg-[#101012] border border-white/[0.06] hover:border-[#D4AF37]/50 font-mono text-[10px] text-[#D4AF37] hover:text-white transition-colors"
                >
                  David Admin (DNI 11111111)
                </button>
              </div>
            )}
          </form>

          {/* CASE A: David (Admin) -> Password Form instead of 4-digit PIN */}
          {checkResult && checkResult.isAdmin && (
            <form
              onSubmit={handleLoginAdminPassword}
              className="pt-4 border-t border-white/[0.08] space-y-4 animate-enter"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#D4AF37] stroke-[1.5]" />
                  <span className="text-xs font-display font-bold text-[#EDEDED]">
                    {checkResult.maskedName || 'David (Administrador)'}
                  </span>
                </div>
                <span className="badge-champagne text-[9px]">
                  PANEL DAVID
                </span>
              </div>

              <p className="text-xs text-[#8A898E] leading-relaxed">
                Se detectó tu cuenta de barbero administrador. Por seguridad, ingresá tu contraseña de acceso:
              </p>

              <div>
                <label
                  htmlFor="admin-password-input"
                  className="micro-technical block text-[9px] text-[#8A898E] mb-1.5"
                >
                  CONTRASEÑA DE SEGURIDAD
                </label>
                <div className="relative">
                  <input
                    id="admin-password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="Ingresá tu contraseña de barbero"
                    className="w-full px-4 py-3 rounded-md bg-[#101012] border border-white/[0.08] text-[#EDEDED] text-sm font-mono tracking-wider focus:outline-none focus:border-[#D4AF37] transition-colors pr-10"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A898E] hover:text-[#EDEDED] transition-colors p-1"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 stroke-[1.5]" />
                    ) : (
                      <Eye className="w-4 h-4 stroke-[1.5]" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !passwordInput.trim()}
                className="w-full py-3.5 rounded-md bg-[#EDEDED] hover:bg-white text-[#0B0B0C] font-mono text-xs font-bold uppercase tracking-[0.15em] flex items-center justify-center gap-2 disabled:opacity-40 transition-all shadow-sm active:scale-[0.98]"
              >
                <span>Ingresar al Panel David</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
              </button>

              <div className="pt-1 text-[10px] font-mono text-[#8A898E]">
                Clave predeterminada: <strong className="text-[#D4AF37]">barber2026</strong>
              </div>
            </form>
          )}

          {/* CASE B: Existing Client -> Ask for 4-digit PIN */}
          {checkResult && checkResult.exists && !checkResult.isAdmin && (
            <form
              onSubmit={handleLoginPin}
              className="pt-4 border-t border-white/[0.08] space-y-4 animate-enter"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-[#D4AF37] stroke-[1.5]" />
                  <span className="text-xs font-display font-bold text-[#EDEDED]">
                    Hola, {checkResult.maskedName}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#8A898E]">
                  Celular {checkResult.phoneHint}
                </span>
              </div>

              <div>
                <label
                  htmlFor="pin-login-input"
                  className="micro-technical block text-[9px] text-[#8A898E] mb-1.5"
                >
                  PIN PERSONAL (4 DÍGITOS)
                </label>
                <input
                  id="pin-login-input"
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4));
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="••••"
                  className="w-full px-4 py-3 rounded-md bg-[#101012] border border-white/[0.08] text-[#EDEDED] text-center text-xl font-mono tracking-[0.5em] focus:outline-none focus:border-[#D4AF37] transition-colors"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || pinInput.length < 4}
                className="w-full py-3.5 rounded-md bg-[#EDEDED] hover:bg-white text-[#0B0B0C] font-mono text-xs font-bold uppercase tracking-[0.15em] flex items-center justify-center gap-2 disabled:opacity-40 transition-all shadow-sm active:scale-[0.98]"
              >
                <span>Entrar a mi cuenta</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
              </button>

              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-[10px] font-mono text-[#8A898E]">
                  PIN demo: <strong className="text-[#D4AF37]">1234</strong>
                </span>
                <button
                  type="button"
                  onClick={handleForgotPin}
                  className="text-[#D4AF37] text-[11px] font-mono hover:underline flex items-center gap-1"
                >
                  <MessageCircle className="w-3 h-3 stroke-[1.5]" />
                  <span>Olvidé mi PIN</span>
                </button>
              </div>
            </form>
          )}

          {/* CASE C: DNI verified but not registered yet */}
          {checkResult && !checkResult.exists && !checkResult.isAdmin && (
            <form
              onSubmit={handleRegister}
              className="pt-4 border-t border-white/[0.08] space-y-4 animate-enter"
            >
              <div className="flex items-center gap-2">
                <UserPlus className="w-3.5 h-3.5 text-[#D4AF37] stroke-[1.5]" />
                <h3 className="text-xs font-mono uppercase tracking-[0.12em] font-bold text-[#EDEDED]">
                  Activar Pase de Socio (DNI {checkResult.dni})
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="micro-technical block text-[9px] text-[#8A898E] mb-1">
                    NOMBRE *
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Agustín"
                    className="w-full px-3 py-2.5 rounded-md bg-[#101012] border border-white/[0.08] text-[#EDEDED] placeholder-[#8A898E]/40 text-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="micro-technical block text-[9px] text-[#8A898E] mb-1">
                    APELLIDO *
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Gómez"
                    className="w-full px-3 py-2.5 rounded-md bg-[#101012] border border-white/[0.08] text-[#EDEDED] placeholder-[#8A898E]/40 text-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="micro-technical block text-[9px] text-[#8A898E] mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#D4AF37]" />
                    <span>WHATSAPP *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+54 9 341 555-1234"
                    className="w-full px-3 py-2.5 rounded-md bg-[#101012] border border-white/[0.08] text-[#EDEDED] placeholder-[#8A898E]/40 text-xs font-mono focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="micro-technical block text-[9px] text-[#8A898E] mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#D4AF37]" />
                    <span>FECHA DE NACIMIENTO</span>
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-md bg-[#101012] border border-white/[0.08] text-[#EDEDED] text-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="micro-technical block text-[9px] text-[#8A898E] mb-1 flex items-center gap-1">
                  <KeyRound className="w-3 h-3 text-[#D4AF37]" />
                  <span>CREÁ TU PIN DE 4 DÍGITOS *</span>
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  required
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="Ej: 2580"
                  className="w-full px-3 py-2.5 rounded-md bg-[#101012] border border-white/[0.08] text-[#EDEDED] text-xs font-mono tracking-widest focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-md bg-[#EDEDED] hover:bg-white text-[#0B0B0C] font-mono text-xs font-bold uppercase tracking-[0.15em] flex items-center justify-center gap-2 disabled:opacity-40 transition-all shadow-sm active:scale-[0.98]"
              >
                <span>Crear cuenta y activar pase</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
              </button>
            </form>
          )}
        </div>
      )}

      {/* VIEW B: PRIMERA VEZ (Registro Directo para desbloquear Pase) */}
      {guestMode === 'primera_vez' && (
        <form
          onSubmit={handleRegister}
          className="space-y-4 animate-enter"
        >
          <div className="p-3.5 rounded-md bg-[#101012] border border-white/[0.06] flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
            <p className="text-xs text-[#8A898E] leading-relaxed">
              Completá tus datos una sola vez para activar tu <strong className="text-[#EDEDED]">Pase de Socio Black</strong> y sumar puntos desde hoy.
            </p>
          </div>

          <div>
            <label
              htmlFor="dni-reg-input"
              className="micro-technical block text-[9px] text-[#8A898E] mb-1"
            >
              NÚMERO DE DNI (SIN PUNTOS) *
            </label>
            <input
              id="dni-reg-input"
              type="tel"
              inputMode="numeric"
              required
              value={dniInput}
              onChange={(e) => setDniInput(e.target.value.replace(/\D/g, ''))}
              placeholder="Ej: 42123456"
              className="w-full px-3.5 py-2.5 rounded-md bg-[#101012] border border-white/[0.08] text-[#EDEDED] placeholder-[#8A898E]/40 text-xs font-mono tracking-wider tabular-nums focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="micro-technical block text-[9px] text-[#8A898E] mb-1">
                NOMBRE *
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Agustín"
                className="w-full px-3 py-2.5 rounded-md bg-[#101012] border border-white/[0.08] text-[#EDEDED] placeholder-[#8A898E]/40 text-xs focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="micro-technical block text-[9px] text-[#8A898E] mb-1">
                APELLIDO *
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Gómez"
                className="w-full px-3 py-2.5 rounded-md bg-[#101012] border border-white/[0.08] text-[#EDEDED] placeholder-[#8A898E]/40 text-xs focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="micro-technical block text-[9px] text-[#8A898E] mb-1 flex items-center gap-1">
                <Phone className="w-3 h-3 text-[#D4AF37]" />
                <span>WHATSAPP *</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+54 9 341 555-1234"
                className="w-full px-3 py-2.5 rounded-md bg-[#101012] border border-white/[0.08] text-[#EDEDED] placeholder-[#8A898E]/40 text-xs font-mono focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="micro-technical block text-[9px] text-[#8A898E] mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#D4AF37]" />
                <span>FECHA DE NACIMIENTO</span>
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-md bg-[#101012] border border-white/[0.08] text-[#EDEDED] text-xs focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div>
            <label className="micro-technical block text-[9px] text-[#8A898E] mb-1 flex items-center gap-1">
              <KeyRound className="w-3 h-3 text-[#D4AF37]" />
              <span>CREÁ TU PIN DE 4 DÍGITOS *</span>
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              required
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="Ej: 2580"
              className="w-full px-3 py-2.5 rounded-md bg-[#101012] border border-white/[0.08] text-[#EDEDED] text-xs font-mono tracking-widest focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-md bg-[#EDEDED] hover:bg-white text-[#0B0B0C] font-mono text-xs font-bold uppercase tracking-[0.15em] flex items-center justify-center gap-2 disabled:opacity-40 transition-all shadow-sm active:scale-[0.98]"
          >
            <span>Activar membresía y reservar</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
          </button>
        </form>
      )}
    </SpotlightCard>
  );
}
