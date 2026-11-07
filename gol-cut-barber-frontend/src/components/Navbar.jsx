import React, { useState } from 'react';
import { Scissors, Calendar, ShieldCheck, ChevronDown, UserCheck, Lock, Shield } from 'lucide-react';

export default function Navbar({ 
  nombreNegocio, 
  activeTab, 
  setActiveTab, 
  onSelectRole,
  activeRole 
}) {
  const [menuAbierto, setMenuAbierto] = useState(false);

  const getLabelRole = () => {
    if (activeRole === 'superadmin') return 'Perfil: SuperAdmin / Dev';
    if (activeRole === 'admin') return 'Perfil: Administrador';
    if (activeRole === 'demo') return 'Perfil: Demo';
    return 'Perfil: Cliente';
  };

  return (
    <nav className="bg-[#1a1a1a] border-b border-[#d4af37]/30 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="bg-[#d4af37] p-2 rounded-lg text-black">
          <Scissors className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#d4af37] tracking-wider uppercase">{nombreNegocio}</h1>
          <p className="text-xs text-gray-400">Sistema de Gestión & Reservas</p>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-[#262626] p-1 rounded-lg border border-gray-800">
        <button
          onClick={() => setActiveTab('reservas')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'reservas' ? 'bg-[#d4af37] text-black font-bold' : 'text-gray-300 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" /> Reservar Cita
        </button>
        
        {activeRole !== 'cliente' && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'admin' ? 'bg-[#d4af37] text-black font-bold' : 'text-gray-300 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Panel de Control
          </button>
        )}
      </div>

      {/* MENÚ DESPLEGABLE DE SELECCIÓN DE PERFIL */}
      <div className="relative">
        <button
          onClick={() => setMenuAbierto(!menuAbierto)}
          className="bg-[#262626] border border-[#d4af37]/60 text-[#d4af37] hover:bg-[#333333] px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow-md"
        >
          <span>{getLabelRole()}</span>
          <ChevronDown className="w-4 h-4" />
        </button>

        {menuAbierto && (
          <div className="absolute right-0 mt-2 w-64 bg-[#262626] border border-[#d4af37]/40 rounded-xl shadow-2xl py-2 z-50 divide-y divide-gray-800">
            {/* Opción 1: Demo */}
            <button
              onClick={() => {
                onSelectRole('demo');
                setMenuAbierto(false);
              }}
              className="w-full text-left px-4 py-2.5 hover:bg-[#1a1a1a] transition-all flex items-center gap-3"
            >
              <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">1. Perfil Demo</p>
                <p className="text-[10px] text-gray-400">Acceso directo sin clave para evaluación</p>
              </div>
            </button>

            {/* Opción 2: Administrador Local */}
            <button
              onClick={() => {
                onSelectRole('admin');
                setMenuAbierto(false);
              }}
              className="w-full text-left px-4 py-2.5 hover:bg-[#1a1a1a] transition-all flex items-center gap-3"
            >
              <Lock className="w-4 h-4 text-[#d4af37] shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">2. Administrador Local</p>
                <p className="text-[10px] text-gray-400">Requiere clave (Gestión del negocio)</p>
              </div>
            </button>

            {/* Opción 3: SuperAdmin / Dev */}
            <button
              onClick={() => {
                onSelectRole('superadmin');
                setMenuAbierto(false);
              }}
              className="w-full text-left px-4 py-2.5 hover:bg-[#1a1a1a] transition-all flex items-center gap-3"
            >
              <Shield className="w-4 h-4 text-amber-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">3. SuperAdmin / Programador</p>
                <p className="text-[10px] text-gray-400">Requiere clave Dev (Control Total)</p>
              </div>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}