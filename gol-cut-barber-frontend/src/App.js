import React, { useState, useEffect } from 'react';
import { 
  Scissors, User, Lock, LogOut, Calendar, Clock, 
  CheckCircle, Plus, Trash2, Shield, Search, Unlock, 
  History, MessageCircle, QrCode, PlusCircle, DollarSign, Terminal, Package, Key, Edit, Pause, Play, XCircle, Gift, Award, TrendingUp, AlertCircle, Server, Building, RefreshCw, AlertTriangle, Edit3, Users, CheckSquare, Database
} from 'lucide-react';

export default function App() {
  const [activeRole, setActiveRole] = useState('cliente');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [usuarioAutenticado, setUsuarioAutenticado] = useState(null);

  // Modal Login State
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Configuración WhatsApp de Soporte
  const [devConfig, setDevConfig] = useState({
    whatsappSoporte: '573001234567',
    mensajeRenovacion: 'Hola Elkin, deseo renovar mi membresía mensual de Gol Cut Barber.',
  });

  // Estado de Incentivos de Producción
  const [incentivos, setIncentivos] = useState([
    {
      id: 'inc1',
      tipo: 'cumpleanos',
      titulo: 'Descuento Cumpleaños Cliente',
      descripcion: 'Los clientes obtienen un 10% de descuento automático al reservar o registrar corte el día de su cumpleaños.',
      activo: true,
      porcentaje: 10
    },
    {
      id: 'inc2',
      tipo: 'barbero',
      titulo: 'Premio Alquiler Silla Barbero',
      descripcion: 'Barberos que superen la meta mensual ganan descuento directo en la cuota de alquiler de silla.',
      activo: true,
      metaCitas: 15,
      porcentaje: 5
    }
  ]);

  // Multi-Tenant SaaS
  const [tenants, setTenants] = useState([
    { id: 't1', nombreBarberia: 'Gol Cut Barber - Sede Principal', nombreAnterior: null, dueno: 'Elkin Ramírez', estadoLicencia: 'Activa', diasRestantes: 28 },
    { id: 't2', nombreBarberia: 'Barbería Demo Evaluación', nombreAnterior: 'Barbería Inicial Demo', dueno: 'Evaluador Técnico', estadoLicencia: 'Activa', diasRestantes: 30 },
    { id: 't3', nombreBarberia: 'Barbería Ejemplo Vencida', nombreAnterior: null, dueno: 'Cliente Moroso', estadoLicencia: 'Pausada (Vencida)', diasRestantes: 0 }
  ]);

  // Base de datos de Barberos
  const [barberos, setBarberos] = useState([
    { id: 'b1', username: 'elkin', nombre: 'Elkin Ramírez', especialidad: 'Estilista Profesional', estado: 'Activo', cupoPago: true, claveAcceso: 'barbero123', fechaExpiracion: '2027-02-08' },
    { id: 'b2', username: 'mateo', nombre: 'Mateo Gómez', especialidad: 'Barbero Senior', estado: 'Activo', cupoPago: true, claveAcceso: 'mateo2026', fechaExpiracion: '2027-02-08' },
    { id: 'b3', username: 'carlos', nombre: 'Carlos Andrés', especialidad: 'Especialista en Barba', estado: 'Inactivo', cupoPago: false, claveAcceso: 'carlos2026', fechaExpiracion: '2026-08-01' }
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

  // Citas / Atenciones Persistentes en Base de Datos Real
  const [citas, setCitas] = useState([
    { id: 'c1', cliente: 'Juan Pérez', barbero: 'Elkin Ramírez', servicio: 'Corte de Cabello Clásico', fecha: '2026-11-08', hora: '10:00 AM', precio: 22500, estado: 'completada', esCumpleanos: true },
    { id: 'c2', cliente: 'Carlos Gómez', barbero: 'Elkin Ramírez', servicio: 'Combo Corte + Barba', fecha: '2026-11-08', hora: '11:30 AM', precio: 35000, estado: 'completada', esCumpleanos: false },
    { id: 'c3', cliente: 'Andrés López', barbero: 'Mateo Gómez', servicio: 'Corte de Cabello Clásico', fecha: '2026-11-08', hora: '02:00 PM', precio: 25000, estado: 'completada', esCumpleanos: false }
  ]);

  // Auditoría de Accesos
  const [logsSesion, setLogsSesion] = useState([
    { id: 'l1', usuario: 'Elkin Ramírez', rol: 'barbero', fechaHora: '2026-11-08 08:00 AM', evento: 'Marcación de Ingreso' },
    { id: 'l2', usuario: 'demo-sena', rol: 'evaluacion', fechaHora: '2026-11-08 09:15 AM', evento: 'Ingreso Auditoría Técnica' }
  ]);

  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  const tenantPrincipal = tenants[0]; 
  const licenciaVencida = tenantPrincipal?.diasRestantes <= 0 || tenantPrincipal?.estadoLicencia === 'Pausada (Vencida)';

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');

    const u = usernameInput.trim().toLowerCase();
    const p = passwordInput.trim();

    if (u === 'demo-sena' && p === 'sena2026') {
      exitoLogin({ username: 'demo-sena', nombre: 'Auditoría Técnica', role: 'evaluacion' });
      return;
    } 

    if ((u === 'sucursal' || u === 'demo-cliente') && p === 'demo2026') {
      exitoLogin({ username: 'sucursal', nombre: 'Demostración Sucursal', role: 'sucursal' });
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
      <header style={{ backgroundColor: '#0f172a', borderBottom: '1px solid #f59e0b', padding: '12px 16px', position: 'sticky', top: 0, zIndex: 40, width: '100%', boxSizing: 'border-box' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ padding: '6px', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid #f59e0b', borderRadius: '8px' }}>
              <Scissors style={{ width: '20px', height: '20px', color: '#fbbf24' }} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#fbbf24', letterSpacing: '0.03em' }}>
                {tenantPrincipal.nombreBarberia.toUpperCase()}
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

      <main style={{ maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '16px', flex: 1, boxSizing: 'border-box' }}>
        {activeRole === 'cliente' && (
          <VistaCliente 
            barberos={barberos.filter(b => b.estado === 'Activo')} 
            servicios={servicios} 
            citas={citas} 
            setCitas={setCitas} 
            incentivos={incentivos}
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
            licenciaVencida={licenciaVencida}
            incentivos={incentivos}
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
            licenciaVencida={licenciaVencida}
            tenants={tenants}
            setTenants={setTenants}
            incentivos={incentivos}
            setIncentivos={setIncentivos}
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
                  placeholder="Ej: sucursal, admin, elkin, demo-sena"
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
function VistaCliente({ barberos, servicios, citas, setCitas, incentivos }) {
  const [modo, setModo] = useState('programada');
  const [nombre, setNombre] = useState('');
  const [fechaNac, setFechaNac] = useState('');
  const [barbero, setBarbero] = useState(barberos[0]?.nombre || '');
  const [servicio, setServicio] = useState(servicios[0]?.nombre || '');
  const [fecha, setFecha] = useState('2026-11-09');
  const [hora, setHora] = useState('10:00 AM');
  const [citaCreada, setCitaCreada] = useState(null);

  const incCumple = incentivos.find(i => i.tipo === 'cumpleanos' && i.activo);

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

    if (cumple && incCumple) {
      const desc = (precioFinal * incCumple.porcentaje) / 100;
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
      esCumpleanos: cumple && !!incCumple
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

            {esCumpleanos() && incCumple && (
              <div style={{ backgroundColor: 'rgba(5, 150, 105, 0.2)', border: '1px solid #059669', padding: '8px', borderRadius: '6px', color: '#34d399', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Gift style={{ width: '16px', height: '16px' }} />
                <span><strong>¡Felicidades!</strong> Recibes un {incCumple.porcentaje}% de descuento especial.</span>
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

{/* VISTA BARBERO */}
function VistaBarbero({ barberoActual, citas, setCitas, servicios, onCerrarSesion, devConfig, licenciaVencida, incentivos }) {
  const [servicioRapido, setServicioRapido] = useState(servicios[0]?.nombre || '');
  const [precioRapido, setPrecioRapido] = useState(servicios[0]?.precio || 25000);
  const [esCumpleanosCheck, setEsCumpleanosCheck] = useState(false);

  const urlWhatsapp = `https://wa.me/${devConfig?.whatsappSoporte || '573001234567'}?text=${encodeURIComponent(devConfig?.mensajeRenovacion || 'Hola')}`;

  if (licenciaVencida) {
    return (
      <div style={{ backgroundColor: '#0f172a', border: '1px solid #f43f5e', borderRadius: '16px', padding: '24px', textAlign: 'center', maxWidth: '500px', margin: '40px auto' }}>
        <AlertTriangle style={{ width: '48px', height: '48px', color: '#f43f5e', margin: '0 auto 12px auto' }} />
        <h3 style={{ color: '#f43f5e', margin: '0 0 8px 0', fontSize: '18px' }}>Suscripción de Barbería Pausada</h3>
        <p style={{ color: '#cbd5e1', fontSize: '12px', margin: '0 0 16px 0' }}>
          La membresía mensual de esta barbería ha superado los 30 días límite. Las funciones operativas del panel de barbero han sido suspendidas temporalmente.
        </p>
        <a href={urlWhatsapp} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: '#059669', color: '#fff', textDecoration: 'none', padding: '10px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <MessageCircle style={{ width: '16px', height: '16px' }} /> Contactar al Desarrollador para Renovación
        </a>
      </div>
    );
  }

  const incCumple = incentivos.find(i => i.tipo === 'cumpleanos' && i.activo);
  const incBarbero = incentivos.find(i => i.tipo === 'barbero' && i.activo);
  const citasBarbero = citas.filter(c => c.barbero.toLowerCase() === (barberoActual?.nombre || '').toLowerCase());
  const atencionesBarbero = citasBarbero.filter(c => c.estado === 'completada').length;
  const meta = incBarbero?.metaCitas || 15;
  const porcentajeAvance = Math.min(Math.round((atencionesBarbero / meta) * 100), 100);

  const handleEstadoCita = (id, nuevoEstado) => {
    setCitas(citas.map(c => c.id === id ? { ...c, estado: nuevoEstado } : c));
  };

  const handleCambioServicio = (nombreServ) => {
    setServicioRapido(nombreServ);
    const sObj = servicios.find(s => s.nombre === nombreServ);
    if (sObj) setPrecioRapido(sObj.precio);
  };

  const handleCorteDirecto = (e) => {
    e.preventDefault();
    let valorFinal = Number(precioRapido);

    if (esCumpleanosCheck && incCumple) {
      const descuento = (valorFinal * incCumple.porcentaje) / 100;
      valorFinal = valorFinal - descuento;
    }

    const nueva = {
      id: 'c' + Date.now(),
      cliente: 'Cliente Presencial (Walk-in)',
      barbero: barberoActual?.nombre || 'Barbero',
      servicio: servicioRapido,
      fecha: new Date().toISOString().split('T')[0],
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      precio: valorFinal,
      estado: 'completada',
      esCumpleanos: esCumpleanosCheck && !!incCumple
    };

    setCitas([nueva, ...citas]);
    setEsCumpleanosCheck(false);
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

      {incBarbero && (
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
              ? `¡Felicitaciones! Ganaste el ${incBarbero.porcentaje}% de descuento en tu pago de alquiler de silla.` 
              : `Registra ${meta - atencionesBarbero} citas más en la app para obtener tu beneficio.`}
          </p>
        </div>
      )}

      <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', padding: '12px', boxSizing: 'border-box' }}>
        <h3 style={{ fontSize: '12px', color: '#fbbf24', fontWeight: 'bold', margin: '0 0 8px 0' }}>Botonera Expresa (Atención Directa en Silla)</h3>
        <form onSubmit={handleCorteDirecto} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
            <select value={servicioRapido} onChange={(e) => handleCambioServicio(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '6px', borderRadius: '6px', fontSize: '11px' }}>
              {servicios.map(s => <option key={s.id} value={s.nombre}>{s.nombre}</option>)}
            </select>
            <input type="number" value={precioRapido} onChange={(e) => setPrecioRapido(e.target.value)} placeholder="Valor ($)" style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '6px', borderRadius: '6px', fontSize: '11px' }} required />
            <button type="submit" style={{ backgroundColor: '#059669', color: '#fff', border: 'none', padding: '6px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}>Sumar a Mi Caja</button>
          </div>

          {incCumple && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#fbbf24', backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.3)', cursor: 'pointer', width: 'fit-content' }}>
              <input 
                type="checkbox" 
                checked={esCumpleanosCheck} 
                onChange={(e) => setEsCumpleanosCheck(e.target.checked)} 
                style={{ cursor: 'pointer' }}
              />
              <Gift style={{ width: '14px', height: '14px' }} />
              <span>Aplicar Descuento de Cumpleaños ({incCumple.porcentaje}%) a este cliente</span>
            </label>
          )}
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
                <div style={{ margin: '6px 0', padding: '4px 6px', backgroundColor: 'rgba(5, 150, 105, 0.2)', border: '1px solid #059669', borderRadius: '4px', color: '#34d399', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Gift style={{ width: '12px', height: '12px' }} />
                  <span><strong>🎁 Cumpleaños:</strong> Descuento Aplicado.</span>
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

{/* VISTA ADMIN CON CONEXIÓN PRODUCTIVA */}
function VistaAdmin({ usuario, citas, setCitas, barberos, setBarberos, productos, setProductos, logsSesion, devConfig, setDevConfig, licenciaVencida, tenants, setTenants, incentivos, setIncentivos }) {
  const [tab, setTab] = useState('resumen');
  const [nuevoNombreBarbero, setNuevoNombreBarbero] = useState('');
  const [nuevoUsernameBarbero, setNuevoUsernameBarbero] = useState('');
  const [nuevaClaveBarbero, setNuevaClaveBarbero] = useState('');
  const [especialidad, setEspecialidad] = useState('');

  const [nombreProd, setNombreProd] = useState('');
  const [precioProd, setPrecioProd] = useState('');
  const [stockProd, setStockProd] = useState('');

  const barberiaActual = tenants[0];
  const [inputNuevoNombreBarberia, setInputNuevoNombreBarberia] = useState(barberiaActual?.nombreBarberia || '');

  const urlWhatsapp = `https://wa.me/${devConfig?.whatsappSoporte || '573001234567'}?text=${encodeURIComponent(devConfig?.mensajeRenovacion || 'Hola Elkin, deseo renovar mi membresía mensual de Gol Cut Barber.')}`;

  if (licenciaVencida) {
    return (
      <div style={{ backgroundColor: '#0f172a', border: '1px solid #f43f5e', borderRadius: '16px', padding: '24px', textAlign: 'center', maxWidth: '520px', margin: '40px auto', boxSizing: 'border-box' }}>
        <AlertTriangle style={{ width: '48px', height: '48px', color: '#f43f5e', margin: '0 auto 12px auto' }} />
        <h3 style={{ color: '#f43f5e', margin: '0 0 8px 0', fontSize: '18px' }}>Suscripción Mensual Pausada (Vencida)</h3>
        <p style={{ color: '#cbd5e1', fontSize: '12px', margin: '0 0 16px 0', lineHeight: 1.5 }}>
          Estimado Administrador, la membresía mensual de su barbería ha caducado por superar el período de 30 días activos. Las funciones administrativas se encuentran bloqueadas.
        </p>
        <a 
          href={urlWhatsapp} 
          target="_blank" 
          rel="noopener noreferrer" 
          style={{ backgroundColor: '#059669', color: '#fff', textDecoration: 'none', padding: '12px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)' }}
        >
          <MessageCircle style={{ width: '18px', height: '18px' }} /> Contactar al Desarrollador por WhatsApp
        </a>
      </div>
    );
  }

  // MÉTRICAS PROMEDIOS & MES EN CURSO
  const incBarbero = incentivos.find(i => i.tipo === 'barbero' && i.activo);
  const metaEstablecida = incBarbero?.metaCitas || 15;
  const barberosActivos = barberos.filter(b => b.estado === 'Activo');

  const metricasBarberos = barberosActivos.map(b => {
    const atenciones = citas.filter(c => c.barbero.toLowerCase() === b.nombre.toLowerCase() && c.estado === 'completada').length;
    const porcentaje = Math.min(Math.round((atenciones / metaEstablecida) * 100), 100);
    const cumpleMeta = atenciones >= metaEstablecida;

    return {
      ...b,
      atenciones,
      porcentaje,
      cumpleMeta
    };
  });

  const promedioGeneralBarberia = barberosActivos.length > 0 
    ? Math.round(metricasBarberos.reduce((sum, b) => sum + b.porcentaje, 0) / barberosActivos.length)
    : 0;

  const handleGuardarNuevoNombreBarberia = (e) => {
    e.preventDefault();
    if (!inputNuevoNombreBarberia.trim()) return;

    setTenants(tenants.map((t, idx) => {
      if (idx === 0) {
        return {
          ...t,
          nombreAnterior: t.nombreBarberia,
          nombreBarberia: inputNuevoNombreBarberia.trim()
        };
      }
      return t;
    }));

    alert(`Nombre de la barbería actualizado a: "${inputNuevoNombreBarberia}". Se reflejará automáticamente en la consola del desarrollador.`);
  };

  const toggleEstadoIncentivo = (id) => {
    setIncentivos(incentivos.map(inc => inc.id === id ? { ...inc, activo: !inc.activo } : inc));
  };

  const eliminarIncentivo = (id, titulo) => {
    if (window.confirm(`¿Está seguro de eliminar el incentivo "${titulo}"?`)) {
      setIncentivos(incentivos.filter(inc => inc.id !== id));
    }
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
      fechaExpiracion: fechaExp.toISOString().split('T')[0]
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '12px', borderRadius: '10px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#fbbf24', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Edit3 style={{ width: '16px', height: '16px' }} /> Cambiar Nombre Comercial de la Barbería
            </h4>
            <form onSubmit={handleGuardarNuevoNombreBarberia} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <input 
                type="text" 
                value={inputNuevoNombreBarberia} 
                onChange={(e) => setInputNuevoNombreBarberia(e.target.value)} 
                placeholder="Nuevo nombre comercial..." 
                style={{ flex: 1, backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '6px 10px', borderRadius: '6px', fontSize: '12px' }} 
                required 
              />
              <button type="submit" style={{ backgroundColor: '#f59e0b', color: '#020617', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}>
                Actualizar Nombre
              </button>
            </form>
          </div>

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
              <span style={{ fontSize: '10px', color: '#fbbf24', fontWeight: 'bold' }}>Descuentos Cumpleaños</span>
              <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '4px 0 0 0', color: '#34d399' }}>{citas.filter(c => c.esCumpleanos).length}</p>
            </div>
          </div>

          <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', padding: '12px', overflowX: 'auto' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#fbbf24', fontSize: '12px' }}>Historial & Auditoría de Atenciones</h4>
            <table style={{ width: '100%', textAlign: 'left', fontSize: '11px', color: '#cbd5e1' }}>
              <thead>
                <tr style={{ color: '#fbbf24', borderBottom: '1px solid #334155' }}>
                  <th style={{ padding: '6px' }}>Cliente</th>
                  <th style={{ padding: '6px' }}>Barbero</th>
                  <th style={{ padding: '6px' }}>Servicio</th>
                  <th style={{ padding: '6px' }}>Caja / Cobro</th>
                  <th style={{ padding: '6px' }}>Observación Auditoría</th>
                </tr>
              </thead>
              <tbody>
                {citas.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '6px', fontWeight: 'bold', color: '#fff' }}>{c.cliente}</td>
                    <td style={{ padding: '6px' }}>{c.barbero}</td>
                    <td style={{ padding: '6px' }}>{c.servicio}</td>
                    <td style={{ padding: '6px', color: '#34d399', fontWeight: 'bold' }}>${(c.precio || 0).toLocaleString()}</td>
                    <td style={{ padding: '6px' }}>
                      {c.esCumpleanos ? (
                        <span style={{ color: '#34d399', backgroundColor: 'rgba(52, 211, 153, 0.15)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', fontSize: '10px', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
                          🎁 Descuento Cumpleaños
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>Tarifa Normal</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'incentivos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {incBarbero && (
            <div style={{ backgroundColor: '#0f172a', border: '1px solid #3b82f6', borderRadius: '12px', padding: '16px', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#60a5fa', fontSize: '15px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Award style={{ width: '18px', height: '18px' }} /> Auditoría de Cierre de Mes: Premio Alquiler de Sillas
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#94a3b8' }}>
                    Meta por Barbero: <strong>{metaEstablecida} citas</strong> | Descuento Cuota Silla: <strong>{incBarbero.porcentaje}%</strong>
                  </p>
                </div>
                <div style={{ backgroundColor: '#020617', border: '1px solid #3b82f6', padding: '6px 12px', borderRadius: '8px', textAlign: 'right' }}>
                  <span style={{ fontSize: '10px', color: '#93c5fd', display: 'block' }}>Promedio Rendimiento Sede</span>
                  <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#60a5fa' }}>{promedioGeneralBarberia}%</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
                {metricasBarberos.map(b => (
                  <div key={b.id} style={{ backgroundColor: '#020617', border: b.cumpleMeta ? '1px solid #059669' : '1px solid #334155', borderRadius: '8px', padding: '10px', boxSizing: 'border-box' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', color: '#fff', fontWeight: 'bold' }}>{b.nombre}</span>
                      <span style={{ fontSize: '11px', color: b.cumpleMeta ? '#34d399' : '#fbbf24', fontWeight: 'bold' }}>
                        {b.atenciones} / {metaEstablecida} citas ({b.porcentaje}%)
                      </span>
                    </div>

                    <div style={{ width: '100%', height: '6px', backgroundColor: '#0f172a', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
                      <div style={{ width: `${b.porcentaje}%`, height: '100%', backgroundColor: b.cumpleMeta ? '#34d399' : '#f59e0b', transition: 'width 0.3s ease' }}></div>
                    </div>

                    {b.cumpleMeta ? (
                      <div style={{ backgroundColor: 'rgba(5, 150, 105, 0.15)', border: '1px solid #059669', color: '#34d399', fontSize: '10px', padding: '4px 6px', borderRadius: '4px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckSquare style={{ width: '12px', height: '12px' }} /> 🏆 Ganador Beneficio Alquiler Silla (-{incBarbero.porcentaje}%)
                      </div>
                    ) : (
                      <div style={{ color: '#94a3b8', fontSize: '10px' }}>
                        Faltan {metaEstablecida - b.atenciones} citas para alcanzar la meta.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {incentivos.map(inc => (
              <div key={inc.id} style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '12px', borderRadius: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <h4 style={{ margin: 0, color: '#fbbf24', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {inc.tipo === 'cumpleanos' ? <Gift style={{ width: '16px', height: '16px' }} /> : <Award style={{ width: '16px', height: '16px' }} />}
                      {inc.titulo}
                    </h4>
                    <span style={{ fontSize: '10px', color: inc.activo ? '#34d399' : '#f43f5e', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', backgroundColor: inc.activo ? 'rgba(52, 211, 153, 0.15)' : 'rgba(244, 63, 94, 0.15)' }}>
                      {inc.activo ? 'Activo' : 'Pausado'}
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 12px 0' }}>{inc.descripcion}</p>
                </div>

                <div style={{ display: 'flex', gap: '6px', borderTop: '1px solid #1e293b', paddingTop: '8px' }}>
                  <button 
                    onClick={() => toggleEstadoIncentivo(inc.id)} 
                    style={{ flex: 1, padding: '6px 8px', backgroundColor: inc.activo ? '#020617' : '#064e3b', color: inc.activo ? '#cbd5e1' : '#34d399', border: inc.activo ? '1px solid #334155' : '1px solid #059669', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}
                  >
                    {inc.activo ? '⏸️ Pausar Incentivo' : '▶️ Activar Incentivo'}
                  </button>
                  <button 
                    onClick={() => eliminarIncentivo(inc.id, inc.titulo)} 
                    style={{ padding: '6px 10px', backgroundColor: '#450a0a', color: '#f87171', border: '1px solid #ef4444', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
    setTenants(tenants.map(t => t.id === id ? { 
      ...t, 
      estadoLicencia: t.estadoLicencia === 'Activa' ? 'Pausada (Vencida)' : 'Activa',
      diasRestantes: t.estadoLicencia === 'Activa' ? 0 : 30
    } : t));
  };

  const renovarMesBarberia = (id, nombre) => {
    setTenants(tenants.map(t => t.id === id ? { 
      ...t, 
      estadoLicencia: 'Activa', 
      diasRestantes: t.diasRestantes + 30 
    } : t));
    alert(`Se acreditó +1 Mes (30 Días) a la barbería "${nombre}".`);
  };

  const eliminarTenant = (id, nombre) => {
    if (window.confirm(`¿Está seguro de eliminar la barbería "${nombre}" del sistema? Esta acción liberará espacio de almacenamiento.`)) {
      setTenants(tenants.filter(t => t.id !== id));
    }
  };

  const handleAgregarTenant = (e) => {
    e.preventDefault();
    if (!nuevoNombreBarberia.trim()) return;

    setTenants([...tenants, { 
      id: 't' + Date.now(), 
      nombreBarberia: nuevoNombreBarberia, 
      nombreAnterior: null,
      dueno: nuevoDueno || 'Cliente Nuevo', 
      estadoLicencia: 'Activa', 
      diasRestantes: 30 
    }]);

    setNuevoNombreBarberia('');
    setNuevoDueno('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ borderBottom: '1px solid rgba(245, 158, 11, 0.2)', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fbbf24', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Server style={{ width: '20px', height: '20px' }} /> Consola Desarrollador (`elkin-dev26`)
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '11px', margin: '2px 0 0 0' }}>Control de pagos mensuales, traza de nombres e impersonación</p>
        </div>
        <span style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>Acceso Root</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
        <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '12px', borderRadius: '10px' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#fbbf24', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Building style={{ width: '14px', height: '14px' }} /> Registrar Nueva Barbería (Alta SaaS)
          </h3>
          <form onSubmit={handleAgregarTenant} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <input type="text" placeholder="Nombre Barbería / Sede" value={nuevoNombreBarberia} onChange={(e) => setNuevoNombreBarberia(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '6px', borderRadius: '4px', fontSize: '11px' }} required />
            <input type="text" placeholder="Nombre del Propietario" value={nuevoDueno} onChange={(e) => setNuevoDueno(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '6px', borderRadius: '4px', fontSize: '11px' }} />
            <button type="submit" style={{ backgroundColor: '#f59e0b', color: '#020617', border: 'none', padding: '6px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px', marginTop: '4px' }}>
              Crear Barbería (+30 Días Iniciales)
            </button>
          </form>
        </div>

        <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '12px', borderRadius: '10px' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#fbbf24', fontSize: '12px' }}>WhatsApp Global de Soporte</h3>
          <form onSubmit={handleWhatsappSave} style={{ display: 'flex', gap: '6px' }}>
            <input type="text" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} style={{ flex: 1, backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '6px', borderRadius: '4px', fontSize: '11px' }} />
            <button type="submit" style={{ backgroundColor: '#059669', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}>Guardar</button>
          </form>
        </div>
      </div>

      <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '12px', borderRadius: '10px' }}>
        <h3 style={{ margin: '0 0 8px 0', color: '#fbbf24', fontSize: '12px' }}>Control de Licencias & Trazabilidad de Nombre</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {tenants.map(t => {
            const estaVencida = t.diasRestantes <= 0 || t.estadoLicencia.includes('Vencida');

            return (
              <div key={t.id} style={{ backgroundColor: '#020617', padding: '8px', borderRadius: '6px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #1e293b', gap: '6px' }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 'bold', color: '#fff', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {t.nombreBarberia}
                    {t.nombreAnterior && (
                      <span style={{ fontSize: '10px', color: '#fbbf24', backgroundColor: 'rgba(245, 158, 11, 0.15)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
                        (Antes: "{t.nombreAnterior}")
                      </span>
                    )}
                  </p>
                  <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#94a3b8' }}>
                    Dueño: {t.dueno} | Estado: <span style={{ color: estaVencida ? '#f43f5e' : '#34d399', fontWeight: 'bold' }}>{estaVencida ? 'Pausada (Vencida)' : t.estadoLicencia}</span> | Quedan: <span style={{ color: estaVencida ? '#f43f5e' : '#fbbf24', fontWeight: 'bold' }}>{t.diasRestantes} días</span>
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  <button onClick={() => renovarMesBarberia(t.id, t.nombreBarberia)} style={{ backgroundColor: '#064e3b', color: '#34d399', border: '1px solid #059669', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '10px' }}>
                    +30 Días (Pago Recibido)
                  </button>
                  <button onClick={() => onIngresarComoSoporte(t.nombreBarberia)} style={{ backgroundColor: '#4338ca', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '10px' }}>
                    Soporte
                  </button>
                  <button onClick={() => toggleTenant(t.id)} style={{ backgroundColor: '#f59e0b', color: '#020617', border: 'none', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '10px' }}>
                    {estaVencida ? 'Activar' : 'Pausar'}
                  </button>
                  <button onClick={() => eliminarTenant(t.id, t.nombreBarberia)} style={{ backgroundColor: '#450a0a', color: '#f87171', border: '1px solid #ef4444', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}