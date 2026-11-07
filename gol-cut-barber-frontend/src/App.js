import React, { useState } from 'react';
import Navbar from './components/Navbar';
import ClienteView from './components/ClienteView';
import AdminView from './components/AdminView';
import LoginModal from './components/LoginModal';

function App() {
  const [activeTab, setActiveTab] = useState('reservas');
  const [activeRole, setActiveRole] = useState('cliente'); // 'cliente', 'demo', 'admin', 'superadmin'
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [targetRole, setTargetRole] = useState('admin');

  // Credenciales dinámicas del Administrador Local (el dueño las puede cambiar)
  const [adminCredentials, setAdminCredentials] = useState({
    usuario: 'admin',
    clave: '123456'
  });

  // Estados Globales del Negocio
  const [config, setConfig] = useState({ nombreNegocio: 'Peluquería Gol Cut barber' });
  const [barberos, setBarberos] = useState([
    { id: 1, nombre: 'Carlos Pérez (Maestro Barbero)' },
    { id: 2, nombre: 'Mateo Gómez (Especialista Degradados)' }
  ]);
  const [servicios, setServicios] = useState([
    { id: 1, nombre: 'Corte Sombreado + Barba', precio: 35000 },
    { id: 2, nombre: 'Corte Clásico', precio: 25000 }
  ]);

  // Selección de Perfil desde el desplegable del Navbar
  const handleSelectRole = (selectedRole) => {
    if (selectedRole === 'demo') {
      // Perfil 1: Demo SENA (Ingresa directo sin contraseña)
      setActiveRole('demo');
      setActiveTab('admin');
    } else {
      // Perfiles 2 y 3: Administrador y SuperAdmin (Exigen contraseña)
      setTargetRole(selectedRole);
      setIsLoginOpen(true);
    }
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
          <ClienteView barberos={barberos} servicios={servicios} />
        ) : (
          <AdminView 
            config={config} 
            setConfig={setConfig} 
            barberos={barberos} 
            setBarberos={setBarberos} 
            servicios={servicios}
            setServicios={setServicios}
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