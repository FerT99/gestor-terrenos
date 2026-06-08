import React, { useState, useEffect } from 'react';
import { UserPlus, Mail, Phone, Loader2, Edit2, Trash2 } from 'lucide-react';
import { api, type Cliente, type ClienteInput } from '../lib/api';
import ClienteModal from './ClienteModal';
import ConfirmModal from './ConfirmModal';

interface ClientsProps {
  searchQuery?: string;
  onSelectCliente?: (id: string) => void;
}

const Clients: React.FC<ClientsProps> = ({ searchQuery = '', onSelectCliente }) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Cliente | null>(null);
  const [morososIds, setMorososIds] = useState<Set<string>>(new Set());
  const [clientLotesCount, setClientLotesCount] = useState<Record<string, number>>({});
  const [confirmDelete, setConfirmDelete] = useState<{isOpen: boolean, clientId: string | null}>({ isOpen: false, clientId: null });

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const [clientesData, morososData, planesData] = await Promise.all([
        api.clientes.getAll(),
        api.reportes.getMorosos(),
        api.planesPago.getAll()
      ]);
      setClientes(clientesData);

      const morososSet = new Set((morososData || []).map(m => m.id));
      setMorososIds(morososSet);

      const lotesMap: Record<string, number> = {};
      (planesData || []).forEach(p => {
        lotesMap[p.cliente_id] = (lotesMap[p.cliente_id] || 0) + 1;
      });
      setClientLotesCount(lotesMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCliente = async (input: ClienteInput) => {
    if (clientToEdit) {
      await api.clientes.update(clientToEdit.id, input);
    } else {
      await api.clientes.create(input);
    }
    await fetchClientes();
  };

  const handleDeleteClick = (id: string) => {
    setConfirmDelete({ isOpen: true, clientId: id });
  };

  const handleConfirmDelete = async () => {
    const id = confirmDelete.clientId;
    if (!id) return;
    try {
      await api.clientes.delete(id);
      await fetchClientes();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar');
    } finally {
      setConfirmDelete({ isOpen: false, clientId: null });
    }
  };

  const openNewModal = () => {
    setClientToEdit(null);
    setIsModalOpen(true);
  };

  const openEditModal = (client: Cliente) => {
    setClientToEdit(client);
    setIsModalOpen(true);
  };

  const getInitials = (name?: string) => {
    if (!name) return '??';
    return name.trim().split(' ').map(n => n[0]).filter(Boolean).join('').substring(0, 2).toUpperCase();
  };

  return (
    <main className="p-6 md:p-10 max-w-7xl mx-auto min-h-[calc(100vh-4rem)] bg-neutral-50/50">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900">Portafolio de Clientes</h2>
          <p className="text-neutral-500 mt-1">Administra relaciones y propiedades asignadas.</p>
        </div>
        <button
          onClick={openNewModal}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white px-5 py-2.5 rounded-xl font-medium hover:from-orange-700 hover:to-orange-600 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          <UserPlus size={18} />
          <span>Registrar Cliente</span>
        </button>
      </div>



      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
          <Loader2 size={32} className="animate-spin mb-4 text-orange-500" />
          <p>Cargando clientes...</p>
        </div>
      ) : clientes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-neutral-200 border-dashed">
          <UserPlus size={48} className="mx-auto text-neutral-300 mb-4" />
          <h3 className="text-lg font-medium text-neutral-900">No hay clientes</h3>
          <p className="text-neutral-500 mt-1">Registra tu primer cliente para empezar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {clientes.filter(c => {
            const q = searchQuery.toLowerCase();
            return !q || c.nombre_completo.toLowerCase().includes(q) || 
                   (c.email && c.email.toLowerCase().includes(q)) || 
                   (c.telefono && c.telefono.toLowerCase().includes(q));
          }).map(client => {
            const isMoroso = morososIds.has(client.id);
            return (
              <div 
                key={client.id} 
                className={`bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md transition-shadow group relative overflow-hidden cursor-pointer ${
                  isMoroso ? 'border-red-300 bg-red-50/20' : 'border-neutral-200'
                }`}
                onClick={() => onSelectCliente?.(client.id)}
              >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2" onClick={(e) => e.stopPropagation()}>
                <button 
                  onClick={() => openEditModal(client)}
                  className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors tooltip-trigger" 
                  title="Editar Cliente"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => handleDeleteClick(client.id)}
                  className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors tooltip-trigger" 
                  title="Eliminar Cliente"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 text-orange-700 flex items-center justify-center font-bold text-xl ring-4 ring-orange-50 shrink-0">
                  {getInitials(client.nombre_completo)}
                </div>

                <div className="flex-1 min-w-0 pr-16">
                  <h3 className="text-lg font-bold text-neutral-900 truncate">{client.nombre_completo}</h3>
                  <div className="mt-1 space-y-1">
                    <div className="flex items-center gap-1.5 text-sm text-neutral-500 truncate">
                      <Mail size={14} className="text-neutral-400 shrink-0" />
                      <span className="truncate">{client.email || 'Sin correo'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-neutral-500">
                      <Phone size={14} className="text-neutral-400 shrink-0" />
                      <span>{client.telefono || 'Sin teléfono'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Lotes Asignados</span>
                  <span className="text-lg font-bold text-neutral-800">
                    {clientLotesCount[client.id] || 0}
                  </span>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Estado</span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${client.estado === 'Activo'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${client.estado === 'Activo' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                    {client.estado}
                  </span>
                </div>
              </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && clientes.length > 0 && (
        <div className="flex items-center justify-between px-6 py-4 bg-white rounded-2xl shadow-sm border border-neutral-200">
          <span className="text-sm text-neutral-500">Mostrando <span className="font-medium text-neutral-900">{clientes.length}</span> clientes registrados</span>
        </div>
      )}

      <ClienteModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveCliente}
        initialData={clientToEdit}
      />

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        title="Eliminar Cliente"
        message="¿Estás seguro de eliminar este cliente? Se eliminarán también sus planes de pago y abonos asociados."
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete({ isOpen: false, clientId: null })}
      />
    </main>
  );
};

export default Clients;
