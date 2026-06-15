import { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  Wallet, 
  AlertTriangle, 
  Calendar, 
  Filter, 
  Banknote,
  FileText
} from 'lucide-react';
import { api, type Abono, type Terreno, type PlanPago, type Egreso } from '../lib/api';
import { generateReceipt } from '../lib/pdfGenerator';
import NewPaymentModal from './NewPaymentModal';
import ErrorBoundary from './ErrorBoundary';

interface PaymentsProps {
  onViewMorosos: () => void;
}

const Payments: React.FC<PaymentsProps> = ({ onViewMorosos }) => {
  const [abonos, setAbonos] = useState<Abono[]>([]);

  const [terrenos, setTerrenos] = useState<Terreno[]>([]);
  const [planes, setPlanes] = useState<PlanPago[]>([]);
  const [egresos, setEgresos] = useState<Egreso[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const parcelaId = localStorage.getItem('selected_parcela') || '';
      const [abonosData, terrenosData, planesData, egresosData] = await Promise.all([
        api.abonos.getAll(),
        api.terrenos.getAll(),
        api.planesPago.getAll(),
        parcelaId ? api.egresos.getAll(parcelaId) : Promise.resolve([])
      ]);
      setAbonos(abonosData || []);
      setTerrenos(terrenosData || []);
      setPlanes(planesData || []);
      setEgresos(egresosData || []);
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


  const lotesApartados = terrenos.filter(t => t.estado.toLowerCase() === 'apartado').length;
  const lotesAbonados = terrenos.filter(t => t.estado.toLowerCase() === 'vendido').length;
  const valorCapital = planes.reduce((acc, curr) => acc + curr.monto_total, 0); 
  const valorEstimadoMes = planes.reduce((acc, curr) => {
     const montoFinanciar = curr.monto_total - curr.enganche;
     const mensualidad = curr.plazos > 0 ? montoFinanciar / curr.plazos : 0;
     return acc + mensualidad;
  }, 0);
  
  const totalEgresos = (egresos || []).reduce((acc, curr) => acc + (Number(curr.monto) || 0), 0);
  const utilidadNeta = totalCobros - totalEgresos;


  return (
    <ErrorBoundary>
      <main className="p-6 md:p-10 max-w-7xl mx-auto min-h-[calc(100vh-4rem)] bg-neutral-50/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900">Gestión de Pagos</h2>
          <p className="text-neutral-500 mt-1">Administración de abonos, moratoria y estado de cuenta de clientes.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={onViewMorosos}
            className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 px-5 py-2.5 rounded-xl font-medium hover:bg-red-100 transition-all shadow-sm"
          >
            <AlertTriangle size={18} />
            <span>Ver Morosos</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white px-5 py-2.5 rounded-xl font-medium hover:from-orange-700 hover:to-orange-600 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <PlusCircle size={18} />
            <span>Registrar Abono</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-200 flex flex-col justify-between hover:shadow-md transition-shadow">
          <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2">Lotes Apartados</span>
          <span className="text-3xl font-black text-neutral-900">{lotesApartados}</span>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-200 flex flex-col justify-between hover:shadow-md transition-shadow">
          <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2">Lotes Abonados</span>
          <span className="text-3xl font-black text-neutral-900">{lotesAbonados}</span>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-200 flex flex-col justify-between hover:shadow-md transition-shadow">
          <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2">Valor Capital</span>
          <span className="text-2xl font-black text-emerald-600">${valorCapital.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-200 flex flex-col justify-between hover:shadow-md transition-shadow">
          <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2">Utilidad Neta</span>
          <span className="text-2xl font-black text-emerald-600">${utilidadNeta.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-orange-50 rounded-2xl p-6 shadow-sm border border-orange-100 hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10">
            <Calendar size={100} />
          </div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
              <Calendar size={20} />
            </div>
            <span className="text-xs font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-full uppercase tracking-wide">Mensualidad</span>
          </div>
          <div className="flex flex-col relative z-10">
            <span className="text-sm font-semibold text-orange-700/80 mb-1">Valor Estimado por Mes</span>
            <span className="text-3xl font-black text-orange-600">
              ${valorEstimadoMes.toLocaleString(undefined, {minimumFractionDigits: 2})}
            </span>
          </div>
        </div>

        <div className="bg-blue-50 rounded-2xl p-6 shadow-sm border border-blue-100 hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10">
            <Wallet size={100} />
          </div>
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <Wallet size={20} />
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full uppercase tracking-wide">Desglose</span>
          </div>
          <div className="flex flex-col gap-3 relative z-10">
            <div className="flex justify-between items-center border-b border-blue-200/50 pb-2">
              <span className="text-sm font-semibold text-blue-800">Ingresos Brutos</span>
              <span className="text-base font-black text-blue-900">${totalCobros.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
            <div className="flex justify-between items-center border-b border-blue-200/50 pb-2">
              <span className="text-sm font-semibold text-red-600">Egresos Registrados</span>
              <span className="text-base font-black text-red-600">-${totalEgresos.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-sm font-bold text-emerald-800">Utilidad Neta</span>
              <span className="text-lg font-black text-emerald-700">${utilidadNeta.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
          </div>
        </div>


      </div>

      <div className="w-full space-y-6">
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
                      <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Terreno</th>
                      <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Fecha</th>
                      <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Monto</th>
                      <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-right">Comprobante</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {(abonos || []).map(abono => (
                      <tr key={abono.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-neutral-900">
                          Abono {String(abono.numero_abono || 1).padStart(2, '0')}
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-600">
                          <div className="flex flex-col">
                            <span className="font-semibold text-neutral-800">
                              Lote {abono.terreno_clave || '---'}
                            </span>
                            {abono.cliente_nombre && (
                              <span className="text-xs text-neutral-400">
                                {abono.cliente_nombre}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-600">
                          {new Date(abono.fecha_pago).toLocaleDateString('es-MX', {
                            timeZone: 'UTC',
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          })}
                        </td>
                        <td className="px-6 py-4 font-semibold text-emerald-600">
                          ${abono.monto_pagado.toLocaleString(undefined, {minimumFractionDigits: 2})} {abono.moneda || 'MXN'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => generateReceipt(abono)}
                            className="inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors border border-orange-200"
                            title="Generar Recibo PDF"
                          >
                            <FileText size={14} />
                            <span>Generar</span>
                          </button>
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
