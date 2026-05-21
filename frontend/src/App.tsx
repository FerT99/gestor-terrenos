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

function App() {
  const { user, loading, signIn, signOut } = useAuth();
  const [currentView, setCurrentView] = React.useState('dashboard');

  const handleLogin = async (email: string, password: string) => {
    const { error } = await signIn(email, password);
    if (error) {
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-neutral-50">
        <div className="text-center text-neutral-500 text-sm">
          Cargando...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-50 font-sans text-neutral-900">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} onLogout={signOut} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Header />
        <div className="flex-1 overflow-y-auto">
          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'catalog' && <LandCatalog />}
          {currentView === 'clients' && <Clients />}
          {currentView === 'payments' && <Payments />}
          {currentView === 'settings' && <Settings />}
        </div>
      </div>
    </div>
  );
}

export default App;
