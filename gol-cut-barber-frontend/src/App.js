import React, { useState, useEffect } from 'react';
import { 
  Scissors, User, Lock, LogOut, Calendar, Clock, 
  CheckCircle, Plus, Trash2, Shield, Search, Unlock, 
  History, MessageCircle, QrCode, PlusCircle, DollarSign, Terminal 
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
    mensajeRenovacion: 'Hola Elkin, deseo renovar mi membresía mensual de Gol Cut Barber.'
  });

  // Multi-Tenant SaaS (30 Días)[cite: 1]
  const [tenants, setTenants] = useState([
    { id: 't1', nombreBarberia: 'Gol Cut Barber - Sede Principal', dueno: 'Elkin Ramírez', estadoLicencia: 'Activa', diasRestantes: 28 },
    { id: 't2', nombreBarberia: 'Barbería Demo SENA', dueno: 'Instructor SENA', estadoLicencia: 'Activa', diasRestantes: 30 },
    { id: 't3', nombreBarberia: 'Barbería Demo Cliente', dueno: 'Cliente Comercial', estadoLicencia: 'Prueba 1 Mes', diasRestantes: 15 }
  ]);

  // Barberos con control de cupos y clave a 90 días[cite: 1]
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

  // Auditoría de Accesos[cite: 1]
  const [logsSesion, setLogsSesion] = useState([
    { id: 'l1', usuario: 'Elkin Ramírez', rol: 'barbero', fechaHora: '2026-11-08 08:00 AM', evento: 'Marcación de Ingreso' },
    { id: 'l2', usuario: 'demo-sena', rol: 'evaluacion', fechaHora: '2026-11-08 09:15 AM', evento: 'Ingreso Audit SENA' }
  ]);

  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

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
      setLoginError('Credenciales no válidas.');
    }
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

  // Cambio manual de vista habilitado
  const handleCambioSelección = (e) => {
    const val = e.target.value;
    setActiveRole(val);
    if (!usuarioAutenticado && val !== 'cliente') {
      setIsLoginOpen(true);
    }
  };

  return (
    <div style={{ backgroundColor: '#020617', color: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* NAVBAR OCURA CON DETALLES DORADOS */}
      <header style={{ backgroundColor: '#0f172a', borderBottom: '1px solid #f59e0b', padding: '12px 24px', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid #f59e0b', borderRadius: '8px' }}>
              <Scissors style={{ width: '24px', height: '24px', color: '#fbbf24' }} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#fbbf24', letterSpacing: '0.05em' }}>
                PELUQUERÍA GOL CUT BARBER
              </h1>
              <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Plataforma SaaS de Gestión & Reservas</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Selector directo de Perfiles Habilitado */}
            <select
              value={activeRole}
              onChange={handleCambioSelección}
              style={{ backgroundColor: '#020617', border: '1px solid #f59e0b', color: '#f8fafc', fontSize: '12px', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
            >
              <option value="cliente">Vista: Cliente (Reservas)</option>
              <option value="barbero">Vista: Barbero</option>
              <option value="admin">Vista: Administrador</option>
              <option value="evaluacion">Perfil Evaluación / SENA</option>
              <option value="sucursal">Perfil Demostración / Sucursal</option>
              <option value="superadmin">Perfil Desarrollador / SuperAdmin</option>
            </select>

            {usuarioAutenticado ? (
              <button
                onClick={handleCerrarSesion}
                style={{ backgroundColor: '#881337', color: '#fda4af', border: '1px solid #f43f5e', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Cerrar Sesión
              </button>
            ) : (
              <button
                onClick={() => setIsLoginOpen(true)}
                style={{ backgroundColor: '#f59e0b', color: '#020617', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Iniciar Sesión
              </button>
            )}
          </div>
        </div>
      </header>

      {/* CONTENEDOR PRINCIPAL */}
      <main style={{ maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '24px', flex: 1 }}>
        {activeRole === 'cliente' && (
          <VistaCliente 
            barberos={barberos.filter(b => b.estado === 'Activo')} 
            servicios={servicios} 
            citas={citas} 
            setCitas={setCitas} 
          />
        )}

        {activeRole === 'barbero' && (
          <VistaBarbero 
            barberoActual={usuarioAutenticado || { nombre: 'Elkin Ramírez' }} 
            citas={citas} 
            setCitas={setCitas} 
            servicios={servicios} 
            onCerrarSesion={handleCerrarSesion} 
          />
        )}

        {['admin', 'sucursal', 'evaluacion'].includes(activeRole) && (
          <VistaAdmin 
            usuario={usuarioAutenticado || { nombre: 'Local / Auditoría' }} 
            citas={citas} 
            setCitas={setCitas} 
            barberos={barberos} 
            setBarberos={setBarberos} 
            logsSesion={logsSesion} 
            devConfig={devConfig} 
          />
        )}

        {activeRole === 'superadmin' && (
          <VistaSuperAdmin 
            tenants={tenants} 
            setTenants={setTenants} 
            devConfig={devConfig} 
            setDevConfig={setDevConfig} 
          />
        )}
      </main>

      {/* MODAL DE INICIO DE SESIÓN */}
      {isLoginOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #f59e0b', borderRadius: '16px', maxWidth: '400px', width: '100%', padding: '24px', position: 'relative' }}>
            <button 
              onClick={() => setIsLoginOpen(false)} 
              style={{ position: 'absolute', top: '16px', right: '16px', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
            >
              ✕
            </button>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ width: '48px', height: '48px', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid #f59e0b', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                <Lock style={{ width: '24px', height: '24px', color: '#fbbf24' }} />
              </div>
              <h3 style={{ margin: 0, color: '#fbbf24', fontSize: '20px', fontWeight: 'bold' }}>Ingreso a Gol Cut Barber</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>Ingrese credenciales autorizadas</p>
            </div>

            {loginError && (
              <div style={{ marginBottom: '16px', padding: '10px', backgroundColor: 'rgba(136, 19, 55, 0.6)', border: '1px solid #f43f5e', borderRadius: '8px', color: '#fda4af', fontSize: '12px', textAlign: 'center' }}>
                {loginError}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '4px' }}>Usuario</label>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="Ej: demo-sena, admin, barbero, elkin-dev26"
                  style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#f8fafc', fontSize: '14px', boxSizing: 'border-box' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '4px' }}>Contraseña</label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#f8fafc', fontSize: '14px', boxSizing: 'border-box' }}
                  required
                />
              </div>
              <button
                type="submit"
                style={{ backgroundColor: '#f59e0b', color: '#020617', fontWeight: 'bold', padding: '12px', borderRadius: '8px', fontSize: '14px', border: 'none', cursor: 'pointer', marginTop: '8px' }}
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

{/* SUBCOMPONENTE VISTA CLIENTE CON TEMA OSCURO */}
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ borderBottom: '1px solid rgba(245, 158, 11, 0.2)', paddingBottom: '16px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#fbbf24', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Scissors style={{ width: '28px', height: '28px' }} />
          Reserva de Citas en Línea
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '14px', margin: '4px 0 0 0' }}>Agende su turno presencial con confirmación por código QR</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#f8fafc', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar style={{ width: '20px', height: '20px', color: '#fbbf24' }} />
            Formulario de Agendamiento
          </h3>
          <form onSubmit={handleReserva} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '4px' }}>Nombre Completo</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ingrese su nombre"
                style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#f8fafc', fontSize: '14px', boxSizing: 'border-box' }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '4px' }}>Seleccionar Barbero</label>
              <select
                value={barbero}
                onChange={(e) => setBarbero(e.target.value)}
                style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#f8fafc', fontSize: '14px', boxSizing: 'border-box' }}
              >
                {barberos.map(b => (
                  <option key={b.id} value={b.nombre}>{b.nombre} ({b.especialidad})</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '4px' }}>Servicio</label>
              <select
                value={servicio}
                onChange={(e) => setServicio(e.target.value)}
                style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#f8fafc', fontSize: '14px', boxSizing: 'border-box' }}
              >
                {servicios.map(s => (
                  <option key={s.id} value={s.nombre}>{s.nombre} (${s.precio.toLocaleString()})</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '4px' }}>Fecha</label>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#f8fafc', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '4px' }}>Hora</label>
                <select
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#f8fafc', fontSize: '14px', boxSizing: 'border-box' }}
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="02:00 PM">02:00 PM</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              style={{ backgroundColor: '#f59e0b', color: '#020617', fontWeight: 'bold', padding: '12px', borderRadius: '8px', fontSize: '14px', border: 'none', cursor: 'pointer', marginTop: '8px' }}
            >
              Confirmar Reserva
            </button>
          </form>
        </div>

        <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#f8fafc', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <QrCode style={{ width: '20px', height: '20px', color: '#fbbf24' }} />
            Ticket Expreso con Código QR
          </h3>
          {citaCreada ? (
            <div style={{ backgroundColor: '#020617', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
              <CheckCircle style={{ width: '32px', height: '32px', color: '#34d399', margin: '0 auto 8px auto' }} />
              <h4 style={{ color: '#34d399', margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold' }}>¡Cita Registrada Exitosamente!</h4>
              <div style={{ fontSize: '12px', color: '#cbd5e1', backgroundColor: '#0f172a', padding: '12px', borderRadius: '8px', textAlign: 'left', margin: '8px 0' }}>
                <p style={{ margin: '2px 0' }}><span style={{ color: '#94a3b8' }}>Cliente:</span> {citaCreada.cliente}</p>
                <p style={{ margin: '2px 0' }}><span style={{ color: '#94a3b8' }}>Servicio:</span> {citaCreada.servicio}</p>
                <p style={{ margin: '2px 0' }}><span style={{ color: '#94a3b8' }}>Barbero:</span> {citaCreada.barbero}</p>
                <p style={{ margin: '2px 0' }}><span style={{ color: '#94a3b8' }}>Fecha/Hora:</span> {citaCreada.fecha} - {citaCreada.hora}</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=GOLCUT-${citaCreada.id}`}
                  alt="QR Cita"
                  style={{ border: '2px solid #fbbf24', borderRadius: '8px', padding: '4px', backgroundColor: '#fff' }}
                />
              </div>
            </div>
          ) : (
            <div style={{ backgroundColor: 'rgba(2, 6, 23, 0.6)', border: '1px dashed #334155', borderRadius: '12px', padding: '32px', textAlign: 'center', color: '#64748b' }}>
              <QrCode style={{ width: '48px', height: '48px', margin: '0 auto 8px auto' }} />
              <p style={{ margin: 0, fontSize: '14px' }}>Complete el formulario para generar su ticket con código QR</p>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(245, 158, 11, 0.2)', paddingBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#fbbf24', margin: 0 }}>Panel de Barbero - {barberoActual?.nombre}</h2>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: '4px 0 0 0' }}>Citas asignadas y atenciones expresas</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '6px 12px', borderRadius: '8px', fontSize: '14px' }}>
            Total Hoy: <span style={{ color: '#34d399', fontWeight: 'bold' }}>${ingresosHoy.toLocaleString()}</span>
          </div>
          <button onClick={onCerrarSesion} style={{ padding: '6px 12px', backgroundColor: '#334155', color: '#f8fafc', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Marcar Salida</button>
        </div>
      </div>

      <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', padding: '20px' }}>
        <h3 style={{ fontSize: '14px', color: '#fbbf24', fontWeight: 'bold', margin: '0 0 12px 0' }}>Botonera Expresa (Cliente Sin Cita Previa)</h3>
        <form onSubmit={handleCorteDirecto} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <select value={servicioRapido} onChange={(e) => setServicioRapido(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px' }}>
            {servicios.map(s => <option key={s.id} value={s.nombre}>{s.nombre}</option>)}
          </select>
          <input type="number" value={precioRapido} onChange={(e) => setPrecioRapido(e.target.value)} placeholder="Valor ($)" style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px' }} required />
          <button type="submit" style={{ backgroundColor: '#059669', color: '#fff', border: 'none', padding: '8px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Sumar a Caja</button>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {citasBarbero.map(c => (
          <div key={c.id} style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', padding: '16px' }}>
            <h4 style={{ margin: 0, color: '#f8fafc' }}>{c.cliente}</h4>
            <p style={{ margin: '4px 0', color: '#fbbf24', fontSize: '12px' }}>{c.servicio}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', borderTop: '1px solid #1e293b', paddingTop: '8px', marginTop: '8px' }}>
              <span>{c.fecha} - {c.hora}</span>
              <span style={{ color: '#34d399', fontWeight: 'bold' }}>${(c.precio || 0).toLocaleString()}</span>
            </div>
            {c.estado !== 'completada' && (
              <button onClick={() => handleEstadoCita(c.id, 'completada')} style={{ width: '100%', marginTop: '12px', padding: '8px', backgroundColor: '#064e3b', color: '#34d399', border: '1px solid #059669', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(245, 158, 11, 0.2)', paddingBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#fbbf24', margin: 0 }}>Panel Administrativo ({usuario?.nombre})</h2>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: '4px 0 0 0' }}>Control de alquiler de cupos y auditoría de asistencia</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <a href={urlWhatsapp} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: '#059669', color: '#fff', textDecoration: 'none', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>
            Renovar WhatsApp
          </a>
          <div style={{ backgroundColor: '#0f172a', padding: '4px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <button onClick={() => setTab('resumen')} style={{ padding: '6px 12px', background: tab === 'resumen' ? '#f59e0b' : 'none', color: tab === 'resumen' ? '#020617' : '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Resumen</button>
            <button onClick={() => setTab('cupos')} style={{ padding: '6px 12px', background: tab === 'cupos' ? '#f59e0b' : 'none', color: tab === 'cupos' ? '#020617' : '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Control Cupos</button>
            <button onClick={() => setTab('auditoria')} style={{ padding: '6px 12px', background: tab === 'auditoria' ? '#f59e0b' : 'none', color: tab === 'auditoria' ? '#020617' : '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Auditoría</button>
          </div>
        </div>
      </div>

      {tab === 'resumen' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '20px', borderRadius: '12px' }}>
            <span style={{ fontSize: '12px', color: '#fbbf24', fontWeight: 'bold' }}>Ingresos Totales</span>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '4px 0 0 0' }}>${ingresosTotales.toLocaleString()}</p>
          </div>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '20px', borderRadius: '12px' }}>
            <span style={{ fontSize: '12px', color: '#fbbf24', fontWeight: 'bold' }}>Atendidas</span>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '4px 0 0 0' }}>{citas.filter(c => c.estado === 'completada').length}</p>
          </div>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '20px', borderRadius: '12px' }}>
            <span style={{ fontSize: '12px', color: '#fbbf24', fontWeight: 'bold' }}>Pendientes</span>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '4px 0 0 0' }}>{citas.filter(c => c.estado === 'confirmada').length}</p>
          </div>
        </div>
      )}

      {tab === 'cupos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <form onSubmit={handleAgregar} style={{ display: 'flex', gap: '8px', backgroundColor: '#0f172a', padding: '12px', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <input type="text" placeholder="Nombre barbero..." value={nuevoBarbero} onChange={(e) => setNuevoBarbero(e.target.value)} style={{ flex: 1, backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px' }} required />
            <button type="submit" style={{ backgroundColor: '#f59e0b', color: '#020617', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Crear Barbero</button>
          </form>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {barberos.map(b => (
              <div key={b.id} style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '16px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h4 style={{ margin: 0, color: '#fff' }}>{b.nombre}</h4>
                  <span style={{ fontSize: '12px', color: b.estado === 'Activo' ? '#34d399' : '#f43f5e', fontWeight: 'bold' }}>{b.estado}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button onClick={() => toggleBarbero(b.id)} style={{ flex: 1, padding: '6px', backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', borderRadius: '6px', cursor: 'pointer' }}>
                    {b.estado === 'Activo' ? 'Bloquear Cupo' : 'Activar (Pago)'}
                  </button>
                  <button onClick={() => eliminarBarbero(b.id)} style={{ padding: '6px 12px', backgroundColor: '#450a0a', color: '#f87171', border: '1px solid #ef4444', borderRadius: '6px', cursor: 'pointer' }}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'auditoria' && (
        <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', padding: '16px' }}>
          <table style={{ width: '100%', textAlign: 'left', fontSize: '12px', color: '#cbd5e1' }}>
            <thead>
              <tr style={{ color: '#fbbf24', borderBottom: '1px solid #334155' }}>
                <th style={{ padding: '8px' }}>Personal</th>
                <th style={{ padding: '8px' }}>Rol</th>
                <th style={{ padding: '8px' }}>Fecha/Hora</th>
                <th style={{ padding: '8px' }}>Evento</th>
              </tr>
            </thead>
            <tbody>
              {logsSesion.map(l => (
                <tr key={l.id} style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '8px', fontWeight: 'bold' }}>{l.usuario}</td>
                  <td style={{ padding: '8px' }}>{l.rol}</td>
                  <td style={{ padding: '8px', color: '#94a3b8' }}>{l.fechaHora}</td>
                  <td style={{ padding: '8px', color: '#34d399' }}>{l.evento}</td>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ borderBottom: '1px solid rgba(245, 158, 11, 0.2)', paddingBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#fbbf24', margin: 0 }}>Consola del Desarrollador (`elkin-dev26`)</h2>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: '4px 0 0 0' }}>Control multi-barbería SaaS y WhatsApp de soporte</p>
        </div>
        <span style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>Acceso Root Oculto</span>
      </div>

      <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '20px', borderRadius: '12px' }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#fbbf24', fontSize: '14px' }}>WhatsApp de Soporte Técnico</h3>
        <form onSubmit={handleWhatsappSave} style={{ display: 'flex', gap: '8px' }}>
          <input type="text" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} style={{ flex: 1, backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px' }} />
          <button type="submit" style={{ backgroundColor: '#059669', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Guardar</button>
        </form>
      </div>

      <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '20px', borderRadius: '12px' }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#fbbf24', fontSize: '14px' }}>Barberías SaaS Registradas (Control de Licencias)</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {tenants.map(t => (
            <div key={t.id} style={{ backgroundColor: '#020617', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #1e293b' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 'bold', color: '#fff', fontSize: '12px' }}>{t.nombreBarberia}</p>
                <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#94a3b8' }}>Dueño: {t.dueno} | Licencia: {t.diasRestantes} días</p>
              </div>
              <button onClick={() => toggleTenant(t.id)} style={{ backgroundColor: '#f59e0b', color: '#020617', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                {t.estadoLicencia === 'Activa' ? 'Pausar' : 'Activar'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}