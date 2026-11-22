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
  fireEvent.click(screen.getAllByRole('button', { name: 'Ver' })[1]);
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

test('una sede activa permite iniciar sesión aunque el contador local esté en cero', () => {
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

  expect(screen.getByText('Panel Barbero - Elkin Ramírez')).toBeInTheDocument();
  expect(screen.queryByText('Cuenta temporalmente bloqueada')).not.toBeInTheDocument();
});

test('el ciclo vencido del barbero no bloquea el panel de una sede activa', () => {
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

  expect(screen.getByText('Panel Barbero - Elkin Ramírez')).toBeInTheDocument();
  expect(screen.queryByText('Cuenta temporalmente bloqueada')).not.toBeInTheDocument();
});

test('el consolidado del barbero suma solo servicios completados de hoy', () => {
  const hoy = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const ayer = new Date(Date.now() - new Date().getTimezoneOffset() * 60000 - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  localStorage.setItem('gol_cut_last_reset', String(Date.now()));
  localStorage.setItem('gol_cut_citas_mes', JSON.stringify([
    { id: 'hoy-1', barbero: 'Elkin Ramírez', fecha: hoy, precio: 42000, estado: 'completada' },
    { id: 'ayer-1', barbero: 'Elkin Ramírez', fecha: ayer, precio: 80000, estado: 'completada' },
    { id: 'hoy-2', barbero: 'Elkin Ramírez', fecha: hoy, precio: 15000, estado: 'cancelada' }
  ]));

  render(<App />);
  iniciarSesion('elkin', 'barbero123');

  const consolidado = screen.getByText(/Consolidado Ganancias:/);
  expect(consolidado.textContent).toContain((42000).toLocaleString());
  expect(consolidado.textContent).not.toContain((122000).toLocaleString());
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
