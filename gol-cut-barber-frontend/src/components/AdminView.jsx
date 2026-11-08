import React, { useState } from 'react';
import { 
  Calendar, Scissors, DollarSign, Clock, 
  CheckCircle, Plus, Trash2, Shield, Search, Lock, Unlock, History, MessageCircle 
} from 'lucide-react';

export default function AdminView({ 
  usuario = {}, 
  citas = [], 
  setCitas = () => {}, 
  barberos = [], 
  setBarberos = () => {}, 
  servicios = [], 
  setServicios = () => {}, 
  logsSesion = [], 
  devConfig = { whatsappSoporte: '573001234567', mensajeRenovacion: 'Hola' } 
}) {
  const [activeTab, setActiveTab] = useState('resumen');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todas');
  const [nuevoBarbero, setNuevoBarbero] = useState('');
  const [especialidad, setEspecialidad] = useState('');

  // Valores a prueba de fallos nulos
  const configSegura = devConfig || { whatsappSoporte: '573001234567', mensajeRenovacion: 'Hola' };
  const numWhatsapp = configSegura.whatsappSoporte || '573001234567';
  const msjWhatsapp = configSegura.mensajeRenovacion || 'Hola, deseo renovar mi membresia mensual de Gol Cut Barber.';

  const totalCitas = citas.length;
  const citasCompletadas = citas.filter(c => c.estado === 'completada').length;
  const citasPendientes = citas.filter(c => c.estado === 'confirmada' || c.estado === 'pendiente').length;
  const ingresosTotales = citas
    .filter(c => c.estado === 'completada')
    .reduce((sum, c) => sum + (c.precio || 0), 0);

  const toggleEstadoBarbero = (id) => {
    setBarberos(barberos.map(b => {
      if (b.id === id) {
        const nuevoEstado = b.estado === 'Activo' ? 'Inactivo' : 'Activo';
        return { ...b, estado: nuevoEstado, cupoPago: nuevoEstado === 'Activo' };
      }
      return b;
    }));
  };

  const eliminarBarbero = (id) => {
    setBarberos(barberos.filter(b => b.id !== id));
  };

  const handleAgregarBarbero = (e) => {
    e.preventDefault();
    if (!nuevoBarbero.trim()) return;
    setBarberos([
      ...barberos, 
      { id: 'b' + Date.now(), nombre: nuevoBarbero, especialidad: especialidad || 'Barbero Profesional', estado: 'Activo', cupoPago: true, diasClave: 90 }
    ]);
    setNuevoBarbero('');
    setEspecialidad('');
  };

  const handleAnularCita = (id) => {
    setCitas(citas.map(c => c.id === id ? { ...c, estado: 'cancelada' } : c));
  };

  const citasFiltradas = citas.filter(c => {
    const coincideBusqueda = (c.cliente || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                             (c.barbero || '').toLowerCase().includes(searchTerm.toLowerCase());
    const coincideEstado = filterEstado === 'todas' || c.estado === filterEstado;
    return coincideBusqueda && coincideEstado;
  });

  const urlWhatsapp = `https://wa.me/${numWhatsapp}?text=${encodeURIComponent(msjWhatsapp)}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-amber-400 flex items-center gap-2">
            <Shield className="w-7 h-7 text-amber-400" />
            Panel de Control del Administrador ({usuario?.nombre || 'Local'})
          </h2>
          <p className="text-slate-400 text-sm">Control de alquiler de cupos, caja diaria y auditoría de asistencia</p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={urlWhatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-emerald-600/20"
          >
            <MessageCircle className="w-4 h-4" />
            Renovar Membresía WhatsApp
          </a>

          <div className="flex bg-slate-900/80 p-1 rounded-lg border border-amber-500/30">
            <button
              onClick={() => setActiveTab('resumen')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium ${activeTab === 'resumen' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'}`}
            >
              Resumen
            </button>
            <button
              onClick={() => setActiveTab('barberos')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium ${activeTab === 'barberos' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'}`}
            >
              Control Cupos
            </button>
            <button
              onClick={() => setActiveTab('citas')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium ${activeTab === 'citas' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'}`}
            >
              Citas & Caja
            </button>
            <button
              onClick={() => setActiveTab('auditoria')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium ${activeTab === 'auditoria' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'}`}
            >
              Entradas / Salidas
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'resumen' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/90 border border-amber-500/30 p-5 rounded-xl">
            <div className="flex items-center justify-between text-amber-400 mb-2">
              <span className="text-sm font-medium">Ingresos Totales</span>
              <DollarSign className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-slate-100">${ingresosTotales.toLocaleString()}</p>
            <span className="text-xs text-slate-400">Atendidas + Walk-in</span>
          </div>

          <div className="bg-slate-900/90 border border-amber-500/30 p-5 rounded-xl">
            <div className="flex items-center justify-between text-amber-400 mb-2">
              <span className="text-sm font-medium">Total Citas</span>
              <Calendar className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-slate-100">{totalCitas}</p>
            <span className="text-xs text-slate-400">Registradas en sistema</span>
          </div>

          <div className="bg-slate-900/90 border border-amber-500/30 p-5 rounded-xl">
            <div className="flex items-center justify-between text-emerald-400 mb-2">
              <span className="text-sm font-medium">Completadas</span>
              <CheckCircle className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-slate-100">{citasCompletadas}</p>
            <span className="text-xs text-slate-400">Finalizadas</span>
          </div>

          <div className="bg-slate-900/90 border border-amber-500/30 p-5 rounded-xl">
            <div className="flex items-center justify-between text-blue-400 mb-2">
              <span className="text-sm font-medium">Pendientes</span>
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-slate-100">{citasPendientes}</p>
            <span className="text-xs text-slate-400">Por atender</span>
          </div>
        </div>
      )}

      {activeTab === 'barberos' && (
        <div className="space-y-6">
          <form onSubmit={handleAgregarBarbero} className="bg-slate-900 border border-amber-500/30 p-4 rounded-xl flex flex-col md:flex-row gap-3">
            <input
              type="text"
              placeholder="Nombre del nuevo barbero..."
              value={nuevoBarbero}
              onChange={(e) => setNuevoBarbero(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-400"
              required
            />
            <input
              type="text"
              placeholder="Especialidad"
              value={especialidad}
              onChange={(e) => setEspecialidad(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-400"
            />
            <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs flex items-center justify-center gap-1">
              <Plus className="w-4 h-4" /> Crear Perfil Barbero
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {barberos.map((b) => (
              <div key={b.id} className="bg-slate-900 border border-amber-500/30 p-5 rounded-xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-100">{b.nombre}</h4>
                    <p className="text-xs text-slate-400">{b.especialidad}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                    b.estado === 'Activo' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {b.estado}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 bg-slate-950 p-2 rounded border border-slate-800">
                  Renovación de clave: <span className="text-amber-400 font-bold">{b.diasClave || 90} días restantes</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => toggleEstadoBarbero(b.id)}
                    className={`flex-1 py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1 border transition-all ${
                      b.estado === 'Activo'
                        ? 'bg-rose-950/60 hover:bg-rose-900 text-rose-300 border-rose-500/40'
                        : 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    {b.estado === 'Activo' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    {b.estado === 'Activo' ? 'Bloquear por Cupo' : 'Confirmar Pago Cupo'}
                  </button>

                  <button
                    onClick={() => eliminarBarbero(b.id)}
                    className="p-1.5 bg-slate-950 hover:bg-rose-950 text-rose-400 rounded border border-rose-500/30"
                    title="Eliminar Barbero"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'citas' && (
        <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-200">Gestión Global de Reservas y Atenciones Expresas</h3>
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2"
            >
              <option value="todas">Todos los estados</option>
              <option value="confirmada">Confirmadas</option>
              <option value="completada">Completadas</option>
              <option value="cancelada">Anuladas</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-amber-400 text-xs uppercase border-b border-amber-500/20">
                <tr>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Barbero</th>
                  <th className="px-4 py-3">Servicio</th>
                  <th className="px-4 py-3">Precio</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Anulación (Solo Adm)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {citasFiltradas.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4 py-3 font-medium text-slate-100">{c.cliente}</td>
                    <td className="px-4 py-3">{c.barbero}</td>
                    <td className="px-4 py-3">{c.servicio}</td>
                    <td className="px-4 py-3 font-bold text-amber-400">${(c.precio || 0).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        c.estado === 'completada' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        c.estado === 'cancelada' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                        'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {c.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {c.estado !== 'cancelada' && (
                        <button
                          onClick={() => handleAnularCita(c.id)}
                          className="text-rose-400 text-xs bg-rose-950/60 px-2 py-1 rounded border border-rose-500/30 hover:bg-rose-900"
                        >
                          Anular Cita
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'auditoria' && (
        <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-5 space-y-4">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            Control de Asistencia (Entradas y Salidas)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-amber-400 text-xs uppercase border-b border-amber-500/20">
                <tr>
                  <th className="px-4 py-3">Personal</th>
                  <th className="px-4 py-3">Rol</th>
                  <th className="px-4 py-3">Fecha y Hora</th>
                  <th className="px-4 py-3">Evento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {logsSesion.map((log) => (
                  <tr key={log.id}>
                    <td className="px-4 py-3 font-medium text-slate-100">{log.usuario}</td>
                    <td className="px-4 py-3 text-xs text-amber-400 capitalize">{log.rol}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{log.fechaHora}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {log.evento}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}