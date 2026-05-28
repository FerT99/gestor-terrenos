import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Pencil, Trash2, Loader2, AlertCircle, RefreshCw, Plus, MapPin } from 'lucide-react';
import { useTerrenos } from '../hooks/useTerrenos';
import type { Terreno, TerrenoInput } from '../lib/api';
import TerrenoModal from './TerrenoModal';

const ESTADOS = ['Todos', 'disponible', 'apartado', 'vendido'] as const;
const PAGE_SIZE = 10;

const formatPrice = (price: number) =>
  `$${price.toLocaleString('es-MX', { minimumFractionDigits: 0 })} MXN`;

interface LandCatalogProps {
  searchQuery?: string;
  onSelectTerreno?: (id: string) => void;
}

const LandCatalog: React.FC<LandCatalogProps> = ({ searchQuery = '', onSelectTerreno }) => {
  const { terrenos, loading, error, refresh, createTerreno, updateTerreno, deleteTerreno } = useTerrenos();

  const [filter, setFilter] = useState<string>('Todos');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTerreno, setEditTerreno] = useState<Terreno | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Filtrado
  const filtered = terrenos.filter(t => {
    const matchesFilter = filter === 'Todos' || t.estado === filter;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || 
      t.clave.toLowerCase().includes(q) || 
      (t.nombre && t.nombre.toLowerCase().includes(q)) || 
      (t.propietario && t.propietario.toLowerCase().includes(q));
    return matchesFilter && matchesSearch;
  });

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = (f: string) => {
    setFilter(f);
    setPage(1);
  };

  const handleNuevoLote = () => {
    setEditTerreno(null);
    setModalOpen(true);
  };

  const handleEdit = (t: Terreno) => {
    setEditTerreno(t);
    setModalOpen(true);
  };

  const handleDelete = async (t: Terreno) => {
    const confirmed = window.confirm(`¿Eliminar el lote ${t.clave}? Esta acción no se puede deshacer.`);
    if (!confirmed) return;
    setDeletingId(t.id);
    setActionError(null);
    try {
      await deleteTerreno(t.id);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Error al eliminar');
    } finally {
      setDeletingId(null);
    }
  };

  const handleModalSubmit = async (input: TerrenoInput) => {
    if (editTerreno) {
      await updateTerreno(editTerreno.id, input);
    } else {
      await createTerreno(input);
    }
  };

  return (
    <main className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen bg-neutral-50/50">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900">Catálogo de Terrenos</h2>
          <p className="text-neutral-500 mt-1">
            Administra propiedades, disponibilidad y asignación de lotes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refresh}
            disabled={loading}
            className="p-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 transition-all shadow-sm disabled:opacity-50"
            title="Actualizar"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin text-orange-500' : ''} />
          </button>
          <button
            onClick={handleNuevoLote}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white px-5 py-2.5 rounded-xl font-medium hover:from-orange-700 hover:to-orange-600 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <Plus size={18} /> <span>Nuevo Lote</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 bg-white p-4 rounded-2xl shadow-sm border border-neutral-100">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-neutral-500">Estado:</span>
          <div className="flex flex-wrap gap-2">
            {ESTADOS.map(f => (
              <button
                key={f}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filter === f
                  ? 'bg-orange-100 text-orange-700 shadow-sm ring-1 ring-orange-200'
                  : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
                  }`}
                onClick={() => handleFilterChange(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <span className="text-sm font-medium text-neutral-400 mt-4 sm:mt-0 px-2">
          {filtered.length} {filtered.length === 1 ? 'lote' : 'lotes'}
        </span>
      </div>

      {/* Error de acción */}
      {actionError && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 border border-red-100 animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={18} />
          <span className="font-medium">{actionError}</span>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
            <Loader2 size={32} className="animate-spin text-orange-500 mb-4" />
            <span className="font-medium">Cargando terrenos...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-red-500">
            <AlertCircle size={48} className="mb-4 opacity-80" />
            <p className="font-medium mb-4">{error}</p>
            <button className="px-6 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 font-medium transition-colors" onClick={refresh}>Reintentar</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-neutral-400">
            <MapPin size={48} className="mb-4 opacity-20" />
            <p className="font-medium text-lg text-neutral-600">No se encontraron terrenos</p>
            <p className="text-sm mt-1">Intenta ajustando los filtros o creando uno nuevo.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50/80 border-b border-neutral-200">
                  <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Clave</th>
                  <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-right">Superficie</th>
                  <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-right">Precio Lista</th>
                  <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Propietario</th>
                  <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {paginated.map(t => (
                  <tr 
                    key={t.id} 
                    className="hover:bg-neutral-50 transition-colors group cursor-pointer"
                    onClick={() => onSelectTerreno && onSelectTerreno(t.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-neutral-900 bg-neutral-100 px-2.5 py-1 rounded-md text-sm">{t.clave}</span>
                    </td>

                    <td className="px-6 py-4 text-right font-medium text-neutral-600">
                      {Number(t.superficie_m2).toFixed(2)} <span className="text-xs text-neutral-400">m²</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-neutral-800">{formatPrice(t.precio_lista)}</span>
                    </td>
                    <td className="px-6 py-4">
                      {t.propietario ? (
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-200 to-orange-300 text-orange-800 flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-white">
                            {t.propietario.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-medium text-neutral-700 text-sm">{t.propietario}</span>
                        </div>
                      ) : (
                        <span className="text-neutral-300 italic text-sm">Sin asignar</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${t.estado === 'vendido' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        t.estado === 'apartado' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                        {t.estado === 'vendido'
                          ? <Check size={12} strokeWidth={3} />
                          : <span className={`w-1.5 h-1.5 rounded-full ${t.estado === 'apartado' ? 'bg-amber-500' : 'bg-blue-500'}`}></span>
                        }
                        {t.estado.charAt(0).toUpperCase() + t.estado.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="p-2 text-neutral-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors tooltip-trigger"
                          onClick={() => handleEdit(t)}
                          title="Editar lote"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors tooltip-trigger"
                          onClick={() => handleDelete(t)}
                          disabled={deletingId === t.id}
                          title="Eliminar lote"
                        >
                          {deletingId === t.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {!loading && !error && filtered.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100 bg-neutral-50/50">
            <span className="text-sm text-neutral-500">
              Mostrando <span className="font-medium text-neutral-900">{Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}</span> a <span className="font-medium text-neutral-900">{Math.min(page * PAGE_SIZE, filtered.length)}</span> de <span className="font-medium text-neutral-900">{filtered.length}</span> resultados
            </span>
            <div className="flex items-center gap-2">
              <button
                className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm font-medium px-4 text-neutral-700">
                Página {page} de {totalPages}
              </span>
              <button
                className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      <TerrenoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        terreno={editTerreno}
      />
    </main>
  );
};

export default LandCatalog;

