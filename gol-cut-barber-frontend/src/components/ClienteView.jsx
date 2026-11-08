import React, { useState } from 'react';
import { Calendar, Clock, Scissors, User, CheckCircle, QrCode } from 'lucide-react';

export default function ClienteView({ barberos, servicios, citas, setCitas }) {
  const [barberoSeleccionado, setBarberoSeleccionado] = useState(barberos[0]?.nombre || '');
  const [servicioSeleccionado, setServicioSeleccionado] = useState(servicios[0]?.nombre || '');
  const [fecha, setFecha] = useState('2026-11-09');
  const [hora, setHora] = useState('10:00 AM');
  const [nombreCliente, setNombreCliente] = useState('');
  const [citaCreada, setCitaCreada] = useState(null);

  const handleAgendar = (e) => {
    e.preventDefault();
    if (!nombreCliente.trim()) return;

    const servObj = servicios.find(s => s.nombre === servicioSeleccionado);
    const nuevaCita = {
      id: 'c' + Date.now(),
      cliente: nombreCliente,
      barbero: barberoSeleccionado,
      servicio: servicioSeleccionado,
      fecha,
      hora,
      precio: servObj ? servObj.precio : 25000,
      estado: 'confirmada'
    };

    setCitas([nuevaCita, ...citas]);
    setCitaCreada(nuevaCita);
    setNombreCliente('');
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-amber-500/20 pb-4">
        <h2 className="text-2xl font-bold text-amber-400 flex items-center gap-2">
          <Scissors className="w-7 h-7 text-amber-400" />
          Reserva de Citas en Línea
        </h2>
        <p className="text-slate-400 text-sm">Agende su turno de atención presencial con confirmación instantánea</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            Formulario de Agendamiento
          </h3>

          <form onSubmit={handleAgendar} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Nombre Completo del Cliente</label>
              <input
                type="text"
                value={nombreCliente}
                onChange={(e) => setNombreCliente(e.target.value)}
                placeholder="Ingrese su nombre y apellido"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Seleccionar Barbería / Profesional</label>
              <select
                value={barberoSeleccionado}
                onChange={(e) => setBarberoSeleccionado(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-400"
              >
                {barberos.map((b) => (
                  <option key={b.id} value={b.nombre}>{b.nombre} - {b.especialidad}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Servicio Requerido</label>
              <select
                value={servicioSeleccionado}
                onChange={(e) => setServicioSeleccionado(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-400"
              >
                {servicios.map((s) => (
                  <option key={s.id} value={s.nombre}>{s.nombre} (${s.precio.toLocaleString()})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Fecha</label>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Hora</label>
                <select
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="03:00 PM">03:00 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-lg text-sm transition-all shadow-lg shadow-amber-500/20"
            >
              Confirmar Reserva de Cita
            </button>
          </form>
        </div>

        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-4">
              <QrCode className="w-5 h-5 text-amber-400" />
              Ticket de Confirmación Expreso QR
            </h3>

            {citaCreada ? (
              <div className="bg-slate-950 border border-amber-500/40 rounded-xl p-5 text-center space-y-3">
                <div className="inline-block p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h4 className="text-emerald-400 font-bold text-base">¡Cita Agendada Exitosamente!</h4>
                
                <div className="text-xs text-slate-300 space-y-1 bg-slate-900 p-3 rounded-lg border border-slate-800 text-left">
                  <p><span className="text-slate-400 font-medium">Cliente:</span> {citaCreada.cliente}</p>
                  <p><span className="text-slate-400 font-medium">Servicio:</span> {citaCreada.servicio}</p>
                  <p><span className="text-slate-400 font-medium">Atiende:</span> {citaCreada.barbero}</p>
                  <p><span className="text-slate-400 font-medium">Fecha y Hora:</span> {citaCreada.fecha} - {citaCreada.hora}</p>
                </div>

                <div className="pt-2 flex justify-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=GOLCUT-CITA-${citaCreada.id}`}
                    alt="Código QR de Cita"
                    className="border-2 border-amber-400 rounded-lg p-1 bg-white"
                  />
                </div>
                <p className="text-[10px] text-slate-400">Presente este código QR al llegar a la barbería</p>
              </div>
            ) : (
              <div className="bg-slate-950/60 border border-dashed border-slate-800 rounded-xl p-8 text-center text-slate-500 space-y-2">
                <QrCode className="w-12 h-12 mx-auto text-slate-600" />
                <p className="text-sm">Complete el formulario para generar su ticket expreso con código QR</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}