import React from 'react';
import { CheckCircle2, Wallet, AlertTriangle } from 'lucide-react';
import SummaryCard from './SummaryCard';
import RevenueChart from './RevenueChart';
import OverdueClients from './OverdueClients';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <main className="dashboard">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Panel Inicial</h2>
        <p className="dashboard-subtitle">Métricas de rendimiento y alertas del periodo actual.</p>
      </div>

      <div className="summary-cards">
        <SummaryCard 
          title="Lotes Vendidos" 
          value="42" 
          subtitle="vs mes anterior" 
          icon={<CheckCircle2 size={16} />} 
          trend="12%" 
          trendUp={true} 
        />
        <SummaryCard 
          title="Cobros del Mes (MXN)" 
          value="$1.2M" 
          subtitle="USD: $68K" 
          icon={<Wallet size={16} />} 
          trend="5%" 
          trendUp={true} 
        />
        <SummaryCard 
          title="Adeudos Vencidos" 
          value="14" 
          subtitle="! Acción requerida" 
          icon={<AlertTriangle size={16} />} 
          isAlert={true} 
        />
      </div>

      <div className="dashboard-content">
        <RevenueChart />
        <OverdueClients />
      </div>
    </main>
  );
};

export default Dashboard;
