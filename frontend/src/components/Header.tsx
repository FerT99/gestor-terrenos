import React from 'react';
import { Search, Bell, User } from 'lucide-react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">Sahara Admin</h1>
        <nav className="header-tabs">
          <button className="tab active">Overview</button>
          <button className="tab">Map View</button>
          <button className="tab">Analytics</button>
        </nav>
      </div>

      <div className="header-right">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search..." />
        </div>
        
        <button className="export-btn">Export Data</button>
        
        <div className="header-actions">
          <button className="icon-btn">
            <Bell size={20} />
          </button>
          <button className="icon-btn">
            <User size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
