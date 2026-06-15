import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Map, Users, CreditCard, Settings, LogOut, Plus, Wallet } from 'lucide-react';
import { api } from '../lib/api';
import type { Parcela } from '../lib/api';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  onLogout?: () => void;
  onNewSale?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, onLogout, onNewSale }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Panel Inicial' },
    { id: 'catalog', icon: Map, label: 'Catálogo de Terrenos' },
    { id: 'clients', icon: Users, label: 'Clientes' },
    { id: 'payments', icon: CreditCard, label: 'Pagos' },
    { id: 'egresos', icon: Wallet, label: 'Egresos' },
  ];

  const userRole = localStorage.getItem('user_role') || 'vendedor';
  if (userRole === 'admin') {
    menuItems.push({ id: 'settings', icon: Settings, label: 'Configuración' });
  }

  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [selectedParcelaId, setSelectedParcelaId] = useState<string>(localStorage.getItem('selected_parcela') || '');

  useEffect(() => {
    const fetchParcelas = async () => {
      try {
        const data = await api.parcelas.getAll();
        setParcelas(data);
        if (data.length > 0 && !localStorage.getItem('selected_parcela')) {
          localStorage.setItem('selected_parcela', data[0].id);
          setSelectedParcelaId(data[0].id);
        }
      } catch (err) {
        console.error('Error fetching parcelas:', err);
      }
    };
    fetchParcelas();
  }, []);

  const handleParcelaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    localStorage.setItem('selected_parcela', newId);
    setSelectedParcelaId(newId);
    window.location.reload(); // Refresh to reload data for the new parcela
  };

  return (
    <aside className="w-72 bg-white border-r border-neutral-200 h-full flex flex-col transition-all duration-300">
      {/* Header */}
      <div className="p-6 pb-2">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-500/20">
            L
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Loterra</h2>
            <span className="text-[10px] font-bold text-neutral-400 tracking-widest uppercase">{userRole === 'admin' ? 'Admin Ventas' : 'Asesor'}</span>
          </div>
        </div>

        {/* Parcela Selector */}
        <div className="mt-2 mb-4">
          <label htmlFor="parcela-select" className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1 block">
            Parcela Activa
          </label>
          <select
            id="parcela-select"
            value={selectedParcelaId}
            onChange={handleParcelaChange}
            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all cursor-pointer"
          >
            <option value="" disabled>Selecciona una parcela...</option>
            {parcelas.map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 overflow-y-auto">
        <div className="space-y-1 mb-8">
          <p className="px-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Menú Principal</p>
          {menuItems.map((item) => (
            <a
              key={item.id}
              href="#"
              onClick={(e) => { e.preventDefault(); setCurrentView(item.id); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${currentView === item.id
                  ? 'bg-orange-50 text-orange-700 font-medium'
                  : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 font-medium'
                }`}
            >
              {currentView === item.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-orange-600 rounded-r-full" />
              )}
              <item.icon size={20} className={currentView === item.id ? 'text-orange-600' : 'text-neutral-400 group-hover:text-neutral-600 transition-colors'} />
              <span>{item.label}</span>
            </a>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-neutral-100">
        <button onClick={onNewSale} className="w-full flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-3 rounded-xl font-medium transition-colors mb-4 shadow-sm">
          <Plus size={18} />
          <span>Nueva Venta</span>
        </button>

        <div className="space-y-1 mb-4">
          <a href="#" onClick={(e) => { e.preventDefault(); if (onLogout) onLogout(); }} className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-neutral-500 hover:bg-red-50 hover:text-red-600 font-medium transition-colors group">
            <LogOut size={18} className="text-neutral-400 group-hover:text-red-500" />
            <span className="text-sm">Cerrar Sesión</span>
          </a>
        </div>

      </div>
    </aside>
  );
};

export default Sidebar;
