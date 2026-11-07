import React, { useState } from 'react';
import { Calendar, Scissors, CheckCircle, Clock, User } from 'lucide-react';

export default function ClienteView({ barberos, servicios, onAgregarCita }) {
  const [cliente, setCliente] = useState('');
  const [servicioSeleccionado, setServicioSeleccionado] = useState('');
  const [barberoSeleccionado, setBarberoSeleccionado] = useState('');
  const [hora, setHora] = useState('02:00 PM');
  const [reservaExitosa, setReservaExitosa] = useState(false);

  // Lista de horarios comerciales habituales en Colombia (Formato AM/PM)
  const opcionesHoras = [
    '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
    '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!cliente || !servicioSeleccionado || !barberoSeleccionado) return;

    if (onAgregarCita) {
      onAgregarCita({
        cliente,
        servicio: servicioSeleccionado,
        barbero: barberoSeleccionado,
        hora
      });
    }

    setReservaExitosa(true);
    setTimeout(() => {
      setReservaExitosa(false);
      setCliente('');
      setServicioSeleccionado('');
      setBarberoSeleccionado('');
      setHora('02:00 PM');
    }, 4000);
  };

  return (
    <div className="max-w-2xl mx-auto bg-[#262626] border border-[#d4af37]/30 p-8 rounded-2xl shadow-2xl space-y-6">
      <div className="text-center border-b border-gray-800 pb-4">
        <h2 className="text-2xl font-bold text-[#d4af37] flex items-center justify-center gap-2">
          <Calendar className="w-6 h-6" /> Agendar Tu Cita
        </h2>
        <p className="text-xs text-gray-400 mt-1">Selecciona tu servicio y barbero de preferencia</p>
      </div>

      {reservaExitosa && (
        <div className="p-4 bg-emerald-900/80 border border-emerald-500 text-emerald-200 text-sm rounded-xl flex items-center gap-3 animate-fade-in">
          <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <p className="font-bold">¡Cita reservada con éxito!</p>
            <p className="text-xs text-emerald-300">Tu agendamiento ha sido notificado al panel de administración.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Tu Nombre Completo</label>
          <div className="relative">
            <User className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
            <input
              type="text"
              required
              placeholder="Ej: Pepito Pérez"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-gray-700 focus:border-[#d4af37] rounded-lg pl-10 pr-4 py-2.5 text-white outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Servicio Requerido</label>
          <div className="relative">
            <Scissors className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
            <select
              required
              value={servicioSeleccionado}
              onChange={(e) => setServicioSeleccionado(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-gray-700 focus:border-[#d4af37] rounded-lg pl-10 pr-4 py-2.5 text-white outline-none"
            >
              <option value="">-- Seleccionar Servicio --</option>
              {servicios.map((s) => (
                <option key={s.id} value={s.nombre}>
                  {s.nombre} (${s.precio?.toLocaleString()})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Barbero de Preferencia</label>
          <select
            required
            value={barberoSeleccionado}
            onChange={(e) => setBarberoSeleccionado(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-gray-700 focus:border-[#d4af37] rounded-lg px-4 py-2.5 text-white outline-none"
          >
            <option value="">-- Seleccionar Barbero --</option>
            {barberos.map((b) => (
              <option key={b.id} value={b.nombre}>
                {b.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* MENÚ DESPLEGABLE DE HORAS AM/PM */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Hora de la Cita (AM / PM)</label>
          <div className="relative">
            <Clock className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
            <select
              required
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-gray-700 focus:border-[#d4af37] rounded-lg pl-10 pr-4 py-2.5 text-white outline-none font-medium"
            >
              {opcionesHoras.map((h, idx) => (
                <option key={idx} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-[#d4af37] hover:bg-[#b89628] text-black font-bold py-3.5 rounded-xl transition-all text-sm shadow-lg mt-4"
        >
          Confirmar Reserva de Cita
        </button>
      </form>
    </div>
  );
}