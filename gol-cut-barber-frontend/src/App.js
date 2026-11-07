import React, { useState } from 'react';
import Navbar from './components/Navbar';
import ClienteView from './components/ClienteView';
import AdminView from './components/AdminView';
import LoginModal from './components/LoginModal';

function App() {
  const [role, setRole] = useState('cliente');
  const [activeTab, setActiveTab] = useState('reservas');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Estados Globales del Negocio
  const [config, setConfig] = useState({ nombreNegocio: 'Peluquería Gol Cut' });
  const [barberos, setBarberos] = useState([
    { id: 1, nombre: 'Carlos Pérez (Maestro Barbero)' },
    { id: 2, nombre: 'Mateo Gómez (Especialista Degradados)' },
    { id: 3, nombre: 'Andrés Silva (Estilo Tradicional)' }
  ]);
  const [servicios, setServicios] = useState([
    { id: 1, nombre: 'Corte Sombreado + Barba', precio: 35000 },
    { id: 2, nombre: 'Corte Clásico', precio: 25000 },
    { id: 3, nombre: 'Combo Oro Corte VIP', precio: 50000 }
  ]);

  // PUERTA ABIERTA + ACCESO SEGURO
  const handleRoleSwitch = () => {
    if (role === 'cliente') {
      // Para la evaluación del SENA: Cambia directamente sin bloquear si así se desea,
      // o abre el Login Modal si se requiere probar la seguridad.
      if (!isAuthenticated) {
        setIsLoginOpen(true);
      } else {
        setRole('admin');
        setActiveTab('admin');
      }
    } else {
      setRole('cliente');
      setActiveTab('reservas');
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      <Navbar 
        nombreNegocio={config.nombreNegocio}
        role={role} 
        setRole={(newRole) => {
          setRole(newRole);
          setActiveTab(newRole === 'admin' ? 'admin' : 'reservas');
        }}
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLoginClick={() => setIsLoginOpen(true)}
        isAuthenticated={isAuthenticated}
      />

      <main className="max-w-6xl mx-auto p-6">
        {activeTab === 'reservas' ? (
          <ClienteView barberos={barberos} servicios={servicios} />
        ) : (
          <AdminView 
            config={config} 
            setConfig={setConfig} 
            barberos={barberos} 
            setBarberos={setBarberos} 
            servicios={servicios}
            setServicios={setServicios}
            isSuperAdmin={isSuperAdmin}
          />
        )}
      </main>

      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onLoginSuccess={(superAdminFlag) => {
          setIsAuthenticated(true);
          setIsSuperAdmin(superAdminFlag);
          setRole('admin');
          setActiveTab('admin');
        }} 
      />
    </div>
  );
}

export default App;