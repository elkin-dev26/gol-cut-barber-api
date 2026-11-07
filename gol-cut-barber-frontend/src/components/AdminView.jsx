import React, { useState } from 'react';
import { 
  ShieldCheck, Package, Users, Scissors, Store, Plus, Trash2, Edit3, Check, X, UserPlus, Clock, Terminal, Save, RotateCcw
} from 'lucide-react';

export default function AdminView({ config, setConfig, barberos, setBarberos, servicios, setServicios, activeRole }) {
  const [tab, setTab] = useState('citas');

  // Control local del nombre comercial en Ajustes del Negocio
  const [nombreTemporal, setNombreTemporal] = useState(config.nombreNegocio);
  const [mensajeGuardado, setMensajeGuardado] = useState(false);

  // Citas de prueba
  const [citas, setCitas] = useState([
    { id: 1, cliente: 'Elkin Ramírez', servicio: 'Combo Oro Corte VIP', barbero: 'Carlos Pérez', hora: '14:00', estado: 'Pendiente' },
    { id: 2, cliente: 'Juan Pablo Marín', servicio: 'Corte Sombreado', barbero: 'Mateo Gómez', hora: '15:30', estado: 'Confirmada' }
  ]);

  // Inventario
  const [productos, setProductos] = useState([
    { id: 1, nombre: 'Cera Moldear Mate (Oro)', stock: 15, precio: 32000 },
    { id: 2, nombre: 'Aceite de Barba Hidratante', stock: 8, precio: 28000 },
    { id: 3, nombre: 'Champú Anticaída Gol Cut', stock: 20, precio: 45000 }
  ]);

  // Horarios
  const [horarios, setHorarios] = useState({ apertura: '09:00', cierre: '19:00', dias: 'Lunes a Sábado' });

  // Lista de Administradores
  const [admins, setAdmins] = useState([
    { id: 1, nombre: 'Elkin Ramírez', usuario: 'elkin-dev26', rol: 'SuperAdmin / Programador' },
    { id: 2, nombre: 'Admin Barbershop', usuario: 'admin', rol: 'Administrador Local' }
  ]);

  // Formularios locales
  const [nuevoBarbero, setNuevoBarbero] = useState('');
  const [nuevoServicio, setNuevoServicio] = useState({ nombre: '', precio: '' });
  const [nuevoProducto, setNuevoProducto] = useState({ nombre: '', stock: '', precio: '' });
  const [nuevoAdmin, setNuevoAdmin] = useState({ nombre: '', usuario: '', clave: '' });

  // Edición de Servicios
  const [servicioEditando, setServicioEditando] = useState(null);
  const [datosEdicion, setDatosEdicion] = useState({ nombre: '', precio: '' });

  // Acciones Citas
  const cambiarEstadoCita = (id, nuevoEstado) => {
    setCitas(citas.map(c => c.id === id ? { ...c, estado: nuevoEstado } : c));
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
    setServicios([...servicios, { id: Date.now(), nombre: nuevoServicio.nombre, precio: parseInt(nuevoServicio.precio) }]);
    setNuevoServicio({ nombre: '', precio: '' });
  };

  const iniciarEdicionServicio = (servicio) => {
    setServicioEditando(servicio.id);
    setDatosEdicion({ nombre: servicio.nombre, precio: servicio.precio });
  };

  const guardarEdicionServicio = (id) => {
    setServicios(servicios.map(s => 
      s.id === id ? { ...s, nombre: datosEdicion.nombre, precio: parseInt(datosEdicion.precio) || 0 } : s
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
    if (!nuevoProducto.nombre) return;
    setProductos([...productos, { 
      id: Date.now(), 
      nombre: nuevoProducto.nombre, 
      stock: parseInt(nuevoProducto.stock) || 0, 
      precio: parseInt(nuevoProducto.precio) || 0 
    }]);
    setNuevoProducto({ nombre: '', stock: '', precio: '' });
  };

  const eliminarProducto = (id) => {
    setProductos(productos.filter(p => p.id !== id));
  };

  // Acciones Administradores (Crear y Eliminar)
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
              activeRole === 'admin' ? 'ADMINISTRADOR GENERAL (admin)' : 'EVALUACIÓN SENA (Acceso Directo Demo)'
            }
          </span>
        </div>
        <span className="bg-[#d4af37] text-black px-2 py-0.5 rounded font-bold uppercase text-[10px]">
          {activeRole === 'superadmin' ? 'Control Total Base Datos' : activeRole === 'admin' ? 'Gestión Negocio' : 'Modo Demostración SENA'}
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
                  <th className="p-3 text-center">Acción</th>
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
                      <button onClick={() => cambiarEstadoCita(c.id, 'Confirmada')} className="p-1.5 bg-emerald-700 hover:bg-emerald-600 rounded text-white">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => cambiarEstadoCita(c.id, 'Cancelada')} className="p-1.5 bg-rose-700 hover:bg-rose-600 rounded text-white">
                        <X className="w-4 h-4" />
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
              type="number"
              placeholder="Precio ($)"
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
                      type="number"
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Nombre del Producto"
              value={nuevoProducto.nombre}
              onChange={(e) => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })}
              className="bg-[#1a1a1a] border border-gray-700 rounded-lg px-3 py-2 text-xs text-white"
            />
            <input
              type="number"
              placeholder="Stock Inicial"
              value={nuevoProducto.stock}
              onChange={(e) => setNuevoProducto({ ...nuevoProducto, stock: e.target.value })}
              className="bg-[#1a1a1a] border border-gray-700 rounded-lg px-3 py-2 text-xs text-white"
            />
            <button onClick={agregarProducto} className="bg-[#d4af37] text-black px-4 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1">
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
                  <button onClick={() => eliminarProducto(p.id)} className="text-rose-400 hover:text-rose-300 p-1 hover:bg-rose-950/50 rounded transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-800">
                  <span className="text-xs text-gray-400">Stock:</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => cambiarStock(p.id, -1)} className="bg-gray-800 hover:bg-gray-700 text-white px-2 py-0.5 rounded text-xs font-bold">-</button>
                    <span className="font-mono text-xs text-white px-1">{p.stock} un.</span>
                    <button onClick={() => cambiarStock(p.id, 1)} className="bg-gray-800 hover:bg-gray-700 text-white px-2 py-0.5 rounded text-xs font-bold">+</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. HORARIOS */}
      {tab === 'horarios' && (
        <div className="bg-[#262626] border border-[#d4af37]/30 p-6 rounded-xl space-y-4">
          <h3 className="text-lg font-bold text-[#d4af37]">Configuración de Horarios de Atención</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Hora Apertura</label>
              <input
                type="time"
                value={horarios.apertura}
                onChange={(e) => setHorarios({ ...horarios, apertura: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Hora Cierre</label>
              <input
                type="time"
                value={horarios.cierre}
                onChange={(e) => setHorarios({ ...horarios, cierre: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Días de Atención</label>
              <input
                type="text"
                value={horarios.dias}
                onChange={(e) => setHorarios({ ...horarios, dias: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* 6. USUARIOS ADMINISTRADORES (CREAR Y ELIMINAR) */}
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