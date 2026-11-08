import React, { useState } from 'react';
import { Terminal, ShieldCheck, Database, MessageCircle, Save, Plus, Trash2 } from 'lucide-react';

export default function SuperAdminView({ usuario, tenants, setTenants, devConfig, setDevConfig }) {
  // Protección de variable devConfig con valor por defecto
  const [whatsapp, setWhatsapp] = useState(devConfig?.whatsappSoporte || '573001234567');
  const [nombreBarberia, setNombreBarberia] = useState('');
  const [dueno, setDueno] = useState('');

  const handleGuardarWhatsapp = (e) => {
    e.preventDefault();
    if (setDevConfig) {
      setDevConfig({ ...(devConfig || {}), whatsappSoporte: whatsapp });
    }
    alert('Número de WhatsApp de soporte actualizado exitosamente.');
  };

  const handleAgregarTenant = (e) => {
    e.preventDefault();
    if (!nombreBarberia.trim()) return;
    if (setTenants) {
      setTenants([
        ...(tenants || []),
        { id: 't' + Date.now(), nombreBarberia, dueno: dueno || 'Cliente Nuevo', estadoLicencia: 'Prueba 1 Mes', diasRestantes: 30 }
      ]);
    }
    setNombreBarberia('');
    setDueno('');
  };

  const toggleLicencia = (id) => {
    if (setTenants && tenants) {
      setTenants(tenants.map(t => t.id === id ? { ...t, estadoLicencia: t.estadoLicencia === 'Activa' ? 'Pausada' : 'Activa' } : t));
    }
  };

  const eliminarTenant = (id) => {
    if (setTenants && tenants) {
      setTenants(tenants.filter(t => t.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-amber-500/30 pb-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-amber-400 flex items-center gap-2">
            <Terminal className="w-7 h-7 text-amber-400" />
            Consola SuperAdmin / Desarrollador (`elkin-dev26`)
          </h2>
          <p className="text-slate-400 text-sm">Control multi-barbería SaaS, licencias temporizadas y WhatsApp</p>
        </div>
        <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-bold rounded-lg border border-amber-500/40">
          Root Nivel 0
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-5 space-y-4">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-emerald-400" />
            WhatsApp de Soporte / Renovación
          </h3>
          <form onSubmit={handleGuardarWhatsapp} className="space-y-3">
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-400"
              required
            />
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-2">
              <Save className="w-4 h-4" /> Guardar WhatsApp
            </button>
          </form>
        </div>

        <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-5 space-y-4">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Plus className="w-5 h-5 text-amber-400" />
            Registrar Nueva Barbería (SaaS 1 Mes)
          </h3>
          <form onSubmit={handleAgregarTenant} className="space-y-3">
            <input
              type="text"
              placeholder="Nombre Barbería"
              value={nombreBarberia}
              onChange={(e) => setNombreBarberia(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-400"
              required
            />
            <input
              type="text"
              placeholder="Propietario / Cliente"
              value={dueno}
              onChange={(e) => setDueno(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-400"
              required
            />
            <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 rounded-lg text-xs">
              Crear Licencia Temporizada
            </button>
          </form>
        </div>
      </div>

      <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-5 space-y-4">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-400" />
          Barberías Registradas (Control de Licencias)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-amber-400 text-xs uppercase border-b border-amber-500/20">
              <tr>
                <th className="px-4 py-3">Barbería</th>
                <th className="px-4 py-3">Propietario</th>
                <th className="px-4 py-3">Días Restantes</th>
                <th className="px-4 py-3">Estado Licencia</th>
                <th className="px-4 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {(tenants || []).map((t) => (
                <tr key={t.id}>
                  <td className="px-4 py-3 font-bold text-slate-100">{t.nombreBarberia}</td>
                  <td className="px-4 py-3">{t.dueno}</td>
                  <td className="px-4 py-3 font-bold text-amber-400">{t.diasRestantes} días</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      t.estadoLicencia === 'Activa' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                      {t.estadoLicencia}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => toggleLicencia(t.id)}
                      className={`px-2 py-1 text-xs rounded font-bold ${
                        t.estadoLicencia === 'Activa' ? 'bg-rose-950 text-rose-300 border border-rose-500/30' : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {t.estadoLicencia === 'Activa' ? 'Pausar' : 'Activar'}
                    </button>
                    <button
                      onClick={() => eliminarTenant(t.id)}
                      className="p-1 bg-slate-950 hover:bg-rose-950 text-rose-400 rounded border border-rose-500/30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}