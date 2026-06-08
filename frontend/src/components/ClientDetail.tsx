import React, { useState, useEffect } from 'react';
import { ArrowLeft, Map, Mail, Phone, Calendar, Loader2, AlertTriangle } from 'lucide-react';
import { api, type Cliente, type PlanPago, type Terreno } from '../lib/api';

interface ClientDetailProps {
  clienteId: string;
  onBack: () => void;
  onViewTerreno?: (terrenoId: string) => void;
}

const ClientDetail: React.FC<ClientDetailProps> = ({ clienteId, onBack, onViewTerreno }) => {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [planes, setPlanes] = useState<PlanPago[]>([]);
  const [terrenos, setTerrenos] = useState<Terreno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [clientesData, planesData, terrenosData] = await Promise.all([
          api.clientes.getAll(),
          api.planesPago.getAll(),
          api.terrenos.getAll()
        ]);

        const currentClient = clientesData.find(c => c.id === clienteId);
        if (!currentClient) throw new Error('Cliente no encontrado');
        setCliente(currentClient);

        // Planes que pertenecen a este cliente
        const clientPlanes = planesData.filter(p => p.cliente_id === clienteId);
        setPlanes(clientPlanes);

        // Terrenos de esos planes
        const terrenoIds = clientPlanes.map(p => p.terreno_id);
        setTerrenos(terrenosData.filter(t => terrenoIds.includes(t.id)));

      } catch (err: any) {
        setError(err.message || 'Error al cargar los detalles del cliente.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clienteId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-neutral-400 min-h-[calc(100vh-4rem)]">
        <Loader2 size={40} className="animate-spin text-orange-500 mb-4" />
        <p className="font-medium text-lg">Cargando perfil del cliente...</p>
      </div>
    );
  }

  if (error || !cliente) {
    return (
      <div className="p-10 max-w-3xl mx-auto text-center min-h-[calc(100vh-4rem)]">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 flex flex-col items-center">
          <AlertTriangle size={32} className="mb-4" />
          <h2 className="text-xl font-bold mb-2">Ups, ocurrió un problema</h2>
          <p>{error || 'No se pudo cargar el cliente.'}</p>
          <button 
            onClick={onBack}
            className="mt-6 px-6 py-2 bg-white text-neutral-700 rounded-lg shadow-sm border border-neutral-200 font-medium hover:bg-neutral-50 transition-colors"
          >
            Volver a clientes
          </button>
        </div>
      </div>
    );
  }

  // Combinar la información de los planes con la de los terrenos para iterar más fácil
  const lotesAsignados = planes.map(plan => {
    const terreno = terrenos.find(t => t.id === plan.terreno_id);
    return { plan, terreno };
  }).filter(({ terreno }) => terreno && terreno.estado !== 'disponible');

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto min-h-[calc(100vh-4rem)]">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-orange-600 transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        <span>Regresar a clientes</span>
      </button>

      {/* Perfil del Cliente */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 sm:p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${
            cliente.estado === 'Activo' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
            'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              cliente.estado === 'Activo' ? 'bg-emerald-500' : 'bg-amber-500'
            }`}></span>
            {cliente.estado}
          </span>
        </div>

        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 text-orange-700 flex items-center justify-center font-bold text-4xl ring-4 ring-orange-50 shrink-0">
            {cliente.nombre_completo.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          
          <div className="flex-1 mt-2">
            <h1 className="text-3xl font-bold text-neutral-900 mb-4">{cliente.nombre_completo}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
              <div className="flex items-center gap-3 text-neutral-600">
                <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                  <Mail size={16} />
                </div>
                <div>
                  <span className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">Correo Electrónico</span>
                  <span className="text-sm font-medium">{cliente.email || 'No proporcionado'}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-neutral-600">
                <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                  <Phone size={16} />
                </div>
                <div>
                  <span className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">Teléfono</span>
                  <span className="text-sm font-medium">{cliente.telefono || 'No proporcionado'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-neutral-600">
                <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                  <Calendar size={16} />
                </div>
                <div>
                  <span className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">Registrado el</span>
                  <span className="text-sm font-medium">
                    {new Date(cliente.created_at).toLocaleDateString('es-MX', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
          <Map size={24} className="text-orange-500" />
          Terrenos Asignados ({lotesAsignados.length})
        </h2>
      </div>

      {/* Terrenos del cliente */}
      {lotesAsignados.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-12 flex flex-col items-center justify-center text-center">
          <Map size={48} className="text-neutral-200 mb-4" />
          <h3 className="text-xl font-bold text-neutral-700 mb-2">Sin terrenos asignados</h3>
          <p className="text-neutral-500 max-w-md">Este cliente aún no ha comprado ningún lote. Registra una nueva venta para asignarle terrenos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {lotesAsignados.map(({ plan, terreno }) => (
            <div 
              key={plan.id} 
              onClick={() => terreno && onViewTerreno?.(terreno.id)}
              className={`bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 flex flex-col transition-shadow ${onViewTerreno && terreno ? 'cursor-pointer hover:shadow-md' : ''}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="inline-block px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded mb-2">
                    LOTE {terreno?.clave || plan.terreno_nombre || 'Desconocido'}
                  </span>
                  {terreno?.nombre && <h3 className="text-lg font-bold text-neutral-900">{terreno.nombre}</h3>}
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                    plan.estado === 'Activo' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    'bg-neutral-50 text-neutral-700 border-neutral-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      plan.estado === 'Activo' ? 'bg-emerald-500' : 'bg-neutral-500'
                    }`}></span>
                    {plan.estado}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-auto pt-4 border-t border-neutral-100">
                <div>
                  <span className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">Monto de Venta</span>
                  <span className="text-lg font-bold text-neutral-800">
                    ${plan.monto_total.toLocaleString('es-MX', {minimumFractionDigits: 2})}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">Enganche</span>
                  <span className="text-lg font-bold text-neutral-800">
                    ${plan.enganche.toLocaleString('es-MX', {minimumFractionDigits: 2})}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">Plazos Restantes</span>
                  <span className="text-sm font-semibold text-neutral-600">
                    {plan.plazos} meses
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">Superficie</span>
                  <span className="text-sm font-semibold text-neutral-600">
                    {terreno ? `${Number(terreno.superficie_m2).toFixed(2)} m²` : '---'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientDetail;
