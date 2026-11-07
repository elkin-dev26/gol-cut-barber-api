import React, { useState } from 'react';
import { Lock, User, Key, X, ShieldAlert } from 'lucide-react';

export default function LoginModal({ isOpen, onClose, onLoginSuccess, targetRole, adminCredentials }) {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e) => {
    e.preventDefault();
    
    if (targetRole === 'superadmin' && user === 'elkin-dev26' && password === 'Dev2026*') {
      onLoginSuccess('superadmin');
      setError('');
      onClose();
    } else if (
      targetRole === 'admin' && 
      user === adminCredentials.usuario && 
      password === adminCredentials.clave
    ) {
      onLoginSuccess('admin');
      setError('');
      onClose();
    } else {
      setError(
        targetRole === 'superadmin'
          ? 'Credenciales SuperAdmin incorrectas (elkin-dev26 / Dev2026*)'
          : `Credenciales incorrectas. Usa (${adminCredentials.usuario} / ${adminCredentials.clave})`
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#262626] border border-[#d4af37]/40 w-full max-w-md rounded-xl p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="bg-[#d4af37] p-2 rounded-lg text-black">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#d4af37]">
              {targetRole === 'superadmin' ? 'Acceso SuperAdmin / Dev' : 'Acceso Administrador'}
            </h3>
            <p className="text-xs text-gray-400">Ingresa tus credenciales requeridas</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-900/50 border border-rose-500 text-rose-200 text-xs rounded-lg flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Usuario ID</label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              <input
                type="text"
                required
                placeholder={targetRole === 'superadmin' ? 'elkin-dev26' : adminCredentials.usuario}
                value={user}
                onChange={(e) => setUser(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-gray-700 focus:border-[#d4af37] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Contraseña</label>
            <div className="relative">
              <Key className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-gray-700 focus:border-[#d4af37] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#d4af37] hover:bg-[#b89628] text-black font-bold py-3 rounded-lg transition-all text-sm mt-2 shadow-lg"
          >
            Validar e Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
}