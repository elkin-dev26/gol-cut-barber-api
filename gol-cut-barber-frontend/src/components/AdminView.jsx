import React, { useState } from 'react';
import { 
  Users, Calendar, Scissors, TrendingUp, DollarSign, Clock, 
  CheckCircle, XCircle, Plus, Edit, Trash2, Shield, UserCheck, Search, Filter, RefreshCw 
} from 'lucide-react';

export default function AdminView({ citas, setCitas, barberos, setBarberos, servicios, setServicios }) {
  const [activeTab, setActiveTab] = useState('resumen');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todas');

  // Métricas rápidas
  const totalCitas = citas.length;
  const citasCompletadas = citas.filter(c => c.estado === 'completada').length;
  const citasPendientes = citas.filter(c => c.estado === 'confirmada' || c.estado === 'pendiente').length;
  const ingresosTotales = citas
    .filter(c => c.estado === 'completada')
    .reduce((sum, c) => sum + (c.precio || 0), 0);

  const handleCambiarEstado = (id, nuevoEstado) => {
    setCitas(citas.map(c => c.id === id ? { ...c, estado: nuevoEstado } : c));
  };

  const citasFiltradas = citas.filter(c => {
    const coincideBusqueda = c.cliente.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             c.barbero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             c.servicio.toLowerCase().includes(searchTerm.toLowerCase());
    const coincideEstado = filterEstado === 'todas' || c.estado === filterEstado;
    return coincideBusqueda && coincideEstado;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-amber-400 flex items-center gap-2">
            <Shield className="w-7 h-7 text-amber-400" />
            Panel de Control Administrativo
          </h2>
          <p className="text-slate-400 text-sm">Gestión global de barberos, servicios, agendamiento y analítica</p>
        </div>

        <div className="flex bg-slate-900/80 p-1 rounded-lg border border-amber-500/30">
          <button
            onClick={() => setActiveTab('resumen')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'resumen' 
                ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20' 
                : 'text-slate-300 hover:text-amber-400'
            }`}
          >
            Resumen
          </button>
          <button
            onClick={() => setActiveTab('citas')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'citas' 
                ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20' 
                : 'text-slate-300 hover:text-amber-400'
            }`}
          >
            Citas Globales
          </button>
          <button
            onClick={() => setActiveTab('barberos')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'barberos' 
                ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20' 
                : 'text-slate-300 hover:text-amber-400'
            }`}
          >
            Barberos
          </button>
        </div>
      </div>

      {activeTab === 'resumen' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/90 border border-amber-500/30 p-5 rounded-xl">
              <div className="flex items-center justify-between text-amber-400 mb-2">
                <span className="text-sm font-medium">Ingresos Totales</span>
                <DollarSign className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-slate-100">${ingresosTotales.toLocaleString()}</p>
              <span className="text-xs text-slate-400">Servicios completados</span>
            </div>

            <div className="bg-slate-900/90 border border-amber-500/30 p-5 rounded-xl">
              <div className="flex items-center justify-between text-amber-400 mb-2">
                <span className="text-sm font-medium">Total de Citas</span>
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
              <span className="text-xs text-slate-400">Atendidas con éxito</span>
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
        </div>
      )}

      {activeTab === 'citas' && (
        <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-5 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar cliente, barbero o servicio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
              >
                <option value="todas">Todos los estados</option>
                <option value="confirmada">Confirmada</option>
                <option value="completada">Completada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-amber-400 text-xs uppercase border-b border-amber-500/20">
                <tr>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Barbero</th>
                  <th className="px-4 py-3">Servicio</th>
                  <th className="px-4 py-3">Fecha y Hora</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {citasFiltradas.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-medium text-slate-100">{c.cliente}</td>
                    <td className="px-4 py-3">{c.barbero}</td>
                    <td className="px-4 py-3">{c.servicio}</td>
                    <td className="px-4 py-3">{c.fecha} - {c.hora}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        c.estado === 'completada' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        c.estado === 'cancelada' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                        'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {c.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      {c.estado !== 'completada' && (
                        <button
                          onClick={() => handleCambiarEstado(c.id, 'completada')}
                          className="text-emerald-400 hover:text-emerald-300 font-medium text-xs bg-emerald-950/50 px-2 py-1 rounded border border-emerald-500/30"
                        >
                          Completar
                        </button>
                      )}
                      {c.estado !== 'cancelada' && (
                        <button
                          onClick={() => handleCambiarEstado(c.id, 'cancelada')}
                          className="text-rose-400 hover:text-rose-300 font-medium text-xs bg-rose-950/50 px-2 py-1 rounded border border-rose-500/30"
                        >
                          Cancelar
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

      {activeTab === 'barberos' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {barberos.map((b) => (
            <div key={b.id} className="bg-slate-900/90 border border-amber-500/30 p-5 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
                  {b.nombre.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-100">{b.nombre}</h4>
                  <p className="text-xs text-slate-400">{b.especialidad || 'Estilista Profesional'}</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded border border-emerald-500/30">
                Activo
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}