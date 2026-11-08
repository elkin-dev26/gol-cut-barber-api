import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, User, Scissors, DollarSign, PlusCircle } from 'lucide-react';

export default function BarberoView({ barberoActual, citas, setCitas, servicios, onCerrarSesion }) {
  const [filtro, setFiltro] = useState('todas');
  
  // Registro rápido para cliente sin cita (Walk-in)
  const [servicioRapido, setServicioRapido] = useState(servicios[0]?.nombre || '');
  const [precioRapido, setPrecioRapido] = useState(servicios[0]?.precio || 25000);

  const citasBarbero = citas.filter(c => 
    c.barbero.toLowerCase() === (barberoActual?.nombre || 'barbero').toLowerCase() ||
    c.barberoId === barberoActual?.id
  );

  const handleEstado = (id, nuevoEstado) => {
    setCitas(citas.map(c => c.id === id ? { ...c, estado: nuevoEstado } : c));
  };

  // Botón Express para registrar cliente sin cita previa
  const handleRegistrarCorteDirecto = (e) => {
    e.preventDefault();
    const nuevaAtencionDirecta = {
      id: 'c' + Date.now(),
      cliente: 'Cliente Presencial (Sin Cita)',
      barbero: barberoActual.nombre || 'Elkin Ramírez',
      servicio: servicioRapido,
      fecha: new Date().toISOString().split('T')[0],
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      precio: Number(precioRapido),
      estado: 'completada',
      tipo: 'express'
    };

    setCitas([nuevaAtencionDirecta, ...citas]);
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
            Panel de Barbero - {barberoActual?.nombre || 'Elkin Ramírez'}
          </h2>
          <p className="text-slate-400 text-sm">Gestión de turnos diarios y registro expreso de clientes presenciales</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-900 border border-amber-500/30 px-4 py-2 rounded-lg flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-400">Generado Hoy:</span>
            <span className="text-sm font-bold text-emerald-400">${ingresosHoy.toLocaleString()}</span>
          </div>

          <button
            onClick={onCerrarSesion}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700"
          >
            Marcar Salida / Cerrar
          </button>
        </div>
      </div>

      {/* REGISTRO RÁPIDO CLIENTE PRESENCIAL (SIN CITA) */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
          <PlusCircle className="w-4 h-4" />
          Registro Expreso de Cliente Presencial (Sin Cita Previa)
        </h3>
        
        <form onSubmit={handleRegistrarCorteDirecto} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select
            value={servicioRapido}
            onChange={(e) => {
              const sName = e.target.value;
              setServicioRapido(sName);
              const found = servicios.find(s => s.nombre === sName);
              if (found) setPrecioRapido(found.precio);
            }}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200"
          >
            {servicios.map(s => (
              <option key={s.id} value={s.nombre}>{s.nombre}</option>
            ))}
          </select>

          <input
            type="number"
            value={precioRapido}
            onChange={(e) => setPrecioRapido(e.target.value)}
            placeholder="Valor pagado ($)"
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200"
            required
          />

          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg text-xs transition-all shadow-md shadow-emerald-600/20"
          >
            Sumar a la Caja Directa
          </button>
        </form>
      </div>

      {/* AGENDA DE CITAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {citasBarbero.map((c) => (
          <div key={c.id} className="bg-slate-900 border border-amber-500/30 rounded-xl p-5 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-slate-100 flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-400" />
                  {c.cliente}
                </h4>
                <p className="text-xs text-amber-400 font-medium mt-1">{c.servicio}</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                c.estado === 'completada' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                c.estado === 'cancelada' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {c.estado}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-400 border-t border-b border-slate-800 py-2">
              <span>{c.fecha} - {c.hora}</span>
              <span className="font-bold text-emerald-400">${(c.precio || 0).toLocaleString()}</span>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              {c.estado !== 'completada' && c.estado !== 'cancelada' && (
                <button
                  onClick={() => handleEstado(c.id, 'completada')}
                  className="px-3 py-1 bg-emerald-950 text-emerald-400 rounded text-xs border border-emerald-500/40"
                >
                  Confirmar Atención
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}