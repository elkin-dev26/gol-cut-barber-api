import React, { useState } from 'react';
import { 
  ShieldCheck, Package, Users, Scissors, Store, Plus, Trash2, Edit3, Check, X, UserPlus, Clock, Terminal, Save, RotateCcw
} from 'lucide-react';

export default function AdminView({ 
  config, 
  setConfig, 
  barberos, 
  setBarberos, 
  servicios, 
  setServicios, 
  citas, 
  setCitas, 
  activeRole 
}) {
  const [tab, setTab] = useState('citas');

  const [nombreTemporal, setNombreTemporal] = useState(config.nombreNegocio);
  const [mensajeGuardado, setMensajeGuardado] = useState(false);

  const [productos, setProductos] = useState([
    { id: 1, nombre: 'Cera Moldear Mate (Oro)', stock: 15, precio: 32000 },
    { id: 2, nombre: 'Aceite de Barba Hidratante', stock: 8, precio: 28000 },
    { id: 3, nombre: 'Champú Anticaída Gol Cut', stock: 20, precio: 45000 }
  ]);

  // Horarios en formato fácil AM/PM
  const [horarios, setHorarios] = useState({ apertura: '08:00 AM', cierre: '07:00 PM', dias: 'Lunes a Sábado' });
  const [mensajeHorariosGuardados, setMensajeHorariosGuardados] = useState(false);

  // Lista de horas AM/PM para administradores
  const listaHorasAdmin = [
    '06:00 AM', '06:30 AM', '07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM',
    '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
    '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM', '09:00 PM', '09:30 PM', '10:00 PM'
  ];

  const [admins, setAdmins] = useState([
    { id: 1, nombre: 'Elkin Ramírez', usuario: 'elkin-dev26', rol: 'SuperAdmin / Programador' },
    { id: 2, nombre: 'Admin Barbershop', usuario: 'admin', rol: 'Administrador Local' }
  ]);

  const [nuevoBarbero, setNuevoBarbero] = useState('');
  const [nuevoServicio, setNuevoServicio] = useState({ nombre: '', precio: '' });
  const [nuevoProducto, setNuevoProducto] = useState({ nombre: '', stock: '', precio: '' });
  const [nuevoAdmin, setNuevoAdmin] = useState({ nombre: '', usuario: '', clave: '' });

  const [servicioEditando, setServicioEditando] = useState(null);
  const [datosEdicion, setDatosEdicion] = useState({ nombre: '', precio: '' });

  // ACCIONES CITAS
  const cambiarEstadoCita = (id, nuevoEstado) => {
    setCitas(citas.map(c => c.id === id ? { ...c, estado: nuevoEstado } : c));
  };

  const eliminarCita = (id) => {
    setCitas(citas.filter(c => c.id !== id));
  };

  // Acciones Barberos
  const agregarBarbero = () => {
    if (!nuevoBarbero.trim()) return;
    setBarberos([...barberos, { id: Date.now(), nombre: nuevoBarbero }]);
    setNuevoBarbero('');
  };
  const eliminarBarbero = (id) => setBarberos(barberos.filter(b => b.id !== id));

  // Acciones Servicios
  const agregarServicio = () => {
    if (!nuevoServicio.nombre || !nuevoServicio.precio) return;
    const precioLimpio = parseInt(String(nuevoServicio.precio).replace(/\./g, '').replace(/,/g, '')) || 0;
    setServicios([...servicios, { id: Date.now(), nombre: nuevoServicio.nombre, precio: precioLimpio }]);
    setNuevoServicio({ nombre: '', precio: '' });
  };

  const iniciarEdicionServicio = (servicio) => {
    setServicioEditando(servicio.id);
    setDatosEdicion({ nombre: servicio.nombre, precio: servicio.precio });
  };

  const guardarEdicionServicio = (id) => {
    const precioLimpio = parseInt(String(datosEdicion.precio).replace(/\./g, '').replace(/,/g, '')) || 0;
    setServicios(servicios.map(s => 
      s.id === id ? { ...s, nombre: datosEdicion.nombre, precio: precioLimpio } : s
    ));
    setServicioEditando(null);
  };

  const eliminarServicio = (id) => {
    setServicios(servicios.filter(s => s.id !== id));
  };

  // Acciones Inventario
  const cambiarStock = (id, delta) => {
    setProductos(productos.map(p => p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p));
  };

  const agregarProducto = () => {
    if (!nuevoProducto.nombre || !nuevoProducto.precio) return;
    
    const precioLimpio = parseInt(String(nuevoProducto.precio).replace(/\./g, '').replace(/,/g, '')) || 0;
    const stockLimpio = parseInt(String(nuevoProducto.stock).replace(/\./g, '')) || 0;

    setProductos([
      ...productos, 
      { 
        id: Date.now(), 
        nombre: nuevoProducto.nombre, 
        precio: precioLimpio,
        stock: stockLimpio
      }
    ]);
    setNuevoProducto({ nombre: '', stock: '', precio: '' });
  };

  const eliminarProducto = (id) => {
    setProductos(productos.filter(p => p.id !== id));
  };

  // Acciones Administradores
  const agregarAdmin = () => {
    if (!nuevoAdmin.nombre || !nuevoAdmin.usuario || !nuevoAdmin.clave) return;
    setAdmins([
      ...admins,
      { id: Date.now(), nombre: nuevoAdmin.nombre, usuario: nuevoAdmin.usuario, rol: 'Administrador Local' }
    ]);
    setNuevoAdmin({ nombre: '', usuario: '', clave: '' });
  };

  const eliminarAdmin = (id) => {
    setAdmins(admins.filter(a => a.id !== id));
  };

  // Guardar Horarios de Atención
  const guardarHorarios = () => {
    setMensajeHorariosGuardados(true);
    setTimeout(() => setMensajeHorariosGuardados(false), 3000);
  };

  // Guardar Ajustes del Negocio
  const guardarAjustesNegocio = () => {
    setConfig({ ...config, nombreNegocio: nombreTemporal });
    setMensajeGuardado(true);
    setTimeout(() => setMensajeGuardado(false), 3000);
  };

  const restablecerNombre = () => {
    const nombreOriginal = 'Peluquería Gol Cut';
    setNombreTemporal(nombreOriginal);
    setConfig({ ...config, nombreNegocio: nombreOriginal });
  };

  return (
    <div className="space-y-6">
      {/* Indicador del Perfil Activo */}
      <div className="bg-[#262626] border border-[#d4af37]/40 p-3 rounded-xl flex items-center justify-between text-xs text-[#d4af37]">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4" />
          <span className="font-mono font-bold">
            PERFIL ACTIVO: {
              activeRole === 'superadmin' ? 'SUPERUSUARIO / PROGRAMADOR (elkin-dev26)' :
              activeRole === 'admin' ? 'ADMINISTRADOR GENERAL (admin)' : 'EVALUACIÓN (Acceso Directo Demo)'
            }
          </span>
        </div>
        <span className="bg-[#d4af37] text-black px-2 py-0.5 rounded font-bold uppercase text-[10px]">
          {activeRole === 'superadmin' ? 'Control Total Base Datos' : activeRole === 'admin' ? 'Gestión Negocio' : 'Modo Demostración'}
        </span>
      </div>

      {/* Sub-navegación del Administrador */}
      <div className="flex flex-wrap gap-2 bg-[#262626] p-2 rounded-xl border border-gray-800">
        {[
          { id: 'citas', label: 'Citas', icon: ShieldCheck },
          { id: 'barberos', label: 'Barberos', icon: Users },
          { id: 'servicios', label: 'Servicios', icon: Scissors },
          { id: 'inventario', label: 'Inventario', icon: Package },
          { id: 'horarios', label: 'Horarios', icon: Clock },
          { id: 'usuarios', label: 'Administradores', icon: UserPlus },
          { id: 'config', label: 'Ajustes Negocio', icon: Store }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                tab === item.id ? 'bg-[#d4af37] text-black shadow-md' : 'text-gray-300 hover:bg-[#1a1a1a]'
              }`}
            >
              <Icon className="w-4 h-4" /> {item.label}
            </button>
          );
        })}
      </div>

      {/* 1. CITAS */}
      {tab === 'citas' && (
        <div className="bg-[#262626] border border-[#d4af37]/30 p-6 rounded-xl shadow-2xl">
          <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-4">
            <h2 className="text-xl font-bold text-[#d4af37]">Control de Citas Programadas</h2>
            <span className="bg-[#d4af37]/10 text-[#d4af37] text-xs px-3 py-1 rounded-full border border-[#d4af37]/30 font-semibold">
              {citas.length} Citas Registradas
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#1a1a1a] text-[#d4af37] uppercase text-xs">
                <tr>
                  <th className="p-3">Cliente</th>
                  <th className="p-3">Servicio</th>
                  <th className="p-3">Barbero</th>
                  <th className="p-3">Hora</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-gray-200">
                {citas.map((c) => (
                  <tr key={c.id} className="hover:bg-[#1a1a1a]/50">
                    <td className="p-3 font-medium text-white">{c.cliente}</td>
                    <td className="p-3">{c.servicio}</td>
                    <td className="p-3">{c.barbero}</td>
                    <td className="p-3 font-semibold text-[#d4af37]">{c.hora}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        c.estado === 'Confirmada' ? 'bg-emerald-900/60 text-emerald-300' :
                        c.estado === 'Cancelada' ? 'bg-rose-900/60 text-rose-300' : 'bg-amber-900/60 text-amber-300'
                      }`}>
                        {c.estado}
                      </span>
                    </td>
                    <td className="p-3 flex justify-center gap-2">
                      <button 
                        onClick={() => cambiarEstadoCita(c.id, 'Confirmada')} 
                        className="p-1.5 bg-emerald-700 hover:bg-emerald-600 rounded text-white"
                        title="Confirmar Cita"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => cambiarEstadoCita(c.id, 'Cancelada')} 
                        className="p-1.5 bg-amber-700 hover:bg-amber-600 rounded text-white"
                        title="Marcar como Cancelada"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => eliminarCita(c.id)} 
                        className="p-1.5 bg-rose-950/50 hover:bg-rose-900/80 text-rose-400 rounded border border-rose-800"
                        title="Eliminar cita atendida o cancelada"
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
      )}

      {/* 2. BARBEROS */}
      {tab === 'barberos' && (
        <div className="bg-[#262626] border border-[#d4af37]/30 p-6 rounded-xl space-y-4">
          <h3 className="text-lg font-bold text-[#d4af37]">Gestión de Equipo de Barberos</h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Nombre del barbero"
              value={nuevoBarbero}
              onChange={(e) => setNuevoBarbero(e.target.value)}
              className="flex-1 bg-[#1a1a1a] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
            />
            <button onClick={agregarBarbero} className="bg-[#d4af37] text-black px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1">
              <Plus className="w-4 h-4" /> Registrar Barbero
            </button>
          </div>
          <div className="divide-y divide-gray-800">
            {barberos.map(b => (
              <div key={b.id} className="py-3 flex justify-between items-center">
                <span className="text-sm text-white font-medium">{b.nombre}</span>
                <button onClick={() => eliminarBarbero(b.id)} className="text-rose-400 hover:text-rose-300 p-1.5 bg-rose-950/40 rounded border border-rose-800">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. SERVICIOS */}
      {tab === 'servicios' && (
        <div className="bg-[#262626] border border-[#d4af37]/30 p-6 rounded-xl space-y-4">
          <h3 className="text-lg font-bold text-[#d4af37]">Catálogo de Cortes y Tarifas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Nombre del servicio"
              value={nuevoServicio.nombre}
              onChange={(e) => setNuevoServicio({ ...nuevoServicio, nombre: e.target.value })}
              className="bg-[#1a1a1a] border border-gray-700 rounded-lg px-3 py-2 text-xs text-white"
            />
            <input
              type="text"
              placeholder="Precio ($ ej: 35000)"
              value={nuevoServicio.precio}
              onChange={(e) => setNuevoServicio({ ...nuevoServicio, precio: e.target.value })}
              className="bg-[#1a1a1a] border border-gray-700 rounded-lg px-3 py-2 text-xs text-white"
            />
            <button onClick={agregarServicio} className="bg-[#d4af37] text-black px-4 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1">
              <Plus className="w-4 h-4" /> Agregar Servicio
            </button>
          </div>
          <div className="divide-y divide-gray-800 mt-4">
            {servicios.map((s) => (
              <div key={s.id} className="py-3 flex justify-between items-center gap-4">
                {servicioEditando === s.id ? (
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={datosEdicion.nombre}
                      onChange={(e) => setDatosEdicion({ ...datosEdicion, nombre: e.target.value })}
                      className="bg-[#1a1a1a] border border-[#d4af37] rounded px-2 py-1 text-xs text-white"
                    />
                    <input
                      type="text"
                      value={datosEdicion.precio}
                      onChange={(e) => setDatosEdicion({ ...datosEdicion, precio: e.target.value })}
                      className="bg-[#1a1a1a] border border-[#d4af37] rounded px-2 py-1 text-xs text-white"
                    />
                  </div>
                ) : (
                  <>
                    <span className="text-sm text-white font-medium">{s.nombre}</span>
                    <span className="text-sm font-bold text-[#d4af37]">${s.precio?.toLocaleString()}</span>
                  </>
                )}
                <div className="flex items-center gap-2">
                  {servicioEditando === s.id ? (
                    <button onClick={() => guardarEdicionServicio(s.id)} className="p-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded">
                      <Check className="w-4 h-4" />
                    </button>
                  ) : (
                    <button onClick={() => iniciarEdicionServicio(s)} className="p-1.5 bg-gray-800 hover:bg-gray-700 text-[#d4af37] rounded">
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => eliminarServicio(s.id)} className="p-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 rounded border border-rose-800">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. INVENTARIO */}
      {tab === 'inventario' && (
        <div className="bg-[#262626] border border-[#d4af37]/30 p-6 rounded-xl space-y-4">
          <h3 className="text-lg font-bold text-[#d4af37]">Inventario de Productos y Stock</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <input
              type="text"
              placeholder="Nombre del Producto"
              value={nuevoProducto.nombre}
              onChange={(e) => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })}
              className="bg-[#1a1a1a] border border-gray-700 rounded-lg px-3 py-2 text-xs text-white"
            />
            <input
              type="text"
              placeholder="Precio ($ ej: 20000)"
              value={nuevoProducto.precio}
              onChange={(e) => setNuevoProducto({ ...nuevoProducto, precio: e.target.value })}
              className="bg-[#1a1a1a] border border-gray-700 rounded-lg px-3 py-2 text-xs text-white"
            />
            <input
              type="text"
              placeholder="Stock Inicial (Unidades)"
              value={nuevoProducto.stock}
              onChange={(e) => setNuevoProducto({ ...nuevoProducto, stock: e.target.value })}
              className="bg-[#1a1a1a] border border-gray-700 rounded-lg px-3 py-2 text-xs text-white"
            />
            <button 
              onClick={agregarProducto} 
              className="bg-[#d4af37] hover:bg-[#b89628] text-black px-4 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-all"
            >
              <Plus className="w-4 h-4" /> Guardar Producto
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {productos.map(p => (
              <div key={p.id} className="bg-[#1a1a1a] border border-gray-800 p-4 rounded-lg flex flex-col justify-between relative group">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-white text-sm pr-6">{p.nombre}</p>
                    <p className="text-xs text-[#d4af37] font-bold mt-1">${p.precio.toLocaleString()}</p>
                  </div>
                  <button 
                    onClick={() => eliminarProducto(p.id)} 
                    className="text-rose-400 hover:text-rose-300 p-1 hover:bg-rose-950/50 rounded transition-all"
                    title="Eliminar producto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-800">
                  <span className="text-xs text-gray-400">Existencias:</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => cambiarStock(p.id, -1)} className="bg-gray-800 hover:bg-gray-700 text-white px-2 py-0.5 rounded text-xs font-bold">-</button>
                    <span className="font-mono text-xs text-white px-1">{p.stock} unidades.</span>
                    <button onClick={() => cambiarStock(p.id, 1)} className="bg-gray-800 hover:bg-gray-700 text-white px-2 py-0.5 rounded text-xs font-bold">+</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. HORARIOS (RENOVADO CON SELECCIÓN FÁCIL AM/PM) */}
      {tab === 'horarios' && (
        <div className="bg-[#262626] border border-[#d4af37]/30 p-6 rounded-xl space-y-4">
          <h3 className="text-lg font-bold text-[#d4af37]">Configuración de Horarios de Atención</h3>
          
          {mensajeHorariosGuardados && (
            <div className="p-3 bg-emerald-900/60 border border-emerald-500 text-emerald-300 text-xs rounded-lg flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>¡Horarios comerciales actualizados con éxito!</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1 font-semibold">Hora de Apertura (AM/PM)</label>
              <select
                value={horarios.apertura}
                onChange={(e) => setHorarios({ ...horarios, apertura: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-gray-700 focus:border-[#d4af37] rounded-lg px-3 py-2 text-sm text-white font-medium outline-none"
              >
                {listaHorasAdmin.map((h, idx) => (
                  <option key={idx} value={h}>{h}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1 font-semibold">Hora de Cierre (AM/PM)</label>
              <select
                value={horarios.cierre}
                onChange={(e) => setHorarios({ ...horarios, cierre: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-gray-700 focus:border-[#d4af37] rounded-lg px-3 py-2 text-sm text-white font-medium outline-none"
              >
                {listaHorasAdmin.map((h, idx) => (
                  <option key={idx} value={h}>{h}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1 font-semibold">Días de Atención</label>
              <select
                value={horarios.dias}
                onChange={(e) => setHorarios({ ...horarios, dias: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-gray-700 focus:border-[#d4af37] rounded-lg px-3 py-2 text-sm text-white font-medium outline-none"
              >
                <option value="Lunes a Sábado">Lunes a Sábado</option>
                <option value="Lunes a Viernes">Lunes a Viernes</option>
                <option value="Todos los Días (L-D)">Todos los Días (Lunes a Domingo)</option>
                <option value="Martes a Domingo">Martes a Domingo</option>
              </select>
            </div>
          </div>

          <button
            onClick={guardarHorarios}
            className="bg-[#d4af37] hover:bg-[#b89628] text-black font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md mt-2"
          >
            <Save className="w-4 h-4" /> Guardar Horarios
          </button>
        </div>
      )}

      {/* 6. USUARIOS ADMINISTRADORES */}
      {tab === 'usuarios' && (
        <div className="bg-[#262626] border border-[#d4af37]/30 p-6 rounded-xl space-y-4">
          <h3 className="text-lg font-bold text-[#d4af37]">Registro de Usuarios Administradores</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Nombre Completo"
              value={nuevoAdmin.nombre}
              onChange={(e) => setNuevoAdmin({ ...nuevoAdmin, nombre: e.target.value })}
              className="bg-[#1a1a1a] border border-gray-700 rounded-lg px-3 py-2 text-xs text-white"
            />
            <input
              type="text"
              placeholder="Usuario ID (para login)"
              value={nuevoAdmin.usuario}
              onChange={(e) => setNuevoAdmin({ ...nuevoAdmin, usuario: e.target.value })}
              className="bg-[#1a1a1a] border border-gray-700 rounded-lg px-3 py-2 text-xs text-white"
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={nuevoAdmin.clave}
              onChange={(e) => setNuevoAdmin({ ...nuevoAdmin, clave: e.target.value })}
              className="bg-[#1a1a1a] border border-gray-700 rounded-lg px-3 py-2 text-xs text-white"
            />
          </div>
          <button onClick={agregarAdmin} className="bg-[#d4af37] text-black px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1">
            <UserPlus className="w-4 h-4" /> Registrar Nuevo Administrador
          </button>

          <div className="divide-y divide-gray-800 mt-4">
            {admins.map(a => (
              <div key={a.id} className="py-3 flex justify-between items-center text-xs">
                <div>
                  <p className="text-white font-medium text-sm">{a.nombre}</p>
                  <p className="text-gray-400">Usuario: <span className="text-[#d4af37]">@{a.usuario}</span></p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30 px-3 py-1 rounded font-semibold">
                    {a.rol}
                  </span>
                  {a.usuario !== 'elkin-dev26' && (
                    <button 
                      onClick={() => eliminarAdmin(a.id)} 
                      className="text-rose-400 hover:text-rose-300 p-1.5 bg-rose-950/40 hover:bg-rose-900/60 rounded border border-rose-800 transition-all"
                      title="Eliminar usuario administrador"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. AJUSTES DEL NEGOCIO */}
      {tab === 'config' && (
        <div className="bg-[#262626] border border-[#d4af37]/30 p-6 rounded-xl space-y-4">
          <h3 className="text-lg font-bold text-[#d4af37]">Ajustes del Establecimiento</h3>
          
          {mensajeGuardado && (
            <div className="p-3 bg-emerald-900/60 border border-emerald-500 text-emerald-300 text-xs rounded-lg flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>¡Nombre comercial actualizado con éxito en la plataforma!</span>
            </div>
          )}

          <div>
            <label className="block text-xs text-gray-400 mb-1">Nombre Comercial de la Barbería</label>
            <input
              type="text"
              value={nombreTemporal}
              onChange={(e) => setNombreTemporal(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-gray-700 focus:border-[#d4af37] rounded-lg px-3 py-2 text-sm text-white font-bold outline-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={guardarAjustesNegocio}
              className="bg-[#d4af37] hover:bg-[#b89628] text-black font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md"
            >
              <Save className="w-4 h-4" /> Guardar Cambios
            </button>
            <button
              onClick={restablecerNombre}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-4 h-4" /> Restablecer Nombre
            </button>
          </div>
        </div>
      )}
    </div>
  );
}