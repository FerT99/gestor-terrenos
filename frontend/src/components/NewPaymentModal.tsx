import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Calendar } from 'lucide-react';
import { api, type PlanPago, type PeriodoPago } from '../lib/api';

interface NewPaymentModalProps {
  onClose: () => void;
  onSuccess: () => void;
  initialPlanId?: string;
}

const NewPaymentModal: React.FC<NewPaymentModalProps> = ({ onClose, onSuccess, initialPlanId }) => {
  const [planes, setPlanes] = useState<PlanPago[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>(initialPlanId || '');
  const [periodos, setPeriodos] = useState<PeriodoPago[]>([]);
  const [selectedPeriodoId, setSelectedPeriodoId] = useState<string>('');
  
  const [montoPagado, setMontoPagado] = useState<number | ''>('');
  const [moneda, setMoneda] = useState('MXN');
  const [fechaPago, setFechaPago] = useState(new Date().toISOString().split('T')[0]);
  const [comprobanteFile, setComprobanteFile] = useState<File | null>(null);
  const [perdonarMora, setPerdonarMora] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch planes de pago
  useEffect(() => {
    const fetchPlanes = async () => {
      try {
        const data = await api.planesPago.getAll();
        setPlanes(data || []);
      } catch (err) {
        console.error(err);
        setError('Error al cargar los planes de pago disponibles.');
      }
    };
    fetchPlanes();
  }, []);

  // Fetch periodos when plan is selected
  useEffect(() => {
    if (!selectedPlanId) {
      setPeriodos([]);
      setSelectedPeriodoId('');
      return;
    }
    const fetchPeriodos = async () => {
      try {
        const data = await api.planesPago.getPeriodos(selectedPlanId);
        // Only show pending or partial periods
        const pending = (data || []).filter(p => p.estado !== 'pagado');
        setPeriodos(pending);
        if (pending.length > 0) {
          setSelectedPeriodoId(pending[0].id);
        } else {
          setSelectedPeriodoId('');
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchPeriodos();
  }, [selectedPlanId]);

  // Set default amount when period is selected
  useEffect(() => {
    if (selectedPeriodoId) {
      const periodo = (periodos || []).find(p => p.id === selectedPeriodoId);
      if (periodo) {
        setMontoPagado(periodo.monto_esperado);
      }
    } else {
      setMontoPagado('');
    }
  }, [selectedPeriodoId, periodos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPeriodoId) {
      setError('Este terreno no tiene pagos pendientes.');
      return;
    }
    if (!montoPagado) {
      setError('Por favor define el monto.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let comprobante_url = '';
      if (comprobanteFile) {
        comprobante_url = await api.abonos.uploadComprobante(comprobanteFile);
      }

      await api.abonos.create({
        periodo_pago_id: selectedPeriodoId,
        monto_pagado: Number(montoPagado),
        fecha_pago: fechaPago,
        metodo_pago: 'Transferencia',
        notas: '',
        perdonar_mora: perdonarMora,
        moneda: moneda,
        comprobante_url: comprobante_url || undefined,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al registrar el abono.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-0">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <h2 className="text-xl font-bold text-neutral-900">Registrar Nuevo Abono</h2>
          <button 
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 text-sm border border-red-100">
              <AlertCircle size={18} />
              <p>{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-semibold text-neutral-700">Terreno al que pertenece el abono</label>
              <select 
                required
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
              >
                <option value="">Selecciona un terreno...</option>
                {(planes || []).map(plan => (
                  <option key={plan.id} value={plan.id}>
                    Lote {plan.terreno_nombre} (Propietario: {plan.cliente_nombre})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-neutral-700">Fecha de Pago</label>
              <div className="relative">
                <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input 
                  type="date"
                  required
                  value={fechaPago}
                  onChange={(e) => setFechaPago(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-neutral-700">Monto del Abono ($)</label>
              <input 
                type="number"
                required
                min="0.01"
                step="0.01"
                value={montoPagado}
                onChange={(e) => setMontoPagado(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-neutral-700">Moneda</label>
              <select 
                value={moneda}
                onChange={(e) => setMoneda(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
              >
                <option value="MXN">MXN - Pesos Mexicanos</option>
                <option value="USD">USD - Dólares</option>
              </select>
            </div>
            
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-semibold text-neutral-700">Comprobante de Pago (Opcional)</label>
              <input 
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setComprobanteFile(e.target.files[0]);
                  }
                }}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
              />
            </div>
            
            <div className="md:col-span-2 flex items-center gap-2 mt-2">
              <input 
                type="checkbox" 
                id="perdonarMora"
                checked={perdonarMora}
                onChange={(e) => setPerdonarMora(e.target.checked)}
                className="w-4 h-4 text-orange-600 rounded border-neutral-300 focus:ring-orange-500"
              />
              <label htmlFor="perdonarMora" className="text-sm font-medium text-neutral-700 cursor-pointer">
                Perdonar mora (si el pago está atrasado, no se cobrará el recargo)
              </label>
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-neutral-100 flex items-center justify-end gap-3 bg-neutral-50/50">
          <button 
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? 'Guardando...' : 'Registrar Abono'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewPaymentModal;
