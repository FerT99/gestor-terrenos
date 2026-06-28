import { useState, useEffect } from 'react';
import { Wallet, AlertTriangle, Loader2 } from 'lucide-react';
import RevenueChart from './RevenueChart';
import AuditLogViewer from './AuditLogViewer';
import MonthlyPaymentsModal from './MonthlyPaymentsModal';
import { api, type Abono, type ClienteMoroso, type Egreso, type Terreno } from '../lib/api';
import { supabase } from '../lib/supabase';

interface DashboardProps {
  onViewMorosos?: () => void;
  onViewTerreno?: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onViewMorosos, onViewTerreno }) => {
  const [abonos, setAbonos] = useState<Abono[]>([]);

  const [morosos, setMorosos] = useState<ClienteMoroso[]>([]);
  const [egresos, setEgresos] = useState<Egreso[]>([]);
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [selectedMonthDetails, setSelectedMonthDetails] = useState<{month: number, year: number} | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        
        const parcelaId = localStorage.getItem('selected_parcela') || '';
        const userRole = (localStorage.getItem('user_role') || '').toLowerCase();
        
        const [abonosData, morososData, egresosData, terrenosData] = await Promise.all([
          api.abonos.getAll(),
          api.reportes.getMorosos(),
          parcelaId ? api.egresos.getAll(parcelaId) : Promise.resolve([]),
          api.terrenos.getAll(),
        ]);

        let filteredAbonos = abonosData || [];
        let filteredMorosos = morososData || [];
        let filteredEgresos = egresosData || [];

        // Si no es administrador, filtramos para que vea solo lo suyo
        if (userRole !== 'admin' && userId) {
          const myTerrenoIds = new Set(
            (terrenosData || []).filter(t => t.vendedor_id === userId).map(t => t.id)
          );
          
          filteredAbonos = filteredAbonos.filter(a => a.terreno_id && myTerrenoIds.has(a.terreno_id));
          filteredMorosos = filteredMorosos.filter(m => m.terreno_id && myTerrenoIds.has(m.terreno_id));
          filteredEgresos = []; // Vendedores no ven egresos globales
        }

        setAbonos(filteredAbonos);
        setMorosos(filteredMorosos);
        setEgresos(filteredEgresos);
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


  // Calculate Ingresos of current month and all time
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  let mxnSum = 0;
  let efectivoSum = 0;
  let transferenciaSum = 0;
  let ingresosTotalesHistorico = 0;

  abonos.forEach(abono => {
    let mxnValue = abono.monto_pagado;
    if (abono.moneda === 'USD') {
      const rate = abono.tipo_cambio || exchangeRate || 18;
      mxnValue = abono.monto_pagado * rate;
    }

    ingresosTotalesHistorico += mxnValue;

    // Evitar problemas de zona horaria extrayendo el año y mes directamente del string YYYY-MM-DD
    const [yearStr, monthStr] = abono.fecha_pago.split('T')[0].split('-');
    const abonoYear = parseInt(yearStr, 10);
    const abonoMonth = parseInt(monthStr, 10) - 1; // 0-indexed para que coincida con getMonth()

    if (abonoMonth === currentMonth && abonoYear === currentYear) {
      mxnSum += mxnValue;

      const metodo = abono.metodo_pago?.trim().toLowerCase();
      if (metodo === 'efectivo') {
        efectivoSum += mxnValue;
      } else if (metodo === 'transferencia') {
        transferenciaSum += mxnValue;
      }
    }
  });

  let egresosMes = 0;
  egresos.forEach(egreso => {
    const [yearStr, monthStr] = egreso.fecha.split('T')[0].split('-');
    if (yearStr && monthStr) {
      const egresoYear = parseInt(yearStr, 10);
      const egresoMonth = parseInt(monthStr, 10) - 1;
      
      if (egresoMonth === currentMonth && egresoYear === currentYear) {
        egresosMes += Number(egreso.monto) || 0;
      }
    }
  });

  const utilidadNetaMes = mxnSum - egresosMes;
  const comisionesHistorico = ingresosTotalesHistorico * 0.0675;
  const ingresosNetosHistorico = ingresosTotalesHistorico - comisionesHistorico;

  // Calculate Adeudos Vencidos
  const overdueCount = morosos.length;

  return (
    <main className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-neutral-900">Panel Inicial</h2>
        <p className="text-neutral-500 mt-1">Resumen del rendimiento y alertas de este mes.</p>
      </div>



      {/* 2. Métrica hero grande y centrada */}
      <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-neutral-100 flex flex-col items-center justify-center text-center">
        <span className="text-neutral-400 font-bold mb-3 uppercase tracking-[0.2em] text-xs md:text-sm">Ingresos del Mes</span>
        <h3 className="text-6xl md:text-8xl font-black text-neutral-900 tracking-tighter">
          ${mxnSum.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
        </h3>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {exchangeRate ? (
            <span className="text-neutral-500 font-medium bg-neutral-50 border border-neutral-100 px-4 py-2 rounded-full text-sm">
              ≈ USD ${(mxnSum / exchangeRate).toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </span>
          ) : null}
          <span className="text-emerald-700 font-medium bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-full text-sm">
            Utilidad Neta: ${utilidadNetaMes.toLocaleString('es-MX', {minimumFractionDigits: 0})}
          </span>
        </div>
      </div>

      {/* 3. Fila de KPIs secundarios compacta */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <Wallet size={16} className="text-neutral-400" />
            <span className="text-neutral-500 text-xs font-bold uppercase tracking-wider">Total Histórico</span>
          </div>
          <span className="text-2xl md:text-3xl font-black text-neutral-800">${ingresosTotalesHistorico.toLocaleString('es-MX', {minimumFractionDigits: 0})}</span>
          <span className="text-xs text-neutral-500 font-medium mt-1">Neto: ${ingresosNetosHistorico.toLocaleString('es-MX', {minimumFractionDigits: 0})}</span>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <Wallet size={16} className="text-neutral-400" />
            <span className="text-neutral-500 text-xs font-bold uppercase tracking-wider">Efectivo (Mes)</span>
          </div>
          <span className="text-3xl font-black text-neutral-800">${efectivoSum.toLocaleString('es-MX', {minimumFractionDigits: 0})}</span>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <Wallet size={16} className="text-neutral-400" />
            <span className="text-neutral-500 text-xs font-bold uppercase tracking-wider">Transferencias (Mes)</span>
          </div>
          <span className="text-3xl font-black text-neutral-800">${transferenciaSum.toLocaleString('es-MX', {minimumFractionDigits: 0})}</span>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <Wallet size={16} className="text-neutral-400" />
            <span className="text-neutral-500 text-xs font-bold uppercase tracking-wider">Egresos (Mes)</span>
          </div>
          <span className="text-3xl font-black text-neutral-800">${egresosMes.toLocaleString('es-MX', {minimumFractionDigits: 0})}</span>
        </div>
      </div>

      {/* Alerta movida abajo con colores más suaves */}
      {overdueCount > 0 && (
        <div 
          onClick={onViewMorosos}
          className="bg-red-50 hover:bg-red-100 border border-red-200 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 text-red-900 rounded-2xl p-4 flex items-center justify-between shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="bg-red-100 p-2.5 rounded-full flex-shrink-0">
              <AlertTriangle size={24} className="text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg md:text-xl">Atención: {overdueCount} adeudos vencidos</h3>
              <p className="text-red-700 text-sm md:text-base mt-0.5">La acción más importante de hoy es revisar y gestionar estas cuentas atrasadas.</p>
            </div>
          </div>
          <div className="hidden md:flex bg-red-100 text-red-700 p-2 rounded-full flex-shrink-0 border border-red-200">
            <span className="text-sm font-bold px-2">Revisar</span>
          </div>
        </div>
      )}

      {/* 4. Gráfica de Ingresos Mensuales */}
      <div className="w-full pt-4">
        <RevenueChart 
          abonos={abonos} 
          onMonthClick={(month, year) => setSelectedMonthDetails({ month, year })}
        />
      </div>

      <div className="pt-4">
        <AuditLogViewer />
      </div>

      <MonthlyPaymentsModal 
        isOpen={selectedMonthDetails !== null}
        onClose={() => setSelectedMonthDetails(null)}
        month={selectedMonthDetails?.month ?? 0}
        year={selectedMonthDetails?.year ?? new Date().getFullYear()}
        abonos={abonos}
        onNavigateToTerreno={onViewTerreno}
      />
    </main>
  );
};

export default Dashboard;
