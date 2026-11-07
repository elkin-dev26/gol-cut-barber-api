import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, LogIn, LogOut, Lock, ShieldCheck, Zap } from 'lucide-react';

export default function BarberoView({ barberoActual, citas, setCitas, onCerrarSesion }) {
  const [horaEntrada] = useState(
    new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true })
  );
  const [marcadoSalida, setMarcadoSalida] = useState(false);

  // Filtrar citas correspondientes únicamente al barbero activo
  const citasPersonales = citas.filter(
    (c) => c.barbero?.toLowerCase() === barberoActual?.nombre?.toLowerCase()
  );

  // Cálculo de ingresos del día atendidos por este barbero
  const ingresosDelDia = citasPersonales
    .filter((c) => c.estado === 'Confirmada')
    .reduce((total, c) => total + (c.precio || 35000), 0);

  const cambiarEstadoCita = (id, nuevoEstado) => {
    setCitas(citas.map((c) => (c.id === id ? { ...c, estado: nuevoEstado } : c)));
  };

  const registrarSalida = () => {
    setMarcadoSalida(true);
    setTimeout(() => {
      if (onCerrarSesion) onCerrarSesion();
    }, 2000);
  };

  // Bloqueo por mensualidad impaga del alquiler de silla
  if (barberoActual?.estadoSilla === 'Moroso' || barberoActual?.estadoSilla === 'Bloqueado') {
    return (
      <div className="max-w-md mx-auto bg-[#262626] border border-rose-800/60 p-6 rounded-2xl shadow-2xl text-center space-y-4 my-10">
        <div className="w-16 h-16 bg-rose-950/60 border border-rose-700 text-rose-400 rounded-full flex items-center justify-center mx-auto shadow-lg">
          <Lock className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white">Perfil Temporalmente Bloqueado</h3>
        <p className="text-xs text-gray-300">
          Hola <span className="text-[#d4af37] font-bold">{barberoActual?.nombre || 'Barbero'}</span>, tu usuario se encuentra suspendido debido a un saldo pendiente en la cuota mensual del alquiler de tu silla/espacio.
        </p>
        <div className="p-3 bg-rose-950/40 border border-rose-900 rounded-lg text-[11px] text-rose-300 font-medium">
          Por favor acércate al administrador de la barbería para registrar la mensualidad y reactivar tu agenda en el sistema.
        </div>
        <button
          onClick={onCerrarSesion}
          className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all border border-gray-700 uppercase"
        >
          Cerrar Sesión
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Cabecera del Barbero + Registro de Asistencia */}
      <div className="bg-[#262626] border border-[#d4af37]/40 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] rounded-full flex items-center justify-center font-bold text-lg">
            {barberoActual?.nombre?.charAt(0) || 'B'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Panel de Barbero: <span className="text-[#d4af37]">{barberoActual?.nombre || 'Barbero'}</span>
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mt-1">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <LogIn className="w-3.5 h-3.5" /> Entrada: {horaEntrada}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-amber-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" /> Silla: Al Día (Activa)
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="bg-[#1a1a1a] border border-gray-800 px-4 py-2 rounded-xl text-right">
            <span className="block text-[10px] text-gray-400 uppercase font-semibold">Generado Hoy</span>
            <span className="text-sm font-bold text-[#d4af37]">${ingresosDelDia.toLocaleString()} COP</span>
          </div>
          <button
            onClick={registrarSalida}
            className="bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md"
          >
            <LogOut className="w-4 h-4" /> Marcar Salida
          </button>
        </div>
      </div>

      {marcadoSalida && (
        <div className="p-4 bg-amber-900/80 border border-amber-500 text-amber-200 text-xs rounded-xl flex items-center gap-2 animate-pulse">
          <Clock className="w-4 h-4 shrink-0" />
          <span>Hora de salida registrada correctamente en el sistema. Cerrando sesión...</span>
        </div>
      )}

      {/* Agenda Personal de Citas */}
      <div className="bg-[#262626] border border-[#d4af37]/30 p-6 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <h3 className="text-lg font-bold text-[#d4af37] flex items-center gap-2">
            <Calendar className="w-5 h-5" /> Citas Asignadas del Día
          </h3>
          <span className="text-xs bg-[#d4af37]/10 text-[#d4af37] px-3 py-1 rounded-full border border-[#d4af37]/30 font-semibold">
            {citasPersonales.length} Asignaciones
          </span>
        </div>

        {citasPersonales.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-xs">
            No tienes citas ni servicios registrados para la jornada actual.
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {citasPersonales.map((c) => (
              <div
                key={c.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#1a1a1a]/40 p-3 rounded-xl transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{c.cliente}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        c.tipo === 'Expreso / En Local'
                          ? 'bg-purple-900/60 text-purple-300 border border-purple-700'
                          : 'bg-gray-800 text-gray-300'
                      }`}
                    >
                      {c.tipo || 'Programada'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300">{c.servicio}</p>
                  <p className="text-xs font-semibold text-[#d4af37] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {c.hora}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded text-xs font-bold ${
                      c.estado === 'Confirmada'
                        ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
                        : c.estado === 'Cancelada'
                        ? 'bg-rose-900/60 text-rose-300 border border-rose-800'
                        : 'bg-amber-900/60 text-amber-300 border border-amber-700'
                    }`}
                  >
                    {c.estado || 'Pendiente'}
                  </span>

                  {c.estado !== 'Confirmada' && (
                    <button
                      onClick={() => cambiarEstadoCita(c.id, 'Confirmada')}
                      className="p-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                      title="Marcar como Atendida"
                    >
                      <CheckCircle className="w-4 h-4" /> Atendida
                    </button>
                  )}

                  {c.estado !== 'Cancelada' && (
                    <button
                      onClick={() => cambiarEstadoCita(c.id, 'Cancelada')}
                      className="p-2 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                      title="Marcar Inasistencia"
                    >
                      <XCircle className="w-4 h-4" /> No Asistió
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}