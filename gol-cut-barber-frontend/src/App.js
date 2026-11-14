import React, { useState, useEffect } from 'react';
import {  
  Scissors, Lock, Smartphone, CheckCircle,  
  Gift, Award, AlertTriangle, Server, Key, PlusSquare, MessageCircle, Pause, Play, Trash2, Building, Edit3, ExternalLink, DollarSign, Clock, Percent, Users, Calendar as CalendarIcon, ToggleLeft, ToggleRight
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

  // CREDENCIALES DEL SUPERADMIN / DESARROLLADOR EDITABLES
  const [superAdminCreds, setSuperAdminCreds] = useState(() => {
    const guardado = localStorage.getItem('gol_cut_superadmin_creds');
    return guardado ? JSON.parse(guardado) : { username: 'elkin-dev26', password: 'elkin2026', nombre: 'SuperAdmin / Desarrollador' };
  });

  useEffect(() => {
    localStorage.setItem('gol_cut_superadmin_creds', JSON.stringify(superAdminCreds));
  }, [superAdminCreds]);

  const [agendaPausadaSede, setAgendaPausadaSede] = useState(false);
  const [mensajePausaGeneral, setMensajePausaGeneral] = useState('Lo sentimos mucho, la sede se encuentra cerrada por día libre o evento especial el día de hoy.');

  const [devConfig, setDevConfig] = useState(() => {
    const guardado = localStorage.getItem('gol_cut_dev_config');
    return guardado ? JSON.parse(guardado) : {
      whatsappSoporte: '573001234567',
      mensajeRenovacion: 'Hola Elkin, deseo renovar mi membresía mensual de Gol Cut Barber.',
    };
  });

  useEffect(() => {
    localStorage.setItem('gol_cut_dev_config', JSON.stringify(devConfig));
  }, [devConfig]);

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

  // TENANTS / BARBERÍAS MÚLTIPLES CON SUS PROPIAS CREDENCIALES DE ADMIN
  const [tenants, setTenants] = useState(() => {
    const guardado = localStorage.getItem('gol_cut_tenants');
    if (guardado) return JSON.parse(guardado);
    return [
      { 
        id: 't1', 
        nombreBarberia: 'Gol Cut Barber - Sede Principal', 
        nombreAnterior: 'Gol Cut Barber Inicial', 
        dueno: 'Elkin Ramírez', 
        estadoLicencia: 'Activa', 
        diasRestantes: 28, 
        whatsappContacto: '573001234567',
        usernameAdmin: 'admin',
        passwordAdmin: 'admin123'
      },
      { 
        id: 't2', 
        nombreBarberia: 'Barbería Mijares', 
        nombreAnterior: 'Barbería SENA', 
        dueno: 'Mijares Admin', 
        estadoLicencia: 'Activa', 
        diasRestantes: 30, 
        whatsappContacto: '573009876543',
        usernameAdmin: 'mijares',
        passwordAdmin: 'mijares2026'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('gol_cut_tenants', JSON.stringify(tenants));
  }, [tenants]);

  // BARBEROS EMPLEADOS VINCULADOS A CADA TENANT (sedeId)
  const [barberos, setBarberos] = useState(() => {
    const guardado = localStorage.getItem('gol_cut_barberos');
    if (guardado) return JSON.parse(guardado);
    return [
      { id: 'b1', username: 'elkin', nombre: 'Elkin Ramírez', especialidad: 'Estilista Profesional', estado: 'Activo', claveAcceso: 'barbero123', pausado: false, mensajePausa: 'Elkin no laborará este día por motivos personales.', billingCycle: 'mensual', isLocked: false, sedeId: 't1' },
      { id: 'b2', username: 'mateo', nombre: 'Mateo Gómez', especialidad: 'Barbero Senior', estado: 'Activo', claveAcceso: 'mateo2026', pausado: false, mensajePausa: 'Mateo se encuentra en evento especial hoy.', billingCycle: 'mensual', isLocked: false, sedeId: 't1' },
      { id: 'b3', username: 'carlos', nombre: 'Carlos Mijares', especialidad: 'Master Barber', estado: 'Activo', claveAcceso: 'carlos2026', pausado: false, mensajePausa: 'Carlos descansa hoy.', billingCycle: 'mensual', isLocked: false, sedeId: 't2' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('gol_cut_barberos', JSON.stringify(barberos));
  }, [barberos]);

  // Perfiles independientes / solistas
  const [perfilesIndependientes, setPerfilesIndependientes] = useState(() => {
    const guardado = localStorage.getItem('gol_cut_perfiles_independientes');
    if (guardado) return JSON.parse(guardado);
    const antiguo = localStorage.getItem('perfilIndependiente');
    if (antiguo) return [JSON.parse(antiguo)];
    return [
      {
        id: 'indep_tenant',
        nombreBarberia: 'Barbería Independiente (Solista)',
        nombreAnterior: 'Barbería Solista Inicial',
        username: 'independiente',
        clave: 'solo2026',
        propietario: 'Juan Solista',
        estadoLicencia: 'Activa',
        diasRestantes: 30,
        whatsappContacto: '573001234567',
        agendaPausada: false,
        mensajePausa: 'Lo siento, hoy no tendré servicio de barbería independiente.',
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
        { id: 'c1', cliente: 'Juan Pérez', barbero: 'Elkin Ramírez', servicio: 'Corte de Cabello Clásico', fecha: '2026-11-08', hora: '10:00 AM', precio: 22500, estado: 'completada', metodoPago: 'efectivo', registradoEnApp: true, motivoCancelacion: null },
        { id: 'c2', cliente: 'Carlos Gómez', barbero: 'Elkin Ramírez', servicio: 'Combo Corte + Barba', fecha: '2026-11-08', hora: '11:30 AM', precio: 35000, estado: 'completada', metodoPago: 'transferencia', registradoEnApp: true, motivoCancelacion: null }
      ];
    }
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('gol_cut_citas_mes', JSON.stringify(citas));
  }, [citas]);

  const tenantPrincipal = tenants[0]; 
  const licenciaVencida = tenantPrincipal?.diasRestantes <= 0 || tenantPrincipal?.estadoLicencia === 'Pausada (Vencida)';

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');

    const u = usernameInput.trim().toLowerCase();
    const p = passwordInput.trim();

    // Verificación de SuperAdmin con credenciales dinámicas
    if (u === superAdminCreds.username.toLowerCase() && p === superAdminCreds.password) {
      exitoLogin({ username: superAdminCreds.username, nombre: superAdminCreds.nombre, role: 'superadmin' });
      return;
    }

    const tenantEncontrado = tenants.find(t => (t.usernameAdmin || 'admin').toLowerCase() === u && (t.passwordAdmin || 'admin123') === p);
    if (tenantEncontrado || (u === credencialesAdmin.username.toLowerCase() && p === credencialesAdmin.password)) {
      const tObj = tenantEncontrado || tenantPrincipal;
      exitoLogin({ username: tObj.usernameAdmin || credencialesAdmin.username, nombre: `Administrador (${tObj.nombreBarberia})`, role: 'admin', tenantObj: tObj });
      return;
    }

    const indepEncontrado = perfilesIndependientes.find(pi => pi.username.toLowerCase() === u && pi.clave === p);
    if (indepEncontrado) {
      exitoLogin({ username: indepEncontrado.username, nombre: indepEncontrado.propietario, role: 'barbero_independiente', perfilIndepObj: indepEncontrado });
      return;
    }

    const barberoEncontrado = barberos.find(b => b.username.toLowerCase() === u && b.claveAcceso === p);

    if (barberoEncontrado) {
      if (barberoEncontrado.estado === 'Inactivo') {
        setLoginError('Su usuario se encuentra inactivo.');
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
    setRolPendientePassword(null);
  };

  const handleCerrarSesion = () => {
    setUsuarioAutenticado(null);
    setActiveRole('cliente');
  };

  const handleCambioSeleccion = (e) => {
    const val = e.target.value;
     
    if (val === 'cliente') {
      setActiveRole('cliente');
      return;
    }

    if (val === 'login_general') {
      setUsernameInput('');
      setPasswordInput('');
      setLoginError('');
      setIsLoginOpen(true);
      return;
    }
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', width: '100%', justifyContent: 'space-between', maxWidth: '720px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#020617', border: '1px solid #f59e0b', borderRadius: '6px', padding: '4px 8px' }}>
              <Clock style={{ width: '14px', height: '14px', color: '#fbbf24' }} />
              <select 
                value={slotDuration} 
                onChange={(e) => setSlotDuration(Number(e.target.value))}
                style={{ backgroundColor: 'transparent', color: '#fbbf24', fontSize: '11px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
              >
                <option value={30} style={{ backgroundColor: '#0f172a' }}>Citas c/ 30 min</option>
                <option value={60} style={{ backgroundColor: '#0f172a' }}>Citas c/ 1 hora</option>
              </select>
            </div>

            {/* SELECTOR LIMPIO E INDEPENDIENTE SIN EXPONER OTRAS SEDES */}
            <select
              value={activeRole === 'cliente' ? 'cliente' : 'login_general'}
              onChange={handleCambioSeleccion}
              style={{ flex: 1, backgroundColor: '#020617', border: '1px solid #f59e0b', color: '#f8fafc', fontSize: '11px', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
            >
              <option value="cliente">📱 Vista: Cliente (Reservas / Móvil)</option>
              <option value="login_general">🔐 Ingreso Administrativo / Profesional (Login)</option>
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
            barberos={barberos} 
            tenants={tenants}
            perfilesIndependientes={perfilesIndependientes}
            servicios={servicios} 
            citas={citas} 
            setCitas={setCitas} 
            incentivos={incentivos}
            agendaPausadaSede={agendaPausadaSede}
            mensajePausaGeneral={mensajePausaGeneral}
            slotDuration={slotDuration}
            globalTimer={globalTimer}
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
            tenants={tenants}
          />
        )}

        {activeRole === 'barbero_independiente' && (
          <VistaBarberoIndependiente 
            perfilIndependiente={usuarioAutenticado?.perfilIndepObj || perfilesIndependientes[0]}
            setPerfilesIndependientes={setPerfilesIndependientes}
            perfilesIndependientes={perfilesIndependientes}
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
            tenantActualParaAdmin={usuarioAutenticado?.tenantObj || tenantPrincipal}
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
            superAdminCreds={superAdminCreds}
            setSuperAdminCreds={setSuperAdminCreds}
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
              <h3 style={{ margin: 0, color: '#fbbf24', fontSize: '18px', fontWeight: 'bold' }}>Ingreso Seguro Obligatorio</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#94a3b8' }}>
                Ingrese sus credenciales de acceso para continuar
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

function VistaCliente({ barberos, tenants, perfilesIndependientes, servicios, citas, setCitas, incentivos, agendaPausadaSede, mensajePausaGeneral, slotDuration, globalTimer }) {
  const [modo, setModo] = useState('programada');
  const [nombre, setNombre] = useState('');
  const [fechaNac, setFechaNac] = useState('');
   
  const opcionesEstablecimiento = [
    ...tenants.map(t => ({ id: t.id, tipo: 'sede', nombre: t.nombreBarberia, desc: `Sede / Multi-tenant (${t.dueno})` })),
    ...perfilesIndependientes
      .filter(pi => pi.estadoLicencia === 'Activa')
      .map(pi => ({ id: pi.id, tipo: 'independiente', nombre: `${pi.nombreBarberia} - ${pi.propietario}`, desc: 'Barbero Solista Independiente', perfilObj: pi }))
  ];

  const [establecimientoSeleccionado, setEstablecimientoSeleccionado] = useState(opcionesEstablecimiento[0]?.id || 't1');

  const estActual = opcionesEstablecimiento.find(e => e.id === establecimientoSeleccionado);
  const esIndependienteEst = estActual?.tipo === 'independiente';

  // FILTRAR LOS BARBEROS SEGÚN LA SEDE SELECCIONADA
  const barberosFiltrados = esIndependienteEst
    ? [{ id: estActual.perfilObj.id, nombre: `${estActual.perfilObj.propietario} (${estActual.perfilObj.nombreBarberia})`, especialidad: 'Barbero Autónomo', esIndependiente: true }]
    : barberos.filter(b => (!b.sedeId || b.sedeId === estActual?.id) && !b.pausado && !b.isLocked);

  const serviciosFiltrados = esIndependienteEst && estActual?.perfilObj?.serviciosPropios
    ? estActual.perfilObj.serviciosPropios
    : servicios;

  const [barbero, setBarbero] = useState('');
  const [servicio, setServicio] = useState('');

  // Actualizar barbero y servicio por defecto al cambiar de sede
  useEffect(() => {
    if (barberosFiltrados.length > 0) {
      setBarbero(barberosFiltrados[0].nombre);
    } else {
      setBarbero('');
    }
    if (serviciosFiltrados.length > 0) {
      setServicio(serviciosFiltrados[0].nombre);
    } else {
      setServicio('');
    }
  }, [establecimientoSeleccionado, tenants]);

  const handleCambioEstablecimiento = (e) => {
    const idEst = e.target.value;
    setEstablecimientoSeleccionado(idEst);
  };
   
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
    if (!nombre.trim() || !barbero) return;
    const servObj = serviciosFiltrados.find(s => s.nombre === servicio);
    const cumple = esCumpleanos();
    let precioFinal = servObj ? servObj.precio : 25000;

    if (cumple && incCumple) {
      const desc = (precioFinal * (incCumple.porcentaje || 10)) / 100;
      precioFinal = precioFinal - desc;
    }

    const nueva = {
      id: 'c' + Date.now(),
      cliente: nombre.trim(),
      barbero: barbero,
      servicio: servicio || 'Corte Estándar',
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

  if (agendaPausadaSede || (globalTimer.Mañana && globalTimer.Tarde)) {
    return (
      <div style={{ backgroundColor: '#0f172a', border: '1px solid #f43f5e', borderRadius: '16px', padding: '24px', textAlign: 'center', maxWidth: '500px', margin: '40px auto' }}>
        <AlertTriangle style={{ width: '48px', height: '48px', color: '#f43f5e', margin: '0 auto 12px auto' }} />
        <h3 style={{ color: '#f43f5e', margin: '0 0 8px 0', fontSize: '18px' }}>Agenda Temporalmente Suspendida</h3>
        <p style={{ color: '#cbd5e1', fontSize: '13px', margin: '0 0 16px 0', lineHeight: '1.5' }}>{mensajePausaGeneral}</p>
      </div>
    );
  }

  const barberoSeleccionadoObj = barberos.find(b => b.nombre === barbero);
  const perfilIndepSeleccionadoObj = perfilesIndependientes.find(pi => barbero.includes(pi.propietario) || barbero.includes(pi.nombreBarberia));

  if ((barberoSeleccionadoObj && (barberoSeleccionadoObj.pausado || barberoSeleccionadoObj.isLocked)) || (perfilIndepSeleccionadoObj && (perfilIndepSeleccionadoObj.agendaPausada || perfilIndepSeleccionadoObj.estadoLicencia !== 'Activa'))) {
    const mensajeBarberoPausado = barberoSeleccionadoObj?.isLocked ? 'El barbero tiene sus permisos bloqueados temporalmente por ciclo de pago.' : barberoSeleccionadoObj?.pausado ? barberoSeleccionadoObj.mensajePausa : perfilIndepSeleccionadoObj?.mensajePausa;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ borderBottom: '1px solid rgba(245, 158, 11, 0.2)', paddingBottom: '12px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#fbbf24', margin: 0 }}>Módulo de Reservas Móvil</h2>
        </div>
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #f43f5e', borderRadius: '16px', padding: '24px', textAlign: 'center', maxWidth: '500px', margin: '20px auto', width: '100%', boxSizing: 'border-box' }}>
          <AlertTriangle style={{ width: '48px', height: '48px', color: '#f43f5e', margin: '0 auto 12px auto' }} />
          <h3 style={{ color: '#f43f5e', margin: '0 0 8px 0', fontSize: '18px' }}>Barbero No disponible hoy</h3>
          <p style={{ color: '#cbd5e1', fontSize: '13px', margin: '0 0 16px 0', lineHeight: '1.5' }}>{mensajeBarberoPausado}</p>
          <button onClick={() => setBarbero(barberosFiltrados[0]?.nombre || '')} style={{ backgroundColor: '#f59e0b', color: '#020617', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Seleccionar otro barbero</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ borderBottom: '1px solid rgba(245, 158, 11, 0.2)', paddingBottom: '12px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#fbbf24', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Smartphone style={{ width: '22px', height: '22px' }} />
          Módulo de Reservas Móvil ({slotDuration === 30 ? 'Citas c/ 30 min' : 'Citas c/ 1 hora'})
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '12px', margin: '4px 0 0 0' }}>Seleccione sede o barbero independiente para ver su agenda y QR exclusivo</p>
      </div>

      <div style={{ backgroundColor: '#0f172a', border: '1px solid #f59e0b', padding: '12px', borderRadius: '10px' }}>
        <label style={{ display: 'block', fontSize: '11px', color: '#fbbf24', marginBottom: '6px', fontWeight: 'bold' }}>🏢 Seleccione Barbería o Barbero Independiente:</label>
        <select
          value={establecimientoSeleccionado}
          onChange={handleCambioEstablecimiento}
          style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #f59e0b', borderRadius: '6px', padding: '10px', color: '#f8fafc', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          {opcionesEstablecimiento.map(item => (
            <option key={item.id} value={item.id}>{item.nombre} ({item.desc})</option>
          ))}
        </select>
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
                <span><strong>¡Felicidades!</strong> Recibes un {incCumple.porcentaje || 10}% de descuento.</span>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>Barbero Afiliado ({estActual?.nombre})</label>
              <select
                value={barbero}
                onChange={(e) => setBarbero(e.target.value)}
                style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #f59e0b', borderRadius: '6px', padding: '10px', color: '#f8fafc', fontSize: '13px', boxSizing: 'border-box', fontWeight: 'bold' }}
                required
              >
                {barberosFiltrados.length > 0 ? (
                  barberosFiltrados.map(b => (
                    <option key={b.id || b.nombre} value={b.nombre}>{b.nombre} ({b.especialidad})</option>
                  ))
                ) : (
                  <option value="">No hay barberos registrados en esta sede</option>
                )}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>Servicio</label>
              <select
                value={servicio}
                onChange={(e) => setServicio(e.target.value)}
                style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '6px', padding: '10px', color: '#f8fafc', fontSize: '13px', boxSizing: 'border-box' }}
              >
                {serviciosFiltrados.map(s => (
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
                  <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '6px' }}>Seleccione Horario ({slotDuration === 30 ? 'Cada 30 min' : 'Cada hora'})</label>
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
              <h4 style={{ color: '#fbbf24', margin: 0, fontSize: '14px' }}>Cartel QR Exclusivo: {estActual?.nombre}</h4>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>Escanee para registrarse de forma inmediata en esta sede o perfil.</p>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://gol-cut-barber-api.vercel.app?sede=${encodeURIComponent(estActual?.nombre)}`}
                alt="QR Recepción"
                style={{ border: '3px solid #fbbf24', borderRadius: '12px', padding: '6px', backgroundColor: '#ffffff', width: '150px', height: '150px', marginTop: '8px' }}
              />
            </div>
          ) : citaCreada ? (
            <div style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #059669', borderRadius: '10px', padding: '12px', boxSizing: 'border-box' }}>
              <CheckCircle style={{ width: '28px', height: '28px', color: '#34d399', margin: '0 auto 6px auto' }} />
              <h4 style={{ color: '#34d399', margin: '0 0 6px 0', fontSize: '14px' }}>¡Cita Registrada Correctamente!</h4>
              <div style={{ fontSize: '11px', color: '#cbd5e1', textAlign: 'left', backgroundColor: '#0f172a', padding: '8px', borderRadius: '6px' }}>
                <p style={{ margin: '2px 0' }}><span style={{ color: '#94a3b8' }}>Establecimiento:</span> {estActual?.nombre}</p>
                <p style={{ margin: '2px 0' }}><span style={{ color: '#94a3b8' }}>Cliente:</span> {citaCreada.cliente}</p>
                <p style={{ margin: '2px 0' }}><span style={{ color: '#94a3b8' }}>Barbero:</span> {citaCreada.barbero}</p>
                <p style={{ margin: '2px 0' }}><span style={{ color: '#94a3b8' }}>Fecha/Hora:</span> {citaCreada.fecha} - {citaCreada.hora}</p>
                <p style={{ margin: '2px 0' }}><span style={{ color: '#94a3b8' }}>Valor:</span> ${citaCreada.precio.toLocaleString()}</p>
              </div>
            </div>
          ) : (
            <div style={{ color: '#64748b' }}>
              <span style={{ fontSize: '12px' }}>Complete el formulario para programar su espacio</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function VistaBarbero({ barberoActual, citas, setCitas, servicios, onCerrarSesion, devConfig, licenciaVencida, incentivos, activeRole, tenantPrincipal, tenants }) {
  const [servicioRapido, setServicioRapido] = useState(servicios[0]?.nombre || '');
  const [precioRapido, setPrecioRapido] = useState(servicios[0]?.precio || 25000);
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState('efectivo');

  const [citaACancelar, setCitaACancelar] = useState(null);
  const [motivoPreset, setMotivoPreset] = useState('Cliente no asistió a la cita');
  const [motivoLibre, setMotivoLibre] = useState('');

  const sedeBarbero = tenants.find(t => t.id === barberoActual?.sedeId) || tenantPrincipal;
  const urlWhatsapp = `https://wa.me/${devConfig?.whatsappSoporte || '573001234567'}?text=${encodeURIComponent(devConfig?.mensajeRenovacion || 'Hola')}`;

  if (licenciaVencida) {
    return (
      <div style={{ backgroundColor: '#0f172a', border: '1px solid #f43f5e', borderRadius: '16px', padding: '24px', textAlign: 'center', maxWidth: '500px', margin: '40px auto' }}>
        <AlertTriangle style={{ width: '48px', height: '48px', color: '#f43f5e', margin: '0 auto 12px auto' }} />
        <h3 style={{ color: '#f43f5e', margin: '0 0 8px 0', fontSize: '18px' }}>Suscripción de Barbería Pausada</h3>
        <p style={{ color: '#cbd5e1', fontSize: '12px', margin: '0 0 16px 0' }}>La membresía mensual ha caducado. Contacte al desarrollador.</p>
        {activeRole !== 'evaluador' && activeRole !== 'sucursal_demo' && (
          <a href={urlWhatsapp} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: '#059669', color: '#fff', textDecoration: 'none', padding: '10px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <MessageCircle style={{ width: '16px', height: '16px' }} /> Contactar al Desarrollador
          </a>
        )}
      </div>
    );
  }

  const nombreBarberoActualLimpio = (barberoActual?.nombre || '').trim().toLowerCase();
  const incBarbero = incentivos.find(i => (i.tipo === 'barbero' || i.tipo === 'bono_barbero') && i.activo && (i.destinatario === 'Todos los Barberos' || i.destinatario?.toLowerCase() === nombreBarberoActualLimpio));
  
  const citasBarbero = citas.filter(c => {
    const barberoCitaLimpio = (c.barbero || '').trim().toLowerCase();
    return barberoCitaLimpio.includes(nombreBarberoActualLimpio) || nombreBarberoActualLimpio.includes(barberoCitaLimpio);
  });

  const atencionesBarbero = citasBarbero.filter(c => c.estado === 'completada').length;
   
  const transferenciasNoRegistradas = citasBarbero.filter(c => c.estado === 'completada' && c.metodoPago === 'transferencia' && !c.registradoEnApp).length;
  const meta = incBarbero?.metaCitas || 15;
  const porcentajeAvance = Math.max(0, Math.min(Math.round(((atencionesBarbero - (transferenciasNoRegistradas * 2)) / meta) * 100), 100));

  const handleEstadoCita = (id, nuevoEstado) => {
    setCitas(citas.map(c => c.id === id ? { ...c, estado: nuevoEstado, registradoEnApp: true } : c));
  };

  const handleEliminarCitaBarbero = (id) => {
    if (window.confirm('¿Desea anular o eliminar definitivamente esta cita de la lista?')) {
      setCitas(citas.filter(c => c.id !== id));
    }
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
    const valorFinal = Number(precioRapido);

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
      motivoCancelacion: null
    };

    setCitas([nueva, ...citas]);
  };

  const ingresosHoy = citasBarbero.filter(c => c.estado === 'completada').reduce((sum, c) => sum + (c.precio || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(245, 158, 11, 0.2)', paddingBottom: '12px', gap: '8px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#fbbf24', margin: 0 }}>Panel Barbero - {barberoActual?.nombre}</h2>
          <p style={{ color: '#94a3b8', fontSize: '11px', margin: '2px 0 0 0' }}>Sede: {sedeBarbero.nombreBarberia} | Conteo regresivo del mes: <strong style={{ color: '#38bdf8' }}>{sedeBarbero.diasRestantes || 30} días</strong></p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '6px 10px', borderRadius: '6px', fontSize: '12px' }}>
            Consolidado Ganancias: <span style={{ color: '#34d399', fontWeight: 'bold' }}>${ingresosHoy.toLocaleString()}</span>
          </div>
          <button onClick={onCerrarSesion} style={{ padding: '6px 10px', backgroundColor: '#334155', color: '#f8fafc', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>Salir</button>
        </div>
      </div>

      {incBarbero && (
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #3b82f6', borderRadius: '10px', padding: '12px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', color: '#93c5fd', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Award style={{ width: '14px', height: '14px' }} /> {incBarbero.titulo}:
            </span>
            <span style={{ fontSize: '11px', color: '#60a5fa', fontWeight: 'bold' }}>{atencionesBarbero} Atenciones ({porcentajeAvance}%)</span>
          </div>
          <p style={{ fontSize: '10px', color: '#94a3b8', margin: '0 0 6px 0' }}>{incBarbero.descripcion} (Destinado a: {incBarbero.destinatario})</p>
          <div style={{ width: '100%', height: '8px', backgroundColor: '#020617', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${porcentajeAvance}%`, height: '100%', backgroundColor: '#3b82f6', transition: 'width 0.3s ease' }}></div>
          </div>
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

              <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                {c.estado !== 'completada' && c.estado !== 'cancelada' && (
                  <button 
                    onClick={() => handleEstadoCita(c.id, 'completada')} 
                    style={{ flex: 1, padding: '6px', backgroundColor: '#064e3b', color: '#34d399', border: '1px solid #059669', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '10px' }}
                  >
                    Atendido
                  </button>
                )}
                {c.estado !== 'cancelada' && c.estado !== 'completada' && (
                  <button 
                    onClick={() => setCitaACancelar(c)} 
                    style={{ padding: '6px 8px', backgroundColor: '#450a0a', color: '#f87171', border: '1px solid #ef4444', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '10px' }}
                  >
                    Anular / No Asistió
                  </button>
                )}
                <button 
                  onClick={() => handleEliminarCitaBarbero(c.id)} 
                  style={{ backgroundColor: '#334155', color: '#f87171', border: '1px solid #64748b', padding: '6px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}
                >
                  Eliminar
                </button>
              </div>
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
            <h3 style={{ margin: '0 0 10px 0', color: '#f43f5e', fontSize: '16px' }}>Anular Cita / Justificar Ausencia</h3>
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
                <button type="submit" style={{ flex: 1, backgroundColor: '#450a0a', color: '#f87171', border: '1px solid #ef4444', padding: '8px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Confirmar Anulación</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function VistaBarberoIndependiente({ perfilIndependiente, setPerfilesIndependientes, perfilesIndependientes, citas, setCitas, onCerrarSesion, devConfig, activeRole }) {
  const [servicioNombre, setServicioNombre] = useState('');
  const [servicioPrecio, setServicioPrecio] = useState('');
  const [servicioDuracion, setServicioDuracion] = useState('30 min');

  const [servicioSeleccionado, setServicioSeleccionado] = useState(perfilIndependiente.serviciosPropios[0]?.nombre || '');
  const [precioCobro, setPrecioCobro] = useState(perfilIndependiente.serviciosPropios[0]?.precio || 30000);
  const [metodoPago, setMetodoPago] = useState('efectivo');

  const [citaACancelarIndep, setCitaACancelarIndep] = useState(null);
  const [motivoPresetIndep, setMotivoPresetIndep] = useState('Cliente no asistió a la cita');
  const [motivoLibreIndep, setMotivoLibreIndep] = useState('');

  const urlWhatsappIndep = `https://wa.me/${perfilIndependiente.whatsappContacto || devConfig?.whatsappSoporte || '573001234567'}?text=${encodeURIComponent(`Hola, soy ${perfilIndependiente.propietario} de la barbería independiente "${perfilIndependiente.nombreBarberia}" y deseo gestionar mi renovación o soporte.`)}`;

  const nombrePropLimpio = (perfilIndependiente.propietario || '').trim().toLowerCase();
  const nombreBarberiaIndepLimpio = (perfilIndependiente.nombreBarberia || '').trim().toLowerCase();

  const misCitasIndependiente = citas.filter(c => {
    const barberoCitaLimpio = (c.barbero || '').trim().toLowerCase();
    return barberoCitaLimpio.includes(nombrePropLimpio) || barberoCitaLimpio.includes(nombreBarberiaIndepLimpio);
  });

  const ingresosTotales = misCitasIndependiente.filter(c => c.estado === 'completada').reduce((sum, c) => sum + (c.precio || 0), 0);

  const actualizarPerfilActual = (nuevoPerfil) => {
    const actualizados = perfilesIndependientes.map(pi => pi.id === nuevoPerfil.id ? nuevoPerfil : pi);
    setPerfilesIndependientes(actualizados);
  };

  const handleCrearServicioPropio = (e) => {
    e.preventDefault();
    if (!servicioNombre.trim()) return;

    const nuevoServ = {
      id: 'si' + Date.now(),
      nombre: servicioNombre.trim(),
      precio: Number(servicioPrecio),
      duracion: servicioDuracion
    };

    const actualizado = {
      ...perfilIndependiente,
      serviciosPropios: [...perfilIndependiente.serviciosPropios, nuevoServ]
    };
    actualizarPerfilActual(actualizado);

    setServicioNombre('');
    setServicioPrecio('');
    alert(`¡Corte "${nuevoServ.nombre}" creado exitosamente!`);
  };

  const handleEliminarServicioPropio = (id, nombre) => {
    if (window.confirm(`¿Desea eliminar el corte "${nombre}" de su catálogo?`)) {
      const actualizado = {
        ...perfilIndependiente,
        serviciosPropios: perfilIndependiente.serviciosPropios.filter(s => s.id !== id)
      };
      actualizarPerfilActual(actualizado);
    }
  };

  const handleTogglePausarAgendaIndep = () => {
    const nuevoEstado = !perfilIndependiente.agendaPausada;
    const actualizado = {
      ...perfilIndependiente,
      agendaPausada: nuevoEstado
    };
    actualizarPerfilActual(actualizado);
    alert(nuevoEstado ? 'Su agenda independiente ha sido PAUSADA. Los clientes verán aviso de disculpa.' : 'Su agenda independiente ha sido ACTIVADA.');
  };

  const handleGuardarMensajePausaIndep = (e) => {
    e.preventDefault();
    alert('¡Mensaje de ausencia actualizado correctamente para sus clientes!');
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
      barbero: `${perfilIndependiente.propietario} (${perfilIndependiente.nombreBarberia})`,
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

  const handleEstadoCitaIndep = (id, nuevoEstado) => {
    setCitas(citas.map(c => c.id === id ? { ...c, estado: nuevoEstado, registradoEnApp: true } : c));
  };

  const handleEliminarCitaIndep = (id) => {
    if (window.confirm('¿Desea anular o eliminar esta cita de su lista?')) {
      setCitas(citas.filter(c => c.id !== id));
    }
  };

  const handleConfirmarCancelacionIndep = (e) => {
    e.preventDefault();
    if (!citaACancelarIndep) return;
    const justificacionFinal = motivoPresetIndep === 'Otro motivo...' ? motivoLibreIndep.trim() : motivoPresetIndep;

    setCitas(citas.map(c => c.id === citaACancelarIndep.id ? { 
      ...c, 
      estado: 'cancelada', 
      motivoCancelacion: justificacionFinal 
    } : c));

    setCitaACancelarIndep(null);
    setMotivoLibreIndep('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(245, 158, 11, 0.2)', paddingBottom: '12px', gap: '8px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#fbbf24', margin: 0 }}>⭐ {perfilIndependiente.nombreBarberia} ({perfilIndependiente.propietario})</h2>
          <p style={{ color: '#94a3b8', fontSize: '11px', margin: '2px 0 0 0' }}>Conteo regresivo del mes (Licencia): <strong style={{ color: '#38bdf8' }}>{perfilIndependiente.diasRestantes || 30} días</strong> | Clave de acceso: <strong style={{ color: '#fbbf24' }}>{perfilIndependiente.clave}</strong></p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {activeRole !== 'evaluador' && activeRole !== 'sucursal_demo' && (
            <a href={urlWhatsappIndep} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: '#059669', color: '#fff', textDecoration: 'none', padding: '8px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MessageCircle style={{ width: '14px', height: '14px' }} /> WhatsApp Soporte / Renovar
            </a>
          )}
          <button onClick={onCerrarSesion} style={{ padding: '8px 12px', backgroundColor: '#334155', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>Salir</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #059669', padding: '14px', borderRadius: '10px' }}>
          <span style={{ fontSize: '11px', color: '#34d399', fontWeight: 'bold' }}>💰 Mis Ingresos Mes Actual (Caja)</span>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '4px 0 0 0', color: '#34d399' }}>${ingresosTotales.toLocaleString()}</p>
        </div>
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #3b82f6', padding: '14px', borderRadius: '10px' }}>
          <span style={{ fontSize: '11px', color: '#60a5fa', fontWeight: 'bold' }}>📊 Consolidado Mes Anterior (Comparativa)</span>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '4px 0 0 0', color: '#60a5fa' }}>${(perfilIndependiente.ingresosMesAnterior || 0).toLocaleString()}</p>
        </div>
        <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '14px', borderRadius: '10px' }}>
          <span style={{ fontSize: '11px', color: '#fbbf24', fontWeight: 'bold' }}>✂️ Total Atenciones / Citas</span>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '4px 0 0 0' }}>{misCitasIndependiente.length}</p>
        </div>
      </div>

      <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '16px', borderRadius: '12px' }}>
        <h3 style={{ fontSize: '14px', color: '#fbbf24', margin: '0 0 10px 0' }}>🛑 Control de Pausa / Bloqueo de Agenda Autónoma</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#020617', padding: '10px', borderRadius: '8px', border: '1px solid #334155' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}>Estado Agenda: {perfilIndependiente.agendaPausada ? 'Pausada (No Labora Hoy)' : 'Activa (Recibiendo Citas)'}</span>
            </div>
            <button onClick={handleTogglePausarAgendaIndep} style={{ backgroundColor: perfilIndependiente.agendaPausada ? '#065f46' : '#78350f', color: perfilIndependiente.agendaPausada ? '#34d399' : '#fcd34d', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>
              {perfilIndependiente.agendaPausada ? 'Activar Agenda' : 'Pausar Agenda'}
            </button>
          </div>
          <form onSubmit={handleGuardarMensajePausaIndep} style={{ display: 'flex', gap: '8px' }}>
            <input type="text" value={perfilIndependiente.mensajePausa || ''} onChange={(e) => actualizarPerfilActual({ ...perfilIndependiente, mensajePausa: e.target.value })} placeholder="Mensaje de disculpa para los clientes..." style={{ flex: 1, backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} />
            <button type="submit" style={{ backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}>Guardar Mensaje</button>
          </form>
        </div>
      </div>

      <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '16px', borderRadius: '12px' }}>
        <h3 style={{ fontSize: '14px', color: '#fbbf24', margin: '0 0 10px 0' }}>📅 Citas Agendadas por Clientes (En Tiempo Real)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
          {misCitasIndependiente.length > 0 ? (
            misCitasIndependiente.map(c => (
              <div key={c.id} style={{ backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '10px', padding: '12px', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ margin: 0, color: '#fff', fontSize: '13px' }}>{c.cliente}</h4>
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

                <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                  {c.estado !== 'completada' && c.estado !== 'cancelada' && (
                    <button 
                      onClick={() => handleEstadoCitaIndep(c.id, 'completada')} 
                      style={{ flex: 1, padding: '6px', backgroundColor: '#064e3b', color: '#34d399', border: '1px solid #059669', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '10px' }}
                    >
                      Atendido
                    </button>
                  )}
                  {c.estado !== 'cancelada' && c.estado !== 'completada' && (
                    <button 
                      onClick={() => setCitaACancelarIndep(c)} 
                      style={{ padding: '6px 8px', backgroundColor: '#450a0a', color: '#f87171', border: '1px solid #ef4444', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '10px' }}
                    >
                      Anular
                    </button>
                  )}
                  <button onClick={() => handleEliminarCitaIndep(c.id)} style={{ backgroundColor: '#334155', color: '#f87171', border: '1px solid #64748b', padding: '6px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
              No tienes citas agendadas aún.
            </div>
          )}
        </div>
      </div>

      <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '16px', borderRadius: '12px' }}>
        <h3 style={{ fontSize: '14px', color: '#fbbf24', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <PlusSquare style={{ width: '16px', height: '16px' }} /> Crear y Gestionar Mis Propios Cortes
        </h3>
        <form onSubmit={handleCrearServicioPropio} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px' }}>
          <input type="text" placeholder="Nombre del corte..." value={servicioNombre} onChange={(e) => setServicioNombre(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} required />
          <input type="number" placeholder="Precio ($)" value={servicioPrecio} onChange={(e) => setServicioPrecio(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} required />
          <input type="text" placeholder="Duración (Ej: 30 min)" value={servicioDuracion} onChange={(e) => setServicioDuracion(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} />
          <button type="submit" style={{ backgroundColor: '#f59e0b', color: '#020617', fontWeight: 'bold', padding: '8px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '11px' }}>Guardar Corte</button>
        </form>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
          {perfilIndependiente.serviciosPropios.map(s => (
            <div key={s.id} style={{ backgroundColor: '#020617', border: '1px solid #334155', padding: '8px 12px', borderRadius: '8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>{s.nombre}</span> <span style={{ color: '#34d399' }}>${s.precio.toLocaleString()}</span> ({s.duracion})
              </div>
              <button onClick={() => handleEliminarServicioPropio(s.id, s.nombre)} style={{ backgroundColor: '#450a0a', color: '#f87171', border: 'none', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' }}>✕</button>
            </div>
          ))}
        </div>
      </div>

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

      {citaACancelarIndep && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #f43f5e', borderRadius: '16px', maxWidth: '400px', width: '100%', padding: '20px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#f43f5e', fontSize: '16px' }}>Anular Cita / Justificar Ausencia</h3>
            <form onSubmit={handleConfirmarCancelacionIndep} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <select value={motivoPresetIndep} onChange={(e) => setMotivoPresetIndep(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '12px' }}>
                <option value="Cliente no asistió">Cliente no asistió a la cita</option>
                <option value="Barbero ausente / calamidad">Barbero ausente / calamidad</option>
                <option value="Otro motivo...">Otro motivo...</option>
              </select>
              {motivoPresetIndep === 'Otro motivo...' && (
                <textarea rows={3} value={motivoLibreIndep} onChange={(e) => setMotivoLibreIndep(e.target.value)} placeholder="Describa el motivo..." style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '12px' }} required />
              )}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" onClick={() => setCitaACancelarIndep(null)} style={{ flex: 1, backgroundColor: '#334155', color: '#fff', padding: '8px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>Volver</button>
                <button type="submit" style={{ flex: 1, backgroundColor: '#450a0a', color: '#f87171', border: '1px solid #ef4444', padding: '8px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Confirmar Anulación</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function VistaAdmin({ usuario, tenantActualParaAdmin, citas, setCitas, barberos, setBarberos, productos, setProductos, servicios, setServicios, devConfig, licenciaVencida, incentivos, setIncentivos, credencialesAdmin, setCredencialesAdmin, tenantPrincipal, setTenants, tenants, agendaPausadaSede, setAgendaPausadaSede, mensajePausaGeneral, setMensajePausaGeneral, globalTimer, setGlobalTimer, chairFeeConfig, setChairFeeConfig }) {
  const [tab, setTab] = useState('resumen');
   
  const tenantActivo = tenantActualParaAdmin || tenantPrincipal;

  const [nuevoUserAdmin, setNuevoUserAdmin] = useState(tenantActivo.usernameAdmin || credencialesAdmin.username);
  const [nuevoPassAdmin, setNuevoPassAdmin] = useState(tenantActivo.passwordAdmin || credencialesAdmin.password);
  const [nuevoNombreAdmin, setNuevoNombreAdmin] = useState(tenantActivo.dueno || credencialesAdmin.nombre);

  const [nombreNegocioInput, setNombreNegocioInput] = useState(tenantActivo.nombreBarberia);

  const [citaAReasignar, setCitaAReasignar] = useState(null);
  const [nuevoBarberoDestino, setNuevoBarberoDestino] = useState(barberos[0]?.nombre || '');

  const [nombreServ, setNombreServ] = useState('');
  const [precioServ, setPrecioServ] = useState('');
  const [duracionServ, setDuracionServ] = useState('30 min');

  const [nuevoNombreBarbero, setNuevoNombreBarbero] = useState('');
  const [nuevoUsernameBarbero, setNuevoUsernameBarbero] = useState('');
  const [nuevaClaveBarbero, setNuevaClaveBarbero] = useState('');
  const [especialidad, setEspecialidad] = useState('');

  const [nombreProd, setNombreProd] = useState('');
  const [precioProd, setPrecioProd] = useState('');
  const [stockProd, setStockProd] = useState('');

  const [nuevoIncTitulo, setNuevoIncTitulo] = useState('');
  const [nuevoIncTipo, setNuevoIncTipo] = useState('cumpleanos');
  const [nuevoIncDesc, setNuevoIncDesc] = useState('');
  const [nuevoIncPorcentaje, setNuevoIncPorcentaje] = useState(10);
  const [nuevoIncMeta, setNuevoIncMeta] = useState(15);
  const [nuevoIncDestinatario, setNuevoIncDestinatario] = useState('Todos los Clientes');

  const urlWhatsapp = `https://wa.me/${devConfig?.whatsappSoporte || '573001234567'}?text=${encodeURIComponent(devConfig?.mensajeRenovacion || 'Hola Elkin, deseo renovar mi membresía mensual.')}`;

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

  const handleGuardarNombreBarberia = (e) => {
    e.preventDefault();
    if (!nombreNegocioInput.trim()) return;

    const nombreAnteriorActual = tenantActivo.nombreBarberia;
    const actualizado = tenants.map(t => t.id === tenantActivo.id ? {
      ...t,
      nombreAnterior: nombreAnteriorActual,
      nombreBarberia: nombreNegocioInput.trim()
    } : t);

    setTenants(actualizado);
    alert(`¡Nombre de la barbería actualizado exitosamente a "${nombreNegocioInput.trim()}"!`);
  };

  const handleTogglePausarSede = () => {
    setAgendaPausadaSede(!agendaPausadaSede);
    alert(!agendaPausadaSede ? 'Agenda general de sede PAUSADA. Los clientes verán aviso de disculpa.' : 'Agenda general de sede ACTIVADA.');
  };

  const handleToggleGlobalTimeBlock = (slot) => {
    setGlobalTimer(prev => ({ ...prev, [slot]: !prev[slot] }));
  };

  const handleBillingCycleChange = (barberId, cycle) => {
    setBarberos(barberos.map(b => b.id === barberId ? { ...b, billingCycle: cycle } : b));
  };

  const toggleBarberLock = (barberId, nombreBarbero) => {
    setBarberos(barberos.map(b => {
      if (b.id === barberId) {
        const nuevoEstado = !b.isLocked;
        alert(nuevoEstado ? `Permisos bloqueados para ${nombreBarbero} por ciclo de pago.` : `Permisos activados (Pago recibido) para ${nombreBarbero}.`);
        return { ...b, isLocked: nuevoEstado };
      }
      return b;
    }));
  };

  const handleEliminarBarberoDefinitivo = (barberId, nombreBarbero) => {
    if (window.confirm(`¿Está seguro de eliminar permanentemente el perfil de ${nombreBarbero}? Esto liberará memoria y espacio en el sistema.`)) {
      setBarberos(barberos.filter(b => b.id !== barberId));
      alert(`Perfil de ${nombreBarbero} eliminado con éxito.`);
    }
  };

  const handleEliminarCitaAdmin = (id) => {
    if (window.confirm('¿Desea anular o eliminar definitivamente esta cita de la sede?')) {
      setCitas(citas.filter(c => c.id !== id));
    }
  };

  const handleActualizarCredencialesAdmin = (e) => {
    e.preventDefault();
    if (!nuevoUserAdmin.trim() || !nuevoPassAdmin.trim()) return;

    const actualizados = tenants.map(t => t.id === tenantActivo.id ? {
      ...t,
      usernameAdmin: nuevoUserAdmin.trim().toLowerCase(),
      passwordAdmin: nuevoPassAdmin.trim(),
      dueno: nuevoNombreAdmin.trim() || t.dueno
    } : t);
    setTenants(actualizados);

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

  const handleEliminarServicioAdmin = (id, nombre) => {
    if (window.confirm(`¿Desea eliminar el servicio "${nombre}"?`)) {
      setServicios(servicios.filter(s => s.id !== id));
    }
  };

  const handleAgregarBarbero = (e) => {
    e.preventDefault();
    if (!nuevoNombreBarbero.trim() || !nuevoUsernameBarbero.trim()) return;

    setBarberos([...barberos, { 
      id: 'b' + Date.now(), 
      username: nuevoUsernameBarbero.toLowerCase().trim(),
      nombre: nuevoNombreBarbero, 
      especialidad: especialidad || 'Barbero Profesional', 
      estado: 'Activo', 
      claveAcceso: nuevaClaveBarbero || 'barbero123',
      pausado: false,
      mensajePausa: 'Barbero no disponible hoy.',
      billingCycle: 'mensual',
      isLocked: false,
      sedeId: tenantActivo.id // VINCULACIÓN EXACTA A LA SEDE ACTIVA
    }]);
    setNuevoNombreBarbero('');
    setNuevoUsernameBarbero('');
    setNuevaClaveBarbero('');
    setEspecialidad('');
    alert('¡Barbero creado y vinculado a esta sede exitosamente!');
  };

  const handleAgregarProducto = (e) => {
    e.preventDefault();
    if (!nombreProd.trim()) return;
    setProductos([...productos, { id: 'p' + Date.now(), nombre: nombreProd, precio: Number(precioProd), stock: Number(stockProd) }]);
    setNombreProd('');
    setPrecioProd('');
    setStockProd('');
  };

  const handleEliminarProductoAdmin = (id, nombre) => {
    if (window.confirm(`¿Desea eliminar el producto "${nombre}" del inventario?`)) {
      setProductos(productos.filter(p => p.id !== id));
    }
  };

  const handleCrearIncentivo = (e) => {
    e.preventDefault();
    if (!nuevoIncTitulo.trim()) return;

    const nuevo = {
      id: 'inc_' + Date.now(),
      titulo: nuevoIncTitulo.trim(),
      tipo: nuevoIncTipo,
      descripcion: nuevoIncDesc.trim() || 'Incentivo o bono especial activo en la plataforma.',
      activo: true,
      porcentaje: Number(nuevoIncPorcentaje),
      metaCitas: Number(nuevoIncMeta),
      destinatario: nuevoIncDestinatario
    };

    setIncentivos([...incentivos, nuevo]);
    setNuevoIncTitulo('');
    setNuevoIncDesc('');
    alert('¡Incentivo o bono creado y aplicado exitosamente!');
  };

  const handleToggleIncentivo = (id) => {
    setIncentivos(incentivos.map(i => i.id === id ? { ...i, activo: !i.activo } : i));
  };

  const handleEliminarIncentivo = (id) => {
    if (window.confirm('¿Desea eliminar este incentivo permanentemente?')) {
      setIncentivos(incentivos.filter(i => i.id !== id));
    }
  };

  const ingresosTotalesDia = citas.filter(c => c.estado === 'completada').reduce((sum, c) => sum + (c.precio || 0), 0);

  // Filtrar barberos de esta sede para la administración local
  const barberosDeEstaSede = barberos.filter(b => !b.sedeId || b.sedeId === tenantActivo.id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(245, 158, 11, 0.2)', paddingBottom: '12px', gap: '8px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#fbbf24', margin: 0 }}>Panel Administrativo General ({tenantActivo?.nombreBarberia})</h2>
          <p style={{ color: '#94a3b8', fontSize: '11px', margin: '2px 0 0 0' }}>Conteo regresivo del mes: <strong style={{ color: '#38bdf8' }}>{tenantActivo?.diasRestantes || 30} días</strong> | Control de ingresos y stock de productos</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <a href={urlWhatsapp} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: '#059669', color: '#fff', textDecoration: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MessageCircle style={{ width: '14px', height: '14px' }} /> WhatsApp Soporte / Renovar
          </a>
        </div>
      </div>

      <div style={{ backgroundColor: '#0f172a', padding: '6px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', gap: '6px', overflowX: 'auto', width: '100%', boxSizing: 'border-box' }}>
        <button onClick={() => setTab('resumen')} style={{ padding: '8px 12px', background: tab === 'resumen' ? '#f59e0b' : 'transparent', color: tab === 'resumen' ? '#020617' : '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Resumen & Ingresos</button>
        <button onClick={() => setTab('incentivos')} style={{ padding: '8px 12px', background: tab === 'incentivos' ? '#f59e0b' : 'transparent', color: tab === 'incentivos' ? '#020617' : '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>🎁 Incentivos</button>
        <button onClick={() => setTab('barberos')} style={{ padding: '8px 12px', background: tab === 'barberos' ? '#f59e0b' : 'transparent', color: tab === 'barberos' ? '#020617' : '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Barberos & Sillas</button>
        <button onClick={() => setTab('servicios')} style={{ padding: '8px 12px', background: tab === 'servicios' ? '#f59e0b' : 'transparent', color: tab === 'servicios' ? '#020617' : '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Servicios & Precios</button>
        <button onClick={() => setTab('productos')} style={{ padding: '8px 12px', background: tab === 'productos' ? '#f59e0b' : 'transparent', color: tab === 'productos' ? '#020617' : '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Inventario</button>
        <button onClick={() => setTab('config_admin')} style={{ padding: '8px 12px', background: tab === 'config_admin' ? '#f59e0b' : 'transparent', color: tab === 'config_admin' ? '#020617' : '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Ajustes & Tiempos</button>
      </div>

      {tab === 'resumen' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            <div style={{ backgroundColor: '#0f172a', border: '1px solid #059669', padding: '14px', borderRadius: '10px' }}>
              <span style={{ fontSize: '11px', color: '#34d399', fontWeight: 'bold' }}>💰 Total Dinero Ingresado Mes (Sede + Productos)</span>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '6px 0 0 0', color: '#34d399' }}>${ingresosTotalesDia.toLocaleString()}</p>
            </div>
          </div>

          <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '14px', borderRadius: '10px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#fbbf24', fontSize: '13px' }}>📊 Liquidación Automática por Barbero</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
              {barberosDeEstaSede.map(b => {
                const ingresosBarbero = citas
                  .filter(c => c.barbero.toLowerCase() === b.nombre.toLowerCase() && c.estado === 'completada')
                  .reduce((sum, c) => sum + (c.precio || 0), 0);
                 
                const descuentoSilla = chairFeeConfig.tipo === 'fijo' ? chairFeeConfig.valor : (ingresosBarbero * chairFeeConfig.valor) / 100;
                const netoLiquidar = Math.max(0, ingresosBarbero - descuentoSilla);
                 
                return (
                  <div key={b.id} style={{ backgroundColor: '#020617', padding: '12px', borderRadius: '8px', border: '1px solid #334155' }}>
                    <span style={{ fontSize: '12px', color: '#fff', fontWeight: 'bold' }}>{b.nombre}</span>
                    <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }}>
                      <div>Bruto: <strong style={{ color: '#34d399' }}>${ingresosBarbero.toLocaleString()}</strong></div>
                      <div>Silla: <strong style={{ color: '#f87171' }}>-${descuentoSilla.toLocaleString()}</strong></div>
                    </div>
                    <div style={{ borderTop: '1px solid #1e293b', marginTop: '6px', paddingTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '10px', color: '#fbbf24' }}>Neto a liquidar:</span>
                      <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#34d399' }}>${netoLiquidar.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', padding: '14px', overflowX: 'auto' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#fbbf24', fontSize: '13px' }}>Control de Agendas, Citas & Anulación por Ausencia</h4>
            <table style={{ width: '100%', textAlign: 'left', fontSize: '11px', color: '#cbd5e1' }}>
              <thead>
                <tr style={{ color: '#fbbf24', borderBottom: '1px solid #334155' }}>
                  <th style={{ padding: '6px' }}>Cliente</th>
                  <th style={{ padding: '6px' }}>Barbero Asignado</th>
                  <th style={{ padding: '6px' }}>Servicio</th>
                  <th style={{ padding: '6px' }}>Pago</th>
                  <th style={{ padding: '6px' }}>Estado</th>
                  <th style={{ padding: '6px', textAlign: 'right' }}>Acciones</th>
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
                    <td style={{ padding: '6px', textAlign: 'right', display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                      {c.estado !== 'completada' && c.estado !== 'cancelada' && (
                        <button onClick={() => setCitaAReasignar(c)} style={{ padding: '4px 8px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>
                          🔄 Reasignar
                        </button>
                      )}
                      <button onClick={() => handleEliminarCitaAdmin(c.id)} style={{ padding: '4px 8px', backgroundColor: '#450a0a', color: '#f87171', border: '1px solid #ef4444', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>
                        Anular / Eliminar
                      </button>
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
          <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.4)', padding: '16px', borderRadius: '12px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#fbbf24', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Gift style={{ width: '16px', height: '16px' }} /> Crear / Configurar Nuevo Incentivo o Bono
            </h3>
            <form onSubmit={handleCrearIncentivo} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>Título del Incentivo:</label>
                <input type="text" placeholder="Ej: Bono Especial Fin de Semana" value={nuevoIncTitulo} onChange={(e) => setNuevoIncTitulo(e.target.value)} style={{ width: '100%', backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px', boxSizing: 'border-box' }} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>Tipo de Regla:</label>
                <select value={nuevoIncTipo} onChange={(e) => setNuevoIncTipo(e.target.value)} style={{ width: '100%', backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px', boxSizing: 'border-box' }}>
                  <option value="cumpleanos">Descuento Cumpleaños (Cliente)</option>
                  <option value="barbero">Premio / Meta Barbero</option>
                  <option value="bono_especial">Bono Directo en Dinero / Porcentaje</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>Destinatario:</label>
                <select value={nuevoIncDestinatario} onChange={(e) => setNuevoIncDestinatario(e.target.value)} style={{ width: '100%', backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px', boxSizing: 'border-box' }}>
                  <option value="Todos los Clientes">Todos los Clientes</option>
                  <option value="Todos los Barberos">Todos los Barberos</option>
                  {barberosDeEstaSede.map(b => (
                    <option key={b.id} value={b.nombre}>Barbero: {b.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>Porcentaje de Descuento/Premio (%):</label>
                <input type="number" value={nuevoIncPorcentaje} onChange={(e) => setNuevoIncPorcentaje(e.target.value)} style={{ width: '100%', backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>Meta de Citas (Si aplica para barbero):</label>
                <input type="number" value={nuevoIncMeta} onChange={(e) => setNuevoIncMeta(e.target.value)} style={{ width: '100%', backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px', boxSizing: 'border-box' }} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>Descripción:</label>
                <input type="text" placeholder="Detalle breve del incentivo..." value={nuevoIncDesc} onChange={(e) => setNuevoIncDesc(e.target.value)} style={{ width: '100%', backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px', boxSizing: 'border-box' }} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <button type="submit" style={{ backgroundColor: '#f59e0b', color: '#020617', fontWeight: 'bold', padding: '10px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Crear y Aplicar Incentivo</button>
              </div>
            </form>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {incentivos.map(i => (
              <div key={i.id} style={{ backgroundColor: '#0f172a', border: i.activo ? '1px solid #059669' : '1px solid #64748b', padding: '14px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '8px', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ margin: 0, color: '#fff', fontSize: '13px' }}>{i.titulo}</h4>
                    <span style={{ fontSize: '10px', color: '#fbbf24', background: 'rgba(245,158,11,0.1)', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '2px' }}>Destinatario: {i.destinatario || 'General'}</span>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', backgroundColor: i.activo ? 'rgba(5,150,105,0.2)' : 'rgba(100,116,139,0.2)', color: i.activo ? '#34d399' : '#94a3b8' }}>
                    {i.activo ? 'Activo' : 'Pausado'}
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: '#cbd5e1', margin: 0 }}>{i.descripcion}</p>
                <div style={{ fontSize: '11px', color: '#38bdf8' }}>
                  {i.porcentaje ? `Beneficio: ${i.porcentaje}%` : ''} {i.metaCitas ? `| Meta: ${i.metaCitas} citas` : ''}
                </div>
                <div style={{ display: 'flex', gap: '6px', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid #1e293b' }}>
                  <button onClick={() => handleToggleIncentivo(i.id)} style={{ flex: 1, backgroundColor: i.activo ? '#78350f' : '#065f46', color: i.activo ? '#fcd34d' : '#34d399', border: 'none', padding: '6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                    {i.activo ? 'Pausar' : 'Reanudar'}
                  </button>
                  <button onClick={() => handleEliminarIncentivo(i.id)} style={{ backgroundColor: '#450a0a', color: '#f87171', border: '1px solid #ef4444', padding: '6px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'barberos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.4)', padding: '16px', borderRadius: '12px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#fbbf24', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <DollarSign style={{ width: '16px', height: '16px' }} /> Configuración Flexible de Cobro por Silla (Monto Fijo o Porcentaje)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>Modalidad de Cobro:</label>
                <select 
                  value={chairFeeConfig.tipo} 
                  onChange={(e) => {
                    const nuevo = { ...chairFeeConfig, tipo: e.target.value };
                    setChairFeeConfig(nuevo);
                    localStorage.setItem('chairFeeConfig', JSON.stringify(nuevo));
                  }}
                  style={{ width: '100%', backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '12px' }}
                >
                  <option value="fijo">Valor Fijo en Dinero ($)</option>
                  <option value="porcentaje">Porcentaje de Comisión (%)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>
                  {chairFeeConfig.tipo === 'fijo' ? 'Valor a Cobrar por Silla ($):' : 'Porcentaje de Silla (%):'}
                </label>
                <input 
                  type="number" 
                  value={chairFeeConfig.valor} 
                  onChange={(e) => {
                    const nuevo = { ...chairFeeConfig, valor: Number(e.target.value) };
                    setChairFeeConfig(nuevo);
                    localStorage.setItem('chairFeeConfig', JSON.stringify(nuevo));
                  }}
                  style={{ width: '100%', backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '12px', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          </div>

          <form onSubmit={handleAgregarBarbero} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '6px', backgroundColor: '#0f172a', padding: '10px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <input type="text" placeholder="Nombre completo..." value={nuevoNombreBarbero} onChange={(e) => setNuevoNombreBarbero(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '6px', borderRadius: '4px', fontSize: '11px' }} required />
            <input type="text" placeholder="Usuario login" value={nuevoUsernameBarbero} onChange={(e) => setNuevoUsernameBarbero(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '6px', borderRadius: '4px', fontSize: '11px' }} required />
            <input type="password" placeholder="Contraseña" value={nuevaClaveBarbero} onChange={(e) => setNuevaClaveBarbero(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '6px', borderRadius: '4px', fontSize: '11px' }} required />
            <input type="text" placeholder="Especialidad" value={especialidad} onChange={(e) => setEspecialidad(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '6px', borderRadius: '4px', fontSize: '11px' }} />
            <button type="submit" style={{ backgroundColor: '#f59e0b', color: '#020617', border: 'none', padding: '6px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px', gridColumn: '1 / -1' }}>Registrar Nuevo Barbero en {tenantActivo.nombreBarberia}</button>
          </form>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {barberosDeEstaSede.map(b => (
              <div key={b.id} style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '12px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <h4 style={{ margin: 0, color: '#fff', fontSize: '13px' }}>{b.nombre}</h4>
                  <p style={{ margin: '2px 0', fontSize: '10px', color: '#fbbf24' }}>User: {b.username} | Clave: {b.claveAcceso}</p>
                  <p style={{ margin: '2px 0', fontSize: '10px', color: b.isLocked ? '#f43f5e' : '#34d399' }}>Estado Cuenta: {b.isLocked ? 'Bloqueado (Debe Cupo)' : 'Activo'}</p>
                </div>
                 
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <select 
                    value={b.billingCycle || 'mensual'} 
                    onChange={(e) => handleBillingCycleChange(b.id, e.target.value)}
                    style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '4px', borderRadius: '4px', fontSize: '10px' }}
                  >
                    <option value="semanal">Cobro Semanal</option>
                    <option value="quincenal">Cobro Quincenal</option>
                    <option value="mensual">Cobro Mensual</option>
                  </select>

                  <button onClick={() => toggleBarberLock(b.id, b.nombre)} style={{ backgroundColor: b.isLocked ? '#065f46' : '#92400e', color: b.isLocked ? '#34d399' : '#fef3c7', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                    {b.isLocked ? 'Activar (Pagó)' : 'Bloquear Cupo'}
                  </button>

                  <button onClick={() => handleEliminarBarberoDefinitivo(b.id, b.nombre)} style={{ backgroundColor: '#450a0a', color: '#f87171', border: '1px solid #ef4444', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', marginLeft: 'auto' }}>
                    🗑️ Eliminar Perfil
                  </button>
                </div>
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
              <div key={s.id} style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '12px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0, color: '#fff', fontSize: '13px' }}>{s.nombre}</h4>
                  <p style={{ margin: '4px 0', color: '#34d399', fontWeight: 'bold' }}>${s.precio.toLocaleString()}</p>
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>⏱️ {s.duracion}</span>
                </div>
                <button onClick={() => handleEliminarServicioAdmin(s.id, s.nombre)} style={{ backgroundColor: '#450a0a', color: '#f87171', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>Eliminar</button>
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
                  <th style={{ padding: '6px' }}>Stock / Alerta</th>
                  <th style={{ padding: '6px', textAlign: 'right' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {productos.map(p => {
                  const stockBajo = p.stock <= 5;
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid #1e293b' }}>
                      <td style={{ padding: '6px', fontWeight: 'bold', color: '#fff' }}>{p.nombre}</td>
                      <td style={{ padding: '6px', color: '#34d399' }}>${p.precio.toLocaleString()}</td>
                      <td style={{ padding: '6px' }}>
                        {p.stock} u. {stockBajo && <span style={{ color: '#f87171', fontWeight: 'bold', marginLeft: '4px' }}>⚠️ ¡Stock bajo, reabastecer!</span>}
                      </td>
                      <td style={{ padding: '6px', textAlign: 'right' }}>
                        <button onClick={() => handleEliminarProductoAdmin(p.id, p.nombre)} style={{ backgroundColor: '#450a0a', color: '#f87171', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>Eliminar</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'config_admin' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '520px' }}>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '16px', borderRadius: '12px' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#fbbf24', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock style={{ width: '16px', height: '16px' }} /> Control de Temporizadores y Bloqueos Globales (Admin)
            </h3>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 10px 0' }}>Bloquea o habilita franjas horarias completas para todo el sistema de la barbería:</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['Mañana', 'Tarde', 'Noche'].map((slot) => (
                <button
                  key={slot}
                  onClick={() => handleToggleGlobalTimeBlock(slot)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    backgroundColor: globalTimer[slot] ? '#dc2626' : '#334155',
                    color: '#fff',
                    border: 'none'
                  }}
                >
                  Turno {slot}: {globalTimer[slot] ? 'Bloqueado' : 'Disponible'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '16px', borderRadius: '12px' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#fbbf24', fontSize: '15px' }}>🛑 Control de Pausa / Bloqueo General Sede</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#020617', padding: '10px', borderRadius: '8px', border: '1px solid #334155' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}>Sede: {agendaPausadaSede ? 'Pausada (Cerrada)' : 'Activa (Abierta)'}</span>
                <button onClick={handleTogglePausarSede} style={{ backgroundColor: agendaPausadaSede ? '#065f46' : '#78350f', color: agendaPausadaSede ? '#34d399' : '#fcd34d', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>
                  {agendaPausadaSede ? 'Activar Sede' : 'Pausar Sede'}
                </button>
              </div>
              <input type="text" value={mensajePausaGeneral} onChange={(e) => setMensajePausaGeneral(e.target.value)} placeholder="Mensaje disculpa general..." style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} />
            </div>
          </div>

          <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '16px', borderRadius: '12px' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#fbbf24', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Edit3 style={{ width: '16px', height: '16px' }} /> Cambiar Nombre de la Barbería
            </h3>
            <form onSubmit={handleGuardarNombreBarberia} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input 
                type="text" 
                value={nombreNegocioInput} 
                onChange={(e) => setNombreNegocioInput(e.target.value)} 
                style={{ width: '100%', backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '12px', boxSizing: 'border-box' }} 
                required 
              />
              <button type="submit" style={{ backgroundColor: '#f59e0b', color: '#020617', fontWeight: 'bold', padding: '10px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
                Actualizar Nombre
              </button>
            </form>
          </div>

          <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '16px', borderRadius: '12px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#fbbf24', fontSize: '15px' }}>Credenciales de Administrador ({tenantActivo?.nombreBarberia})</h3>
            <form onSubmit={handleActualizarCredencialesAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>Nombre Visible</label>
                <input type="text" value={nuevoNombreAdmin} onChange={(e) => setNuevoNombreAdmin(e.target.value)} style={{ width: '100%', backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '12px', boxSizing: 'border-box' }} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>Nuevo Usuario Admin</label>
                <input type="text" value={nuevoUserAdmin} onChange={(e) => setNuevoUserAdmin(e.target.value)} style={{ width: '100%', backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '12px', boxSizing: 'border-box' }} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>Nueva Contraseña</label>
                <input type="password" value={nuevoPassAdmin} onChange={(e) => setNuevoPassAdmin(e.target.value)} style={{ width: '100%', backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '12px', boxSizing: 'border-box' }} required />
              </div>
              <button type="submit" style={{ backgroundColor: '#f59e0b', color: '#020617', fontWeight: 'bold', padding: '10px', borderRadius: '6px', border: 'none', cursor: 'pointer', marginTop: '6px' }}>Guardar Nuevas Credenciales</button>
            </form>
          </div>
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
                {barberosDeEstaSede.map(b => <option key={b.id} value={b.nombre}>{b.nombre}</option>)}
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

function VistaSuperAdmin({ devConfig, setDevConfig, barberos, setBarberos, tenants, setTenants, perfilesIndependientes, setPerfilesIndependientes, setActiveRole, incentivos, setIncentivos, credencialesAdmin, setCredencialesAdmin, superAdminCreds, setSuperAdminCreds }) {
  const [whatsapp, setWhatsapp] = useState(devConfig?.whatsappSoporte || '573001234567');
  
  // Estados para cambiar las propias credenciales del SuperAdmin
  const [nuevoSuperUser, setNuevoSuperUser] = useState(superAdminCreds.username);
  const [nuevoSuperPass, setNuevoSuperPass] = useState(superAdminCreds.password);
  const [nuevoSuperNombre, setNuevoSuperNombre] = useState(superAdminCreds.nombre);

  const [nuevoNombreBarberia, setNuevoNombreBarberia] = useState('');
  const [nuevoDuenoBarberia, setNuevoDuenoBarberia] = useState('');
  const [nuevoWpBarberia, setNuevoWpBarberia] = useState('');
  const [nuevoUserTenant, setNuevoUserTenant] = useState('');
  const [nuevoPassTenant, setNuevoPassTenant] = useState('');

  const [tenantEditandoId, setTenantEditandoId] = useState(null);
  const [editTenantNombre, setEditTenantNombre] = useState('');
  const [editTenantDueno, setEditTenantDueno] = useState('');
  const [editTenantUser, setEditTenantUser] = useState('');
  const [editTenantPass, setEditTenantPass] = useState('');
  const [editTenantWp, setEditTenantWp] = useState('');

  const [barberoEditandoClave, setBarberoEditandoClave] = useState(null);
  const [nuevaClaveBarberoDev, setNuevaClaveBarberoDev] = useState('');

  const [perfilIndepEditandoId, setPerfilIndepEditandoId] = useState(null);
  const [editIndepNombre, setEditIndepNombre] = useState('');
  const [editIndepPropietario, setEditIndepPropietario] = useState('');
  const [editIndepUser, setEditIndepUser] = useState('');
  const [editIndepClave, setEditIndepClave] = useState('');
  const [editIndepWp, setEditIndepWp] = useState('');

  const [nuevoIndepNombre, setNuevoIndepNombre] = useState('');
  const [nuevoIndepPropietario, setNuevoIndepPropietario] = useState('');
  const [nuevoIndepWp, setNuevoIndepWp] = useState('573001234567');
  const [nuevoIndepUser, setNuevoIndepUser] = useState('');
  const [nuevoIndepPass, setNuevoIndepPass] = useState('');

  const handleWhatsappSave = (e) => {
    e.preventDefault();
    setDevConfig({ ...devConfig, whatsappSoporte: whatsapp });
    alert('¡WhatsApp de soporte actualizado!');
  };

  const handleGuardarCredencialesSuperAdmin = (e) => {
    e.preventDefault();
    if (!nuevoSuperUser.trim() || !nuevoSuperPass.trim()) return;
    setSuperAdminCreds({
      username: nuevoSuperUser.trim().toLowerCase(),
      password: nuevoSuperPass.trim(),
      nombre: nuevoSuperNombre.trim() || 'SuperAdmin / Desarrollador'
    });
    alert('¡Tus credenciales de Desarrollador Root han sido actualizadas con éxito!');
  };

  const handleCrearTenant = (e) => {
    e.preventDefault();
    if (!nuevoNombreBarberia.trim() || !nuevoDuenoBarberia.trim() || !nuevoUserTenant.trim() || !nuevoPassTenant.trim()) return;

    const nuevaSede = {
      id: 't' + Date.now(),
      nombreBarberia: nuevoNombreBarberia.trim(),
      nombreAnterior: 'Nueva Sede (Creada por Dev)',
      dueno: nuevoDuenoBarberia.trim(),
      estadoLicencia: 'Activa',
      diasRestantes: 30,
      whatsappContacto: nuevoWpBarberia.trim() || '573001234567',
      usernameAdmin: nuevoUserTenant.trim().toLowerCase(),
      passwordAdmin: nuevoPassTenant.trim()
    };

    setTenants([...tenants, nuevaSede]);
    setNuevoNombreBarberia('');
    setNuevoDuenoBarberia('');
    setNuevoWpBarberia('');
    setNuevoUserTenant('');
    setNuevoPassTenant('');
    alert(`¡Barbería "${nuevaSede.nombreBarberia}" creada con éxito!`);
  };

  const iniciarEdicionTenant = (t) => {
    setTenantEditandoId(t.id);
    setEditTenantNombre(t.nombreBarberia);
    setEditTenantDueno(t.dueno);
    setEditTenantUser(t.usernameAdmin || 'admin');
    setEditTenantPass(t.passwordAdmin || 'admin123');
    setEditTenantWp(t.whatsappContacto);
  };

  const handleGuardarTenantDev = (e, id) => {
    e.preventDefault();
    const actualizados = tenants.map(t => {
      if (t.id === id) {
        return {
          ...t,
          nombreAnterior: t.nombreBarberia,
          nombreBarberia: editTenantNombre.trim(),
          dueno: editTenantDueno.trim(),
          usernameAdmin: editTenantUser.trim().toLowerCase(),
          passwordAdmin: editTenantPass.trim(),
          whatsappContacto: editTenantWp.trim()
        };
      }
      return t;
    });
    setTenants(actualizados);
    setTenantEditandoId(null);
    alert('¡Barbería y credenciales de administrador actualizadas con éxito!');
  };

  const iniciarEdicionIndependiente = (pi) => {
    setPerfilIndepEditandoId(pi.id);
    setEditIndepNombre(pi.nombreBarberia);
    setEditIndepPropietario(pi.propietario);
    setEditIndepUser(pi.username);
    setEditIndepClave(pi.clave);
    setEditIndepWp(pi.whatsappContacto);
  };

  const handleGuardarIndependienteDev = (e, id) => {
    e.preventDefault();
    const actualizados = perfilesIndependientes.map(pi => {
      if (pi.id === id) {
        return {
          ...pi,
          nombreAnterior: pi.nombreBarberia,
          nombreBarberia: editIndepNombre.trim(),
          propietario: editIndepPropietario.trim(),
          username: editIndepUser.trim().toLowerCase(),
          clave: editIndepClave.trim(),
          whatsappContacto: editIndepWp.trim()
        };
      }
      return pi;
    });
    setPerfilesIndependientes(actualizados);
    setPerfilIndepEditandoId(null);
    alert('¡Perfil independiente actualizado con éxito!');
  };

  const handleCrearPerfilIndependienteNuevo = (e) => {
    e.preventDefault();
    if (!nuevoIndepNombre.trim() || !nuevoIndepPropietario.trim() || !nuevoIndepUser.trim() || !nuevoIndepPass.trim()) return;

    const nuevoIndep = {
      id: 'indep_' + Date.now(),
      nombreBarberia: nuevoIndepNombre.trim(),
      nombreAnterior: 'Perfil Creado por Dev',
      username: nuevoIndepUser.trim().toLowerCase(),
      clave: nuevoIndepPass.trim(),
      propietario: nuevoIndepPropietario.trim(),
      estadoLicencia: 'Activa',
      diasRestantes: 30,
      whatsappContacto: nuevoIndepWp.trim() || '573001234567',
      agendaPausada: false,
      mensajePausa: 'Lo siento, hoy no tendré servicio de barbería independiente.',
      ingresosMesAnterior: 1200000,
      serviciosPropios: [
        { id: 'si1', nombre: 'Corte Ejecutivo Solo', precio: 30000, duracion: '30 min' }
      ]
    };

    setPerfilesIndependientes([...perfilesIndependientes, nuevoIndep]);
    setNuevoIndepNombre('');
    setNuevoIndepPropietario('');
    setNuevoIndepUser('');
    setNuevoIndepPass('');
    alert('¡Perfil independiente creado exitosamente!');
  };

  const handleModificarClaveBarberoDev = (e, barberoId) => {
    e.preventDefault();
    if (!nuevaClaveBarberoDev.trim()) return;
    setBarberos(barberos.map(b => b.id === barberoId ? { ...b, claveAcceso: nuevaClaveBarberoDev.trim() } : b));
    setBarberoEditandoClave(null);
    setNuevaClaveBarberoDev('');
    alert('¡Contraseña del barbero modificada con éxito!');
  };

  const togglePausarTenant = (id) => {
    setTenants(tenants.map(t => {
      if (t.id === id) {
        const nuevoEstado = t.estadoLicencia === 'Activa' ? 'Pausada (Vencida)' : 'Activa';
        return { ...t, estadoLicencia: nuevoEstado, diasRestantes: nuevoEstado === 'Activa' ? 30 : 0 };
      }
      return t;
    }));
  };

  const togglePausarIndependiente = (id) => {
    const actualizados = perfilesIndependientes.map(pi => {
      if (pi.id === id) {
        const nuevoEstado = pi.estadoLicencia === 'Activa' ? 'Pausada (Vencida)' : 'Activa';
        return { ...pi, estadoLicencia: nuevoEstado, diasRestantes: nuevoEstado === 'Activa' ? 30 : 0 };
      }
      return pi;
    });
    setPerfilesIndependientes(actualizados);
  };

  const eliminarPerfilIndependiente = (id, nombre) => {
    if (window.confirm(`¿Está seguro de eliminar definitivamente el perfil independiente "${nombre}"?`)) {
      setPerfilesIndependientes(perfilesIndependientes.filter(pi => pi.id !== id));
      alert('Perfil independiente eliminado del sistema correctamente.');
    }
  };

  const eliminarTenant = (id, nombre) => {
    if (window.confirm(`¿Está seguro de eliminar definitivamente la barbería "${nombre}"?`)) {
      setTenants(tenants.filter(t => t.id !== id));
    }
  };

  const accederTenantTiempoReal = (tenantObj) => {
    alert(`Accediendo en tiempo real a la barbería: ${tenantObj.nombreBarberia}.`);
    setActiveRole('admin');
  };

  const accederIndependienteTiempoReal = (piObj) => {
    alert(`Accediendo en tiempo real a la barbería independiente de ${piObj.propietario}.`);
    setActiveRole('barbero_independiente');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ borderBottom: '1px solid rgba(245, 158, 11, 0.2)', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fbbf24', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Server style={{ width: '20px', height: '20px' }} /> Consola Desarrollador Root ({superAdminCreds.username})
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '11px', margin: '2px 0 0 0' }}>Administración global, WhatsApp de renovación, credenciales root y control de licencias</p>
        </div>
        <span style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>Acceso Root</span>
      </div>

      {/* CONFIGURACIÓN DEL WHATSAPP DE SOPORTE Y RENOVACIÓN */}
      <div style={{ backgroundColor: '#0f172a', border: '1px solid #059669', padding: '16px', borderRadius: '12px' }}>
        <h3 style={{ margin: '0 0 8px 0', color: '#34d399', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MessageCircle style={{ width: '16px', height: '16px' }} /> Configurar WhatsApp de Soporte / Renovación
        </h3>
        <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 10px 0' }}>Establece el número al que se comunicarán las barberías cuando requieran soporte o renovar su membresía.</p>
        <form onSubmit={handleWhatsappSave} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            value={whatsapp} 
            onChange={(e) => setWhatsapp(e.target.value)} 
            placeholder="Ej: 573001234567" 
            style={{ flex: 1, backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '12px', minWidth: '200px' }} 
            required 
          />
          <button type="submit" style={{ backgroundColor: '#059669', color: '#fff', fontWeight: 'bold', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Guardar WhatsApp</button>
        </form>
      </div>

      {/* CAMBIAR PROPIAS CREDENCIALES DEL SUPERADMIN */}
      <div style={{ backgroundColor: '#0f172a', border: '1px solid #3b82f6', padding: '16px', borderRadius: '12px' }}>
        <h3 style={{ margin: '0 0 8px 0', color: '#60a5fa', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Key style={{ width: '16px', height: '16px' }} /> Cambiar mis Credenciales de Desarrollador (SuperAdmin)
        </h3>
        <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 10px 0' }}>Modifica tu usuario y contraseña de acceso root de forma segura.</p>
        <form onSubmit={handleGuardarCredencialesSuperAdmin} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>Nombre / Título:</label>
            <input type="text" value={nuevoSuperNombre} onChange={(e) => setNuevoSuperNombre(e.target.value)} style={{ width: '100%', backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px', boxSizing: 'border-box' }} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>Nuevo Usuario Root:</label>
            <input type="text" value={nuevoSuperUser} onChange={(e) => setNuevoSuperUser(e.target.value)} style={{ width: '100%', backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px', boxSizing: 'border-box' }} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>Nueva Contraseña Root:</label>
            <input type="password" value={nuevoSuperPass} onChange={(e) => setNuevoSuperPass(e.target.value)} style={{ width: '100%', backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px', boxSizing: 'border-box' }} required />
          </div>
          <div style={{ gridColumn: '1 / -1', marginTop: '4px' }}>
            <button type="submit" style={{ backgroundColor: '#3b82f6', color: '#fff', fontWeight: 'bold', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Actualizar Mis Credenciales Root</button>
          </div>
        </form>
      </div>

      <div style={{ backgroundColor: '#0f172a', border: '1px solid #f59e0b', padding: '16px', borderRadius: '12px' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#fbbf24', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <PlusSquare style={{ width: '16px', height: '16px' }} /> Crear Nueva Barbería / Sede SaaS (Con Credenciales de Administrador Propias)
        </h3>
        <form onSubmit={handleCrearTenant} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
          <input type="text" placeholder="Nombre de la barbería..." value={nuevoNombreBarberia} onChange={(e) => setNuevoNombreBarberia(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} required />
          <input type="text" placeholder="Propietario / Admin..." value={nuevoDuenoBarberia} onChange={(e) => setNuevoDuenoBarberia(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} required />
          <input type="text" placeholder="Usuario login admin" value={nuevoUserTenant} onChange={(e) => setNuevoUserTenant(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} required />
          <input type="text" placeholder="Contraseña admin" value={nuevoPassTenant} onChange={(e) => setNuevoPassTenant(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} required />
          <input type="text" placeholder="WhatsApp contacto" value={nuevoWpBarberia} onChange={(e) => setNuevoWpBarberia(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} />
          <button type="submit" style={{ backgroundColor: '#f59e0b', color: '#020617', fontWeight: 'bold', padding: '8px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '11px', gridColumn: '1 / -1' }}>Registrar Barbería SaaS</button>
        </form>
      </div>

      <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '16px', borderRadius: '12px' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#fbbf24', fontSize: '14px' }}>Control SaaS: Sedes Registradas, Temporizadores & Modificación de Contraseñas de Administrador</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tenants.map(t => (
            <div key={t.id} style={{ backgroundColor: '#020617', padding: '14px', borderRadius: '8px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <span style={{ fontSize: '13px', color: '#fff', fontWeight: 'bold' }}>{t.nombreBarberia} ({t.dueno})</span>
                  <p style={{ fontSize: '10px', color: '#fbbf24', margin: '2px 0 0 0' }}>Usuario Admin: <strong>{t.usernameAdmin || 'admin'}</strong> | Clave: <strong style={{ color: '#34d399' }}>{t.passwordAdmin || 'admin123'}</strong></p>
                  <p style={{ fontSize: '10px', color: '#38bdf8', margin: '2px 0 0 0' }}>⏳ Temporizador: <strong>{t.diasRestantes || 30} days restantes</strong> ({t.estadoLicencia})</p>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button onClick={() => accederTenantTiempoReal(t)} style={{ backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>Ver</button>
                  <button onClick={() => iniciarEdicionTenant(t)} style={{ backgroundColor: '#f59e0b', color: '#020617', border: 'none', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>Editar Clave Admin</button>
                  <button onClick={() => togglePausarTenant(t.id)} style={{ backgroundColor: t.estadoLicencia === 'Activa' ? '#78350f' : '#065f46', color: t.estadoLicencia === 'Activa' ? '#fcd34d' : '#34d399', border: 'none', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>{t.estadoLicencia === 'Activa' ? 'Pausar' : 'Activar'}</button>
                  <button onClick={() => eliminarTenant(t.id, t.nombreBarberia)} style={{ backgroundColor: '#450a0a', color: '#f87171', border: '1px solid #ef4444', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>Eliminar</button>
                </div>
              </div>

              {tenantEditandoId === t.id && (
                <form onSubmit={(e) => handleGuardarTenantDev(e, t.id)} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px', marginTop: '10px', borderTop: '1px solid #1e293b', paddingTop: '10px' }}>
                  <input type="text" placeholder="Nombre barbería" value={editTenantNombre} onChange={(e) => setEditTenantNombre(e.target.value)} style={{ backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '6px', borderRadius: '4px', fontSize: '10px' }} required />
                  <input type="text" placeholder="Propietario / Admin" value={editTenantDueno} onChange={(e) => setEditTenantDueno(e.target.value)} style={{ backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '6px', borderRadius: '4px', fontSize: '10px' }} required />
                  <input type="text" placeholder="Usuario admin" value={editTenantUser} onChange={(e) => setEditTenantUser(e.target.value)} style={{ backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '6px', borderRadius: '4px', fontSize: '10px' }} required />
                  <input type="text" placeholder="Contraseña admin" value={editTenantPass} onChange={(e) => setEditTenantPass(e.target.value)} style={{ backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '6px', borderRadius: '4px', fontSize: '10px' }} required />
                  <input type="text" placeholder="WhatsApp" value={editTenantWp} onChange={(e) => setEditTenantWp(e.target.value)} style={{ backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '6px', borderRadius: '4px', fontSize: '10px' }} required />
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button type="submit" style={{ flex: 1, backgroundColor: '#059669', color: '#fff', border: 'none', padding: '6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Guardar</button>
                    <button type="button" onClick={() => setTenantEditandoId(null)} style={{ backgroundColor: '#334155', color: '#fff', border: 'none', padding: '6px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}>Cancelar</button>
                  </div>
                </form>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ backgroundColor: '#0f172a', border: '1px solid #3b82f6', padding: '16px', borderRadius: '12px' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#60a5fa', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Edit3 style={{ width: '16px', height: '16px' }} /> Administrar Perfiles Independientes / Solistas (Claves y Credenciales)
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          {perfilesIndependientes.map(pi => (
            <div key={pi.id} style={{ backgroundColor: '#020617', padding: '12px', borderRadius: '8px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <span style={{ fontSize: '13px', color: '#fff', fontWeight: 'bold' }}>⭐ {pi.nombreBarberia} ({pi.propietario})</span>
                  <p style={{ fontSize: '10px', color: '#fbbf24', margin: '2px 0 0 0' }}>Usuario: <strong>{pi.username}</strong> | Clave: <strong style={{ color: '#34d399' }}>{pi.clave}</strong> | Licencia: {pi.diasRestantes} días</p>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button onClick={() => accederIndependienteTiempoReal(pi)} style={{ backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>Ver</button>
                  <button onClick={() => iniciarEdicionIndependiente(pi)} style={{ backgroundColor: '#f59e0b', color: '#020617', border: 'none', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>Editar Claves</button>
                  <button onClick={() => togglePausarIndependiente(pi.id)} style={{ backgroundColor: pi.estadoLicencia === 'Activa' ? '#78350f' : '#065f46', color: pi.estadoLicencia === 'Activa' ? '#fcd34d' : '#34d399', border: 'none', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>
                    {pi.estadoLicencia === 'Activa' ? 'Pausar' : 'Activar'}
                  </button>
                  <button onClick={() => eliminarPerfilIndependiente(pi.id, pi.nombreBarberia)} style={{ backgroundColor: '#450a0a', color: '#f87171', border: '1px solid #ef4444', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>Eliminar</button>
                </div>
              </div>

              {perfilIndepEditandoId === pi.id && (
                <form onSubmit={(e) => handleGuardarIndependienteDev(e, pi.id)} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px', marginTop: '10px', borderTop: '1px solid #1e293b', paddingTop: '10px' }}>
                  <input type="text" placeholder="Nombre barbería" value={editIndepNombre} onChange={(e) => setEditIndepNombre(e.target.value)} style={{ backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '6px', borderRadius: '4px', fontSize: '10px' }} required />
                  <input type="text" placeholder="Propietario" value={editIndepPropietario} onChange={(e) => setEditIndepPropietario(e.target.value)} style={{ backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '6px', borderRadius: '4px', fontSize: '10px' }} required />
                  <input type="text" placeholder="Usuario" value={editIndepUser} onChange={(e) => setEditIndepUser(e.target.value)} style={{ backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '6px', borderRadius: '4px', fontSize: '10px' }} required />
                  <input type="text" placeholder="Contraseña" value={editIndepClave} onChange={(e) => setEditIndepClave(e.target.value)} style={{ backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '6px', borderRadius: '4px', fontSize: '10px' }} required />
                  <input type="text" placeholder="WhatsApp" value={editIndepWp} onChange={(e) => setEditIndepWp(e.target.value)} style={{ backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '6px', borderRadius: '4px', fontSize: '10px' }} required />
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button type="submit" style={{ flex: 1, backgroundColor: '#059669', color: '#fff', border: 'none', padding: '6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Guardar</button>
                    <button type="button" onClick={() => setPerfilIndepEditandoId(null)} style={{ backgroundColor: '#334155', color: '#fff', border: 'none', padding: '6px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}>Cancelar</button>
                  </div>
                </form>
              )}
            </div>
          ))}
        </div>

        <h4 style={{ margin: '0 0 8px 0', color: '#fbbf24', fontSize: '12px' }}>Crear Nuevo Perfil Independiente / Solista</h4>
        <form onSubmit={handleCrearPerfilIndependienteNuevo} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px' }}>
          <input type="text" placeholder="Nombre de barbería..." value={nuevoIndepNombre} onChange={(e) => setNuevoIndepNombre(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} required />
          <input type="text" placeholder="Nombre propietario..." value={nuevoIndepPropietario} onChange={(e) => setNuevoIndepPropietario(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} required />
          <input type="text" placeholder="Usuario login" value={nuevoIndepUser} onChange={(e) => setNuevoIndepUser(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} required />
          <input type="text" placeholder="Contraseña" value={nuevoIndepPass} onChange={(e) => setNuevoIndepPass(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} required />
          <input type="text" placeholder="WhatsApp" value={nuevoIndepWp} onChange={(e) => setNuevoIndepWp(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} required />
          <button type="submit" style={{ backgroundColor: '#3b82f6', color: '#fff', fontWeight: 'bold', padding: '8px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '11px', gridColumn: '1 / -1' }}>Crear Perfil Independiente Nuevo</button>
        </form>
      </div>

      <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '14px', borderRadius: '10px' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#fbbf24', fontSize: '13px' }}>Control Desarrollador: Claves y Contraseñas de Todos los Barberos (Sede)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
          {barberos.map(b => (
            <div key={b.id} style={{ backgroundColor: '#020617', padding: '12px', borderRadius: '8px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '12px', color: '#fff', fontWeight: 'bold' }}>{b.nombre}</span>
                  <p style={{ fontSize: '10px', color: '#fbbf24', margin: '2px 0 0 0' }}>User: <strong>{b.username}</strong> | Clave: <strong style={{ color: '#34d399' }}>{b.claveAcceso}</strong></p>
                </div>
                <button onClick={() => setBarberoEditandoClave(barberoEditandoClave === b.id ? null : b.id)} style={{ backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>
                  {barberoEditandoClave === b.id ? 'Cancelar' : 'Modificar Clave'}
                </button>
              </div>

              {barberoEditandoClave === b.id && (
                <form onSubmit={(e) => handleModificarClaveBarberoDev(e, b.id)} style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                  <input type="text" placeholder="Nueva contraseña..." value={nuevaClaveBarberoDev} onChange={(e) => setNuevaClaveBarberoDev(e.target.value)} style={{ flex: 1, backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '4px', borderRadius: '4px', fontSize: '10px' }} required />
                  <button type="submit" style={{ backgroundColor: '#059669', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>Guardar</button>
                </form>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}