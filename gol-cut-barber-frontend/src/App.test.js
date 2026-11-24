import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';

const clipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard');

beforeEach(() => {
  localStorage.clear();
  jest.spyOn(window, 'alert').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
  if (clipboardDescriptor) {
    Object.defineProperty(navigator, 'clipboard', clipboardDescriptor);
  } else {
    delete navigator.clipboard;
  }
});

const iniciarSesion = (usuario, clave) => {
  fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
  fireEvent.change(screen.getByPlaceholderText('Ej: admin, elkin, independiente'), { target: { value: usuario } });
  fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: clave } });
  fireEvent.click(screen.getByRole('button', { name: 'Validar Sesión' }));
};

test('mantiene el nombre de la plataforma independiente del nombre de la sede', () => {
  localStorage.setItem('gol_cut_dev_config', JSON.stringify({ nombrePlataforma: 'PLATAFORMA ELEGANTE' }));
  localStorage.setItem('gol_cut_tenants', JSON.stringify([
    { id: 'sede-1', nombreBarberia: 'Barbería del Administrador', estadoLicencia: 'Activa', diasRestantes: 30 }
  ]));

  render(<App />);

  expect(screen.getByRole('heading', { name: 'PLATAFORMA ELEGANTE' })).toBeInTheDocument();
  expect(document.title).toBe('PLATAFORMA ELEGANTE');
});

test('busca directamente una barbería mediante su código público', () => {
  render(<App />);

  fireEvent.change(screen.getByLabelText('Ingresa el código de la barbería o del barbero independiente'), {
    target: { value: 't2' }
  });
  fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));

  expect(screen.getByText('Barbería Mijares')).toBeInTheDocument();
  expect(screen.getByText('t2')).toBeInTheDocument();
});

test('pausar la agenda de una sede no afecta a las demás', () => {
  localStorage.setItem('gol_cut_tenants', JSON.stringify([
    {
      id: 't1',
      nombreBarberia: 'Sede Uno',
      estadoLicencia: 'Activa',
      diasRestantes: 30,
      usernameAdmin: 'admin',
      passwordAdmin: 'admin123'
    },
    {
      id: 't2',
      nombreBarberia: 'Sede Dos',
      estadoLicencia: 'Activa',
      diasRestantes: 30,
      usernameAdmin: 'mijares',
      passwordAdmin: 'mijares2026'
    }
  ]));

  render(<App />);
  iniciarSesion('admin', 'admin123');
  fireEvent.click(screen.getByRole('button', { name: 'Ajustes & Tiempos' }));
  fireEvent.click(screen.getByRole('button', { name: 'Pausar Sede' }));
  fireEvent.click(screen.getByRole('button', { name: /Salir/ }));

  fireEvent.change(screen.getByLabelText('Ingresa el código de la barbería o del barbero independiente'), {
    target: { value: 't2' }
  });
  fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));
  expect(screen.queryByText('Agenda Temporalmente Suspendida')).not.toBeInTheDocument();

  fireEvent.change(screen.getByLabelText('Ingresa el código de la barbería o del barbero independiente'), {
    target: { value: 't1' }
  });
  fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));
  expect(screen.getByText('Agenda Temporalmente Suspendida')).toBeInTheDocument();
});

test('guarda y recupera cambios del catálogo al volver a iniciar sesión', () => {
  const firstRender = render(<App />);
  iniciarSesion('admin', 'admin123');
  fireEvent.click(screen.getByRole('button', { name: 'Servicios & Precios' }));
  fireEvent.change(screen.getByPlaceholderText('Nombre nuevo corte / servicio...'), { target: { value: 'Corte Persistente' } });
  fireEvent.change(screen.getByPlaceholderText('Precio ($)'), { target: { value: '40000' } });
  fireEvent.click(screen.getByRole('button', { name: 'Crear Servicio' }));

  expect(JSON.parse(localStorage.getItem('gol_cut_services'))).toEqual(
    expect.arrayContaining([expect.objectContaining({ nombre: 'Corte Persistente', precio: 40000 })])
  );
  firstRender.unmount();

  render(<App />);
  iniciarSesion('admin', 'admin123');
  fireEvent.click(screen.getByRole('button', { name: 'Servicios & Precios' }));
  expect(screen.getByText('Corte Persistente')).toBeInTheDocument();
});

