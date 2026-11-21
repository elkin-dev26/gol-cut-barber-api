import React, { useState } from 'react';

const BARBEROS = [
  { id: 1, nombre: 'Carlos Gómez', especialidad: 'Corte Urbano & Barba' },
  { id: 2, nombre: 'Mateo Morales', especialidad: 'Diseños & Degradados' }
];

const SERVICIOS = [
  { id: 's1', nombre: 'Corte de Cabello', precio: 25000 },
  { id: 's2', nombre: 'Arreglo de Barba', precio: 15000 },
  { id: 's3', nombre: 'Combo Gol Cut (Corte + Barba)', precio: 35000 }
];

export const AppointmentBooking = () => {
  const [formData, setFormData] = useState({ clienteNombre: '', clienteTelefono: '', barberoId: '', servicioId: '', fecha: '', hora: '' });
  const [reservaConfirmada, setReservaConfirmada] = useState(null);
  const [errorMensaje, setErrorMensaje] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitReserva = (e) => {
    e.preventDefault();
    setErrorMensaje('');
    const { clienteNombre, clienteTelefono, barberoId, servicioId, fecha, hora } = formData;
    if (!clienteNombre || !clienteTelefono || !barberoId || !servicioId || !fecha || !hora) {
      setErrorMensaje('Por favor complete todos los campos obligatorios.');
      return;
    }
    const barberoSeleccionado = BARBEROS.find(b => b.id === parseInt(barberoId));
    const servicioSeleccionado = SERVICIOS.find(s => s.id === servicioId);
    setReservaConfirmada({
      ...formData,
      barberoNombre: barberoSeleccionado ? barberoSeleccionado.nombre : '',
      servicioNombre: servicioSeleccionado ? servicioSeleccionado.nombre : '',
      precioTotal: servicioSeleccionado ? servicioSeleccionado.precio : 0
    });
  };

  return (
    <div className='booking-card'>
      <div className='booking-header'>
        <h2 className='booking-title'>Gol Cut Barber</h2>
        <p className='booking-subtitle'>Agendamiento de Citas</p>
      </div>
      {errorMensaje && <div className='error-message'>{errorMensaje}</div>}
      <form onSubmit={handleSubmitReserva}>
        <div className='form-group'>
          <label>Nombre Completo:</label>
          <input type='text' name='clienteNombre' value={formData.clienteNombre} onChange={handleInputChange} placeholder='Ej. Juan Pérez' />
        </div>
        <div className='form-group'>
          <label>Teléfono:</label>
          <input type='tel' name='clienteTelefono' value={formData.clienteTelefono} onChange={handleInputChange} placeholder='Ej. 3001234567' />
        </div>
        <div className='form-group'>
          <label>Barbero:</label>
          <select name='barberoId' value={formData.barberoId} onChange={handleInputChange}>
            <option value=''>-- Seleccione un barbero --</option>
            {BARBEROS.map(b => <option key={b.id} value={b.id}>{b.nombre} ({b.especialidad})</option>)}
          </select>
        </div>
        <div className='form-group'>
          <label>Servicio:</label>
          <select name='servicioId' value={formData.servicioId} onChange={handleInputChange}>
            <option value=''>-- Seleccione un servicio --</option>
            {SERVICIOS.map(s => <option key={s.id} value={s.id}>{s.nombre} - </option>)}
          </select>
        </div>
        <div className='form-row'>
          <div className='form-group' style={{flex: 1}}>
            <label>Fecha:</label>
            <input type='date' name='fecha' value={formData.fecha} onChange={handleInputChange} />
          </div>
          <div className='form-group' style={{flex: 1}}>
            <label>Hora:</label>
            <input type='time' name='hora' value={formData.hora} onChange={handleInputChange} />
          </div>
        </div>
        <button type='submit' className='btn-primary'>Confirmar Reserva</button>
      </form>
      {reservaConfirmada && (
        <div className='summary-card'>
          <h3 className='summary-title'>Reserva Confirmada</h3>
          <p className='summary-item'><strong>Cliente:</strong> {reservaConfirmada.clienteNombre}</p>
          <p className='summary-item'><strong>Barbero:</strong> {reservaConfirmada.barberoNombre}</p>
          <p className='summary-item'><strong>Servicio:</strong> {reservaConfirmada.servicioNombre}</p>
          <p className='summary-item'><strong>Fecha y Hora:</strong> {reservaConfirmada.fecha} a las {reservaConfirmada.hora}</p>
          <p className='summary-item'><strong>Total a pagar:</strong> </p>
        </div>
      )}
    </div>
  );
};

export default AppointmentBooking;
