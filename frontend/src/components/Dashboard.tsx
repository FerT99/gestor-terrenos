
import { CheckCircle2, Wallet, AlertTriangle } from 'lucide-react';
import SummaryCard from './SummaryCard';
import RevenueChart from './RevenueChart';
import OverdueClients from './OverdueClients';
import AuditLogViewer from './AuditLogViewer';

const Dashboard = () => {
  return (
    <main className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-neutral-900">Panel Inicial</h2>
        <p className="text-neutral-500 mt-1">Métricas de rendimiento y alertas del periodo actual.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard 
          title="Lotes Vendidos" 
          value="0" 
          subtitle="vs mes anterior" 
          icon={<CheckCircle2 size={18} />} 
          trend="0%" 
          trendUp={true} 
        />
        <SummaryCard 
          title="Cobros del Mes (MXN)" 
          value="$0" 
          subtitle="USD: $0" 
          icon={<Wallet size={18} />} 
          trend="0%" 
          trendUp={true} 
        />
        <SummaryCard 
          title="Adeudos Vencidos" 
          value="0" 
          subtitle="! Acción requerida" 
          icon={<AlertTriangle size={18} />} 
          isAlert={true} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div className="lg:col-span-1">
          <OverdueClients />
        </div>
      </div>

      <AuditLogViewer />
    </main>
  );
};

export default Dashboard;
