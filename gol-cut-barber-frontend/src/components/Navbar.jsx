import React from 'react';
import { Scissors, LogOut, Lock, UserCheck, Shield } from 'lucide-react';

export default function Navbar({ usuarioAutenticado, onOpenLogin, onCerrarSesion }) {
  return (
    <header className="bg-slate-900 border-b border-amber-500/30 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
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
          {usuarioAutenticado ? (
            <div className="flex items-center gap-3">
              <div className="bg-slate-950 border border-amber-500/30 px-3 py-1.5 rounded-lg flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-200">{usuarioAutenticado.nombre}</p>
                  <p className="text-[10px] text-amber-400 capitalize">{usuarioAutenticado.role}</p>
                </div>
              </div>
              <button
                onClick={onCerrarSesion}
                className="flex items-center gap-1.5 px-3 py-2 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded-lg text-xs font-bold border border-rose-500/30 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition-all shadow-md shadow-amber-500/20"
            >
              <Lock className="w-3.5 h-3.5" />
              Ingresar al Sistema
            </button>
          )}
        </div>
      </div>
    </header>
  );
}