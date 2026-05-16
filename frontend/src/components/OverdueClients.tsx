import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import './OverdueClients.css';

const OverdueClients = () => {
  const clients = [
    { id: 1, name: 'Alejandro Ruiz', days: 90, detail: 'Lote 45 - Fase 2', amount: '$45,000', initials: 'AR' },
    { id: 2, name: 'Maria Gomez', days: 60, detail: 'Lote 12 - Fase 1', amount: '$22,500', initials: 'MG' },
    { id: 3, name: 'Carlos Fuentes', days: 30, detail: 'Lote 88 - Fase 3', amount: '$15,000', initials: 'CF' },
  ];

  return (
    <div className="card overdue-clients">
      <div className="overdue-header">
        <h3 className="overdue-title">Clientes en Mora</h3>
        <button className="icon-btn">
          <MoreHorizontal size={20} />
        </button>
      </div>
      
      <div className="clients-list">
        {clients.map(client => (
          <div key={client.id} className="client-item">
            <div className="client-avatar">
              {client.initials}
            </div>
            <div className="client-info">
              <div className="client-top">
                <span className="client-name">{client.name}</span>
                <span className="client-days">{client.days} <br/> Dias</span>
              </div>
              <div className="client-bottom">
                <span className="client-detail">{client.detail}</span>
                <span className="client-amount">{client.amount}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <button className="btn-secondary w-full">Ver Todos</button>
    </div>
  );
};

export default OverdueClients;
