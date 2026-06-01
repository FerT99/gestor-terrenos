import React from 'react';
import { Search } from 'lucide-react';

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

      </div>
    </header>
  );
};

export default Header;
