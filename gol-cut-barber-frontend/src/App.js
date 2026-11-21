import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {  
  Scissors, Lock, Smartphone, CheckCircle,  
  Gift, Award, AlertTriangle, Server, Key, PlusSquare, MessageCircle, Edit3, DollarSign, Clock
} from 'lucide-react';
import { supabase, supabaseConfigured } from './supabaseClient';

const localAuthAllowed = !supabaseConfigured && process.env.NODE_ENV !== 'production';

const requestStaffApi = async (path, options = {}) => {
  if (!supabase || !supabaseConfigured) throw new Error('La autenticación compartida no está configurada.');
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) throw new Error('La sesión expiró. Inicia sesión nuevamente.');

  const response = await fetch(path, {
    ...options,
    headers: {
      Authorization: `Bearer ${data.session.access_token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'No se pudo completar la operación.');
  return result;
};

const MENSAJE_PAUSA_SEDE = 'Lo sentimos mucho, la sede se encuentra cerrada por día libre o evento especial el día de hoy.';
const TURNOS_DISPONIBLES = { Mañana: false, Tarde: false, Noche: false };
const HORAS_DISPONIBLES = ['08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM'];
const DEFAULT_PRODUCTS = [
  { id: 'p1', nombre: 'Cera Moldear Mate Gold', precio: 30000, stock: 3 },
  { id: 'p2', nombre: 'Champú Anticaída Barba & Cabello', precio: 45000, stock: 10 }
];
const DEFAULT_SERVICES = [
  { id: 's1', nombre: 'Corte de Cabello Clásico', precio: 25000, duracion: '30 min' },
  { id: 's2', nombre: 'Barba Tradicional con Toalla Caliente', precio: 15000, duracion: '20 min' },
  { id: 's3', nombre: 'Combo Corte + Barba', precio: 35000, duracion: '45 min' }
];
const DEFAULT_INCENTIVES = [
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

const cuentaBloqueada = (cuenta) => (
  !cuenta ||
  cuenta.estadoLicencia !== 'Activa' ||
  Number(cuenta.diasRestantes) <= 0 ||
  Boolean(cuenta.bloqueadoDesarrollador)
);
const cicloDePagoVencido = (cuenta, now = Date.now()) => (
  Boolean(cuenta?.billingCycleStartedAt)
  && new Date(cuenta.billingCycleStartedAt).getTime()
    + Number(cuenta.billingCycleDays || 30) * 24 * 60 * 60 * 1000 <= now
);
const barberoBloqueado = (barbero, now = Date.now()) => (
  Boolean(
    barbero?.pausado
    || barbero?.active === false
    || (barbero?.accessBlocked ?? barbero?.isLocked)
    || cicloDePagoVencido(barbero, now)
  )
);
const diasCicloRestantes = (barbero, now = Date.now()) => {
  if (!barbero?.billingCycleStartedAt) return Number(barbero?.billingCycleDays) || 30;
  const expiresAt = new Date(barbero.billingCycleStartedAt).getTime()
    + Number(barbero.billingCycleDays || 30) * 24 * 60 * 60 * 1000;
  return Math.max(0, Math.ceil((expiresAt - now) / (24 * 60 * 60 * 1000)));
};
const fechaLocalIso = (date = new Date()) => (
  new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
);

export default function App() {
  const [activeRole, setActiveRole] = useState('cliente');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [usuarioAutenticado, setUsuarioAutenticado] = useState(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [tenantVistaDesarrolladorId, setTenantVistaDesarrolladorId] = useState(null);
  const [perfilVistaDesarrolladorId, setPerfilVistaDesarrolladorId] = useState(null);
  const platformSettingsRevision = useRef(0);

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const [slotDuration, setSlotDuration] = useState(() => {
    const saved = localAuthAllowed ? localStorage.getItem('gol_cut_slot_duration') : null;
    return saved ? Number(saved) : 30;
  });
  const [chairFeeConfig, setChairFeeConfig] = useState(() => {
    const guardado = localAuthAllowed ? localStorage.getItem('chairFeeConfig') : null;
    return guardado ? JSON.parse(guardado) : { tipo: 'fijo', valor: 50000 };
  });

  const [credencialesAdmin, setCredencialesAdmin] = useState({
    username: 'admin',
    password: 'admin123',
    nombre: 'Administrador Local'
  });

  const [superAdminCreds, setSuperAdminCreds] = useState(() => {
    const guardado = localAuthAllowed ? localStorage.getItem('gol_cut_superadmin_creds') : null;
    return guardado ? JSON.parse(guardado) : { username: 'elkin-dev26', password: 'elkin2026', nombre: 'SuperAdmin / Desarrollador' };
  });

  useEffect(() => {
    if (!localAuthAllowed) return;
    localStorage.setItem('gol_cut_superadmin_creds', JSON.stringify(superAdminCreds));
  }, [superAdminCreds]);

  const [devConfig, setDevConfig] = useState(() => {
    const guardado = localStorage.getItem('gol_cut_dev_config');
    return guardado ? JSON.parse(guardado) : {
      nombrePlataforma: 'GOL CUT BARBER',
      whatsappSoporte: '573001234567',
      mensajeRenovacion: 'Hola Elkin, deseo renovar mi membresía mensual de Gol Cut Barber.',
    };
  });
  const [platformSettingsError, setPlatformSettingsError] = useState('');

  useEffect(() => {
    if (supabaseConfigured) return;
    localStorage.setItem('gol_cut_dev_config', JSON.stringify(devConfig));
  }, [devConfig]);

  useEffect(() => {
    document.title = devConfig.nombrePlataforma || 'GOL CUT BARBER';
  }, [devConfig.nombrePlataforma]);

  useEffect(() => {
    if (!supabaseConfigured) return;
    const revisionAtRequest = platformSettingsRevision.current;
    fetch('/api/public/settings')
      .then(async response => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'No se pudo cargar la configuración de plataforma.');
        return result.settings;
      })
      .then(settings => {
        if (revisionAtRequest !== platformSettingsRevision.current) return;
        setDevConfig(current => ({
          ...current,
          nombrePlataforma: settings.platform_name,
          whatsappSoporte: settings.support_whatsapp,
          mensajeRenovacion: settings.renewal_message
        }));
      })
      .catch(error => {
        if (revisionAtRequest === platformSettingsRevision.current) {
          setPlatformSettingsError(error.message);
        }
      });
  }, []);

  const guardarConfiguracionPlataforma = useCallback((settings) => {
    platformSettingsRevision.current += 1;
    setDevConfig(current => ({
      ...current,
      nombrePlataforma: settings.platform_name,
      whatsappSoporte: settings.support_whatsapp,
      mensajeRenovacion: settings.renewal_message
    }));
  }, []);

  const [incentivos, setIncentivos] = useState(() => {
    const guardado = localAuthAllowed ? localStorage.getItem('gol_cut_incentivos') : null;
    if (guardado) return JSON.parse(guardado);
    return DEFAULT_INCENTIVES;
  });

  useEffect(() => {
    if (!localAuthAllowed) return;
    localStorage.setItem('gol_cut_incentivos', JSON.stringify(incentivos));
  }, [incentivos]);

  useEffect(() => {
    if (!localAuthAllowed) return;
    localStorage.setItem('chairFeeConfig', JSON.stringify(chairFeeConfig));
  }, [chairFeeConfig]);

  useEffect(() => {
    if (!localAuthAllowed) return;
    localStorage.setItem('gol_cut_slot_duration', String(slotDuration));
  }, [slotDuration]);

  const [tenants, setTenants] = useState(() => {
    const guardado = localAuthAllowed ? localStorage.getItem('gol_cut_tenants') : null;
    if (guardado) return JSON.parse(guardado);
    return [
      { 
        id: 't1', 
        codigoPublico: 't1',
        nombreBarberia: 'Gol Cut Barber - Sede Principal', 
        nombreAnterior: 'Gol Cut Barber Inicial', 
        dueno: 'Elkin Ramírez', 
        estadoLicencia: 'Activa', 
        bloqueadoDesarrollador: false,
        agendaPausada: false,
        mensajePausaGeneral: MENSAJE_PAUSA_SEDE,
        globalTimer: { ...TURNOS_DISPONIBLES },
        diasRestantes: 28, 
        whatsappContacto: '573001234567',
        usernameAdmin: 'admin',
        passwordAdmin: 'admin123'
      },
      { 
        id: 't2', 
        codigoPublico: 't2',
        nombreBarberia: 'Barbería Mijares', 
        nombreAnterior: 'Barbería SENA', 
        dueno: 'Mijares Admin', 
        estadoLicencia: 'Activa', 
        bloqueadoDesarrollador: false,
        agendaPausada: false,
        mensajePausaGeneral: MENSAJE_PAUSA_SEDE,
        globalTimer: { ...TURNOS_DISPONIBLES },
        diasRestantes: 30, 
        whatsappContacto: '573009876543',
        usernameAdmin: 'mijares',
        passwordAdmin: 'mijares2026'
      }
    ];
  });

  useEffect(() => {
    if (!localAuthAllowed) return;
    localStorage.setItem('gol_cut_tenants', JSON.stringify(tenants));
  }, [tenants]);

  const [barberos, setBarberos] = useState(() => {
    const guardado = localAuthAllowed ? localStorage.getItem('gol_cut_barberos') : null;
    if (guardado) return JSON.parse(guardado);
    return [
      { id: 'b1', username: 'elkin', nombre: 'Elkin Ramírez', especialidad: 'Estilista Profesional', estado: 'Activo', claveAcceso: 'barbero123', pausado: false, mensajePausa: 'Elkin no laborará este día por motivos personales.', billingCycleDays: 30, billingCycleStartedAt: new Date().toISOString(), isLocked: false, sedeId: 't1' },
      { id: 'b2', username: 'mateo', nombre: 'Mateo Gómez', especialidad: 'Barbero Senior', estado: 'Activo', claveAcceso: 'mateo2026', pausado: false, mensajePausa: 'Mateo se encuentra en evento especial hoy.', billingCycleDays: 30, billingCycleStartedAt: new Date().toISOString(), isLocked: false, sedeId: 't1' },
      { id: 'b3', username: 'carlos', nombre: 'Carlos Mijares', especialidad: 'Master Barber', estado: 'Activo', claveAcceso: 'carlos2026', pausado: false, mensajePausa: 'Carlos descansa hoy.', billingCycleDays: 30, billingCycleStartedAt: new Date().toISOString(), isLocked: false, sedeId: 't2' }
    ];
  });

  useEffect(() => {
    if (!localAuthAllowed) return;
    localStorage.setItem('gol_cut_barberos', JSON.stringify(barberos));
  }, [barberos]);

  const [perfilesIndependientes, setPerfilesIndependientes] = useState(() => {
    const guardado = localAuthAllowed ? localStorage.getItem('gol_cut_perfiles_independientes') : null;
    if (guardado) return JSON.parse(guardado);
    const antiguo = localAuthAllowed ? localStorage.getItem('perfilIndependiente') : null;
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
        bloqueadoDesarrollador: false,
        billingCycleDays: 30,
        billingCycleStartedAt: new Date().toISOString(),
        accessBlocked: false,
        codigoPublico: 'indep_tenant',
        diasRestantes: 30,
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
    if (!localAuthAllowed) return;
    localStorage.setItem('gol_cut_perfiles_independientes', JSON.stringify(perfilesIndependientes));
  }, [perfilesIndependientes]);

  const [productos, setProductos] = useState(() => {
    const saved = localAuthAllowed ? localStorage.getItem('gol_cut_products') : null;
    return saved ? JSON.parse(saved) : DEFAULT_PRODUCTS;
  });

  const [servicios, setServicios] = useState(() => {
    const saved = localAuthAllowed ? localStorage.getItem('gol_cut_services') : null;
    return saved ? JSON.parse(saved) : DEFAULT_SERVICES;
  });

  useEffect(() => {
    if (!localAuthAllowed) return;
    localStorage.setItem('gol_cut_products', JSON.stringify(productos));
  }, [productos]);

  useEffect(() => {
    if (!localAuthAllowed) return;
    localStorage.setItem('gol_cut_services', JSON.stringify(servicios));
  }, [servicios]);

  const [citas, setCitas] = useState(() => {
    const saved = localAuthAllowed ? localStorage.getItem('gol_cut_citas_mes') : null;
    const lastReset = localAuthAllowed ? localStorage.getItem('gol_cut_last_reset') : null;
    if (!localAuthAllowed) return [];
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
    if (!localAuthAllowed) return;
    localStorage.setItem('gol_cut_citas_mes', JSON.stringify(citas));
  }, [citas]);

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const tenantPrincipal = tenants[0]; 
  const tenantActualParaAdmin = tenants.find(t => t.id === usuarioAutenticado?.tenantObj?.id)
    || tenants.find(t => t.id === tenantVistaDesarrolladorId)
    || tenantPrincipal;
  const [loadedSettingsTenantId, setLoadedSettingsTenantId] = useState(null);
  const [loadedIndependentSettingsId, setLoadedIndependentSettingsId] = useState(null);
  const [tenantSettingsError, setTenantSettingsError] = useState('');
  const settingsSaveQueue = useRef(Promise.resolve());

  useEffect(() => {
    const independentId = activeRole === 'barbero_independiente'
      ? usuarioAutenticado?.perfilIndepObj?.id || perfilVistaDesarrolladorId
      : null;
    const tenantId = activeRole === 'admin'
      ? tenantActualParaAdmin?.id
      : independentId
        ? usuarioAutenticado?.perfilIndepObj?.sedeId || independentId
        : null;
    if (!supabaseConfigured || !tenantId) {
      setLoadedSettingsTenantId(null);
      setLoadedIndependentSettingsId(null);
      return undefined;
    }

    let active = true;
    setLoadedSettingsTenantId(null);
    setLoadedIndependentSettingsId(null);
    requestStaffApi(`/api/tenants/settings?id=${encodeURIComponent(tenantId)}`)
      .then(result => {
        if (!active) return;
        const settings = result.settings || {};
        if (independentId) {
          const ownServices = settings.independentServices?.[independentId];
          setPerfilesIndependientes(current => current.map(profile => profile.id === independentId ? {
            ...profile,
            serviciosPropios: Array.isArray(ownServices) ? ownServices : []
          } : profile));
          setLoadedIndependentSettingsId(independentId);
          setTenantSettingsError('');
          return;
        }
        setProductos(Array.isArray(settings.products) ? settings.products : DEFAULT_PRODUCTS);
        setServicios(Array.isArray(settings.services) ? settings.services : DEFAULT_SERVICES);
        setIncentivos(Array.isArray(settings.incentives) ? settings.incentives : DEFAULT_INCENTIVES);
        if (settings.chairFeeConfig && typeof settings.chairFeeConfig === 'object') {
          setChairFeeConfig(settings.chairFeeConfig);
        } else {
          setChairFeeConfig({ tipo: 'fijo', valor: 50000 });
        }
        setSlotDuration([30, 60].includes(Number(settings.slotDuration)) ? Number(settings.slotDuration) : 30);
        setTenantSettingsError('');
        setLoadedSettingsTenantId(tenantId);
      })
      .catch(error => {
        if (!active) return;
        setTenantSettingsError(error.message || 'No se pudo cargar la configuración de la sede.');
      });
    return () => {
      active = false;
    };
  }, [activeRole, tenantActualParaAdmin?.id, usuarioAutenticado?.perfilIndepObj?.id, usuarioAutenticado?.perfilIndepObj?.sedeId, perfilVistaDesarrolladorId]);

  useEffect(() => {
    const tenantId = tenantActualParaAdmin?.id;
    if (!supabaseConfigured || activeRole !== 'admin' || !tenantId || loadedSettingsTenantId !== tenantId) return undefined;

    const settings = {
      products: productos,
      services: servicios,
      incentives: incentivos,
      chairFeeConfig,
      slotDuration
    };
    const timer = window.setTimeout(() => {
      settingsSaveQueue.current = settingsSaveQueue.current
        .catch(() => {})
        .then(() => requestStaffApi('/api/tenants/settings', {
          method: 'PATCH',
          body: JSON.stringify({ id: tenantId, settings })
        }))
        .then(() => setTenantSettingsError(''))
        .catch(error => setTenantSettingsError(error.message || 'No se pudieron guardar los cambios de la sede.'));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [activeRole, tenantActualParaAdmin?.id, loadedSettingsTenantId, productos, servicios, incentivos, chairFeeConfig, slotDuration]);

  const perfilIndependienteActual = perfilesIndependientes.find(pi => pi.id === usuarioAutenticado?.perfilIndepObj?.id)
    || perfilesIndependientes.find(pi => pi.id === perfilVistaDesarrolladorId)
    || perfilesIndependientes[0];
  const sedeBarberoAutenticado = tenants.find(t => t.id === usuarioAutenticado?.barberoObj?.sedeId) || tenantPrincipal;
  const cuentaSesion = usuarioAutenticado?.tenantObj
    ? tenants.find(t => t.id === usuarioAutenticado.tenantObj.id)
    : usuarioAutenticado?.perfilIndepObj
      ? perfilesIndependientes.find(pi => pi.id === usuarioAutenticado.perfilIndepObj.id)
      : usuarioAutenticado?.barberoObj
        ? tenants.find(t => t.id === usuarioAutenticado.barberoObj.sedeId)
        : null;
  const cuentaSesionBloqueada = Boolean(usuarioAutenticado && usuarioAutenticado.role !== 'superadmin' && (
    usuarioAutenticado.cuentaSuspendida
    || (usuarioAutenticado.barberoObj && (
      barberoBloqueado(usuarioAutenticado.barberoObj, currentTime)
    ))
    || (usuarioAutenticado.perfilIndepObj && (
      barberoBloqueado(usuarioAutenticado.perfilIndepObj, currentTime)
    ))
    || (cuentaSesion && cuentaBloqueada(cuentaSesion))
  ));
  const independentSettingsId = activeRole === 'barbero_independiente'
    ? perfilIndependienteActual?.id
    : null;
  const independentSettingsTenantId = independentSettingsId
    ? usuarioAutenticado?.perfilIndepObj?.sedeId || independentSettingsId
    : null;
  const independentServices = useMemo(() => (
    independentSettingsId
      ? perfilesIndependientes.find(profile => profile.id === independentSettingsId)?.serviciosPropios || []
      : []
  ), [independentSettingsId, perfilesIndependientes]);

  useEffect(() => {
    if (!supabaseConfigured
      || !independentSettingsId
      || !independentSettingsTenantId
      || loadedIndependentSettingsId !== independentSettingsId
    ) return undefined;

    const settings = { independentServices: { [independentSettingsId]: independentServices } };
    const timer = window.setTimeout(() => {
      settingsSaveQueue.current = settingsSaveQueue.current
        .catch(() => {})
        .then(() => requestStaffApi('/api/tenants/settings', {
          method: 'PATCH',
          body: JSON.stringify({ id: independentSettingsTenantId, settings })
        }))
        .then(() => setTenantSettingsError(''))
        .catch(error => setTenantSettingsError(error.message || 'No se pudieron guardar los servicios del perfil independiente.'));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [independentSettingsId, independentSettingsTenantId, independentServices, loadedIndependentSettingsId]);

  const exitoLogin = useCallback((userObj) => {
    setUsuarioAutenticado(userObj);
    setTenantVistaDesarrolladorId(null);
    setPerfilVistaDesarrolladorId(null);
    setActiveRole(userObj.role);
    setIsLoginOpen(false);
    setUsernameInput('');
    setPasswordInput('');
  }, []);

  const crearCitaDesdePanel = useCallback(async (appointment, entityId) => {
    if (supabaseConfigured) {
      if (!entityId) throw new Error('No se pudo identificar al barbero para guardar el registro.');
      await requestStaffApi('/api/appointments/create', {
        method: 'POST',
        body: JSON.stringify({
          appointmentId: appointment.id,
          entityId,
          customerName: appointment.cliente,
          serviceName: appointment.servicio,
          appointmentDate: appointment.fecha,
          appointmentTime: appointment.hora,
          price: appointment.precio
        })
      });
    }
    setCitas(current => [{ ...appointment, bookingEntityId: entityId }, ...current]);
  }, []);

  const actualizarCitaPersistida = useCallback(async (appointmentId, changes) => {
    if (supabaseConfigured) {
      const payload = { appointmentId };
      if (changes.estado !== undefined) payload.status = changes.estado;
      if (changes.bookingEntityId !== undefined) payload.bookingEntityId = changes.bookingEntityId;
      if (changes.motivoCancelacion !== undefined) payload.cancellationReason = changes.motivoCancelacion;
      await requestStaffApi('/api/appointments/update', {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });
    }
    setCitas(current => current.map(appointment => (
      appointment.id === appointmentId ? { ...appointment, ...changes } : appointment
    )));
  }, []);

  const eliminarCitaPersistida = useCallback(async (appointmentId) => {
    if (supabaseConfigured) {
      await requestStaffApi(`/api/appointments/update?id=${encodeURIComponent(appointmentId)}`, {
        method: 'DELETE'
      });
    }
    setCitas(current => current.filter(appointment => appointment.id !== appointmentId));
  }, []);

  const iniciarSesionDeCuenta = useCallback((userObj, cuenta, nombreCuenta) => {
    if (cuentaBloqueada(cuenta)) {
      exitoLogin({ ...userObj, role: 'cuenta_bloqueada', cuentaSuspendida: true, cuentaNombre: nombreCuenta });
      return;
    }
    exitoLogin(userObj);
  }, [exitoLogin]);

  const cargarSesionSupabase = useCallback(async (session) => {
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id,role,display_name,username,tenant_id,entity_id,disabled_at')
      .eq('id', session.user.id)
      .maybeSingle();
    if (profileError) throw profileError;
    if (!profile) throw new Error('Tu cuenta no tiene un perfil de acceso configurado. Contacta al desarrollador.');
    if (profile.disabled_at) throw new Error('Esta cuenta fue desactivada por el desarrollador.');

    const isDeveloper = profile.role === 'developer';
    const tenantQuery = isDeveloper
      ? supabase.from('tenants').select('*').order('created_at')
      : supabase.from('tenants').select('*').eq('id', profile.tenant_id).maybeSingle();
    const { data: tenantData, error: tenantError } = await tenantQuery;
    if (tenantError) throw tenantError;
    const tenantRows = isDeveloper ? tenantData || [] : tenantData ? [tenantData] : [];
    if (!isDeveloper && tenantRows.length === 0) {
      throw new Error('La barbería vinculada a esta cuenta no existe en Supabase.');
    }

    const entityQuery = supabase.from('booking_entities').select('*');
    const scopedEntityQuery = isDeveloper
      ? entityQuery
      : profile.role === 'admin'
        ? entityQuery.eq('tenant_id', profile.tenant_id)
        : entityQuery.eq('id', profile.entity_id);
    const { data: entityRows, error: entityError } = await scopedEntityQuery;
    if (entityError) throw entityError;

    const { data: staffProfiles, error: staffError } = await supabase
      .from('user_profiles')
      .select('id,role,display_name,username,tenant_id,entity_id,disabled_at');
    if (staffError) throw staffError;
    const profilesByUserId = new Map((staffProfiles || []).map(item => [item.id, item]));
    const mapTenant = (tenant) => ({
      id: tenant.id,
      codigoPublico: tenant.public_code,
      nombreBarberia: tenant.name,
      estadoLicencia: tenant.license_status === 'active' ? 'Activa' : 'Pausada',
      bloqueadoDesarrollador: tenant.developer_blocked,
      diasRestantes: tenant.license_status === 'active' ? 30 : 0,
      agendaPausada: false,
      mensajePausaGeneral: MENSAJE_PAUSA_SEDE,
      globalTimer: { ...TURNOS_DISPONIBLES },
      bookingBlackouts: tenant.booking_blackouts || [],
      authUserId: (staffProfiles || []).find(item => item.role === 'admin' && item.tenant_id === tenant.id)?.id,
      accessDisabled: Boolean((staffProfiles || []).find(item => item.role === 'admin' && item.tenant_id === tenant.id)?.disabled_at)
    });
    const mappedTenants = tenantRows.map(mapTenant);
    const mappedEntities = (entityRows || []).map(entity => {
      const staff = profilesByUserId.get(entity.user_id);
      return {
        id: entity.id,
        entityId: entity.id,
        username: staff?.username || staff?.display_name || entity.name,
        nombre: entity.name,
        propietario: staff?.display_name || entity.name,
        nombreBarberia: entity.name,
        especialidad: 'Barbero Profesional',
        estado: 'Activo',
        pausado: !entity.active,
        accessBlocked: entity.access_blocked,
        authUserId: entity.user_id,
        accessDisabled: Boolean(staff?.disabled_at),
        isLocked: entity.access_blocked
          || cicloDePagoVencido({
            billingCycleStartedAt: entity.billing_cycle_started_at,
            billingCycleDays: entity.billing_cycle_days
          }),
        billingCycleDays: Number(entity.billing_cycle_days) || 30,
        billingCycleStartedAt: entity.billing_cycle_started_at,
        claveAcceso: '',
        sedeId: entity.tenant_id,
        esIndependiente: entity.entity_type === 'independent'
      };
    });

    setTenants(mappedTenants);
    setBarberos(mappedEntities.filter(entity => !entity.esIndependiente));
    setPerfilesIndependientes(mappedEntities.filter(entity => entity.esIndependiente).map(entity => ({
      ...entity,
      nombreBarberia: entity.nombre,
      propietario: entity.propietario,
      serviciosPropios: []
    })));

    const appointmentQuery = supabase.from('appointments').select('*').order('created_at', { ascending: false });
    const scopedAppointments = isDeveloper
      ? appointmentQuery
      : profile.role === 'admin'
        ? appointmentQuery.eq('tenant_id', profile.tenant_id)
        : appointmentQuery.eq('booking_entity_id', profile.entity_id);
    const { data: appointmentRows, error: appointmentError } = await scopedAppointments;
    if (appointmentError) throw appointmentError;
    const entityNames = new Map(mappedEntities.map(entity => [entity.id, entity.nombre]));
    setCitas((appointmentRows || []).map(appointment => ({
      id: appointment.id,
      cliente: appointment.customer_name,
      barbero: entityNames.get(appointment.booking_entity_id) || 'Barbero',
      servicio: appointment.service_name,
      fecha: appointment.appointment_date,
      hora: appointment.appointment_time,
      precio: Number(appointment.price),
      estado: appointment.status === 'completed' ? 'completada' : appointment.status === 'cancelled' ? 'cancelada' : 'confirmada',
      metodoPago: 'efectivo',
      establecimientoId: appointment.tenant_id,
      bookingEntityId: appointment.booking_entity_id,
      registradoEnApp: true,
      motivoCancelacion: appointment.cancellation_reason || null
    })));

    if (profile.role === 'developer') {
      exitoLogin({
        id: profile.id,
        username: profile.username || session.user.email,
        nombre: profile.display_name,
        role: 'superadmin'
      });
      return;
    }

    const tenant = mappedTenants.find(item => item.id === profile.tenant_id);
    if (tenant && cuentaBloqueada(tenant)) {
      const localRole = profile.role === 'barber' ? 'barbero' : profile.role === 'independent' ? 'barbero_independiente' : 'admin';
      iniciarSesionDeCuenta({
        id: profile.id,
        username: profile.username || session.user.email,
        nombre: profile.display_name,
        role: localRole
      }, tenant, tenant.nombreBarberia);
      return;
    }

    const entity = mappedEntities.find(item => item.id === profile.entity_id);
    if (['barber', 'independent'].includes(profile.role) && entity && (!entity.active || entity.isLocked)) {
      const localRole = profile.role === 'barber' ? 'barbero' : 'barbero_independiente';
      const entityUser = profile.role === 'barber'
        ? { barberoObj: entity }
        : { perfilIndepObj: entity };
      iniciarSesionDeCuenta({
        id: profile.id,
        username: profile.username || session.user.email,
        nombre: profile.display_name,
        role: localRole,
        ...entityUser
      }, { estadoLicencia: 'Pausada', diasRestantes: 0 }, tenant?.nombreBarberia || 'la barbería');
      return;
    }
    if (profile.role === 'admin') {
      iniciarSesionDeCuenta({
        id: profile.id,
        username: profile.username || session.user.email,
        nombre: profile.display_name,
        role: 'admin',
        tenantObj: tenant
      }, tenant, tenant.nombreBarberia);
    } else if (profile.role === 'barber' && entity) {
      iniciarSesionDeCuenta({
        id: profile.id,
        username: profile.username || session.user.email,
        nombre: profile.display_name,
        role: 'barbero',
        barberoObj: entity
      }, tenant, tenant.nombreBarberia);
    } else if (profile.role === 'independent' && entity) {
      iniciarSesionDeCuenta({
        id: profile.id,
        username: profile.username || session.user.email,
        nombre: profile.display_name,
        role: 'barbero_independiente',
        perfilIndepObj: entity
      }, tenant, tenant.nombreBarberia);
    } else {
      throw new Error('El perfil no tiene un establecimiento o barbero asociado.');
    }
  }, [exitoLogin, iniciarSesionDeCuenta]);

  useEffect(() => {
    if (!supabaseConfigured || !supabase) return undefined;
    let active = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) {
        setLoginError('No se pudo restaurar la sesión. Inicia sesión nuevamente.');
        return;
      }
      if (data.session) {
        cargarSesionSupabase(data.session).catch(async (sessionError) => {
          if (!active) return;
          setLoginError(sessionError.message || 'No se pudo cargar el perfil de acceso.');
          const { error: signOutError } = await supabase.auth.signOut();
          if (signOutError) console.error('Could not clear invalid Supabase session:', signOutError.message);
          setIsLoginOpen(true);
        });
      }
    });
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' && active) {
        setUsuarioAutenticado(null);
        setActiveRole('cliente');
      }
    });
    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, [cargarSesionSupabase]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    const u = usernameInput.trim().toLowerCase();
    const p = passwordInput;

    if (supabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email: u, password: p });
        if (error) throw error;
        await cargarSesionSupabase(data.session);
      } catch (error) {
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) console.error('Could not clear failed Supabase session:', signOutError.message);
        setLoginError(error.message || 'No se pudo iniciar sesión.');
      }
      return;
    }

    if (!localAuthAllowed) {
      setLoginError('La autenticación segura no está configurada en esta versión. Contacta al administrador.');
      return;
    }

    const localPassword = p.trim();
    if (u === superAdminCreds.username.toLowerCase() && localPassword === superAdminCreds.password) {
      exitoLogin({ username: superAdminCreds.username, nombre: superAdminCreds.nombre, role: 'superadmin' });
      return;
    }

    const tenantEncontrado = tenants.find(t => (t.usernameAdmin || 'admin').toLowerCase() === u && (t.passwordAdmin || 'admin123') === localPassword);
    if (tenantEncontrado || (u === credencialesAdmin.username.toLowerCase() && localPassword === credencialesAdmin.password)) {
      const tObj = tenantEncontrado || tenantPrincipal;
      const usuarioAdmin = { username: tObj.usernameAdmin || credencialesAdmin.username, nombre: `Administrador (${tObj.nombreBarberia})`, role: 'admin', tenantObj: tObj };
      iniciarSesionDeCuenta(usuarioAdmin, tObj, tObj.nombreBarberia);
      return;
    }

    const indepEncontrado = perfilesIndependientes.find(pi => pi.username.toLowerCase() === u && pi.clave === localPassword);
    if (indepEncontrado) {
      const usuarioIndependiente = { username: indepEncontrado.username, nombre: indepEncontrado.propietario, role: 'barbero_independiente', perfilIndepObj: indepEncontrado };
      iniciarSesionDeCuenta(usuarioIndependiente, indepEncontrado, indepEncontrado.nombreBarberia);
      return;
    }

    const barberoEncontrado = barberos.find(b => b.username.toLowerCase() === u && b.claveAcceso === localPassword);

    if (barberoEncontrado) {
      if (barberoEncontrado.estado === 'Inactivo') {
        setLoginError('Su usuario se encuentra inactivo.');
        return;
      }
      if (barberoBloqueado(barberoEncontrado)) {
        setLoginError('La cuenta está bloqueada. Solo el administrador puede volver a activarla.');
        return;
      }
      const usuarioBarbero = {
        username: barberoEncontrado.username, 
        nombre: barberoEncontrado.nombre, 
        role: 'barbero',
        barberoObj: barberoEncontrado
      };
      const sedeBarbero = tenants.find(t => t.id === barberoEncontrado.sedeId);
      iniciarSesionDeCuenta(usuarioBarbero, sedeBarbero, sedeBarbero?.nombreBarberia || 'la barbería');
      return;
    }

    setLoginError('Credenciales incorrectas. Verifique usuario y contraseña.');
  };

  const handleCerrarSesion = () => {
    if (supabaseConfigured && supabase) {
      supabase.auth.signOut().then(({ error }) => {
        if (error) setLoginError('No se pudo cerrar la sesión de forma segura.');
      });
    }
    setUsuarioAutenticado(null);
    setTenantVistaDesarrolladorId(null);
    setPerfilVistaDesarrolladorId(null);
    setActiveRole('cliente');
  };

  const handleCambioSeleccion = (e) => {
    const val = e.target.value;
     
    if (val === 'cliente') {
      if (cuentaSesionBloqueada) return;
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
                {(devConfig.nombrePlataforma || 'GOL CUT BARBER').toUpperCase()}
              </h1>
              <p style={{ margin: 0, fontSize: '10px', color: '#94a3b8' }}>Gestión, Agenda y Control SaaS</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', width: '100%', justifyContent: 'space-between', maxWidth: '720px' }}>
            {!cuentaSesionBloqueada && (
              <>
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
              <option value="cliente">📱 Vista: Cliente (Reservas / Móvil)</option>
              <option value="login_general">🔐 Ingreso Administrativo / Profesional (Login)</option>
            </select>
              </>
            )}

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

      {(platformSettingsError || tenantSettingsError || (!supabaseConfigured && process.env.NODE_ENV === 'production' && 'Configura Supabase antes de habilitar los inicios de sesión en producción.')) && (
        <div role="alert" style={{ backgroundColor: '#7f1d1d', color: '#fecaca', padding: '8px 16px', fontSize: '12px', textAlign: 'center' }}>
          {platformSettingsError || tenantSettingsError || 'Configura Supabase antes de habilitar los inicios de sesión en producción.'}
        </div>
      )}

      <main style={{ maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '16px', flex: 1, boxSizing: 'border-box' }}>
        {cuentaSesionBloqueada ? (
          <VistaCuentaBloqueada usuario={usuarioAutenticado} devConfig={devConfig} onCerrarSesion={handleCerrarSesion} />
        ) : (
          <>
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
            devConfig={devConfig}
          />
        )}

        {activeRole === 'barbero' && (
          <VistaBarbero 
            barberoActual={usuarioAutenticado?.barberoObj || barberos[0]} 
            citas={citas} 
            onCrearCita={crearCitaDesdePanel}
            onActualizarCita={actualizarCitaPersistida}
            onEliminarCita={eliminarCitaPersistida}
            servicios={servicios} 
            onCerrarSesion={handleCerrarSesion} 
            devConfig={devConfig}
            licenciaVencida={cuentaBloqueada(sedeBarberoAutenticado)}
            incentivos={incentivos}
            activeRole={activeRole}
            tenantPrincipal={tenantPrincipal}
            tenants={tenants}
          />
        )}

        {activeRole === 'barbero_independiente' && (
          <VistaBarberoIndependiente 
            perfilIndependiente={perfilIndependienteActual}
            setPerfilesIndependientes={setPerfilesIndependientes}
            perfilesIndependientes={perfilesIndependientes}
            citas={citas}
            onCrearCita={crearCitaDesdePanel}
            onActualizarCita={actualizarCitaPersistida}
            onEliminarCita={eliminarCitaPersistida}
            onCerrarSesion={handleCerrarSesion}
            devConfig={devConfig}
            activeRole={activeRole}
          />
        )}

        {(activeRole === 'admin' || usuarioAutenticado?.role === 'admin') && (
          <VistaAdmin 
            usuario={usuarioAutenticado || { nombre: 'Administrador' }} 
            tenantActualParaAdmin={tenantActualParaAdmin}
            citas={citas} 
            onActualizarCita={actualizarCitaPersistida}
            onEliminarCita={eliminarCitaPersistida}
            currentTime={currentTime}
            barberos={barberos} 
            setBarberos={setBarberos} 
            productos={productos}
            setProductos={setProductos}
            servicios={servicios}
            setServicios={setServicios}
            devConfig={devConfig}
            licenciaVencida={usuarioAutenticado?.role === 'superadmin' ? false : cuentaBloqueada(tenantActualParaAdmin)}
            incentivos={incentivos}
            setIncentivos={setIncentivos}
            credencialesAdmin={credencialesAdmin}
            setCredencialesAdmin={setCredencialesAdmin}
            tenantPrincipal={tenantPrincipal}
            setTenants={setTenants}
            tenants={tenants}
            agendaPausadaSede={(tenantActualParaAdmin?.bookingBlackouts || []).some(blackout => (
              blackout.date === fechaLocalIso() && blackout.shift === 'Día completo'
            ))}
            bookingBlackouts={tenantActualParaAdmin?.bookingBlackouts || []}
            setBookingBlackouts={async (bookingBlackouts) => {
              if (supabaseConfigured) {
                await requestStaffApi('/api/tenants/update', {
                  method: 'PATCH',
                  body: JSON.stringify({ id: tenantActualParaAdmin?.id, bookingBlackouts })
                });
              }
              setTenants(actuales => actuales.map(t => t.id === tenantActualParaAdmin?.id ? { ...t, bookingBlackouts } : t));
            }}
            chairFeeConfig={chairFeeConfig}
            setChairFeeConfig={setChairFeeConfig}
          />
        )}

        {activeRole === 'superadmin' && (
          <VistaSuperAdmin 
            currentTime={currentTime}
            devConfig={devConfig} 
            setDevConfig={setDevConfig}
            guardarConfiguracionPlataforma={guardarConfiguracionPlataforma}
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
            setTenantVistaDesarrolladorId={setTenantVistaDesarrolladorId}
            setPerfilVistaDesarrolladorId={setPerfilVistaDesarrolladorId}
            setPlatformSettingsError={setPlatformSettingsError}
          />
        )}
          </>
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
                <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>
                  {supabaseConfigured ? 'Correo electrónico' : 'Usuario'}
                </label>
                <input
                  type={supabaseConfigured ? 'email' : 'text'}
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder={supabaseConfigured ? 'correo@ejemplo.com' : 'Ej: admin, elkin, independiente'}
                  autoComplete="username"
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
                  autoComplete="current-password"
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

function VistaCuentaBloqueada({ usuario, devConfig, onCerrarSesion }) {
  const numeroSoporte = devConfig?.whatsappSoporte || '573001234567';
  const mensaje = `Hola, necesito ayuda para activar la cuenta de ${usuario?.cuentaNombre || 'mi barbería'}.`;
  const urlWhatsapp = `https://wa.me/${numeroSoporte}?text=${encodeURIComponent(mensaje)}`;

  return (
    <div style={{ backgroundColor: '#0f172a', border: '1px solid #f43f5e', borderRadius: '16px', padding: '24px', textAlign: 'center', maxWidth: '520px', margin: '40px auto' }}>
      <AlertTriangle style={{ width: '48px', height: '48px', color: '#f43f5e', margin: '0 auto 12px auto' }} />
      <h2 style={{ color: '#f43f5e', margin: '0 0 8px 0', fontSize: '20px' }}>Cuenta temporalmente bloqueada</h2>
      <p style={{ color: '#cbd5e1', fontSize: '13px', margin: '0 0 16px 0', lineHeight: '1.5' }}>
        {usuario?.cuentaNombre || 'Esta cuenta'} no puede usar las funciones de la plataforma. Contacta al desarrollador para solicitar la activación.
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <a href={urlWhatsapp} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: '#059669', color: '#fff', textDecoration: 'none', padding: '10px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <MessageCircle style={{ width: '16px', height: '16px' }} /> Solicitar activación por WhatsApp
        </a>
        <button type="button" onClick={onCerrarSesion} style={{ backgroundColor: '#334155', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

function VistaCliente({ barberos, tenants, perfilesIndependientes, servicios, citas, setCitas, incentivos, slotDuration, devConfig }) {
  const [modo, setModo] = useState('programada');
  const [nombre, setNombre] = useState('');
  const [fechaNac, setFechaNac] = useState('');
  const [codigoBusqueda, setCodigoBusqueda] = useState(() => new URLSearchParams(window.location.search).get('codigo') || '');
  const [errorCodigo, setErrorCodigo] = useState('');
  const [errorReserva, setErrorReserva] = useState('');
  const [guardandoReserva, setGuardandoReserva] = useState(false);
  const [tipoSeleccionCliente, setTipoSeleccionCliente] = useState('');
  const [estActual, setEstActual] = useState(null);
  const [entidadesPublicas, setEntidadesPublicas] = useState([]);

  const esIndependienteEst = tipoSeleccionCliente === 'independiente';

  const barberosFiltrados = useMemo(() => (
    esIndependienteEst
      ? estActual ? [{
        id: supabaseConfigured ? entidadesPublicas[0]?.id : estActual.id,
        nombre: `${estActual.propietario || estActual.nombreBarberia} (${estActual.nombreBarberia})`,
        especialidad: 'Barbero Autónomo',
        esIndependiente: true
      }] : []
      : (supabaseConfigured
        ? entidadesPublicas.filter(entity => entity.entity_type === 'barber' && entity.active).map(entity => ({
          id: entity.id,
          nombre: entity.name,
          especialidad: 'Barbero Profesional'
        }))
        : barberos.filter(b => (!b.sedeId || b.sedeId === estActual?.id) && !b.pausado && !b.isLocked))
  ), [esIndependienteEst, estActual, barberos, entidadesPublicas]);

  const serviciosFiltrados = useMemo(() => (
    esIndependienteEst && estActual?.serviciosPropios
      ? estActual.serviciosPropios
      : estActual?.servicios?.length ? estActual.servicios : servicios
  ), [esIndependienteEst, estActual, servicios]);

  const [barbero, setBarbero] = useState('');
  const [servicio, setServicio] = useState('');
  const hoyStr = fechaLocalIso();
  const [fecha, setFecha] = useState(hoyStr);
  const [hora, setHora] = useState('08:00 AM');

  const cargarCatalogoPublico = async (codigo) => {
    const response = await fetch(`/api/public/catalog?code=${encodeURIComponent(codigo)}`);
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'No se encontró el establecimiento.');

    const tenant = result.tenant;
    setEstActual({
      id: tenant.id,
      codigoPublico: tenant.public_code,
      nombreBarberia: tenant.name,
      propietario: result.entities?.[0]?.owner_name || tenant.name,
      estadoLicencia: tenant.license_status === 'active' ? 'Activa' : 'Pausada',
      diasRestantes: tenant.license_status === 'active' ? 30 : 0,
      bloqueadoDesarrollador: tenant.developer_blocked,
      agendaPausada: false,
      globalTimer: { ...TURNOS_DISPONIBLES },
      bookingBlackouts: result.bookingBlackouts || [],
      serviciosPropios: result.independentServices || [],
      servicios: result.services || []
    });
    setTipoSeleccionCliente(tenant.entity_type === 'independent' ? 'independiente' : 'sede');
    setEntidadesPublicas(result.entities || []);
    setErrorCodigo('');
    setErrorReserva('');
    setCitaCreada(null);
  };

  const buscarEstablecimiento = async (e) => {
    if (e) e.preventDefault();
    const codigo = codigoBusqueda.trim().toLowerCase();
    if (supabaseConfigured) {
      try {
        await cargarCatalogoPublico(codigo);
      } catch (error) {
        setEstActual(null);
        setTipoSeleccionCliente('');
        setEntidadesPublicas([]);
        setErrorCodigo(error.message || 'No encontramos una sede o un barbero con ese código.');
      }
      return;
    }

    const sedeEncontrada = tenants.find(t => String(t.codigoPublico || t.id).toLowerCase() === codigo);
    const independienteEncontrado = perfilesIndependientes.find(pi => String(pi.codigoPublico || pi.id).toLowerCase() === codigo);

    if (sedeEncontrada) {
      setEstActual(sedeEncontrada);
      setTipoSeleccionCliente('sede');
      setErrorCodigo('');
      setCitaCreada(null);
      return;
    }

    if (independienteEncontrado) {
      setEstActual(independienteEncontrado);
      setTipoSeleccionCliente('independiente');
      setErrorCodigo('');
      setCitaCreada(null);
      return;
    }

    setEstActual(null);
    setTipoSeleccionCliente('');
    setErrorCodigo('No encontramos una sede o un barbero con ese código. Verifícalo e inténtalo de nuevo.');
  };

  useEffect(() => {
    const codigoInicial = new URLSearchParams(window.location.search).get('codigo');
    if (!codigoInicial) return;
    const codigo = codigoInicial.trim().toLowerCase();
    if (supabaseConfigured) {
      cargarCatalogoPublico(codigo).catch(error => {
        setErrorCodigo(error.message || 'No encontramos una sede o un barbero con ese código.');
      });
      return;
    }
    const sedeInicial = tenants.find(t => String(t.codigoPublico || t.id).toLowerCase() === codigo);
    const independienteInicial = perfilesIndependientes.find(pi => String(pi.codigoPublico || pi.id).toLowerCase() === codigo);

    if (sedeInicial) {
      setEstActual(sedeInicial);
      setTipoSeleccionCliente('sede');
    } else if (independienteInicial) {
      setEstActual(independienteInicial);
      setTipoSeleccionCliente('independiente');
    }
  }, [tenants, perfilesIndependientes]);

  useEffect(() => {
    if (barberosFiltrados.length > 0) {
      setBarbero(supabaseConfigured ? barberosFiltrados[0].id : barberosFiltrados[0].nombre);
    } else {
      setBarbero('');
    }
    if (serviciosFiltrados.length > 0) {
      setServicio(serviciosFiltrados[0].nombre);
    } else {
      setServicio('');
    }
  }, [barberosFiltrados, serviciosFiltrados]);
   
  const [citaCreada, setCitaCreada] = useState(null);

  const incCumple = incentivos.find(i => i.tipo === 'cumpleanos' && i.activo);

  const cierresFechaSeleccionada = (estActual?.bookingBlackouts || []).filter(cierre => cierre.date === fecha);
  const horasDisponibles = useMemo(() => HORAS_DISPONIBLES.filter(h => {
    const [horaTexto, periodo] = h.split(' ');
    const horaNumerica = Number(horaTexto.split(':')[0]);
    const turno = periodo === 'AM' || horaNumerica === 12 ? 'Mañana' : horaNumerica < 6 ? 'Tarde' : 'Noche';
    return !cierresFechaSeleccionada.some(cierre => cierre.shift === 'Día completo' || cierre.shift === turno);
  }), [cierresFechaSeleccionada]);

  useEffect(() => {
    if (horasDisponibles.length > 0 && !horasDisponibles.includes(hora)) {
      setHora(horasDisponibles[0]);
    }
  }, [horasDisponibles, hora]);

  const esCumpleanos = () => {
    if (!fechaNac) return false;
    const hoy = new Date();
    const nac = new Date(fechaNac);
    return hoy.getDate() === nac.getDate() && hoy.getMonth() === nac.getMonth();
  };

  const handleReserva = async (e) => {
    e.preventDefault();
    if (!estActual || cuentaBloqueada(estActual) || !nombre.trim() || !barbero || (modo === 'programada' && !horasDisponibles.includes(hora))) return;
    setErrorReserva('');
    const servObj = serviciosFiltrados.find(s => s.nombre === servicio);
    const cumple = esCumpleanos();
    let precioFinal = servObj ? servObj.precio : 25000;

    if (cumple && incCumple) {
      const desc = (precioFinal * (incCumple.porcentaje || 10)) / 100;
      precioFinal = precioFinal - desc;
    }

    const selectedBarber = supabaseConfigured
      ? barberosFiltrados.find(item => item.id === barbero)?.nombre
      : barbero;
    const nueva = {
      id: 'c' + Date.now(),
      cliente: nombre.trim(),
      barbero: selectedBarber || barbero,
      servicio: servicio || 'Corte Estándar',
      fecha: modo === 'qr_walkin' ? hoyStr : fecha,
      hora: modo === 'qr_walkin' ? 'Atención Inmediata (QR)' : hora,
      precio: precioFinal,
      estado: 'confirmada',
      metodoPago: 'efectivo',
      establecimientoId: estActual.id,
      registradoEnApp: true,
      esCumpleanos: cumple && !!incCumple,
      motivoCancelacion: null
    };

    if (supabaseConfigured) {
      const selectedEntity = esIndependienteEst
        ? entidadesPublicas[0]
        : entidadesPublicas.find(entity => entity.id === barbero);
      if (!selectedEntity?.id) {
        setErrorReserva('No se pudo identificar al barbero para guardar la cita.');
        return;
      }

      nueva.id = `c${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setGuardandoReserva(true);
      try {
        const response = await fetch('/api/appointments/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            appointmentId: nueva.id,
            entityId: selectedEntity.id,
            customerName: nueva.cliente,
            serviceName: nueva.servicio,
            appointmentDate: nueva.fecha,
            appointmentTime: nueva.hora,
            price: nueva.precio
          })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'No se pudo registrar la cita.');
        nueva.bookingEntityId = selectedEntity.id;
        setCitas(actuales => [nueva, ...actuales]);
        setCitaCreada(nueva);
        setNombre('');
      } catch (error) {
        setErrorReserva(error.message || 'La solicitud de cita no pudo completarse.');
      } finally {
        setGuardandoReserva(false);
      }
      return;
    }

    setCitas(actuales => [nueva, ...actuales]);
    setCitaCreada(nueva);
    setNombre('');
  };

  const barberoSeleccionadoObj = supabaseConfigured
    ? barberosFiltrados.find(b => b.id === barbero)
    : barberos.find(b => b.nombre === barbero);
  const perfilIndepSeleccionadoObj = esIndependienteEst ? estActual : null;
  const nombreEstablecimientoActual = estActual
    ? esIndependienteEst ? `${estActual.nombreBarberia} - ${estActual.propietario}` : estActual.nombreBarberia
    : '';
  const codigoEstablecimientoActual = estActual ? estActual.codigoPublico || estActual.id : '';
  const panelBusqueda = (
    <div style={{ backgroundColor: '#0f172a', border: '1px solid #f59e0b', padding: '14px', borderRadius: '12px', boxSizing: 'border-box' }}>
      <label htmlFor="codigo-establecimiento" style={{ display: 'block', fontSize: '12px', color: '#fbbf24', marginBottom: '8px', fontWeight: 'bold' }}>
        Ingresa el código de la barbería o del barbero independiente
      </label>
      <form onSubmit={buscarEstablecimiento} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <input
          id="codigo-establecimiento"
          type="text"
          value={codigoBusqueda}
          onChange={(e) => setCodigoBusqueda(e.target.value)}
          placeholder="Ejemplo: t1"
          aria-describedby={errorCodigo ? 'error-codigo-establecimiento' : undefined}
          style={{ flex: 1, minWidth: '180px', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '6px', padding: '10px', color: '#f8fafc', fontSize: '13px' }}
          required
        />
        <button type="submit" style={{ backgroundColor: '#f59e0b', color: '#020617', border: 'none', borderRadius: '6px', padding: '10px 16px', fontWeight: 'bold', cursor: 'pointer' }}>
          Buscar
        </button>
      </form>
      {errorCodigo && <p id="error-codigo-establecimiento" role="alert" style={{ color: '#fda4af', fontSize: '11px', margin: '8px 0 0' }}>{errorCodigo}</p>}
      {estActual && (
        <p style={{ color: '#34d399', fontSize: '11px', margin: '8px 0 0' }}>
          Seleccionado: <strong>{nombreEstablecimientoActual}</strong> · Código: <strong>{codigoEstablecimientoActual}</strong>
        </p>
      )}
    </div>
  );

  if (!supabaseConfigured && !localAuthAllowed) {
    return <p role="alert" style={{ color: '#fda4af', textAlign: 'center' }}>El sistema de reservas no está disponible hasta configurar Supabase.</p>;
  }

  if (!estActual) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ borderBottom: '1px solid rgba(245, 158, 11, 0.2)', paddingBottom: '12px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#fbbf24', margin: 0 }}>Módulo de Reservas</h2>
          <p style={{ color: '#94a3b8', fontSize: '12px', margin: '4px 0 0' }}>Busca directamente el establecimiento al que deseas asistir.</p>
        </div>
        {panelBusqueda}
      </div>
    );
  }

  const agendaPausada = Boolean(
    estActual.agendaPausada ||
    cierresFechaSeleccionada.some(cierre => cierre.shift === 'Día completo') ||
    (!esIndependienteEst && horasDisponibles.length === 0)
  );
  if (cuentaBloqueada(estActual) || agendaPausada) {
    const mensajeBloqueo = cuentaBloqueada(estActual)
      ? 'Este establecimiento no está aceptando reservas en este momento.'
      : esIndependienteEst ? estActual.mensajePausa : estActual.mensajePausaGeneral || MENSAJE_PAUSA_SEDE;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
        {panelBusqueda}
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #f43f5e', borderRadius: '16px', padding: '24px', textAlign: 'center', maxWidth: '500px', margin: '20px auto', width: '100%', boxSizing: 'border-box' }}>
          <AlertTriangle style={{ width: '48px', height: '48px', color: '#f43f5e', margin: '0 auto 12px auto' }} />
          <h3 style={{ color: '#f43f5e', margin: '0 0 8px 0', fontSize: '18px' }}>Agenda Temporalmente Suspendida</h3>
          <p style={{ color: '#cbd5e1', fontSize: '13px', margin: '0 0 16px 0', lineHeight: '1.5' }}>{mensajeBloqueo}</p>
        </div>
      </div>
    );
  }

  if ((barberoSeleccionadoObj && (barberoSeleccionadoObj.pausado || barberoSeleccionadoObj.isLocked)) || (perfilIndepSeleccionadoObj && (perfilIndepSeleccionadoObj.agendaPausada || perfilIndepSeleccionadoObj.estadoLicencia !== 'Activa'))) {
    const mensajeBarberoPausado = barberoSeleccionadoObj?.isLocked ? 'El barbero tiene sus permisos bloqueados temporalmente por ciclo de pago.' : barberoSeleccionadoObj?.pausado ? barberoSeleccionadoObj.mensajePausa : perfilIndepSeleccionadoObj?.mensajePausa;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
        {panelBusqueda}
        <div style={{ borderBottom: '1px solid rgba(245, 158, 11, 0.2)', paddingBottom: '12px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#fbbf24', margin: 0 }}>Módulo de Reservas Móvil</h2>
        </div>
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #f43f5e', borderRadius: '16px', padding: '24px', textAlign: 'center', maxWidth: '500px', margin: '20px auto', width: '100%', boxSizing: 'border-box' }}>
          <AlertTriangle style={{ width: '48px', height: '48px', color: '#f43f5e', margin: '0 auto 12px auto' }} />
          <h3 style={{ color: '#f43f5e', margin: '0 0 8px 0', fontSize: '18px' }}>Barbero No disponible hoy</h3>
          <p style={{ color: '#cbd5e1', fontSize: '13px', margin: '0 0 16px 0', lineHeight: '1.5' }}>{mensajeBarberoPausado}</p>
          <button type="button" onClick={() => setBarbero(supabaseConfigured ? barberosFiltrados[0]?.id || '' : barberosFiltrados[0]?.nombre || '')} style={{ backgroundColor: '#f59e0b', color: '#020617', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Seleccionar otro barbero</button>
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
        <p style={{ color: '#94a3b8', fontSize: '12px', margin: '4px 0 0 0' }}>Seleccione su lugar de preferencia para reservar de forma exclusiva</p>
      </div>

      {panelBusqueda}

      <div style={{ display: 'flex', gap: '8px', backgroundColor: '#0f172a', padding: '6px', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
        <button
          type="button"
          onClick={() => { setModo('programada'); setCitaCreada(null); }}
          style={{ flex: 1, padding: '10px', backgroundColor: modo === 'programada' ? '#f59e0b' : 'transparent', color: modo === 'programada' ? '#020617' : '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}
        >
          📅 Cita Mes Actual
        </button>
        <button
          type="button"
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
              <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>Barbero Disponible ({nombreEstablecimientoActual})</label>
              <select
                value={barbero}
                onChange={(e) => setBarbero(e.target.value)}
                style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #f59e0b', borderRadius: '6px', padding: '10px', color: '#f8fafc', fontSize: '13px', boxSizing: 'border-box', fontWeight: 'bold' }}
                required
              >
                {barberosFiltrados.length > 0 ? (
                  barberosFiltrados.map(b => (
                    <option key={b.id || b.nombre} value={supabaseConfigured ? b.id : b.nombre}>{b.nombre} ({b.especialidad})</option>
                  ))
                ) : (
                  <option value="">No hay barberos registrados en este establecimiento</option>
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
              disabled={guardandoReserva}
              style={{ backgroundColor: guardandoReserva ? '#64748b' : '#f59e0b', color: '#020617', fontWeight: 'bold', padding: '12px', borderRadius: '8px', fontSize: '13px', border: 'none', cursor: guardandoReserva ? 'wait' : 'pointer', marginTop: '6px' }}
            >
              {guardandoReserva ? 'Guardando y enviando avisos...' : modo === 'programada' ? 'Confirmar Cita Anticipada' : 'Registrar Ingreso Expreso QR'}
            </button>
            {errorReserva && <p role="alert" style={{ color: '#fda4af', fontSize: '11px', margin: 0 }}>{errorReserva}</p>}
          </form>
        </div>

        <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', boxSizing: 'border-box' }}>
          {modo === 'qr_walkin' && !citaCreada ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <h4 style={{ color: '#fbbf24', margin: 0, fontSize: '14px' }}>Cartel QR Exclusivo: {nombreEstablecimientoActual}</h4>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>Escanee para registrarse de forma inmediata en este establecimiento.</p>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`${window.location.origin}/?codigo=${codigoEstablecimientoActual}`)}`}
                alt="QR Recepción"
                style={{ border: '3px solid #fbbf24', borderRadius: '12px', padding: '6px', backgroundColor: '#ffffff', width: '150px', height: '150px', marginTop: '8px' }}
              />
            </div>
          ) : citaCreada ? (
            <div style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #059669', borderRadius: '10px', padding: '12px', boxSizing: 'border-box' }}>
              <CheckCircle style={{ width: '28px', height: '28px', color: '#34d399', margin: '0 auto 6px auto' }} />
              <h4 style={{ color: '#34d399', margin: '0 0 6px 0', fontSize: '14px' }}>¡Cita Registrada Correctamente!</h4>
              <div style={{ fontSize: '11px', color: '#cbd5e1', textAlign: 'left', backgroundColor: '#0f172a', padding: '8px', borderRadius: '6px' }}>
                <p style={{ margin: '2px 0' }}><span style={{ color: '#94a3b8' }}>Establecimiento:</span> {nombreEstablecimientoActual}</p>
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

function VistaBarbero({ barberoActual, citas, onCrearCita, onActualizarCita, onEliminarCita, servicios, onCerrarSesion, devConfig, licenciaVencida, incentivos, activeRole, tenantPrincipal, tenants }) {
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

  const handleEstadoCita = async (id, nuevoEstado) => {
    try {
      await onActualizarCita(id, { estado: nuevoEstado, registradoEnApp: true });
    } catch (error) {
      alert(error.message || 'No se pudo actualizar la cita.');
    }
  };

  const handleEliminarCitaBarbero = (id) => {
    if (window.confirm('¿Desea anular o eliminar definitivamente esta cita de la lista?')) {
      onEliminarCita(id).catch(error => alert(error.message || 'No se pudo eliminar la cita.'));
    }
  };

  const handleConfirmarCancelacion = (e) => {
    e.preventDefault();
    if (!citaACancelar) return;
    const justificacionFinal = motivoPreset === 'Otro motivo...' ? motivoLibre.trim() : motivoPreset;

    onActualizarCita(citaACancelar.id, {
      estado: 'cancelada',
      motivoCancelacion: justificacionFinal
    }).catch(error => alert(error.message || 'No se pudo cancelar la cita.'));

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
      fecha: fechaLocalIso(),
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      precio: valorFinal,
      estado: 'completada',
      metodoPago: metodoPagoSeleccionado,
      registradoEnApp: true,
      motivoCancelacion: null
    };

    onCrearCita(nueva, barberoActual?.id)
      .catch(error => alert(error.message || 'No se pudo guardar el servicio.'));
  };

  const hoy = fechaLocalIso();
  const ingresosHoy = citasBarbero
    .filter(c => c.estado === 'completada' && c.fecha === hoy)
    .reduce((sum, c) => sum + (c.precio || 0), 0);

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
          <button type="button" onClick={onCerrarSesion} style={{ padding: '6px 10px', backgroundColor: '#334155', color: '#f8fafc', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>Salir</button>
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
                    type="button"
                    onClick={() => handleEstadoCita(c.id, 'completada')} 
                    style={{ flex: 1, padding: '6px', backgroundColor: '#064e3b', color: '#34d399', border: '1px solid #059669', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '10px' }}
                  >
                    Atendido
                  </button>
                )}
                {c.estado !== 'cancelada' && c.estado !== 'completada' && (
                  <button 
                    type="button"
                    onClick={() => setCitaACancelar(c)} 
                    style={{ padding: '6px 8px', backgroundColor: '#450a0a', color: '#f87171', border: '1px solid #ef4444', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '10px' }}
                  >
                    Anular / No Asistió
                  </button>
                )}
                <button 
                  type="button"
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

function VistaBarberoIndependiente({ perfilIndependiente, setPerfilesIndependientes, perfilesIndependientes, citas, onCrearCita, onActualizarCita, onEliminarCita, onCerrarSesion, devConfig, activeRole }) {
  const [servicioNombre, setServicioNombre] = useState('');
  const [servicioPrecio, setServicioPrecio] = useState('');
  const [servicioDuracion, setServicioDuracion] = useState('30 min');

  const [servicioSeleccionado, setServicioSeleccionado] = useState(perfilIndependiente.serviciosPropios[0]?.nombre || '');
  const [precioCobro, setPrecioCobro] = useState(perfilIndependiente.serviciosPropios[0]?.precio || 30000);
  const [metodoPago, setMetodoPago] = useState('efectivo');

  const [citaACancelarIndep, setCitaACancelarIndep] = useState(null);
  const [motivoPresetIndep, setMotivoPresetIndep] = useState('Cliente no asistió a la cita');
  const [motivoLibreIndep, setMotivoLibreIndep] = useState('');

  const urlWhatsappIndep = `https://wa.me/${devConfig?.whatsappSoporte || '573001234567'}?text=${encodeURIComponent(`Hola, soy ${perfilIndependiente.propietario} de la barbería independiente "${perfilIndependiente.nombreBarberia}" y deseo gestionar mi renovación o soporte.`)}`;

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
      fecha: fechaLocalIso(),
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      precio: Number(precioCobro),
      estado: 'completada',
      metodoPago,
      registradoEnApp: true,
      motivoCancelacion: null
    };
    onCrearCita(nueva, perfilIndependiente.id)
      .then(() => alert('Cobro registrado en tu caja independiente.'))
      .catch(error => alert(error.message || 'No se pudo registrar el cobro.'));
  };

  const handleEstadoCitaIndep = async (id, nuevoEstado) => {
    try {
      await onActualizarCita(id, { estado: nuevoEstado, registradoEnApp: true });
    } catch (error) {
      alert(error.message || 'No se pudo actualizar la cita.');
    }
  };

  const handleEliminarCitaIndep = (id) => {
    if (window.confirm('¿Desea anular o eliminar esta cita de su lista?')) {
      onEliminarCita(id).catch(error => alert(error.message || 'No se pudo eliminar la cita.'));
    }
  };

  const handleConfirmarCancelacionIndep = (e) => {
    e.preventDefault();
    if (!citaACancelarIndep) return;
    const justificacionFinal = motivoPresetIndep === 'Otro motivo...' ? motivoLibreIndep.trim() : motivoPresetIndep;

    onActualizarCita(citaACancelarIndep.id, {
      estado: 'cancelada',
      motivoCancelacion: justificacionFinal
    }).catch(error => alert(error.message || 'No se pudo cancelar la cita.'));

    setCitaACancelarIndep(null);
    setMotivoLibreIndep('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(245, 158, 11, 0.2)', paddingBottom: '12px', gap: '8px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#fbbf24', margin: 0 }}>⭐ {perfilIndependiente.nombreBarberia} ({perfilIndependiente.propietario})</h2>
          <p style={{ color: '#94a3b8', fontSize: '11px', margin: '2px 0 0 0' }}>
            Conteo regresivo del mes (Licencia): <strong style={{ color: '#38bdf8' }}>{perfilIndependiente.diasRestantes || 30} días</strong>
            {!supabaseConfigured && <> | La contraseña no se muestra en pantalla.</>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {activeRole !== 'evaluador' && activeRole !== 'sucursal_demo' && (
            <a href={urlWhatsappIndep} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: '#059669', color: '#fff', textDecoration: 'none', padding: '8px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MessageCircle style={{ width: '14px', height: '14px' }} /> WhatsApp Soporte / Renovar
            </a>
          )}
          <button type="button" onClick={onCerrarSesion} style={{ padding: '8px 12px', backgroundColor: '#334155', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>Salir</button>
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
            <button type="button" onClick={handleTogglePausarAgendaIndep} style={{ backgroundColor: perfilIndependiente.agendaPausada ? '#065f46' : '#78350f', color: perfilIndependiente.agendaPausada ? '#34d399' : '#fcd34d', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>
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
                      type="button"
                      onClick={() => handleEstadoCitaIndep(c.id, 'completada')} 
                      style={{ flex: 1, padding: '6px', backgroundColor: '#064e3b', color: '#34d399', border: '1px solid #059669', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '10px' }}
                    >
                      Atendido
                    </button>
                  )}
                  {c.estado !== 'cancelada' && c.estado !== 'completada' && (
                    <button 
                      type="button"
                      onClick={() => setCitaACancelarIndep(c)} 
                      style={{ padding: '6px 8px', backgroundColor: '#450a0a', color: '#f87171', border: '1px solid #ef4444', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '10px' }}
                    >
                      Anular
                    </button>
                  )}
                  <button type="button" onClick={() => handleEliminarCitaIndep(c.id)} style={{ backgroundColor: '#334155', color: '#f87171', border: '1px solid #64748b', padding: '6px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>
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
              <button type="button" onClick={() => handleEliminarServicioPropio(s.id, s.nombre)} style={{ backgroundColor: '#450a0a', color: '#f87171', border: 'none', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' }}>✕</button>
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

function VistaAdmin({ usuario, tenantActualParaAdmin, citas, onActualizarCita, onEliminarCita, currentTime, barberos, setBarberos, productos, setProductos, servicios, setServicios, devConfig, licenciaVencida, incentivos, setIncentivos, credencialesAdmin, setCredencialesAdmin, tenantPrincipal, setTenants, tenants, agendaPausadaSede, bookingBlackouts, setBookingBlackouts, chairFeeConfig, setChairFeeConfig }) {
  const [tab, setTab] = useState('resumen');
   
  const tenantActivo = tenantActualParaAdmin || tenantPrincipal;

  const [nuevoUserAdmin, setNuevoUserAdmin] = useState(tenantActivo.usernameAdmin || credencialesAdmin.username);
  const [nuevoPassAdmin, setNuevoPassAdmin] = useState(tenantActivo.passwordAdmin || credencialesAdmin.password);
  const [nuevoNombreAdmin, setNuevoNombreAdmin] = useState(tenantActivo.dueno || credencialesAdmin.nombre);
  const [nuevaClaveAdmin, setNuevaClaveAdmin] = useState('');
  const [confirmarClaveAdmin, setConfirmarClaveAdmin] = useState('');

  const [nombreNegocioInput, setNombreNegocioInput] = useState(tenantActivo.nombreBarberia);
  const [blackoutDate, setBlackoutDate] = useState(fechaLocalIso());
  const [blackoutShift, setBlackoutShift] = useState('Mañana');

  const [citaAReasignar, setCitaAReasignar] = useState(null);
  const [nuevoBarberoDestino, setNuevoBarberoDestino] = useState(barberos[0]?.nombre || '');

  const [nombreServ, setNombreServ] = useState('');
  const [precioServ, setPrecioServ] = useState('');
  const [duracionServ, setDuracionServ] = useState('30 min');

  const [nuevoNombreBarbero, setNuevoNombreBarbero] = useState('');
  const [nuevoUsernameBarbero, setNuevoUsernameBarbero] = useState('');
  const [nuevaClaveBarbero, setNuevaClaveBarbero] = useState('');
  const [nuevoEmailBarbero, setNuevoEmailBarbero] = useState('');
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

  const handleGuardarNombreBarberia = async (e) => {
    e.preventDefault();
    if (!nombreNegocioInput.trim()) return;

    if (supabaseConfigured) {
      try {
        await requestStaffApi('/api/tenants/update', {
          method: 'PATCH',
          body: JSON.stringify({ id: tenantActivo.id, name: nombreNegocioInput.trim() })
        });
      } catch (error) {
        alert(error.message);
        return;
      }
    }

    const nombreAnteriorActual = tenantActivo.nombreBarberia;
    setTenants(actuales => actuales.map(t => t.id === tenantActivo.id ? {
      ...t,
      nombreAnterior: nombreAnteriorActual,
      nombreBarberia: nombreNegocioInput.trim()
    } : t));
    alert(`¡Nombre de la barbería actualizado exitosamente a "${nombreNegocioInput.trim()}"!`);
  };

  const guardarCierres = async (cierres) => {
    try {
      await setBookingBlackouts(cierres);
    } catch (error) {
      alert(error.message || 'No se pudieron guardar los cierres de agenda.');
      throw error;
    }
  };

  const agregarCierreAgenda = async (e) => {
    e.preventDefault();
    const nuevoCierre = { date: blackoutDate, shift: blackoutShift };
    if (bookingBlackouts.some(item => item.date === nuevoCierre.date && item.shift === nuevoCierre.shift)) return;
    try {
      await guardarCierres([...bookingBlackouts, nuevoCierre]);
    } catch (error) {
      return;
    }
  };

  const eliminarCierreAgenda = (cierre) => {
    guardarCierres(bookingBlackouts.filter(item => (
      item.date !== cierre.date || item.shift !== cierre.shift
    ))).catch(() => {});
  };

  const handleTogglePausarSede = () => {
    const today = fechaLocalIso();
    const cierreDia = { date: today, shift: 'Día completo' };
    const cierres = agendaPausadaSede
      ? bookingBlackouts.filter(item => item.date !== today || item.shift !== 'Día completo')
      : [...bookingBlackouts, cierreDia];
    guardarCierres(cierres)
      .then(() => alert(agendaPausadaSede ? 'Sede activada para hoy.' : 'Sede bloqueada para citas durante todo el día de hoy.'))
      .catch(() => {});
  };

  const handleBillingCycleChange = async (barberId, days) => {
    try {
      let updatedEntity;
      if (supabaseConfigured) {
        const result = await requestStaffApi('/api/staff/update', {
          method: 'PATCH',
          body: JSON.stringify({ entityId: barberId, billingCycleDays: Number(days) })
        });
        updatedEntity = result.entity;
      }
      setBarberos(current => current.map(b => b.id === barberId ? {
        ...b,
        billingCycleDays: Number(updatedEntity?.billing_cycle_days ?? days),
        billingCycleStartedAt: updatedEntity?.billing_cycle_started_at || new Date().toISOString(),
        accessBlocked: updatedEntity ? updatedEntity.access_blocked : barberoBloqueado(b),
        isLocked: updatedEntity
          ? Boolean(updatedEntity.access_blocked) || cicloDePagoVencido({
            billingCycleStartedAt: updatedEntity.billing_cycle_started_at,
            billingCycleDays: updatedEntity.billing_cycle_days
          })
          : barberoBloqueado(b)
      } : b));
    } catch (error) {
      alert(error.message || 'No se pudo actualizar el ciclo de pago.');
    }
  };

  const toggleBarberLock = async (barberId, nombreBarbero) => {
    const barber = barberos.find(b => b.id === barberId);
    if (!barber) return;
    const locked = barberoBloqueado(barber);
    const accessBlocked = !locked;
    try {
      let updatedEntity;
      if (supabaseConfigured) {
        const result = await requestStaffApi('/api/staff/update', {
          method: 'PATCH',
          body: JSON.stringify({ entityId: barberId, accessBlocked })
        });
        updatedEntity = result.entity;
      }
      const savedAccessBlocked = updatedEntity ? Boolean(updatedEntity.access_blocked) : accessBlocked;
      setBarberos(current => current.map(b => b.id === barberId ? {
        ...b,
        accessBlocked: savedAccessBlocked,
        active: updatedEntity?.active ?? !savedAccessBlocked,
        pausado: updatedEntity ? !updatedEntity.active : (savedAccessBlocked ? b.pausado : false),
        isLocked: savedAccessBlocked || cicloDePagoVencido({
          billingCycleStartedAt: updatedEntity?.billing_cycle_started_at
            || (savedAccessBlocked ? b.billingCycleStartedAt : new Date().toISOString()),
          billingCycleDays: updatedEntity?.billing_cycle_days || b.billingCycleDays
        }),
        billingCycleStartedAt: updatedEntity?.billing_cycle_started_at
          || (savedAccessBlocked ? b.billingCycleStartedAt : new Date().toISOString()),
        billingCycleDays: Number(updatedEntity?.billing_cycle_days || b.billingCycleDays)
      } : b));
      alert(savedAccessBlocked
        ? `Acceso bloqueado para ${nombreBarbero}. Solo podrás activarlo desde este panel.`
        : `Acceso activado para ${nombreBarbero}; comenzó un nuevo ciclo de pago.`);
    } catch (error) {
      alert(error.message || 'No se pudo cambiar el bloqueo del barbero.');
    }
  };

  const handleEliminarBarberoDefinitivo = async (barberId, nombreBarbero) => {
    if (window.confirm(`¿Desea desactivar la cuenta de ${nombreBarbero}? Se conservará el historial de sus citas.`)) {
      if (supabaseConfigured) {
        try {
          await requestStaffApi('/api/staff/remove', {
            method: 'POST',
            body: JSON.stringify({ entityId: barberId })
          });
        } catch (error) {
          alert(error.message || 'No se pudo desactivar la cuenta del barbero.');
          return;
        }
      }
      setBarberos(current => current.filter(b => b.id !== barberId));
      alert(`Cuenta de ${nombreBarbero} desactivada. El historial de citas se conservó.`);
    }
  };

  const handleEliminarCitaAdmin = (id) => {
    if (window.confirm('¿Desea anular o eliminar definitivamente esta cita de la sede?')) {
      onEliminarCita(id).catch(error => alert(error.message || 'No se pudo eliminar la cita.'));
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

  const handleCambiarClaveAdmin = async (e) => {
    e.preventDefault();
    if (nuevaClaveAdmin.length < 8) {
      alert('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (nuevaClaveAdmin !== confirmarClaveAdmin) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: nuevaClaveAdmin });
      if (error) throw error;
    } catch (error) {
      alert(error.message || 'No se pudo cambiar la contraseña del administrador.');
      return;
    }

    setNuevaClaveAdmin('');
    setConfirmarClaveAdmin('');
    alert('La contraseña del administrador se actualizó correctamente.');
  };

  const handleReasignarCitaSubmit = (e) => {
    e.preventDefault();
    if (!citaAReasignar) return;
    const barber = barberos.find(b => b.nombre === nuevoBarberoDestino && b.sedeId === tenantActivo.id);
    if (supabaseConfigured && !barber) {
      alert('No se pudo identificar al barbero seleccionado.');
      return;
    }
    onActualizarCita(citaAReasignar.id, {
      barbero: nuevoBarberoDestino,
      bookingEntityId: barber?.entityId || barber?.id
    }).then(() => {
      setCitaAReasignar(null);
      alert(`Cita reasignada exitosamente a ${nuevoBarberoDestino}.`);
    }).catch(error => alert(error.message || 'No se pudo reasignar la cita.'));
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

  const handleAgregarBarbero = async (e) => {
    e.preventDefault();
    if (!nuevoNombreBarbero.trim() || !nuevoUsernameBarbero.trim()) return;

    const entityId = `barbero-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    if (supabaseConfigured) {
      try {
        await requestStaffApi('/api/staff/create', {
          method: 'POST',
          body: JSON.stringify({
            role: 'barber',
            email: nuevoEmailBarbero.trim(),
            password: nuevaClaveBarbero,
            username: nuevoUsernameBarbero.trim(),
            displayName: nuevoNombreBarbero.trim(),
            tenantId: tenantActivo.id,
            entityId
          })
        });
      } catch (error) {
        alert(error.message);
        return;
      }
    }

    setBarberos([...barberos, {
      id: entityId,
      entityId,
      username: nuevoUsernameBarbero.toLowerCase().trim(),
      nombre: nuevoNombreBarbero.trim(),
      especialidad: especialidad || 'Barbero Profesional', 
      estado: 'Activo', 
      claveAcceso: supabaseConfigured ? '' : nuevaClaveBarbero || 'barbero123',
      pausado: false,
      mensajePausa: 'Barbero no disponible hoy.',
      billingCycleDays: 30,
      billingCycleStartedAt: new Date().toISOString(),
      accessBlocked: false,
      isLocked: false,
      sedeId: tenantActivo.id
    }]);
    setNuevoNombreBarbero('');
    setNuevoUsernameBarbero('');
    setNuevaClaveBarbero('');
    setNuevoEmailBarbero('');
    setEspecialidad('');
    alert(supabaseConfigured
      ? '¡Barbero creado! Ya puede ingresar con su correo y contraseña de Supabase.'
      : '¡Barbero creado y vinculado a esta sede exitosamente!');
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
        <button type="button" onClick={() => setTab('resumen')} style={{ padding: '8px 12px', background: tab === 'resumen' ? '#f59e0b' : 'transparent', color: tab === 'resumen' ? '#020617' : '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Resumen & Ingresos</button>
        <button type="button" onClick={() => setTab('incentivos')} style={{ padding: '8px 12px', background: tab === 'incentivos' ? '#f59e0b' : 'transparent', color: tab === 'incentivos' ? '#020617' : '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>🎁 Incentivos</button>
        <button type="button" onClick={() => setTab('barberos')} style={{ padding: '8px 12px', background: tab === 'barberos' ? '#f59e0b' : 'transparent', color: tab === 'barberos' ? '#020617' : '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Barberos & Sillas</button>
        <button type="button" onClick={() => setTab('servicios')} style={{ padding: '8px 12px', background: tab === 'servicios' ? '#f59e0b' : 'transparent', color: tab === 'servicios' ? '#020617' : '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Servicios & Precios</button>
        <button type="button" onClick={() => setTab('productos')} style={{ padding: '8px 12px', background: tab === 'productos' ? '#f59e0b' : 'transparent', color: tab === 'productos' ? '#020617' : '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Inventario</button>
        <button type="button" onClick={() => setTab('config_admin')} style={{ padding: '8px 12px', background: tab === 'config_admin' ? '#f59e0b' : 'transparent', color: tab === 'config_admin' ? '#020617' : '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Ajustes & Tiempos</button>
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
                        <button type="button" onClick={() => setCitaAReasignar(c)} style={{ padding: '4px 8px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>
                          🔄 Reasignar
                        </button>
                      )}
                      <button type="button" onClick={() => handleEliminarCitaAdmin(c.id)} style={{ padding: '4px 8px', backgroundColor: '#450a0a', color: '#f87171', border: '1px solid #ef4444', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>
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
                  <button type="button" onClick={() => handleToggleIncentivo(i.id)} style={{ flex: 1, backgroundColor: i.activo ? '#78350f' : '#065f46', color: i.activo ? '#fcd34d' : '#34d399', border: 'none', padding: '6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                    {i.activo ? 'Pausar' : 'Reanudar'}
                  </button>
                  <button type="button" onClick={() => handleEliminarIncentivo(i.id)} style={{ backgroundColor: '#450a0a', color: '#f87171', border: '1px solid #ef4444', padding: '6px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
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
            {supabaseConfigured && <input type="email" placeholder="Correo de acceso (Supabase)" value={nuevoEmailBarbero} onChange={(e) => setNuevoEmailBarbero(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '6px', borderRadius: '4px', fontSize: '11px' }} required />}
            <input type="text" placeholder="Especialidad" value={especialidad} onChange={(e) => setEspecialidad(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '6px', borderRadius: '4px', fontSize: '11px' }} />
            <button type="submit" style={{ backgroundColor: '#f59e0b', color: '#020617', border: 'none', padding: '6px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px', gridColumn: '1 / -1' }}>Registrar Nuevo Barbero en {tenantActivo.nombreBarberia}</button>
          </form>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {barberosDeEstaSede.map(b => (
              <div key={b.id} style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '12px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <h4 style={{ margin: 0, color: '#fff', fontSize: '13px' }}>{b.nombre}</h4>
                  <p style={{ margin: '2px 0', fontSize: '10px', color: '#fbbf24' }}>
                    Usuario: {b.username} · Las contraseñas no se muestran; deben restablecerse de forma segura.
                  </p>
                  <p style={{ margin: '2px 0', fontSize: '10px', color: barberoBloqueado(b, currentTime) ? '#f43f5e' : '#34d399' }}>
                    Estado Cuenta: {barberoBloqueado(b, currentTime) ? 'Bloqueado hasta activación del administrador' : 'Activo'} · Ciclo: {b.billingCycleDays || 30} días · Restan: {diasCicloRestantes(b, currentTime)} días
                  </p>
                </div>
                 
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <select 
                    value={b.billingCycleDays || 30}
                    onChange={(e) => handleBillingCycleChange(b.id, e.target.value)}
                    style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '4px', borderRadius: '4px', fontSize: '10px' }}
                  >
                    <option value={8}>Cobro cada 8 días</option>
                    <option value={15}>Cobro cada 15 días</option>
                    <option value={30}>Cobro cada 30 días</option>
                  </select>

                  <button type="button" onClick={() => toggleBarberLock(b.id, b.nombre)} style={{ backgroundColor: barberoBloqueado(b, currentTime) ? '#065f46' : '#92400e', color: barberoBloqueado(b, currentTime) ? '#34d399' : '#fef3c7', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                    {barberoBloqueado(b, currentTime) ? 'Activar y reiniciar ciclo' : 'Bloquear acceso'}
                  </button>

                  <button type="button" onClick={() => handleEliminarBarberoDefinitivo(b.id, b.nombre)} style={{ backgroundColor: '#450a0a', color: '#f87171', border: '1px solid #ef4444', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', marginLeft: 'auto' }}>
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
                <button type="button" onClick={() => handleEliminarServicioAdmin(s.id, s.nombre)} style={{ backgroundColor: '#450a0a', color: '#f87171', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>Eliminar</button>
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
                        <button type="button" onClick={() => handleEliminarProductoAdmin(p.id, p.nombre)} style={{ backgroundColor: '#450a0a', color: '#f87171', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>Eliminar</button>
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
              <Clock style={{ width: '16px', height: '16px' }} /> Bloqueo de citas por fecha y turno
            </h3>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 10px 0' }}>Elige una fecha y bloquea un turno o el día completo. Los cambios se guardan en la sede.</p>
            <form onSubmit={agregarCierreAgenda} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <input
                type="date"
                value={blackoutDate}
                onChange={(e) => setBlackoutDate(e.target.value)}
                required
                style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }}
              />
              <select value={blackoutShift} onChange={(e) => setBlackoutShift(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }}>
                <option value="Mañana">Mañana</option>
                <option value="Tarde">Tarde</option>
                <option value="Noche">Noche</option>
                <option value="Día completo">Día completo</option>
              </select>
              <button type="submit" style={{ backgroundColor: '#f59e0b', color: '#020617', border: 'none', padding: '8px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>Bloquear citas</button>
            </form>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
              {bookingBlackouts.map(cierre => (
                <div key={`${cierre.date}-${cierre.shift}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', color: '#cbd5e1', fontSize: '11px', backgroundColor: '#020617', padding: '8px', borderRadius: '6px' }}>
                  <span>{cierre.date} · {cierre.shift}</span>
                  <button type="button" onClick={() => eliminarCierreAgenda(cierre)} style={{ backgroundColor: '#450a0a', color: '#f87171', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' }}>Desbloquear</button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '16px', borderRadius: '12px' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#fbbf24', fontSize: '15px' }}>🛑 Control de Pausa / Bloqueo General Sede</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#020617', padding: '10px', borderRadius: '8px', border: '1px solid #334155' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}>Sede: {agendaPausadaSede ? 'Pausada (Cerrada)' : 'Activa (Abierta)'}</span>
                <button type="button" onClick={handleTogglePausarSede} style={{ backgroundColor: agendaPausadaSede ? '#065f46' : '#78350f', color: agendaPausadaSede ? '#34d399' : '#fcd34d', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>
                  {agendaPausadaSede ? 'Activar Sede' : 'Pausar Sede'}
                </button>
              </div>
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

          {supabaseConfigured && <div style={{ backgroundColor: '#0f172a', border: '1px solid #3b82f6', padding: '16px', borderRadius: '12px' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#60a5fa', fontSize: '15px' }}>Cambiar mi contraseña de administrador</h3>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 10px 0' }}>La contraseña se actualizará en tu cuenta de acceso.</p>
            <form onSubmit={handleCambiarClaveAdmin} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
              <input type="password" autoComplete="new-password" aria-label="Nueva contraseña de administrador" placeholder="Nueva contraseña (mínimo 8 caracteres)" value={nuevaClaveAdmin} onChange={(e) => setNuevaClaveAdmin(e.target.value)} minLength={8} required style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} />
              <input type="password" autoComplete="new-password" aria-label="Confirmar contraseña de administrador" placeholder="Confirmar nueva contraseña" value={confirmarClaveAdmin} onChange={(e) => setConfirmarClaveAdmin(e.target.value)} minLength={8} required style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} />
              <button type="submit" style={{ backgroundColor: '#3b82f6', color: '#fff', fontWeight: 'bold', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Actualizar contraseña</button>
            </form>
          </div>}

          {!supabaseConfigured && <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '16px', borderRadius: '12px' }}>
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
          </div>}
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

function VistaSuperAdmin({ currentTime, devConfig, setDevConfig, guardarConfiguracionPlataforma, barberos, setBarberos, tenants, setTenants, perfilesIndependientes, setPerfilesIndependientes, setActiveRole, setTenantVistaDesarrolladorId, setPerfilVistaDesarrolladorId, setPlatformSettingsError, incentivos, setIncentivos, credencialesAdmin, setCredencialesAdmin, superAdminCreds, setSuperAdminCreds }) {
  const [nombrePlataforma, setNombrePlataforma] = useState(devConfig?.nombrePlataforma || 'GOL CUT BARBER');
  const [whatsapp, setWhatsapp] = useState(devConfig?.whatsappSoporte || '573001234567');
  const [nuevaClaveDesarrollador, setNuevaClaveDesarrollador] = useState('');
  const [confirmarClaveDesarrollador, setConfirmarClaveDesarrollador] = useState('');
  const platformSettingsRequest = useRef(0);
  
  const [nuevoSuperUser, setNuevoSuperUser] = useState(superAdminCreds.username);
  const [nuevoSuperPass, setNuevoSuperPass] = useState(superAdminCreds.password);
  const [nuevoSuperNombre, setNuevoSuperNombre] = useState(superAdminCreds.nombre);

  const [nuevoNombreBarberia, setNuevoNombreBarberia] = useState('');
  const [nuevoDuenoBarberia, setNuevoDuenoBarberia] = useState('');
  const [nuevoWpBarberia, setNuevoWpBarberia] = useState('');
  const [nuevoUserTenant, setNuevoUserTenant] = useState('');
  const [nuevoEmailTenant, setNuevoEmailTenant] = useState('');
  const [nuevoPassTenant, setNuevoPassTenant] = useState('');

  const [tenantEditandoId, setTenantEditandoId] = useState(null);
  const [editTenantNombre, setEditTenantNombre] = useState('');
  const [editTenantDueno, setEditTenantDueno] = useState('');
  const [editTenantUser, setEditTenantUser] = useState('');
  const [editTenantPass, setEditTenantPass] = useState('');
  const [editTenantWp, setEditTenantWp] = useState('');

  const [barberoEditandoClave, setBarberoEditandoClave] = useState(null);
  const [nuevaClaveBarberoDev, setNuevaClaveBarberoDev] = useState('');
  const [cuentaRestableciendoId, setCuentaRestableciendoId] = useState(null);
  const [nuevaClaveCuenta, setNuevaClaveCuenta] = useState('');

  const [perfilIndepEditandoId, setPerfilIndepEditandoId] = useState(null);
  const [editIndepNombre, setEditIndepNombre] = useState('');
  const [editIndepPropietario, setEditIndepPropietario] = useState('');
  const [editIndepUser, setEditIndepUser] = useState('');
  const [editIndepClave, setEditIndepClave] = useState('');

  const [nuevoIndepNombre, setNuevoIndepNombre] = useState('');
  const [nuevoIndepPropietario, setNuevoIndepPropietario] = useState('');
  const [nuevoIndepUser, setNuevoIndepUser] = useState('');
  const [nuevoEmailIndep, setNuevoEmailIndep] = useState('');
  const [nuevoIndepPass, setNuevoIndepPass] = useState('');

  useEffect(() => {
    if (!supabaseConfigured) return undefined;
    const requestId = ++platformSettingsRequest.current;
    fetch('/api/public/settings')
      .then(async response => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'No se pudo cargar la configuración de plataforma.');
        return result.settings;
      })
      .then(settings => {
        if (requestId !== platformSettingsRequest.current) return;
        guardarConfiguracionPlataforma(settings);
        setNombrePlataforma(settings.platform_name);
        setWhatsapp(settings.support_whatsapp);
        setPlatformSettingsError('');
      })
      .catch(error => {
        if (requestId === platformSettingsRequest.current) {
          setPlatformSettingsError(error.message || 'No se pudo cargar la configuración de plataforma.');
        }
      });
    return () => {
      platformSettingsRequest.current += 1;
    };
  }, [guardarConfiguracionPlataforma, setPlatformSettingsError]);

  const generarCodigoUnico = (prefijo) => {
    const codigosExistentes = new Set(
      [...tenants, ...perfilesIndependientes].map(cuenta => String(cuenta.codigoPublico || cuenta.id).toLowerCase())
    );
    let codigo;
    do {
      codigo = `${prefijo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    } while (codigosExistentes.has(codigo.toLowerCase()));
    return codigo;
  };

  const handleWhatsappSave = async (e) => {
    e.preventDefault();
    const nombreGuardado = nombrePlataforma.trim() || 'GOL CUT BARBER';
    if (supabaseConfigured) {
      try {
        const result = await requestStaffApi('/api/platform/settings', {
          method: 'PATCH',
          body: JSON.stringify({
            platformName: nombreGuardado,
            supportWhatsapp: whatsapp.trim(),
            renewalMessage: devConfig?.mensajeRenovacion || 'Hola, deseo solicitar soporte y activar mi cuenta.'
          })
        });
        platformSettingsRequest.current += 1;
        guardarConfiguracionPlataforma(result.settings);
        setNombrePlataforma(result.settings.platform_name);
        setWhatsapp(result.settings.support_whatsapp);
        setPlatformSettingsError('');
        alert('¡Nombre global y WhatsApp de soporte actualizados para toda la plataforma!');
        return;
      } catch (error) {
        alert(error.message);
        return;
      }
    }
    setNombrePlataforma(nombreGuardado);
    setDevConfig({ ...devConfig, nombrePlataforma: nombreGuardado, whatsappSoporte: whatsapp.trim() });
    alert('¡Nombre de plataforma y WhatsApp de soporte actualizados!');
  };

  const handleRestablecerClaveCuenta = async (e, userId) => {
    e.preventDefault();
    if (nuevaClaveCuenta.length < 8) {
      alert('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }
    try {
      await requestStaffApi('/api/staff/credentials', {
        method: 'PATCH',
        body: JSON.stringify({ userId, action: 'reset', password: nuevaClaveCuenta })
      });
      setNuevaClaveCuenta('');
      setCuentaRestableciendoId(null);
      alert('La contraseña se restableció. Por seguridad, la clave anterior no se puede consultar.');
    } catch (error) {
      alert(error.message || 'No se pudo restablecer la contraseña.');
    }
  };

  const handleCambiarAccesoCuenta = async (userId, action) => {
    try {
      await requestStaffApi('/api/staff/credentials', {
        method: 'PATCH',
        body: JSON.stringify({ userId, action })
      });
      const accessDisabled = action === 'revoke';
      setTenants(current => current.map(account => account.authUserId === userId ? { ...account, accessDisabled } : account));
      setPerfilesIndependientes(current => current.map(account => account.authUserId === userId ? { ...account, accessDisabled } : account));
      setBarberos(current => current.map(account => account.authUserId === userId ? { ...account, accessDisabled } : account));
      alert(accessDisabled ? 'El acceso a esta cuenta fue anulado.' : 'El acceso a esta cuenta fue habilitado.');
    } catch (error) {
      alert(error.message || 'No se pudo actualizar el acceso de la cuenta.');
    }
  };

  const handleCicloIndependiente = async (id, days) => {
    const account = perfilesIndependientes.find(item => item.id === id);
    if (!account) return;
    try {
      let updatedEntity;
      if (supabaseConfigured) {
        const result = await requestStaffApi('/api/staff/update', {
          method: 'PATCH',
          body: JSON.stringify({ entityId: id, billingCycleDays: Number(days) })
        });
        updatedEntity = result.entity;
      }
      const savedAccessBlocked = updatedEntity ? Boolean(updatedEntity.access_blocked) : barberoBloqueado(account, currentTime);
      const savedStartedAt = updatedEntity?.billing_cycle_started_at || new Date().toISOString();
      const savedCycleDays = Number(updatedEntity?.billing_cycle_days || days);
      setPerfilesIndependientes(current => current.map(item => item.id === id ? {
        ...item,
        billingCycleDays: savedCycleDays,
        billingCycleStartedAt: savedStartedAt,
        accessBlocked: savedAccessBlocked,
        isLocked: savedAccessBlocked || cicloDePagoVencido({
          billingCycleStartedAt: savedStartedAt,
          billingCycleDays: savedCycleDays
        }, currentTime)
      } : item));
    } catch (error) {
      alert(error.message || 'No se pudo actualizar el ciclo del perfil independiente.');
    }
  };

  const handleBloquearIndependiente = async (account) => {
    const accessBlocked = !barberoBloqueado(account, currentTime);
    try {
      let updatedEntity;
      if (supabaseConfigured) {
        const result = await requestStaffApi('/api/staff/update', {
          method: 'PATCH',
          body: JSON.stringify({ entityId: account.id, accessBlocked })
        });
        updatedEntity = result.entity;
      }
      const savedAccessBlocked = updatedEntity ? Boolean(updatedEntity.access_blocked) : accessBlocked;
      const savedStartedAt = updatedEntity?.billing_cycle_started_at
        || (savedAccessBlocked ? account.billingCycleStartedAt : new Date().toISOString());
      const savedCycleDays = Number(updatedEntity?.billing_cycle_days || account.billingCycleDays || 30);
      setPerfilesIndependientes(current => current.map(item => item.id === account.id ? {
        ...item,
        accessBlocked: savedAccessBlocked,
        isLocked: savedAccessBlocked || cicloDePagoVencido({
          billingCycleStartedAt: savedStartedAt,
          billingCycleDays: savedCycleDays
        }, currentTime),
        billingCycleStartedAt: savedStartedAt,
        billingCycleDays: savedCycleDays
      } : item));
      alert(savedAccessBlocked
        ? `Acceso bloqueado para ${account.nombreBarberia}.`
        : `Acceso activado para ${account.nombreBarberia}; comenzó un nuevo ciclo.`);
    } catch (error) {
      alert(error.message || 'No se pudo cambiar el bloqueo del perfil independiente.');
    }
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

  const handleCambiarClaveDesarrollador = async (e) => {
    e.preventDefault();
    if (nuevaClaveDesarrollador.length < 8) {
      alert('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (nuevaClaveDesarrollador !== confirmarClaveDesarrollador) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: nuevaClaveDesarrollador });
      if (error) throw error;
    } catch (error) {
      alert(error.message || 'No se pudo cambiar la contraseña.');
      return;
    }
    setNuevaClaveDesarrollador('');
    setConfirmarClaveDesarrollador('');
    alert('La contraseña del desarrollador se actualizó correctamente.');
  };

  const handleCrearTenant = async (e) => {
    e.preventDefault();
    if (!nuevoNombreBarberia.trim() || !nuevoDuenoBarberia.trim() || !nuevoUserTenant.trim() || !nuevoPassTenant.trim()) return;

    const id = generarCodigoUnico('sede');
    if (supabaseConfigured) {
      try {
        await requestStaffApi('/api/tenants/create', {
          method: 'POST',
          body: JSON.stringify({
            id,
            publicCode: id,
            name: nuevoNombreBarberia.trim(),
            entityType: 'shop',
            email: nuevoEmailTenant.trim(),
            password: nuevoPassTenant,
            username: nuevoUserTenant.trim(),
            displayName: nuevoDuenoBarberia.trim()
          })
        });
      } catch (error) {
        alert(error.message);
        return;
      }
    }

    const nuevaSede = {
      id,
      codigoPublico: id,
      nombreBarberia: nuevoNombreBarberia.trim(),
      nombreAnterior: 'Nueva Sede (Creada por Dev)',
      dueno: nuevoDuenoBarberia.trim(),
      estadoLicencia: 'Activa',
      bloqueadoDesarrollador: false,
      agendaPausada: false,
      mensajePausaGeneral: MENSAJE_PAUSA_SEDE,
      globalTimer: { ...TURNOS_DISPONIBLES },
      diasRestantes: 30,
      whatsappContacto: nuevoWpBarberia.trim() || '573001234567',
      usernameAdmin: nuevoUserTenant.trim().toLowerCase(),
      passwordAdmin: supabaseConfigured ? '' : nuevoPassTenant.trim()
    };

    setTenants([...tenants, nuevaSede]);
    setNuevoNombreBarberia('');
    setNuevoDuenoBarberia('');
    setNuevoWpBarberia('');
    setNuevoUserTenant('');
    setNuevoEmailTenant('');
    setNuevoPassTenant('');
    alert(supabaseConfigured
      ? `¡Barbería "${nuevaSede.nombreBarberia}" creada! El administrador ingresará con su correo y contraseña de Supabase.`
      : `¡Barbería "${nuevaSede.nombreBarberia}" creada con éxito!`);
  };

  const iniciarEdicionTenant = (t) => {
    setTenantEditandoId(t.id);
    setEditTenantNombre(t.nombreBarberia);
    setEditTenantDueno(t.dueno);
    setEditTenantUser(t.usernameAdmin || 'admin');
    setEditTenantPass('');
    setEditTenantWp(t.whatsappContacto);
  };

  const actualizarTenantServidor = async (id, updates) => {
    if (!supabaseConfigured) return null;
    const result = await requestStaffApi('/api/tenants/update', {
      method: 'PATCH',
      body: JSON.stringify({ id, ...updates })
    });
    return result.tenant;
  };

  const handleGuardarTenantDev = async (e, id) => {
    e.preventDefault();
    let remoteTenant = null;
    if (supabaseConfigured) {
      try {
        remoteTenant = await actualizarTenantServidor(id, { name: editTenantNombre });
      } catch (error) {
        alert(error.message);
        return;
      }
    }
    const actualizados = tenants.map(t => {
      if (t.id === id) {
        return {
          ...t,
          nombreAnterior: t.nombreBarberia,
          nombreBarberia: remoteTenant?.name || editTenantNombre.trim(),
          ...(supabaseConfigured ? {} : {
            dueno: editTenantDueno.trim(),
            usernameAdmin: editTenantUser.trim().toLowerCase(),
            passwordAdmin: editTenantPass.trim() || t.passwordAdmin,
            whatsappContacto: editTenantWp.trim()
          })
        };
      }
      return t;
    });
    setTenants(actualizados);
    setTenantEditandoId(null);
    alert(supabaseConfigured
      ? '¡Nombre de la barbería actualizado! Las credenciales se administran en Supabase.'
      : '¡Barbería y credenciales de administrador actualizadas con éxito!');
  };

  const iniciarEdicionIndependiente = (pi) => {
    setPerfilIndepEditandoId(pi.id);
    setEditIndepNombre(pi.nombreBarberia);
    setEditIndepPropietario(pi.propietario);
    setEditIndepUser(pi.username);
    setEditIndepClave('');
  };

  const handleGuardarIndependienteDev = async (e, id) => {
    e.preventDefault();
    let remoteTenant = null;
    if (supabaseConfigured) {
      try {
        remoteTenant = await actualizarTenantServidor(id, { name: editIndepNombre });
      } catch (error) {
        alert(error.message);
        return;
      }
    }
    const actualizados = perfilesIndependientes.map(pi => {
      if (pi.id === id) {
        return {
          ...pi,
          nombreAnterior: pi.nombreBarberia,
          nombreBarberia: remoteTenant?.name || editIndepNombre.trim(),
          ...(supabaseConfigured ? {} : {
            propietario: editIndepPropietario.trim(),
            username: editIndepUser.trim().toLowerCase(),
            clave: editIndepClave.trim() || pi.clave
          })
        };
      }
      return pi;
    });
    setPerfilesIndependientes(actualizados);
    setPerfilIndepEditandoId(null);
    alert(supabaseConfigured
      ? '¡Nombre del perfil independiente actualizado! Las credenciales se administran en Supabase.'
      : '¡Perfil independiente actualizado con éxito!');
  };

  const handleCrearPerfilIndependienteNuevo = async (e) => {
    e.preventDefault();
    if (!nuevoIndepNombre.trim() || !nuevoIndepPropietario.trim() || !nuevoIndepUser.trim() || !nuevoIndepPass.trim()) return;

    const id = generarCodigoUnico('barbero');
    if (supabaseConfigured) {
      try {
        await requestStaffApi('/api/tenants/create', {
          method: 'POST',
          body: JSON.stringify({
            id,
            publicCode: id,
            name: nuevoIndepNombre.trim(),
            entityType: 'independent',
            email: nuevoEmailIndep.trim(),
            password: nuevoIndepPass,
            username: nuevoIndepUser.trim(),
            displayName: nuevoIndepPropietario.trim()
          })
        });
      } catch (error) {
        alert(error.message);
        return;
      }
    }

    const nuevoIndep = {
      id,
      entityId: id,
      codigoPublico: id,
      nombreBarberia: nuevoIndepNombre.trim(),
      nombreAnterior: 'Perfil Creado por Dev',
      username: nuevoIndepUser.trim().toLowerCase(),
      clave: supabaseConfigured ? '' : nuevoIndepPass.trim(),
      propietario: nuevoIndepPropietario.trim(),
      estadoLicencia: 'Activa',
      bloqueadoDesarrollador: false,
      billingCycleDays: 30,
      billingCycleStartedAt: new Date().toISOString(),
      accessBlocked: false,
      diasRestantes: 30,
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
    setNuevoEmailIndep('');
    setNuevoIndepPass('');
    alert(supabaseConfigured
      ? '¡Perfil independiente creado! Ya puede ingresar con su correo y contraseña de Supabase.'
      : '¡Perfil independiente creado exitosamente!');
  };

  const handleModificarClaveBarberoDev = (e, barberoId) => {
    e.preventDefault();
    if (!nuevaClaveBarberoDev.trim()) return;
    setBarberos(barberos.map(b => b.id === barberoId ? { ...b, claveAcceso: nuevaClaveBarberoDev.trim() } : b));
    setBarberoEditandoClave(null);
    setNuevaClaveBarberoDev('');
    alert('¡Contraseña del barbero modificada con éxito!');
  };

  const actualizarEstadoCuenta = (id, patch, setter, cuentas) => {
    const cuenta = cuentas.find(item => item.id === id);
    if (!cuenta) return;
    const next = {};
    if (patch.licenseStatus !== undefined) {
      next.estadoLicencia = patch.licenseStatus === 'active' ? 'Activa' : 'Pausada (Vencida)';
      next.diasRestantes = patch.licenseStatus === 'active' ? 30 : 0;
    }
    if (patch.developerBlocked !== undefined) next.bloqueadoDesarrollador = patch.developerBlocked;
    const save = async () => {
      try {
        await actualizarTenantServidor(id, patch);
        setter(cuentas.map(item => item.id === id ? { ...item, ...next } : item));
      } catch (error) {
        alert(error.message);
      }
    };
    if (supabaseConfigured) {
      save();
      return;
    }
    setter(cuentas.map(item => item.id === id ? { ...item, ...next } : item));
  };

  const togglePausarTenant = (id) => {
    const account = tenants.find(t => t.id === id);
    if (!account) return;
    const licenseStatus = account.estadoLicencia === 'Activa' ? 'paused' : 'active';
    actualizarEstadoCuenta(id, { licenseStatus }, setTenants, tenants);
  };

  const toggleBloqueoDesarrolladorTenant = (id) => {
    const account = tenants.find(t => t.id === id);
    if (!account) return;
    actualizarEstadoCuenta(id, { developerBlocked: !account.bloqueadoDesarrollador }, setTenants, tenants);
  };

  const toggleBloqueoDesarrolladorIndependiente = (id) => {
    const account = perfilesIndependientes.find(pi => pi.id === id);
    if (!account) return;
    actualizarEstadoCuenta(id, { developerBlocked: !account.bloqueadoDesarrollador }, setPerfilesIndependientes, perfilesIndependientes);
  };

  const togglePausarIndependiente = (id) => {
    const account = perfilesIndependientes.find(pi => pi.id === id);
    if (!account) return;
    const licenseStatus = account.estadoLicencia === 'Activa' ? 'paused' : 'active';
    actualizarEstadoCuenta(id, { licenseStatus }, setPerfilesIndependientes, perfilesIndependientes);
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
    setTenantVistaDesarrolladorId(tenantObj.id);
    setPerfilVistaDesarrolladorId(null);
    setActiveRole('admin');
  };

  const accederIndependienteTiempoReal = (piObj) => {
    alert(`Accediendo en tiempo real a la barbería independiente de ${piObj.propietario}.`);
    setPerfilVistaDesarrolladorId(piObj.id);
    setTenantVistaDesarrolladorId(null);
    setActiveRole('barbero_independiente');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ borderBottom: '1px solid rgba(245, 158, 11, 0.2)', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fbbf24', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Server style={{ width: '20px', height: '20px' }} /> Consola Desarrollador ({supabaseConfigured ? 'Autenticación Supabase' : superAdminCreds.username})
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '11px', margin: '2px 0 0 0' }}>Administración global, WhatsApp de renovación, credenciales root y control de licencias</p>
        </div>
        <span style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>Acceso Root</span>
      </div>

      <div style={{ backgroundColor: '#0f172a', border: '1px solid #059669', padding: '16px', borderRadius: '12px' }}>
        <h3 style={{ margin: '0 0 8px 0', color: '#34d399', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MessageCircle style={{ width: '16px', height: '16px' }} /> Identidad de la plataforma y WhatsApp de soporte
        </h3>
        <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 10px 0' }}>El nombre del proyecto es global y solo se modifica desde esta consola; el nombre de cada barbería se administra por separado.</p>
        <form onSubmit={handleWhatsappSave} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={nombrePlataforma}
            onChange={(e) => setNombrePlataforma(e.target.value)}
            placeholder="Nombre de la plataforma"
            aria-label="Nombre de la plataforma"
            style={{ flex: 1, backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '12px', minWidth: '200px' }}
          />
          <input 
            type="text" 
            value={whatsapp} 
            onChange={(e) => setWhatsapp(e.target.value)} 
            placeholder="Ej: 573001234567" 
            aria-label="WhatsApp de soporte"
            style={{ flex: 1, backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '12px', minWidth: '200px' }} 
            required 
          />
          <button type="submit" style={{ backgroundColor: '#059669', color: '#fff', fontWeight: 'bold', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Guardar cambios</button>
        </form>
      </div>

      {!supabaseConfigured && <div style={{ backgroundColor: '#0f172a', border: '1px solid #3b82f6', padding: '16px', borderRadius: '12px' }}>
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
      </div>}

      {supabaseConfigured && <div style={{ backgroundColor: '#0f172a', border: '1px solid #3b82f6', padding: '16px', borderRadius: '12px' }}>
        <h3 style={{ margin: '0 0 8px 0', color: '#60a5fa', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Key style={{ width: '16px', height: '16px' }} /> Cambiar mi contraseña de desarrollador
        </h3>
        <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 10px 0' }}>La contraseña se actualiza en tu cuenta personal de acceso.</p>
        <form onSubmit={handleCambiarClaveDesarrollador} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
          <input type="password" autoComplete="new-password" aria-label="Nueva contraseña de desarrollador" placeholder="Nueva contraseña (mínimo 8 caracteres)" value={nuevaClaveDesarrollador} onChange={(e) => setNuevaClaveDesarrollador(e.target.value)} minLength={8} required style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} />
          <input type="password" autoComplete="new-password" aria-label="Confirmar contraseña de desarrollador" placeholder="Confirmar nueva contraseña" value={confirmarClaveDesarrollador} onChange={(e) => setConfirmarClaveDesarrollador(e.target.value)} minLength={8} required style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} />
          <button type="submit" style={{ backgroundColor: '#3b82f6', color: '#fff', fontWeight: 'bold', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Actualizar contraseña</button>
        </form>
      </div>}

      <div style={{ backgroundColor: '#0f172a', border: '1px solid #f59e0b', padding: '16px', borderRadius: '12px' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#fbbf24', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <PlusSquare style={{ width: '16px', height: '16px' }} /> Crear Nueva Barbería / Sede SaaS (Con Credenciales de Administrador Propias)
        </h3>
        <form onSubmit={handleCrearTenant} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
          <input type="text" placeholder="Nombre de la barbería..." value={nuevoNombreBarberia} onChange={(e) => setNuevoNombreBarberia(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} required />
          <input type="text" placeholder="Propietario / Admin..." value={nuevoDuenoBarberia} onChange={(e) => setNuevoDuenoBarberia(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} required />
          <input type="text" placeholder="Usuario login admin" value={nuevoUserTenant} onChange={(e) => setNuevoUserTenant(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} required />
          {supabaseConfigured && <input type="email" placeholder="Correo de acceso del administrador" value={nuevoEmailTenant} onChange={(e) => setNuevoEmailTenant(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} required />}
          <input type="password" placeholder="Contraseña admin" value={nuevoPassTenant} onChange={(e) => setNuevoPassTenant(e.target.value)} autoComplete="new-password" style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} required />
          <input type="text" placeholder="WhatsApp contacto" value={nuevoWpBarberia} onChange={(e) => setNuevoWpBarberia(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} />
          <button type="submit" style={{ backgroundColor: '#f59e0b', color: '#020617', fontWeight: 'bold', padding: '8px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '11px', gridColumn: '1 / -1' }}>Registrar Barbería SaaS</button>
        </form>
      </div>

      <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '16px', borderRadius: '12px' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#fbbf24', fontSize: '14px' }}>Control SaaS: Sedes Registradas, Temporizadores y Acceso de Administrador</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tenants.map(t => (
            <div key={t.id} style={{ backgroundColor: '#020617', padding: '14px', borderRadius: '8px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <span style={{ fontSize: '13px', color: '#fff', fontWeight: 'bold' }}>{t.nombreBarberia} ({t.dueno})</span>
                  <p style={{ fontSize: '10px', color: '#a5b4fc', margin: '2px 0 0 0' }}>Código para clientes: <strong>{t.codigoPublico || t.id}</strong></p>
                  <p style={{ fontSize: '10px', color: '#fbbf24', margin: '2px 0 0 0' }}>
                    {supabaseConfigured ? 'Acceso de administrador administrado por Supabase.' : <>Usuario Admin: <strong>{t.usernameAdmin || 'admin'}</strong> · La contraseña no se muestra.</>}
                  </p>
                  <p style={{ fontSize: '10px', color: '#38bdf8', margin: '2px 0 0 0' }}>⏳ Temporizador: <strong>{t.diasRestantes ?? 30} días restantes</strong> ({t.estadoLicencia}){t.bloqueadoDesarrollador ? ' · Bloqueo de mantenimiento activo' : ''}</p>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button type="button" onClick={() => accederTenantTiempoReal(t)} style={{ backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>Ver</button>
                  <button type="button" onClick={() => iniciarEdicionTenant(t)} style={{ backgroundColor: '#f59e0b', color: '#020617', border: 'none', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>{supabaseConfigured ? 'Editar nombre' : 'Editar Clave Admin'}</button>
                  {supabaseConfigured && t.authUserId && <button type="button" onClick={() => { setCuentaRestableciendoId(t.authUserId); setNuevaClaveCuenta(''); }} style={{ backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>Restablecer clave</button>}
                  {supabaseConfigured && t.authUserId && <button type="button" onClick={() => handleCambiarAccesoCuenta(t.authUserId, t.accessDisabled ? 'activate' : 'revoke')} style={{ backgroundColor: t.accessDisabled ? '#065f46' : '#7f1d1d', color: '#fff', border: 'none', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>{t.accessDisabled ? 'Habilitar acceso' : 'Anular acceso'}</button>}
                  <button type="button" onClick={() => togglePausarTenant(t.id)} style={{ backgroundColor: t.estadoLicencia === 'Activa' ? '#78350f' : '#065f46', color: t.estadoLicencia === 'Activa' ? '#fcd34d' : '#34d399', border: 'none', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>{t.estadoLicencia === 'Activa' ? 'Pausar' : 'Activar'}</button>
                  <button type="button" onClick={() => toggleBloqueoDesarrolladorTenant(t.id)} style={{ backgroundColor: t.bloqueadoDesarrollador ? '#065f46' : '#7f1d1d', color: '#fff', border: 'none', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>{t.bloqueadoDesarrollador ? 'Quitar bloqueo técnico' : 'Bloquear por mantenimiento'}</button>
                  {!supabaseConfigured && <button type="button" onClick={() => eliminarTenant(t.id, t.nombreBarberia)} style={{ backgroundColor: '#450a0a', color: '#f87171', border: '1px solid #ef4444', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>Eliminar</button>}
                </div>
              </div>

              {supabaseConfigured && cuentaRestableciendoId === t.authUserId && (
                <form onSubmit={(e) => handleRestablecerClaveCuenta(e, t.authUserId)} style={{ display: 'flex', gap: '6px' }}>
                  <input type="password" autoComplete="new-password" placeholder="Nueva contraseña (mínimo 8 caracteres)" value={nuevaClaveCuenta} onChange={(e) => setNuevaClaveCuenta(e.target.value)} required minLength={8} style={{ flex: 1, backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '6px', borderRadius: '4px', fontSize: '10px' }} />
                  <button type="submit" style={{ backgroundColor: '#059669', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>Guardar</button>
                </form>
              )}

              {tenantEditandoId === t.id && (
                <form onSubmit={(e) => handleGuardarTenantDev(e, t.id)} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px', marginTop: '10px', borderTop: '1px solid #1e293b', paddingTop: '10px' }}>
                  <input type="text" placeholder="Nombre barbería" value={editTenantNombre} onChange={(e) => setEditTenantNombre(e.target.value)} style={{ backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '6px', borderRadius: '4px', fontSize: '10px' }} required />
                  {!supabaseConfigured && <>
                    <input type="text" placeholder="Propietario / Admin" value={editTenantDueno} onChange={(e) => setEditTenantDueno(e.target.value)} style={{ backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '6px', borderRadius: '4px', fontSize: '10px' }} required />
                    <input type="text" placeholder="Usuario admin" value={editTenantUser} onChange={(e) => setEditTenantUser(e.target.value)} style={{ backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '6px', borderRadius: '4px', fontSize: '10px' }} required />
                    <input type="password" placeholder="Nueva contraseña admin (opcional)" autoComplete="new-password" value={editTenantPass} onChange={(e) => setEditTenantPass(e.target.value)} style={{ backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '6px', borderRadius: '4px', fontSize: '10px' }} />
                    <input type="text" placeholder="WhatsApp" value={editTenantWp} onChange={(e) => setEditTenantWp(e.target.value)} style={{ backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '6px', borderRadius: '4px', fontSize: '10px' }} required />
                  </>}
                  {supabaseConfigured && <p style={{ gridColumn: '1 / -1', margin: 0, color: '#94a3b8', fontSize: '10px' }}>Las credenciales de acceso se gestionan de forma segura en Supabase.</p>}
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
          <Edit3 style={{ width: '16px', height: '16px' }} /> Administrar Perfiles Independientes / Solistas
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          {perfilesIndependientes.map(pi => (
            <div key={pi.id} style={{ backgroundColor: '#020617', padding: '12px', borderRadius: '8px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <span style={{ fontSize: '13px', color: '#fff', fontWeight: 'bold' }}>⭐ {pi.nombreBarberia} ({pi.propietario})</span>
                  <p style={{ fontSize: '10px', color: '#a5b4fc', margin: '2px 0 0 0' }}>Código para clientes: <strong>{pi.codigoPublico || pi.id}</strong></p>
                  <p style={{ fontSize: '10px', color: '#fbbf24', margin: '2px 0 0 0' }}>
                    {supabaseConfigured ? 'Acceso administrado por Supabase.' : <>Usuario: <strong>{pi.username}</strong> · La contraseña no se muestra.</>} | Ciclo: {pi.billingCycleDays || 30} días, restan {diasCicloRestantes(pi, currentTime)} · Licencia: {pi.diasRestantes} días{pi.bloqueadoDesarrollador ? ' · Bloqueo de mantenimiento activo' : ''}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <select value={pi.billingCycleDays || 30} onChange={(e) => handleCicloIndependiente(pi.id, e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '4px', borderRadius: '4px', fontSize: '10px' }}>
                    <option value={8}>Ciclo cada 8 días</option>
                    <option value={15}>Ciclo cada 15 días</option>
                    <option value={30}>Ciclo cada 30 días</option>
                  </select>
                  <button type="button" onClick={() => handleBloquearIndependiente(pi)} style={{ backgroundColor: barberoBloqueado(pi, currentTime) ? '#065f46' : '#92400e', color: '#fff', border: 'none', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>
                    {barberoBloqueado(pi, currentTime) ? 'Activar y reiniciar ciclo' : 'Bloquear acceso'}
                  </button>
                  <button type="button" onClick={() => accederIndependienteTiempoReal(pi)} style={{ backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>Ver</button>
                  <button type="button" onClick={() => iniciarEdicionIndependiente(pi)} style={{ backgroundColor: '#f59e0b', color: '#020617', border: 'none', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>{supabaseConfigured ? 'Editar nombre' : 'Editar Claves'}</button>
                  {supabaseConfigured && pi.authUserId && <button type="button" onClick={() => { setCuentaRestableciendoId(pi.authUserId); setNuevaClaveCuenta(''); }} style={{ backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>Restablecer clave</button>}
                  {supabaseConfigured && pi.authUserId && <button type="button" onClick={() => handleCambiarAccesoCuenta(pi.authUserId, pi.accessDisabled ? 'activate' : 'revoke')} style={{ backgroundColor: pi.accessDisabled ? '#065f46' : '#7f1d1d', color: '#fff', border: 'none', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>{pi.accessDisabled ? 'Habilitar acceso' : 'Anular acceso'}</button>}
                  <button type="button" onClick={() => togglePausarIndependiente(pi.id)} style={{ backgroundColor: pi.estadoLicencia === 'Activa' ? '#78350f' : '#065f46', color: pi.estadoLicencia === 'Activa' ? '#fcd34d' : '#34d399', border: 'none', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>
                    {pi.estadoLicencia === 'Activa' ? 'Pausar' : 'Activar'}
                  </button>
                  <button type="button" onClick={() => toggleBloqueoDesarrolladorIndependiente(pi.id)} style={{ backgroundColor: pi.bloqueadoDesarrollador ? '#065f46' : '#7f1d1d', color: '#fff', border: 'none', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>
                    {pi.bloqueadoDesarrollador ? 'Quitar bloqueo técnico' : 'Bloquear por mantenimiento'}
                  </button>
                  {!supabaseConfigured && <button type="button" onClick={() => eliminarPerfilIndependiente(pi.id, pi.nombreBarberia)} style={{ backgroundColor: '#450a0a', color: '#f87171', border: '1px solid #ef4444', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>Eliminar</button>}
                </div>
              </div>

              {supabaseConfigured && cuentaRestableciendoId === pi.authUserId && (
                <form onSubmit={(e) => handleRestablecerClaveCuenta(e, pi.authUserId)} style={{ display: 'flex', gap: '6px' }}>
                  <input type="password" autoComplete="new-password" placeholder="Nueva contraseña (mínimo 8 caracteres)" value={nuevaClaveCuenta} onChange={(e) => setNuevaClaveCuenta(e.target.value)} required minLength={8} style={{ flex: 1, backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '6px', borderRadius: '4px', fontSize: '10px' }} />
                  <button type="submit" style={{ backgroundColor: '#059669', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>Guardar</button>
                </form>
              )}

              {perfilIndepEditandoId === pi.id && (
                <form onSubmit={(e) => handleGuardarIndependienteDev(e, pi.id)} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px', marginTop: '10px', borderTop: '1px solid #1e293b', paddingTop: '10px' }}>
                  <input type="text" placeholder="Nombre barbería" value={editIndepNombre} onChange={(e) => setEditIndepNombre(e.target.value)} style={{ backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '6px', borderRadius: '4px', fontSize: '10px' }} required />
                  {!supabaseConfigured && <>
                    <input type="text" placeholder="Propietario" value={editIndepPropietario} onChange={(e) => setEditIndepPropietario(e.target.value)} style={{ backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '6px', borderRadius: '4px', fontSize: '10px' }} required />
                    <input type="text" placeholder="Usuario" value={editIndepUser} onChange={(e) => setEditIndepUser(e.target.value)} style={{ backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '6px', borderRadius: '4px', fontSize: '10px' }} required />
                    <input type="password" placeholder="Nueva contraseña (opcional)" autoComplete="new-password" value={editIndepClave} onChange={(e) => setEditIndepClave(e.target.value)} style={{ backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '6px', borderRadius: '4px', fontSize: '10px' }} />
                  </>}
                  {supabaseConfigured && <p style={{ gridColumn: '1 / -1', margin: 0, color: '#94a3b8', fontSize: '10px' }}>Las credenciales de acceso se gestionan de forma segura en Supabase.</p>}
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
          {supabaseConfigured && <input type="email" placeholder="Correo de acceso (Supabase)" value={nuevoEmailIndep} onChange={(e) => setNuevoEmailIndep(e.target.value)} style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} required />}
          <input type="password" placeholder="Contraseña" value={nuevoIndepPass} onChange={(e) => setNuevoIndepPass(e.target.value)} autoComplete="new-password" style={{ backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }} required />
          <button type="submit" style={{ backgroundColor: '#3b82f6', color: '#fff', fontWeight: 'bold', padding: '8px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '11px', gridColumn: '1 / -1' }}>Crear Perfil Independiente Nuevo</button>
        </form>
      </div>

      <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '14px', borderRadius: '10px' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#fbbf24', fontSize: '13px' }}>{supabaseConfigured ? 'Cuentas de barberos y control de acceso' : 'Control Desarrollador: Cuentas de Barberos de la Sede'}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
          {barberos.map(b => (
            <div key={b.id} style={{ backgroundColor: '#020617', padding: '12px', borderRadius: '8px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '12px', color: '#fff', fontWeight: 'bold' }}>{b.nombre}</span>
                  <p style={{ fontSize: '10px', color: '#fbbf24', margin: '2px 0 0 0' }}>
                    Usuario: <strong>{b.username}</strong> · La contraseña no se muestra.
                  </p>
                </div>
                {supabaseConfigured && b.authUserId && <button type="button" onClick={() => { setCuentaRestableciendoId(b.authUserId); setNuevaClaveCuenta(''); }} style={{ backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>Restablecer clave</button>}
                {supabaseConfigured && b.authUserId && <button type="button" onClick={() => handleCambiarAccesoCuenta(b.authUserId, b.accessDisabled ? 'activate' : 'revoke')} style={{ backgroundColor: b.accessDisabled ? '#065f46' : '#7f1d1d', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>{b.accessDisabled ? 'Habilitar acceso' : 'Anular acceso'}</button>}
                {!supabaseConfigured && <button type="button" onClick={() => setBarberoEditandoClave(barberoEditandoClave === b.id ? null : b.id)} style={{ backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>
                  {barberoEditandoClave === b.id ? 'Cancelar' : 'Modificar Clave'}
                </button>}
              </div>

              {supabaseConfigured && cuentaRestableciendoId === b.authUserId && (
                <form onSubmit={(e) => handleRestablecerClaveCuenta(e, b.authUserId)} style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                  <input type="password" autoComplete="new-password" placeholder="Nueva contraseña (mínimo 8 caracteres)" value={nuevaClaveCuenta} onChange={(e) => setNuevaClaveCuenta(e.target.value)} required minLength={8} style={{ flex: 1, backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '4px', borderRadius: '4px', fontSize: '10px' }} />
                  <button type="submit" style={{ backgroundColor: '#059669', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>Guardar</button>
                </form>
              )}

              {!supabaseConfigured && barberoEditandoClave === b.id && (
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