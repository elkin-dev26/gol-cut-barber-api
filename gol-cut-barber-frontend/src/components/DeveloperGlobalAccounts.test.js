import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import DeveloperGlobalAccounts from './DeveloperGlobalAccounts';

const now = new Date(2026, 10, 23, 12).getTime();
const tenants = [{
  id: 'shop-1',
  nombreBarberia: 'Sede Central',
  estadoLicencia: 'Activa',
  authUserId: 'admin-user'
}];
const barbers = [{
  id: 'barber-1',
  nombre: 'Barbero Uno',
  sedeId: 'shop-1',
  authUserId: 'barber-user',
  active: true,
  billingCycleStartedAt: new Date(2026, 10, 1).toISOString(),
  billingCycleDays: 30
}];

const renderTable = (props = {}) => render(
  <DeveloperGlobalAccounts
    tenants={tenants}
    barbers={barbers}
    independentProfiles={[]}
    appointments={[
      {
        establecimientoId: 'shop-1',
        bookingEntityId: 'barber-1',
        fecha: '2026-11-12',
        estado: 'completada',
        precio: 25000
      },
      {
        establecimientoId: 'shop-1',
        bookingEntityId: 'barber-1',
        fecha: '2026-11-13',
        estado: 'cancelada',
        precio: 15000
      }
    ]}
    currentTime={now}
    canDelete
    onToggleStatus={jest.fn()}
    onHardDelete={jest.fn()}
    onViewTenant={jest.fn()}
    onViewIndependent={jest.fn()}
    {...props}
  />
);

test('developer accounts show monthly appointment counts and completed revenue', () => {
  renderTable();

  const barberRow = screen.getByRole('row', { name: /Barbero Uno/ });
  expect(barberRow).toHaveTextContent('Barbero');
  expect(barberRow).toHaveTextContent('2');
  expect(barberRow).toHaveTextContent(/25\.000/);
  expect(barberRow).toHaveTextContent('Sede Central');
});

test('filter finds accounts by linked site', () => {
  renderTable();

  fireEvent.change(screen.getByRole('searchbox', { name: 'Filtrar cuentas por sede o barbero independiente' }), {
    target: { value: 'Sede Central' }
  });

  expect(screen.getByRole('row', { name: /Barbero Uno/ })).toBeInTheDocument();
  expect(screen.getByRole('row', { name: /Administrador de barbería/ })).toBeInTheDocument();
});

test('definitive deletion is hidden unless enabled and requires both confirmations', async () => {
  const onHardDelete = jest.fn().mockResolvedValue(undefined);
  const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
  const promptSpy = jest.spyOn(window, 'prompt').mockReturnValue('ELIMINAR');
  const { unmount } = renderTable({ canDelete: true, onHardDelete });

  const deleteButton = screen.getAllByRole('button', { name: 'Eliminar definitivamente' })[0];
  fireEvent.click(deleteButton);
  await waitFor(() => expect(onHardDelete).toHaveBeenCalledTimes(1));
  await waitFor(() => expect(deleteButton).not.toBeDisabled());
  expect(confirmSpy).toHaveBeenCalledTimes(1);
  expect(promptSpy).toHaveBeenCalledWith('Para confirmar, escribe ELIMINAR:');

  confirmSpy.mockRestore();
  promptSpy.mockRestore();
  unmount();
  renderTable({ canDelete: false });
  expect(screen.queryByRole('button', { name: 'Eliminar definitivamente' })).not.toBeInTheDocument();
});

test('an annulled barber without an Auth user can still be definitively deleted', async () => {
  const onHardDelete = jest.fn().mockResolvedValue(undefined);
  const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
  const promptSpy = jest.spyOn(window, 'prompt').mockReturnValue('ELIMINAR');
  renderTable({
    barbers: [{ ...barbers[0], authUserId: null, active: false }],
    onHardDelete
  });

  const barberRow = screen.getByRole('row', { name: /Barbero Uno/ });
  expect(barberRow).toHaveTextContent('Anulado');
  const deleteButton = screen.getAllByRole('button', { name: 'Eliminar definitivamente' })[1];
  fireEvent.click(deleteButton);
  expect(deleteButton).toBeDisabled();

  await waitFor(() => expect(onHardDelete).toHaveBeenCalledWith(
    expect.objectContaining({ kind: 'barber', id: 'barber-1', userId: null })
  ));
  await waitFor(() => expect(deleteButton).not.toBeDisabled());
  expect(confirmSpy).toHaveBeenCalledTimes(1);
  expect(promptSpy).toHaveBeenCalledWith('Para confirmar, escribe ELIMINAR:');
  confirmSpy.mockRestore();
  promptSpy.mockRestore();
});

test('developer renewal sends the selected finite duration for the exact account', async () => {
  const onRenewSubscription = jest.fn().mockResolvedValue(undefined);
  renderTable({ onRenewSubscription });

  const barberRow = screen.getByRole('row', { name: /Barbero Uno/ });
  fireEvent.change(screen.getByLabelText('Plan para Barbero Uno'), {
    target: { value: '60' }
  });
  fireEvent.click(within(barberRow).getByRole('button', { name: 'Aplicar / renovar' }));

  await waitFor(() => expect(onRenewSubscription).toHaveBeenCalledWith(
    expect.objectContaining({ kind: 'barber', id: 'barber-1' }),
    { subscriptionDays: 60, isIndefinite: false }
  ));
  await waitFor(() => expect(within(barberRow).getByRole('button', { name: 'Aplicar / renovar' })).not.toBeDisabled());
});

test('developer accounts show exact expiration dates and inactivity notices', () => {
  renderTable({
    tenants: [{
      ...tenants[0],
      expiresAt: '2026-12-01T12:00:00.000Z',
      isIndefinite: false,
      createdAt: new Date(now - 31 * 24 * 60 * 60 * 1000).toISOString(),
      lastActiveAt: new Date(now - 31 * 24 * 60 * 60 * 1000).toISOString()
    }]
  });

  expect(screen.getByRole('row', { name: /Administrador de barbería/ })).toHaveTextContent('01/12/2026');
  expect(screen.getByRole('status')).toHaveTextContent('Sede Central');
});

test('Ver opens the selected account inspection instead of entering its panel', async () => {
  const onViewTenant = jest.fn();
  renderTable({ onViewTenant });

  const barberRow = screen.getByRole('row', { name: /Barbero Uno/ });
  fireEvent.click(within(barberRow).getByRole('button', { name: 'Ver' }));

  expect(await screen.findByRole('dialog', { name: /Inspección: Barbero Uno/ })).toBeInTheDocument();
  expect(onViewTenant).not.toHaveBeenCalled();
  expect(screen.getByRole('alert')).toHaveTextContent(/requiere una conexión configurada con Supabase/i);
});

test('developer can toggle the production shield from global accounts', () => {
  const onToggleProductionShield = jest.fn();
  renderTable({ onToggleProductionShield, productionShieldEnabled: false });

  const shield = screen.getByRole('switch', { name: 'Escudo de Producción Real' });
  expect(shield).not.toBeChecked();
  fireEvent.click(shield);
  expect(onToggleProductionShield).toHaveBeenCalledTimes(1);
});
