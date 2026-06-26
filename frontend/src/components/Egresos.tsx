import React, { useState, useEffect } from 'react';
import { Wallet, Plus, TrendingDown, FileText, Search, Pencil, Trash2 } from 'lucide-react';
import ErrorBoundary from './ErrorBoundary';
import NuevoEgresoModal from './NuevoEgresoModal';
import ConfirmModal from './ConfirmModal';
import { api, type Egreso } from '../lib/api';

const Egresos: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [egresos, setEgresos] = useState<Egreso[]>([]);
  const [loading, setLoading] = useState(true);
  const [egresoToEdit, setEgresoToEdit] = useState<Egreso | null>(null);
  const [egresoToDelete, setEgresoToDelete] = useState<Egreso | null>(null);

  const parcelaId = localStorage.getItem('selected_parcela');

  const fetchEgresos = async () => {
    if (!parcelaId) return;
    try {
      const data = await api.egresos.getAll(parcelaId);
      setEgresos(data || []);
    } catch (err) {
      console.error('Error fetching egresos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEgresos();
  }, [parcelaId]);

  const handleCreateOrUpdateEgreso = async (data: any) => {
    if (!parcelaId) return;
    if (egresoToEdit) {
      await api.egresos.update(parcelaId, egresoToEdit.id, data);
    } else {
      await api.egresos.create(parcelaId, data);
    }
    await fetchEgresos();
    setShowModal(false);
    setEgresoToEdit(null);
  };

  const handleDeleteEgreso = async () => {
    if (!parcelaId || !egresoToDelete) return;
    try {
      await api.egresos.delete(parcelaId, egresoToDelete.id);
      await fetchEgresos();
      setEgresoToDelete(null); // Cerrar el modal de confirmación
    } catch (err) {
      console.error(err);
    }
  };

  // Filtrado de la tabla
  const [filtroCategoria, setFiltroCategoria] = useState('all');

  const egresosFiltrados = egresos.filter(e => {
    const matchesSearch = e.concepto.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (e.descripcion && e.descripcion.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = filtroCategoria === 'all' || e.categoria.toLowerCase() === filtroCategoria.toLowerCase();
    return matchesSearch && matchesCat;
  });

  const totalMes = egresos.reduce((acc, curr) => acc + curr.monto, 0);
  const totalComisiones = egresos.filter(e => e.categoria === 'Comisiones').reduce((acc, curr) => acc + curr.monto, 0);
  const totalOtros = egresos.filter(e => e.categoria !== 'Comisiones').reduce((acc, curr) => acc + curr.monto, 0);

  return (
    <ErrorBoundary>
      <main className="p-6 md:p-10 max-w-7xl mx-auto min-h-[calc(100vh-4rem)] bg-neutral-50/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 flex items-center gap-3">
              <Wallet className="text-orange-500" />
              Egresos
            </h2>
            <p className="text-neutral-500 mt-1">Gestión de comisiones pagadas y otros gastos operativos.</p>
          </div>
          <button 
            onClick={() => { setEgresoToEdit(null); setShowModal(true); }}
            className="bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            <span>Nuevo Egreso</span>
          </button>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
              <TrendingDown size={24} />
            </div>
            <div>
              <p className="text-sm text-neutral-500 font-medium mb-1">Total Egresos (Mes)</p>
              <h3 className="text-2xl font-black text-neutral-900">${totalMes.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-sm text-neutral-500 font-medium mb-1">Comisiones Pagadas</p>
              <h3 className="text-2xl font-black text-neutral-900">${totalComisiones.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-sm text-neutral-500 font-medium mb-1">Otros Gastos</p>
              <h3 className="text-2xl font-black text-neutral-900">${totalOtros.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
            </div>
          </div>
        </div>

        {/* Lista de Egresos */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 flex flex-col min-h-[400px]">
          <div className="p-4 border-b border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar por concepto o descripción..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>
            <div className="flex gap-2">
              <select 
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium text-neutral-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all cursor-pointer"
              >
                <option value="all">Todas las categorías</option>
                <option value="comisiones">Comisiones</option>
                <option value="operativos">Operativos</option>
                <option value="marketing">Marketing</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50/50 border-b border-neutral-100">
                  <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Concepto</th>
                  <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Categoría</th>
                  <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-right">Monto</th>
                  <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-neutral-500">Cargando egresos...</td>
                  </tr>
                ) : egresosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-neutral-500">No hay egresos registrados.</td>
                  </tr>
                ) : (
                  egresosFiltrados.map((egreso) => (
                    <tr key={egreso.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                        {new Date(egreso.fecha).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-neutral-900">{egreso.concepto}</div>
                        <div className="text-xs text-neutral-500">{egreso.descripcion}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                          egreso.categoria === 'Comisiones' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                          egreso.categoria === 'Operativos' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                          'bg-purple-50 text-purple-700 border-purple-100'
                        }`}>
                          {egreso.categoria}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-neutral-900 text-right">
                        ${Number(egreso.monto).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => { setEgresoToEdit(egreso); setShowModal(true); }}
                          className="text-neutral-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 transition-colors inline-block mr-2"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => setEgresoToDelete(egreso)}
                          className="text-neutral-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors inline-block"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <NuevoEgresoModal 
          isOpen={showModal} 
          onClose={() => { setShowModal(false); setEgresoToEdit(null); }} 
          onSubmit={handleCreateOrUpdateEgreso}
          initialData={egresoToEdit}
        />

        <ConfirmModal
          isOpen={!!egresoToDelete}
          title="Eliminar Egreso"
          message={`¿Estás seguro de que deseas eliminar este egreso por $${egresoToDelete?.monto.toLocaleString()}? Esta acción no se puede deshacer.`}
          onConfirm={handleDeleteEgreso}
          onCancel={() => setEgresoToDelete(null)}
          confirmText="Eliminar"
        />
      </main>
    </ErrorBoundary>
  );
};

export default Egresos;
