import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

interface NuevoEgresoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
}

const EMPTY_FORM = {
  fecha: new Date().toISOString().split('T')[0],
  concepto: '',
  monto: '',
  categoria: 'Operativos',
  descripcion: '',
};

const NuevoEgresoModal: React.FC<NuevoEgresoModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [moneda, setMoneda] = useState('MXN');
  const [tipoCambio, setTipoCambio] = useState<number | ''>('');
  const [isFetchingExchange, setIsFetchingExchange] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setForm({
          fecha: initialData.fecha.split('T')[0],
          concepto: initialData.concepto,
          monto: initialData.monto.toString(),
          categoria: initialData.categoria,
          descripcion: initialData.descripcion || '',
        });
      } else {
        setForm(EMPTY_FORM);
        setMoneda('MXN');
        setTipoCambio('');
      }
      setError(null);
    }
  }, [isOpen, initialData]);

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

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.concepto.trim()) { setError('El concepto es requerido'); return; }
    if (!form.monto || isNaN(Number(form.monto)) || Number(form.monto) <= 0) { setError('El monto debe ser un número mayor a 0'); return; }

    setSaving(true);
    setError(null);
    try {
      let finalMonto = Number(form.monto);
      let finalDesc = form.descripcion;

      if (moneda === 'USD') {
        const tc = Number(tipoCambio) || 1;
        finalMonto = Number(form.monto) * tc;
        const extraNote = `(Ingresado como $${Number(form.monto).toLocaleString('en-US', {minimumFractionDigits: 2})} USD, TC: $${tc})`;
        finalDesc = finalDesc ? `${finalDesc} \n${extraNote}` : extraNote;
      }

      await onSubmit({
        ...form,
        monto: finalMonto,
        descripcion: finalDesc
      });
      setForm(EMPTY_FORM);
      setMoneda('MXN');
      setTipoCambio('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm transition-opacity" />
      
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-6 py-5 border-b border-neutral-100 bg-neutral-50/50">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">{initialData ? 'Editar Egreso' : 'Nuevo Egreso'}</h2>
            <p className="text-sm text-neutral-500 mt-1">Registra una comisión o gasto operativo</p>
          </div>
          <button 
            className="p-2 -mr-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors disabled:opacity-50" 
            onClick={onClose} 
            disabled={saving}
          >
            <X size={20} />
          </button>
        </div>

        <form className="p-6 overflow-y-auto max-h-[calc(100vh-10rem)]" onSubmit={handleSubmit}>
          <div className="space-y-1.5 mb-5">
            <label htmlFor="fecha" className="text-sm font-medium text-neutral-700">Fecha <span className="text-red-500">*</span></label>
            <input 
              id="fecha" name="fecha" type="date"
              value={form.fecha} onChange={handleChange} 
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>

          <div className="space-y-1.5 mb-5">
            <label htmlFor="concepto" className="text-sm font-medium text-neutral-700">Concepto <span className="text-red-500">*</span></label>
            <input 
              id="concepto" name="concepto" type="text" placeholder="Ej. Comisión por Venta Lote 45" 
              value={form.concepto} onChange={handleChange} 
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
            <div className="space-y-1.5">
              <label htmlFor="monto" className="text-sm font-medium text-neutral-700">Monto ($) <span className="text-red-500">*</span></label>
              <input 
                id="monto" name="monto" type="number" step="0.01" min="0" placeholder="0.00" 
                value={form.monto} onChange={handleChange} 
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="categoria" className="text-sm font-medium text-neutral-700">Categoría <span className="text-red-500">*</span></label>
              <select 
                id="categoria" name="categoria" value={form.categoria} onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              >
                <option value="Comisiones">Comisiones</option>
                <option value="Operativos">Operativos</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700">Moneda</label>
              <select 
                value={moneda}
                onChange={(e) => {
                  setMoneda(e.target.value);
                  if (e.target.value !== 'USD') setTipoCambio('');
                }}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              >
                <option value="MXN">MXN - Pesos Mexicanos</option>
                <option value="USD">USD - Dólares</option>
              </select>
            </div>
            
            {moneda === 'USD' && (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <label className="text-sm font-medium text-neutral-700 flex items-center justify-between">
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
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                </div>
              </div>
            )}
          </div>
          
          {moneda === 'USD' && tipoCambio !== '' && form.monto !== '' && (
            <div className="mb-5 p-4 bg-orange-50 rounded-xl border border-orange-100 flex items-center justify-between text-sm">
              <span className="text-neutral-600">Equivalente en Pesos:</span>
              <span className="font-bold text-orange-700">
                ${(Number(form.monto) * Number(tipoCambio)).toLocaleString('es-MX', {minimumFractionDigits: 2})} MXN
              </span>
            </div>
          )}

          <div className="space-y-1.5 mb-5">
            <label htmlFor="descripcion" className="text-sm font-medium text-neutral-700">Descripción (opcional)</label>
            <textarea 
              id="descripcion" name="descripcion" rows={2} placeholder="Detalles adicionales del gasto"
              value={form.descripcion} onChange={handleChange} 
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
            />
          </div>

          {error && <p className="mb-4 text-sm font-medium text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

          <div className="flex items-center justify-end gap-3 pt-5 border-t border-neutral-100">
            <button 
              type="button" 
              className="px-5 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors disabled:opacity-50" 
              onClick={onClose} 
              disabled={saving}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="flex items-center gap-2 bg-neutral-900 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-neutral-800 transition-all shadow-md hover:shadow-lg disabled:opacity-70" 
              disabled={saving}
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : null}
              {saving ? 'Guardando...' : 'Guardar Egreso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NuevoEgresoModal;