test('el desarrollador puede abrir la sede específica seleccionada para repararla', () => {
  localStorage.setItem('gol_cut_tenants', JSON.stringify([
    {
      id: 't1',
      nombreBarberia: 'Sede Uno',
      estadoLicencia: 'Activa',
      diasRestantes: 30,
      usernameAdmin: 'admin',
      passwordAdmin: 'admin123'
    },
    {
      id: 't2',
      nombreBarberia: 'Sede Dos',
      estadoLicencia: 'Activa',
      diasRestantes: 30,
      usernameAdmin: 'mijares',
      passwordAdmin: 'mijares2026'
    }
  ]));

  render(<App />);
  iniciarSesion('elkin-dev26', 'elkin2026');
  fireEvent.click(screen.getAllByRole('button', { name: 'Entrar' })[1]);
  fireEvent.click(screen.getByRole('button', { name: 'Ajustes & Tiempos' }));

  expect(screen.getByRole('heading', { name: 'Credenciales de Administrador (Sede Dos)' })).toBeInTheDocument();
});

test('bloquea el panel de una sede pausada y conserva solo la activación por WhatsApp', () => {
  localStorage.setItem('gol_cut_tenants', JSON.stringify([
    {
      id: 't2',
      nombreBarberia: 'Barbería Mijares',
      estadoLicencia: 'Pausada (Vencida)',
      diasRestantes: 0,
      usernameAdmin: 'mijares',
      passwordAdmin: 'mijares2026'
    }
  ]));

  render(<App />);
  iniciarSesion('mijares', 'mijares2026');

  expect(screen.getByRole('link', { name: /Solicitar activación por WhatsApp/ })).toBeInTheDocument();
  expect(screen.queryByText(/Control de Pausa \/ Bloqueo General Sede/)).not.toBeInTheDocument();
});

test('bloquea también las cuentas de barberos independientes pausadas', () => {
  localStorage.setItem('gol_cut_perfiles_independientes', JSON.stringify([
    {
      id: 'indep-1',
      nombreBarberia: 'Barbería Independiente',
      propietario: 'Barbero Independiente',
      username: 'independiente',
      clave: 'clave123',
      estadoLicencia: 'Pausada (Vencida)',
      diasRestantes: 0
    }
  ]));

  render(<App />);
  iniciarSesion('independiente', 'clave123');

  expect(screen.getByRole('link', { name: /Solicitar activación por WhatsApp/ })).toBeInTheDocument();
});

test('impide el inicio de sesión local de un barbero bloqueado', () => {
  localStorage.setItem('gol_cut_barberos', JSON.stringify([
    {
      id: 'barber-1',
      username: 'elkin',
      nombre: 'Elkin Ramírez',
      claveAcceso: 'barbero123',
      estado: 'Activo',
      accessBlocked: true,
      sedeId: 't1'
    }
  ]));

  render(<App />);
  iniciarSesion('elkin', 'barbero123');

  expect(screen.getByText('La cuenta está bloqueada. Solo el administrador puede volver a activarla.')).toBeInTheDocument();
  expect(screen.queryByText('Panel Barbero - Elkin Ramírez')).not.toBeInTheDocument();
});

test('el estado explícito desbloqueado prevalece sobre un indicador de bloqueo antiguo', () => {
  localStorage.setItem('gol_cut_barberos', JSON.stringify([
    {
      id: 'barber-1',
      username: 'elkin',
      nombre: 'Elkin Ramírez',
      claveAcceso: 'barbero123',
      estado: 'Activo',
      accessBlocked: false,
      isLocked: true,
      billingCycleDays: 30,
      billingCycleStartedAt: new Date().toISOString(),
      sedeId: 't1'
    }
  ]));

  render(<App />);
  iniciarSesion('elkin', 'barbero123');

  expect(screen.getByText('Panel Barbero - Elkin Ramírez')).toBeInTheDocument();
  expect(screen.queryByText('La cuenta está bloqueada. Solo el administrador puede volver a activarla.')).not.toBeInTheDocument();
});

test('una sede con cero días restantes queda bloqueada y muestra aviso de vencimiento', () => {
  localStorage.setItem('gol_cut_tenants', JSON.stringify([
    {
      id: 't1',
      nombreBarberia: 'Sede Activa',
      estadoLicencia: 'Activa',
      diasRestantes: 0,
      bloqueadoDesarrollador: false
    }
  ]));

  render(<App />);
  iniciarSesion('elkin', 'barbero123');

  expect(screen.getByText('Suscripción vencida')).toBeInTheDocument();
  expect(screen.queryByText('Panel Barbero - Elkin Ramírez')).not.toBeInTheDocument();
});

