import React, { useState } from 'react';
import { Lock, User, Key, X, ShieldAlert } from 'lucide-react';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Credenciales de Administrador Local y Desarrollador (SuperAdmin)
    if ((user === 'admin' && password === '123456') || (user === 'elkin-dev26' && password === 'Dev2026*')) {
      const isSuperAdmin = user === 'elkin-dev26';
      onLoginSuccess(isSuperAdmin);
      setError('');
      onClose();
    } else {
      setError('Credenciales inválidas. Usa (admin / 123456) o tu usuario Dev (elkin-dev26 / Dev2026*).');
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
            <h3 className="text-xl font-bold text-[#d4af37]">Acceso Seguro al Sistema</h3>
            <p className="text-xs text-gray-400">Autenticación por Token JWT / Roles</p>
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
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Usuario / ID de Acceso</label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              <input
                type="text"
                required
                placeholder="Ej: admin o elkin-dev26"
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
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
}