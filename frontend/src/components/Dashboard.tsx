import { useState, useEffect } from 'react';
import { CheckCircle2, Wallet, AlertTriangle, Loader2 } from 'lucide-react';
import SummaryCard from './SummaryCard';
import RevenueChart from './RevenueChart';
import AuditLogViewer from './AuditLogViewer';
import { api, type Abono, type Terreno, type ClienteMoroso } from '../lib/api';

const Dashboard = () => {
  const [abonos, setAbonos] = useState<Abono[]>([]);
  const [terrenos, setTerrenos] = useState<Terreno[]>([]);
  const [morosos, setMorosos] = useState<ClienteMoroso[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const [abonosData, terrenosData, morososData] = await Promise.all([
          api.abonos.getAll(),
          api.terrenos.getAll(),
          api.reportes.getMorosos(),
        ]);
        setAbonos(abonosData || []);
        setTerrenos(terrenosData || []);
        setMorosos(morososData || []);
      } catch (err) {
        console.error('Error fetching dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
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
  const lotesVendidos = terrenos.filter(t => t.estado === 'vendido').length;

  // Calculate Ingresos of current month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  let mxnSum = 0;
  let usdSum = 0;

  abonos.forEach(abono => {
    const date = new Date(abono.fecha_pago);
    if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
      if (abono.moneda === 'USD') {
        usdSum += abono.monto_pagado;
      } else {
        mxnSum += abono.monto_pagado;
      }
    }
  });

  // Calculate Adeudos Vencidos
  const overdueCount = morosos.length;
  const totalMora = morosos.reduce((acc, curr) => acc + curr.monto_esperado, 0);

  return (
    <main className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-neutral-900">Panel Inicial</h2>
        <p className="text-neutral-500 mt-1">Métricas de rendimiento y alertas del periodo actual.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard 
          title="Lotes Vendidos" 
          value={lotesVendidos} 
          subtitle="Total acumulado" 
          icon={<CheckCircle2 size={18} />} 
          variant="green"
        />
        <SummaryCard 
          title="Ingresos (MXN)" 
          value={`$${mxnSum.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`} 
          subtitle={`USD: $${usdSum.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`} 
          icon={<Wallet size={18} />} 
        />
        <SummaryCard 
          title="Adeudos Vencidos" 
          value={overdueCount} 
          subtitle={`$${totalMora.toLocaleString('es-MX', { minimumFractionDigits: 2 })} en mora`} 
          icon={<AlertTriangle size={18} />} 
          isAlert={overdueCount > 0} 
        />
      </div>

      <div className="w-full">
        <RevenueChart abonos={abonos} />
      </div>

      <AuditLogViewer />
    </main>
  );
};

export default Dashboard;
