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
  KeyRound
} from 'lucide-react';
import { api } from '../../services/api';

export default function DniStep({
  loggedClient,
  onAuthSuccess,
  onLogoutClient,
  onContinue
}) {
  const [dniInput, setDniInput] = useState('');
  const [checkResult, setCheckResult] = useState(null); // { exists, dni, hasPin, maskedName, phoneHint }
  const [pinInput, setPinInput] = useState('');
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
      <div className="p-6 sm:p-7 rounded-3xl bg-barber-lightSurface dark:bg-barber-darkSurface border border-barber-lightBorder dark:border-barber-darkBorder club-shadow space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-barber-matcha text-white flex items-center justify-center">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-barber-lightText dark:text-barber-darkText">
                {loggedClient.firstName || loggedClient.name} {loggedClient.lastName || ''}
              </h2>
              <p className="text-xs font-mono text-barber-lightMuted dark:text-barber-darkMuted tabular-nums">
                DNI {loggedClient.dni} • {loggedClient.phone}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogoutClient}
            className="px-3 py-2 rounded-xl border border-barber-lightBorder dark:border-barber-darkBorder text-xs font-semibold text-barber-lightMuted dark:text-barber-darkMuted hover:text-barber-lightText dark:hover:text-barber-darkText flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Otro DNI</span>
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-barber-lightBg dark:bg-barber-darkBg border border-barber-lightBorder dark:border-barber-darkBorder flex items-center justify-between text-xs">
          <span className="text-barber-lightMuted dark:text-barber-darkMuted font-medium flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-barber-matcha" />
            Cuenta verificada con PIN personal
          </span>
          <span className="font-mono font-bold text-barber-chai tabular-nums">
            {loggedClient.points} PTS • {loggedClient.totalCuts} CORTES
          </span>
        </div>

        {onContinue && (
          <button
            type="button"
            onClick={onContinue}
            className="w-full py-4 rounded-2xl bg-white text-[#0A0A0A] font-display font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-neutral-200 transition-all shadow-md"
          >
            <span>Elegir servicio y horario</span>
            <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
          </button>
        )}
      </div>
    );
  }

  // Step 1: Check DNI
  const handleCheckDni = async (e) => {
    if (e) e.preventDefault();
    const cleanDni = dniInput.trim().replace(/\D/g, '');
    if (cleanDni.length < 6) {
      setErrorMsg('Ingresá un número de DNI válido (mínimo 6 dígitos).');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await api.checkDni(cleanDni);
      setCheckResult(res);
      setPinInput('');
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo verificar el DNI.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2A: Login with PIN
  const handleLoginPin = async (e) => {
    e.preventDefault();
    if (pinInput.trim().length < 4) {
      setErrorMsg('Ingresá tu PIN de 4 dígitos.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await api.loginClient(checkResult.dni, pinInput.trim());
      onAuthSuccess(res.client, res.appointments || []);
      if (onContinue) onContinue();
    } catch (err) {
      setErrorMsg(err.message || 'PIN incorrecto.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2B: Register new client with PIN
  const handleRegister = async (e) => {
    e.preventDefault();
    const cleanPin = newPin.trim().replace(/\D/g, '');
    if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
      setErrorMsg('Completá Nombre, Apellido y WhatsApp.');
      return;
    }
    if (cleanPin.length !== 4) {
      setErrorMsg('Creá un PIN numérico de 4 dígitos (ej: 1234) para proteger tu DNI.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await api.registerClient({
        dni: checkResult.dni,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        birthDate,
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
    <div className="p-4 sm:p-7 rounded-3xl bg-barber-lightSurface dark:bg-barber-darkSurface border border-barber-lightBorder dark:border-barber-darkBorder club-shadow space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-display font-bold text-barber-lightText dark:text-barber-darkText">
          Identificación de socio
        </h2>
        <p className="text-xs sm:text-sm text-barber-lightMuted dark:text-barber-darkMuted mt-1">
          Tu cuenta está protegida con tu DNI y un PIN de 4 dígitos para que nadie más pueda usar tu nombre ni tus puntos.
        </p>
      </div>

      {/* DNI Input Form */}
      <form onSubmit={handleCheckDni} className="space-y-3">
        <label
          htmlFor="dni-input"
          className="block text-xs font-semibold text-barber-lightText dark:text-barber-darkText"
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
            className="w-full flex-1 min-w-0 px-4 py-3 sm:py-3.5 rounded-2xl bg-barber-lightBg dark:bg-barber-darkBg border border-barber-lightBorder dark:border-barber-darkBorder text-barber-lightText dark:text-barber-darkText placeholder-barber-lightMuted dark:placeholder-barber-darkMuted text-base font-mono tracking-wider tabular-nums focus:outline-none focus:border-white"
          />
          <button
            type="submit"
            disabled={isLoading || dniInput.length < 6}
            className="w-full sm:w-auto px-6 py-3 sm:py-3.5 rounded-2xl bg-white text-[#0A0A0A] font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-neutral-200 disabled:opacity-40 transition-all shrink-0 shadow-md"
          >
            <Search className="w-4 h-4 text-[#D4AF37]" />
            <span>Validar</span>
          </button>
        </div>

        {/* Demo Quick Fill Button */}
        {!checkResult && (
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1 text-xs text-barber-lightMuted dark:text-barber-darkMuted">
            <span className="w-full sm:w-auto text-[11px] uppercase tracking-wider font-semibold opacity-70">Demo rápido:</span>
            <button
              type="button"
              onClick={() => {
                setDniInput('40123456');
                api.checkDni('40123456').then(setCheckResult);
                setPinInput('1234');
              }}
              className="px-2.5 py-1 rounded-lg bg-barber-lightBg dark:bg-barber-darkBg border border-barber-lightBorder dark:border-barber-darkBorder font-mono text-[11px] sm:text-xs text-barber-chai font-semibold hover:border-barber-chai transition-colors truncate max-w-full"
            >
              Lucas (DNI 40123456 • PIN 1234)
            </button>
            <button
              type="button"
              onClick={() => {
                setDniInput('38999888');
                api.checkDni('38999888').then(setCheckResult);
                setPinInput('1234');
              }}
              className="px-2.5 py-1 rounded-lg bg-barber-lightBg dark:bg-barber-darkBg border border-barber-lightBorder dark:border-barber-darkBorder font-mono text-[11px] sm:text-xs text-barber-chai font-semibold hover:border-barber-chai transition-colors truncate max-w-full"
            >
              Mateo (10 PTS • PIN 1234)
            </button>
          </div>
        )}
      </form>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-600 dark:text-red-300 font-medium">
          {errorMsg}
        </div>
      )}

      {/* CASE A: Existing Client -> Ask for 4-digit PIN */}
      {checkResult && checkResult.exists && (
        <form
          onSubmit={handleLoginPin}
          className="pt-4 border-t border-barber-lightBorder dark:border-barber-darkBorder space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-barber-chai" />
              <span className="text-sm font-bold text-barber-lightText dark:text-barber-darkText">
                Hola, {checkResult.maskedName}
              </span>
            </div>
            <span className="text-xs font-mono text-barber-lightMuted dark:text-barber-darkMuted">
              Celular {checkResult.phoneHint}
            </span>
          </div>

          <div>
            <label
              htmlFor="pin-login-input"
              className="block text-xs font-semibold text-barber-lightText dark:text-barber-darkText mb-1.5"
            >
              Ingresá tu PIN personal de 4 dígitos
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
              className="w-full px-4 py-3.5 rounded-2xl bg-barber-lightBg dark:bg-barber-darkBg border border-barber-lightBorder dark:border-barber-darkBorder text-barber-lightText dark:text-barber-darkText text-center text-2xl font-mono tracking-[0.5em] focus:outline-none focus:border-barber-matcha"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || pinInput.length < 4}
            className="w-full py-4 rounded-2xl bg-white text-[#0A0A0A] font-display font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-neutral-200 disabled:opacity-40 transition-all shadow-md"
          >
            <span>Entrar a mi cuenta</span>
            <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
          </button>

          <div className="flex items-center justify-between pt-1 text-xs">
            <span className="text-barber-lightMuted dark:text-barber-darkMuted">
              PIN de cuentas demo: <strong className="font-mono text-barber-chai">1234</strong>
            </span>
            <button
              type="button"
              onClick={handleForgotPin}
              className="text-barber-matcha font-semibold hover:underline flex items-center gap-1"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Olvidé mi PIN</span>
            </button>
          </div>
        </form>
      )}

      {/* CASE B: New Client -> Register Data + Choose 4-digit PIN */}
      {checkResult && !checkResult.exists && (
        <form
          onSubmit={handleRegister}
          className="pt-4 border-t border-barber-lightBorder dark:border-barber-darkBorder space-y-4"
        >
          <div className="flex items-center gap-2.5">
            <UserPlus className="w-4 h-4 text-barber-chai" />
            <h3 className="text-base font-display font-bold text-barber-lightText dark:text-barber-darkText">
              Activá tu pase de socio (DNI {checkResult.dni})
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-barber-lightText dark:text-barber-darkText mb-1">
                Nombre *
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Agustín"
                className="w-full px-3.5 py-3 rounded-xl bg-barber-lightBg dark:bg-barber-darkBg border border-barber-lightBorder dark:border-barber-darkBorder text-barber-lightText dark:text-barber-darkText placeholder-barber-lightMuted dark:placeholder-barber-darkMuted text-sm focus:outline-none focus:border-barber-matcha"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-barber-lightText dark:text-barber-darkText mb-1">
                Apellido *
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Gómez"
                className="w-full px-3.5 py-3 rounded-xl bg-barber-lightBg dark:bg-barber-darkBg border border-barber-lightBorder dark:border-barber-darkBorder text-barber-lightText dark:text-barber-darkText placeholder-barber-lightMuted dark:placeholder-barber-darkMuted text-sm focus:outline-none focus:border-barber-matcha"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-barber-lightText dark:text-barber-darkText mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-barber-matcha" />
                <span>WhatsApp *</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+54 9 11 5555-1234"
                className="w-full px-3.5 py-3 rounded-xl bg-barber-lightBg dark:bg-barber-darkBg border border-barber-lightBorder dark:border-barber-darkBorder text-barber-lightText dark:text-barber-darkText placeholder-barber-lightMuted dark:placeholder-barber-darkMuted text-sm font-mono focus:outline-none focus:border-barber-matcha"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-barber-lightText dark:text-barber-darkText mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-barber-chai" />
                <span>Fecha de Nacimiento *</span>
              </label>
              <input
                type="date"
                required
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl bg-barber-lightBg dark:bg-barber-darkBg border border-barber-lightBorder dark:border-barber-darkBorder text-barber-lightText dark:text-barber-darkText text-sm focus:outline-none focus:border-barber-matcha"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-barber-lightText dark:text-barber-darkText mb-1 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-barber-chai" />
              <span>Elegí tu PIN de seguridad (4 números) *</span>
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              required
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="Ej: 2580"
              className="w-full px-4 py-3 rounded-xl bg-barber-lightBg dark:bg-barber-darkBg border border-barber-lightBorder dark:border-barber-darkBorder text-barber-lightText dark:text-barber-darkText placeholder-barber-lightMuted dark:placeholder-barber-darkMuted text-base font-mono tracking-widest focus:outline-none focus:border-barber-matcha"
            />
            <p className="text-xs text-barber-lightMuted dark:text-barber-darkMuted mt-1">
              Con este PIN nadie más podrá entrar con tu DNI ni usar tus puntos.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-2xl bg-white text-[#0A0A0A] font-display font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-neutral-200 disabled:opacity-40 transition-all shadow-md"
          >
            <span>Crear cuenta y reservar</span>
            <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
          </button>
        </form>
      )}
    </div>
  );
}
