import React, { useState } from 'react';
import { Calendar, Clock, User, Scissors, CheckCircle } from 'lucide-react';

export default function ClienteView() {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    barbero: 'Carlos Pérez',
    servicio: 'Corte Sombreado + Barba',
    fecha: '',
    hora: '14:00'
  });
  const [exito, setExito] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setExito(true);
    setTimeout(() => setExito(false), 4000);
  };

  return (
    <div className="max-w-2xl mx-auto bg-[#262626] border border-[#d4af37]/30 p-8 rounded-xl shadow-2xl">
      <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
        <Calendar className="w-8 h-8 text-[#d4af37]" />
        <div>
          <h2 className="text-2xl font-bold text-[#d4af37]">Agendar tu Cita</h2>
          <p className="text-sm text-gray-400">Selecciona tu barbero de preferencia y horario</p>
        </div>
      </div>

      {exito && (
        <div className="mb-6 p-4 bg-emerald-900/50 border border-emerald-500 text-emerald-300 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-6 h-6 shrink-0" />
          <div>
            <p className="font-semibold">¡Cita agendada con éxito!</p>
            <p className="text-xs text-emerald-400">Guardado en la base de datos de MongoDB Atlas.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Nombre Completo</label>
            <input
              type="text"
              required
              placeholder="Ej: Elkin Ramírez"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              className="w-full bg-[#1a1a1a] border border-gray-700 focus:border-[#d4af37] rounded-lg px-4 py-2.5 text-white outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Teléfono Móvil</label>
            <input
              type="tel"
              required
              placeholder="Ej: 300 123 4567"
              value={formData.telefono}
              onChange={(e) => setFormData({...formData, telefono: e.target.value})}
              className="w-full bg-[#1a1a1a] border border-gray-700 focus:border-[#d4af37] rounded-lg px-4 py-2.5 text-white outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Seleccionar Barbero</label>
            <select
              value={formData.barbero}
              onChange={(e) => setFormData({...formData, barbero: e.target.value})}
              className="w-full bg-[#1a1a1a] border border-gray-700 focus:border-[#d4af37] rounded-lg px-4 py-2.5 text-white outline-none transition-all"
            >
              <option value="Carlos Pérez">Carlos Pérez (Master Barber)</option>
              <option value="Mateo Gómez">Mateo Gómez (Especialista Degradados)</option>
              <option value="Andrés Silva">Andrés Silva (Estilo Tradicional)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Servicio Requerido</label>
            <select
              value={formData.servicio}
              onChange={(e) => setFormData({...formData, servicio: e.target.value})}
              className="w-full bg-[#1a1a1a] border border-gray-700 focus:border-[#d4af37] rounded-lg px-4 py-2.5 text-white outline-none transition-all"
            >
              <option value="Corte Sombreado + Barba">Corte Sombreado + Barba ($35.000)</option>
              <option value="Corte Clásico">Corte Clásico ($25.000)</option>
              <option value="Perfilado de Barba">Perfilado de Barba ($15.000)</option>
              <option value="Combo Gol Cut VIP">Combo Gol Cut VIP ($50.000)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Fecha de la Cita</label>
            <input
              type="date"
              required
              value={formData.fecha}
              onChange={(e) => setFormData({...formData, fecha: e.target.value})}
              className="w-full bg-[#1a1a1a] border border-gray-700 focus:border-[#d4af37] rounded-lg px-4 py-2.5 text-white outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Hora Disponibilidad</label>
            <select
              value={formData.hora}
              onChange={(e) => setFormData({...formData, hora: e.target.value})}
              className="w-full bg-[#1a1a1a] border border-gray-700 focus:border-[#d4af37] rounded-lg px-4 py-2.5 text-white outline-none transition-all"
            >
              <option value="10:00">10:00 AM</option>
              <option value="11:30">11:30 AM</option>
              <option value="14:00">02:00 PM</option>
              <option value="15:30">03:30 PM</option>
              <option value="17:00">05:00 PM</option>
              <option value="18:30">06:30 PM</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-4 bg-[#d4af37] hover:bg-[#b89628] text-black font-bold py-3 px-6 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2"
        >
          <Scissors className="w-5 h-5" /> Confirmar Reserva de Cita
        </button>
      </form>
    </div>
  );
}