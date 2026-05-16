import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import LandCatalog from './components/LandCatalog';
import Clients from './components/Clients';
import Payments from './components/Payments';
import Settings from './components/Settings';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('settings'); // Default to settings for this step

  return (
    <div className="app-container">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
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
