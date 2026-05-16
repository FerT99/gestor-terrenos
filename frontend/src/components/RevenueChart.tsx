import React from 'react';
import './RevenueChart.css';

const RevenueChart = () => {
  const data = [
    { month: 'Ene', value: 30 },
    { month: 'Feb', value: 45 },
    { month: 'Mar', value: 65 },
    { month: 'Abr', value: 60 },
    { month: 'May', value: 80 },
    { month: 'Jun', value: 100, active: true },
  ];

  return (
    <div className="card revenue-chart">
      <div className="chart-header">
        <h3 className="chart-title">Ingresos Mensuales</h3>
        <select className="year-selector">
          <option>2023</option>
          <option>2022</option>
        </select>
      </div>
      
      <div className="chart-body">
        <div className="bars-container">
          {data.map((item) => (
            <div key={item.month} className="bar-wrapper">
              <div 
                className={`bar ${item.active ? 'active' : ''}`} 
                style={{ height: `${item.value}%` }}
              ></div>
              <span className={`month-label ${item.active ? 'active' : ''}`}>{item.month}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;
