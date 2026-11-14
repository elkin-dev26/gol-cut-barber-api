import React, { useState, useEffect } from 'react';
import {  
  Scissors, Lock, Smartphone, CheckCircle,  
  Gift, Award, AlertTriangle, Server, Key, PlusSquare, MessageCircle, Clock, Search, Edit3, Wrench, DollarSign, Package, UserCheck, Trash2
} from 'lucide-react';

export default function App() {
  const [activeRole, setActiveRole] = useState('cliente');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [usuarioAutenticado, setUsuarioAutenticado] = useState(null);

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

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

  const [tenants, setTenants] = useState(() => {
    const guardado = localStorage.getItem('gol_cut_tenants');
    if (guardado) return JSON.parse(guardado);
    return [
      { 
        id: 't1', 
        codigoUnico: 'GC-01',
        nombreBarberia: 'Barbería Estilo Urbano', 
        dueno: 'Elkin Ramírez', 
        estadoLicencia: 'Activa', 
        diasRestantes: 28, 
        whatsappContacto: '573001234567',
        emailContacto: 'estilourbano@barberia.com',
        enMantenimiento: false,
        usernameAdmin: 'admin',
        passwordAdmin: 'admin123'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('gol_cut_tenants', JSON.stringify(tenants));
  }, [tenants]);

  const [barberos, setBarberos] = useState(() => {
    const guardado = localStorage.getItem('gol_cut_barberos');
    if (guardado) return JSON.parse(guardado);
    return [
      { id: 'b1', username: 'elkin', nombre: 'Elkin Ramírez', especialidad: 'Estilista Profesional', estado: 'Activo', claveAcceso: 'barbero123', pausado: false, mensajePausa: 'Elkin no laborará este día.', billingCycle: 'mensual', isLocked: false, sedeId: 't1' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('gol_cut_barberos', JSON.stringify(barberos));
  }, [barberos]);

  const [perfilesIndependientes, setPerfilesIndependientes] = useState(() => {
    const guardado = localStorage.getItem('gol_cut_perfiles_independientes');
    if (guardado) return JSON.parse(guardado);
    return [
      {
        id: 'indep_1',
        codigoUnico: 'IND-01',
        nombreBarberia: 'Estudio Solista Juan',
        username: 'independiente',
        clave: 'solo2026',
        propietario: 'Juan Solista',
        estadoLicencia: 'Activa',
        diasRestantes: 30,
        whatsappContacto: '573001234567',
        emailContacto: 'juan.solista@gmail.com',
        enMantenimiento: false,
        agendaPausada: false,
        mensajePausa: 'Hoy no tendré servicio independiente.',
        serviciosPropios: [
          { id: 'si1', nombre: 'Corte Ejecutivo Solo', precio: 30000, duracion: '30 min' }
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
      exitoLogin({ username: barberoEncontrado.username, nombre: barberoEncontrado.nombre, role: 'barbero', barberoObj: barberoEncontrado });
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
                {devConfig.nombreGlobalPlataforma || tenantPrincipal.nombreBarberia.toUpperCase()}
              </h1>
              <p style={{ margin: 0, fontSize: '10px', color: '#94a3b8' }}>Plataforma Multi-Barberías y Autogestión</p>
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

            <select
              value={activeRole === 'cliente' ? 'cliente' : 'login_general'}
              onChange={handleCambioSeleccion}
              style={{ flex: 1, backgroundColor: '#020617', border: '1px solid #f59e0b', color: '#f8fafc', fontSize: '11px', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
            >
              <option value="cliente">📱 Vista: Cliente (Búsqueda por Código / QR)</option>
              <option value="login_general">🔐 Ingreso Administrativo / Profesional (Login)</option>
            </select>

            {usuarioAutenticado ? (
              <button
                type="button"
                onClick={handleCerrarSesion}
                style={{ backgroundColor: '#881337', color: '#fda4af', border: '1px solid #f43f5e', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Salir ({usuarioAutenticado.nombre.split(' ')[0]})
              </button>
            ) : (
              <button
                type="button"
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
            slotDuration={slotDuration}
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
              type="button"
              onClick={() => setIsLoginOpen(false)} 
              style={{ position: 'absolute', top: '12px', right: '12px', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
            >
              ✕
            </button>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid #f59e0b', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px auto' }}>
                <Lock style={{ width: '20px', height: '20px', color: '#fbbf24' }} />
              </div>
              <h3 style={{ margin: 0, color: '#fbbf24', fontSize: '18px', fontWeight: 'bold' }}>Ingreso Seguro Obligatorio</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#94a3b8' }}>Ingrese sus credenciales para continuar</p>
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
                  placeholder="Ej: admin, elkin-dev26"
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

function VistaCliente({ barberos, tenants, perfilesIndependientes, servicios, citas, setCitas, incentivos, slotDuration }) {
  const [codigoInput, setCodigoInput] = useState('');
  const [establecimientoEncontrado, setEstablecimientoEncontrado] = useState(null);
  const [errorBusqueda, setErrorBusqueda] = useState('');

  const [nombre, setNombre] = useState('');
  const [fechaNac, setFechaNac] = useState('');
  const [servicio, setServicio] = useState('');
  const hoyStr = new Date().toISOString().split('T')[0];
  const [fecha, setFecha] = useState(hoyStr);
  const [hora, setHora] = useState('08:00 AM');
  const [citaCreada, setCitaCreada] = useState(null);

  const incCumple = incentivos.find(i => i.tipo === 'cumpleanos' && i.activo);
  const horasDisponibles = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
      setCodigoInput(refCode);
      buscarPorCodigoDirecto(refCode);
    }
  }, []);

  const buscarPorCodigoDirecto = (codigo) => {
    const limpio = codigo.trim().toUpperCase();
    setErrorBusqueda('');

    const sede = tenants.find(t => t.codigoUnico.toUpperCase() === limpio);
    if (sede) {
      const barberosDeSede = barberos.filter(b => b.sedeId === sede.id && !b.pausado && !b.isLocked);
      setEstablecimientoEncontrado({
        tipo: 'sede',
        data: sede,
        barberosDisponibles: barberosDeSede,
        serviciosDisponibles: servicios
      });
      return;
    }

    const indep = perfilesIndependientes.find(pi => pi.codigoUnico.toUpperCase() === limpio && pi.estadoLicencia === 'Activa');
    if (indep) {
      setEstablecimientoEncontrado({
        tipo: 'independiente',
        data: indep,
        barberosDisponibles: [{ id: indep.id, nombre: `${indep.propietario} (${indep.nombreBarberia})`, especialidad: 'Barbero Autónomo' }],
        serviciosDisponibles: indep.serviciosPropios || []
      });
      return;
    }

    setErrorBusqueda('Código único no encontrado o inactivo. Verifique con su barbero.');
    setEstablecimientoEncontrado(null);
  };

  const handleBuscarSubmit = (e) => {
    e.preventDefault();
    buscarPorCodigoDirecto(codigoInput);
  };

  const [barberoSeleccionado, setBarberoSeleccionado] = useState('');

  useEffect(() => {
    if (establecimientoEncontrado?.barberosDisponibles?.length > 0) {
      setBarberoSeleccionado(establecimientoEncontrado.barberosDisponibles[0].nombre);
    }
    if (establecimientoEncontrado?.serviciosDisponibles?.length > 0) {
      setServicio(establecimientoEncontrado.serviciosDisponibles[0].nombre);
    }
  }, [establecimientoEncontrado]);

  const esCumpleanos = () => {
    if (!fechaNac) return false;
    const hoy = new Date();
    const nac = new Date(fechaNac);
    return hoy.getDate() === nac.getDate() && hoy.getMonth() === nac.getMonth();
  };

  const handleReserva = (e) => {
    e.preventDefault();
    if (!nombre.trim() || !barberoSeleccionado) return;
    
    const servObj = establecimientoEncontrado.serviciosDisponibles.find(s => s.nombre === servicio);
    const cumple = esCumpleanos();
    let precioFinal = servObj ? servObj.precio : 25000;

    if (cumple && incCumple) {
      precioFinal = precioFinal - ((precioFinal * (incCumple.porcentaje || 10)) / 100);
    }

    const nueva = {
      id: 'c' + Date.now(),
      cliente: nombre.trim(),
      barbero: barberoSeleccionado,
      servicio: servicio || 'Corte Estándar',
      fecha: fecha,
      hora: hora,
      precio: precioFinal,
      estado: 'confirmada',
      metodoPago: 'efectivo',
      registradoEnApp: true,
      esCumpleanos: cumple && !!incCumple,
      establecimiento: establecimientoEncontrado.data.nombreBarberia
    };

    setCitas([nueva, ...citas]);
    setCitaCreada(nueva);
    setNombre('');
  };

  if (!establecimientoEncontrado) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #f59e0b', borderRadius: '16px', padding: '24px', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid #f59e0b', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
            <Search style={{ width: '24px', height: '24px', color: '#fbbf24' }} />
          </div>
          <h2 style={{ color: '#fbbf24', fontSize: '18px', fontWeight: 'bold', margin: '0 0 8px 0' }}>Encuentra tu Barbería o Barbero</h2>
          <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 16px 0', lineHeight: '1.4' }}>
            Ingresa el **Código Único** que te proporcionó tu barbero (ej. <strong>GC-01</strong>) para agendar de forma directa.
          </p>

          <form onSubmit={handleBuscarSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              type="text"
              value={codigoInput}
              onChange={(e) => setCodigoInput(e.target.value)}
              placeholder="Ej: GC-01 o IND-01"
              style={{ backgroundColor: '#020617', border: '1px solid #f59e0b', borderRadius: '8px', padding: '12px', color: '#fff', fontSize: '14px', textAlign: 'center', fontWeight: 'bold', letterSpacing: '0.05em' }}
              required
            />
            <button
              type="submit"
              style={{ backgroundColor: '#f59e0b', color: '#020617', fontWeight: 'bold', padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px' }}
            >
              Acceder a mi Barbería
            </button>
          </form>

          {errorBusqueda && (
            <div style={{ marginTop: '12px', padding: '8px', backgroundColor: 'rgba(136, 19, 55, 0.6)', border: '1px solid #f43f5e', borderRadius: '6px', color: '#fda4af', fontSize: '11px' }}>
              {errorBusqueda}
            </div>
          )}
        </div>
      </div>
    );
  }

  const estData = establecimientoEncontrado.data;

  if (estData.enMantenimiento) {
    return (
      <div style={{ backgroundColor: '#0f172a', border: '1px solid #f59e0b', borderRadius: '16px', padding: '32px', textAlign: 'center', maxWidth: '500px', margin: '40px auto' }}>
        <Wrench style={{ width: '48px', height: '48px', color: '#fbbf24', margin: '0 auto 12px auto' }} />
        <h3 style={{ color: '#fbbf24', margin: '0 0 8px 0', fontSize: '18px' }}>¡Estamos en Mantenimiento!</h3>
        <p style={{ color: '#cbd5e1', fontSize: '13px', margin: '0 0 16px 0', lineHeight: '1.5' }}>
          La barbería <strong>{estData.nombreBarberia}</strong> se encuentra temporalmente en actualización o mantenimiento interno. Estaremos de regreso muy pronto.
        </p>
        <button
          type="button"
          onClick={() => { setEstablecimientoEncontrado(null); setCodigoInput(''); }}
          style={{ backgroundColor: '#f59e0b', color: '#020617', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
        >
          Volver a Buscar Otro Código
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(245, 158, 11, 0.2)', paddingBottom: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fbbf24', margin: 0 }}>
            📍 {estData.nombreBarberia}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '11px', margin: '2px 0 0 0' }}>
            {establecimientoEncontrado.tipo === 'sede' ? `Propietario / Admin: ${estData.dueno}` : `Barbero Solista: ${estData.propietario}`} | Código: <strong style={{ color: '#38bdf8' }}>{estData.codigoUnico}</strong>
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setEstablecimientoEncontrado(null); setCodigoInput(''); }}
          style={{ backgroundColor: '#334155', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}
        >
          Cambiar Código
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', padding: '16px' }}>
          <form onSubmit={handleReserva} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>Tu Nombre Completo</label>
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
              <div style={{ backgroundColor: 'rgba(5, 150, 105, 0.2)', border: '1px solid #059669', padding: '8px', borderRadius: '6px', color: '#34d399', fontSize: '11px' }}>
                🎉 ¡Felicidades! Recibes un {incCumple.porcentaje || 10}% de descuento de cumpleaños.
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>Barbero</label>
              <select
                value={barberoSeleccionado}
                onChange={(e) => setBarberoSeleccionado(e.target.value)}
                style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #f59e0b', borderRadius: '6px', padding: '10px', color: '#f8fafc', fontSize: '13px', fontWeight: 'bold' }}
              >
                {establecimientoEncontrado.barberosDisponibles.map(b => (
                  <option key={b.id || b.nombre} value={b.nombre}>{b.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>Servicio</label>
              <select
                value={servicio}
                onChange={(e) => setServicio(e.target.value)}
                style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '6px', padding: '10px', color: '#f8fafc', fontSize: '13px' }}
              >
                {establecimientoEncontrado.serviciosDisponibles.map(s => (
                  <option key={s.id} value={s.nombre}>{s.nombre} (${s.precio.toLocaleString()})</option>
                ))}
              </select>
            </div>

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
              <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '6px' }}>Horario ({slotDuration} min)</label>
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

            <button
              type="submit"
              style={{ backgroundColor: '#f59e0b', color: '#020617', fontWeight: 'bold', padding: '12px', borderRadius: '8px', fontSize: '13px', border: 'none', cursor: 'pointer', marginTop: '6px' }}
            >
              Confirmar Mi Cita
            </button>
          </form>
        </div>

        <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          {citaCreada ? (
            <div style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #059669', borderRadius: '10px', padding: '12px' }}>
              <CheckCircle style={{ width: '28px', height: '28px', color: '#34d399', margin: '0 auto 6px auto' }} />
              <h4 style={{ color: '#34d399', margin: '0 0 6px 0', fontSize: '14px' }}>¡Cita Reservada con Éxito!</h4>
              <div style={{ fontSize: '11px', color: '#cbd5e1', textAlign: 'left', backgroundColor: '#0f172a', padding: '8px', borderRadius: '6px', marginBottom: '8px' }}>
                <p style={{ margin: '2px 0' }}><span style={{ color: '#94a3b8' }}>Barbería:</span> {citaCreada.establecimiento}</p>
                <p style={{ margin: '2px 0' }}><span style={{ color: '#94a3b8' }}>Cliente:</span> {citaCreada.cliente}</p>
                <p style={{ margin: '2px 0' }}><span style={{ color: '#94a3b8' }}>Barbero:</span> {citaCreada.barbero}</p>
                <p style={{ margin: '2px 0' }}><span style={{ color: '#94a3b8' }}>Fecha/Hora:</span> {citaCreada.fecha} - {citaCreada.hora}</p>
              </div>
              {estData.whatsappContacto && (
                <a 
                  href={`https://wa.me/${estData.whatsappContacto}?text=${encodeURIComponent(`Hola, acabo de agendar una cita en ${estData.nombreBarberia} para el ${citaCreada.fecha} a las ${citaCreada.hora}. Mi nombre es ${citaCreada.cliente}.`)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ display: 'block', backgroundColor: '#059669', color: '#fff', textDecoration: 'none', padding: '8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}
                >
                  💬 Enviar Comprobante por WhatsApp
                </a>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <h4 style={{ color: '#fbbf24', margin: 0, fontSize: '14px' }}>Código QR de Acceso Directo</h4>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>Escanea o comparte para agendar directo.</p>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https://tu-plataforma.com?ref=${estData.codigoUnico}`}
                alt="QR Sede"
                style={{ border: '3px solid #fbbf24', borderRadius: '12px', padding: '6px', backgroundColor: '#ffffff', width: '140px', height: '140px', marginTop: '8px' }}
              />
              <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 'bold', marginTop: '4px' }}>Código: {estData.codigoUnico}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function VistaBarbero({ barberoActual, citas, setCitas, servicios, onCerrarSesion, devConfig, licenciaVencida, incentivos, tenantPrincipal, tenants }) {
  const [tab, setTab] = useState('citas');
  const misCitas = citas.filter(c => c.barbero.toLowerCase().includes(barberoActual.nombre.toLowerCase()));

  const [clienteCobro, setClienteCobro] = useState('');
  const [servicioCobro, setServicioCobro] = useState(servicios[0]?.nombre || 'Corte Clásico');
  const [metodoPago, setMetodoPago] = useState('efectivo');

  const registrarCobroDirecto = (e) => {
    e.preventDefault();
    if (!clienteCobro.trim()) return;
    const servObj = servicios.find(s => s.nombre === servicioCobro);
    const nuevoPago = {
      id: 'c' + Date.now(),
      cliente: clienteCobro.trim(),
      barbero: barberoActual.nombre,
      servicio: servicioCobro,
      fecha: new Date().toISOString().split('T')[0],
      hora: 'Instantáneo',
      precio: servObj ? servObj.precio : 25000,
      estado: 'completada',
      metodoPago: metodoPago,
      registradoEnApp: true
    };
    setCitas([nuevoPago, ...citas]);
    setClienteCobro('');
    alert('¡Cobro registrado con éxito en la caja!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(245, 158, 11, 0.2)', paddingBottom: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fbbf24', margin: 0 }}>Panel de Barbero: {barberoActual.nombre}</h2>
          <p style={{ color: '#94a3b8', fontSize: '11px', margin: '2px 0 0 0' }}>Especialidad: {barberoActual.especialidad}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {devConfig.whatsappSoporte && (
            <a 
              href={`https://wa.me/${devConfig.whatsappSoporte}?text=${encodeURIComponent(`Hola Elkin, soy el barbero ${barberoActual.nombre} y necesito soporte técnico en la plataforma.`)}`} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ backgroundColor: '#059669', color: '#fff', textDecoration: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <MessageCircle style={{ width: '14px', height: '14px' }} /> Soporte
            </a>
          )}
          <button onClick={onCerrarSesion} style={{ backgroundColor: '#881337', color: '#fda4af', border: '1px solid #f43f5e', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>
            Cerrar Sesión
          </button>
        </div>
      </div>

      {licenciaVencida && (
        <div style={{ backgroundColor: 'rgba(220, 38, 38, 0.2)', border: '1px solid #dc2626', padding: '12px', borderRadius: '8px', color: '#fca5a5', fontSize: '12px' }}>
          ⚠️ Licencia de sede suspendida o vencida. Comuníquese con soporte técnico.
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #334155', paddingBottom: '8px' }}>
        <button onClick={() => setTab('citas')} style={{ backgroundColor: tab === 'citas' ? '#f59e0b' : '#0f172a', color: tab === 'citas' ? '#020617' : '#cbd5e1', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>Mis Citas</button>
        <button onClick={() => setTab('cobro')} style={{ backgroundColor: tab === 'cobro' ? '#f59e0b' : '#0f172a', color: tab === 'cobro' ? '#020617' : '#cbd5e1', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>Cobro Rápido (Caja)</button>
      </div>

      {tab === 'citas' && (
        <div style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
          <h3 style={{ color: '#fbbf24', fontSize: '14px', margin: '0 0 8px 0' }}>Citas Asignadas</h3>
          {misCitas.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>No tienes citas registradas.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {misCitas.map(c => (
                <div key={c.id} style={{ backgroundColor: '#020617', padding: '10px', borderRadius: '8px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}>{c.cliente}</span>
                    <p style={{ color: '#94a3b8', fontSize: '10px', margin: '2px 0 0 0' }}>{c.servicio} | {c.fecha} - {c.hora} | ${c.precio?.toLocaleString()}</p>
                  </div>
                  <span style={{ backgroundColor: 'rgba(5, 150, 105, 0.2)', color: '#34d399', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>{c.estado.toUpperCase()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'cobro' && (
        <div style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)', maxWidth: '450px' }}>
          <h3 style={{ color: '#fbbf24', fontSize: '14px', margin: '0 0 10px 0' }}>Registrar Cobro de Silla / Servicio</h3>
          <form onSubmit={registrarCobroDirecto} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input type="text" placeholder="Nombre del cliente..." value={clienteCobro} onChange={(e) => setClienteCobro(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} required />
            <select value={servicioCobro} onChange={(e) => setServicioCobro(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }}>
              {servicios.map(s => <option key={s.id} value={s.nombre}>{s.nombre} (${s.precio?.toLocaleString()})</option>)}
            </select>
            <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }}>
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia Personal</option>
            </select>
            <button type="submit" style={{ backgroundColor: '#f59e0b', color: '#020617', fontWeight: 'bold', padding: '10px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>Registrar Venta</button>
          </form>
        </div>
      )}
    </div>
  );
}

function VistaBarberoIndependiente({ perfilIndependiente, setPerfilesIndependientes, perfilesIndependientes, citas, setCitas, onCerrarSesion, devConfig }) {
  const misCitasIndep = citas.filter(c => c.establecimiento === perfilIndependiente.nombreBarberia);

  const togglePausaIndep = () => {
    const actualizado = perfilesIndependientes.map(pi => pi.id === perfilIndependiente.id ? { ...pi, agendaPausada: !pi.agendaPausada } : pi);
    setPerfilesIndependientes(actualizado);
    alert('Estado de agenda independiente actualizado.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(245, 158, 11, 0.2)', paddingBottom: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fbbf24', margin: 0 }}>Panel Independiente: {perfilIndependiente.nombreBarberia}</h2>
          <p style={{ color: '#94a3b8', fontSize: '11px', margin: '2px 0 0 0' }}>Propietario: {perfilIndependiente.propietario} | Código Único: <strong style={{ color: '#38bdf8' }}>{perfilIndependiente.codigoUnico}</strong></p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {devConfig.whatsappSoporte && (
            <a 
              href={`https://wa.me/${devConfig.whatsappSoporte}?text=${encodeURIComponent(`Hola Elkin, soy el barbero independiente ${perfilIndependiente.propietario} y necesito soporte técnico en la plataforma.`)}`} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ backgroundColor: '#059669', color: '#fff', textDecoration: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <MessageCircle style={{ width: '14px', height: '14px' }} /> Soporte
            </a>
          )}
          <button onClick={onCerrarSesion} style={{ backgroundColor: '#881337', color: '#fda4af', border: '1px solid #f43f5e', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>
            Cerrar Sesión
          </button>
        </div>
      </div>

      <div style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h4 style={{ color: '#fbbf24', margin: '0 0 4px 0', fontSize: '13px' }}>Estado de Disponibilidad</h4>
          <p style={{ color: '#94a3b8', fontSize: '11px', margin: 0 }}>Pausa o habilita tu agenda personal.</p>
        </div>
        <button onClick={togglePausaIndep} style={{ backgroundColor: perfilIndependiente.agendaPausada ? '#dc2626' : '#059669', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}>
          {perfilIndependiente.agendaPausada ? 'Agenda Pausada' : 'Agenda Activa'}
        </button>
      </div>

      <div style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
        <h3 style={{ color: '#fbbf24', fontSize: '14px', margin: '0 0 8px 0' }}>Citas de mi Estudio</h3>
        {misCitasIndep.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>No hay citas agendadas.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {misCitasIndep.map(c => (
              <div key={c.id} style={{ backgroundColor: '#020617', padding: '10px', borderRadius: '8px', border: '1px solid #334155' }}>
                <span style={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}>{c.cliente} - {c.servicio}</span>
                <p style={{ color: '#94a3b8', fontSize: '10px', margin: '2px 0 0 0' }}>{c.fecha} - {c.hora} | ${c.precio?.toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function VistaAdmin({ tenantActualParaAdmin, tenantPrincipal, setTenants, tenants, citas, setCitas, barberos, setBarberos, productos, setProductos, servicios, setServicios, chairFeeConfig, setChairFeeConfig, devConfig }) {
  const tenantActivo = tenantActualParaAdmin || tenantPrincipal;
  const [tabAdmin, setTabAdmin] = useState('config');

  const [nombreNegocioInput, setNombreNegocioInput] = useState(tenantActivo.nombreBarberia);
  const [whatsappInput, setWhatsappInput] = useState(tenantActivo.whatsappContacto || '');
  const [emailInput, setEmailInput] = useState(tenantActivo.emailContacto || '');

  const [nuevoBarberoNombre, setNuevoBarberoNombre] = useState('');
  const [nuevoBarberoClave, setNuevoBarberoClave] = useState('');
  const [nuevoBarberoEsp, setNuevoBarberoEsp] = useState('');

  const [nuevoProdNombre, setNuevoProdNombre] = useState('');
  const [nuevoProdPrecio, setNuevoProdPrecio] = useState('');
  const [nuevoProdStock, setNuevoProdStock] = useState('');

  const handleGuardarCambiosAdmin = (e) => {
    e.preventDefault();
    const actualizado = tenants.map(t => t.id === tenantActivo.id ? {
      ...t,
      nombreBarberia: nombreNegocioInput.trim(),
      whatsappContacto: whatsappInput.trim(),
      emailContacto: emailInput.trim()
    } : t);
    setTenants(actualizado);
    alert('¡Ajustes de la barbería guardados correctamente!');
  };

  const agregarBarbero = (e) => {
    e.preventDefault();
    if (!nuevoBarberoNombre.trim() || !nuevoBarberoClave.trim()) return;
    const nuevoB = {
      id: 'b' + Date.now(),
      username: nuevoBarberoNombre.toLowerCase().replace(/\s+/g, ''),
      nombre: nuevoBarberoNombre.trim(),
      especialidad: nuevoBarberoEsp.trim() || 'Estilista General',
      estado: 'Activo',
      claveAcceso: nuevoBarberoClave.trim(),
      pausado: false,
      sedeId: tenantActivo.id
    };
    setBarberos([...barberos, nuevoB]);
    setNuevoBarberoNombre('');
    setNuevoBarberoClave('');
    setNuevoBarberoEsp('');
    alert('¡Barbero agregado con éxito a la sede!');
  };

  const agregarProducto = (e) => {
    e.preventDefault();
    if (!nuevoProdNombre.trim() || !nuevoProdPrecio) return;
    const prod = {
      id: 'p' + Date.now(),
      nombre: nuevoProdNombre.trim(),
      precio: Number(nuevoProdPrecio),
      stock: Number(nuevoProdStock) || 0
    };
    setProductos([...productos, prod]);
    setNuevoProdNombre('');
    setNuevoProdPrecio('');
    setNuevoProdStock('');
    alert('¡Producto agregado al inventario!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(245, 158, 11, 0.2)', paddingBottom: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#fbbf24', margin: 0 }}>Panel Administrativo ({tenantActivo?.nombreBarberia})</h2>
          <p style={{ color: '#94a3b8', fontSize: '11px', margin: '2px 0 0 0' }}>Código único: <strong style={{ color: '#38bdf8' }}>{tenantActivo.codigoUnico}</strong></p>
        </div>
        {devConfig.whatsappSoporte && (
          <a 
            href={`https://wa.me/${devConfig.whatsappSoporte}?text=${encodeURIComponent(`Hola Elkin, soy el administrador de ${tenantActivo.nombreBarberia} y deseo renovar mi membresía.`)}`} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ backgroundColor: '#059669', color: '#fff', textDecoration: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <MessageCircle style={{ width: '14px', height: '14px' }} /> Renovar Membresía
          </a>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #334155', paddingBottom: '8px', flexWrap: 'wrap' }}>
        <button onClick={() => setTabAdmin('config')} style={{ backgroundColor: tabAdmin === 'config' ? '#f59e0b' : '#0f172a', color: tabAdmin === 'config' ? '#020617' : '#cbd5e1', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>Configuración y Contacto</button>
        <button onClick={() => setTabAdmin('barberos')} style={{ backgroundColor: tabAdmin === 'barberos' ? '#f59e0b' : '#0f172a', color: tabAdmin === 'barberos' ? '#020617' : '#cbd5e1', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>Personal / Barberos</button>
        <button onClick={() => setTabAdmin('inventario')} style={{ backgroundColor: tabAdmin === 'inventario' ? '#f59e0b' : '#0f172a', color: tabAdmin === 'inventario' ? '#020617' : '#cbd5e1', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>Inventario de Productos</button>
      </div>

      {tabAdmin === 'config' && (
        <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '16px', borderRadius: '12px', maxWidth: '520px' }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#fbbf24', fontSize: '14px' }}>Ajustes y Notificaciones de Citas</h3>
          <form onSubmit={handleGuardarCambiosAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>Nombre Comercial</label>
              <input type="text" value={nombreNegocioInput} onChange={(e) => setNombreNegocioInput(e.target.value)} style={{ width: '100%', backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '12px', boxSizing: 'border-box' }} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>📱 WhatsApp para Notificaciones</label>
              <input type="text" value={whatsappInput} onChange={(e) => setWhatsappInput(e.target.value)} style={{ width: '100%', backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '12px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>✉️ Correo Electrónico</label>
              <input type="email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} style={{ width: '100%', backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '12px', boxSizing: 'border-box' }} />
            </div>
            <button type="submit" style={{ backgroundColor: '#f59e0b', color: '#020617', fontWeight: 'bold', padding: '10px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>Guardar Cambios</button>
          </form>
        </div>
      )}

      {tabAdmin === 'barberos' && (
        <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '16px', borderRadius: '12px', maxWidth: '600px' }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#fbbf24', fontSize: '14px' }}>Gestión de Barberos en la Sede</h3>
          <form onSubmit={agregarBarbero} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '8px', marginBottom: '16px' }}>
            <input type="text" placeholder="Nombre barbero..." value={nuevoBarberoNombre} onChange={(e) => setNuevoBarberoNombre(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} required />
            <input type="text" placeholder="Contraseña login" value={nuevoBarberoClave} onChange={(e) => setNuevoBarberoClave(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} required />
            <input type="text" placeholder="Especialidad" value={nuevoBarberoEsp} onChange={(e) => setNuevoBarberoEsp(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} />
            <button type="submit" style={{ backgroundColor: '#f59e0b', color: '#020617', fontWeight: 'bold', padding: '8px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '11px' }}>Agregar</button>
          </form>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {barberos.filter(b => b.sedeId === tenantActivo.id).map(b => (
              <div key={b.id} style={{ backgroundColor: '#020617', padding: '8px 12px', borderRadius: '6px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#fff' }}>{b.nombre} - <strong style={{ color: '#38bdf8' }}>{b.especialidad}</strong></span>
                <span style={{ fontSize: '11px', color: '#34d399' }}>Clave: {b.claveAcceso}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tabAdmin === 'inventario' && (
        <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '16px', borderRadius: '12px', maxWidth: '600px' }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#fbbf24', fontSize: '14px' }}>Gestión de Inventario y Productos</h3>
          <form onSubmit={agregarProducto} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 80px auto', gap: '8px', marginBottom: '16px' }}>
            <input type="text" placeholder="Nombre producto..." value={nuevoProdNombre} onChange={(e) => setNuevoProdNombre(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} required />
            <input type="number" placeholder="Precio" value={nuevoProdPrecio} onChange={(e) => setNuevoProdPrecio(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} required />
            <input type="number" placeholder="Stock" value={nuevoProdStock} onChange={(e) => setNuevoProdStock(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} required />
            <button type="submit" style={{ backgroundColor: '#f59e0b', color: '#020617', fontWeight: 'bold', padding: '8px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '11px' }}>Agregar</button>
          </form>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {productos.map(p => (
              <div key={p.id} style={{ backgroundColor: '#020617', padding: '8px 12px', borderRadius: '6px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#fff' }}>{p.nombre} - ${p.precio?.toLocaleString()}</span>
                <span style={{ fontSize: '11px', color: '#38bdf8' }}>Stock: {p.stock}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function VistaSuperAdmin({ devConfig, setDevConfig, tenants, setTenants, perfilesIndependientes, setPerfilesIndependientes, superAdminCreds }) {
  const [nombreGlobalInput, setNombreGlobalInput] = useState(devConfig.nombreGlobalPlataforma || 'SaaS Global');
  const [whatsappSoporteInput, setWhatsappSoporteInput] = useState(devConfig.whatsappSoporte || '');

  const [nuevoNombreBarberia, setNuevoNombreBarberia] = useState('');
  const [nuevoDuenoBarberia, setNuevoDuenoBarberia] = useState('');
  const [nuevoWpBarberia, setNuevoWpBarberia] = useState('');
  const [nuevoEmailBarberia, setNuevoEmailBarberia] = useState('');
  const [nuevoUserTenant, setNuevoUserTenant] = useState('');
  const [nuevoPassTenant, setNuevoPassTenant] = useState('');

  const generarCodigoSede = () => 'GC-' + Math.floor(10 + Math.random() * 90);

  const handleGuardarConfigGlobal = (e) => {
    e.preventDefault();
    const actualizado = { 
      ...devConfig, 
      nombreGlobalPlataforma: nombreGlobalInput.trim(),
      whatsappSoporte: whatsappSoporteInput.trim()
    };
    setDevConfig(actualizado);
    alert('¡Configuración global y WhatsApp del desarrollador actualizados exitosamente!');
  };

  const handleCrearTenant = (e) => {
    e.preventDefault();
    if (!nuevoNombreBarberia.trim() || !nuevoDuenoBarberia.trim() || !nuevoUserTenant.trim() || !nuevoPassTenant.trim()) return;

    const codigoGenerado = generarCodigoSede();
    const nuevaSede = {
      id: 't' + Date.now(),
      codigoUnico: codigoGenerado,
      nombreBarberia: nuevoNombreBarberia.trim(),
      dueno: nuevoDuenoBarberia.trim(),
      estadoLicencia: 'Activa',
      diasRestantes: 30,
      whatsappContacto: nuevoWpBarberia.trim() || '573001234567',
      emailContacto: nuevoEmailBarberia.trim() || 'contacto@barberia.com',
      enMantenimiento: false,
      usernameAdmin: nuevoUserTenant.trim().toLowerCase(),
      passwordAdmin: nuevoPassTenant.trim()
    };

    setTenants([...tenants, nuevaSede]);
    setNuevoNombreBarberia('');
    setNuevoDuenoBarberia('');
    setNuevoWpBarberia('');
    setNuevoEmailBarberia('');
    setNuevoUserTenant('');
    setNuevoPassTenant('');
    alert(`¡Barbería creada con éxito!\nCódigo asignado: ${codigoGenerado}`);
  };

  const toggleMantenimientoTenant = (id) => {
    setTenants(tenants.map(t => t.id === id ? { ...t, enMantenimiento: !t.enMantenimiento } : t));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ borderBottom: '1px solid rgba(245, 158, 11, 0.2)', paddingBottom: '12px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fbbf24', margin: 0 }}>
          <Server style={{ width: '20px', height: '20px', display: 'inline', marginRight: '6px' }} /> Consola Desarrollador Root ({superAdminCreds.username})
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '11px', margin: '2px 0 0 0' }}>Control global de la marca del software, soporte técnico por WhatsApp, creación de cuentas y mantenimiento.</p>
      </div>

      <div style={{ backgroundColor: '#0f172a', border: '1px solid #f59e0b', padding: '16px', borderRadius: '12px', maxWidth: '550px' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#fbbf24', fontSize: '14px' }}>🏢 Ajustes Globales de la Plataforma (SaaS)</h3>
        <form onSubmit={handleGuardarConfigGlobal} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>Nombre Global del SaaS</label>
            <input type="text" value={nombreGlobalInput} onChange={(e) => setNombreGlobalInput(e.target.value)} style={{ width: '100%', backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '12px', boxSizing: 'border-box' }} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>📱 WhatsApp del Desarrollador (Soporte)</label>
            <input type="text" value={whatsappSoporteInput} onChange={(e) => setWhatsappSoporteInput(e.target.value)} placeholder="Ej: 573001234567" style={{ width: '100%', backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '12px', boxSizing: 'border-box' }} />
          </div>
          <button type="submit" style={{ backgroundColor: '#f59e0b', color: '#020617', fontWeight: 'bold', padding: '8px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>Guardar Cambios Globales</button>
        </form>
      </div>

      <div style={{ backgroundColor: '#0f172a', border: '1px solid #3b82f6', padding: '16px', borderRadius: '12px' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#60a5fa', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <PlusSquare style={{ width: '16px', height: '16px' }} /> Crear Nueva Barbería / Sede (Código Automático)
        </h3>
        <form onSubmit={handleCrearTenant} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
          <input type="text" placeholder="Nombre comercial..." value={nuevoNombreBarberia} onChange={(e) => setNuevoNombreBarberia(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} required />
          <input type="text" placeholder="Propietario / Admin..." value={nuevoDuenoBarberia} onChange={(e) => setNuevoDuenoBarberia(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} required />
          <input type="text" placeholder="WhatsApp notificaciones" value={nuevoWpBarberia} onChange={(e) => setNuevoWpBarberia(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} />
          <input type="email" placeholder="Correo notificaciones" value={nuevoEmailBarberia} onChange={(e) => setNuevoEmailBarberia(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} />
          <input type="text" placeholder="Usuario login admin" value={nuevoUserTenant} onChange={(e) => setNuevoUserTenant(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} required />
          <input type="text" placeholder="Contraseña admin" value={nuevoPassTenant} onChange={(e) => setNuevoPassTenant(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} required />
          <button type="submit" style={{ backgroundColor: '#3b82f6', color: '#fff', fontWeight: 'bold', padding: '8px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '11px', gridColumn: '1 / -1' }}>Registrar y Generar Código Sede</button>
        </form>
      </div>

      <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '16px', borderRadius: '12px' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#fbbf24', fontSize: '14px' }}>🛠️ Control de Mantenimiento por Sede</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {tenants.map(t => (
            <div key={t.id} style={{ backgroundColor: '#020617', padding: '12px', borderRadius: '8px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span style={{ fontSize: '13px', color: '#fff', fontWeight: 'bold' }}>{t.nombreBarberia} (Código: {t.codigoUnico})</span>
                <p style={{ fontSize: '10px', color: '#94a3b8', margin: '2px 0 0 0' }}>Wp: {t.whatsappContacto || 'No registrado'} | Email: {t.emailContacto || 'No registrado'}</p>
              </div>
              <button type="button" onClick={() => toggleMantenimientoTenant(t.id)} style={{ backgroundColor: t.enMantenimiento ? '#dc2626' : '#059669', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>
                {t.enMantenimiento ? '🛠️ En Mantenimiento' : '✅ Operativo'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}