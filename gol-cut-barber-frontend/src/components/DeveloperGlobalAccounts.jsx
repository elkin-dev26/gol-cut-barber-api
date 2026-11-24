import React, { useMemo, useState } from 'react';

const DAY_MS = 24 * 60 * 60 * 1000;
const currencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0
});
const dateFormatter = new Intl.DateTimeFormat('es-CO', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
});

const monthKeyFor = (timestamp) => {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const accountExpiry = (account) => {
  if (!account?.billingCycleStartedAt) return null;
  const startedAt = new Date(account.billingCycleStartedAt).getTime();
  if (!Number.isFinite(startedAt)) return null;
  const days = Number(account.billingCycleDays) || 30;
  return new Date(startedAt + days * DAY_MS);
};

const isEntityActive = (account, now) => {
  const expiry = accountExpiry(account);
  return account?.active !== false
    && !account?.pausado
    && !(account?.accessBlocked ?? account?.isLocked)
    && !account?.accessDisabled
    && (!expiry || expiry.getTime() > now);
};

const summarizeMonth = (appointments, matches) => {
  const rows = appointments.filter(matches);
  const income = rows.reduce((total, appointment) => {
    const status = appointment.estado || appointment.status;
    if (!['completada', 'completed'].includes(status)) return total;
    return total + (Number(appointment.precio ?? appointment.price) || 0);
  }, 0);
  return { appointments: rows.length, income };
};

const formatExpiry = (date) => (date ? dateFormatter.format(date) : 'No configurada');

export default function DeveloperGlobalAccounts({
  tenants,
  barbers,
  independentProfiles,
  appointments,
  currentTime,
  canDelete,
  onToggleStatus,
  onHardDelete,
  onViewTenant,
  onViewIndependent
}) {
  const [filter, setFilter] = useState('');
  const [busyKey, setBusyKey] = useState('');

  const accounts = useMemo(() => {
    const now = currentTime;
    const monthKey = monthKeyFor(now);
    const independentIds = new Set(independentProfiles.map(profile => profile.id));
    const venueRows = tenants
      .filter(tenant => !independentIds.has(tenant.id))
      .map(tenant => {
        const stats = summarizeMonth(
          appointments,
          appointment => appointment.establecimientoId === tenant.id
            && String(appointment.fecha || '').slice(0, 7) === monthKey
        );
        return {
          key: `tenant:${tenant.id}`,
          kind: 'tenant',
          id: tenant.id,
          tenantId: tenant.id,
          userId: tenant.authUserId,
          name: tenant.nombreBarberia || tenant.id,
          role: 'Administrador de barbería',
          location: tenant.nombreBarberia || tenant.id,
          source: tenant,
          active: tenant.estadoLicencia === 'Activa'
            && !tenant.bloqueadoDesarrollador
            && !tenant.accessDisabled,
          expiry: null,
          stats
        };
      });

    const barberRows = barbers.map(barber => {
      const location = tenants.find(tenant => tenant.id === barber.sedeId);
      const stats = summarizeMonth(
        appointments,
        appointment => appointment.bookingEntityId === barber.id
          && String(appointment.fecha || '').slice(0, 7) === monthKey
      );
      return {
        key: `barber:${barber.id}`,
        kind: 'barber',
        id: barber.id,
        tenantId: barber.sedeId,
        userId: barber.authUserId,
        name: barber.nombre || barber.propietario || barber.username || barber.id,
        role: 'Barbero',
        location: location?.nombreBarberia || barber.sedeId || 'Sin sede',
        source: barber,
        tenant: location,
        active: isEntityActive(barber, now),
        expiry: accountExpiry(barber),
        stats
      };
    });

    const independentRows = independentProfiles.map(profile => {
      const location = tenants.find(tenant => tenant.id === (profile.sedeId || profile.id));
      const stats = summarizeMonth(
        appointments,
        appointment => appointment.bookingEntityId === profile.id
          && String(appointment.fecha || '').slice(0, 7) === monthKey
      );
      const expiry = accountExpiry(profile);
      return {
        key: `independent:${profile.id}`,
        kind: 'independent',
        id: profile.id,
        tenantId: profile.sedeId || profile.id,
        userId: profile.authUserId,
        name: profile.nombreBarberia || profile.nombre || profile.id,
        role: 'Barbero independiente',
        location: profile.nombreBarberia || location?.nombreBarberia || profile.id,
        source: profile,
        active: profile.estadoLicencia === 'Activa'
          && !profile.bloqueadoDesarrollador
          && isEntityActive(profile, now),
        expiry,
        stats
      };
    });

    return [...venueRows, ...barberRows, ...independentRows];
  }, [tenants, barbers, independentProfiles, appointments, currentTime]);

  const normalizedFilter = filter.trim().toLocaleLowerCase('es');
  const visibleAccounts = accounts.filter(account => (
    !normalizedFilter
    || [account.name, account.role, account.location, account.id]
      .some(value => String(value || '').toLocaleLowerCase('es').includes(normalizedFilter))
  ));

  const confirmDelete = async (account) => {
    const scope = account.kind === 'barber'
      ? 'Se eliminarán su perfil y sus citas asociadas.'
      : 'Se eliminarán la sede, sus cuentas asociadas y sus citas.';
    if (!window.confirm(`¿Eliminar definitivamente "${account.name}"? ${scope}`)) return;
    if (window.prompt('Para confirmar, escribe ELIMINAR:') !== 'ELIMINAR') return;

    setBusyKey(account.key);
    try {
      await onHardDelete(account);
    } catch (error) {
      window.alert(error.message || 'No se pudo eliminar la cuenta.');
    } finally {
      setBusyKey('');
    }
  };

  const toggleStatus = async (account) => {
    setBusyKey(account.key);
    try {
      await onToggleStatus(account);
    } catch (error) {
      window.alert(error.message || 'No se pudo cambiar el estado de la cuenta.');
    } finally {
      setBusyKey('');
    }
  };

  return (
    <section style={{ backgroundColor: '#0f172a', border: '1px solid #475569', padding: '16px', borderRadius: '12px' }}>
      <h3 style={{ margin: '0 0 8px', color: '#e2e8f0', fontSize: '14px' }}>
        Control Global de Cuentas y Barberos
      </h3>
      <p style={{ margin: '0 0 12px', color: '#94a3b8', fontSize: '11px' }}>
        Busca por sede, barbero o perfil independiente. Los ingresos corresponden a citas completadas del mes actual.
      </p>
      <input
        type="search"
        value={filter}
        onChange={event => setFilter(event.target.value)}
        placeholder="Filtrar por sede o barbero independiente"
        aria-label="Filtrar cuentas por sede o barbero independiente"
        style={{ width: '100%', maxWidth: '420px', boxSizing: 'border-box', marginBottom: '12px', backgroundColor: '#020617', color: '#fff', border: '1px solid #475569', padding: '8px', borderRadius: '6px', fontSize: '12px' }}
      />
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: '980px', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
          <thead>
            <tr style={{ color: '#cbd5e1', borderBottom: '1px solid #475569' }}>
              {['Nombre', 'Rol', 'Sede vinculada', 'Estado', 'Vigencia / vencimiento', 'Citas del mes', 'Ingresos del mes', 'Acciones'].map(label => (
                <th key={label} scope="col" style={{ padding: '9px 8px', whiteSpace: 'nowrap' }}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleAccounts.map(account => (
              <tr key={account.key} style={{ color: '#e2e8f0', borderBottom: '1px solid #1e293b' }}>
                <td style={{ padding: '9px 8px' }}>{account.name}</td>
                <td style={{ padding: '9px 8px' }}>{account.role}</td>
                <td style={{ padding: '9px 8px' }}>{account.location}</td>
                <td style={{ padding: '9px 8px', color: account.active ? '#34d399' : '#fca5a5', fontWeight: 'bold' }}>
                  {account.active ? 'Activo' : 'Anulado'}
                </td>
                <td style={{ padding: '9px 8px', whiteSpace: 'nowrap' }}>{formatExpiry(account.expiry)}</td>
                <td style={{ padding: '9px 8px' }}>{account.stats.appointments}</td>
                <td style={{ padding: '9px 8px', whiteSpace: 'nowrap' }}>{currencyFormatter.format(account.stats.income)}</td>
                <td style={{ padding: '9px 8px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    <button
                      type="button"
                      onClick={() => account.kind === 'independent'
                        ? onViewIndependent(account.source)
                        : onViewTenant(account.kind === 'barber' ? account.tenant : account.source)}
                      disabled={account.kind === 'barber' && !account.tenant}
                      style={{ backgroundColor: '#2563eb', color: '#fff', border: 0, padding: '5px 7px', borderRadius: '5px', cursor: 'pointer' }}
                    >
                      Ver
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleStatus(account)}
                      disabled={busyKey === account.key}
                      style={{ backgroundColor: account.active ? '#92400e' : '#047857', color: '#fff', border: 0, padding: '5px 7px', borderRadius: '5px', cursor: 'pointer' }}
                    >
                      {account.active ? 'Anular' : 'Activar'}
                    </button>
                    {canDelete && account.id && (
                      <button
                        type="button"
                        onClick={() => confirmDelete(account)}
                        disabled={busyKey === account.key}
                        style={{ backgroundColor: '#b91c1c', color: '#fff', border: 0, padding: '5px 7px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        Eliminar definitivamente
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!visibleAccounts.length && (
              <tr>
                <td colSpan="8" style={{ padding: '14px 8px', color: '#94a3b8', textAlign: 'center' }}>
                  No hay cuentas que coincidan con el filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
