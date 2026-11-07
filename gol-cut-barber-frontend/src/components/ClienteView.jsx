import React, { useState } from 'react';
import { Calendar, Scissors, CheckCircle, Clock, User, QrCode, Zap } from 'lucide-react';

export default function ClienteView({ barberos = [], servicios = [], onAgregarCita }) {
  const [modo, setModo] = useState('cita'); // 'cita' o 'expreso'

  // Formulario Agendar Cita
  const [cliente, setCliente] = useState('');
  const [servicioSeleccionado, setServicioSeleccionado] = useState('');
  const [barberoSeleccionado, setBarberoSeleccionado] = useState('');
  const [hora, setHora] = useState('02:00 PM');

  // Formulario Registro QR Expreso
  const [clienteExpreso, setClienteExpreso] = useState('');
  const [barberoExpreso, setBarberoExpreso] = useState('');
  const [servicioExpreso, setServicioExpreso] = useState('');

  const [reservaExitosa, setReservaExitosa] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');

  const opcionesHoras = [
    '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
    '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM'
  ];

  const handleSubmitCita = (e) => {
    e.preventDefault();
    if (!cliente || !servicioSeleccionado || !barberoSeleccionado) return;

    if (onAgregarCita) {
      onAgregarCita({
        cliente,
        servicio: servicioSeleccionado,
        barbero: barberoSeleccionado,
        hora,
        tipo: 'Programada'
      });
    }

    setMensajeExito('¡Cita reservada con éxito! Tu agendamiento ha sido registrado.');
    setReservaExitosa(true);
    setTimeout(() => {
      setReservaExitosa(false);
      setCliente('');
      setServicioSeleccionado('');
      setBarberoSeleccionado('');
      setHora('02:00 PM');
    }, 4000);
  };

  const handleSubmitExpreso = (e) => {
    e.preventDefault();
    if (!barberoExpreso || !servicioExpreso) return;

    const nombreFinal = clienteExpreso.trim() ? clienteExpreso : 'Cliente de Paso (Sin Cita)';

    if (onAgregarCita) {
      onAgregarCita({
        cliente: nombreFinal,
        servicio: servicioExpreso,
        barbero: barberoExpreso,
        hora: 'Atención Inmediata (Ahora)',
        tipo: 'Expreso / En Local'
      });
    }

    setMensajeExito('¡Atención registrada con éxito! El cobro ha sido contabilizado.');
    setReservaExitosa(true);
    setTimeout(() => {
      setReservaExitosa(false);
      setClienteExpreso('');
      setBarberoExpreso('');
      setServicioExpreso('');
    }, 4000);
  };

  return (
    <div className="max-w-2xl mx-auto bg-[#262626] border border-[#d4af37]/30 p-6 md:p-8 rounded-2xl shadow-2xl space-y-6">
      
      {/* Botones de Selector de Modo */}
      <div className="grid grid-cols-2 gap-2 bg-[#1a1a1a] p-1.5 rounded-xl border border-gray-800">
        <button
          type="button"
          onClick={() => setModo('cita')}
          className={`py-2.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${
            modo === 'cita' ? 'bg-[#d4af37] text-black shadow-md' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" /> Agendar Cita
        </button>
        <button
          type="button"
          onClick={() => setModo('expreso')}
          className={`py-2.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${
            modo === 'expreso' ? 'bg-[#d4af37] text-black shadow-md' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4" /> Sin Cita (Registro QR Expreso)
        </button>
      </div>

      <div className="text-center border-b border-gray-800 pb-4">
        <h2 className="text-xl font-bold text-[#d4af37] flex items-center justify-center gap-2">
          {modo === 'cita' ? (
            <> <Calendar className="w-5 h-5" /> Reservar Cita con Anticipación </>
          ) : (
            <> <QrCode className="w-5 h-5 text-[#d4af37]" /> Registro Rápido en la Barbería </>
          )}
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          {modo === 'cita' 
            ? 'Selecciona tu barbero, servicio y hora de preferencia' 
            : 'Si estás en el local sin cita previa, registra tu corte aquí en 15 segundos'}
        </p>
      </div>

      {reservaExitosa && (
        <div className="p-4 bg-emerald-900/80 border border-emerald-500 text-emerald-200 text-xs rounded-xl flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <p className="font-bold text-sm">¡Operación Exitosa!</p>
            <p className="text-emerald-300">{mensajeExito}</p>
          </div>
        </div>
      )}

      {/* VISTA 1: CITA PROGRAMADA */}
      {modo === 'cita' && (
        <form onSubmit={handleSubmitCita} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-300 uppercase mb-1">Tu Nombre Completo</label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                placeholder="Ej: Pepito Pérez"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-gray-700 focus:border-[#d4af37] rounded-lg pl-9 pr-3 py-2 text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-300 uppercase mb-1">Servicio Requerido</label>
            <div className="relative">
              <Scissors className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
              <select
                required
                value={servicioSeleccionado}
                onChange={(e) => setServicioSeleccionado(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-gray-700 focus:border-[#d4af37] rounded-lg pl-9 pr-3 py-2 text-white outline-none"
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
            <label className="block font-semibold text-gray-300 uppercase mb-1">Barbero de Preferencia</label>
            <select
              required
              value={barberoSeleccionado}
              onChange={(e) => setBarberoSeleccionado(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-gray-700 focus:border-[#d4af37] rounded-lg px-3 py-2 text-white outline-none"
            >
              <option value="">-- Seleccionar Barbero --</option>
              {barberos.map((b) => (
                <option key={b.id} value={b.nombre}>
                  {b.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-300 uppercase mb-1">Hora de la Cita (AM / PM)</label>
            <div className="relative">
              <Clock className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
              <select
                required
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-gray-700 focus:border-[#d4af37] rounded-lg pl-9 pr-3 py-2 text-white outline-none font-medium"
              >
                {opcionesHoras.map((h, idx) => (
                  <option key={idx} value={h}>{h}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#d4af37] hover:bg-[#b89628] text-black font-bold py-3 rounded-xl transition-all text-xs uppercase shadow-lg mt-2"
          >
            Confirmar Reserva de Cita
          </button>
        </form>
      )}

      {/* VISTA 2: REGISTRO QR EXPRESO (SIN CITA) */}
      {modo === 'expreso' && (
        <form onSubmit={handleSubmitExpreso} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-300 uppercase mb-1">Barbero que te atiende</label>
            <select
              required
              value={barberoExpreso}
              onChange={(e) => setBarberoExpreso(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-gray-700 focus:border-[#d4af37] rounded-lg px-3 py-2 text-white outline-none font-medium"
            >
              <option value="">-- Selecciona el Barbero --</option>
              {barberos.map((b) => (
                <option key={b.id} value={b.nombre}>{b.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-300 uppercase mb-1">Servicio Realizado</label>
            <div className="relative">
              <Scissors className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
              <select
                required
                value={servicioExpreso}
                onChange={(e) => setServicioExpreso(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-gray-700 focus:border-[#d4af37] rounded-lg pl-9 pr-3 py-2 text-white outline-none"
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
            <label className="block font-semibold text-gray-300 uppercase mb-1">Tu Nombre (Opcional)</label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Ej: Carlos (O puedes dejarlo en blanco)"
                value={clienteExpreso}
                onChange={(e) => setClienteExpreso(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-gray-700 focus:border-[#d4af37] rounded-lg pl-9 pr-3 py-2 text-white outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#d4af37] hover:bg-[#b89628] text-black font-bold py-3 rounded-xl transition-all text-xs uppercase shadow-lg mt-2 flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 fill-black" /> Registrar Corte Expreso
          </button>
        </form>
      )}
    </div>
  );
}