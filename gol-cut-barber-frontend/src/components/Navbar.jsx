import React from 'react';
import { Scissors, User, LogOut, Lock } from 'lucide-react';

export default function Navbar({ activeRole, setActiveRole, onOpenLogin, usuarioAutenticado, onCerrarSesion }) {
  return (
    <header className="bg-slate-900 border-b border-amber-500/30 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveRole('cliente')}>
          <div className="p-2 bg-amber-500/10 border border-amber-500/40 rounded-lg">
            <Scissors className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="font-extrabold text-amber-400 tracking-wider text-base md:text-lg">
              PELUQUERÍA GOL CUT BARBER
            </h1>
            <p className="text-xs text-slate-400 font-medium">Sistema de Gestión y Reservas</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value)}
              className="bg-slate-950 border border-amber-500/40 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400 font-semibold"
            >
              <option value="cliente">Vista: Cliente</option>
              <option value="barbero">Vista: Barbero</option>
              <option value="admin">Vista: Administrador</option>
              <option value="superadmin">Perfil SuperAdministrador/Desarrollador</option>
              <option value="evaluacion">Perfil Evaluación / Auditoría SENA</option>
              <option value="sucursal">Perfil Demostración / Sucursal</option>
            </select>
          </div>

          {usuarioAutenticado ? (
            <button
              onClick={onCerrarSesion}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded-lg text-xs font-bold border border-rose-500/30 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              Salir
            </button>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition-all shadow-md shadow-amber-500/20"
            >
              <Lock className="w-3.5 h-3.5" />
              Iniciar Sesión
            </button>
          )}
        </div>
      </div>
    </header>
  );
}