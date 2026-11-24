import React from 'react';

export const defaultSubscriptionPlan = () => ({ kind: 'preset', days: 30 });

export default function SubscriptionPlanSelector({ value, onChange, label = 'Plan de suscripción' }) {
  const plan = value || defaultSubscriptionPlan();
  const selectedValue = plan.kind === 'indefinite'
    ? 'indefinite'
    : plan.kind === 'custom'
      ? 'custom'
      : String(plan.days);

  return (
    <div>
      <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>
        {label}
      </label>
      <select
        aria-label={label}
        value={selectedValue}
        onChange={event => {
          if (event.target.value === 'indefinite') {
            onChange({ kind: 'indefinite', days: null });
          } else if (event.target.value === 'custom') {
            onChange({ kind: 'custom', days: '' });
          } else {
            onChange({ kind: 'preset', days: Number(event.target.value) });
          }
        }}
        style={{ width: '100%', backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }}
      >
        <option value="30">1 mes (30 días)</option>
        <option value="60">2 meses (60 días)</option>
        <option value="90">3 meses (90 días)</option>
        <option value="180">6 meses (180 días)</option>
        <option value="365">1 año (365 días)</option>
        <option value="custom">Días personalizados</option>
        <option value="indefinite">Indefinido (Demo / Sin vencimiento)</option>
      </select>
      {plan.kind === 'custom' && (
        <input
          aria-label="Días personalizados"
          type="number"
          min="1"
          max="3650"
          step="1"
          value={plan.days}
          onChange={event => onChange({ ...plan, days: event.target.value })}
          placeholder="Cantidad de días (1–3650)"
          style={{ width: '100%', boxSizing: 'border-box', marginTop: '6px', backgroundColor: '#020617', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '6px', fontSize: '11px' }}
        />
      )}
    </div>
  );
}
