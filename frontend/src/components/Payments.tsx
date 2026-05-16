import React from 'react';
import { 
  PlusCircle, 
  Wallet, 
  DollarSign, 
  AlertTriangle, 
  Calendar, 
  Filter, 
  Landmark,
  Banknote,
  CreditCard as CreditCardIcon
} from 'lucide-react';
import './Payments.css';

const recentPayments = [
  { id: 1, client: 'Alejandro Ruiz', lot: 'Lote SL 045', amount: '$15,000 MXN', date: '24 Oct, 2023', method: 'Transferencia', methodIcon: <Landmark size={14}/>, status: 'Verificado' },
  { id: 2, client: 'Maria Fernandez', lot: 'Lote SL 112', amount: '$800 USD', date: '23 Oct, 2023', method: 'Efectivo', methodIcon: <Banknote size={14}/>, status: 'Pendiente' },
  { id: 3, client: 'Carlos Gomez', lot: 'Lote AZ 004', amount: '$12,500 MXN', date: '22 Oct, 2023', method: 'Transferencia', methodIcon: <Landmark size={14}/>, status: 'Verificado' },
  { id: 4, client: 'Sofia Reyes', lot: 'Lote SL 088', amount: '$20,000 MXN', date: '21 Oct, 2023', method: 'Tarjeta', methodIcon: <CreditCardIcon size={14}/>, status: 'Verificado' },
];

const overdueDebts = [
  { id: 1, client: 'Roberto Sanchez', lot: 'Lote SL 012', days: 45, type: 'Capital + Penalización', amount: '$18,400 MXN', action: 'Contactar' },
  { id: 2, client: 'Empresa del Norte SA', lot: 'Lote IND 05', days: 32, type: 'Capital + Penalización', amount: '$45,000 MXN', action: 'Contactar' },
  { id: 3, client: 'Elena Vazquez', lot: 'Lote SL 099', days: 12, type: 'Monto Pendiente', amount: '$8,500 MXN', action: 'Recordatorio' },
];

const Payments = () => {
  return (
    <main className="payments-container">
      <div className="payments-header">
        <div>
          <h2 className="payments-title">Gestión de Pagos</h2>
          <p className="payments-subtitle">Administración de abonos, moratoria y estado de cuenta de clientes.</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <PlusCircle size={18} />
          <span>Registrar Abono</span>
        </button>
      </div>

      <div className="payments-summary">
        <div className="summary-card card">
          <div className="summary-header">
            <div className="summary-icon-wrapper">
              <Wallet size={16} />
            </div>
            <span className="trend-badge">+12% vs mes anterior</span>
          </div>
          <div className="summary-body">
            <span className="summary-label">Cobros del Mes (MXN)</span>
            <span className="summary-value">$1,450,000</span>
          </div>
        </div>
        
        <div className="summary-card card">
          <div className="summary-header">
            <div className="summary-icon-wrapper">
              <DollarSign size={16} />
            </div>
            <span className="trend-badge">+5% vs mes anterior</span>
          </div>
          <div className="summary-body">
            <span className="summary-label">Cobros del Mes (USD)</span>
            <span className="summary-value">$85,400</span>
          </div>
        </div>

        <div className="summary-card card alert">
          <div className="summary-header">
            <div className="summary-icon-wrapper alert-icon">
              <AlertTriangle size={16} />
            </div>
            <span className="trend-badge alert-badge">Incluye 15% penalización</span>
          </div>
          <div className="summary-body">
            <span className="summary-label">Total en Mora</span>
            <span className="summary-value alert-text">$345,000 MXN</span>
          </div>
        </div>
      </div>

      <div className="payments-content">
        <div className="payments-main">
          <div className="filters-row">
            <div className="filter-dropdown">
              <Calendar size={14} className="filter-icon"/>
              <span>Este Mes</span>
            </div>
            <div className="filter-dropdown">
              <DollarSign size={14} className="filter-icon"/>
              <span>Todas las Monedas</span>
            </div>
            <div className="filter-dropdown">
              <Filter size={14} className="filter-icon"/>
              <span>Todos los Estados</span>
            </div>
          </div>

          <div className="card table-wrapper">
            <div className="table-header">
              <h3 className="section-title">Abonos Recientes</h3>
              <a href="#" className="link-terracotta">Ver Todos</a>
            </div>
            <table className="payments-table">
              <thead>
                <tr>
                  <th>CLIENTE / LOTE</th>
                  <th>MONTO</th>
                  <th>FECHA</th>
                  <th>MÉTODO</th>
                  <th>ESTADO</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map(payment => (
                  <tr key={payment.id}>
                    <td>
                      <div className="client-lote-info">
                        <span className="client-name">{payment.client}</span>
                        <span className="lote-name">{payment.lot}</span>
                      </div>
                    </td>
                    <td className="font-medium text-primary">{payment.amount}</td>
                    <td>{payment.date}</td>
                    <td>
                      <div className="method-info">
                        {payment.methodIcon}
                        <span>{payment.method}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill pill-${payment.status.toLowerCase()}`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="table-footer">
              <span className="showing-text">Mostrando 1 a 4 de 42 abonos</span>
              <div className="pagination">
                <button className="page-btn">&lt;</button>
                <button className="page-btn">&gt;</button>
              </div>
            </div>
          </div>
        </div>

        <div className="payments-sidebar">
          <div className="card overdue-card">
            <div className="overdue-header">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle size={18} className="text-alert" />
                <h3 className="section-title mb-0">Adeudos Vencidos</h3>
              </div>
              <p className="overdue-subtitle">Atención requerida para clientes en mora.</p>
            </div>
            
            <div className="overdue-list">
              {overdueDebts.map(debt => (
                <div key={debt.id} className="overdue-item">
                  <div className="overdue-item-header">
                    <div className="overdue-client-info">
                      <span className="client-name">{debt.client}</span>
                      <span className="lote-name">{debt.lot}</span>
                    </div>
                    <span className="days-badge">{debt.days} dias</span>
                  </div>
                  <div className="overdue-item-body">
                    <div className="debt-details">
                      <span className="debt-type">{debt.type}</span>
                      <span className="debt-amount">{debt.amount}</span>
                    </div>
                    <a href="#" className="link-action">{debt.action}</a>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="btn-secondary w-full mt-4">Ver Reporte Completo de Mora</button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Payments;
