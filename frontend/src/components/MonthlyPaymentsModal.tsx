import React from 'react';
import { X, Calendar, Wallet } from 'lucide-react';
import { type Abono } from '../lib/api';

interface MonthlyPaymentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  month: number;
  year: number;
  abonos: Abono[];
  onNavigateToTerreno?: (id: string) => void;
}

const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const MonthlyPaymentsModal: React.FC<MonthlyPaymentsModalProps> = ({ isOpen, onClose, month, year, abonos, onNavigateToTerreno }) => {
  if (!isOpen) return null;

  const filteredAbonos = abonos.filter(abono => {
    const [yearStr, monthStr] = abono.fecha_pago.split('T')[0].split('-');
    if (yearStr && monthStr) {
      const abonoYear = parseInt(yearStr, 10);
      const abonoMonth = parseInt(monthStr, 10) - 1;
      return abonoMonth === month && abonoYear === year;
    }
    return false;
  }).sort((a, b) => new Date(b.fecha_pago).getTime() - new Date(a.fecha_pago).getTime());

  const totalMensual = filteredAbonos.reduce((acc, curr) => acc + curr.monto_pagado, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-100 bg-neutral-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
              <Calendar size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900">
                Pagos de {months[month]} {year}
              </h2>
              <p className="text-sm text-neutral-500 font-medium">
                {filteredAbonos.length} abonos registrados
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-white">
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-6 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Wallet className="text-orange-600" size={24} />
              <span className="font-semibold text-orange-900">Total Ingresado en el Mes</span>
            </div>
            <span className="text-xl font-black text-orange-700">
              ${totalMensual.toLocaleString('es-MX', {minimumFractionDigits: 2})}
            </span>
          </div>

          <div className="rounded-xl border border-neutral-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50/50 border-b border-neutral-200">
                  <th className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase">Fecha</th>
                  <th className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase">Cliente</th>
                  <th className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase">Terreno</th>
                  <th className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredAbonos.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-neutral-500">
                      No hay pagos registrados en este mes.
                    </td>
                  </tr>
                ) : (
                  filteredAbonos.map(abono => (
                    <tr 
                      key={abono.id} 
                      className={`transition-colors ${onNavigateToTerreno && abono.terreno_id ? 'hover:bg-orange-50 cursor-pointer' : 'hover:bg-neutral-50'}`}
                      onClick={() => {
                        if (onNavigateToTerreno && abono.terreno_id) {
                          onNavigateToTerreno(abono.terreno_id);
                          onClose();
                        }
                      }}
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-600">
                        {new Date(abono.fecha_pago).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-neutral-900">{abono.cliente_nombre || 'Cliente Desconocido'}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-neutral-900 hover:text-orange-600 transition-colors">{abono.terreno_clave || '-'}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right font-bold text-neutral-900">
                        ${abono.monto_pagado.toLocaleString('es-MX', {minimumFractionDigits: 2})} {abono.moneda}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyPaymentsModal;
