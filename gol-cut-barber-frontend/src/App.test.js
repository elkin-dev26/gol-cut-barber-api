import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  localStorage.clear();
  jest.spyOn(window, 'alert').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
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
