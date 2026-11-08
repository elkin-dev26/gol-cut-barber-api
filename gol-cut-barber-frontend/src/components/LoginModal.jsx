import React, { useState } from 'react';
import { X, Lock, User, ShieldAlert } from 'lucide-react';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const userClean = username.trim().toLowerCase();
    const passClean = password.trim();

    // Mapeo oficial de credenciales y roles
    if (userClean === 'demo-sena' && passClean === 'sena2026') {
      onLoginSuccess({ nombre: 'Auditor SENA', role: 'evaluacion' });
    } else if (userClean === 'demo-cliente' && passClean === 'demo2026') {
      onLoginSuccess({ nombre: 'Sucursal Demo', role: 'sucursal' });
    } else if (userClean === 'admin' && passClean === 'admin123') {
      onLoginSuccess({ nombre: 'Administrador Local', role: 'admin' });
    } else if (userClean === 'elkin-dev26' && passClean === 'elkin2026') {
      onLoginSuccess({ nombre: 'SuperAdmin / Desarrollador', role: 'superadmin' });
    } else if (userClean === 'barbero' && passClean === 'barbero123') {
      onLoginSuccess({ nombre: 'Elkin Ramírez', role: 'barbero' });
    } else {
      setError('Credenciales incorrectas. Verifique usuario y contraseña.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-md w-full p-6 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-amber-400 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-center mx-auto mb-3 text-amber-400">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-amber-400">Iniciar Sesión en Gol Cut Barber</h3>
          <p className="text-xs text-slate-400 mt-1">Ingrese credenciales autorizadas para acceder</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-950/60 border border-rose-500/40 rounded-lg flex items-center gap-2 text-rose-300 text-xs">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Usuario</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ej: demo-sena, admin, elkin-dev26"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Contraseña</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-400"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-lg text-sm transition-all shadow-lg shadow-amber-500/20 mt-2"
          >
            Ingresar al Sistema
          </button>
        </form>
      </div>
    </div>
  );
}