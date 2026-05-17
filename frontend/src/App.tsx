import React from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import LandCatalog from './components/LandCatalog';
import Clients from './components/Clients';
import Payments from './components/Payments';
import Settings from './components/Settings';
import Login from './components/Login';
import { useAuth } from './hooks/useAuth';
import './App.css';

function App() {
  const { user, loading, signIn, signOut } = useAuth();
  const [currentView, setCurrentView] = React.useState('dashboard');

  const handleLogin = async (email: string, password: string) => {
    const { error } = await signIn(email, password);
    if (error) {
      // Traducir mensajes de error de Supabase al español
      const mensajesError: Record<string, string> = {
        'Invalid login credentials': 'Correo o contraseña incorrectos.',
        'Email not confirmed': 'Por favor, confirma tu correo antes de iniciar sesión.',
        'Too many requests': 'Demasiados intentos. Espera un momento e intenta de nuevo.',
      };
      const msg = mensajesError[error.message] ?? 'Error al iniciar sesión. Intenta de nuevo.';
      return { error: msg };
    }
    return { error: null };
  };

  // Pantalla de carga mientras Supabase verifica la sesión
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Cargando...
        </div>
      </div>
    );
  }

  // Si no hay sesión activa, mostrar Login
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // Sesión activa: mostrar el sistema
  return (
    <div className="app-container">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} onLogout={signOut} />
      <div className="main-layout">
        <Header />
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'catalog' && <LandCatalog />}
        {currentView === 'clients' && <Clients />}
        {currentView === 'payments' && <Payments />}
        {currentView === 'settings' && <Settings />}
      </div>
    </div>
  );
}

export default App;
