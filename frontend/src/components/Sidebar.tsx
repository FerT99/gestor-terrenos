import React from 'react';
import { LayoutDashboard, Map, Users, CreditCard, Settings, HelpCircle, LogOut } from 'lucide-react';
import './Sidebar.css';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="profile">
          <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="profile-img" />
          <div className="profile-info">
            <h2 className="company-name">Sahara Lands</h2>
            <span className="role">SALES ADMINISTRATION</span>
          </div>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          <li className={currentView === 'dashboard' ? 'active' : ''}>
            <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView('dashboard'); }} className="flex items-center gap-3">
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </a>
          </li>
          <li className={currentView === 'catalog' ? 'active' : ''}>
            <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView('catalog'); }} className="flex items-center gap-3">
              <Map size={20} />
              <span>Land Catalog</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center gap-3">
              <Users size={20} />
              <span>Clients</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center gap-3">
              <CreditCard size={20} />
              <span>Payments</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center gap-3">
              <Settings size={20} />
              <span>Settings</span>
            </a>
          </li>
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-actions">
          <button className="btn-primary w-full flex items-center justify-center gap-2">
            <span>+</span> New Sale
          </button>
        </div>
        <ul>
          <li>
            <a href="#" className="flex items-center gap-3">
              <HelpCircle size={20} />
              <span>Support</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center gap-3">
              <LogOut size={20} />
              <span>Sign Out</span>
            </a>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
