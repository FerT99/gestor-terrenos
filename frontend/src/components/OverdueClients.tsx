import { useState, useEffect } from 'react';
import { MoreHorizontal, CheckCircle2 } from 'lucide-react';
import { api, type ClienteMoroso } from '../lib/api';

const OverdueClients = () => {
  const [clients, setClients] = useState<ClienteMoroso[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMorosos = async () => {
      try {
        const data = await api.reportes.getMorosos();
        setClients(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMorosos();
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 flex flex-col h-full">
      <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
        <h3 className="font-bold text-neutral-900">Clientes en Mora</h3>
        <button className="p-2 text-neutral-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors">
          <MoreHorizontal size={20} />
        </button>
      </div>
      
      <div className="p-6 flex-1 flex flex-col">
        <div className="space-y-4">
          {loading ? (
            <p className="text-sm text-neutral-500 text-center py-4">Cargando...</p>
          ) : clients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-neutral-400">
              <CheckCircle2 size={32} className="text-green-500/50 mb-2" />
              <p className="text-sm font-medium text-neutral-600">¡Al día!</p>
              <p className="text-xs">No hay clientes con atrasos.</p>
            </div>
          ) : (
            clients.map(client => (
              <div key={client.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-neutral-50 border border-transparent hover:border-neutral-100 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 font-bold flex items-center justify-center text-sm border border-red-200">
                    {client.nombre_completo.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900 group-hover:text-orange-600 transition-colors">
                      {client.nombre_completo}
                    </h4>
                    <p className="text-xs font-medium text-neutral-500">Lote {client.terreno_clave}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm font-bold text-red-600">${client.monto_esperado.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                  <p className="text-[10px] font-bold uppercase text-red-500/70">{client.dias_retraso} días tarde</p>
                </div>
              </div>
            ))
          )}
        </div>
        
        <button className="w-full mt-6 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 font-medium hover:bg-neutral-50 transition-colors">
          Ver reporte completo
        </button>
      </div>
    </div>
  );
};

export default OverdueClients;
