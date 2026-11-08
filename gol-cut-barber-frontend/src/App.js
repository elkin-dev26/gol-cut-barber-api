import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LoginModal from './components/LoginModal';
import ClienteView from './components/ClienteView';
import BarberoView from './components/BarberoView';
import AdminView from './components/AdminView';
import SuperAdminView from './components/SuperAdminView';

export default function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [usuarioAutenticado, setUsuarioAutenticado] = useState(null);

  const [devConfig, setDevConfig] = useState({
    whatsappSoporte: '573001234567',
    mensajeRenovacion: 'Hola Elkin, deseo renovar mi membresía mensual de Gol Cut Barber.'
  });

  const [tenants, setTenants] = useState([
    { id: 't1', nombreBarberia: 'Gol Cut Barber Principal', dueno: 'Elkin Ramírez', estadoLicencia: 'Activa', diasRestantes: 28 },
    { id: 't2', nombreBarberia: 'Barbería Demo SENA', dueno: 'Instructor SENA', estadoLicencia: 'Activa', diasRestantes: 30 },
    { id: 't3', nombreBarberia: 'Barbería Demo Cliente', dueno: 'Cliente Comercial', estadoLicencia: 'Prueba 1 Mes', diasRestantes: 15 }
  ]);

  const [barberos, setBarberos] = useState([
    { id: 'b1', nombre: 'Elkin Ramírez', especialidad: 'Estilista Profesional', estado: 'Activo', cupoPago: true, diasClave: 85 },
    { id: 'b2', nombre: 'Mateo Gómez', especialidad: 'Barbero Senior', estado: 'Activo', cupoPago: true, diasClave: 45 },
    { id: 'b3', nombre: 'Carlos Andrés', especialidad: 'Especialista en Barba', estado: 'Inactivo', cupoPago: false, diasClave: 12 }
  ]);

  const [servicios, setServicios] = useState([
    { id: 's1', nombre: 'Corte de Cabello Clásico', precio: 25000, duracion: '30 min' },
    { id: 's2', nombre: 'Barba Tradicional con Toalla Caliente', precio: 15000, duracion: '20 min' },
    { id: 's3', nombre: 'Combo Corte + Barba', precio: 35000, duracion: '45 min' }
  ]);

  const [citas, setCitas] = useState([
    { id: 'c1', cliente: 'Juan Pérez', barbero: 'Elkin Ramírez', servicio: 'Corte de Cabello Clásico', fecha: '2026-11-08', hora: '10:00 AM', precio: 25000, estado: 'confirmada' },
    { id: 'c2', cliente: 'Carlos Gómez', barbero: 'Mateo Gómez', servicio: 'Combo Corte + Barba', fecha: '2026-11-08', hora: '11:30 AM', precio: 35000, estado: 'completada' }
  ]);

  const [logsSesion, setLogsSesion] = useState([
    { id: 'l1', usuario: 'Elkin Ramírez', rol: 'barbero', fechaHora: '2026-11-08 08:00 AM', evento: 'Marcación de Ingreso' },
    { id: 'l2', usuario: 'demo-sena', rol: 'evaluacion', fechaHora: '2026-11-08 09:15 AM', evento: 'Ingreso Audit SENA' }
  ]);

  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  const handleLoginSuccess = (userObj) => {
    setUsuarioAutenticado(userObj);
    setIsLoginOpen(false);
    const nuevoLog = {
      id: 'l' + Date.now(),
      usuario: userObj.nombre || userObj.username,
      rol: userObj.role,
      fechaHora: new Date().toLocaleString(),
      evento: 'Inicio de Sesión Exitoso'
    };
    setLogsSesion(prev => [nuevoLog, ...prev]);
  };

  const handleCerrarSesion = () => {
    if (usuarioAutenticado) {
      const nuevoLog = {
        id: 'l' + Date.now(),
        usuario: usuarioAutenticado.nombre || usuarioAutenticado.username,
        rol: usuarioAutenticado.role,
        fechaHora: new Date().toLocaleString(),
        evento: 'Marcación de Salida'
      };
      setLogsSesion(prev => [nuevoLog, ...prev]);
    }
    setUsuarioAutenticado(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      <Navbar 
        usuarioAutenticado={usuarioAutenticado}
        onOpenLogin={() => setIsLoginOpen(true)}
        onCerrarSesion={handleCerrarSesion}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        {!usuarioAutenticado && (
          <ClienteView 
            barberos={barberos.filter(b => b.estado === 'Activo')}
            servicios={servicios}
            citas={citas}
            setCitas={setCitas}
          />
        )}

        {usuarioAutenticado && usuarioAutenticado.role === 'barbero' && (
          <BarberoView 
            barberoActual={usuarioAutenticado}
            citas={citas}
            setCitas={setCitas}
            servicios={servicios}
            onCerrarSesion={handleCerrarSesion}
          />
        )}

        {usuarioAutenticado && ['admin', 'sucursal', 'evaluacion'].includes(usuarioAutenticado.role) && (
          <AdminView 
            usuario={usuarioAutenticado}
            citas={citas}
            setCitas={setCitas}
            barberos={barberos}
            setBarberos={setBarberos}
            servicios={servicios}
            setServicios={setServicios}
            logsSesion={logsSesion}
            devConfig={devConfig}
          />
        )}

        {usuarioAutenticado && usuarioAutenticado.role === 'superadmin' && (
          <SuperAdminView 
            usuario={usuarioAutenticado}
            tenants={tenants}
            setTenants={setTenants}
            devConfig={devConfig}
            setDevConfig={setDevConfig}
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