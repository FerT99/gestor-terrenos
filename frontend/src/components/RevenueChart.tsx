
import React, { useState } from 'react';
import { type Abono } from '../lib/api';

interface RevenueChartProps {
  abonos: Abono[];
  onMonthClick?: (monthIndex: number, year: number) => void;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ abonos, onMonthClick }) => {
  const [selectedYear, setSelectedYear] = useState(2026);

  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  // Filter abonos by selected year and group by month
  const monthlyValues = Array(12).fill(0);
  
  (abonos || []).forEach(abono => {
    const date = new Date(abono.fecha_pago);
    if (date.getFullYear() === selectedYear) {
      const monthIndex = date.getMonth(); // 0-11
      monthlyValues[monthIndex] += abono.monto_pagado;
    }
  });

  const maxValue = Math.max(...monthlyValues, 1);
  const currentMonthIndex = new Date().getMonth();

  const data = months.map((month, index) => {
    const val = monthlyValues[index];
    return {
      month,
      value: val,
      heightPct: maxValue > 0 ? (val / maxValue) * 100 : 0,
      active: index === currentMonthIndex && selectedYear === new Date().getFullYear(),
    };
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg font-bold text-neutral-900">Ingresos Mensuales</h3>
        <select 
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="bg-neutral-50 border border-neutral-200 text-neutral-700 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block p-2 outline-none cursor-pointer"
        >
          <option value={2026}>2026</option>
          <option value={2025}>2025</option>
          <option value={2024}>2024</option>
        </select>
      </div>
      
      <div className="flex items-end justify-between pt-4 h-64 gap-2 w-full">
        {data.map((item, index) => (
          <div key={item.month} className="flex flex-col items-center gap-3 flex-1 justify-end group relative">
            {/* Tooltip on hover */}
            <div className="absolute bottom-full mb-2 bg-neutral-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 font-bold shadow-md">
              ${item.value.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
            </div>
            <div 
              className={`w-full relative flex items-end justify-center h-48 bg-neutral-50/50 rounded-t-lg overflow-hidden transition-colors ${onMonthClick ? 'cursor-pointer group-hover:bg-neutral-100 hover:ring-2 hover:ring-orange-300' : 'group-hover:bg-neutral-100'}`}
              onClick={() => onMonthClick && onMonthClick(index, selectedYear)}
            >
              <div 
                className={`w-full rounded-t-lg transition-all duration-500 ${item.active ? 'bg-gradient-to-t from-orange-500 to-orange-400 shadow-md shadow-orange-200' : 'bg-neutral-200 group-hover:bg-neutral-300'}`} 
                style={{ height: `${Math.max(item.heightPct, 4)}%` }}
              ></div>
            </div>
            <span className={`text-xs font-medium ${item.active ? 'text-orange-600' : 'text-neutral-500'}`}>{item.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RevenueChart;
