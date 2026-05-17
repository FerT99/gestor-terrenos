import React from 'react';
import { LayoutDashboard, Map, Users, CreditCard, Settings, HelpCircle, LogOut } from 'lucide-react';
import './Sidebar.css';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, onLogout }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="profile">
          <div className="profile-info">
            <h2 className="company-name">Loterra</h2>
            <span className="role">ADMINISTRACIÓN DE VENTAS</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul>
          <li className={currentView === 'dashboard' ? 'active' : ''}>
            <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView('dashboard'); }} className="flex items-center gap-3">
              <LayoutDashboard size={20} />
              <span>Panel Inicial</span>
            </a>
          </li>
          <li className={currentView === 'catalog' ? 'active' : ''}>
            <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView('catalog'); }} className="flex items-center gap-3">
              <Map size={20} />
              <span>Catálogo de Terrenos</span>
            </a>
          </li>
          <li className={currentView === 'clients' ? 'active' : ''}>
            <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView('clients'); }} className="flex items-center gap-3">
              <Users size={20} />
              <span>Clientes</span>
            </a>
          </li>
          <li className={currentView === 'payments' ? 'active' : ''}>
            <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView('payments'); }} className="flex items-center gap-3">
              <CreditCard size={20} />
              <span>Pagos</span>
            </a>
          </li>
          <li className={currentView === 'settings' ? 'active' : ''}>
            <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView('settings'); }} className="flex items-center gap-3">
              <Settings size={20} />
              <span>Configuración</span>
            </a>
          </li>
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-actions">
          <button className="btn-primary w-full flex items-center justify-center gap-2">
            <span>+</span> Nueva Venta
          </button>
        </div>
        <ul>
          <li>
            <a href="#" className="flex items-center gap-3">
              <HelpCircle size={20} />
              <span>Soporte</span>
            </a>
          </li>
          <li>
            <a href="#" onClick={(e) => { e.preventDefault(); if (onLogout) onLogout(); }} className="flex items-center gap-3">
              <LogOut size={20} />
              <span>Cerrar Sesión</span>
            </a>
          </li>
        </ul>

        {/* Bottom User Profile */}
        <div className="bottom-profile">
          <img src="https://i.pravatar.cc/150?img=11" alt="J. Smith" className="bottom-profile-img" />
          <div className="bottom-profile-info">
            <span className="bottom-profile-name">J. Smith</span>
            <span className="bottom-profile-role">Admin</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
