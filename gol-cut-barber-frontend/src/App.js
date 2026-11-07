import React, { useState } from 'react';
import Navbar from './components/Navbar';
import ClienteView from './components/ClienteView';
import AdminView from './components/AdminView';
import BarberoView from './components/BarberoView';

export default function App() {
  const [activeRole, setActiveRole] = useState('cliente');

  const [config, setConfig] = useState({
    nombreNegocio: 'Peluquería Gol Cut Barber'
  });

  const [barberos, setBarberos] = useState([
    { id: 1, nombre: 'Elkin Ramírez', estadoSilla: 'Al Día' },
    { id: 2, nombre: 'Mateo Gómez', estadoSilla: 'Al Día' },
    { id: 3, nombre: 'Carlos Andrés', estadoSilla: 'Moroso' }
  ]);

  const [servicios, setServicios] = useState([
    { id: 1, nombre: 'Corte Clásico / Fade', precio: 25000 },
    { id: 2, nombre: 'Barba Completa con Toalla Caliente', precio: 15000 },
    { id: 3, nombre: 'Combo Gol Cut (Corte + Barba)', precio: 35000 }
  ]);

  const [citas, setCitas] = useState([
    {
      id: 1,
      cliente: 'Juan Pablo',
      servicio: 'Combo Gol Cut (Corte + Barba)',
      barbero: 'Elkin Ramírez',
      hora: '02:00 PM',
      estado: 'Confirmada',
      tipo: 'Programada'
    }
  ]);

  const handleAgregarCita = (nuevaCita) => {
    const citaCompleta = {
      id: Date.now(),
      ...nuevaCita,
      estado: 'Pendiente'
    };
    setCitas((prevCitas) => [citaCompleta, ...prevCitas]);
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white flex flex-col font-sans">
      <Navbar
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        config={config}
      />

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {activeRole === 'cliente' && (
          <ClienteView
            barberos={barberos}
            servicios={servicios}
            onAgregarCita={handleAgregarCita}
          />
        )}

        {(activeRole === 'admin' || activeRole === 'superadmin' || activeRole === 'demo' || activeRole === 'demo-sena' || activeRole === 'demo-cliente') && (
          <AdminView
            config={config}
            setConfig={setConfig}
            barberos={barberos}
            setBarberos={setBarberos}
            servicios={servicios}
            setServicios={setServicios}
            citas={citas}
            setCitas={setCitas}
            activeRole={activeRole}
          />
        )}

        {activeRole === 'barbero' && (
          <BarberoView
            barberoActual={barberos[0]}
            citas={citas}
            setCitas={setCitas}
            onCerrarSesion={() => setActiveRole('cliente')}
          />
        )}
      </main>
    </div>
  );
}