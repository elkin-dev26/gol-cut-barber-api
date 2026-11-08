import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, User, Scissors, DollarSign, Shield } from 'lucide-react';

export default function BarberoView({ barberoActual, citas, setCitas, onCerrarSesion }) {
  const [filtro, setFiltro] = useState('todas');

  const citasBarbero = citas.filter(c => 
    c.barbero.toLowerCase() === (barberoActual?.nombre || 'barbero').toLowerCase() ||
    c.barberoId === barberoActual?.id
  );

  const citasFiltradas = citasBarbero.filter(c => {
    if (filtro === 'completadas') return c.estado === 'completada';
    if (filtro === 'pendientes') return c.estado === 'confirmada' || c.estado === 'pendiente';
    return true;
  });

  const handleEstado = (id, nuevoEstado) => {
    setCitas(citas.map(c => c.id === id ? { ...c, estado: nuevoEstado } : c));
  };

  const ingresosHoy = citasBarbero
    .filter(c => c.estado === 'completada')
    .reduce((sum, c) => sum + (c.precio || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-amber-400 flex items-center gap-2">
            <Scissors className="w-7 h-7 text-amber-400" />
            Agenda de Barbería - {barberoActual?.nombre || 'Barbero'}
          </h2>
          <p className="text-slate-400 text-sm">Gestión de turnos y atención presencial a clientes</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-900 border border-amber-500/30 px-4 py-2 rounded-lg flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-400">Generado:</span>
            <span className="text-sm font-bold text-emerald-400">${ingresosHoy.toLocaleString()}</span>
          </div>

          <button
            onClick={onCerrarSesion}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setFiltro('todas')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
            filtro === 'todas' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-300 border border-slate-800'
          }`}
        >
          Todas ({citasBarbero.length})
        </button>
        <button
          onClick={() => setFiltro('pendientes')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
            filtro === 'pendientes' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-300 border border-slate-800'
          }`}
        >
          Pendientes
        </button>
        <button
          onClick={() => setFiltro('completadas')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
            filtro === 'completadas' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-300 border border-slate-800'
          }`}
        >
          Completadas
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {citasFiltradas.map((c) => (
          <div key={c.id} className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-5 space-y-3 relative">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-slate-100 flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-400" />
                  {c.cliente}
                </h4>
                <p className="text-xs text-amber-400/90 font-medium mt-1">{c.servicio}</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                c.estado === 'completada' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                c.estado === 'cancelada' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {c.estado}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400 border-t border-b border-slate-800 py-2">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                {c.fecha}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                {c.hora}
              </span>
            </div>

            <div className="flex justify-between items-center pt-1">
              <span className="text-sm font-bold text-slate-200">${(c.precio || 0).toLocaleString()}</span>
              
              <div className="flex gap-2">
                {c.estado !== 'completada' && (
                  <button
                    onClick={() => handleEstado(c.id, 'completada')}
                    className="p-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 rounded border border-emerald-500/40"
                    title="Marcar como Completada"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}
                {c.estado !== 'cancelada' && (
                  <button
                    onClick={() => handleEstado(c.id, 'cancelada')}
                    className="p-1.5 bg-rose-950 hover:bg-rose-900 text-rose-400 rounded border border-rose-500/40"
                    title="Cancelar Cita"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}