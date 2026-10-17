import React, { useState } from 'react';
import { Lock, User, KeyRound, ArrowRight, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';

export default function AdminLogin({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMsg('Ingresá tu usuario y contraseña de barbero.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await api.loginAdmin(username.trim(), password);
      onLoginSuccess(res.admin);
    } catch (err) {
      setErrorMsg(err.message || 'Credenciales inválidas.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="p-7 sm:p-8 rounded-3xl bg-barber-darkSurface border border-barber-darkBorder club-shadow text-barber-darkText space-y-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-barber-chai text-barber-lightText flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-barber-darkText">
              Acceso Barbero
            </h1>
            <p className="text-xs text-barber-pistache">
              Panel exclusivo de gestión para David
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-xs text-red-300 font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="admin-user"
              className="block text-xs font-semibold text-barber-darkText mb-1.5 flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-barber-chai" />
              <span>Usuario</span>
            </label>
            <input
              id="admin-user"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="david"
              className="w-full px-4 py-3.5 rounded-2xl bg-barber-darkBg border border-barber-darkBorder text-barber-darkText placeholder-barber-pistache text-sm font-mono focus:outline-none focus:border-barber-chai"
            />
          </div>

          <div>
            <label
              htmlFor="admin-pass"
              className="block text-xs font-semibold text-barber-darkText mb-1.5 flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5 text-barber-chai" />
              <span>Contraseña</span>
            </label>
            <input
              id="admin-pass"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3.5 rounded-2xl bg-barber-darkBg border border-barber-darkBorder text-barber-darkText placeholder-barber-pistache text-sm font-mono focus:outline-none focus:border-barber-chai"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-2xl bg-barber-chai text-barber-lightText font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:brightness-105 transition-all"
          >
            <span>{isLoading ? 'Verificando acceso...' : 'Entrar al Panel de David'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Quick Login */}
        <div className="pt-4 border-t border-barber-darkBorder flex items-center justify-between text-xs text-barber-pistache">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-barber-matcha" />
            Sesión protegida con JWT
          </span>
          <button
            type="button"
            onClick={() => {
              setUsername('david');
              setPassword('barber2026');
            }}
            className="font-mono text-barber-chai font-semibold hover:underline"
          >
            Cargar clave demo (david / barber2026)
          </button>
        </div>
      </div>
    </div>
  );
}
