import { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  Wallet, 
  DollarSign, 
  AlertTriangle, 
  Calendar, 
  Filter, 
  Banknote,
  CheckCircle2
} from 'lucide-react';
import { api, type Abono, type ClienteMoroso } from '../lib/api';
import NewPaymentModal from './NewPaymentModal';
import ErrorBoundary from './ErrorBoundary';

const Payments = () => {
  const [abonos, setAbonos] = useState<Abono[]>([]);
  const [morosos, setMorosos] = useState<ClienteMoroso[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [abonosData, morososData] = await Promise.all([
        api.abonos.getAll(),
        api.reportes.getMorosos()
      ]);
      setAbonos(abonosData || []);
      setMorosos(morososData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSuccess = () => {
    setIsModalOpen(false);
    fetchData(); // Reload table after payment
  };

  const totalCobros = (abonos || []).reduce((acc, curr) => acc + curr.monto_pagado, 0);
  const totalMora = (morosos || []).reduce((acc, curr) => acc + curr.monto_esperado, 0);

  return (
    <ErrorBoundary>
      <main className="p-6 md:p-10 max-w-7xl mx-auto min-h-[calc(100vh-4rem)] bg-neutral-50/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900">Gestión de Pagos</h2>
          <p className="text-neutral-500 mt-1">Administración de abonos, moratoria y estado de cuenta de clientes.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white px-5 py-2.5 rounded-xl font-medium hover:from-orange-700 hover:to-orange-600 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          <PlusCircle size={18} />
          <span>Registrar Abono</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
              <Wallet size={20} />
            </div>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Activo</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-neutral-500 mb-1">Cobros Registrados</span>
            <span className="text-2xl font-bold text-neutral-900">
              ${totalCobros.toLocaleString(undefined, {minimumFractionDigits: 2})}
            </span>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-neutral-500 mb-1">Abonos Realizados</span>
            <span className="text-2xl font-bold text-neutral-900">{(abonos || []).length}</span>
          </div>
        </div>

        <div className="bg-red-50 rounded-2xl p-6 shadow-sm border border-red-200">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle size={20} />
            </div>
            <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full">En Riesgo</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-red-600/80 mb-1">Monto en Mora</span>
            <span className="text-2xl font-bold text-red-600">
              ${totalMora.toLocaleString(undefined, {minimumFractionDigits: 2})}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="flex flex-1 items-center justify-center gap-2 px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
              <Calendar size={16} className="text-neutral-400" />
              <span>Todos los tiempos</span>
            </button>
            <button className="flex flex-1 items-center justify-center gap-2 px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
              <Filter size={16} className="text-neutral-400" />
              <span>Filtros</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-neutral-100">
              <h3 className="text-lg font-bold text-neutral-900">Abonos Recientes</h3>
            </div>
            
            {loading ? (
              <div className="p-8 text-center text-neutral-500">Cargando abonos...</div>
            ) : !(abonos?.length > 0) ? (
              <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
                <Banknote size={48} className="mb-4 opacity-20" />
                <p className="font-medium text-neutral-600">No hay abonos registrados</p>
                <p className="text-sm mt-1">Registra un nuevo abono para verlo aquí.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-50/80 border-b border-neutral-200">
                      <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Abono</th>
                      <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Fecha</th>
                      <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {(abonos || []).map(abono => (
                      <tr key={abono.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-neutral-900">
                          Abono {String(abono.numero_abono || 1).padStart(2, '0')}
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-600">
                          {new Date(abono.fecha_pago).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 font-semibold text-emerald-600">
                          ${abono.monto_pagado.toLocaleString(undefined, {minimumFractionDigits: 2})} {abono.moneda || 'MXN'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {!loading && (abonos?.length || 0) > 0 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100 bg-neutral-50/50">
                <span className="text-sm text-neutral-500">Mostrando {(abonos || []).length} abonos</span>
              </div>
            )}
          </div>
        </div>

        <div className="xl:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 flex flex-col h-full">
            <div className="p-6 border-b border-neutral-100">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle size={18} className="text-red-500" />
                <h3 className="text-lg font-bold text-neutral-900">Adeudos Vencidos</h3>
              </div>
              <p className="text-sm text-neutral-500">Atención requerida para clientes en mora.</p>
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              {loading ? (
                <div className="py-10 text-center text-neutral-500">Cargando...</div>
              ) : !(morosos?.length > 0) ? (
                 <div className="flex-1 flex flex-col items-center justify-center py-10 text-neutral-400">
                  <CheckCircle2 size={48} className="mb-4 opacity-20 text-emerald-500" />
                  <p className="font-medium text-neutral-600">Todo al corriente</p>
                  <p className="text-sm text-center mt-1">No hay adeudos vencidos en este momento.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {(morosos || []).map(debt => (
                    <div key={debt.id} className="p-4 rounded-xl border border-red-100 bg-red-50/30">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex flex-col">
                          <span className="font-semibold text-neutral-900">{debt.nombre_completo}</span>
                          <span className="text-xs text-neutral-500">Lote {debt.terreno_clave}</span>
                        </div>
                        <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-md">{debt.dias_retraso} días</span>
                      </div>
                      <div className="flex justify-between items-end mt-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-neutral-400">P. {debt.numero_periodo}</span>
                          <span className="font-bold text-red-600">
                            ${debt.monto_esperado.toLocaleString(undefined, {minimumFractionDigits: 2})}
                          </span>
                        </div>
                        <button className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors">Ver</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
        
        {isModalOpen && (
          <ErrorBoundary>
            <NewPaymentModal 
              onClose={() => setIsModalOpen(false)} 
              onSuccess={handleSuccess} 
            />
          </ErrorBoundary>
        )}
      </main>
    </ErrorBoundary>
  );
};

export default Payments;
