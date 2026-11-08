import React, { useState, useEffect } from 'react';
import { 
  Scissors, User, Lock, LogOut, Calendar, Clock, 
  CheckCircle, Plus, Trash2, Shield, Search, Unlock, 
  History, MessageCircle, QrCode, PlusCircle, DollarSign, Terminal, Package, Key, Edit, Pause, Play, XCircle, Gift, Award, TrendingUp, AlertCircle
} from 'lucide-react';

export default function App() {
  const [activeRole, setActiveRole] = useState('cliente');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [usuarioAutenticado, setUsuarioAutenticado] = useState(null);

  // Modal Login State
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Configuración WhatsApp de Soporte & Incentivos
  const [devConfig, setDevConfig] = useState({
    whatsappSoporte: '573001234567',
    mensajeRenovacion: 'Hola Elkin, deseo renovar mi membresía mensual de Gol Cut Barber.',
    incentivoCumpleanosActivo: true,
    porcentajeCumpleanos: 10,
    incentivoBarberoActivo: true,
    porcentajeDescuentoSilla: 5,
    metaUsoCitasBarbero: 15
  });

  // Multi-Tenant SaaS
  const [tenants, setTenants] = useState([
    { id: 't1', nombreBarberia: 'Gol Cut Barber - Sede Principal', dueno: 'Elkin Ramírez', estadoLicencia: 'Activa', diasRestantes: 28 },
    { id: 't2', nombreBarberia: 'Barbería Demo Evaluación', dueno: 'Evaluador Técnico', estadoLicencia: 'Activa', diasRestantes: 30 },
    { id: 't3', nombreBarberia: 'Barbería Demo Comercial', dueno: 'Cliente Comercial', estadoLicencia: 'Prueba 1 Mes', diasRestantes: 15 }
  ]);

  // Base de datos de Barberos con Usuario y Contraseña Individuales
  const [barberos, setBarberos] = useState([
    { id: 'b1', username: 'elkin', nombre: 'Elkin Ramírez', especialidad: 'Estilista Profesional', estado: 'Activo', cupoPago: true, claveAcceso: 'barbero123', fechaExpiracion: '2027-02-08', atencionesApp: 18 },
    { id: 'b2', username: 'mateo', nombre: 'Mateo Gómez', especialidad: 'Barbero Senior', estado: 'Activo', cupoPago: true, claveAcceso: 'mateo2026', fechaExpiracion: '2027-02-08', atencionesApp: 12 },
    { id: 'b3', username: 'carlos', nombre: 'Carlos Andrés', especialidad: 'Especialista en Barba', estado: 'Inactivo', cupoPago: false, claveAcceso: 'carlos2026', fechaExpiracion: '2026-08-01', atencionesApp: 4 }
  ]);

  // Catálogo de Productos
  const [productos, setProductos] = useState([
    { id: 'p1', nombre: 'Cera Moldear Mate Gold', precio: 30000, stock: 15 },
    { id: 'p2', nombre: 'Champú Anticaída Barba & Cabello', precio: 45000, stock: 10 },
    { id: 'p3', nombre: 'Aceite Hidratante para Barba', precio: 25000, stock: 20 }
  ]);

  const [servicios, setServicios] = useState([
    { id: 's1', nombre: 'Corte de Cabello Clásico', precio: 25000, duracion: '30 min' },
    { id: 's2', nombre: 'Barba Tradicional con Toalla Caliente', precio: 15000, duracion: '20 min' },
    { id: 's3', nombre: 'Combo Corte + Barba', precio: 35000, duracion: '45 min' }
  ]);

  const [citas, setCitas] = useState([
    { id: 'c1', cliente: 'Juan Pérez', barbero: 'Elkin Ramírez', servicio: 'Corte de Cabello Clásico', fecha: '2026-11-08', hora: '10:00 AM', precio: 25000, estado: 'confirmada', esCumpleanos: true },
    { id: 'c2', cliente: 'Carlos Gómez', barbero: 'Mateo Gómez', servicio: 'Combo Corte + Barba', fecha: '2026-11-08', hora: '11:30 AM', precio: 35000, estado: 'completada', esCumpleanos: false }
  ]);

  // Auditoría
  const [logsSesion, setLogsSesion] = useState([
    { id: 'l1', usuario: 'Elkin Ramírez', rol: 'barbero', fechaHora: '2026-11-08 08:00 AM', evento: 'Marcación de Ingreso' },
    { id: 'l2', usuario: 'demo-sena', rol: 'evaluacion', fechaHora: '2026-11-08 09:15 AM', evento: 'Ingreso Auditoría Técnica' }
  ]);

  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  // SISTEMA DE AUTENTICACIÓN DINÁMICA POR ROL Y POR BARBERO
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');

    const u = usernameInput.trim().toLowerCase();
    const p = passwordInput.trim();

    // 1. Roles Administrativos y Técnicos
    if (u === 'demo-sena' && p === 'sena2026') {
      exitoLogin({ username: 'demo-sena', nombre: 'Auditoría Técnica', role: 'evaluacion' });
      return;
    } 
    if (u === 'demo-cliente' && p === 'demo2026') {
      exitoLogin({ username: 'demo-cliente', nombre: 'Sucursal Demo', role: 'sucursal' });
      return;
    } 
    if (u === 'admin' && p === 'admin123') {
      exitoLogin({ username: 'admin', nombre: 'Administrador Local', role: 'admin' });
      return;
    } 
    if (u === 'elkin-dev26' && p === 'elkin2026') {
      exitoLogin({ username: 'elkin-dev26', nombre: 'SuperAdmin / Desarrollador', role: 'superadmin' });
      return;
    }

    // 2. Autenticación Individual por Barbero
    const barberoEncontrado = barberos.find(b => b.username.toLowerCase() === u && b.claveAcceso === p);

    if (barberoEncontrado) {
      if (barberoEncontrado.estado === 'Inactivo') {
        setLoginError('Su usuario se encuentra inactivo o pausado en la barbería.');
        return;
      }

      const hoy = new Date();
      const fechaVencimiento = new Date(barberoEncontrado.fechaExpiracion);

      if (hoy > fechaVencimiento) {
        setLoginError('Su acceso ha caducado por superar los 3 meses. Contacte al Administrador.');
        return;
      }

      exitoLogin({ 
        username: barberoEncontrado.username, 
        nombre: barberoEncontrado.nombre, 
        role: 'barbero',
        barberoObj: barberoEncontrado
      });
      return;
    }

    setLoginError('Credenciales incorrectas. Verifique usuario y contraseña.');
  };

  const exitoLogin = (userObj) => {
    setUsuarioAutenticado(userObj);
    setActiveRole(userObj.role);
    setIsLoginOpen(false);
    setUsernameInput('');
    setPasswordInput('');

    setLogsSesion(prev => [{
      id: 'l' + Date.now(),
      usuario: userObj.nombre,
      rol: userObj.role,
      fechaHora: new Date().toLocaleString(),
      evento: 'Inicio de Sesión Exitoso'
    }, ...prev]);
  };

  const handleCerrarSesion = () => {
    setUsuarioAutenticado(null);
    setActiveRole('cliente');
  };

  const handleCambioSeleccion = (e) => {
    const targetRole = e.target.value;
    if (targetRole === 'cliente') {
      setActiveRole('cliente');
      return;
    }

    if (!usuarioAutenticado || usuarioAutenticado.role !== targetRole) {
      setIsLoginOpen(true);
    } else {
      setActiveRole(targetRole);
    }
  };

  const ingresarComoSoporteAdmin = (nombreTenant) => {
    exitoLogin({ username: 'soporte-dev', nombre: `Soporte en ${nombreTenant}`, role: 'admin' });
  };

  return (
    <div style={{ backgroundColor: '#020617', color: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%', overflowX: 'hidden' }}>
      {/* NAVBAR RESPONSIVE */}
      <header style={{ backgroundColor: '#0f172a', borderBottom: '1px solid #f59e0b', padding: '12px 16px', position: 'sticky', top: 0, zIndex: 40, width: '100%', boxSizing: 'border-box' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ padding: '6px', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid #f59e0b', borderRadius: '8px' }}>
              <Scissors style={{ width: '20px', height: '20px', color: '#fbbf24' }} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#fbbf24', letterSpacing: '0.03em' }}>
                GOL CUT BARBER
              </h1>
              <p style={{ margin: 0, fontSize: '10px', color: '#94a3b8' }}>Gestión & Reservas SaaS</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', width: '100%', justifyContent: 'space-between', maxWidth: '400px' }}>
            <select
              value={activeRole}
              onChange={handleCambioSeleccion}
              style={{ flex: 1, backgroundColor: '#020617', border: '1px solid #f59e0b', color: '#f8fafc', fontSize: '11px', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
            >
              <option value="cliente">Vista: Cliente (Reservas)</option>
              <option value="barbero">Vista: Barbero</option>
              <option value="admin">Vista: Administrador</option>
              <option value="evaluacion">Perfil Evaluación Técnica</option>
              <option value="sucursal">Perfil Demostración / Sucursal</option>
              {usuarioAutenticado && usuarioAutenticado.role === 'superadmin' && (
                <option value="superadmin">🔒 Consola Desarrollador Root</option>
              )}
            </select>

            {usuarioAutenticado ? (
              <button
                onClick={handleCerrarSesion}
                style={{ backgroundColor: '#881337', color: '#fda4af', border: '1px solid #f43f5e', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', whitespace: 'nowrap' }}
              >
                Salir ({usuarioAutenticado.nombre.split(' ')[0]})
              </button>
            ) : (
              <button
                onClick={() => setIsLoginOpen(true)}
                style={{ backgroundColor: '#f59e0b', color: '#020617', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', whitespace: 'nowrap' }}
              >
                Ingresar
              </button>
            )}
          </div>
        </div>
      </header>

      {/* VISTAS MAIN */}
      <main style={{ maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '16px', flex: 1, boxSizing: 'border-box' }}>
        {activeRole === 'cliente' && (
          <VistaCliente 
            barberos={barberos.filter(b => b.estado === 'Activo')} 
            servicios={servicios} 
            citas={citas} 
            setCitas={setCitas} 
            devConfig={devConfig}
          />
        )}

        {activeRole === 'barbero' && (
          <VistaBarbero 
            barberoActual={usuarioAutenticado?.barberoObj || barberos[0]} 
            citas={citas} 
            setCitas={setCitas} 
            servicios={servicios} 
            onCerrarSesion={handleCerrarSesion} 
            devConfig={devConfig}
          />
        )}

        {['admin', 'sucursal', 'evaluacion'].includes(activeRole) && (
          <VistaAdmin 
            usuario={usuarioAutenticado || { nombre: 'Auditoría Técnica' }} 
            citas={citas} 
            setCitas={setCitas} 
            barberos={barberos} 
            setBarberos={setBarberos} 
            productos={productos}
            setProductos={setProductos}
            logsSesion={logsSesion} 
            devConfig={devConfig}
            setDevConfig={setDevConfig}
          />
        )}

        {activeRole === 'superadmin' && (
          <VistaSuperAdmin 
            tenants={tenants} 
            setTenants={setTenants} 
            devConfig={devConfig} 
            setDevConfig={setDevConfig} 
            onIngresarComoSoporte={ingresarComoSoporteAdmin}
          />
        )}
      </main>

      {/* MODAL LOGIN RESPONSIVE */}
      {isLoginOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #f59e0b', borderRadius: '16px', maxWidth: '380px', width: '100%', padding: '20px', position: 'relative', boxSizing: 'border-box' }}>
            <button 
              onClick={() => setIsLoginOpen(false)} 
              style={{ position: 'absolute', top: '12px', right: '12px', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
            >
              ✕
            </button>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid #f59e0b', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px auto' }}>
                <Lock style={{ width: '20px', height: '20px', color: '#fbbf24' }} />
              </div>
              <h3 style={{ margin: 0, color: '#fbbf24', fontSize: '18px', fontWeight: 'bold' }}>Ingreso Seguro</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#94a3b8' }}>Ingrese sus credenciales personales</p>
            </div>

            {loginError && (
              <div style={{ marginBottom: '12px', padding: '8px', backgroundColor: 'rgba(136, 19, 55, 0.6)', border: '1px solid #f43f5e', borderRadius: '6px', color: '#fda4af', fontSize: '11px', textAlign: 'center' }}>
                {loginError}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>Usuario</label>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="Ej: elkin, mateo, admin, demo-sena"
                  style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '6px', padding: '8px', color: '#f8fafc', fontSize: '13px', boxSizing: 'border-box' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>Contraseña</label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '6px', padding: '8px', color: '#f8fafc', fontSize: '13px', boxSizing: 'border-box' }}
                  required
                />
              </div>
              <button
                type="submit"
                style={{ backgroundColor: '#f59e0b', color: '#020617', fontWeight: 'bold', padding: '10px', borderRadius: '6px', fontSize: '13px', border: 'none', cursor: 'pointer', marginTop: '4px' }}
              >
                Validar Sesión
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

{/* VISTA CLIENTE */}
function VistaCliente({ barberos, servicios, citas, setCitas, devConfig }) {
  const [modo, setModo] = useState('programada');
  const [nombre, setNombre] = useState('');
  const [fechaNac, setFechaNac] = useState('');
  const [barbero, setBarbero] = useState(barberos[0]?.nombre || '');
  const [servicio, setServicio] = useState(servicios[0]?.nombre || '');
  const [fecha, setFecha] = useState('2026-11-09');
  const [hora, setHora] = useState('10:00 AM');
  const [citaCreada, setCitaCreada] = useState(null);

  const esCumpleanos = () => {
    if (!fechaNac) return false;
    const hoy = new Date();
    const nac = new Date(fechaNac);
    return hoy.getDate() === nac.getDate() && hoy.getMonth() === nac.getMonth();
  };

  const handleReserva = (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    const servObj = servicios.find(s => s.nombre === servicio);
    const cumple = esCumpleanos();
    let precioFinal = servObj ? servObj.precio : 25000;

    if (cumple && devConfig?.incentivoCumpleanosActivo) {
      const desc = (precioFinal * devConfig.porcentajeCumpleanos) / 100;
      precioFinal = precioFinal - desc;
    }

    const nueva = {
      id: 'c' + Date.now(),
      cliente: nombre,
      barbero: barbero || barberos[0]?.nombre,
      servicio,
      fecha: modo === 'qr_walkin' ? new Date().toISOString().split('T')[0] : fecha,
      hora: modo === 'qr_walkin' ? 'Atención Inmediata (QR)' : hora,
      precio: precioFinal,
      estado: 'confirmada',
      esCumpleanos: cumple
    };

    setCitas([nueva, ...citas]);
    setCitaCreada(nueva);
    setNombre('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ borderBottom: '1px solid rgba(245, 158, 11, 0.2)', paddingBottom: '12px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#fbbf24', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Scissors style={{ width: '22px', height: '22px' }} />
          Módulo de Atenciones & Reservas
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '12px', margin: '4px 0 0 0' }}>Agendamiento previo o registro directo por QR en sede</p>
      </div>

      <div style={{ display: 'flex', gap: '8px', backgroundColor: '#0f172a', padding: '6px', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
        <button
          onClick={() => { setModo('programada'); setCitaCreada(null); }}
          style={{ flex: 1, padding: '8px', backgroundColor: modo === 'programada' ? '#f59e0b' : 'transparent', color: modo === 'programada' ? '#020617' : '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
        >
          📅 Cita Programada
        </button>
        <button
          onClick={() => { setModo('qr_walkin'); setCitaCreada(null); }}
          style={{ flex: 1, padding: '8px', backgroundColor: modo === 'qr_walkin' ? '#f59e0b' : 'transparent', color: modo === 'qr_walkin' ? '#020617' : '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
        >
          📱 Escanear QR (Sin Cita / En Sede)
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', width: '100%' }}>
        <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', padding: '16px', boxSizing: 'border-box' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#f8fafc', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {modo === 'programada' ? <Calendar style={{ width: '18px', height: '18px', color: '#fbbf24' }} /> : <QrCode style={{ width: '18px', height: '18px', color: '#fbbf24' }} />}
            {modo === 'programada' ? 'Formulario Reserva Anticipada' : 'Registro Expreso de Llegada'}
          </h3>

          <form onSubmit={handleReserva} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>Nombre Completo</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Su nombre..."
                style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '6px', padding: '8px', color: '#f8fafc', fontSize: '13px', boxSizing: 'border-box' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>Fecha de Nacimiento (Premio Cumpleaños 🎁)</label>
              <input
                type="date"
                value={fechaNac}
                onChange={(e) => setFechaNac(e.target.value)}
                style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '6px', padding: '8px', color: '#f8fafc', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            {esCumpleanos() && devConfig?.incentivoCumpleanosActivo && (
              <div style={{ backgroundColor: 'rgba(5, 150, 105, 0.2)', border: '1px solid #059669', padding: '8px', borderRadius: '6px', color: '#34d399', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Gift style={{ width: '16px', height: '16px' }} />
                <span><strong>¡Felicidades!</strong> Recibes un {devConfig.porcentajeCumpleanos}% de descuento especial.</span>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>Seleccionar Barbero</label>
              <select
                value={barbero}
                onChange={(e) => setBarbero(e.target.value)}
                style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '6px', padding: '8px', color: '#f8fafc', fontSize: '13px', boxSizing: 'border-box' }}
              >
                {barberos.map(b => (
                  <option key={b.id} value={b.nombre}>{b.nombre} ({b.especialidad})</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>Servicio</label>
              <select
                value={servicio}
                onChange={(e) => setServicio(e.target.value)}
                style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '6px', padding: '8px', color: '#f8fafc', fontSize: '13px', boxSizing: 'border-box' }}
              >
                {servicios.map(s => (
                  <option key={s.id} value={s.nombre}>{s.nombre} (${s.precio.toLocaleString()})</option>
                ))}
              </select>
            </div>

            {modo === 'programada' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>Fecha</label>
                  <input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '6px', padding: '8px', color: '#f8fafc', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>Hora</label>
                  <select
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                    style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '6px', padding: '8px', color: '#f8fafc', fontSize: '13px', boxSizing: 'border-box' }}
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              style={{ backgroundColor: '#f59e0b', color: '#020617', fontWeight: 'bold', padding: '10px', borderRadius: '6px', fontSize: '13px', border: 'none', cursor: 'pointer', marginTop: '4px' }}
            >
              {modo === 'programada' ? 'Confirmar Cita Programada' : 'Ingresar a Lista de Espera Sede'}
            </button>
          </form>
        </div>

        <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', boxSizing: 'border-box' }}>
          {modo === 'qr_walkin' && !citaCreada ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <h4 style={{ color: '#fbbf24', margin: 0, fontSize: '14px' }}>Cartel QR Recepción de Barbería</h4>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>Imprima este código para que los clientes sin cita se registren directamente.</p>
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://gol-cut-barber-api.vercel.app?modo=qr_walkin"
                alt="QR Recepción"
                style={{ border: '3px solid #fbbf24', borderRadius: '12px', padding: '6px', backgroundColor: '#ffffff', width: '160px', height: '160px', marginTop: '8px' }}
              />
            </div>
          ) : citaCreada ? (
            <div style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #059669', borderRadius: '10px', padding: '12px', boxSizing: 'border-box' }}>
              <CheckCircle style={{ width: '28px', height: '28px', color: '#34d399', margin: '0 auto 6px auto' }} />
              <h4 style={{ color: '#34d399', margin: '0 0 6px 0', fontSize: '14px' }}>¡Registro Exitoso en Sistema!</h4>
              <div style={{ fontSize: '11px', color: '#cbd5e1', textAlign: 'left', backgroundColor: '#0f172a', padding: '8px', borderRadius: '6px' }}>
                <p style={{ margin: '2px 0' }}><span style={{ color: '#94a3b8' }}>Cliente:</span> {citaCreada.cliente}</p>
                <p style={{ margin: '2px 0' }}><span style={{ color: '#94a3b8' }}>Barbero:</span> {citaCreada.barbero}</p>
                <p style={{ margin: '2px 0' }}><span style={{ color: '#94a3b8' }}>Valor:</span> ${citaCreada.precio.toLocaleString()} {citaCreada.esCumpleanos ? '(Descuento Cumpleaños)' : ''}</p>
              </div>
            </div>
          ) : (
            <div style={{ color: '#64748b' }}>
              <Calendar style={{ width: '40px', height: '40px', margin: '0 auto 8px auto' }} />
              <p style={{ margin: 0, fontSize: '12px' }}>Complete los datos para generar el turno en la agenda</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

{/* VISTA BARBERO (FILTRADA STRICTAMENTE PARA EL BARBERO AUTENTICADO) */}
function VistaBarbero({ barberoActual, citas, setCitas, servicios, onCerrarSesion, devConfig }) {
  const [servicioRapido, setServicioRapido] = useState(servicios[0]?.nombre || '');
  const [precioRapido, setPrecioRapido] = useState(servicios[0]?.precio || 25000);

  // Filtrado exclusivo de las citas asignadas a este barbero
  const citasBarbero = citas.filter(c => c.barbero.toLowerCase() === (barberoActual?.nombre || '').toLowerCase());
  const atencionesBarbero = citasBarbero.filter(c => c.estado === 'completada').length;
  const meta = devConfig?.metaUsoCitasBarbero || 15;
  const porcentajeAvance = Math.min(Math.round((atencionesBarbero / meta) * 100), 100);

  const handleEstadoCita = (id, nuevoEstado) => {
    setCitas(citas.map(c => c.id === id ? { ...c, estado: nuevoEstado } : c));
  };

  const handleCorteDirecto = (e) => {
    e.preventDefault();
    const nueva = {
      id: 'c' + Date.now(),
      cliente: 'Cliente Presencial (Walk-in)',
      barbero: barberoActual?.nombre || 'Barbero',
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(245, 158, 11, 0.2)', paddingBottom: '12px', gap: '8px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#fbbf24', margin: 0 }}>Panel Barbero - {barberoActual?.nombre}</h2>
          <p style={{ color: '#94a3b8', fontSize: '11px', margin: '2px 0 0 0' }}>Especialidad: {barberoActual?.especialidad} | Usuario: {barberoActual?.username}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '4px 8px', borderRadius: '6px', fontSize: '12px' }}>
            Hoy: <span style={{ color: '#34d399', fontWeight: 'bold' }}>${ingresosHoy.toLocaleString()}</span>
          </div>
          <button onClick={onCerrarSesion} style={{ padding: '4px 8px', backgroundColor: '#334155', color: '#f8fafc', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>Salida</button>
        </div>
      </div>

      {devConfig?.incentivoBarberoActivo && (
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #3b82f6', borderRadius: '10px', padding: '12px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', color: '#93c5fd', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Award style={{ width: '14px', height: '14px' }} /> Meta Uso App (Descuento Alquiler Silla):
            </span>
            <span style={{ fontSize: '11px', color: '#60a5fa', fontWeight: 'bold' }}>{atencionesBarbero} / {meta} Citas ({porcentajeAvance}%)</span>
          </div>
          <div style={{ width: '100%', height: '8px', backgroundColor: '#020617', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${porcentajeAvance}%`, height: '100%', backgroundColor: porcentajeAvance >= 100 ? '#34d399' : '#3b82f6', transition: 'width 0.3s ease' }}></div>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: '#94a3b8' }}>
            {porcentajeAvance >= 100 
              ? `¡Felicitaciones! Ganaste el ${devConfig.porcentajeDescuentoSilla}% de descuento en tu pago de alquiler de silla.` 
              : `Registra ${meta - atencionesBarbero} citas más en la app para obtener tu beneficio.`}
          </p>
        </div>
      )}

      <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', padding: '12px', boxSizing: 'border-box' }}>
        <h3 style={{ fontSize: '12px', color: '#fbbf24', fontWeight: 'bold', margin: '0 0 8px 0' }}>Botonera Expresa (Atención Directa en Silla)</h3>
        <form onSubmit={handleCorteDirecto} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
          <select value={servicioRapido} onChange={(e) => setServicioRapido(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '6px', borderRadius: '6px', fontSize: '11px' }}>
            {servicios.map(s => <option key={s.id} value={s.nombre}>{s.nombre}</option>)}
          </select>
          <input type="number" value={precioRapido} onChange={(e) => setPrecioRapido(e.target.value)} placeholder="Valor ($)" style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '6px', borderRadius: '6px', fontSize: '11px' }} required />
          <button type="submit" style={{ backgroundColor: '#059669', color: '#fff', border: 'none', padding: '6px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}>Sumar a Mi Caja</button>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', width: '100%' }}>
        {citasBarbero.length > 0 ? (
          citasBarbero.map(c => (
            <div key={c.id} style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', padding: '12px', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: 0, color: '#f8fafc', fontSize: '13px' }}>{c.cliente}</h4>
                  <p style={{ margin: '2px 0', color: '#fbbf24', fontSize: '11px' }}>{c.servicio}</p>
                </div>
                <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: c.estado === 'completada' ? 'rgba(52, 211, 153, 0.2)' : c.estado === 'cancelada' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: c.estado === 'completada' ? '#34d399' : c.estado === 'cancelada' ? '#f43f5e' : '#fbbf24', fontWeight: 'bold' }}>
                  {c.estado}
                </span>
              </div>

              {c.esCumpleanos && (
                <div style={{ margin: '6px 0', padding: '4px 6px', backgroundColor: 'rgba(245, 158, 11, 0.15)', border: '1px solid #f59e0b', borderRadius: '4px', color: '#fbbf24', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Gift style={{ width: '12px', height: '12px' }} />
                  <span><strong>¡Cumpleañero!</strong> Descuento Aplicado.</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', borderTop: '1px solid #1e293b', paddingTop: '6px', marginTop: '6px' }}>
                <span>{c.fecha} - {c.hora}</span>
                <span style={{ color: '#34d399', fontWeight: 'bold' }}>${(c.precio || 0).toLocaleString()}</span>
              </div>

              {c.estado !== 'completada' && c.estado !== 'cancelada' && (
                <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                  <button 
                    onClick={() => handleEstadoCita(c.id, 'completada')} 
                    style={{ flex: 1, padding: '6px', backgroundColor: '#064e3b', color: '#34d399', border: '1px solid #059669', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '10px' }}
                  >
                    Atendido
                  </button>
                  <button 
                    onClick={() => handleEstadoCita(c.id, 'cancelada')} 
                    style={{ padding: '6px 8px', backgroundColor: '#450a0a', color: '#f87171', border: '1px solid #ef4444', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '10px' }}
                  >
                    No Asistió
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', padding: '24px', backgroundColor: '#0f172a', borderRadius: '10px', textAlign: 'center', color: '#94a3b8', fontSize: '12px', border: '1px dashed #334155' }}>
            No tienes citas asignadas pendientes en este momento.
          </div>
        )}
      </div>
    </div>
  );
}

{/* VISTA ADMIN CON GESTIÓN DE USUARIOS Y CONTRASEÑAS PARA BARBEROS */}
function VistaAdmin({ usuario, citas, setCitas, barberos, setBarberos, productos, setProductos, logsSesion, devConfig, setDevConfig }) {
  const [tab, setTab] = useState('resumen');
  const [nuevoNombreBarbero, setNuevoNombreBarbero] = useState('');
  const [nuevoUsernameBarbero, setNuevoUsernameBarbero] = useState('');
  const [nuevaClaveBarbero, setNuevaClaveBarbero] = useState('');
  const [especialidad, setEspecialidad] = useState('');

  const [nombreProd, setNombreProd] = useState('');
  const [precioProd, setPrecioProd] = useState('');
  const [stockProd, setStockProd] = useState('');

  const urlWhatsapp = `https://wa.me/${devConfig?.whatsappSoporte || '573001234567'}?text=${encodeURIComponent(devConfig?.mensajeRenovacion || 'Hola')}`;

  const toggleIncentivoCumple = () => {
    setDevConfig({ ...devConfig, incentivoCumpleanosActivo: !devConfig.incentivoCumpleanosActivo });
  };

  const toggleIncentivoBarbero = () => {
    setDevConfig({ ...devConfig, incentivoBarberoActivo: !devConfig.incentivoBarberoActivo });
  };

  const toggleBarbero = (id) => {
    setBarberos(barberos.map(b => b.id === id ? { ...b, estado: b.estado === 'Activo' ? 'Inactivo' : 'Activo' } : b));
  };

  const renovarCupo3Meses = (id, nombre) => {
    const nuevaFecha = new Date();
    nuevaFecha.setDate(nuevaFecha.getDate() + 90);
    const fechaString = nuevaFecha.toISOString().split('T')[0];
    setBarberos(barberos.map(b => b.id === id ? { ...b, estado: 'Activo', fechaExpiracion: fechaString } : b));
    alert(`Licencia renovada para ${nombre} hasta ${fechaString}`);
  };

  const eliminarBarbero = (id) => setBarberos(barberos.filter(b => b.id !== id));
  const eliminarProducto = (id) => setProductos(productos.filter(p => p.id !== id));

  const handleAgregarBarbero = (e) => {
    e.preventDefault();
    if (!nuevoNombreBarbero.trim() || !nuevoUsernameBarbero.trim()) return;
    const fechaExp = new Date();
    fechaExp.setDate(fechaExp.getDate() + 90);

    setBarberos([...barberos, { 
      id: 'b' + Date.now(), 
      username: nuevoUsernameBarbero.toLowerCase().trim(),
      nombre: nuevoNombreBarbero, 
      especialidad: especialidad || 'Barbero Profesional', 
      estado: 'Activo', 
      claveAcceso: nuevaClaveBarbero || 'barbero123',
      fechaExpiracion: fechaExp.toISOString().split('T')[0],
      atencionesApp: 0
    }]);

    setNuevoNombreBarbero('');
    setNuevoUsernameBarbero('');
    setNuevaClaveBarbero('');
    setEspecialidad('');
  };

  const handleAgregarProducto = (e) => {
    e.preventDefault();
    if (!nombreProd.trim()) return;
    setProductos([...productos, { id: 'p' + Date.now(), nombre: nombreProd, precio: Number(precioProd), stock: Number(stockProd) }]);
    setNombreProd('');
    setPrecioProd('');
    setStockProd('');
  };

  const ingresosTotales = citas.filter(c => c.estado === 'completada').reduce((sum, c) => sum + (c.precio || 0), 0);
  const esPerfilEvaluacion = usuario?.role === 'evaluacion' || usuario?.nombre?.includes('Evaluación') || usuario?.username === 'demo-sena';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(245, 158, 11, 0.2)', paddingBottom: '12px', gap: '8px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#fbbf24', margin: 0 }}>Panel Administrativo ({usuario?.nombre})</h2>
          <p style={{ color: '#94a3b8', fontSize: '11px', margin: '2px 0 0 0' }}>Gestión de barbería, accesos individuales e inventario</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {!esPerfilEvaluacion && (
            <a href={urlWhatsapp} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: '#059669', color: '#fff', textDecoration: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
              Renovar WhatsApp
            </a>
          )}
          <div style={{ backgroundColor: '#0f172a', padding: '2px', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', gap: '2px', overflowX: 'auto' }}>
            <button onClick={() => setTab('resumen')} style={{ padding: '4px 8px', background: tab === 'resumen' ? '#f59e0b' : 'none', color: tab === 'resumen' ? '#020617' : '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>Resumen</button>
            <button onClick={() => setTab('incentivos')} style={{ padding: '4px 8px', background: tab === 'incentivos' ? '#f59e0b' : 'none', color: tab === 'incentivos' ? '#020617' : '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>Incentivos</button>
            <button onClick={() => setTab('cupos')} style={{ padding: '4px 8px', background: tab === 'cupos' ? '#f59e0b' : 'none', color: tab === 'cupos' ? '#020617' : '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>Barberos & Claves</button>
            <button onClick={() => setTab('productos')} style={{ padding: '4px 8px', background: tab === 'productos' ? '#f59e0b' : 'none', color: tab === 'productos' ? '#020617' : '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>Inventario</button>
          </div>
        </div>
      </div>

      {tab === 'resumen' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '12px', borderRadius: '10px' }}>
            <span style={{ fontSize: '10px', color: '#fbbf24', fontWeight: 'bold' }}>Ingresos Totales</span>
            <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '4px 0 0 0' }}>${ingresosTotales.toLocaleString()}</p>
          </div>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '12px', borderRadius: '10px' }}>
            <span style={{ fontSize: '10px', color: '#fbbf24', fontWeight: 'bold' }}>Citas Atendidas</span>
            <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '4px 0 0 0' }}>{citas.filter(c => c.estado === 'completada').length}</p>
          </div>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '12px', borderRadius: '10px' }}>
            <span style={{ fontSize: '10px', color: '#fbbf24', fontWeight: 'bold' }}>Productos Registrados</span>
            <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '4px 0 0 0' }}>{productos.length}</p>
          </div>
        </div>
      )}

      {tab === 'incentivos' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '12px', borderRadius: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, color: '#fbbf24', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Gift style={{ width: '16px', height: '16px' }} /> Descuento Cumpleaños Cliente
              </h4>
              <button onClick={toggleIncentivoCumple} style={{ padding: '4px 8px', backgroundColor: devConfig?.incentivoCumpleanosActivo ? '#059669' : '#450a0a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>
                {devConfig?.incentivoCumpleanosActivo ? 'Activo' : 'Pausado'}
              </button>
            </div>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: '6px 0 0 0' }}>
              Los clientes obtienen {devConfig?.porcentajeCumpleanos}% de descuento automático al reservar el día de su cumpleaños.
            </p>
          </div>

          <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '12px', borderRadius: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, color: '#fbbf24', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Award style={{ width: '16px', height: '16px' }} /> Premio Alquiler Silla Barbero
              </h4>
              <button onClick={toggleIncentivoBarbero} style={{ padding: '4px 8px', backgroundColor: devConfig?.incentivoBarberoActivo ? '#059669' : '#450a0a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>
                {devConfig?.incentivoBarberoActivo ? 'Activo' : 'Pausado'}
              </button>
            </div>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: '6px 0 0 0' }}>
              Barberos que registren más de {devConfig?.metaUsoCitasBarbero} citas ganan {devConfig?.porcentajeDescuentoSilla}% de descuento en su alquiler.
            </p>
          </div>
        </div>
      )}

      {/* CREACIÓN DE BARBERO CON USUARIO Y CONTRASEÑA PROPIA */}
      {tab === 'cupos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <form onSubmit={handleAgregarBarbero} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '6px', backgroundColor: '#0f172a', padding: '10px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <input type="text" placeholder="Nombre completo..." value={nuevoNombreBarbero} onChange={(e) => setNuevoNombreBarbero(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '6px', borderRadius: '4px', fontSize: '11px' }} required />
            <input type="text" placeholder="Usuario login (ej: pepito)" value={nuevoUsernameBarbero} onChange={(e) => setNuevoUsernameBarbero(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '6px', borderRadius: '4px', fontSize: '11px' }} required />
            <input type="password" placeholder="Contraseña asignada" value={nuevaClaveBarbero} onChange={(e) => setNuevaClaveBarbero(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '6px', borderRadius: '4px', fontSize: '11px' }} required />
            <input type="text" placeholder="Especialidad" value={especialidad} onChange={(e) => setEspecialidad(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '6px', borderRadius: '4px', fontSize: '11px' }} />
            <button type="submit" style={{ backgroundColor: '#f59e0b', color: '#020617', border: 'none', padding: '6px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px', gridColumn: '1 / -1' }}>Registrar Nuevo Barbero</button>
          </form>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            {barberos.map(b => (
              <div key={b.id} style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '12px', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ margin: 0, color: '#fff', fontSize: '13px' }}>{b.nombre}</h4>
                    <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#fbbf24' }}>User: <strong>{b.username}</strong> | Clave: <strong>{b.claveAcceso}</strong></p>
                    <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#cbd5e1' }}>Vence: <span style={{ color: '#34d399', fontWeight: 'bold' }}>{b.fechaExpiracion}</span></p>
                  </div>
                  <span style={{ fontSize: '10px', color: b.estado === 'Activo' ? '#34d399' : '#f43f5e', fontWeight: 'bold' }}>{b.estado}</span>
                </div>
                <div style={{ display: 'flex', gap: '4px', marginTop: '8px', flexWrap: 'wrap' }}>
                  <button onClick={() => renovarCupo3Meses(b.id, b.nombre)} style={{ flex: 1, padding: '4px 6px', backgroundColor: '#064e3b', color: '#34d399', border: '1px solid #059669', borderRadius: '4px', cursor: 'pointer', fontSize: '9px', fontWeight: 'bold' }}>+3 Meses</button>
                  <button onClick={() => toggleBarbero(b.id)} style={{ padding: '4px 6px', backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', borderRadius: '4px', cursor: 'pointer', fontSize: '9px' }}>{b.estado === 'Activo' ? 'Pausar' : 'Activar'}</button>
                  <button onClick={() => eliminarBarbero(b.id)} style={{ padding: '4px 6px', backgroundColor: '#450a0a', color: '#f87171', border: '1px solid #ef4444', borderRadius: '4px', cursor: 'pointer', fontSize: '9px' }}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'productos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <form onSubmit={handleAgregarProducto} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '6px', backgroundColor: '#0f172a', padding: '10px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <input type="text" placeholder="Producto..." value={nombreProd} onChange={(e) => setNombreProd(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '6px', borderRadius: '4px', fontSize: '11px' }} required />
            <input type="number" placeholder="Precio ($)" value={precioProd} onChange={(e) => setPrecioProd(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '6px', borderRadius: '4px', fontSize: '11px' }} required />
            <input type="number" placeholder="Stock" value={stockProd} onChange={(e) => setStockProd(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '6px', borderRadius: '4px', fontSize: '11px' }} required />
            <button type="submit" style={{ backgroundColor: '#f59e0b', color: '#020617', border: 'none', padding: '6px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}>Guardar</button>
          </form>

          <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', padding: '12px', overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', fontSize: '11px', color: '#cbd5e1' }}>
              <thead>
                <tr style={{ color: '#fbbf24', borderBottom: '1px solid #334155' }}>
                  <th style={{ padding: '6px' }}>Producto</th>
                  <th style={{ padding: '6px' }}>Precio</th>
                  <th style={{ padding: '6px' }}>Stock</th>
                  <th style={{ padding: '6px', textAlign: 'right' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {productos.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '6px', fontWeight: 'bold', color: '#fff' }}>{p.nombre}</td>
                    <td style={{ padding: '6px', color: '#34d399' }}>${p.precio.toLocaleString()}</td>
                    <td style={{ padding: '6px' }}>{p.stock} u.</td>
                    <td style={{ padding: '6px', textAlign: 'right' }}>
                      <button onClick={() => eliminarProducto(p.id)} style={{ padding: '2px 6px', backgroundColor: '#450a0a', color: '#f87171', border: '1px solid #ef4444', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' }}>Eliminar</button>
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

{/* CONSOLA SUPERADMIN */}
function VistaSuperAdmin({ tenants, setTenants, devConfig, setDevConfig, onIngresarComoSoporte }) {
  const [whatsapp, setWhatsapp] = useState(devConfig?.whatsappSoporte || '573001234567');
  const [nuevoNombreBarberia, setNuevoNombreBarberia] = useState('');
  const [nuevoDueno, setNuevoDueno] = useState('');

  const handleWhatsappSave = (e) => {
    e.preventDefault();
    setDevConfig({ ...devConfig, whatsappSoporte: whatsapp });
    alert('¡WhatsApp de soporte actualizado!');
  };

  const toggleTenant = (id) => {
    setTenants(tenants.map(t => t.id === id ? { ...t, estadoLicencia: t.estadoLicencia === 'Activa' ? 'Pausada' : 'Activa' } : t));
  };

  const handleAgregarTenant = (e) => {
    e.preventDefault();
    if (!nuevoNombreBarberia.trim()) return;
    setTenants([...tenants, { id: 't' + Date.now(), nombreBarberia: nuevoNombreBarberia, dueno: nuevoDueno || 'Cliente Nuevo', estadoLicencia: 'Prueba 1 Mes', diasRestantes: 30 }]);
    setNuevoNombreBarberia('');
    setNuevoDueno('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ borderBottom: '1px solid rgba(245, 158, 11, 0.2)', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fbbf24', margin: 0 }}>Consola Desarrollador (`elkin-dev26`)</h2>
          <p style={{ color: '#94a3b8', fontSize: '11px', margin: '2px 0 0 0' }}>Gestión Multi-tenant SaaS y licencias</p>
        </div>
      </div>

      <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '12px', borderRadius: '10px' }}>
        <h3 style={{ margin: '0 0 8px 0', color: '#fbbf24', fontSize: '12px' }}>Barberías SaaS Registradas</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {tenants.map(t => (
            <div key={t.id} style={{ backgroundColor: '#020617', padding: '8px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #1e293b' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 'bold', color: '#fff', fontSize: '12px' }}>{t.nombreBarberia}</p>
                <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#94a3b8' }}>Dueño: {t.dueno} | Licencia: <span style={{ color: t.estadoLicencia === 'Activa' ? '#34d399' : '#f43f5e' }}>{t.estadoLicencia}</span></p>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button onClick={() => onIngresarComoSoporte(t.nombreBarberia)} style={{ backgroundColor: '#4338ca', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '10px' }}>Soporte</button>
                <button onClick={() => toggleTenant(t.id)} style={{ backgroundColor: '#f59e0b', color: '#020617', border: 'none', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '10px' }}>Pausar</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}