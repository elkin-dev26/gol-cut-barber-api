import React, { useState } from 'react';
import { Terminal, ShieldCheck, Database, Cpu, Plus, Trash2, Edit } from 'lucide-react';

export default function SuperAdminView({ usuario, citas, barberos, servicios, setBarberos, setServicios }) {
  const [nuevoBarbero, setNuevoBarbero] = useState('');
  const [nuevoServicio, setNuevoServicio] = useState('');
  const [precioServicio, setPrecioServicio] = useState('');

  const handleAgregarBarbero = (e) => {
    e.preventDefault();
    if (!nuevoBarbero.trim()) return;
    setBarberos([...barberos, { id: 'b' + Date.now(), nombre: nuevoBarbero, especialidad: 'Estilista Profesional', estado: 'Activo' }]);
    setNuevoBarbero('');
  };

  const handleAgregarServicio = (e) => {
    e.preventDefault();
    if (!nuevoServicio.trim() || !precioServicio) return;
    setServicios([...servicios, { id: 's' + Date.now(), nombre: nuevoServicio, precio: Number(precioServicio), duracion: '30 min' }]);
    setNuevoServicio('');
    setPrecioServicio('');
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-amber-500/30 pb-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-amber-400 flex items-center gap-2">
            <Terminal className="w-7 h-7 text-amber-400" />
            Consola del Desarrollador / SuperAdmin (`elkin-dev26`)
          </h2>
          <p className="text-slate-400 text-sm">Control total de arquitectura, base de datos y tenants globales</p>
        </div>
        <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold rounded-lg">
          Acceso Nivel 0 - Root
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gestión de Barberos */}
        <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-5 space-y-4">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            Gestión de Personal (Barberos)
          </h3>

          <form onSubmit={handleAgregarBarbero} className="flex gap-2">
            <input
              type="text"
              placeholder="Nombre del nuevo barbero..."
              value={nuevoBarbero}
              onChange={(e) => setNuevoBarbero(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-400"
            />
            <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1">
              <Plus className="w-4 h-4" /> Agregar
            </button>
          </form>

          <ul className="divide-y divide-slate-800">
            {barberos.map(b => (
              <li key={b.id} className="py-2 flex justify-between items-center">
                <span className="text-sm font-medium text-slate-200">{b.nombre} ({b.especialidad})</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">Activo</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Gestión de Tarifas y Servicios */}
        <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-5 space-y-4">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-400" />
            Catálogo de Servicios y Tarifas
          </h3>

          <form onSubmit={handleAgregarServicio} className="space-y-2">
            <input
              type="text"
              placeholder="Nombre del servicio..."
              value={nuevoServicio}
              onChange={(e) => setNuevoServicio(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-400"
            />
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Precio ($)..."
                value={precioServicio}
                onChange={(e) => setPrecioServicio(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-400"
              />
              <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1">
                <Plus className="w-4 h-4" /> Añadir
              </button>
            </div>
          </form>

          <ul className="divide-y divide-slate-800">
            {servicios.map(s => (
              <li key={s.id} className="py-2 flex justify-between items-center">
                <span className="text-sm font-medium text-slate-200">{s.nombre}</span>
                <span className="text-sm font-bold text-amber-400">${s.precio.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}