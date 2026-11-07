import React, { useState } from 'react';
import { Scissors, ShieldCheck, UserCheck, ChevronDown, User } from 'lucide-react';
import LoginModal from './LoginModal';

export default function Navbar({ activeRole, setActiveRole, config }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetRole, setTargetRole] = useState(null);

  const handleRoleSelect = (role) => {
    setIsDropdownOpen(false);
    if (role === 'cliente') {
      setActiveRole('cliente');
    } else {
      setTargetRole(role);
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <nav className="bg-[#1a1a1a] border-b border-[#d4af37]/30 px-6 py-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#262626] rounded-xl border border-[#d4af37]/40 text-[#d4af37]">
            <Scissors className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[#d4af37] tracking-wider uppercase">
              {config?.nombreNegocio || 'Peluquería Gol Cut Barber'}
            </h1>
            <p className="text-[10px] text-gray-400 font-mono">Sistema de Gestión y Reservas</p>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="bg-[#262626] border border-[#d4af37]/40 text-gray-200 hover:text-[#d4af37] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md"
          >
            <UserCheck className="w-4 h-4 text-[#d4af37]" />
            <span>
              {activeRole === 'superadmin' ? 'SuperAdmin / Dev' :
               activeRole === 'admin' ? 'Administrador Local' :
               activeRole === 'demo' ? 'Perfil Evaluación / Demo' : 'Vista Cliente'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[#262626] border border-[#d4af37]/30 rounded-xl shadow-2xl py-2 z-50 text-xs">
              <button
                onClick={() => handleRoleSelect('cliente')}
                className="w-full text-left px-4 py-2.5 text-gray-300 hover:bg-[#1a1a1a] hover:text-[#d4af37] flex items-center gap-2"
              >
                <User className="w-4 h-4" /> Reservar Cita (Cliente)
              </button>
              <button
                onClick={() => handleRoleSelect('demo')}
                className="w-full text-left px-4 py-2.5 text-gray-300 hover:bg-[#1a1a1a] hover:text-[#d4af37] flex items-center gap-2 border-t border-gray-800"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Perfil Evaluación / Demo
              </button>
              <button
                onClick={() => handleRoleSelect('admin')}
                className="w-full text-left px-4 py-2.5 text-gray-300 hover:bg-[#1a1a1a] hover:text-[#d4af37] flex items-center gap-2 border-t border-gray-800"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" /> Administrador Local
              </button>
              <button
                onClick={() => handleRoleSelect('superadmin')}
                className="w-full text-left px-4 py-2.5 text-gray-300 hover:bg-[#1a1a1a] hover:text-[#d4af37] flex items-center gap-2 border-t border-gray-800"
              >
                <ShieldCheck className="w-4 h-4 text-[#d4af37]" /> SuperAdmin / Programador
              </button>
            </div>
          )}
        </div>
      </nav>

      <LoginModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLoginSuccess={(role) => setActiveRole(role)}
        targetRole={targetRole}
      />
    </>
  );
}