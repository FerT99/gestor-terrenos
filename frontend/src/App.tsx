import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import LandCatalog from './components/LandCatalog';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('catalog'); // Default to catalog for this step

  return (
    <div className="app-container">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <div className="main-layout">
        <Header />
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'catalog' && <LandCatalog />}
      </div>
    </div>
  );
}

export default App;
