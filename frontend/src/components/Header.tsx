import React from 'react';
import { Search, Bell, User, DownloadCloud } from 'lucide-react';

interface HeaderProps {
  currentView?: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView = 'dashboard', searchQuery = '', onSearchChange }) => {
  let showSearch = true;
  let searchPlaceholder = 'Buscar...';

  switch (currentView) {
    case 'dashboard':
    case 'settings':
      showSearch = false;
      break;
    case 'catalog':
      searchPlaceholder = 'Buscar lotes...';
      break;
    case 'clients':
      searchPlaceholder = 'Buscar clientes...';
      break;
    case 'payments':
      searchPlaceholder = 'Buscar pagos...';
      break;
    default:
      searchPlaceholder = 'Buscar...';
  }

  return (
    <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-6 z-10 sticky top-0">
      <div className="flex items-center gap-8">
        <nav className="hidden md:flex items-center gap-1">
          <button className="px-4 py-2 text-sm font-semibold text-orange-600 bg-orange-50 rounded-lg">Visión General</button>
          {/* <button className="px-4 py-2 text-sm font-medium text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50 rounded-lg transition-colors">Mapa</button>
          <button className="px-4 py-2 text-sm font-medium text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50 rounded-lg transition-colors">Analíticas</button> */}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        {showSearch && (
          <div className="relative hidden sm:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input 
              type="text" 
              placeholder={searchPlaceholder} 
              value={searchQuery}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              className="w-64 pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>
        )}
        
        {showSearch && <div className="h-6 w-px bg-neutral-200 hidden sm:block mx-1"></div>}

        <button className="hidden sm:flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
          <DownloadCloud size={18} />
          <span>Exportar</span>
        </button>

        <div className="flex items-center gap-2 ml-2">
          <button className="relative p-2 text-neutral-400 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
          </button>
          <button className="p-2 text-neutral-400 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors">
            <User size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
