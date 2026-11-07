import React from 'react';
import { Scissors, Calendar, User, ShieldCheck } from 'lucide-react';

export default function Navbar({ role, setRole, activeTab, setActiveTab }) {
  return (
    <nav className="bg-[#1a1a1a] border-b border-[#d4af37]/30 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="bg-[#d4af37] p-2 rounded-lg text-black">
          <Scissors className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#d4af37] tracking-wider uppercase">Gol Cut Barber</h1>
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
        
        {role === 'admin' && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'admin' ? 'bg-[#d4af37] text-black font-bold' : 'text-gray-300 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Panel Admin
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-400">Rol actual:</span>
        <button
          onClick={() => {
            const nextRole = role === 'cliente' ? 'admin' : 'cliente';
            setRole(nextRole);
            setActiveTab(nextRole === 'admin' ? 'admin' : 'reservas');
          }}
          className="border border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-black px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1"
        >
          <User className="w-3 h-3" />
          {role === 'cliente' ? 'Cambiar a Administrador' : 'Cambiar a Cliente'}
        </button>
      </div>
    </nav>
  );
}