test('el vencimiento de barbero bloquea su acceso aunque la sede siga activa', () => {
  localStorage.setItem('gol_cut_tenants', JSON.stringify([
    {
      id: 't1',
      nombreBarberia: 'Sede Activa',
      estadoLicencia: 'Activa',
      diasRestantes: 23,
      bloqueadoDesarrollador: false
    }
  ]));
  localStorage.setItem('gol_cut_barberos', JSON.stringify([
    {
      id: 'barber-1',
      username: 'elkin',
      nombre: 'Elkin Ramírez',
      claveAcceso: 'barbero123',
      estado: 'Activo',
      accessBlocked: false,
      isLocked: true,
      billingCycleDays: 30,
      billingCycleStartedAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString(),
      sedeId: 't1'
    }
  ]));

  render(<App />);
  iniciarSesion('elkin', 'barbero123');

  expect(screen.getByText(/La suscripción de esta cuenta venció/i)).toBeInTheDocument();
  expect(screen.queryByText('Panel Barbero - Elkin Ramírez')).not.toBeInTheDocument();
});

test('el consolidado del barbero incluye citas confirmadas o completadas de hoy', () => {
  const hoy = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const ayer = new Date(Date.now() - new Date().getTimezoneOffset() * 60000 - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  localStorage.setItem('gol_cut_last_reset', String(Date.now()));
  localStorage.setItem('gol_cut_citas_mes', JSON.stringify([
    { id: 'hoy-1', barbero: 'Elkin Ramírez', fecha: hoy, precio: 42000, estado: 'completada' },
    { id: 'hoy-confirmada', barbero: 'Elkin Ramírez', fecha: hoy, precio: 10000, estado: 'confirmada' },
    { id: 'ayer-1', barbero: 'Elkin Ramírez', fecha: ayer, precio: 80000, estado: 'completada' },
    { id: 'hoy-2', barbero: 'Elkin Ramírez', fecha: hoy, precio: 15000, estado: 'cancelada' }
  ]));

  render(<App />);
  iniciarSesion('elkin', 'barbero123');

  const consolidado = screen.getByText(/Consolidado Ganancias:/);
  expect(consolidado.textContent).toContain((52000).toLocaleString());
  expect(consolidado.textContent).not.toContain((132000).toLocaleString());
  expect(consolidado.textContent).not.toContain((67000).toLocaleString());
});

test('confirmar una cita de hoy actualiza el consolidado y conserva el estado', async () => {
  const hoy = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  localStorage.setItem('gol_cut_last_reset', String(Date.now()));
  localStorage.setItem('gol_cut_citas_mes', JSON.stringify([
    { id: 'cita-pendiente', barbero: 'Elkin Ramírez', fecha: hoy, precio: 32000, estado: 'confirmada' }
  ]));

  render(<App />);
  iniciarSesion('elkin', 'barbero123');
  expect(screen.getByText(/Consolidado Ganancias:/).textContent).toContain((32000).toLocaleString());
  fireEvent.click(screen.getByRole('button', { name: 'Atendido' }));

  await waitFor(() => {
    expect(screen.getByText(/Consolidado Ganancias:/).textContent).toContain((32000).toLocaleString());
    expect(JSON.parse(localStorage.getItem('gol_cut_citas_mes'))[0].estado).toBe('completada');
  });
});

test('el cobro presencial del barbero se suma al consolidado diario', async () => {
  localStorage.setItem('gol_cut_last_reset', String(Date.now()));
  localStorage.setItem('gol_cut_citas_mes', JSON.stringify([]));

  render(<App />);
  iniciarSesion('elkin', 'barbero123');
  fireEvent.click(screen.getByRole('button', { name: 'Registrar Cobro' }));

  await waitFor(() => {
    expect(screen.getByText(/Consolidado Ganancias:/).textContent).toContain((25000).toLocaleString());
    expect(JSON.parse(localStorage.getItem('gol_cut_citas_mes'))[0]).toEqual(expect.objectContaining({
      estado: 'completada',
      fecha: expect.any(String),
      precio: 25000
    }));
  });
});

test('el consolidado independiente suma citas confirmadas como atendidas y cobros walk-in de hoy', async () => {
  const hoy = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const ayer = new Date(Date.now() - new Date().getTimezoneOffset() * 60000 - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  localStorage.setItem('gol_cut_last_reset', String(Date.now()));
  localStorage.setItem('gol_cut_citas_mes', JSON.stringify([
    { id: 'indep-hoy', bookingEntityId: 'indep_tenant', fecha: hoy, precio: 31000, estado: 'confirmada' },
    { id: 'indep-ayer', bookingEntityId: 'indep_tenant', fecha: ayer, precio: 90000, estado: 'completada' }
  ]));

  render(<App />);
  iniciarSesion('independiente', 'solo2026');
  expect(screen.getByText('💰 Consolidado Ganancias Hoy').parentElement.textContent).toContain((31000).toLocaleString());
  fireEvent.click(screen.getByRole('button', { name: 'Sumar a mi Caja' }));

  await waitFor(() => {
    expect(screen.getByText('💰 Consolidado Ganancias Hoy').parentElement.textContent).toContain((61000).toLocaleString());
  });
});

test('los perfiles con administrador e independiente pueden cargar y conservar su logo', async () => {
  const { unmount } = render(<App />);
  iniciarSesion('admin', 'admin123');
  const logoSede = screen.getByLabelText('Cargar logo de Gol Cut Barber - Sede Principal');
  const archivoLogo = new File(['logo-demo'], 'logo.png', { type: 'image/png' });
  fireEvent.change(logoSede, { target: { files: [archivoLogo] } });
  await waitFor(() => {
    const sedes = JSON.parse(localStorage.getItem('gol_cut_tenants'));
    expect(sedes.find(tenant => tenant.id === 't1').logo).toMatch(/^data:image\/png;base64,/);
  });
  unmount();

  render(<App />);
  iniciarSesion('independiente', 'solo2026');
  const logoIndependiente = screen.getByLabelText('Cargar logo de Barbería Independiente (Solista)');
  fireEvent.change(logoIndependiente, { target: { files: [archivoLogo] } });
  await waitFor(() => {
    const perfiles = JSON.parse(localStorage.getItem('gol_cut_perfiles_independientes'));
    expect(perfiles[0].logo).toMatch(/^data:image\/png;base64,/);
  });
});

test('el desarrollador puede revisar, reemplazar y quitar logos de sedes y perfiles independientes', async () => {
  const logoInicial = 'data:image/png;base64,aGVsbG8=';
  localStorage.setItem('gol_cut_tenants', JSON.stringify([
    { id: 'shop-1', codigoPublico: 'shop-1', nombreBarberia: 'Barbería Uno', estadoLicencia: 'Activa', diasRestantes: 30, logo: logoInicial },
    { id: 'shop-2', codigoPublico: 'shop-2', nombreBarberia: 'Barbería Dos', estadoLicencia: 'Activa', diasRestantes: 30, logo: logoInicial }
  ]));
  localStorage.setItem('gol_cut_perfiles_independientes', JSON.stringify([
    { id: 'indep-1', nombreBarberia: 'Perfil Solista', propietario: 'Barbero Uno', estadoLicencia: 'Activa', diasRestantes: 30, logo: logoInicial, serviciosPropios: [] }
  ]));

  render(<App />);
  iniciarSesion('elkin-dev26', 'elkin2026');

  expect(screen.getByAltText('Logo de Barbería Uno')).toBeInTheDocument();
  expect(screen.getByAltText('Logo de Barbería Dos')).toBeInTheDocument();
  expect(screen.getByAltText('Logo de Perfil Solista')).toBeInTheDocument();

  const archivoLogo = new File(['nuevo-logo'], 'logo.png', { type: 'image/png' });
  fireEvent.change(screen.getByLabelText('Cargar logo de Barbería Uno'), { target: { files: [archivoLogo] } });
  await waitFor(() => {
    const sedes = JSON.parse(localStorage.getItem('gol_cut_tenants'));
    expect(sedes.find(tenant => tenant.id === 'shop-1').logo).not.toBe(logoInicial);
  });

  fireEvent.click(screen.getAllByRole('button', { name: 'Quitar logo' })[0]);
  await waitFor(() => {
    const sedes = JSON.parse(localStorage.getItem('gol_cut_tenants'));
    expect(sedes.find(tenant => tenant.id === 'shop-1').logo).toBe('');
    expect(sedes.find(tenant => tenant.id === 'shop-2').logo).toBe(logoInicial);
  });
});

test('el administrador ve y puede copiar el código de búsqueda de su sede', async () => {
  const writeText = jest.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText }
  });

  render(<App />);
  iniciarSesion('admin', 'admin123');

  expect(screen.getByText('t1')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Copiar código de búsqueda t1' }));

  await waitFor(() => expect(writeText).toHaveBeenCalledWith('t1'));
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Código copiado.'));
});

test('el perfil independiente ve y puede copiar su código de búsqueda', async () => {
  const writeText = jest.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText }
  });

  render(<App />);
  iniciarSesion('independiente', 'solo2026');

  expect(screen.getByText('indep_tenant')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Copiar código de búsqueda indep_tenant' }));

  await waitFor(() => expect(writeText).toHaveBeenCalledWith('indep_tenant'));
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Código copiado.'));
});
