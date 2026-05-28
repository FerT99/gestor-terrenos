import React from 'react';

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  isAlert?: boolean;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ 
  title, value, subtitle, icon, trend, trendUp, isAlert 
}) => {
  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border ${isAlert ? 'border-red-200 bg-red-50' : 'border-neutral-200'}`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isAlert ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${trendUp ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
            {trendUp ? '+' : '-'}{trend}
          </span>
        )}
      </div>
      
      <div className="flex flex-col">
        <span className={`text-sm font-medium mb-1 ${isAlert ? 'text-red-600/80' : 'text-neutral-500'}`}>{title}</span>
        <span className={`text-2xl font-bold ${isAlert ? 'text-red-600' : 'text-neutral-900'}`}>{value}</span>
        <span className={`text-xs mt-2 ${isAlert ? 'text-red-500 font-medium' : 'text-neutral-400'}`}>{subtitle}</span>
      </div>
    </div>
  );
};

export default SummaryCard;
