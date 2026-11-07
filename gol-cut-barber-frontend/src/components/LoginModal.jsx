import React, { useState } from 'react';
import { Lock, User, Key, X, AlertCircle } from 'lucide-react';

export default function LoginModal({ isOpen, onClose, onLoginSuccess, targetRole }) {
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const userClean = usuario.trim().toLowerCase();

    if (targetRole === 'demo-sena') {
      if (userClean === 'demo-sena' && clave === 'sena2026') {
        onLoginSuccess('demo-sena');
        onClose();
        setUsuario('');
        setClave('');
      } else {
        setError('Credenciales incorrectas para Perfil Evaluación.');
      }
    } else if (targetRole === 'demo-cliente') {
      if (userClean === 'demo-cliente' && clave === 'demo2026') {
        onLoginSuccess('demo-cliente');
        onClose();
        setUsuario('');
        setClave('');
      } else {
        setError('Credenciales incorrectas para Perfil Demostración.');
      }
    } else if (targetRole === 'admin') {
      if (userClean === 'admin' && clave === 'admin123') {
        onLoginSuccess('admin');
        onClose();
        setUsuario('');
        setClave('');
      } else {
        setError('Credenciales Admin incorrectas.');
      }
    } else if (targetRole === 'superadmin') {
      if (usuario.trim() === 'elkin-dev26' && clave === 'elkin2026') {
        onLoginSuccess('superadmin');
        onClose();
        setUsuario('');
        setClave('');
      } else {
        setError('Acceso denegado. Credenciales de Desarrollador no válidas.');
      }
    }
  };

  const getTitle = () => {
    if (targetRole === 'demo-sena') return 'Acceso a Perfil Evaluación';
    if (targetRole === 'demo-cliente') return 'Acceso a Perfil Demostración';
    if (targetRole === 'admin') return 'Acceso a Administrador Local';
    return 'Acceso a Perfil Desarrollador (elkin-dev26)';
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#262626] border border-[#d4af37]/40 w-full max-w-md p-6 rounded-2xl shadow-2xl space-y-6 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-full flex items-center justify-center mx-auto mb-2 text-[#d4af37]">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">{getTitle()}</h3>
          <p className="text-xs text-gray-400">Ingresa tus credenciales autorizadas</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-300 uppercase font-semibold mb-1">Usuario</label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                placeholder="Ingresa tu usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-gray-700 focus:border-[#d4af37] rounded-lg pl-9 pr-3 py-2 text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 uppercase font-semibold mb-1">Contraseña</label>
            <div className="relative">
              <Key className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                placeholder="Ingresa tu contraseña"
                value={clave}
                onChange={(e) => setClave(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-gray-700 focus:border-[#d4af37] rounded-lg pl-9 pr-3 py-2 text-white outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#d4af37] hover:bg-[#b89628] text-black font-bold py-2.5 rounded-lg transition-all text-xs uppercase shadow-md mt-2"
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
}