JavaScript
import React, { useState, useEffect } from 'react';
import { 
  Scissors, User, Lock, LogOut, Calendar, Clock, 
  CheckCircle, Plus, Trash2, Shield, Search, Unlock, 
  History, MessageCircle, QrCode, PlusCircle, DollarSign, Terminal, Package, Key, Edit, Pause, Play, XCircle, Gift, Award, TrendingUp, AlertCircle, Server, Building, RefreshCw, AlertTriangle, Edit3, Users, CheckSquare, Database, PlusSquare, HelpCircle, Smartphone, ArrowRightLeft
} from 'lucide-react';

export default function App() {
  const [activeRole, setActiveRole] = useState('cliente');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [usuarioAutenticado, setUsuarioAutenticado] = useState(null);

  // Modal Login State
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Credenciales Administrativas Dinámicas
  const [credencialesAdmin, setCredencialesAdmin] = useState({
    username: 'admin',
    password: 'admin123',
    nombre: 'Administrador Local'
  });

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
      descripcion: 'Barberos que superen la meta mensual y registren el 100% de transferencias ganan descuento en alquiler.',
      activo: true,
      metaCitas: 15,
      porcentaje: 5
    }
  ]);

  // Multi-Tenant SaaS
  const [tenants, setTenants] = useState([
    { id: 't1', nombreBarberia: 'Gol Cut Barber - Sede Principal', nombreAnterior: null, dueno: 'Elkin Ramírez', estadoLicencia: 'Activa', diasRestantes: 28 },
    { id: 't2', nombreBarberia: 'Barbería Demo Evaluación', nombreAnterior: null, dueno: 'Evaluador Técnico', estadoLicencia: 'Activa', diasRestantes: 30 }
  ]);

  // Base de datos de Barberos (Empleados)
  const [barberos, setBarberos] = useState([
    { id: 'b1', username: 'elkin', nombre: 'Elkin Ramírez', especialidad: 'Estilista Profesional', estado: 'Activo', claveAcceso: 'barbero123', fechaExpiracion: '2027-02-08' },
    { id: 'b2', username: 'mateo', nombre: 'Mateo Gómez', especialidad: 'Barbero Senior', estado: 'Activo', claveAcceso: 'mateo2026', fechaExpiracion: '2027-02-08' }
  ]);

  // Base de Datos Independiente para Perfil Solista (Barbería Autónoma Nueva)
  const [perfilIndependiente, setPerfilIndependiente] = useState({
    nombreNegocio: 'Barbería Independiente (Solista)',
    username: 'independiente',
    clave: 'solo2026',
    propietario: 'Juan Solista',
    diasRestantes: 30,
    serviciosPropios: [
      { id: 'si1', nombre: 'Corte Ejecutivo Solo', precio: 30000, duracion: '30 min' },
      { id: 'si2', nombre: 'Arreglo de Barba Pro', precio: 20000, duracion: '20 min' }
    ]
  });

  // Catálogo de Productos y Servicios Generales
  const [productos, setProductos] = useState([
    { id: 'p1', nombre: 'Cera Moldear Mate Gold', precio: 30000, stock: 15 },
    { id: 'p2', nombre: 'Champú Anticaída Barba & Cabello', precio: 45000, stock: 10 }
  ]);

  const [servicios, setServicios] = useState([
    { id: 's1', nombre: 'Corte de Cabello Clásico', precio: 25000, duracion: '30 min' },
    { id: 's2', nombre: 'Barba Tradicional con Toalla Caliente', precio: 15000, duracion: '20 min' },
    { id: 's3', nombre: 'Combo Corte + Barba', precio: 35000, duracion: '45 min' }
  ]);

  // Citas / Atenciones Persistentes
  const [citas, setCitas] = useState([
    { id: 'c1', cliente: 'Juan Pérez', barbero: 'Elkin Ramírez', servicio: 'Corte de Cabello Clásico', fecha: '2026-11-08', hora: '10:00 AM', precio: 22500, estado: 'completada', metodoPago: 'efectivo', registradoEnApp: true, motivoCancelacion: null },
    { id: 'c2', cliente: 'Carlos Gómez', barbero: 'Elkin Ramírez', servicio: 'Combo Corte + Barba', fecha: '2026-11-08', hora: '11:30 AM', precio: 35000, estado: 'completada', metodoPago: 'transferencia', registradoEnApp: true, motivoCancelacion: null },
    { id: 'c3', cliente: 'Andrés López', barbero: 'Mateo Gómez', servicio: 'Corte de Cabello Clásico', fecha: '2026-11-08', hora: '02:00 PM', precio: 25000, estado: 'confirmada', metodoPago: 'efectivo', registradoEnApp: false, motivoCancelacion: null }
  ]);

  const tenantPrincipal = tenants[0]; 
  const licenciaVencida = tenantPrincipal?.diasRestantes <= 0 || tenantPrincipal?.estadoLicencia === 'Pausada (Vencida)';

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');

    const u = usernameInput.trim().toLowerCase();
    const p = passwordInput.trim();

    if (u === 'elkin-dev26' && p === 'elkin2026') {
      exitoLogin({ username: 'elkin-dev26', nombre: 'SuperAdmin / Desarrollador', role: 'superadmin' });
      return;
    }

    if (u === credencialesAdmin.username.toLowerCase() && p === credencialesAdmin.password) {
      exitoLogin({ username: credencialesAdmin.username, nombre: credencialesAdmin.nombre, role: 'admin' });
      return;
    }

    if (u === perfilIndependiente.username.toLowerCase() && p === perfilIndependiente.clave) {
      exitoLogin({ username: perfilIndependiente.username, nombre: perfilIndependiente.propietario, role: 'barbero_independiente' });
      return;
    }

    const barberoEncontrado = barberos.find(b => b.username.toLowerCase() === u && b.claveAcceso === p);

    if (barberoEncontrado) {
      if (barberoEncontrado.estado === 'Inactivo') {
        setLoginError('Su usuario se encuentra inactivo en la barbería.');
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
    if (targetRole === 'evaluacion_sena') {
      exitoLogin({ username: 'demo-sena', nombre: 'Auditoría Técnica SENA', role: 'admin' });
      return;
    }
    if (targetRole === 'sucursal_demo') {
      exitoLogin({ username: 'sucursal', nombre: 'Demostración Sucursal', role: 'admin' });
      return;
    }

    if (!usuarioAutenticado || (usuarioAutenticado.role !== targetRole && targetRole !== 'admin')) {
      setIsLoginOpen(true);
      setUsernameInput(targetRole === 'admin' ? 'admin' : targetRole === 'barbero_independiente' ? 'independiente' : 'elkin');
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
              <p style={{ margin: 0, fontSize: '10px', color: '#94a3b8' }}>Gestión, Agenda y Control SaaS</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', width: '100%', justifyContent: 'space-between', maxWidth: '480px' }}>
            <select
              value={activeRole}
              onChange={handleCambioSeleccion}
              style={{ flex: 1, backgroundColor: '#020617', border: '1px solid #f59e0b', color: '#f8fafc', fontSize: '11px', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
            >
              <option value="cliente">📱 Vista: Cliente (Reservas / Móvil)</option>
              <option value="barbero">✂️ Vista: Barbero (Empleado)</option>
              <option value="barbero_independiente">⭐ Vista: Barbero Solista / Independiente</option>
              <option value="admin">🛠️ Vista: Administrador General</option>
              <option value="evaluacion_sena">🎓 Perfil Demo: Evaluación SENA</option>
              <option value="sucursal_demo">🏢 Perfil Demo: Sucursal Externa</option>
              {usuarioAutenticado && usuarioAutenticado.role === 'superadmin' && (
                <option value="superadmin">🔒 Consola Desarrollador Root</option>
              )}
            </select>

            {usuarioAutenticado ? (
              <button
                onClick={handleCerrarSesion}
                style={{ backgroundColor: '#881337', color: '#fda4af', border: '1px solid #f43f5e', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Salir ({usuarioAutenticado.nombre.split(' ')[0]})
              </button>
            ) : (
              <button
                onClick={() => setIsLoginOpen(true)}
                style={{ backgroundColor: '#f59e0b', color: '#020617', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
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

        {activeRole === 'barbero_independiente' && (
          <VistaBarberoIndependiente 
            perfilIndependiente={perfilIndependiente}
            setPerfilIndependiente={setPerfilIndependiente}
            citas={citas}
            setCitas={setCitas}
            onCerrarSesion={handleCerrarSesion}
            devConfig={devConfig}
          />
        )}

        {(activeRole === 'admin' || usuarioAutenticado?.role === 'admin') && (
          <VistaAdmin 
            usuario={usuarioAutenticado || { nombre: 'Administrador' }} 
            citas={citas} 
            setCitas={setCitas} 
            barberos={barberos} 
            setBarberos={setBarberos} 
            productos={productos}
            setProductos={setProductos}
            servicios={servicios}
            setServicios={setServicios}
            devConfig={devConfig}
            setDevConfig={setDevConfig}
            licenciaVencida={licenciaVencida}
            tenants={tenants}
            setTenants={setTenants}
            incentivos={incentivos}
            setIncentivos={setIncentivos}
            credencialesAdmin={credencialesAdmin}
            setCredencialesAdmin={setCredencialesAdmin}
          />
        )}

        {activeRole === 'superadmin' && (
          <VistaSuperAdmin 
            tenants={tenants} 
            setTenants={setTenants} 
            devConfig={devConfig} 
            setDevConfig={setDevConfig} 
            barberos={barberos}
            setBarberos={setBarberos}
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
                  placeholder="Ej: admin, elkin, independiente"
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
  
  const hoyStr = new Date().toISOString().split('T')[0];
  const [fecha, setFecha] = useState(hoyStr);
  const [hora, setHora] = useState('10:00 AM');
  const [citaCreada, setCitaCreada] = useState(null);

  const incCumple = incentivos.find(i => i.tipo === 'cumpleanos' && i.activo);

  const horasDisponibles = [
    '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', 
    '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', 
    '05:00 PM', '06:00 PM', '07:00 PM'
  ];

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
      fecha: modo === 'qr_walkin' ? hoyStr : fecha,
      hora: modo === 'qr_walkin' ? 'Atención Inmediata (QR)' : hora,
      precio: precioFinal,
      estado: 'confirmada',
      metodoPago: 'efectivo',
      registradoEnApp: true,
      esCumpleanos: cumple && !!incCumple,
      motivoCancelacion: null
    };

    setCitas([nueva, ...citas]);
    setCitaCreada(nueva);
    setNombre('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ borderBottom: '1px solid rgba(245, 158, 11, 0.2)', paddingBottom: '12px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#fbbf24', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Smartphone style={{ width: '22px', height: '22px' }} />
          Módulo de Reservas Móvil (Mes Completo)
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '12px', margin: '4px 0 0 0' }}>Interfaz táctil optimizada para teléfonos celulares</p>
      </div>

      <div style={{ display: 'flex', gap: '8px', backgroundColor: '#0f172a', padding: '6px', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
        <button
          onClick={() => { setModo('programada'); setCitaCreada(null); }}
          style={{ flex: 1, padding: '10px', backgroundColor: modo === 'programada' ? '#f59e0b' : 'transparent', color: modo === 'programada' ? '#020617' : '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}
        >
          📅 Cita Mes Actual
        </button>
        <button
          onClick={() => { setModo('qr_walkin'); setCitaCreada(null); }}
          style={{ flex: 1, padding: '10px', backgroundColor: modo === 'qr_walkin' ? '#f59e0b' : 'transparent', color: modo === 'qr_walkin' ? '#020617' : '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}
        >
          📱 QR Sede / Expreso
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', width: '100%' }}>
        <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', padding: '16px', boxSizing: 'border-box' }}>
          <form onSubmit={handleReserva} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>Nombre Completo</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Carlos Andrés"
                style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '6px', padding: '10px', color: '#f8fafc', fontSize: '13px', boxSizing: 'border-box' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>Fecha de Nacimiento (Premio Cumpleaños 🎁)</label>
              <input
                type="date"
                value={fechaNac}
                onChange={(e) => setFechaNac(e.target.value)}
                style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '6px', padding: '10px', color: '#f8fafc', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            {esCumpleanos() && incCumple && (
              <div style={{ backgroundColor: 'rgba(5, 150, 105, 0.2)', border: '1px solid #059669', padding: '8px', borderRadius: '6px', color: '#34d399', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Gift style={{ width: '16px', height: '16px' }} />
                <span><strong>¡Felicidades!</strong> Recibes un {incCumple.porcentaje}% de descuento.</span>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>Seleccionar Barbero</label>
              <select
                value={barbero}
                onChange={(e) => setBarbero(e.target.value)}
                style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '6px', padding: '10px', color: '#f8fafc', fontSize: '13px', boxSizing: 'border-box' }}
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
                style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '6px', padding: '10px', color: '#f8fafc', fontSize: '13px', boxSizing: 'border-box' }}
              >
                {servicios.map(s => (
                  <option key={s.id} value={s.nombre}>{s.nombre} (${s.precio.toLocaleString()})</option>
                ))}
              </select>
            </div>

            {modo === 'programada' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>Fecha de Cita (Mes)</label>
                  <input
                    type="date"
                    value={fecha}
                    min={hoyStr}
                    onChange={(e) => setFecha(e.target.value)}
                    style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '6px', padding: '10px', color: '#f8fafc', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '6px' }}>Seleccione Horario (Táctil)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                    {horasDisponibles.map(h => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setHora(h)}
                        style={{
                          backgroundColor: hora === h ? '#f59e0b' : '#020617',
                          color: hora === h ? '#020617' : '#cbd5e1',
                          border: hora === h ? '1px solid #fbbf24' : '1px solid #334155',
                          padding: '8px 4px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              style={{ backgroundColor: '#f59e0b', color: '#020617', fontWeight: 'bold', padding: '12px', borderRadius: '8px', fontSize: '13px', border: 'none', cursor: 'pointer', marginTop: '6px' }}
            >
              {modo === 'programada' ? 'Confirmar Cita Anticipada' : 'Registrar Ingreso Expreso QR'}
            </button>
          </form>
        </div>

        <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', boxSizing: 'border-box' }}>
          {modo === 'qr_walkin' && !citaCreada ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <h4 style={{ color: '#fbbf24', margin: 0, fontSize: '14px' }}>Cartel QR Recepción de Barbería</h4>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>Escanee para registrarse de forma inmediata en el puesto.</p>
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://gol-cut-barber-api.vercel.app?modo=qr_walkin"
                alt="QR Recepción"
                style={{ border: '3px solid #fbbf24', borderRadius: '12px', padding: '6px', backgroundColor: '#ffffff', width: '150px', height: '150px', marginTop: '8px' }}
              />
            </div>
          ) : citaCreada ? (
            <div style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #059669', borderRadius: '10px', padding: '12px', boxSizing: 'border-box' }}>
              <CheckCircle style={{ width: '28px', height: '28px', color: '#34d399', margin: '0 auto 6px auto' }} />
              <h4 style={{ color: '#34d399', margin: '0 0 6px 0', fontSize: '14px' }}>¡Cita Registrada Correctamente!</h4>
              <div style={{ fontSize: '11px', color: '#cbd5e1', textAlign: 'left', backgroundColor: '#0f172a', padding: '8px', borderRadius: '6px' }}>
                <p style={{ margin: '2px 0' }}><span style={{ color: '#94a3b8' }}>Cliente:</span> {citaCreada.cliente}</p>
                <p style={{ margin: '2px 0' }}><span style={{ color: '#94a3b8' }}>Barbero:</span> {citaCreada.barbero}</p>
                <p style={{ margin: '2px 0' }}><span style={{ color: '#94a3b8' }}>Fecha/Hora:</span> {citaCreada.fecha} - {citaCreada.hora}</p>
                <p style={{ margin: '2px 0' }}><span style={{ color: '#94a3b8' }}>Valor:</span> ${citaCreada.precio.toLocaleString()}</p>
              </div>
            </div>
          ) : (
            <div style={{ color: '#64748b' }}>
              <Calendar style={{ width: '40px', height: '40px', margin: '0 auto 8px auto' }} />
              <p style={{ margin: 0, fontSize: '12px' }}>Complete el formulario para programar su espacio</p>
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
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState('efectivo');
  const [esCumpleanosCheck, setEsCumpleanosCheck] = useState(false);

  const [citaACancelar, setCitaACancelar] = useState(null);
  const [motivoPreset, setMotivoPreset] = useState('Cliente no asistió a la cita');
  const [motivoLibre, setMotivoLibre] = useState('');

  const urlWhatsapp = `https://wa.me/${devConfig?.whatsappSoporte || '573001234567'}?text=${encodeURIComponent(devConfig?.mensajeRenovacion || 'Hola')}`;

  if (licenciaVencida) {
    return (
      <div style={{ backgroundColor: '#0f172a', border: '1px solid #f43f5e', borderRadius: '16px', padding: '24px', textAlign: 'center', maxWidth: '500px', margin: '40px auto' }}>
        <AlertTriangle style={{ width: '48px', height: '48px', color: '#f43f5e', margin: '0 auto 12px auto' }} />
        <h3 style={{ color: '#f43f5e', margin: '0 0 8px 0', fontSize: '18px' }}>Suscripción de Barbería Pausada</h3>
        <p style={{ color: '#cbd5e1', fontSize: '12px', margin: '0 0 16px 0' }}>La membresía mensual ha caducado. Contacte al desarrollador.</p>
        <a href={urlWhatsapp} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: '#059669', color: '#fff', textDecoration: 'none', padding: '10px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <MessageCircle style={{ width: '16px', height: '16px' }} /> Contactar al Desarrollador
        </a>
      </div>
    );
  }

  const incCumple = incentivos.find(i => i.tipo === 'cumpleanos' && i.activo);
  const incBarbero = incentivos.find(i => i.tipo === 'barbero' && i.activo);
  const citasBarbero = citas.filter(c => c.barbero.toLowerCase() === (barberoActual?.nombre || '').toLowerCase());
  const atencionesBarbero = citasBarbero.filter(c => c.estado === 'completada').length;
  
  const transferenciasNoRegistradas = citasBarbero.filter(c => c.estado === 'completada' && c.metodoPago === 'transferencia' && !c.registradoEnApp).length;
  const meta = incBarbero?.metaCitas || 15;
  const porcentajeAvance = Math.max(0, Math.min(Math.round(((atencionesBarbero - (transferenciasNoRegistradas * 2)) / meta) * 100), 100));

  const handleEstadoCita = (id, nuevoEstado) => {
    setCitas(citas.map(c => c.id === id ? { ...c, estado: nuevoEstado, registradoEnApp: true } : c));
  };

  const handleConfirmarCancelacion = (e) => {
    e.preventDefault();
    if (!citaACancelar) return;
    const justificacionFinal = motivoPreset === 'Otro motivo...' ? motivoLibre.trim() : motivoPreset;

    setCitas(citas.map(c => c.id === citaACancelar.id ? { 
      ...c, 
      estado: 'cancelada', 
      motivoCancelacion: justificacionFinal 
    } : c));

    setCitaACancelar(null);
    setMotivoLibre('');
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
      cliente: metodoPagoSeleccionado === 'transferencia' ? 'Cliente (Pago por Transferencia)' : 'Cliente Presencial (Efectivo)',
      barbero: barberoActual?.nombre || 'Barbero',
      servicio: servicioRapido,
      fecha: new Date().toISOString().split('T')[0],
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      precio: valorFinal,
      estado: 'completada',
      metodoPago: metodoPagoSeleccionado,
      registradoEnApp: true,
      esCumpleanos: esCumpleanosCheck && !!incCumple,
      motivoCancelacion: null
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
          <p style={{ color: '#94a3b8', fontSize: '11px', margin: '2px 0 0 0' }}>Especialidad: {barberoActual?.especialidad}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '6px 10px', borderRadius: '6px', fontSize: '12px' }}>
            Consolidado Ganancias: <span style={{ color: '#34d399', fontWeight: 'bold' }}>${ingresosHoy.toLocaleString()}</span>
          </div>
          <button onClick={onCerrarSesion} style={{ padding: '6px 10px', backgroundColor: '#334155', color: '#f8fafc', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>Salida</button>
        </div>
      </div>

      {incBarbero && (
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #3b82f6', borderRadius: '10px', padding: '12px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', color: '#93c5fd', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Award style={{ width: '14px', height: '14px' }} /> Control Incentivos & Registro de Transferencias:
            </span>
            <span style={{ fontSize: '11px', color: '#60a5fa', fontWeight: 'bold' }}>{atencionesBarbero} Atenciones ({porcentajeAvance}%)</span>
          </div>
          <div style={{ width: '100%', height: '8px', backgroundColor: '#020617', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${porcentajeAvance}%`, height: '100%', backgroundColor: '#3b82f6', transition: 'width 0.3s ease' }}></div>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: '#94a3b8' }}>
            💡 Recuerda registrar todas tus transferencias en la app. No registrarlas descuenta puntos en tu puntaje de incentivos de alquiler.
          </p>
        </div>
      )}

      <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', padding: '12px', boxSizing: 'border-box' }}>
        <h3 style={{ fontSize: '12px', color: '#fbbf24', fontWeight: 'bold', margin: '0 0 8px 0' }}>Botonera Rápida (Efectivo o Transferencia Personal)</h3>
        <form onSubmit={handleCorteDirecto} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
            <select value={servicioRapido} onChange={(e) => handleCambioServicio(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }}>
              {servicios.map(s => <option key={s.id} value={s.nombre}>{s.nombre}</option>)}
            </select>
            <input type="number" value={precioRapido} onChange={(e) => setPrecioRapido(e.target.value)} placeholder="Valor ($)" style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} required />
            <select value={metodoPagoSeleccionado} onChange={(e) => setMetodoPagoSeleccionado(e.target.value)} style={{ backgroundColor: '#020617', color: '#34d399', border: '1px solid #34d399', padding: '8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
              <option value="efectivo">💵 Pago en Efectivo</option>
              <option value="transferencia">📱 📲 Pago por Transferencia</option>
            </select>
            <button type="submit" style={{ backgroundColor: '#059669', color: '#fff', border: 'none', padding: '8px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}>Registrar Cobro</button>
          </div>
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
                <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: c.estado === 'completada' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: c.estado === 'completada' ? '#34d399' : '#fbbf24', fontWeight: 'bold' }}>
                  {c.estado} ({c.metodoPago || 'efectivo'})
                </span>
              </div>

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
                    onClick={() => setCitaACancelar(c)} 
                    style={{ padding: '6px 8px', backgroundColor: '#450a0a', color: '#f87171', border: '1px solid #ef4444', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '10px' }}
                  >
                    Cancelar / No Asistió
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', padding: '24px', backgroundColor: '#0f172a', borderRadius: '10px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
            No hay citas asignadas.
          </div>
        )}
      </div>

      {citaACancelar && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #f43f5e', borderRadius: '16px', maxWidth: '400px', width: '100%', padding: '20px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#f43f5e', fontSize: '16px' }}>Justificar Cancelación / Ausencia</h3>
            <form onSubmit={handleConfirmarCancelacion} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <select value={motivoPreset} onChange={(e) => setMotivoPreset(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '12px' }}>
                <option value="Cliente no asistió">Cliente no asistió a la cita</option>
                <option value="Barbero ausente / calamidad">Barbero ausente / calamidad</option>
                <option value="Otro motivo...">Otro motivo...</option>
              </select>
              {motivoPreset === 'Otro motivo...' && (
                <textarea rows={3} value={motivoLibre} onChange={(e) => setMotivoLibre(e.target.value)} placeholder="Describa el motivo..." style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '12px' }} required />
              )}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" onClick={() => setCitaACancelar(null)} style={{ flex: 1, backgroundColor: '#334155', color: '#fff', padding: '8px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>Volver</button>
                <button type="submit" style={{ flex: 1, backgroundColor: '#450a0a', color: '#f87171', border: '1px solid #ef4444', padding: '8px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Confirmar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

{/* PERFIL BARBERO INDEPENDIENTE / SOLISTA (BARBERÍA NUEVA PROPIA AUTÓNOMA) */}
function VistaBarberoIndependiente({ perfilIndependiente, setPerfilIndependiente, citas, setCitas, onCerrarSesion, devConfig }) {
  const [servicioNombre, setServicioNombre] = useState('');
  const [servicioPrecio, setServicioPrecio] = useState('');
  const [servicioDuracion, setServicioDuracion] = useState('30 min');

  const [servicioSeleccionado, setServicioSeleccionado] = useState(perfilIndependiente.serviciosPropios[0]?.nombre || '');
  const [precioCobro, setPrecioCobro] = useState(perfilIndependiente.serviciosPropios[0]?.precio || 30000);
  const [metodoPago, setMetodoPago] = useState('efectivo');

  const urlWhatsapp = `https://wa.me/${devConfig?.whatsappSoporte || '573001234567'}?text=${encodeURIComponent('Hola Elkin, soy barbero independiente y deseo renovar mi suscripción mensual a la plataforma.')}`;

  // Citas exclusivas de este barbero solista
  const misCitas = citas.filter(c => c.barbero.toLowerCase() === perfilIndependiente.propietario.toLowerCase());
  const ingresosTotales = misCitas.filter(c => c.estado === 'completada').reduce((sum, c) => sum + (c.precio || 0), 0);

  const handleCrearServicioPropio = (e) => {
    e.preventDefault();
    if (!servicioNombre.trim()) return;

    const nuevoServ = {
      id: 'si' + Date.now(),
      nombre: servicioNombre.trim(),
      precio: Number(servicioPrecio),
      duracion: servicioDuracion
    };

    setPerfilIndependiente({
      ...perfilIndependiente,
      serviciosPropios: [...perfilIndependiente.serviciosPropios, nuevoServ]
    });

    setServicioNombre('');
    setServicioPrecio('');
    alert(`¡Corte "${nuevoServ.nombre}" creado exitosamente en tu barbería independiente!`);
  };

  const handleSeleccionarServicioCatalogo = (nombre) => {
    setServicioSeleccionado(nombre);
    const s = perfilIndependiente.serviciosPropios.find(item => item.nombre === nombre);
    if (s) setPrecioCobro(s.precio);
  };

  const handleCobroIndependiente = (e) => {
    e.preventDefault();
    const nueva = {
      id: 'c' + Date.now(),
      cliente: metodoPago === 'transferencia' ? 'Cliente (Pago por Transferencia)' : 'Cliente Presencial (Efectivo)',
      barbero: perfilIndependiente.propietario,
      servicio: servicioSeleccionado,
      fecha: new Date().toISOString().split('T')[0],
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      precio: Number(precioCobro),
      estado: 'completada',
      metodoPago,
      registradoEnApp: true,
      motivoCancelacion: null
    };
    setCitas([nueva, ...citas]);
    alert('Cobro registrado en tu caja independiente.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(245, 158, 11, 0.2)', paddingBottom: '12px', gap: '8px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#fbbf24', margin: 0 }}>⭐ Perfil Independiente / Solista ({perfilIndependiente.propietario})</h2>
          <p style={{ color: '#94a3b8', fontSize: '11px', margin: '2px 0 0 0' }}>Tu propia barbería autónoma con control total de tus cortes, precios y ganancias</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <a href={urlWhatsapp} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: '#059669', color: '#fff', textDecoration: 'none', padding: '8px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MessageCircle style={{ width: '14px', height: '14px' }} /> WhatsApp Soporte / Renovar
          </a>
          <button onClick={onCerrarSesion} style={{ padding: '8px 12px', backgroundColor: '#334155', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>Salir</button>
        </div>
      </div>

      {/* CONSOLIDADO DE GANANCIAS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #059669', padding: '14px', borderRadius: '10px' }}>
          <span style={{ fontSize: '11px', color: '#34d399', fontWeight: 'bold' }}>💰 Mis Ingresos Totales (Caja)</span>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '4px 0 0 0', color: '#34d399' }}>${ingresosTotales.toLocaleString()}</p>
        </div>
        <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '14px', borderRadius: '10px' }}>
          <span style={{ fontSize: '11px', color: '#fbbf24', fontWeight: 'bold' }}>✂️ Total Atenciones Realizadas</span>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '4px 0 0 0' }}>{misCitas.length}</p>
        </div>
      </div>

      {/* CREAR NUEVOS CORTES Y PRECIOS PROPIOS */}
      <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '16px', borderRadius: '12px' }}>
        <h3 style={{ fontSize: '14px', color: '#fbbf24', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <PlusSquare style={{ width: '16px', height: '16px' }} /> Crear Tus Propios Cortes y Definir Precios
        </h3>
        <form onSubmit={handleCrearServicioPropio} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px' }}>
          <input type="text" placeholder="Nombre del corte (Ej: Desvanecido Pro)" value={servicioNombre} onChange={(e) => setServicioNombre(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} required />
          <input type="number" placeholder="Precio ($)" value={servicioPrecio} onChange={(e) => setServicioPrecio(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} required />
          <input type="text" placeholder="Duración (Ej: 30 min)" value={servicioDuracion} onChange={(e) => setServicioDuracion(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} />
          <button type="submit" style={{ backgroundColor: '#f59e0b', color: '#020617', fontWeight: 'bold', padding: '8px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '11px' }}>Guardar Corte en mi Barbería</button>
        </form>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
          {perfilIndependiente.serviciosPropios.map(s => (
            <div key={s.id} style={{ backgroundColor: '#020617', border: '1px solid #334155', padding: '8px 12px', borderRadius: '8px', fontSize: '11px' }}>
              <span style={{ color: '#fff', fontWeight: 'bold' }}>{s.nombre}</span> - <span style={{ color: '#34d399' }}>${s.precio.toLocaleString()}</span> ({s.duracion})
            </div>
          ))}
        </div>
      </div>

      {/* REGISTRAR COBRO RÁPIDO (EFECTIVO O TRANSFERENCIA) */}
      <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '16px', borderRadius: '12px' }}>
        <h3 style={{ fontSize: '14px', color: '#fbbf24', margin: '0 0 10px 0' }}>Registrar Cobro (Efectivo o Transferencia Personal)</h3>
        <form onSubmit={handleCobroIndependiente} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px' }}>
          <select value={servicioSeleccionado} onChange={(e) => handleSeleccionarServicioCatalogo(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }}>
            {perfilIndependiente.serviciosPropios.map(s => <option key={s.id} value={s.nombre}>{s.nombre}</option>)}
          </select>
          <input type="number" value={precioCobro} onChange={(e) => setPrecioCobro(e.target.value)} placeholder="Precio ($)" style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} required />
          <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} style={{ backgroundColor: '#020617', color: '#34d399', border: '1px solid #34d399', padding: '8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
            <option value="efectivo">💵 Efectivo</option>
            <option value="transferencia">📱 Transferencia Personal</option>
          </select>
          <button type="submit" style={{ backgroundColor: '#059669', color: '#fff', fontWeight: 'bold', padding: '8px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '11px' }}>Sumar a mi Caja</button>
        </form>
      </div>
    </div>
  );
}

{/* VISTA ADMIN CON TODO INCLUIDO Y SIN QUITAR NADA */}
function VistaAdmin({ usuario, citas, setCitas, barberos, setBarberos, productos, setProductos, servicios, setServicios, devConfig, setDevConfig, licenciaVencida, tenants, setTenants, incentivos, setIncentivos, credencialesAdmin, setCredencialesAdmin }) {
  const [tab, setTab] = useState('resumen');
  
  // Seguridad Admin
  const [nuevoUserAdmin, setNuevoUserAdmin] = useState(credencialesAdmin.username);
  const [nuevoPassAdmin, setNuevoPassAdmin] = useState(credencialesAdmin.password);
  const [nuevoNombreAdmin, setNuevoNombreAdmin] = useState(credencialesAdmin.nombre);

  // Reasistencia Citas
  const [citaAReasignar, setCitaAReasignar] = useState(null);
  const [nuevoBarberoDestino, setNuevoBarberoDestino] = useState(barberos[0]?.nombre || '');

  // Servicios Generales Sede
  const [nombreServ, setNombreServ] = useState('');
  const [precioServ, setPrecioServ] = useState('');
  const [duracionServ, setDuracionServ] = useState('30 min');

  // Formularios Originales Admin (Barberos y Productos)
  const [nuevoNombreBarbero, setNuevoNombreBarbero] = useState('');
  const [nuevoUsernameBarbero, setNuevoUsernameBarbero] = useState('');
  const [nuevaClaveBarbero, setNuevaClaveBarbero] = useState('');
  const [especialidad, setEspecialidad] = useState('');

  const [nombreProd, setNombreProd] = useState('');
  const [precioProd, setPrecioProd] = useState('');
  const [stockProd, setStockProd] = useState('');

  const urlWhatsapp = `https://wa.me/${devConfig?.whatsappSoporte || '573001234567'}?text=${encodeURIComponent(devConfig?.mensajeRenovacion || 'Hola Elkin')}`;

  if (licenciaVencida) {
    return (
      <div style={{ backgroundColor: '#0f172a', border: '1px solid #f43f5e', borderRadius: '16px', padding: '24px', textAlign: 'center', maxWidth: '520px', margin: '40px auto' }}>
        <AlertTriangle style={{ width: '48px', height: '48px', color: '#f43f5e', margin: '0 auto 12px auto' }} />
        <h3 style={{ color: '#f43f5e', margin: '0 0 8px 0', fontSize: '18px' }}>Suscripción Mensual Pausada</h3>
        <p style={{ color: '#cbd5e1', fontSize: '12px', margin: '0 0 16px 0' }}>Funciones administrativas bloqueadas por caducidad de licencia.</p>
        <a href={urlWhatsapp} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: '#059669', color: '#fff', textDecoration: 'none', padding: '12px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <MessageCircle style={{ width: '18px', height: '18px' }} /> Renovar por WhatsApp
        </a>
      </div>
    );
  }

  const handleActualizarCredencialesAdmin = (e) => {
    e.preventDefault();
    if (!nuevoUserAdmin.trim() || !nuevoPassAdmin.trim()) return;
    setCredencialesAdmin({
      username: nuevoUserAdmin.trim().toLowerCase(),
      password: nuevoPassAdmin.trim(),
      nombre: nuevoNombreAdmin.trim() || 'Administrador'
    });
    alert('Credenciales de administrador actualizadas con éxito.');
  };

  const handleReasignarCitaSubmit = (e) => {
    e.preventDefault();
    if (!citaAReasignar) return;
    setCitas(citas.map(c => c.id === citaAReasignar.id ? { ...c, barbero: nuevoBarberoDestino } : c));
    setCitaAReasignar(null);
    alert(`Cita reasignada exitosamente a ${nuevoBarberoDestino}.`);
  };

  const handleAgregarServicio = (e) => {
    e.preventDefault();
    if (!nombreServ.trim()) return;
    setServicios([...servicios, { id: 's' + Date.now(), nombre: nombreServ, precio: Number(precioServ), duracion: duracionServ }]);
    setNombreServ('');
    setPrecioServ('');
  };

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

  const ingresosTotalesDia = citas.filter(c => c.estado === 'completada').reduce((sum, c) => sum + (c.precio || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(245, 158, 11, 0.2)', paddingBottom: '12px', gap: '8px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#fbbf24', margin: 0 }}>Panel Administrativo General ({usuario?.nombre})</h2>
          <p style={{ color: '#94a3b8', fontSize: '11px', margin: '2px 0 0 0' }}>Control absoluto de ingresos, barberos, inventario y seguridad</p>
        </div>
        <div style={{ backgroundColor: '#0f172a', padding: '2px', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', gap: '2px', overflowX: 'auto' }}>
          <button onClick={() => setTab('resumen')} style={{ padding: '6px 10px', background: tab === 'resumen' ? '#f59e0b' : 'none', color: tab === 'resumen' ? '#020617' : '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Resumen & Ingresos</button>
          <button onClick={() => setTab('barberos')} style={{ padding: '6px 10px', background: tab === 'barberos' ? '#f59e0b' : 'none', color: tab === 'barberos' ? '#020617' : '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Barberos</button>
          <button onClick={() => setTab('servicios')} style={{ padding: '6px 10px', background: tab === 'servicios' ? '#f59e0b' : 'none', color: tab === 'servicios' ? '#020617' : '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Servicios & Precios</button>
          <button onClick={() => setTab('productos')} style={{ padding: '6px 10px', background: tab === 'productos' ? '#f59e0b' : 'none', color: tab === 'productos' ? '#020617' : '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Inventario</button>
          <button onClick={() => setTab('config_admin')} style={{ padding: '6px 10px', background: tab === 'config_admin' ? '#f59e0b' : 'none', color: tab === 'config_admin' ? '#020617' : '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Seguridad Admin</button>
        </div>
      </div>

      {tab === 'resumen' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* TOTAL DIARIO Y DESGLOSE INDIVIDUAL */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            <div style={{ backgroundColor: '#0f172a', border: '1px solid #059669', padding: '14px', borderRadius: '10px' }}>
              <span style={{ fontSize: '11px', color: '#34d399', fontWeight: 'bold' }}>💰 Total Dinero Ingresado Hoy (Sede)</span>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '6px 0 0 0', color: '#34d399' }}>${ingresosTotalesDia.toLocaleString()}</p>
            </div>
          </div>

          <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '14px', borderRadius: '10px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#fbbf24', fontSize: '13px' }}>📊 Cuánto Dinero Hace Cada Barbero Individualmente</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              {barberos.map(b => {
                const ingresosBarbero = citas
                  .filter(c => c.barbero.toLowerCase() === b.nombre.toLowerCase() && c.estado === 'completada')
                  .reduce((sum, c) => sum + (c.precio || 0), 0);
                
                return (
                  <div key={b.id} style={{ backgroundColor: '#020617', padding: '10px', borderRadius: '8px', border: '1px solid #334155' }}>
                    <span style={{ fontSize: '12px', color: '#fff', fontWeight: 'bold' }}>{b.nombre}</span>
                    <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#34d399', margin: '4px 0 0 0' }}>${ingresosBarbero.toLocaleString()}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AGENDA Y REASIGNACIÓN SI BARBERO NO ASISTIÓ */}
          <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', padding: '14px', overflowX: 'auto' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#fbbf24', fontSize: '13px' }}>Control de Agendas, Citas & Reasistencia por Ausencia</h4>
            <table style={{ width: '100%', textAlign: 'left', fontSize: '11px', color: '#cbd5e1' }}>
              <thead>
                <tr style={{ color: '#fbbf24', borderBottom: '1px solid #334155' }}>
                  <th style={{ padding: '6px' }}>Cliente</th>
                  <th style={{ padding: '6px' }}>Barbero Asignado</th>
                  <th style={{ padding: '6px' }}>Servicio</th>
                  <th style={{ padding: '6px' }}>Pago</th>
                  <th style={{ padding: '6px' }}>Estado</th>
                  <th style={{ padding: '6px', textAlign: 'right' }}>Acción Agenda</th>
                </tr>
              </thead>
              <tbody>
                {citas.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '6px', fontWeight: 'bold', color: '#fff' }}>{c.cliente}</td>
                    <td style={{ padding: '6px', color: '#fbbf24' }}>{c.barbero}</td>
                    <td style={{ padding: '6px' }}>{c.servicio}</td>
                    <td style={{ padding: '6px' }}>${(c.precio || 0).toLocaleString()} ({c.metodoPago || 'efectivo'})</td>
                    <td style={{ padding: '6px' }}><span style={{ color: '#34d399', fontWeight: 'bold' }}>{c.estado}</span></td>
                    <td style={{ padding: '6px', textAlign: 'right' }}>
                      {c.estado !== 'completada' && c.estado !== 'cancelada' && (
                        <button onClick={() => setCitaAReasignar(c)} style={{ padding: '4px 8px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>
                          🔄 Reasignar Barbero
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

      {tab === 'barberos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <form onSubmit={handleAgregarBarbero} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '6px', backgroundColor: '#0f172a', padding: '10px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <input type="text" placeholder="Nombre completo..." value={nuevoNombreBarbero} onChange={(e) => setNuevoNombreBarbero(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '6px', borderRadius: '4px', fontSize: '11px' }} required />
            <input type="text" placeholder="Usuario login" value={nuevoUsernameBarbero} onChange={(e) => setNuevoUsernameBarbero(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '6px', borderRadius: '4px', fontSize: '11px' }} required />
            <input type="password" placeholder="Contraseña" value={nuevaClaveBarbero} onChange={(e) => setNuevaClaveBarbero(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '6px', borderRadius: '4px', fontSize: '11px' }} required />
            <input type="text" placeholder="Especialidad" value={especialidad} onChange={(e) => setEspecialidad(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '6px', borderRadius: '4px', fontSize: '11px' }} />
            <button type="submit" style={{ backgroundColor: '#f59e0b', color: '#020617', border: 'none', padding: '6px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px', gridColumn: '1 / -1' }}>Registrar Nuevo Barbero</button>
          </form>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            {barberos.map(b => (
              <div key={b.id} style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '12px', borderRadius: '10px' }}>
                <h4 style={{ margin: 0, color: '#fff', fontSize: '13px' }}>{b.nombre}</h4>
                <p style={{ margin: '2px 0', fontSize: '10px', color: '#fbbf24' }}>User: {b.username} | Clave: {b.claveAcceso}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'servicios' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <form onSubmit={handleAgregarServicio} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', backgroundColor: '#0f172a', padding: '12px', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <input type="text" placeholder="Nombre nuevo corte / servicio..." value={nombreServ} onChange={(e) => setNombreServ(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} required />
            <input type="number" placeholder="Precio ($)" value={precioServ} onChange={(e) => setPrecioServ(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} required />
            <input type="text" placeholder="Duración (ej: 30 min)" value={duracionServ} onChange={(e) => setDuracionServ(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} />
            <button type="submit" style={{ backgroundColor: '#f59e0b', color: '#020617', border: 'none', padding: '8px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}>Crear Servicio</button>
          </form>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {servicios.map(s => (
              <div key={s.id} style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '12px', borderRadius: '10px' }}>
                <h4 style={{ margin: 0, color: '#fff', fontSize: '13px' }}>{s.nombre}</h4>
                <p style={{ margin: '4px 0', color: '#34d399', fontWeight: 'bold' }}>${s.precio.toLocaleString()}</p>
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>⏱️ {s.duracion}</span>
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
                </tr>
              </thead>
              <tbody>
                {productos.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '6px', fontWeight: 'bold', color: '#fff' }}>{p.nombre}</td>
                    <td style={{ padding: '6px', color: '#34d399' }}>${p.precio.toLocaleString()}</td>
                    <td style={{ padding: '6px' }}>{p.stock} u.</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'config_admin' && (
        <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '16px', borderRadius: '12px', maxWidth: '450px' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#fbbf24', fontSize: '15px' }}>Cambiar Usuario y Contraseña de Administrador</h3>
          <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 12px 0' }}>Actualice sus credenciales si no desea conservar el usuario por defecto.</p>
          
          <form onSubmit={handleActualizarCredencialesAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>Nombre Visible</label>
              <input type="text" value={nuevoNombreAdmin} onChange={(e) => setNuevoNombreAdmin(e.target.value)} style={{ width: '100%', backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '12px' }} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>Nuevo Usuario Admin</label>
              <input type="text" value={nuevoUserAdmin} onChange={(e) => setNuevoUserAdmin(e.target.value)} style={{ width: '100%', backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '12px' }} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>Nueva Contraseña</label>
              <input type="password" value={nuevoPassAdmin} onChange={(e) => setNuevoPassAdmin(e.target.value)} style={{ width: '100%', backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '12px' }} required />
            </div>
            <button type="submit" style={{ backgroundColor: '#f59e0b', color: '#020617', fontWeight: 'bold', padding: '10px', borderRadius: '6px', border: 'none', cursor: 'pointer', marginTop: '6px' }}>Guardar Nuevas Credenciales</button>
          </form>
        </div>
      )}

      {citaAReasignar && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #3b82f6', borderRadius: '16px', maxWidth: '380px', width: '100%', padding: '20px' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#60a5fa', fontSize: '15px' }}>Reasignar Cita por Ausencia</h3>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 12px 0' }}>Cliente: <strong>{citaAReasignar.cliente}</strong> ({citaAReasignar.servicio})</p>
            
            <form onSubmit={handleReasignarCitaSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontSize: '11px', color: '#cbd5e1' }}>Seleccionar Nuevo Barbero Disponible:</label>
              <select value={nuevoBarberoDestino} onChange={(e) => setNuevoBarberoDestino(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '12px' }}>
                {barberos.map(b => <option key={b.id} value={b.nombre}>{b.nombre}</option>)}
              </select>
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button type="button" onClick={() => setCitaAReasignar(null)} style={{ flex: 1, backgroundColor: '#334155', color: '#fff', padding: '8px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" style={{ flex: 1, backgroundColor: '#3b82f6', color: '#fff', padding: '8px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Reasignar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

{/* CONSOLA SUPERADMIN */}
function VistaSuperAdmin({ tenants, setTenants, devConfig, setDevConfig, barberos, setBarberos, onIngresarComoSoporte }) {
  const [whatsapp, setWhatsapp] = useState(devConfig?.whatsappSoporte || '573001234567');

  const handleWhatsappSave = (e) => {
    e.preventDefault();
    setDevConfig({ ...devConfig, whatsappSoporte: whatsapp });
    alert('¡WhatsApp de soporte actualizado!');
  };

  const eliminarBarberoSuperAdmin = (id, nombre) => {
    if (window.confirm(`¿Seguro que desea eliminar el usuario de barbero "${nombre}" del sistema?`)) {
      setBarberos(barberos.filter(b => b.id !== id));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ borderBottom: '1px solid rgba(245, 158, 11, 0.2)', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fbbf24', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Server style={{ width: '20px', height: '20px' }} /> Consola Desarrollador Root (`elkin-dev26`)
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '11px', margin: '2px 0 0 0' }}>Control absoluto de claves, perfiles y licencias SaaS</p>
        </div>
        <span style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>Acceso Root</span>
      </div>

      <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '14px', borderRadius: '10px' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#fbbf24', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Key style={{ width: '16px', height: '16px' }} /> Control Desarrollador: Crear, Ver o Eliminar Claves de Cualquier Perfil
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
          {barberos.map(b => (
            <div key={b.id} style={{ backgroundColor: '#020617', padding: '10px', borderRadius: '8px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '12px', color: '#fff', fontWeight: 'bold' }}>{b.nombre}</span>
                <p style={{ fontSize: '10px', color: '#fbbf24', margin: '2px 0 0 0' }}>User: <strong>{b.username}</strong> | Clave: <strong>{b.claveAcceso}</strong></p>
              </div>
              <button onClick={() => eliminarBarberoSuperAdmin(b.id, b.nombre)} style={{ backgroundColor: '#450a0a', color: '#f87171', border: '1px solid #ef4444', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>Eliminar</button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '14px', borderRadius: '10px', maxWidth: '400px' }}>
        <h3 style={{ margin: '0 0 8px 0', color: '#fbbf24', fontSize: '13px' }}>WhatsApp Global de Soporte</h3>
        <form onSubmit={handleWhatsappSave} style={{ display: 'flex', gap: '6px' }}>
          <input type="text" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} style={{ flex: 1, backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '6px', borderRadius: '6px', fontSize: '11px' }} />
          <button type="submit" style={{ backgroundColor: '#059669', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}>Guardar</button>
        </form>
      </div>
    </div>
  );
}