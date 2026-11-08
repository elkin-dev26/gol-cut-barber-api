import React, { useState } from 'react';
import Navbar from './components/Navbar';
import LoginModal from './components/LoginModal';
import ClienteView from './components/ClienteView';
import BarberoView from './components/BarberoView';
import AdminView from './components/AdminView';

export default function App() {
  const [activeRole, setActiveRole] = useState('cliente'); // 'cliente', 'barbero', 'admin', 'superadmin'
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [usuarioAutenticado, setUsuarioAutenticado] = useState(null);

  // Datos globales del sistema
  const [barberos, setBarberos] = useState([
    { id: 'b1', nombre: 'Elkin Ramírez', especialidad: 'Estilista Profesional' },
    { id: 'b2', nombre: 'Mateo Gómez', especialidad: 'Barbero Senior' },
    { id: 'b3', nombre: 'Carlos Andrés', especialidad: 'Especialista en Barba' }
  ]);

  const [servicios, setServicios] = useState([
    { id: 's1', nombre: 'Corte de Cabello Clásico', precio: 25000, duracion: '30 min' },
    { id: 's2', nombre: 'Barba Tradicional con Toalla Caliente', precio: 15000, duracion: '20 min' },
    { id: 's3', nombre: 'Combo Corte + Barba', precio: 35000, duracion: '45 min' }
  ]);

  const [citas, setCitas] = useState([
    { 
      id: 'c1', 
      cliente: 'Juan Pérez', 
      barbero: 'Elkin Ramírez', 
      servicio: 'Corte de Cabello Clásico', 
      fecha: '2026-11-08', 
      hora: '10:00 AM', 
      precio: 25000, 
      estado: 'confirmada' 
    },
    { 
      id: 'c2', 
      cliente: 'Carlos Gómez', 
      barbero: 'Mateo Gómez', 
      servicio: 'Combo Corte + Barba', 
      fecha: '2026-11-08', 
      hora: '11:30 AM', 
      precio: 35000, 
      estado: 'completada' 
    }
  ]);

  // Manejador de Login que asigna el perfil y la vista correspondiente
  const handleLoginSuccess = (userObj) => {
    setUsuarioAutenticado(userObj);
    setIsLoginOpen(false);

    // Mapeo estricto de vistas según el rol autenticado
    if (userObj.role === 'barbero') {
      setActiveRole('barbero');
    } else if (userObj.role === 'admin' || userObj.role === 'superadmin' || userObj.role === 'evaluacion' || userObj.role === 'sucursal') {
      setActiveRole('admin');
    } else {
      setActiveRole('cliente');
    }
  };

  const handleCerrarSesion = () => {
    setUsuarioAutenticado(null);
    setActiveRole('cliente');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar 
        activeRole={activeRole} 
        setActiveRole={setActiveRole}
        onOpenLogin={() => setIsLoginOpen(true)}
        usuarioAutenticado={usuarioAutenticado}
        onCerrarSesion={handleCerrarSesion}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        {/* VISTA 1: CLIENTE (Formulario de Agendamiento de Citas) */}
        {activeRole === 'cliente' && (
          <ClienteView 
            barberos={barberos}
            servicios={servicios}
            citas={citas}
            setCitas={setCitas}
          />
        )}

        {/* VISTA 2: BARBERO (Agenda de Turnos y Marcar Citas) */}
        {activeRole === 'barbero' && (
          <BarberoView 
            barberoActual={barberos[0]}
            citas={citas}
            setCitas={setCitas}
            onCerrarSesion={handleCerrarSesion}
          />
        )}

        {/* VISTA 3: ADMINISTRADOR / SUPERADMIN / EVALUACIÓN (Métricas, Control de Barberos y Citas Globales) */}
        {(activeRole === 'admin' || activeRole === 'superadmin') && (
          <AdminView 
            citas={citas}
            setCitas={setCitas}
            barberos={barberos}
            setBarberos={setBarberos}
            servicios={servicios}
            setServicios={setServicios}
          />
        )}
      </main>

      <LoginModal 
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}