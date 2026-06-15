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
  const [metodoPago, setMetodoPago] = useState<'Efectivo' | 'Transferencia' | 'Mixto'>('Transferencia');
  const [montoEfectivo, setMontoEfectivo] = useState<number | ''>('');
  const [montoTransferencia, setMontoTransferencia] = useState<number | ''>('');
  const [moneda, setMoneda] = useState('MXN');
  const [fechaPago, setFechaPago] = useState(new Date().toISOString().split('T')[0]);
  const [comprobanteFile, setComprobanteFile] = useState<File | null>(null);
  const [tipoCambio, setTipoCambio] = useState<number | ''>('');
  const [isFetchingExchange, setIsFetchingExchange] = useState(false);
  const [aplicarMora, setAplicarMora] = useState(false);
  const [tipoMora, setTipoMora] = useState<'fija' | 'porcentaje'>('fija');
  const [moraAplicada, setMoraAplicada] = useState<number | ''>('');
  
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
        setMontoEfectivo(periodo.monto_esperado);
        setMontoTransferencia('');
      }
    } else {
      setMontoPagado('');
      setMontoEfectivo('');
      setMontoTransferencia('');
    }
  }, [selectedPeriodoId, periodos]);

  // Fetch exchange rate when USD is selected
  useEffect(() => {
    if (moneda === 'USD' && tipoCambio === '') {
      setIsFetchingExchange(true);
      fetch('https://api.exchangerate-api.com/v4/latest/USD')
        .then(res => res.json())
        .then(data => {
          if (data && data.rates && data.rates.MXN) {
            setTipoCambio(data.rates.MXN);
          }
        })
        .catch(err => console.error("Error fetching exchange rate:", err))
        .finally(() => setIsFetchingExchange(false));
    }
  }, [moneda]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPeriodoId) {
      setError('Este terreno no tiene pagos pendientes.');
      return;
    }
    if (metodoPago === 'Mixto') {
      const ef = Number(montoEfectivo) || 0;
      const tr = Number(montoTransferencia) || 0;
      if (ef + tr <= 0) {
        setError('Por favor define los montos para el pago mixto.');
        return;
      }
    } else {
      if (!montoPagado) {
        setError('Por favor define el monto.');
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      let comprobante_url = '';
      if (comprobanteFile) {
        comprobante_url = await api.abonos.uploadComprobante(comprobanteFile);
      }

      const periodoSeleccionado = (periodos || []).find(p => p.id === selectedPeriodoId);
      let moraFinal = aplicarMora 
        ? (tipoMora === 'porcentaje' 
            ? ((periodoSeleccionado?.monto_esperado || 0) * (Number(moraAplicada) || 0) / 100) 
            : (Number(moraAplicada) || 0))
        : 0;

      const baseAbono = {
        periodo_pago_id: selectedPeriodoId,
        fecha_pago: fechaPago,
        notas: '',
        tipo_cambio: moneda === 'USD' && tipoCambio !== '' ? Number(tipoCambio) : undefined,
        moneda: moneda,
        comprobante_url: comprobante_url || undefined,
      };

      if (metodoPago === 'Mixto') {
        const ef = Number(montoEfectivo) || 0;
        const tr = Number(montoTransferencia) || 0;
        
        if (ef > 0) {
          await api.abonos.create({
            ...baseAbono,
            monto_pagado: ef,
            metodo_pago: 'Efectivo',
            mora_aplicada: moraFinal,
          });
          moraFinal = 0; // Solo aplicar mora al primer abono para no duplicar
        }
        if (tr > 0) {
          await api.abonos.create({
            ...baseAbono,
            monto_pagado: tr,
            metodo_pago: 'Transferencia',
            mora_aplicada: moraFinal,
          });
        }
      } else {
        await api.abonos.create({
          ...baseAbono,
          monto_pagado: Number(montoPagado),
          metodo_pago: metodoPago,
          mora_aplicada: moraFinal,
        });
      }

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
              <label className="text-sm font-semibold text-neutral-700">Método de Pago</label>
              <select 
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
              >
                <option value="Transferencia">Transferencia</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Mixto">Mixto (Efectivo y Transferencia)</option>
              </select>
            </div>

            {metodoPago === 'Mixto' ? (
              <div className="md:col-span-2 grid grid-cols-2 gap-4 border border-orange-100 bg-orange-50/50 p-4 rounded-xl">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-neutral-700">Monto Efectivo ($)</label>
                  <input 
                    type="number"
                    min="0"
                    step="0.01"
                    value={montoEfectivo}
                    onChange={(e) => setMontoEfectivo(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-neutral-700">Monto Transferencia ($)</label>
                  <input 
                    type="number"
                    min="0"
                    step="0.01"
                    value={montoTransferencia}
                    onChange={(e) => setMontoTransferencia(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                  />
                </div>
                <div className="col-span-2 text-right">
                  <span className="text-sm font-bold text-neutral-600">
                    Suma Total: ${((Number(montoEfectivo) || 0) + (Number(montoTransferencia) || 0)).toLocaleString('es-MX', {minimumFractionDigits: 2})}
                  </span>
                </div>
              </div>
            ) : (
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
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-neutral-700">Moneda</label>
              <select 
                value={moneda}
                onChange={(e) => {
                  setMoneda(e.target.value);
                  if (e.target.value !== 'USD') setTipoCambio('');
                }}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
              >
                <option value="MXN">MXN - Pesos Mexicanos</option>
                <option value="USD">USD - Dólares</option>
              </select>
            </div>
            
            {moneda === 'USD' && (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <label className="text-sm font-semibold text-neutral-700 flex items-center justify-between">
                  <span>Tipo de Cambio (MXN)</span>
                  {isFetchingExchange && <span className="text-xs text-neutral-400">Actualizando...</span>}
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-neutral-500 font-medium px-1">$</span>
                  <input 
                    type="number"
                    min="0"
                    step="0.0001"
                    value={tipoCambio}
                    onChange={(e) => setTipoCambio(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                  />
                </div>
                {tipoCambio !== '' && montoPagado !== '' && (
                  <p className="text-xs text-neutral-500 font-medium">
                    Equivalente: ${(Number(montoPagado) * Number(tipoCambio)).toLocaleString('es-MX', {minimumFractionDigits: 2})} MXN
                  </p>
                )}
              </div>
            )}
            
            {/* Upload File Input Removed - Now generating automatic PDFs */}
            
            <div className="md:col-span-2 space-y-3 mt-2">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="aplicarMora"
                  checked={aplicarMora}
                  onChange={(e) => {
                    setAplicarMora(e.target.checked);
                    if (!e.target.checked) setMoraAplicada('');
                  }}
                  className="w-4 h-4 text-orange-600 rounded border-neutral-300 focus:ring-orange-500 cursor-pointer"
                />
                <label htmlFor="aplicarMora" className="text-sm font-semibold text-neutral-700 cursor-pointer">
                  Aplicar mora manual
                </label>
              </div>

              {aplicarMora && (
                <div className="pl-6 animate-in slide-in-from-top-2 duration-200 fade-in space-y-4 mt-3">
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="tipoMora" 
                        value="fija" 
                        checked={tipoMora === 'fija'} 
                        onChange={() => setTipoMora('fija')} 
                        className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-neutral-300" 
                      />
                      <span className="text-sm font-medium text-neutral-700">Cantidad Fija ($)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="tipoMora" 
                        value="porcentaje" 
                        checked={tipoMora === 'porcentaje'} 
                        onChange={() => setTipoMora('porcentaje')} 
                        className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-neutral-300" 
                      />
                      <span className="text-sm font-medium text-neutral-700">Porcentaje (%)</span>
                    </label>
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-neutral-700 mb-1.5 block">
                      {tipoMora === 'fija' ? 'Monto de Mora ($)' : 'Porcentaje de Mora (%)'}
                    </label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="number"
                        min="0"
                        step="0.01"
                        value={moraAplicada}
                        onChange={(e) => setMoraAplicada(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full md:w-1/2 px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                        placeholder="0.00"
                      />
                      {tipoMora === 'porcentaje' && moraAplicada !== '' && (
                        <span className="text-sm text-neutral-500 font-medium whitespace-nowrap bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-100">
                          ≈ ${(((periodos.find(p => p.id === selectedPeriodoId)?.monto_esperado || 0) * Number(moraAplicada)) / 100).toLocaleString('es-MX', {minimumFractionDigits: 2})} extra
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
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
