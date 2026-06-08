import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { api, type Terreno, type Cliente, type PlanPagoInput } from '../lib/api';

interface NewSaleModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const NewSaleModal: React.FC<NewSaleModalProps> = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [terrenos, setTerrenos] = useState<Terreno[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  const [selectedTerreno, setSelectedTerreno] = useState('');
  const [selectedCliente, setSelectedCliente] = useState('');

  const [montoTotal, setMontoTotal] = useState<number | ''>('');
  const [enganche, setEnganche] = useState<number | ''>('');
  const [plazos] = useState<number | ''>(40);
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]);
  const [moneda, setMoneda] = useState('MXN');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [terrenosData, clientesData] = await Promise.all([
          api.terrenos.getAll(),
          api.clientes.getAll()
        ]);
        setTerrenos(terrenosData.filter(t => t.estado.toLowerCase() === 'disponible' || t.estado.toLowerCase() === 'apartado'));
        setClientes(clientesData.filter(c => c.estado === 'Activo'));
      } catch (err: any) {
        setError(err.message || 'Error al cargar datos básicos');
      }
    };
    fetchData();
  }, []);

  // Update montoTotal automatically when terreno is selected
  useEffect(() => {
    if (selectedTerreno) {
      const t = terrenos.find(t => t.id === selectedTerreno);
      if (t) setMontoTotal(t.precio_lista);
    }
  }, [selectedTerreno, terrenos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!selectedTerreno || !selectedCliente || Number(montoTotal) <= 0) {
      setError('Por favor completa los campos requeridos.');
      return;
    }

    setLoading(true);
    try {
      const input: PlanPagoInput = {
        terreno_id: selectedTerreno,
        cliente_id: selectedCliente,
        monto_total: Number(montoTotal),
        enganche: Number(enganche),
        plazos: Number(plazos),
        tasa_interes: 0,
        fecha_inicio: new Date(fechaInicio).toISOString(),
        moneda: moneda,
      };
      await api.planesPago.create(input);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al crear la venta');
    } finally {
      setLoading(false);
    }
  };

  const montoFinanciar = Number(montoTotal) - Number(enganche);
  const mensualidad = Number(plazos) > 0 ? montoFinanciar / Number(plazos) : 0;

  return (
    <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <h2 className="text-lg font-bold text-neutral-900">Registrar Nueva Venta</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 transition-colors p-1 hover:bg-neutral-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3 border border-red-100">
              <AlertCircle size={20} className="shrink-0 mt-0.5 text-red-500" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form id="new-sale-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">Terreno / Lote</label>
                <select
                  value={selectedTerreno}
                  onChange={(e) => setSelectedTerreno(e.target.value)}
                  required
                  className="w-full bg-white border border-neutral-300 text-neutral-900 text-sm rounded-xl focus:ring-orange-500 focus:border-orange-500 block p-2.5"
                >
                  <option value="">Selecciona un terreno</option>
                  {terrenos.map(t => (
                    <option key={t.id} value={t.id}>{t.clave} - {t.nombre} (${t.precio_lista})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">Cliente</label>
                <select
                  value={selectedCliente}
                  onChange={(e) => setSelectedCliente(e.target.value)}
                  required
                  className="w-full bg-white border border-neutral-300 text-neutral-900 text-sm rounded-xl focus:ring-orange-500 focus:border-orange-500 block p-2.5"
                >
                  <option value="">Selecciona un cliente</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre_completo}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-4">
              <h3 className="font-semibold text-neutral-900 mb-2">Condiciones Financieras</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700">Monto Total de Venta</label>
                  <input
                    type="number"
                    value={montoTotal}
                    onChange={(e) => setMontoTotal(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    min="0"
                    className="w-full bg-white border border-neutral-300 text-neutral-900 text-sm rounded-xl focus:ring-orange-500 focus:border-orange-500 block p-2.5"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700">Moneda</label>
                  <select
                    value={moneda}
                    onChange={(e) => setMoneda(e.target.value)}
                    required
                    className="w-full bg-white border border-neutral-300 text-neutral-900 text-sm rounded-xl focus:ring-orange-500 focus:border-orange-500 block p-2.5"
                  >
                    <option value="MXN">Pesos (MXN)</option>
                    <option value="USD">Dólares (USD)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700">Enganche Recibido</label>
                  <input
                    type="number"
                    value={enganche}
                    onChange={(e) => setEnganche(e.target.value === '' ? '' : Number(e.target.value))}
                    min="0"
                    className="w-full bg-white border border-neutral-300 text-neutral-900 text-sm rounded-xl focus:ring-orange-500 focus:border-orange-500 block p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700">Plazos (Meses)</label>
                  <input
                    type="number"
                    value={plazos}
                    disabled
                    readOnly
                    className="w-full bg-neutral-100 border border-neutral-200 text-neutral-500 text-sm rounded-xl block p-2.5 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700">Fecha de Inicio</label>
                  <input
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    required
                    className="w-full bg-white border border-neutral-300 text-neutral-900 text-sm rounded-xl focus:ring-orange-500 focus:border-orange-500 block p-2.5"
                  />
                </div>
              </div>
            </div>

            {selectedTerreno && Number(montoTotal) > 0 && (
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-orange-600/70">Monto a Financiar</p>
                  <p className="text-sm font-bold text-orange-900">${montoFinanciar.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-orange-600/70">Total a Pagar</p>
                  <p className="text-sm font-bold text-orange-900">${montoFinanciar.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-orange-600/70">Mensualidad</p>
                  <p className="text-base font-black text-orange-600">${mensualidad.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-end gap-3 bg-neutral-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="new-sale-form"
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:from-orange-700 hover:to-orange-600 transition-all shadow-sm disabled:opacity-70"
          >
            {loading ? (
              <span>Generando...</span>
            ) : (
              <>
                <Save size={18} />
                <span>Generar Venta y Plan de Pagos</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewSaleModal;
