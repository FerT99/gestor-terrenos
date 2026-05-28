import React from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import LandCatalog from './components/LandCatalog';
import TerrenoDetail from './components/TerrenoDetail';
import Clients from './components/Clients';
import ClientDetail from './components/ClientDetail';
import Payments from './components/Payments';
import Settings from './components/Settings';
import Login from './components/Login';
import NewSaleModal from './components/NewSaleModal';
import { useAuth } from './hooks/useAuth';
import { api } from './lib/api';

function App() {
  const { user, loading: authLoading, signIn, signOut } = useAuth();
  const [currentView, setCurrentView] = React.useState('dashboard');
  const [showNewSaleModal, setShowNewSaleModal] = React.useState(false);
  const [initializing, setInitializing] = React.useState(true);
  const [globalSearch, setGlobalSearch] = React.useState('');
  const [selectedTerrenoId, setSelectedTerrenoId] = React.useState<string | null>(null);
  const [selectedClienteId, setSelectedClienteId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setGlobalSearch('');
  }, [currentView]);

  React.useEffect(() => {
    const initParcela = async () => {
      if (!user) {
        setInitializing(false);
        return;
      }

      // 1. Obtener el perfil del usuario (y su rol)
      try {
        const perfil = await api.usuarios.getMe();
        localStorage.setItem('user_role', perfil.rol);
      } catch (err) {
        console.error("Error al obtener perfil, asumiendo rol vendedor", err);
        localStorage.setItem('user_role', 'vendedor'); // Default seguro
      }
      
      // 2. Inicializar parcela
      const currentParcela = localStorage.getItem('selected_parcela');
      if (!currentParcela) {
        try {
          let parcelas = await api.parcelas.getAll();
          if (parcelas.length === 0) {
            const nuevaParcela = await api.parcelas.create({
              nombre: "Parcela Principal",
              descripcion: "Creada automáticamente"
            });
            parcelas = [nuevaParcela];
          }
          if (parcelas.length > 0) {
            localStorage.setItem('selected_parcela', parcelas[0].id);
          }
        } catch (err) {
          console.error("Error cargando parcelas:", err);
        }
      }
      setInitializing(false);
    };
    initParcela();
  }, [user]);

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

  if (authLoading || initializing) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-neutral-50">
        <div className="text-center text-neutral-500 text-sm">
          Cargando configuración...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-50 font-sans text-neutral-900">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        onLogout={signOut} 
        onNewSale={() => setShowNewSaleModal(true)} 
      />
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Header currentView={currentView} searchQuery={globalSearch} onSearchChange={setGlobalSearch} />
        <div className="flex-1 overflow-y-auto">
          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'catalog' && (
            <LandCatalog 
              searchQuery={globalSearch} 
              onSelectTerreno={(id) => {
                setSelectedTerrenoId(id);
                setCurrentView('terreno_detail');
              }} 
            />
          )}
          {currentView === 'terreno_detail' && selectedTerrenoId && (
            <TerrenoDetail 
              terrenoId={selectedTerrenoId} 
              onBack={() => {
                setSelectedTerrenoId(null);
                setCurrentView('catalog');
              }} 
            />
          )}
          {currentView === 'clients' && (
            <Clients 
              searchQuery={globalSearch} 
              onSelectCliente={(id) => {
                setSelectedClienteId(id);
                setCurrentView('client_detail');
              }}
            />
          )}
          {currentView === 'client_detail' && selectedClienteId && (
            <ClientDetail 
              clienteId={selectedClienteId} 
              onBack={() => {
                setSelectedClienteId(null);
                setCurrentView('clients');
              }} 
            />
          )}
          {currentView === 'payments' && <Payments />}
          {currentView === 'settings' && <Settings />}
        </div>
      </div>
      
      {showNewSaleModal && (
        <NewSaleModal 
          onClose={() => setShowNewSaleModal(false)}
          onSuccess={() => {
            setShowNewSaleModal(false);
            // Mover la vista a Pagos para ver los planes
            setCurrentView('payments');
          }}
        />
      )}
    </div>
  );
}

export default App;
