import React, { useState } from 'react';
import { Terminal, ShieldCheck, Database, Cpu, MessageCircle, Play, Pause, Trash2, Save, Plus } from 'lucide-react';

export default function SuperAdminView({ usuario, tenants, setTenants, barberos, setBarberos, servicios, setServicios, logsSesion, devConfig, setDevConfig }) {
  const [whatsapp, setWhatsapp] = useState(devConfig.whatsappSoporte);
  const [nombreNuevaBarberia, setNombreNuevaBarberia] = useState('');
  const [duenoNuevaBarberia, setDuenoNuevaBarberia] = useState('');

  const handleGuardarWhatsapp = (e) => {
    e.preventDefault();
    setDevConfig({ ...devConfig, whatsappSoporte: whatsapp });
    alert('¡Número de WhatsApp de soporte actualizado exitosamente!');
  };

  const toggleLicenciaTenant = (id) => {
    setTenants(tenants.map(t => {
      if (t.id === id) {
        const nuevoEstado = t.estadoLicencia === 'Activa' ? 'Pausada (Sin Pago)' : 'Activa';
        return { ...t, estadoLicencia: nuevoEstado };
      }
      return t;
    }));
  };

  const eliminarTenant = (id) => {
    setTenants(tenants.filter(t => t.id !== id));
  };

  const handleAgregarTenant = (e) => {
    e.preventDefault();
    if (!nombreNuevaBarberia.trim()) return;
    setTenants([
      ...tenants,
      {
        id: 't' + Date.now(),
        nombreBarberia: nombreNuevaBarberia,
        dueno: duenoNuevaBarberia || 'Cliente Nuevo',
        estadoLicencia: 'Prueba 1 Mes',
        diasRestantes: 30,
        plan: 'Mensual'
      }
    ]);
    setNombreNuevaBarberia('');
    setDuenoNuevaBarberia('');
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-amber-500/30 pb-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-amber-400 flex items-center gap-2">
            <Terminal className="w-7 h-7 text-amber-400" />
            Consola del Desarrollador / SuperAdmin (`elkin-dev26`)
          </h2>
          <p className="text-slate-400 text-sm">Control de tenants multi-barbería, licencias temporizadas y WhatsApp de soporte</p>
        </div>
        <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold rounded-lg">
          Acceso Root Oculto
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CONFIGURACIÓN DE WHATSAPP DE SOPORTE */}
        <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-5 space-y-4">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-emerald-400" />
            Configuración del Número de WhatsApp (Soporte/Renovación)
          </h3>
          <p className="text-xs text-slate-400">Este número es al que los Administradores enviarán el mensaje para solicitar la activación de su mensualidad.</p>

          <form onSubmit={handleGuardarWhatsapp} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Número de WhatsApp (con código de país sin +)</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Ej: 573001234567"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-400"
                required
              />
            </div>
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-2">
              <Save className="w-4 h-4" /> Actualizar Número WhatsApp
            </button>
          </form>
        </div>

        {/* REGISTRAR NUEVA BARBERÍA (TENANT SAAS) */}
        <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-5 space-y-4">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Plus className="w-5 h-5 text-amber-400" />
            Registrar Nueva Barbería / Cliente SaaS
          </h3>

          <form onSubmit={handleAgregarTenant} className="space-y-3">
            <input
              type="text"
              placeholder="Nombre de la Barbería..."
              value={nombreNuevaBarberia}
              onChange={(e) => setNombreNuevaBarberia(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-400"
              required
            />
            <input
              type="text"
              placeholder="Nombre del Propietario / Administrador..."
              value={duenoNuevaBarberia}
              onChange={(e) => setDuenoNuevaBarberia(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-400"
              required
            />
            <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 rounded-lg text-xs">
              Crear Licencia Temporizada (30 Días)
            </button>
          </form>
        </div>
      </div>

      {/* GESTIÓN DE LICENCIAS DE BARBERÍAS (MULTI-TENANT) */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-5 space-y-4">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-400" />
          Control de Barberías Registradas (Prueba 1 Mes / Mensualidades)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-amber-400 text-xs uppercase border-b border-amber-500/20">
              <tr>
                <th className="px-4 py-3">Barbería</th>
                <th className="px-4 py-3">Propietario</th>
                <th className="px-4 py-3">Días Restantes</th>
                <th className="px-4 py-3">Estado Licencia</th>
                <th className="px-4 py-3 text-right">Acciones Desarrollador</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {tenants.map((t) => (
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
                      onClick={() => toggleLicenciaTenant(t.id)}
                      className={`px-2 py-1 text-xs rounded font-bold ${
                        t.estadoLicencia === 'Activa' ? 'bg-rose-950 text-rose-300 border border-rose-500/30' : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {t.estadoLicencia === 'Activa' ? 'Pausar Licencia' : 'Activar Licencia'}
                    </button>

                    <button
                      onClick={() => eliminarTenant(t.id)}
                      className="p-1 bg-slate-950 hover:bg-rose-950 text-rose-400 rounded border border-rose-500/30"
                      title="Eliminar Barbería"
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