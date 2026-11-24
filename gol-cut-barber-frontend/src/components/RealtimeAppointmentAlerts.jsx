import React, { useEffect, useRef, useState } from 'react';
import { supabase, supabaseConfigured } from '../supabaseClient';

export default function RealtimeAppointmentAlerts({ entityId, onAppointmentReceived }) {
  const [permission, setPermission] = useState(
    typeof window !== 'undefined' && typeof window.Notification === 'function'
      ? window.Notification.permission
      : 'unsupported'
  );
  const [connected, setConnected] = useState(false);
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState('');
  const [alertsActivated, setAlertsActivated] = useState(false);
  const audioContextRef = useRef(null);

  useEffect(() => {
    if (!supabaseConfigured || !supabase || !entityId) return undefined;

    const channel = supabase
      .channel(`appointments-${entityId}-${Date.now()}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'appointments',
        filter: `booking_entity_id=eq.${entityId}`
      }, payload => {
        const appointment = payload.new;
        onAppointmentReceived(appointment);
        setNotice(appointment);

        if (permission === 'granted') {
          try {
            if (audioContextRef.current) {
              const context = audioContextRef.current;
              const oscillator = context.createOscillator();
              const gain = context.createGain();
              oscillator.frequency.value = 880;
              gain.gain.value = 0.06;
              oscillator.connect(gain);
              gain.connect(context.destination);
              oscillator.start();
              oscillator.stop(context.currentTime + 0.14);
            }
            const browserNotification = new window.Notification('Nueva cita', {
              body: `${appointment.customer_name} · ${appointment.service_name} · ${appointment.appointment_date} ${appointment.appointment_time}`
            });
            browserNotification.onclick = () => window.focus();
          } catch (notificationError) {
            setError(notificationError.message || 'No se pudo mostrar la alerta de nueva cita.');
          }
        }
      })
      .subscribe(status => {
        setConnected(status === 'SUBSCRIBED');
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setError('No se pudo mantener la conexión en tiempo real para las citas.');
        }
      });

    return () => {
      supabase.removeChannel(channel);
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [entityId, onAppointmentReceived, permission]);

  const enableAlerts = async () => {
    setError('');
    if (typeof window.Notification !== 'function') {
      setPermission('unsupported');
      setError('Este navegador no admite notificaciones del sistema.');
      return;
    }

    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    if (AudioContextConstructor) {
      try {
        if (!audioContextRef.current) audioContextRef.current = new AudioContextConstructor();
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }
      } catch (audioError) {
        setError(audioError.message || 'No se pudo habilitar el sonido de las alertas.');
      }
    }

    try {
      const nextPermission = permission === 'granted'
        ? permission
        : await window.Notification.requestPermission();
      setPermission(nextPermission);
      if (nextPermission !== 'granted') {
        setError(nextPermission === 'denied'
          ? 'Las notificaciones están bloqueadas en los permisos del navegador.'
          : 'No se concedió permiso para las notificaciones.');
        return;
      }
      setAlertsActivated(true);
    } catch (permissionError) {
      setError(permissionError.message || 'No se pudo solicitar permiso para las notificaciones.');
    }
  };

  return (
    <section style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <strong style={{ color: connected ? '#34d399' : '#fbbf24', fontSize: '12px' }}>
            {connected ? 'Citas en tiempo real conectadas' : 'Conectando las citas en tiempo real…'}
          </strong>
          <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '10px' }}>
            {permission === 'denied'
              ? 'Las notificaciones están bloqueadas por los permisos del navegador.'
              : alertsActivated
                ? 'Alertas del navegador y sonido activados.'
                : 'Activa las alertas para recibir sonido y notificaciones del navegador.'}
          </p>
        </div>
        {permission !== 'denied' && (!alertsActivated || permission !== 'granted') && (
          <button
            type="button"
            onClick={enableAlerts}
            style={{ backgroundColor: '#2563eb', color: '#fff', border: 0, borderRadius: '6px', padding: '7px 10px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Activar alertas
          </button>
        )}
      </div>
      {error && <p role="alert" style={{ color: '#fca5a5', fontSize: '11px', margin: '8px 0 0' }}>{error}</p>}
      {notice && (
        <div role="status" style={{ marginTop: '10px', padding: '9px', border: '1px solid #059669', borderRadius: '6px', backgroundColor: '#052e2b', color: '#a7f3d0', fontSize: '11px' }}>
          Nueva cita: <strong>{notice.customer_name}</strong> · {notice.service_name} · {notice.appointment_date} {notice.appointment_time}
          <button
            type="button"
            aria-label="Cerrar aviso de nueva cita"
            onClick={() => setNotice(null)}
            style={{ float: 'right', background: 'transparent', border: 0, color: '#a7f3d0', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      )}
    </section>
  );
}
