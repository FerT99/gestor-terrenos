import React, { useState } from 'react';
import { X } from 'lucide-react';
import { api, type Abono } from '../lib/api';

interface EditPaymentModalProps {
  abono: Abono;
  onClose: () => void;
  onSuccess: () => void;
}

const EditPaymentModal: React.FC<EditPaymentModalProps> = ({ abono, onClose, onSuccess }) => {
  const [montoPagado, setMontoPagado] = useState<number | ''>(abono.monto_pagado);
  const [metodoPago, setMetodoPago] = useState(abono.metodo_pago || 'Transferencia');
  const [fechaPago, setFechaPago] = useState(abono.fecha_pago ? abono.fecha_pago.split('T')[0] : new Date().toISOString().split('T')[0]);
  const [moneda, setMoneda] = useState(abono.moneda || 'MXN');
  const [notas, setNotas] = useState(abono.notas || '');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!montoPagado) return setError('Ingresa un monto.');
    setLoading(true);
    try {
      await api.abonos.update(abono.id, {
        periodo_pago_id: abono.periodo_pago_id,
        monto_pagado: Number(montoPagado),
        metodo_pago: metodoPago,
        fecha_pago: fechaPago,
        moneda,
        notas,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b flex items-center justify-between bg-neutral-50/50">
          <h2 className="text-xl font-bold text-neutral-900">Editar Abono</h2>
          <button onClick={onClose} className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          {error && <div className="mb-4 text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 text-sm">{error}</div>}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-neutral-700">Monto ($)</label>
              <input type="number" step="0.01" min="0.01" value={montoPagado} onChange={e => setMontoPagado(e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none mt-1 transition-all" required />
            </div>
            <div>
              <label className="text-sm font-semibold text-neutral-700">Fecha de Pago</label>
              <input type="date" value={fechaPago} onChange={e => setFechaPago(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none mt-1 transition-all" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-neutral-700">Método de Pago</label>
                <select value={metodoPago} onChange={e => setMetodoPago(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none mt-1 transition-all">
                  <option value="Transferencia">Transferencia</option>
                  <option value="Efectivo">Efectivo</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-neutral-700">Moneda</label>
                <select value={moneda} onChange={e => setMoneda(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none mt-1 transition-all">
                  <option value="MXN">MXN</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-neutral-700">Notas (Opcional)</label>
              <input type="text" value={notas} onChange={e => setNotas(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none mt-1 transition-all" placeholder="Detalles adicionales..." />
            </div>
          </div>
          <div className="mt-8 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors">Cancelar</button>
            <button type="submit" disabled={loading} className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-2">
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPaymentModal;
