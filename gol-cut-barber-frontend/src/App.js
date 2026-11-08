import React, { useState, useEffect } from 'react';
import { 
  Scissors, User, Lock, LogOut, Calendar, Clock, 
  CheckCircle, Plus, Trash2, Shield, Search, Unlock, 
  History, MessageCircle, QrCode, PlusCircle, DollarSign, Terminal 
} from 'lucide-react';

export default function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [usuarioAutenticado, setUsuarioAutenticado] = useState(null);

  // Modal de Login State
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // WhatsApp de Soporte (Editable solo por SuperAdmin)
  const [devConfig, setDevConfig] = useState({
    whatsappSoporte: '573001234567',
    mensajeRenovacion: 'Hola Elkin, deseo renovar mi membresía mensual de Gol Cut Barber.'
  });

  // Estado Multi-Tenant (Barberías temporizadas por 30 días - SaaS)
  const [tenants, setTenants] = useState([
    { id: 't1', nombreBarberia: 'Gol Cut Barber - Sede Principal', dueno: 'Elkin Ramírez', estadoLicencia: 'Activa', diasRestantes: 28 },
    { id: 't2', nombreBarberia: 'Barbería Demo SENA', dueno: 'Instructor SENA', estadoLicencia: 'Activa', diasRestantes: 30 },
    { id: 't3', nombreBarberia: 'Barbería Demo Cliente', dueno: 'Cliente Comercial', estadoLicencia: 'Prueba 1 Mes', diasRestantes: 15 }
  ]);

  // Barberos (con control de cupos y expiración de clave a los 90 días)
  const [barberos, setBarberos] = useState([
    { id: 'b1', nombre: 'Elkin Ramírez', especialidad: 'Estilista Profesional', estado: 'Activo', cupoPago: true, diasClave: 85 },
    { id: 'b2', nombre: 'Mateo Gómez', especialidad: 'Barbero Senior', estado: 'Activo', cupoPago: true, diasClave: 45 },
    { id: 'b3', nombre: 'Carlos Andrés', especialidad: 'Especialista en Barba', estado: 'Inactivo', cupoPago: false, diasClave: 12 }
  ]);

  const [servicios, setServicios] = useState([
    { id: 's1', nombre: 'Corte de Cabello Clásico', precio: 25000, duracion: '30 min' },
    { id: 's2', nombre: 'Barba Tradicional con Toalla Caliente', precio: 15000, duracion: '20 min' },
    { id: 's3', nombre: 'Combo Corte + Barba', precio: 35000, duracion: '45 min' }
  ]);

  const [citas, setCitas] = useState([
    { id: 'c1', cliente: 'Juan Pérez', barbero: 'Elkin Ramírez', servicio: 'Corte de Cabello Clásico', fecha: '2026-11-08', hora: '10:00 AM', precio: 25000, estado: 'confirmada' },
    { id: 'c2', cliente: 'Carlos Gómez', barbero: 'Mateo Gómez', servicio: 'Combo Corte + Barba', fecha: '2026-11-08', hora: '11:30 AM', precio: 35000, estado: 'completada' }
  ]);

  // Auditoría de Marcación de Entrada y Salida
  const [logsSesion, setLogsSesion] = useState([
    { id: 'l1', usuario: 'Elkin Ramírez', rol: 'barbero', fechaHora: '2026-11-08 08:00 AM', evento: 'Marcación de Ingreso' },
    { id: 'l2', usuario: 'demo-sena', rol: 'evaluacion', fechaHora: '2026-11-08 09:15 AM', evento: 'Ingreso Audit SENA' }
  ]);

  // Protección anti-plagio
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  // Manejador de Login Estricto
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');

    const u = usernameInput.trim().toLowerCase();
    const p = passwordInput.trim();

    if (u === 'demo-sena' && p === 'sena2026') {
      exitoLogin({ username: 'demo-sena', nombre: 'Auditor SENA', role: 'evaluacion' });
    } else if (u === 'demo-cliente' && p === 'demo2026') {
      exitoLogin({ username: 'demo-cliente', nombre: 'Sucursal Demo', role: 'sucursal' });
    } else if (u === 'admin' && p === 'admin123') {
      exitoLogin({ username: 'admin', nombre: 'Administrador Local', role: 'admin' });
    } else if (u === 'elkin-dev26' && p === 'elkin2026') {
      exitoLogin({ username: 'elkin-dev26', nombre: 'SuperAdmin / Desarrollador', role: 'superadmin' });
    } else if (u === 'barbero' && p === 'barbero123') {
      exitoLogin({ username: 'barbero', nombre: 'Elkin Ramírez', role: 'barbero' });
    } else {
      setLoginError('Credenciales incorrectas. Verifique usuario y contraseña.');
    }
  };

  const exitoLogin = (userObj) => {
    setUsuarioAutenticado(userObj);
    setIsLoginOpen(false);
    setUsernameInput('');
    setPasswordInput('');

    const nuevoLog = {
      id: 'l' + Date.now(),
      usuario: userObj.nombre || userObj.username,
      rol: userObj.role,
      fechaHora: new Date().toLocaleString(),
      evento: 'Inicio de Sesión Exitoso'
    };
    setLogsSesion(prev => [nuevoLog, ...prev]);
  };

  const handleCerrarSesion = () => {
    if (usuarioAutenticado) {
      const nuevoLog = {
        id: 'l' + Date.now(),
        usuario: usuarioAutenticado.nombre || usuarioAutenticado.username,
        rol: usuarioAutenticado.role,
        fechaHora: new Date().toLocaleString(),
        evento: 'Marcación de Salida'
      };
      setLogsSesion(prev => [nuevoLog, ...prev]);
    }
    setUsuarioAutenticado(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* NAVBAR */}
      <header className="bg-slate-900 border-b border-amber-500/30 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/40 rounded-lg">
              <Scissors className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="font-extrabold text-amber-400 tracking-wider text-base md:text-lg">
                PELUQUERÍA GOL CUT BARBER
              </h1>
              <p className="text-xs text-slate-400 font-medium">Plataforma SaaS de Gestión & Reservas</p>
            </div>
          </div>

          <div>
            {usuarioAutenticado ? (
              <div className="flex items-center gap-3">
                <div className="bg-slate-950 border border-amber-500/30 px-3 py-1.5 rounded-lg flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-200">{usuarioAutenticado.nombre}</p>
                    <p className="text-[10px] text-amber-400 capitalize">{usuarioAutenticado.role}</p>
                  </div>
                </div>
                <button
                  onClick={handleCerrarSesion}
                  className="flex items-center gap-1.5 px-3 py-2 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded-lg text-xs font-bold border border-rose-500/30 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Salir
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition-all shadow-md shadow-amber-500/20"
              >
                <Lock className="w-3.5 h-3.5" />
                Iniciar Sesión
              </button>
            )}
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        {/* VISTA 1: CLIENTE PÚBLICO (RESERVAS + QR EXPRESO) */}
        {!usuarioAutenticado && (
          <VistaCliente 
            barberos={barberos.filter(b => b.estado === 'Activo')} 
            servicios={servicios} 
            citas={citas} 
            setCitas={setCitas} 
          />
        )}

        {/* VISTA 2: BARBERO (AGENDA + ATENCIÓN PRESENCIAL EXPRESA) */}
        {usuarioAutenticado && usuarioAutenticado.role === 'barbero' && (
          <VistaBarbero 
            barberoActual={usuarioAutenticado} 
            citas={citas} 
            setCitas={setCitas} 
            servicios={servicios} 
            onCerrarSesion={handleCerrarSesion} 
          />
        )}

        {/* VISTA 3: ADMINISTRADOR / DEMO SENA / DEMO CLIENTE (CUPOS + AUDITORÍA) */}
        {usuarioAutenticado && ['admin', 'sucursal', 'evaluacion'].includes(usuarioAutenticado.role) && (
          <VistaAdmin 
            usuario={usuarioAutenticado} 
            citas={citas} 
            setCitas={setCitas} 
            barberos={barberos} 
            setBarberos={setBarberos} 
            logsSesion={logsSesion} 
            devConfig={devConfig} 
          />
        )}

        {/* VISTA 4: DESARROLLADOR / SUPERADMIN (OCULTO - CONSOLA ROOT SAAS) */}
        {usuarioAutenticado && usuarioAutenticado.role === 'superadmin' && (
          <VistaSuperAdmin 
            tenants={tenants} 
            setTenants={setTenants} 
            devConfig={devConfig} 
            setDevConfig={setDevConfig} 
            logsSesion={logsSesion} 
          />
        )}
      </main>

      {/* MODAL DE AUTENTICACIÓN */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-md w-full p-6 relative shadow-2xl">
            <button 
              onClick={() => setIsLoginOpen(false)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-amber-400"
            >
              ✕
            </button>
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-center mx-auto mb-3 text-amber-400">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-amber-400">Autenticación de Usuarios</h3>
              <p className="text-xs text-slate-400 mt-1">Ingrese credenciales autorizadas de perfil</p>
            </div>

            {loginError && (
              <div className="mb-4 p-3 bg-rose-950/60 border border-rose-500/40 rounded-lg text-rose-300 text-xs text-center">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Usuario</label>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="Ej: demo-sena, admin, barbero, elkin-dev26"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Contraseña</label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-lg text-sm transition-all shadow-lg shadow-amber-500/20"
              >
                Validar e Iniciar Sesión
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

{/* SUBCOMPONENTE VISTA CLIENTE */}
function VistaCliente({ barberos, servicios, citas, setCitas }) {
  const [nombre, setNombre] = useState('');
  const [barbero, setBarbero] = useState(barberos[0]?.nombre || '');
  const [servicio, setServicio] = useState(servicios[0]?.nombre || '');
  const [fecha, setFecha] = useState('2026-11-09');
  const [hora, setHora] = useState('10:00 AM');
  const [citaCreada, setCitaCreada] = useState(null);

  const handleReserva = (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    const servObj = servicios.find(s => s.nombre === servicio);
    const nueva = {
      id: 'c' + Date.now(),
      cliente: nombre,
      barbero: barbero || barberos[0]?.nombre,
      servicio,
      fecha,
      hora,
      precio: servObj ? servObj.precio : 25000,
      estado: 'confirmada'
    };
    setCitas([nueva, ...citas]);
    setCitaCreada(nueva);
    setNombre('');
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-amber-500/20 pb-4">
        <h2 className="text-2xl font-bold text-amber-400 flex items-center gap-2">
          <Scissors className="w-7 h-7 text-amber-400" />
          Reserva de Citas en Línea
        </h2>
        <p className="text-slate-400 text-sm">Agende su turno presencial con confirmación por código QR</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            Formulario de Agendamiento
          </h3>
          <form onSubmit={handleReserva} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Nombre Completo</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ingrese su nombre"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-400"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Seleccionar Barbero</label>
              <select
                value={barbero}
                onChange={(e) => setBarbero(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200"
              >
                {barberos.map(b => (
                  <option key={b.id} value={b.nombre}>{b.nombre} ({b.especialidad})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Servicio</label>
              <select
                value={servicio}
                onChange={(e) => setServicio(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200"
              >
                {servicios.map(s => (
                  <option key={s.id} value={s.nombre}>{s.nombre} (${s.precio.toLocaleString()})</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Fecha</label>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Hora</label>
                <select
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200"
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="03:00 PM">03:00 PM</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-lg text-sm shadow-lg shadow-amber-500/20"
            >
              Confirmar Reserva
            </button>
          </form>
        </div>

        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 flex flex-col justify-between">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-4">
            <QrCode className="w-5 h-5 text-amber-400" />
            Ticket Expreso con Código QR
          </h3>
          {citaCreada ? (
            <div className="bg-slate-950 border border-amber-500/40 rounded-xl p-5 text-center space-y-3">
              <div className="inline-block p-2 bg-emerald-500/10 rounded-full text-emerald-400">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="text-emerald-400 font-bold text-base">¡Cita Registrada!</h4>
              <div className="text-xs text-slate-300 space-y-1 bg-slate-900 p-3 rounded-lg text-left">
                <p><span className="text-slate-400">Cliente:</span> {citaCreada.cliente}</p>
                <p><span className="text-slate-400">Servicio:</span> {citaCreada.servicio}</p>
                <p><span className="text-slate-400">Atiende:</span> {citaCreada.barbero}</p>
                <p><span className="text-slate-400">Fecha y Hora:</span> {citaCreada.fecha} - {citaCreada.hora}</p>
              </div>
              <div className="pt-2 flex justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=GOLCUT-${citaCreada.id}`}
                  alt="QR Cita"
                  className="border-2 border-amber-400 rounded-lg p-1 bg-white"
                />
              </div>
            </div>
          ) : (
            <div className="bg-slate-950/60 border border-dashed border-slate-800 rounded-xl p-8 text-center text-slate-500">
              <QrCode className="w-12 h-12 mx-auto text-slate-600 mb-2" />
              <p className="text-sm">Complete el formulario para generar su ticket con código QR</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

{/* SUBCOMPONENTE VISTA BARBERO */}
function VistaBarbero({ barberoActual, citas, setCitas, servicios, onCerrarSesion }) {
  const [servicioRapido, setServicioRapido] = useState(servicios[0]?.nombre || '');
  const [precioRapido, setPrecioRapido] = useState(servicios[0]?.precio || 25000);

  const citasBarbero = citas.filter(c => c.barbero.toLowerCase() === (barberoActual?.nombre || 'barbero').toLowerCase());

  const handleEstadoCita = (id, nuevoEstado) => {
    setCitas(citas.map(c => c.id === id ? { ...c, estado: nuevoEstado } : c));
  };

  const handleCorteDirecto = (e) => {
    e.preventDefault();
    const nueva = {
      id: 'c' + Date.now(),
      cliente: 'Cliente Presencial (Walk-in)',
      barbero: barberoActual.nombre || 'Elkin Ramírez',
      servicio: servicioRapido,
      fecha: new Date().toISOString().split('T')[0],
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      precio: Number(precioRapido),
      estado: 'completada'
    };
    setCitas([nueva, ...citas]);
  };

  const ingresosHoy = citasBarbero.filter(c => c.estado === 'completada').reduce((sum, c) => sum + (c.precio || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-amber-500/20 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-amber-400 flex items-center gap-2">
            <Scissors className="w-7 h-7 text-amber-400" />
            Panel de Barbero - {barberoActual?.nombre}
          </h2>
          <p className="text-slate-400 text-sm">Citas asignadas y registro expreso de clientes presenciales</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 border border-amber-500/30 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-400">Total Hoy:</span>
            <span className="text-sm font-bold text-emerald-400">${ingresosHoy.toLocaleString()}</span>
          </div>
          <button onClick={onCerrarSesion} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold">
            Marcar Salida
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
          <PlusCircle className="w-4 h-4" />
          Botonera Expresa (Cliente Sin Cita Previa)
        </h3>
        <form onSubmit={handleCorteDirecto} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select
            value={servicioRapido}
            onChange={(e) => setServicioRapido(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200"
          >
            {servicios.map(s => <option key={s.id} value={s.nombre}>{s.nombre}</option>)}
          </select>
          <input
            type="number"
            value={precioRapido}
            onChange={(e) => setPrecioRapido(e.target.value)}
            placeholder="Valor ($)"
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200"
            required
          />
          <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg text-xs">
            Sumar a Caja Directa
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {citasBarbero.map(c => (
          <div key={c.id} className="bg-slate-900 border border-amber-500/30 rounded-xl p-5 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-slate-100">{c.cliente}</h4>
                <p className="text-xs text-amber-400">{c.servicio}</p>
              </div>
              <span className="px-2 py-0.5 rounded text-xs bg-amber-500/20 text-amber-400 font-semibold">{c.estado}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400 border-t border-b border-slate-800 py-2">
              <span>{c.fecha} - {c.hora}</span>
              <span className="font-bold text-emerald-400">${(c.precio || 0).toLocaleString()}</span>
            </div>
            {c.estado !== 'completada' && (
              <button
                onClick={() => handleEstadoCita(c.id, 'completada')}
                className="w-full py-1.5 bg-emerald-950 text-emerald-400 rounded text-xs border border-emerald-500/40 font-bold"
              >
                Confirmar Atención
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

{/* SUBCOMPONENTE VISTA ADMIN */}
function VistaAdmin({ usuario, citas, setCitas, barberos, setBarberos, logsSesion, devConfig }) {
  const [tab, setTab] = useState('resumen');
  const [nuevoBarbero, setNuevoBarbero] = useState('');

  const urlWhatsapp = `https://wa.me/${devConfig?.whatsappSoporte || '573001234567'}?text=${encodeURIComponent(devConfig?.mensajeRenovacion || 'Hola')}`;

  const toggleBarbero = (id) => {
    setBarberos(barberos.map(b => b.id === id ? { ...b, estado: b.estado === 'Activo' ? 'Inactivo' : 'Activo' } : b));
  };

  const eliminarBarbero = (id) => {
    setBarberos(barberos.filter(b => b.id !== id));
  };

  const handleAgregar = (e) => {
    e.preventDefault();
    if (!nuevoBarbero.trim()) return;
    setBarberos([...barberos, { id: 'b' + Date.now(), nombre: nuevoBarbero, especialidad: 'Barbero Profesional', estado: 'Activo', diasClave: 90 }]);
    setNuevoBarbero('');
  };

  const ingresosTotales = citas.filter(c => c.estado === 'completada').reduce((sum, c) => sum + (c.precio || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-amber-500/20 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-amber-400 flex items-center gap-2">
            <Shield className="w-7 h-7 text-amber-400" />
            Panel del Administrador ({usuario?.nombre})
          </h2>
          <p className="text-slate-400 text-sm">Control de alquiler de cupos, auditoría de entradas y anulación de citas</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={urlWhatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg"
          >
            <MessageCircle className="w-4 h-4" /> Renovar WhatsApp
          </a>
          <div className="flex bg-slate-900 p-1 rounded-lg border border-amber-500/30">
            <button onClick={() => setTab('resumen')} className={`px-3 py-1 text-xs font-bold rounded ${tab === 'resumen' ? 'bg-amber-500 text-slate-950' : 'text-slate-300'}`}>Resumen</button>
            <button onClick={() => setTab('cupos')} className={`px-3 py-1 text-xs font-bold rounded ${tab === 'cupos' ? 'bg-amber-500 text-slate-950' : 'text-slate-300'}`}>Control Cupos</button>
            <button onClick={() => setTab('auditoria')} className={`px-3 py-1 text-xs font-bold rounded ${tab === 'auditoria' ? 'bg-amber-500 text-slate-950' : 'text-slate-300'}`}>Auditoría</button>
          </div>
        </div>
      </div>

      {tab === 'resumen' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-amber-500/30 p-5 rounded-xl">
            <span className="text-xs text-amber-400 font-bold uppercase">Ingresos Totales</span>
            <p className="text-2xl font-bold text-slate-100">${ingresosTotales.toLocaleString()}</p>
          </div>
          <div className="bg-slate-900 border border-amber-500/30 p-5 rounded-xl">
            <span className="text-xs text-amber-400 font-bold uppercase">Citas Atendidas</span>
            <p className="text-2xl font-bold text-slate-100">{citas.filter(c => c.estado === 'completada').length}</p>
          </div>
          <div className="bg-slate-900 border border-amber-500/30 p-5 rounded-xl">
            <span className="text-xs text-amber-400 font-bold uppercase">Citas Pendientes</span>
            <p className="text-2xl font-bold text-slate-100">{citas.filter(c => c.estado === 'confirmada').length}</p>
          </div>
        </div>
      )}

      {tab === 'cupos' && (
        <div className="space-y-4">
          <form onSubmit={handleAgregar} className="flex gap-2 bg-slate-900 p-3 rounded-xl border border-amber-500/30">
            <input
              type="text"
              placeholder="Nombre del barbero..."
              value={nuevoBarbero}
              onChange={(e) => setNuevoBarbero(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200"
              required
            />
            <button type="submit" className="bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs">Crear Barbero</button>
          </form>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {barberos.map(b => (
              <div key={b.id} className="bg-slate-900 border border-amber-500/30 p-4 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <h4 className="font-bold text-slate-100">{b.nombre}</h4>
                  <span className={`px-2 py-0.5 text-xs font-bold rounded ${b.estado === 'Activo' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>{b.estado}</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => toggleBarbero(b.id)} className="flex-1 py-1 bg-slate-950 text-slate-200 rounded text-xs border border-slate-700">
                    {b.estado === 'Activo' ? 'Bloquear Cupo' : 'Activar (Pago)'}
                  </button>
                  <button onClick={() => eliminarBarbero(b.id)} className="p-1 bg-rose-950 text-rose-400 rounded border border-rose-500/30">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'auditoria' && (
        <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-4">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-amber-400 uppercase">
              <tr>
                <th className="p-2">Personal</th>
                <th className="p-2">Rol</th>
                <th className="p-2">Fecha/Hora</th>
                <th className="p-2">Evento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {logsSesion.map(l => (
                <tr key={l.id}>
                  <td className="p-2 font-bold">{l.usuario}</td>
                  <td className="p-2 capitalize">{l.rol}</td>
                  <td className="p-2 text-slate-400">{l.fechaHora}</td>
                  <td className="p-2 text-emerald-400">{l.evento}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

{/* SUBCOMPONENTE VISTA SUPERADMIN (DESARROLLADOR) */}
function VistaSuperAdmin({ tenants, setTenants, devConfig, setDevConfig }) {
  const [whatsapp, setWhatsapp] = useState(devConfig?.whatsappSoporte || '573001234567');

  const handleWhatsappSave = (e) => {
    e.preventDefault();
    setDevConfig({ ...devConfig, whatsappSoporte: whatsapp });
    alert('¡WhatsApp de soporte actualizado!');
  };

  const toggleTenant = (id) => {
    setTenants(tenants.map(t => t.id === id ? { ...t, estadoLicencia: t.estadoLicencia === 'Activa' ? 'Pausada' : 'Activa' } : t));
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-amber-500/30 pb-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-amber-400 flex items-center gap-2">
            <Terminal className="w-7 h-7 text-amber-400" />
            Consola del Desarrollador (`elkin-dev26`)
          </h2>
          <p className="text-slate-400 text-sm">Control multi-barbería SaaS y WhatsApp de soporte</p>
        </div>
        <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-bold rounded-lg">Acceso Root Oculto</span>
      </div>

      <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-amber-400">WhatsApp de Soporte Tecnico</h3>
        <form onSubmit={handleWhatsappSave} className="flex gap-2">
          <input
            type="text"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200"
          />
          <button type="submit" className="bg-emerald-600 text-white font-bold px-4 py-2 rounded-lg text-xs">Guardar</button>
        </form>
      </div>

      <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-amber-400">Barberías SaaS Registradas (Control de Licencias)</h3>
        <div className="space-y-2">
          {tenants.map(t => (
            <div key={t.id} className="bg-slate-950 p-3 rounded-lg flex justify-between items-center border border-slate-800">
              <div>
                <p className="text-xs font-bold text-slate-100">{t.nombreBarberia}</p>
                <p className="text-[10px] text-slate-400">Dueño: {t.dueno} | Licencia: {t.diasRestantes} días</p>
              </div>
              <button onClick={() => toggleTenant(t.id)} className="px-3 py-1 bg-amber-500 text-slate-950 font-bold rounded text-xs">
                {t.estadoLicencia === 'Activa' ? 'Pausar' : 'Activar'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}