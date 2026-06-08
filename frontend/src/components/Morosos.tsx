import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { api, type ClienteMoroso } from '../lib/api';
import ErrorBoundary from './ErrorBoundary';

interface MorososProps {
  onBack: () => void;
}

const Morosos: React.FC<MorososProps> = ({ onBack }) => {
  const [morosos, setMorosos] = useState<ClienteMoroso[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.reportes.getMorosos();
        setMorosos(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <ErrorBoundary>
      <main className="p-6 md:p-10 max-w-7xl mx-auto min-h-[calc(100vh-4rem)] bg-neutral-50/50">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-neutral-200 rounded-lg transition-colors text-neutral-500"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 flex items-center gap-3">
              <AlertTriangle className="text-red-500" />
              Adeudos Vencidos
            </h2>
            <p className="text-neutral-500 mt-1">Gestión y seguimiento de clientes en mora.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 flex flex-col min-h-[400px]">
          <div className="p-6 flex-1 flex flex-col">
            {loading ? (
              <div className="py-20 text-center text-neutral-500">Cargando adeudos...</div>
            ) : !(morosos?.length > 0) ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-neutral-400">
                <CheckCircle2 size={64} className="mb-4 opacity-20 text-emerald-500" />
                <p className="text-xl font-medium text-neutral-600">Todo al corriente</p>
                <p className="text-neutral-500 mt-2">No hay adeudos vencidos en este momento.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(morosos || []).map(debt => (
                  <div key={debt.id} className="p-5 rounded-xl border border-red-100 bg-red-50/30 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-lg text-neutral-900">{debt.nombre_completo}</span>
                        <span className="text-sm text-neutral-500 mt-1">Lote {debt.terreno_clave}</span>
                      </div>
                      <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1.5 rounded-md">{debt.dias_retraso} días</span>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-red-100/50 flex justify-between items-end">
                      <div className="flex flex-col">
                        <span className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Monto Esperado</span>
                        <span className="text-lg font-black text-red-600">
                          ${debt.monto_esperado.toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </span>
                      </div>
                      <div className="text-right">
                         <span className="text-sm font-semibold text-red-800">
                          Periodo {debt.numero_periodo}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </ErrorBoundary>
  );
};

export default Morosos;
