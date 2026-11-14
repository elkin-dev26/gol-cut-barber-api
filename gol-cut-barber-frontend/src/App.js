import React, { useState, useEffect } from 'react';
import {  
  Scissors, Lock, Smartphone, CheckCircle,  
  Gift, Award, AlertTriangle, Server, Key, PlusSquare, MessageCircle, Trash2, Building, Edit3, ExternalLink, DollarSign, Clock, Users
} from 'lucide-react';

export default function App() {
  const [activeRole, setActiveRole] = useState('cliente');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [usuarioAutenticado, setUsuarioAutenticado] = useState(null);

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [rolPendientePassword, setRolPendientePassword] = useState(null);

  const [slotDuration, setSlotDuration] = useState(30); 
  const [globalTimer, setGlobalTimer] = useState({ Mañana: false, Tarde: false, Noche: false });
  const [chairFeeConfig, setChairFeeConfig] = useState(() => {
    const guardado = localStorage.getItem('chairFeeConfig');
    return guardado ? JSON.parse(guardado) : { tipo: 'fijo', valor: 50000 };
  });

  const [credencialesAdmin, setCredencialesAdmin] = useState({
    username: 'admin',
    password: 'admin123',
    nombre: 'Administrador Local'
  });

  const [agendaPausadaSede, setAgendaPausadaSede] = useState(false);
  const [mensajePausaGeneral, setMensajePausaGeneral] = useState('Lo sentimos mucho, la sede se encuentra cerrada por día libre o evento especial el día de hoy.');

  const [devConfig, setDevConfig] = useState({
    whatsappSoporte: '573001234567',
    mensajeRenovacion: 'Hola Elkin, deseo renovar mi membresía mensual de Gol Cut Barber.',
  });

  const [incentivos, setIncentivos] = useState(() => {
    const guardado = localStorage.getItem('gol_cut_incentivos');
    if (guardado) return JSON.parse(guardado);
    return [
      {
        id: 'inc1',
        tipo: 'cumpleanos',
        titulo: 'Descuento Cumpleaños Cliente',
        descripcion: 'Los clientes obtienen un 10% de descuento automático al reservar en su día.',
        activo: true,
        porcentaje: 10,
        destinatario: 'Todos los Clientes'
      },
      {
        id: 'inc2',
        tipo: 'barbero',
        titulo: 'Premio Alquiler Silla Barbero',
        descripcion: 'Barberos que superen la meta mensual ganan descuento en alquiler.',
        activo: true,
        metaCitas: 15,
        porcentaje: 5,
        destinatario: 'Todos los Barberos'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('gol_cut_incentivos', JSON.stringify(incentivos));
  }, [incentivos]);

  // Lista multi-tenant de barberías SaaS (Sedes principales)
  const [tenants, setTenants] = useState(() => {
    const guardado = localStorage.getItem('gol_cut_tenants_saas');
    if (guardado) return JSON.parse(guardado);
    return [
      { id: 't1', nombreBarberia: 'Gol Cut Barber - Sede Principal', dueno: 'Elkin Ramírez', estadoLicencia: 'Activa', diasRestantes: 28, whatsappContacto: '573001234567' },
      { id: 't2', nombreBarberia: 'Barbería Perfil Evaluador', dueno: 'Comité Evaluador', estadoLicencia: 'Activa', diasRestantes: 30, whatsappContacto: '573009876543' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('gol_cut_tenants_saas', JSON.stringify(tenants));
  }, [tenants]);

  // Tenant/Barbería activa seleccionada actualmente en la plataforma
  const [tenantActivoId, setTenantActivoId] = useState(tenants[0]?.id || 't1');
  const tenantPrincipal = tenants.find(t => t.id === tenantActivoId) || tenants[0];

  const [barberos, setBarberos] = useState(() => {
    const guardado = localStorage.getItem('gol_cut_barberos_sede');
    if (guardado) return JSON.parse(guardado);
    return [
      { id: 'b1', tenantId: 't1', username: 'elkin', nombre: 'Elkin Ramírez', especialidad: 'Estilista Profesional', estado: 'Activo', claveAcceso: 'barbero123', pausado: false, mensajePausa: 'Elkin no laborará este día.', billingCycle: 'mensual', diasRestantesBarber: 30, isLocked: false },
      { id: 'b2', tenantId: 't1', username: 'mateo', nombre: 'Mateo Gómez', especialidad: 'Barbero Senior', estado: 'Activo', claveAcceso: 'mateo2026', pausado: false, mensajePausa: 'Mateo en evento especial.', billingCycle: 'mensual', diasRestantesBarber: 30, isLocked: false }
    ];
  });

  useEffect(() => {
    localStorage.setItem('gol_cut_barberos_sede', JSON.stringify(barberos));
  }, [barberos]);

  // Lista multi-perfil de barberos independientes (Solistas)
  const [perfilesIndependientes, setPerfilesIndependientes] = useState(() => {
    const guardado = localStorage.getItem('gol_cut_perfiles_independientes');
    if (guardado) return JSON.parse(guardado);
    return [
      {
        id: 'indep_1',
        nombreBarberia: 'Barbería Independiente Solista',
        username: 'independiente',
        clave: 'solo2026',
        propietario: 'Juan Solista',
        estadoLicencia: 'Activa',
        diasRestantes: 30,
        whatsappContacto: '573001234567',
        agendaPausada: false,
        mensajePausa: 'Hoy no tendré servicio independiente.',
        ingresosMesAnterior: 1450000,
        serviciosPropios: [
          { id: 'si1', nombre: 'Corte Ejecutivo Solo', precio: 30000, duracion: '30 min' },
          { id: 'si2', nombre: 'Arreglo de Barba Pro', precio: 20000, duracion: '20 min' }
        ]
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('gol_cut_perfiles_independientes', JSON.stringify(perfilesIndependientes));
  }, [perfilesIndependientes]);

  const [perfilIndependienteActivoId, setPerfilIndependienteActivoId] = useState(perfilesIndependientes[0]?.id || 'indep_1');
  const perfilIndependiente = perfilesIndependientes.find(p => p.id === perfilIndependienteActivoId) || perfilesIndependientes[0];

  const [productos, setProductos] = useState([
    { id: 'p1', nombre: 'Cera Moldear Mate Gold', precio: 30000, stock: 3 },
    { id: 'p2', nombre: 'Champú Anticaída Barba & Cabello', precio: 45000, stock: 10 }
  ]);

  const [servicios, setServicios] = useState([
    { id: 's1', nombre: 'Corte de Cabello Clásico', precio: 25000, duracion: '30 min' },
    { id: 's2', nombre: 'Barba Tradicional con Toalla Caliente', precio: 15000, duracion: '20 min' },
    { id: 's3', nombre: 'Combo Corte + Barba', precio: 35000, duracion: '45 min' }
  ]);

  const [citas, setCitas] = useState(() => {
    const saved = localStorage.getItem('gol_cut_citas_mes');
    const lastReset = localStorage.getItem('gol_cut_last_reset');
    const now = Date.now();
    const unMesMs = 30 * 24 * 60 * 60 * 1000;

    if (!lastReset || now - Number(lastReset) > unMesMs) {
      localStorage.setItem('gol_cut_last_reset', String(now));
      return [
        { id: 'c1', cliente: 'Juan Pérez', barbero: 'Elkin Ramírez', servicio: 'Corte de Cabello Clásico', fecha: '2026-11-08', hora: '10:00 AM', precio: 22500, estado: 'completada', metodoPago: 'efectivo', registradoEnApp: true, motivoCancelacion: null }
      ];
    }
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('gol_cut_citas_mes', JSON.stringify(citas));
  }, [citas]);

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

    // Validar en la lista de independientes activos
    const indepEncontrado = perfilesIndependientes.find(ind => ind.username.toLowerCase() === u && ind.clave === p);
    if (indepEncontrado) {
      if (indepEncontrado.estadoLicencia === 'Pausada (Vencida)' || indepEncontrado.diasRestantes <= 0) {
        setLoginError('Su membresía independiente ha vencido.');
        return;
      }
      setPerfilIndependienteActivoId(indepEncontrado.id);
      exitoLogin({ username: indepEncontrado.username, nombre: indepEncontrado.propietario, role: 'barbero_independiente' });
      return;
    }

    if (rolPendientePassword === 'evaluacion_evaluador' && u === 'evaluador' && p === 'evalua2026') {
      exitoLogin({ username: 'evaluador', nombre: 'Perfil Evaluador Técnico', role: 'admin' });
      setRolPendientePassword(null);
      return;
    }

    if (rolPendientePassword === 'sucursal_demo' && u === 'sucursal' && p === 'sucursal2026') {
      exitoLogin({ username: 'sucursal', nombre: 'Demostración Sucursal', role: 'admin' });
      setRolPendientePassword(null);
      return;
    }

    const barberoEncontrado = barberos.find(b => b.username.toLowerCase() === u && b.claveAcceso === p);

    if (barberoEncontrado) {
      if (barberoEncontrado.estado === 'Inactivo') {
        setLoginError('Su usuario se encuentra inactivo.');
        return;
      }
      if (barberoEncontrado.isLocked || (barberoEncontrado.diasRestantesBarber !== undefined && barberoEncontrado.diasRestantesBarber <= 0)) {
        setLoginError('Su cuenta se encuentra bloqueada por ciclo de pago. Acérquese al administrador.');
        return;
      }
      setTenantActivoId(barberoEncontrado.tenantId || tenantPrincipal.id);
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
    setRolPendientePassword(null);
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

    if (targetRole === 'evaluacion_evaluador') {
      setRolPendientePassword('evaluacion_evaluador');
      setUsernameInput('evaluador');
      setPasswordInput('');
      setIsLoginOpen(true);
      return;
    }

    if (targetRole === 'sucursal_demo') {
      setRolPendientePassword('sucursal_demo');
      setUsernameInput('sucursal');
      setPasswordInput('');
      setIsLoginOpen(true);
      return;
    }

    if (targetRole === 'barbero_independiente_general') {
      setActiveRole('barbero_independiente');
      return;
    }

    setRolPendientePassword(null);
    setIsLoginOpen(true);
    setUsernameInput(targetRole === 'admin' ? credencialesAdmin.username : targetRole === 'barbero' ? 'elkin' : '');
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
              <p style={{ margin: 0, fontSize: '10px', color: '#94a3b8' }}>Plataforma SaaS Multi-Negocio</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            
            {/* Selector superior de Negocio / Sede SaaS */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#020617', border: '1px solid #3b82f6', borderRadius: '6px', padding: '4px 8px' }}>
              <Building style={{ width: '13px', height: '13px', color: '#60a5fa' }} />
              <select
                value={tenantActivoId}
                onChange={(e) => setTenantActivoId(e.target.value)}
                style={{ backgroundColor: 'transparent', color: '#60a5fa', fontSize: '11px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
              >
                {tenants.map(t => (
                  <option key={t.id} value={t.id} style={{ backgroundColor: '#0f172a', color: '#fff' }}>Sede: {t.nombreBarberia}</option>
                ))}
              </select>
            </div>

            <select
              value={activeRole}
              onChange={handleCambioSeleccion}
              style={{ backgroundColor: '#020617', border: '1px solid #f59e0b', color: '#f8fafc', fontSize: '11px', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
            >
              <option value="cliente">📱 Vista: Cliente (Reservas / Móvil)</option>
              <option value="barbero">✂️ Vista: Barbero (Sede)</option>
              <option value="barbero_independiente_general">⭐ Panel de Independientes y Solistas</option>
              <option value="admin">🛠️ Vista: Administrador General</option>
              <option value="evaluacion_evaluador">🎓 Perfil Demo: Evaluador</option>
              <option value="sucursal_demo">🏢 Perfil Demo: Sucursal</option>
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
            barberos={barberos.filter(b => b.tenantId === tenantPrincipal.id)} 
            perfilesIndependientes={perfilesIndependientes}
            servicios={servicios} 
            citas={citas} 
            setCitas={setCitas} 
            incentivos={incentivos}
            agendaPausadaSede={agendaPausadaSede}
            mensajePausaGeneral={mensajePausaGeneral}
            slotDuration={slotDuration}
            globalTimer={globalTimer}
            tenantPrincipal={tenantPrincipal}
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
            activeRole={activeRole}
            tenantPrincipal={tenantPrincipal}
          />
        )}

        {activeRole === 'barbero_independiente' && (
          <VistaSeleccionIndependiente 
            perfilesIndependientes={perfilesIndependientes}
            setPerfilIndependienteActivoId={setPerfilIndependienteActivoId}
            setIsLoginOpen={setIsLoginOpen}
            setUsernameInput={setUsernameInput}
          />
        )}

        {activeRole === 'barbero_independiente_activo' && perfilIndependiente && (
          <VistaBarberoIndependiente 
            perfilIndependiente={perfilIndependiente}
            setPerfilIndependiente={(nuevo) => {
              setPerfilesIndependientes(perfilesIndependientes.map(p => p.id === nuevo.id ? nuevo : p));
            }}
            citas={citas}
            setCitas={setCitas}
            onCerrarSesion={handleCerrarSesion}
            devConfig={devConfig}
            activeRole={activeRole}
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
            licenciaVencida={licenciaVencida}
            incentivos={incentivos}
            setIncentivos={setIncentivos}
            credencialesAdmin={credencialesAdmin}
            setCredencialesAdmin={setCredencialesAdmin}
            tenantPrincipal={tenantPrincipal}
            setTenants={setTenants}
            tenants={tenants}
            agendaPausadaSede={agendaPausadaSede}
            setAgendaPausadaSede={setAgendaPausadaSede}
            mensajePausaGeneral={mensajePausaGeneral}
            setMensajePausaGeneral={setMensajePausaGeneral}
            globalTimer={globalTimer}
            setGlobalTimer={setGlobalTimer}
            chairFeeConfig={chairFeeConfig}
            setChairFeeConfig={setChairFeeConfig}
          />
        )}

        {activeRole === 'superadmin' && (
          <VistaSuperAdmin 
            devConfig={devConfig} 
            setDevConfig={setDevConfig} 
            barberos={barberos}
            setBarberos={setBarberos}
            tenants={tenants}
            setTenants={setTenants}
            perfilesIndependientes={perfilesIndependientes}
            setPerfilesIndependientes={setPerfilesIndependientes}
            setActiveRole={setActiveRole}
            incentivos={incentivos}
            setIncentivos={setIncentivos}
            credencialesAdmin={credencialesAdmin}
            setCredencialesAdmin={setCredencialesAdmin}
          />
        )}
      </main>

      {isLoginOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #f59e0b', borderRadius: '16px', maxWidth: '380px', width: '100%', padding: '20px', position: 'relative', boxSizing: 'border-box' }}>
            <button 
              onClick={() => { setIsLoginOpen(false); setRolPendientePassword(null); }} 
              style={{ position: 'absolute', top: '12px', right: '12px', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
            >
              ✕
            </button>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid #f59e0b', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px auto' }}>
                <Lock style={{ width: '20px', height: '20px', color: '#fbbf24' }} />
              </div>
              <h3 style={{ margin: 0, color: '#fbbf24', fontSize: '18px', fontWeight: 'bold' }}>Ingreso Seguro</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#94a3b8' }}>
                {rolPendientePassword ? 'Ingrese contraseña demo' : 'Ingrese sus credenciales de acceso'}
              </p>
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
                  placeholder="Ej: admin, elkin, usuario_independiente"
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

function VistaCliente({ barberos, perfilesIndependientes, servicios, citas, setCitas, incentivos, agendaPausadaSede, mensajePausaGeneral, slotDuration, globalTimer, tenantPrincipal }) {
  const [tipoReserva, setTipoReserva] = useState('sede'); // 'sede' o 'independiente'
  const [nombre, setNombre] = useState('');
  const [fechaNac, setFechaNac] = useState('');
   
  const barberosSedeActivos = barberos.filter(b => !b.pausado && !b.isLocked && (b.diasRestantesBarber === undefined || b.diasRestantesBarber > 0));
  const independientesActivos = perfilesIndependientes.filter(ind => !ind.agendaPausada && ind.estadoLicencia === 'Activa' && ind.diasRestantes > 0);

  const [barberoSedeElegido, setBarberoSedeElegido] = useState(barberosSedeActivos[0]?.nombre || '');
  const [indepElegidoId, setIndepElegidoId] = useState(independientesActivos[0]?.id || '');

  const indepActualObj = perfilesIndependientes.find(i => i.id === indepElegidoId);
  const serviciosDisponibles = tipoReserva === 'sede' ? servicios : (indepActualObj?.serviciosPropios || servicesFallback);

  const [servicio, setServicio] = useState(serviciosDisponibles[0]?.nombre || 'Corte Clásico');
   
  const hoyStr = new Date().toISOString().split('T')[0];
  const [fecha, setFecha] = useState(hoyStr);
  const [hora, setHora] = useState('08:00 AM');
  const [citaCreada, setCitaCreada] = useState(null);

  const incCumple = incentivos.find(i => i.tipo === 'cumpleanos' && i.activo);
  const horasDisponibles = ['08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM'];

  const esCumpleanos = () => {
    if (!fechaNac) return false;
    const hoy = new Date();
    const nac = new Date(fechaNac);
    return hoy.getDate() === nac.getDate() && hoy.getMonth() === nac.getMonth();
  };

  const handleReserva = (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    const servObj = serviciosDisponibles.find(s => s.nombre === servicio);
    const cumple = esCumpleanos();
    let precioFinal = servObj ? servObj.precio : 25000;

    if (cumple && incCumple) {
      const desc = (precioFinal * (incCumple.porcentaje || 10)) / 100;
      precioFinal = precioFinal - desc;
    }

    const barberoAsignado = tipoReserva === 'sede' 
      ? (barberoSedeElegido || 'Barbero Sede') 
      : `${indepActualObj?.propietario} (${indepActualObj?.nombreBarberia})`;

    const nueva = {
      id: 'c' + Date.now(),
      cliente: nombre.trim(),
      barbero: barberoAsignado,
      servicio,
      fecha,
      hora,
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

  if (agendaPausadaSede || (globalTimer.Mañana && globalTimer.Tarde)) {
    return (
      <div style={{ backgroundColor: '#0f172a', border: '1px solid #f43f5e', borderRadius: '16px', padding: '24px', textAlign: 'center', maxWidth: '500px', margin: '40px auto' }}>
        <AlertTriangle style={{ width: '48px', height: '48px', color: '#f43f5e', margin: '0 auto 12px auto' }} />
        <h3 style={{ color: '#f43f5e', margin: '0 0 8px 0', fontSize: '18px' }}>Agenda Suspendida</h3>
        <p style={{ color: '#cbd5e1', fontSize: '13px', margin: '0 0 16px 0' }}>{mensajePausaGeneral}</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ borderBottom: '1px solid rgba(245, 158, 11, 0.2)', paddingBottom: '12px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#fbbf24', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Smartphone style={{ width: '22px', height: '22px' }} />
          Reservas en {tenantPrincipal.nombreBarberia}
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '12px', margin: '4px 0 0 0' }}>Selecciona si deseas reservar con los barberos de esta sede o con un barbero independiente</p>
      </div>

      <div style={{ display: 'flex', gap: '8px', backgroundColor: '#0f172a', padding: '6px', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
        <button
          onClick={() => { setTipoReserva('sede'); setCitaCreada(null); }}
          style={{ flex: 1, padding: '10px', backgroundColor: tipoReserva === 'sede' ? '#f59e0b' : 'transparent', color: tipoReserva === 'sede' ? '#020617' : '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}
        >
          🏢 Barberos de Sede ({tenantPrincipal.nombreBarberia})
        </button>
        <button
          onClick={() => { setTipoReserva('independiente'); setCitaCreada(null); }}
          style={{ flex: 1, padding: '10px', backgroundColor: tipoReserva === 'independiente' ? '#3b82f6' : 'transparent', color: tipoReserva === 'independiente' ? '#fff' : '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}
        >
          ⭐ Barberos Independientes / Solistas
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
                <span><strong>¡Felicidades!</strong> Recibes un {incCumple.porcentaje || 10}% de descuento.</span>
              </div>
            )}

            {tipoReserva === 'sede' ? (
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>Seleccionar Barbero de Sede</label>
                <select
                  value={barberoSedeElegido}
                  onChange={(e) => setBarberoSedeElegido(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #f59e0b', borderRadius: '6px', padding: '10px', color: '#f8fafc', fontSize: '13px', boxSizing: 'border-box', fontWeight: 'bold' }}
                >
                  {barberosSedeActivos.map(b => (
                    <option key={b.id} value={b.nombre}>{b.nombre} ({b.especialidad})</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>Seleccionar Barbería / Barbero Independiente</label>
                <select
                  value={indepElegidoId}
                  onChange={(e) => setIndepElegidoId(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #3b82f6', borderRadius: '6px', padding: '10px', color: '#f8fafc', fontSize: '13px', boxSizing: 'border-box', fontWeight: 'bold' }}
                >
                  {independientesActivos.map(ind => (
                    <option key={ind.id} value={ind.id}>{ind.propietario} - {ind.nombreBarberia}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>Servicio</label>
              <select
                value={servicio}
                onChange={(e) => setServicio(e.target.value)}
                style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '6px', padding: '10px', color: '#f8fafc', fontSize: '13px', boxSizing: 'border-box' }}
              >
                {serviciosDisponibles.map(s => (
                  <option key={s.id || s.nombre} value={s.nombre}>{s.nombre} (${s.precio.toLocaleString()})</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>Fecha de Cita</label>
                <input
                  type="date"
                  value={fecha}
                  min={hoyStr}
                  onChange={(e) => setFecha(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '6px', padding: '10px', color: '#f8fafc', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '6px' }}>Seleccione Horario</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
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

            <button
              type="submit"
              style={{ backgroundColor: tipoReserva === 'sede' ? '#f59e0b' : '#3b82f6', color: '#020617', fontWeight: 'bold', padding: '12px', borderRadius: '8px', fontSize: '13px', border: 'none', cursor: 'pointer', marginTop: '6px' }}
            >
              Confirmar Cita con {tipoReserva === 'sede' ? 'Sede' : 'Independiente'}
            </button>
          </form>
        </div>

        <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', boxSizing: 'border-box' }}>
          {citaCreada ? (
            <div style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #059669', borderRadius: '10px', padding: '12px', boxSizing: 'border-box' }}>
              <CheckCircle style={{ width: '28px', height: '28px', color: '#34d399', margin: '0 auto 6px auto' }} />
              <h4 style={{ color: '#34d399', margin: '0 0 6px 0', fontSize: '14px' }}>¡Cita Reservada con Éxito!</h4>
              <div style={{ fontSize: '11px', color: '#cbd5e1', textAlign: 'left', backgroundColor: '#0f172a', padding: '8px', borderRadius: '6px' }}>
                <p style={{ margin: '2px 0' }}><span style={{ color: '#94a3b8' }}>Cliente:</span> {citaCreada.cliente}</p>
                <p style={{ margin: '2px 0' }}><span style={{ color: '#94a3b8' }}>Atiende:</span> {citaCreada.barbero}</p>
                <p style={{ margin: '2px 0' }}><span style={{ color: '#94a3b8' }}>Fecha/Hora:</span> {citaCreada.fecha} - {citaCreada.hora}</p>
                <p style={{ margin: '2px 0' }}><span style={{ color: '#94a3b8' }}>Valor:</span> ${citaCreada.precio.toLocaleString()}</p>
              </div>
            </div>
          ) : (
            <div style={{ color: '#64748b' }}>
              <span style={{ fontSize: '12px' }}>Complete el formulario para programar su espacio en {tenantPrincipal.nombreBarberia}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function VistaSeleccionIndependiente({ perfilesIndependientes, setPerfilIndependienteActivoId, setIsLoginOpen, setUsernameInput }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px', margin: '20px auto', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ borderBottom: '1px solid rgba(59, 130, 246, 0.3)', paddingBottom: '12px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#60a5fa', margin: 0 }}>⭐ Panel de Barberos Independientes y Solistas</h2>
        <p style={{ color: '#94a3b8', fontSize: '12px', margin: '4px 0 0 0' }}>Seleccione su perfil independiente registrado para ingresar a gestionar su agenda y caja</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
        {perfilesIndependientes.map(ind => (
          <div key={ind.id} style={{ backgroundColor: '#0f172a', border: '1px solid #3b82f6', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ margin: 0, color: '#fff', fontSize: '15px' }}>{ind.nombreBarberia}</h4>
              <p style={{ margin: '4px 0 0 0', color: '#60a5fa', fontSize: '12px' }}>Propietario: <strong>{ind.propietario}</strong> | Usuario: <code>{ind.username}</code></p>
            </div>
            <button
              onClick={() => {
                setPerfilIndependienteActivoId(ind.id);
                setUsernameInput(ind.username);
                setIsLoginOpen(true);
              }}
              style={{ backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
            >
              Ingresar como {ind.propietario}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function VistaBarbero({ barberoActual, citas, setCitas, servicios, onCerrarSesion, devConfig, licenciaVencida, incentivos, activeRole, tenantPrincipal }) {
  const [servicioRapido, setServicioRapido] = useState(servicios[0]?.nombre || '');
  const [precioRapido, setPrecioRapido] = useState(servicios[0]?.precio || 25000);
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState('efectivo');

  const [citaACancelar, setCitaACancelar] = useState(null);
  const [motivoPreset, setMotivoPreset] = useState('Cliente no asistió a la cita');
  const [motivoLibre, setMotivoLibre] = useState('');

  const nombreBarberoActualLimpio = (barberoActual?.nombre || '').trim().toLowerCase();
  const citasBarbero = citas.filter(c => {
    const barberoCitaLimpio = (c.barbero || '').trim().toLowerCase();
    return barberoCitaLimpio.includes(nombreBarberoActualLimpio);
  });

  const atencionesBarbero = citasBarbero.filter(c => c.estado === 'completada').length;
  const ingresosHoy = citasBarbero.filter(c => c.estado === 'completada').reduce((sum, c) => sum + (c.precio || 0), 0);

  const handleEstadoCita = (id, nuevoEstado) => {
    setCitas(citas.map(c => c.id === id ? { ...c, estado: nuevoEstado, registradoEnApp: true } : c));
  };

  const handleCorteDirecto = (e) => {
    e.preventDefault();
    const nueva = {
      id: 'c' + Date.now(),
      cliente: metodoPagoSeleccionado === 'transferencia' ? 'Cliente (Transferencia)' : 'Cliente Presencial (Efectivo)',
      barbero: barberoActual?.nombre || 'Barbero',
      servicio: servicioRapido,
      fecha: new Date().toISOString().split('T')[0],
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      precio: Number(precioRapido),
      estado: 'completada',
      metodoPago: metodoPagoSeleccionado,
      registradoEnApp: true
    };
    setCitas([nueva, ...citas]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(245, 158, 11, 0.2)', paddingBottom: '12px', gap: '8px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#fbbf24', margin: 0 }}>Panel Barbero - {barberoActual?.nombre}</h2>
          <p style={{ color: '#94a3b8', fontSize: '11px', margin: '2px 0 0 0' }}>Sede: {tenantPrincipal?.nombreBarberia}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '6px 10px', borderRadius: '6px', fontSize: '12px' }}>
            Ganancias: <span style={{ color: '#34d399', fontWeight: 'bold' }}>${ingresosHoy.toLocaleString()}</span>
          </div>
          <button onClick={onCerrarSesion} style={{ padding: '6px 10px', backgroundColor: '#334155', color: '#f8fafc', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>Salir</button>
        </div>
      </div>

      <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', padding: '12px', boxSizing: 'border-box' }}>
        <h3 style={{ fontSize: '12px', color: '#fbbf24', fontWeight: 'bold', margin: '0 0 8px 0' }}>Botonera Rápida</h3>
        <form onSubmit={handleCorteDirecto} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
            <select value={servicioRapido} onChange={(e) => setServicioRapido(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }}>
              {servicios.map(s => <option key={s.id} value={s.nombre}>{s.nombre}</option>)}
            </select>
            <input type="number" value={precioRapido} onChange={(e) => setPrecioRapido(e.target.value)} placeholder="Valor ($)" style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} required />
            <select value={metodoPagoSeleccionado} onChange={(e) => setMetodoPagoSeleccionado(e.target.value)} style={{ backgroundColor: '#020617', color: '#34d399', border: '1px solid #34d399', padding: '8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
              <option value="efectivo">💵 Efectivo</option>
              <option value="transferencia">📱 Transferencia</option>
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
                  {c.estado}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', borderTop: '1px solid #1e293b', paddingTop: '6px', marginTop: '6px' }}>
                <span>{c.fecha} - {c.hora}</span>
                <span style={{ color: '#34d399', fontWeight: 'bold' }}>${(c.precio || 0).toLocaleString()}</span>
              </div>
              {c.estado !== 'completada' && (
                <button onClick={() => handleEstadoCita(c.id, 'completada')} style={{ width: '100%', marginTop: '8px', padding: '6px', backgroundColor: '#064e3b', color: '#34d399', border: '1px solid #059669', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '10px' }}>
                  Marcar como Atendido
                </button>
              )}
            </div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', padding: '24px', backgroundColor: '#0f172a', borderRadius: '10px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
            No hay citas asignadas.
          </div>
        )}
      </div>
    </div>
  );
}

function VistaBarberoIndependiente({ perfilIndependiente, setPerfilIndependiente, citas, setCitas, onCerrarSesion, devConfig, activeRole }) {
  const [servicioNombre, setServicioNombre] = useState('');
  const [servicioPrecio, setServicioPrecio] = useState('');
  const [servicioDuracion, setServicioDuracion] = useState('30 min');

  const [servicioSeleccionado, setServicioSeleccionado] = useState(perfilIndependiente.serviciosPropios[0]?.nombre || '');
  const [precioCobro, setPrecioCobro] = useState(perfilIndependiente.serviciosPropios[0]?.precio || 30000);
  const [metodoPago, setMetodoPago] = useState('efectivo');

  const nombrePropLimpio = (perfilIndependiente.propietario || '').trim().toLowerCase();
  const misCitasIndependiente = citas.filter(c => (c.barbero || '').toLowerCase().includes(nombrePropLimpio));
  const ingresosTotales = misCitasIndependiente.filter(c => c.estado === 'completada').reduce((sum, c) => sum + (c.precio || 0), 0);

  const handleCrearServicioPropio = (e) => {
    e.preventDefault();
    if (!servicioNombre.trim()) return;
    const nuevoServ = { id: 'si' + Date.now(), nombre: servicioNombre.trim(), precio: Number(servicioPrecio), duracion: servicioDuracion };
    setPerfilIndependiente({ ...perfilIndependiente, serviciosPropios: [...perfilIndependiente.serviciosPropios, nuevoServ] });
    setServicioNombre('');
    setServicioPrecio('');
    alert('Corte creado.');
  };

  const handleCobroIndependiente = (e) => {
    e.preventDefault();
    const nueva = {
      id: 'c' + Date.now(),
      cliente: metodoPago === 'transferencia' ? 'Cliente (Transferencia)' : 'Cliente Presencial (Efectivo)',
      barbero: `${perfilIndependiente.propietario} (${perfilIndependiente.nombreBarberia})`,
      servicio: servicioSeleccionado,
      fecha: new Date().toISOString().split('T')[0],
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      precio: Number(precioCobro),
      estado: 'completada',
      metodoPago,
      registradoEnApp: true
    };
    setCitas([nueva, ...citas]);
    alert('Cobro registrado.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(59, 130, 246, 0.2)', paddingBottom: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#60a5fa', margin: 0 }}>⭐ {perfilIndependiente.nombreBarberia} ({perfilIndependiente.propietario})</h2>
          <p style={{ color: '#94a3b8', fontSize: '11px', margin: '2px 0 0 0' }}>Licencia activa: <strong style={{ color: '#38bdf8' }}>{perfilIndependiente.diasRestantes} días</strong></p>
        </div>
        <button onClick={onCerrarSesion} style={{ padding: '8px 12px', backgroundColor: '#334155', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>Salir</button>
      </div>

      <div style={{ backgroundColor: '#0f172a', border: '1px solid #3b82f6', padding: '14px', borderRadius: '10px' }}>
        <span style={{ fontSize: '11px', color: '#60a5fa', fontWeight: 'bold' }}>💰 Mis Ingresos Totales</span>
        <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '4px 0 0 0', color: '#34d399' }}>${ingresosTotales.toLocaleString()}</p>
      </div>

      <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '16px', borderRadius: '12px' }}>
        <h3 style={{ fontSize: '14px', color: '#60a5fa', margin: '0 0 10px 0' }}>Crear Mis Propios Cortes</h3>
        <form onSubmit={handleCrearServicioPropio} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px' }}>
          <input type="text" placeholder="Nombre corte..." value={servicioNombre} onChange={(e) => setServicioNombre(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} required />
          <input type="number" placeholder="Precio ($)" value={servicioPrecio} onChange={(e) => setServicioPrecio(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} required />
          <button type="submit" style={{ backgroundColor: '#3b82f6', color: '#fff', fontWeight: 'bold', padding: '8px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '11px' }}>Guardar Corte</button>
        </form>
      </div>
    </div>
  );
}

function VistaAdmin({ usuario, citas, setCitas, barberos, setBarberos, productos, setProductos, servicios, setServicios, devConfig, licenciaVencida, incentivos, setIncentivos, credencialesAdmin, setCredencialesAdmin, tenantPrincipal, setTenants, tenants, agendaPausadaSede, setAgendaPausadaSede, mensajePausaGeneral, setMensajePausaGeneral, globalTimer, setGlobalTimer, chairFeeConfig, setChairFeeConfig }) {
  const [tab, setTab] = useState('resumen');
  const [nuevoNombreBarberia, setNuevoNombreBarberia] = useState(tenantPrincipal.nombreBarberia);
  const [nuevoNombreBarbero, setNuevoNombreBarbero] = useState('');
  const [nuevoUsernameBarbero, setNuevoUsernameBarbero] = useState('');
  const [nuevaClaveBarbero, setNuevaClaveBarbero] = useState('');

  const handleGuardarNombre = (e) => {
    e.preventDefault();
    setTenants(tenants.map(t => t.id === tenantPrincipal.id ? { ...t, nombreBarberia: nuevoNombreBarberia } : t));
    alert('Nombre de barbería actualizado.');
  };

  const handleAgregarBarberoSede = (e) => {
    e.preventDefault();
    if (!nuevoNombreBarbero.trim()) return;
    const nuevo = {
      id: 'b' + Date.now(),
      tenantId: tenantPrincipal.id,
      username: nuevoUsernameBarbero.toLowerCase() || 'barbero',
      nombre: nuevoNombreBarbero,
      especialidad: 'Barbero Profesional',
      estado: 'Activo',
      claveAcceso: nuevaClaveBarbero || 'barbero123',
      diasRestantesBarber: 30,
      isLocked: false
    };
    setBarberos([...barberos, nuevo]);
    setNuevoNombreBarbero('');
    setNuevoUsernameBarbero('');
    setNuevaClaveBarbero('');
    alert('Barbero agregado a esta sede.');
  };

  const barberosEstaSede = barberos.filter(b => b.tenantId === tenantPrincipal.id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(245, 158, 11, 0.2)', paddingBottom: '12px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#fbbf24', margin: 0 }}>Administración: {tenantPrincipal.nombreBarberia}</h2>
      </div>

      <div style={{ backgroundColor: '#0f172a', padding: '6px', borderRadius: '8px', display: 'flex', gap: '6px', overflowX: 'auto' }}>
        <button onClick={() => setTab('resumen')} style={{ padding: '8px 12px', background: tab === 'resumen' ? '#f59e0b' : 'transparent', color: tab === 'resumen' ? '#020617' : '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Resumen</button>
        <button onClick={() => setTab('barberos')} style={{ padding: '8px 12px', background: tab === 'barberos' ? '#f59e0b' : 'transparent', color: tab === 'barberos' ? '#020617' : '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Barberos de Sede</button>
        <button onClick={() => setTab('config')} style={{ padding: '8px 12px', background: tab === 'config' ? '#f59e0b' : 'transparent', color: tab === 'config' ? '#020617' : '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Ajustes Sede</button>
      </div>

      {tab === 'resumen' && (
        <div style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '12px', border: '1px solid rgba(245,158,11,0.3)' }}>
          <h3 style={{ color: '#fbbf24', fontSize: '14px', margin: '0 0 10px 0' }}>Citas y Ganancias de {tenantPrincipal.nombreBarberia}</h3>
          <p style={{ color: '#cbd5e1', fontSize: '12px' }}>Total de citas registradas en esta sede: {citas.length}</p>
        </div>
      )}

      {tab === 'barberos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <form onSubmit={handleAgregarBarberoSede} style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: '10px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
            <input type="text" placeholder="Nombre barbero" value={nuevoNombreBarbero} onChange={(e) => setNuevoNombreBarbero(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '6px', borderRadius: '4px', fontSize: '11px' }} required />
            <input type="text" placeholder="Usuario login" value={nuevoUsernameBarbero} onChange={(e) => setNuevoUsernameBarbero(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '6px', borderRadius: '4px', fontSize: '11px' }} required />
            <input type="password" placeholder="Contraseña" value={nuevaClaveBarbero} onChange={(e) => setNuevaClaveBarbero(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '6px', borderRadius: '4px', fontSize: '11px' }} required />
            <button type="submit" style={{ backgroundColor: '#f59e0b', color: '#020617', border: 'none', padding: '6px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px', gridColumn: '1 / -1' }}>Añadir Barbero a esta Sede</button>
          </form>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
            {barberosEstaSede.map(b => (
              <div key={b.id} style={{ backgroundColor: '#0f172a', border: '1px solid #334155', padding: '12px', borderRadius: '8px' }}>
                <h4 style={{ margin: 0, color: '#fff', fontSize: '13px' }}>{b.nombre}</h4>
                <p style={{ margin: '2px 0', fontSize: '11px', color: '#fbbf24' }}>User: {b.username} | Clave: {b.claveAcceso}</p>
                <p style={{ margin: '2px 0', fontSize: '11px', color: '#38bdf8' }}>Ciclo restante: {b.diasRestantesBarber || 30} días</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'config' && (
        <div style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '12px', maxWidth: '400px' }}>
          <h3 style={{ color: '#fbbf24', fontSize: '14px', margin: '0 0 10px 0' }}>Cambiar Nombre de Sede</h3>
          <form onSubmit={handleGuardarNombre} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input type="text" value={nuevoNombreBarberia} onChange={(e) => setNuevoNombreBarberia(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '12px' }} required />
            <button type="submit" style={{ backgroundColor: '#f59e0b', color: '#020617', fontWeight: 'bold', padding: '8px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>Guardar Nombre</button>
          </form>
        </div>
      )}
    </div>
  );
}

function VistaSuperAdmin({ devConfig, setDevConfig, barberos, setBarberos, tenants, setTenants, perfilesIndependientes, setPerfilesIndependientes, setActiveRole }) {
  const [nuevoNombreSede, setNuevoNombreSede] = useState('');
  const [nuevoDuenoSede, setNuevoDuenoSede] = useState('');

  const [nuevoIndepNombre, setNuevoIndepNombre] = useState('');
  const [nuevoIndepProp, setNuevoIndepProp] = useState('');
  const [nuevoIndepUser, setNuevoIndepUser] = useState('');
  const [nuevoIndepPass, setNuevoIndepPass] = useState('');

  const handleCrearSedeSaaS = (e) => {
    e.preventDefault();
    if (!nuevoNombreSede.trim()) return;
    const nueva = {
      id: 't' + Date.now(),
      nombreBarberia: nuevoNombreSede.trim(),
      dueno: nuevoDuenoSede.trim() || 'Propietario',
      estadoLicencia: 'Activa',
      diasRestantes: 30,
      whatsappContacto: '573001234567'
    };
    setTenants([...tenants, nueva]);
    setNuevoNombreSede('');
    setNuevoDuenoSede('');
    alert('Nueva barbería SaaS creada con éxito.');
  };

  const handleCrearIndependienteDev = (e) => {
    e.preventDefault();
    if (!nuevoIndepNombre.trim() || !nuevoIndepProp.trim()) return;
    const nuevoIndep = {
      id: 'indep_' + Date.now(),
      nombreBarberia: nuevoIndepNombre.trim(),
      username: nuevoIndepUser.toLowerCase().trim() || 'solista',
      clave: nuevoIndepPass.trim() || '123456',
      propietario: nuevoIndepProp.trim(),
      estadoLicencia: 'Activa',
      diasRestantes: 30,
      whatsappContacto: '573001234567',
      agendaPausada: false,
      mensajePausa: 'Hoy no tendré servicio.',
      ingresosMesAnterior: 500000,
      serviciosPropios: [{ id: 'si1', nombre: 'Corte Independiente', precio: 30000, duracion: '30 min' }]
    };
    setPerfilesIndependientes([...perfilesIndependientes, nuevoIndep]);
    setNuevoIndepNombre('');
    setNuevoIndepProp('');
    setNuevoIndepUser('');
    setNuevoIndepPass('');
    alert('¡Perfil independiente creado correctamente y ya aparece en el panel de clientes e independientes!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ borderBottom: '1px solid rgba(245, 158, 11, 0.2)', paddingBottom: '12px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fbbf24', margin: 0 }}>Consola Desarrollador Root (Multi-Negocio SaaS)</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #f59e0b', padding: '16px', borderRadius: '12px' }}>
          <h3 style={{ color: '#fbbf24', fontSize: '14px', margin: '0 0 10px 0' }}>Crear Nueva Barbería SaaS (Sede)</h3>
          <form onSubmit={handleCrearSedeSaaS} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input type="text" placeholder="Nombre Barbería SaaS..." value={nuevoNombreSede} onChange={(e) => setNuevoNombreSede(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} required />
            <input type="text" placeholder="Propietario..." value={nuevoDuenoSede} onChange={(e) => setNuevoDuenoSede(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} required />
            <button type="submit" style={{ backgroundColor: '#f59e0b', color: '#020617', fontWeight: 'bold', padding: '8px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>Crear Barbería SaaS</button>
          </form>
        </div>

        <div style={{ backgroundColor: '#0f172a', border: '1px solid #3b82f6', padding: '16px', borderRadius: '12px' }}>
          <h3 style={{ color: '#60a5fa', fontSize: '14px', margin: '0 0 10px 0' }}>Crear Nuevo Barbero Independiente / Solista</h3>
          <form onSubmit={handleCrearIndependienteDev} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input type="text" placeholder="Nombre de su Barbería..." value={nuevoIndepNombre} onChange={(e) => setNuevoIndepNombre(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} required />
            <input type="text" placeholder="Nombre del Propietario..." value={nuevoIndepProp} onChange={(e) => setNuevoIndepProp(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} required />
            <input type="text" placeholder="Usuario Login..." value={nuevoIndepUser} onChange={(e) => setNuevoIndepUser(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} required />
            <input type="text" placeholder="Contraseña..." value={nuevoIndepPass} onChange={(e) => setNuevoIndepPass(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} required />
            <button type="submit" style={{ backgroundColor: '#3b82f6', color: '#fff', fontWeight: 'bold', padding: '8px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>Crear Perfil Independiente</button>
          </form>
        </div>
      </div>
    </div>
  );
}

const servicesFallback = [{ id: 's1', nombre: 'Corte Clásico', precio: 25000, duracion: '30 min' }];