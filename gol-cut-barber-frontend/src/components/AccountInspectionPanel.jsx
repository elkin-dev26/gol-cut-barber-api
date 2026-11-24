import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase, supabaseConfigured } from '../supabaseClient';

const currencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0
});
const dateTimeFormatter = new Intl.DateTimeFormat('es-CO', {
  dateStyle: 'medium',
  timeStyle: 'short'
});

const auditTargetsAccount = (entry, accountKind, accountId, tenantId) => {
  if (accountKind !== 'barber') return true;
  const details = entry.details_before_after || {};
  return details.target_id === accountId
    || (details.target_type === 'tenant' && details.target_id === tenantId);
};

const appointmentStatusLabel = (status) => ({
  completed: 'Atendida',
  cancelled: 'Anulada',
  confirmed: 'Confirmada'
}[status] || status);

export default function AccountInspectionPanel({ account, onClose }) {
  const accountId = account.id;
  const accountKind = account.kind;
  const tenantId = account.tenantId;
  const [appointments, setAppointments] = useState([]);
  const [monthlySummaries, setMonthlySummaries] = useState([]);
  const [tenantSettings, setTenantSettings] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!supabaseConfigured || !supabase) {
      setError('La inspección en vivo requiere una conexión configurada con Supabase.');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let appointmentQuery = supabase
        .from('appointments')
        .select('id,tenant_id,booking_entity_id,service_name,appointment_date,appointment_time,price,status,created_at,cancellation_reason')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });
      if (accountKind !== 'tenant') {
        appointmentQuery = appointmentQuery.eq('booking_entity_id', accountId);
      }
      let summaryQuery = supabase
        .from('monthly_summaries')
        .select('barber_id,total_appointments,cancelled_appointments,total_revenue')
        .eq('barbershop_id', tenantId);
      if (accountKind !== 'tenant') {
        summaryQuery = summaryQuery.eq('barber_id', accountId);
      }

      const [appointmentResult, tenantResult, auditResult, summaryResult] = await Promise.all([
        appointmentQuery,
        supabase
          .from('tenants')
          .select('id,name,app_settings')
          .eq('id', tenantId)
          .maybeSingle(),
        supabase
          .from('audit_logs')
          .select('id,tenant_id,actor_name,actor_role,action_type,details_before_after,created_at')
          .eq('tenant_id', tenantId)
          .order('created_at', { ascending: false })
          .limit(100),
        summaryQuery
      ]);
      if (appointmentResult.error) throw appointmentResult.error;
      if (tenantResult.error) throw tenantResult.error;
      if (auditResult.error) throw auditResult.error;
      if (summaryResult.error) throw summaryResult.error;

      setAppointments(appointmentResult.data || []);
      setMonthlySummaries(summaryResult.data || []);
      setTenantSettings(tenantResult.data);
      setAuditLogs((auditResult.data || []).filter(entry => (
        auditTargetsAccount(entry, accountKind, accountId, tenantId)
      )));
      setError('');
    } catch (loadError) {
      setError(loadError.message || 'No se pudo cargar la inspección de la cuenta.');
    } finally {
      setLoading(false);
    }
  }, [accountId, accountKind, tenantId]);

  useEffect(() => {
    refresh();
    if (!supabaseConfigured || !supabase) return undefined;

    const channel = supabase
      .channel(`account-inspection-${accountKind}-${accountId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'appointments',
        filter: `tenant_id=eq.${tenantId}`
      }, refresh)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'audit_logs',
        filter: `tenant_id=eq.${tenantId}`
      }, refresh)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'tenants',
        filter: `id=eq.${tenantId}`
      }, refresh)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'monthly_summaries',
        filter: `barbershop_id=eq.${tenantId}`
      }, refresh)
      .subscribe(status => {
        setConnected(status === 'SUBSCRIBED');
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setError('No se pudo mantener la inspección en tiempo real.');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [accountId, accountKind, tenantId, refresh]);

  const metrics = useMemo(() => appointments.reduce((result, appointment) => {
    if (appointment.status === 'completed') {
      result.completed += 1;
      result.revenue += Number(appointment.price) || 0;
    }
    if (appointment.status === 'cancelled') result.cancelled += 1;
    return result;
  }, { completed: 0, cancelled: 0, revenue: 0 }), [appointments]);
  const archivedMetrics = useMemo(() => monthlySummaries.reduce((result, summary) => ({
    completed: result.completed + Number(summary.total_appointments || 0),
    cancelled: result.cancelled + Number(summary.cancelled_appointments || 0),
    revenue: result.revenue + (Number(summary.total_revenue) || 0)
  }), { completed: 0, cancelled: 0, revenue: 0 }), [monthlySummaries]);

  const appSettings = tenantSettings?.app_settings || {};
  const configuredServices = account.kind === 'independent'
    ? appSettings.independentServices?.[account.id] || []
    : appSettings.services || [];
  const services = Array.isArray(configuredServices) ? configuredServices : [];
  const activeIncentives = account.kind === 'independent'
    ? []
    : (appSettings.incentives || []).filter(incentive => incentive.activo === true);
  const chairFee = account.kind === 'independent' ? null : appSettings.chairFeeConfig;

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="account-inspection-title" style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(2, 6, 23, 0.88)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px', boxSizing: 'border-box' }}>
      <section style={{ width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '12px', padding: '16px', boxSizing: 'border-box' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
          <div>
            <h2 id="account-inspection-title" style={{ margin: 0, color: '#fbbf24', fontSize: '17px' }}>
              Inspección: {account.name}
            </h2>
            <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '11px' }}>
              {account.role} · {account.location} · {connected ? 'Actualización en vivo' : 'Conectando…'}
            </p>
          </div>
          <button type="button" onClick={onClose} style={{ backgroundColor: '#334155', color: '#fff', border: 0, borderRadius: '5px', padding: '6px 9px', cursor: 'pointer' }}>
            Cerrar
          </button>
        </header>

        {error && <p role="alert" style={{ color: '#fca5a5', fontSize: '12px' }}>{error}</p>}
        {loading && <p role="status" style={{ color: '#94a3b8', fontSize: '11px' }}>Actualizando datos de la cuenta…</p>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px', marginTop: '14px' }}>
          {[
            ['Citas atendidas', metrics.completed + archivedMetrics.completed],
            ['Citas anuladas', metrics.cancelled + archivedMetrics.cancelled],
            ['Ingresos atendidos', currencyFormatter.format(metrics.revenue + archivedMetrics.revenue)],
            ['Incentivos activos', activeIncentives.length]
          ].map(([label, value]) => (
            <div key={label} style={{ backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '7px', padding: '10px' }}>
              <span style={{ display: 'block', color: '#94a3b8', fontSize: '10px' }}>{label}</span>
              <strong style={{ display: 'block', color: '#e2e8f0', fontSize: '15px', marginTop: '4px' }}>{value}</strong>
            </div>
          ))}
        </div>

        <section style={{ marginTop: '14px' }}>
          <h3 style={{ margin: '0 0 7px', color: '#fbbf24', fontSize: '12px' }}>Tarifas vigentes</h3>
          {chairFee && (
            <p style={{ margin: '0 0 6px', color: '#cbd5e1', fontSize: '11px' }}>
              Tarifa de silla: {chairFee.tipo || 'fijo'} · {currencyFormatter.format(Number(chairFee.valor) || 0)}
            </p>
          )}
          {services.length
            ? <ul style={{ margin: 0, paddingLeft: '18px', color: '#cbd5e1', fontSize: '11px', lineHeight: 1.7 }}>
              {services.map((service, index) => (
                <li key={service.id || `${service.nombre || service.name}-${index}`}>
                  {service.nombre || service.name || 'Servicio'}: {currencyFormatter.format(Number(service.precio ?? service.price) || 0)}
                </li>
              ))}
            </ul>
            : <p style={{ margin: 0, color: '#94a3b8', fontSize: '11px' }}>No hay servicios configurados.</p>}
        </section>

        {activeIncentives.length > 0 && (
          <section style={{ marginTop: '14px' }}>
            <h3 style={{ margin: '0 0 7px', color: '#fbbf24', fontSize: '12px' }}>Incentivos activos</h3>
            <ul style={{ margin: 0, paddingLeft: '18px', color: '#cbd5e1', fontSize: '11px', lineHeight: 1.7 }}>
              {activeIncentives.map((incentive, index) => (
                <li key={incentive.id || `${incentive.titulo || incentive.title}-${index}`}>
                  {incentive.titulo || incentive.title || 'Incentivo'}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section style={{ marginTop: '16px' }}>
          <h3 style={{ margin: '0 0 7px', color: '#fbbf24', fontSize: '12px' }}>Historial cronológico</h3>
          {auditLogs.length
            ? <ol style={{ margin: 0, paddingLeft: '20px', color: '#cbd5e1', fontSize: '11px' }}>
              {auditLogs.map(entry => (
                <li key={entry.id} style={{ marginBottom: '8px' }}>
                  <strong>{entry.action_type}</strong> · {entry.actor_name} ({entry.actor_role}) · {dateTimeFormatter.format(new Date(entry.created_at))}
                  <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', color: '#94a3b8', fontSize: '10px', margin: '4px 0 0' }}>
                    {JSON.stringify(entry.details_before_after, null, 2)}
                  </pre>
                </li>
              ))}
            </ol>
            : <p style={{ margin: 0, color: '#94a3b8', fontSize: '11px' }}>Todavía no hay eventos de auditoría para esta cuenta.</p>}
        </section>

        <section style={{ marginTop: '16px' }}>
          <h3 style={{ margin: '0 0 7px', color: '#fbbf24', fontSize: '12px' }}>Citas recientes</h3>
          {appointments.length
            ? <ul style={{ margin: 0, paddingLeft: '18px', color: '#cbd5e1', fontSize: '11px', lineHeight: 1.7 }}>
              {appointments.slice(0, 20).map(appointment => (
                <li key={appointment.id}>
                  {appointment.appointment_date} {appointment.appointment_time} · {appointment.service_name} · {appointmentStatusLabel(appointment.status)} · {currencyFormatter.format(Number(appointment.price) || 0)}
                </li>
              ))}
            </ul>
            : <p style={{ margin: 0, color: '#94a3b8', fontSize: '11px' }}>No hay citas registradas para esta cuenta.</p>}
        </section>
      </section>
    </div>
  );
}
