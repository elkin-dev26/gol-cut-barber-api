import React, { useMemo, useState } from 'react';
import SubscriptionPlanSelector, { defaultSubscriptionPlan } from './SubscriptionPlanSelector';
import AccountInspectionPanel from './AccountInspectionPanel';

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
  if (account?.isIndefinite) return null;
  if (account?.expiresAt) {
    const expiresAt = new Date(account.expiresAt);
    return Number.isNaN(expiresAt.getTime()) ? null : expiresAt;
  }
  if (!account?.billingCycleStartedAt) return null;
  const startedAt = new Date(account.billingCycleStartedAt).getTime();
  if (!Number.isFinite(startedAt)) return null;
  const days = Number(account.billingCycleDays) || 30;
  return new Date(startedAt + days * DAY_MS);
};

const isEntityActive = (account, now) => {
  const expiry = accountExpiry(account);
  return account?.isIndefinite
    ? account?.active !== false
      && !account?.pausado
      && !(account?.accessBlocked ?? account?.isLocked)
      && !account?.accessDisabled
    : account?.active !== false
    && !account?.pausado
    && !(account?.accessBlocked ?? account?.isLocked)
    && !account?.accessDisabled
    && (!expiry || expiry.getTime() > now);
};
const isTenantActive = (tenant, now) => {
  if (!tenant) return false;
  const expiry = accountExpiry(tenant);
  return tenant.estadoLicencia === 'Activa'
    && !tenant.bloqueadoDesarrollador
    && !tenant.accessDisabled
    && (tenant.isIndefinite || !expiry || expiry.getTime() > now);
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

const formatExpiry = (date, isIndefinite) => (
  isIndefinite ? 'Indefinido' : date ? dateFormatter.format(date) : '—'
);
const isInactive = (account, now) => {
  const lastActiveAt = account?.lastActiveAt || account?.createdAt;
  const timestamp = lastActiveAt ? new Date(lastActiveAt).getTime() : NaN;
  return Number.isFinite(timestamp) && now - timestamp >= 30 * DAY_MS;
};

export default function DeveloperGlobalAccounts({
  tenants,
  barbers,
  independentProfiles,
  appointments,
  currentTime,
  canDelete,
  onRenewSubscription,
  onToggleStatus,
  onHardDelete,
  onViewTenant,
  onViewIndependent,
  productionShieldEnabled,
  onToggleProductionShield,
  shieldSaving,
  shieldError
}) {
  const [filter, setFilter] = useState('');
  const [busyKey, setBusyKey] = useState('');
  const [selectedPlans, setSelectedPlans] = useState({});
  const [selectedAccount, setSelectedAccount] = useState(null);

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
          active: isTenantActive(tenant, now),
          expiry: accountExpiry(tenant),
          isIndefinite: tenant.isIndefinite,
          lastActiveAt: tenant.lastActiveAt,
          createdAt: tenant.createdAt,
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
        active: isTenantActive(location, now) && isEntityActive(barber, now),
        expiry: accountExpiry(barber),
        isIndefinite: barber.isIndefinite,
        lastActiveAt: barber.lastActiveAt,
        createdAt: barber.createdAt,
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
        active: isTenantActive(location || profile, now) && isEntityActive(profile, now),
        expiry,
        isIndefinite: profile.isIndefinite,
        lastActiveAt: profile.lastActiveAt,
        createdAt: profile.createdAt,
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
  const inactiveAccounts = accounts.filter(account => isInactive(account.source, currentTime));

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

  const renewSubscription = async (account) => {
    const plan = selectedPlans[account.key] || defaultSubscriptionPlan();
    const days = Number(plan.days);
    if (plan.kind !== 'indefinite' && (!Number.isInteger(days) || days < 1 || days > 3650)) {
      window.alert('Ingresa una cantidad válida de días (1–3650).');
      return;
    }
    setBusyKey(account.key);
    try {
      await onRenewSubscription(account, {
        subscriptionDays: plan.kind === 'indefinite' ? null : days,
        isIndefinite: plan.kind === 'indefinite'
      });
    } catch (error) {
      window.alert(error.message || 'No se pudo renovar la suscripción.');
    } finally {
      setBusyKey('');
    }
  };

  return (
    <>
    <section style={{ backgroundColor: '#0f172a', border: '1px solid #475569', padding: '16px', borderRadius: '12px' }}>
      <h3 style={{ margin: '0 0 8px', color: '#e2e8f0', fontSize: '14px' }}>
        Control Global de Cuentas y Barberos
      </h3>
      <p style={{ margin: '0 0 12px', color: '#94a3b8', fontSize: '11px' }}>
        Busca por sede, barbero o perfil independiente. Los ingresos corresponden a citas completadas del mes actual.
      </p>
      {inactiveAccounts.length > 0 && (
        <div role="status" style={{ marginBottom: '12px', padding: '9px', border: '1px solid #f59e0b', borderRadius: '6px', backgroundColor: '#451a03', color: '#fde68a', fontSize: '11px' }}>
          Cuentas sin actividad por 30 días o más: {inactiveAccounts.map(account => account.name).join(', ')}.
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '12px', padding: '10px', border: '1px solid #334155', borderRadius: '7px', backgroundColor: '#020617' }}>
          <div>
            <strong style={{ color: '#e2e8f0', fontSize: '12px' }}>Escudo de Producción Real</strong>
            <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '10px' }}>
              Reduce intentos de reserva pública, oculta campos internos en búsquedas por código y exige origen permitido para crear sedes.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-label="Escudo de Producción Real"
            aria-checked={Boolean(productionShieldEnabled)}
            disabled={!onToggleProductionShield || shieldSaving}
            onClick={onToggleProductionShield}
            style={{ width: '48px', height: '26px', padding: '3px', border: 0, borderRadius: '999px', backgroundColor: productionShieldEnabled ? '#059669' : '#475569', cursor: !onToggleProductionShield || shieldSaving ? 'not-allowed' : 'pointer', opacity: shieldSaving ? 0.6 : 1 }}
          >
            <span aria-hidden="true" style={{ display: 'block', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#fff', transform: productionShieldEnabled ? 'translateX(22px)' : 'translateX(0)', transition: 'transform 150ms ease' }} />
          </button>
      </div>
      {shieldError && <p role="alert" style={{ color: '#fca5a5', fontSize: '11px', margin: '-4px 0 12px' }}>{shieldError}</p>}
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
              {['Nombre', 'Rol', 'Sede vinculada', 'Estado', 'Vigencia / vencimiento', 'Actividad', 'Citas del mes', 'Ingresos del mes', 'Renovar / acciones'].map(label => (
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
                  {account.active
                    ? 'Activo'
                    : !account.isIndefinite && account.expiry && account.expiry.getTime() <= currentTime
                      ? 'Suscripción vencida'
                      : 'Anulado'}
                </td>
                <td style={{ padding: '9px 8px', whiteSpace: 'nowrap' }}>{formatExpiry(account.expiry, account.isIndefinite)}</td>
                <td style={{ padding: '9px 8px', color: isInactive(account.source, currentTime) ? '#fca5a5' : '#94a3b8' }}>
                  {isInactive(account.source, currentTime) ? 'Inactivo ≥30 días' : 'Actividad reciente'}
                </td>
                <td style={{ padding: '9px 8px' }}>{account.stats.appointments}</td>
                <td style={{ padding: '9px 8px', whiteSpace: 'nowrap' }}>{currencyFormatter.format(account.stats.income)}</td>
                <td style={{ padding: '9px 8px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    <div style={{ minWidth: '170px' }}>
                      <SubscriptionPlanSelector
                        label={`Plan para ${account.name}`}
                        value={selectedPlans[account.key] || defaultSubscriptionPlan()}
                        onChange={plan => setSelectedPlans(current => ({ ...current, [account.key]: plan }))}
                      />
                      <button
                        type="button"
                        onClick={() => renewSubscription(account)}
                        disabled={busyKey === account.key}
                        style={{ width: '100%', marginTop: '5px', backgroundColor: '#059669', color: '#fff', border: 0, padding: '5px 7px', borderRadius: '5px', cursor: 'pointer' }}
                      >
                        Aplicar / renovar
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedAccount(account)}
                      style={{ backgroundColor: '#2563eb', color: '#fff', border: 0, padding: '5px 7px', borderRadius: '5px', cursor: 'pointer' }}
                    >
                      Ver
                    </button>
                    <button
                      type="button"
                      onClick={() => account.kind === 'independent'
                        ? onViewIndependent(account.source)
                        : onViewTenant(account.kind === 'barber' ? account.tenant : account.source)}
                      disabled={account.kind === 'barber' && !account.tenant}
                      style={{ backgroundColor: '#334155', color: '#fff', border: 0, padding: '5px 7px', borderRadius: '5px', cursor: 'pointer' }}
                    >
                      Entrar
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
                <td colSpan="9" style={{ padding: '14px 8px', color: '#94a3b8', textAlign: 'center' }}>
                  No hay cuentas que coincidan con el filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
    {selectedAccount && (
      <AccountInspectionPanel
        account={selectedAccount}
        onClose={() => setSelectedAccount(null)}
      />
    )}
    </>
  );
}
