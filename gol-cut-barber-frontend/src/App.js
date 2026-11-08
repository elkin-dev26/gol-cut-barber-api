import React, { useState } from 'react';
import Navbar from './components/Navbar';
import LoginModal from './components/LoginModal';
import ClienteView from './components/ClienteView';
import BarberoView from './components/BarberoView';
import AdminView from './components/AdminView';
import SuperAdminView from './components/SuperAdminView';

export default function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [usuarioAutenticado, setUsuarioAutenticado] = useState(null);

  // Estado global de la aplicación
  const [barberos, setBarberos] = useState([
    { id: 'b1', nombre: 'Elkin Ramírez', especialidad: 'Estilista Profesional', estado: 'Activo' },
    { id: 'b2', nombre: 'Mateo Gómez', especialidad: 'Barbero Senior', estado: 'Activo' },
    { id: 'b3', nombre: 'Carlos Andrés', especialidad: 'Especialista en Barba', estado: 'Activo' }
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

  // Manejo de autenticación estricta
  const handleLoginSuccess = (userObj) => {
    setUsuarioAutenticado(userObj);
    setIsLoginOpen(false);
  };

  const handleCerrarSesion = () => {
    setUsuarioAutenticado(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar 
        usuarioAutenticado={usuarioAutenticado}
        onOpenLogin={() => setIsLoginOpen(true)}
        onCerrarSesion={handleCerrarSesion}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        {/* VISTA PÚBLICA / CLIENTE: Agendamiento sin autenticación */}
        {!usuarioAutenticado && (
          <ClienteView 
            barberos={barberos}
            servicios={servicios}
            citas={citas}
            setCitas={setCitas}
          />
        )}

        {/* VISTA PROTEGIDA 1: ROL BARBERO */}
        {usuarioAutenticado && usuarioAutenticado.role === 'barbero' && (
          <BarberoView 
            barberoActual={usuarioAutenticado}
            citas={citas}
            setCitas={setCitas}
            onCerrarSesion={handleCerrarSesion}
          />
        )}

        {/* VISTA PROTEGIDA 2: ROL ADMINISTRADOR / SUCURSAL / EVALUACIÓN SENA */}
        {usuarioAutenticado && ['admin', 'sucursal', 'evaluacion'].includes(usuarioAutenticado.role) && (
          <AdminView 
            usuario={usuarioAutenticado}
            citas={citas}
            setCitas={setCitas}
            barberos={barberos}
            setBarberos={setBarberos}
            servicios={servicios}
            setServicios={setServicios}
          />
        )}

        {/* VISTA PROTEGIDA 3: ROL SUPERADMIN / DESARROLLADOR */}
        {usuarioAutenticado && usuarioAutenticado.role === 'superadmin' && (
          <SuperAdminView 
            usuario={usuarioAutenticado}
            citas={citas}
            barberos={barberos}
            servicios={servicios}
            setBarberos={setBarberos}
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