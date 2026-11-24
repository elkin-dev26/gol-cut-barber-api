import React from 'react';

const guides = {
  admin: {
    title: 'Guía de uso · Administrador',
    items: [
      'Consulta las citas y organiza la operación de tu propia sede.',
      'Administra los servicios, las tarifas, los incentivos y el equipo de barberos de esta sede.',
      'Revisa la actividad de tus barberos y bloquea o activa sus accesos cuando corresponda.',
      'La administración global de cuentas y suscripciones pertenece al Desarrollador.'
    ]
  },
  barber: {
    title: 'Guía de uso · Barbero de sede',
    items: [
      'Consulta tus citas asignadas, registra atenciones y justifica las anulaciones.',
      'Registra cobros y revisa tus incentivos disponibles.',
      'Activa las alertas del navegador para recibir avisos de nuevas citas.',
      'El cambio de contraseña aparece al cumplir 90 días desde el último cambio; los datos de acceso son de solo lectura.'
    ]
  },
  independent: {
    title: 'Guía de uso · Barbero independiente',
    items: [
      'Administra tu agenda, tus servicios y tus citas independientes.',
      'Registra las atenciones y los cobros de tu propia actividad.',
      'Activa las alertas del navegador para recibir avisos de nuevas citas.',
      'Tu perfil y suscripción son independientes de las sedes y de los barberos vinculados a ellas.'
    ]
  },
  developer: {
    title: 'Guía de uso · Desarrollador',
    items: [
      'Administra sedes, administradores, barberos de sede y perfiles independientes como cuentas separadas.',
      'Consulta vencimientos, actividad, renovaciones y el historial de auditoría de cada cuenta.',
      'Activa el Escudo de Producción para endurecer las reservas públicas y ocultar datos internos en consultas por código.',
      'La gestión operativa diaria de las citas corresponde a cada sede o perfil profesional.'
    ]
  }
};

export default function RoleGuide({ role }) {
  const guide = guides[role];
  if (!guide) return null;

  return (
    <section
      aria-labelledby={`role-guide-${role}`}
      style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '12px' }}
    >
      <h3 id={`role-guide-${role}`} style={{ margin: '0 0 8px', color: '#fbbf24', fontSize: '13px' }}>
        {guide.title}
      </h3>
      <ul style={{ margin: 0, paddingLeft: '18px', color: '#cbd5e1', fontSize: '11px', lineHeight: 1.7 }}>
        {guide.items.map(item => <li key={item}>{item}</li>)}
      </ul>
    </section>
  );
}
