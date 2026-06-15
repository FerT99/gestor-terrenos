import { useState, useEffect } from 'react';
import { CheckCircle2, Wallet, AlertTriangle, Loader2 } from 'lucide-react';
import SummaryCard from './SummaryCard';
import RevenueChart from './RevenueChart';
import AuditLogViewer from './AuditLogViewer';
import MonthlyPaymentsModal from './MonthlyPaymentsModal';
import { api, type Abono, type Terreno, type ClienteMoroso, type Egreso } from '../lib/api';

interface DashboardProps {
  onViewMorosos?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onViewMorosos }) => {
  const [abonos, setAbonos] = useState<Abono[]>([]);
  const [terrenos, setTerrenos] = useState<Terreno[]>([]);
  const [morosos, setMorosos] = useState<ClienteMoroso[]>([]);
  const [egresos, setEgresos] = useState<Egreso[]>([]);
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [selectedMonthDetails, setSelectedMonthDetails] = useState<{month: number, year: number} | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const parcelaId = localStorage.getItem('selected_parcela') || '';
        const [abonosData, terrenosData, morososData, egresosData] = await Promise.all([
          api.abonos.getAll(),
          api.terrenos.getAll(),
          api.reportes.getMorosos(),
          parcelaId ? api.egresos.getAll(parcelaId) : Promise.resolve([]),
        ]);
        setAbonos(abonosData || []);
        setTerrenos(terrenosData || []);
        setMorosos(morososData || []);
        setEgresos(egresosData || []);
      } catch (err) {
        console.error('Error fetching dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();

    fetch('https://api.exchangerate-api.com/v4/latest/USD')
      .then(res => res.json())
      .then(data => {
        if (data && data.rates && data.rates.MXN) {
          setExchangeRate(data.rates.MXN);
        }
      })
      .catch(err => console.error("Error fetching exchange rate:", err));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-neutral-400 min-h-[calc(100vh-4rem)]">
        <Loader2 size={40} className="animate-spin text-orange-500 mb-4" />
        <p className="font-medium text-lg">Cargando métricas...</p>
      </div>
    );
  }

  // Calculate Lotes Vendidos
  const lotesVendidos = terrenos.filter(t => t.estado.toLowerCase() === 'vendido').length;

  // Calculate Ingresos of current month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  let mxnSum = 0;
  let efectivoSum = 0;
  let transferenciaSum = 0;

  abonos.forEach(abono => {
    const date = new Date(abono.fecha_pago);
    if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
      let mxnValue = abono.monto_pagado;
      if (abono.moneda === 'USD') {
        const rate = abono.tipo_cambio || exchangeRate || 18;
        mxnValue = abono.monto_pagado * rate;
      }
      mxnSum += mxnValue;

      if (abono.metodo_pago?.toLowerCase() === 'efectivo') {
        efectivoSum += mxnValue;
      } else if (abono.metodo_pago?.toLowerCase() === 'transferencia') {
        transferenciaSum += mxnValue;
      }
    }
  });

  let egresosMes = 0;
  egresos.forEach(egreso => {
    // Si la fecha viene en formato YYYY-MM-DD
    const date = new Date(egreso.fecha);
    // Para asegurarnos de que la conversión no falle por zonas horarias y nos dé el mes correcto
    // podemos usar substring o los métodos normales.
    // Usamos métodos normales pero asegurando que es válido:
    if (!isNaN(date.getTime()) && date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
      egresosMes += Number(egreso.monto) || 0;
    }
  });

  const utilidadNetaMes = mxnSum - egresosMes;

  // Calculate Adeudos Vencidos
  const overdueCount = morosos.length;

  return (
    <main className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-neutral-900">Panel Inicial</h2>
        <p className="text-neutral-500 mt-1">Métricas de rendimiento y alertas del periodo actual.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SummaryCard 
          title="Lotes Vendidos" 
          value={lotesVendidos} 
          subtitle="Total acumulado" 
          icon={<CheckCircle2 size={18} />} 
          variant="green"
        />
        <SummaryCard 
          title="Ingresos Brutos (Mes)" 
          value={`$${mxnSum.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`} 
          subtitle={exchangeRate ? `≈ USD: $${(mxnSum / exchangeRate).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '...'} 
          icon={<Wallet size={18} />} 
        />
        <SummaryCard 
          title="Utilidad Neta (Mes)" 
          value={`$${utilidadNetaMes.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`} 
          subtitle={exchangeRate ? `≈ USD: $${(utilidadNetaMes / exchangeRate).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '...'} 
          icon={<Wallet size={18} />} 
          variant="green"
        />
        <SummaryCard 
          title="Adeudos Vencidos" 
          value={overdueCount} 
          subtitle="Pagos atrasados" 
          icon={<AlertTriangle size={18} />} 
          isAlert={overdueCount > 0} 
          onClick={onViewMorosos}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-sm text-neutral-500 font-medium mb-1">Ingresos en Efectivo (Mes)</p>
              <h3 className="text-2xl font-black text-neutral-900">${efectivoSum.toLocaleString('es-MX', {minimumFractionDigits: 2})}</h3>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Equiv. USD</p>
            <p className="text-sm font-medium text-neutral-600">{exchangeRate ? `≈ $${(efectivoSum / exchangeRate).toLocaleString('en-US', {minimumFractionDigits: 2})}` : '...'}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-sm text-neutral-500 font-medium mb-1">Ingresos por Transferencia</p>
              <h3 className="text-2xl font-black text-neutral-900">${transferenciaSum.toLocaleString('es-MX', {minimumFractionDigits: 2})}</h3>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Equiv. USD</p>
            <p className="text-sm font-medium text-neutral-600">{exchangeRate ? `≈ $${(transferenciaSum / exchangeRate).toLocaleString('en-US', {minimumFractionDigits: 2})}` : '...'}</p>
          </div>
        </div>
      </div>

      <div className="w-full">
        <RevenueChart 
          abonos={abonos} 
          onMonthClick={(month, year) => setSelectedMonthDetails({ month, year })}
        />
      </div>

      <AuditLogViewer />

      <MonthlyPaymentsModal 
        isOpen={selectedMonthDetails !== null}
        onClose={() => setSelectedMonthDetails(null)}
        month={selectedMonthDetails?.month ?? 0}
        year={selectedMonthDetails?.year ?? new Date().getFullYear()}
        abonos={abonos}
      />
    </main>
  );
};

export default Dashboard;
