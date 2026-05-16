import React from 'react';
import './SummaryCard.css';

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
    <div className={`summary-card card ${isAlert ? 'alert' : ''}`}>
      <div className="summary-header">
        <h3 className="summary-title">{title}</h3>
        <div className={`summary-icon-wrapper ${isAlert ? 'alert-icon' : ''}`}>
          {icon}
        </div>
      </div>
      
      <div className="summary-body">
        <div className={`summary-value ${isAlert ? 'alert-text' : ''}`}>{value}</div>
        <div className="summary-footer">
          {trend && (
            <span className={`trend ${trendUp ? 'trend-up' : 'trend-down'}`}>
              {trendUp ? '↑' : '↓'} {trend}
            </span>
          )}
          <span className={`subtitle ${isAlert ? 'alert-subtitle' : ''}`}>{subtitle}</span>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
