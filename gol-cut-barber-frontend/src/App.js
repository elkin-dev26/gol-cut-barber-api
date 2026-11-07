import React, { useState } from 'react';
import Navbar from './components/Navbar';
import ClienteView from './components/ClienteView';
import AdminView from './components/AdminView';
import LoginModal from './components/LoginModal';

function App() {
  const [activeTab, setActiveTab] = useState('reservas');
  const [activeRole, setActiveRole] = useState('cliente');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [targetRole, setTargetRole] = useState('admin');

  const [adminCredentials, setAdminCredentials] = useState({
    usuario: 'admin',
    clave: '123456'
  });

  const [config, setConfig] = useState({ nombreNegocio: 'Peluquería Gol Cut barber' });
  
  // ESTADO GLOBAL DE CITAS COMPARTIDO
  const [citas, setCitas] = useState([
    { id: 1, cliente: 'Elkin Ramírez', servicio: 'Combo Oro Corte VIP', barbero: 'Carlos Pérez (Maestro Barbero)', hora: '14:00', estado: 'Pendiente' },
    { id: 2, cliente: 'Juan Pablo Marín', servicio: 'Corte Sombreado + Barba', barbero: 'Mateo Gómez (Especialista Degradados)', hora: '15:30', estado: 'Confirmada' }
  ]);

  const [barberos, setBarberos] = useState([
    { id: 1, nombre: 'Carlos Pérez (Maestro Barbero)' },
    { id: 2, nombre: 'Mateo Gómez (Especialista Degradados)' }
  ]);
  
  const [servicios, setServicios] = useState([
    { id: 1, nombre: 'Corte Sombreado + Barba', precio: 35000 },
    { id: 2, nombre: 'Corte Clásico', precio: 25000 }
  ]);

  const handleSelectRole = (selectedRole) => {
    if (selectedRole === 'demo') {
      setActiveRole('demo');
      setActiveTab('admin');
    } else {
      setTargetRole(selectedRole);
      setIsLoginOpen(true);
    }
  };

  const agregarCitaCliente = (nuevaCita) => {
    setCitas([
      { id: Date.now(), ...nuevaCita, estado: 'Pendiente' },
      ...citas
    ]);
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      <Navbar 
        nombreNegocio={config.nombreNegocio}
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onSelectRole={handleSelectRole}
        activeRole={activeRole}
      />

      <main className="max-w-6xl mx-auto p-6">
        {activeTab === 'reservas' ? (
          <ClienteView 
            barberos={barberos} 
            servicios={servicios} 
            onAgregarCita={agregarCitaCliente}
          />
        ) : (
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
            adminCredentials={adminCredentials}
            setAdminCredentials={setAdminCredentials}
          />
        )}
      </main>

      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        targetRole={targetRole}
        adminCredentials={adminCredentials}
        onLoginSuccess={(grantedRole) => {
          setActiveRole(grantedRole);
          setActiveTab('admin');
        }} 
      />
    </div>
  );
}

export default App;