import React from 'react';
import { Search, Filter, ArrowUpDown, UserPlus, FolderOpen, Mail, Phone } from 'lucide-react';
import './Clients.css';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  initials: string | null;
  assignedLots: number;
  status: 'Active' | 'Pending';
}

const mockClients: Client[] = [
  {
    id: '1',
    name: 'Elena Rodriguez',
    email: 'elena.r@example.com',
    phone: '+52 55 1234 5678',
    avatar: 'https://i.pravatar.cc/150?img=5',
    initials: null,
    assignedLots: 3,
    status: 'Activo'
  },
  {
    id: '2',
    name: 'Mateo Garcia',
    email: 'm.garcia@invest.co',
    phone: '+52 81 9876 5432',
    avatar: null,
    initials: 'MG',
    assignedLots: 1,
    status: 'Pendiente'
  },
  {
    id: '3',
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@ventures.mx',
    phone: '+52 33 4567 8901',
    avatar: 'https://i.pravatar.cc/150?img=11',
    initials: null,
    assignedLots: 12,
    status: 'Activo'
  }
];

const Clients = () => {
  return (
    <main className="clients-container">
      <div className="clients-header">
        <div>
          <h2 className="clients-title">Portafolio de Clientes</h2>
          <p className="clients-subtitle">Administra relaciones y propiedades asignadas.</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <UserPlus size={18} />
          <span>Registrar Cliente</span>
        </button>
      </div>

      <div className="clients-toolbar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Buscar clientes por nombre, ID o email..." 
            className="search-input"
          />
        </div>
        <div className="toolbar-actions">
          <button className="btn-secondary flex items-center gap-2">
            <Filter size={16} />
            <span>Filtros</span>
          </button>
          <button className="btn-secondary flex items-center gap-2">
            <ArrowUpDown size={16} />
            <span>Ordenar</span>
          </button>
        </div>
      </div>

      <div className="clients-list">
        {mockClients.map(client => (
          <div key={client.id} className="client-card">
            <div className="client-main-info">
              {client.avatar ? (
                <img src={client.avatar} alt={client.name} className="client-avatar" />
              ) : (
                <div className="client-avatar-placeholder">{client.initials}</div>
              )}
              
              <div className="client-details">
                <h3 className="client-name">{client.name}</h3>
                <div className="client-contact">
                  <span className="contact-item">
                    <Mail size={12} /> {client.email}
                  </span>
                  <span className="contact-item">
                    <Phone size={12} /> {client.phone}
                  </span>
                </div>
              </div>
            </div>

            <div className="client-stats">
              <div className="stat-group">
                <span className="stat-label">LOTES ASIGNADOS</span>
                <span className="stat-value">{client.assignedLots}</span>
              </div>
              
              <div className="stat-group">
                <span className="stat-label">ESTADO</span>
                <span className={`status-badge status-${client.status.toLowerCase()}`}>
                  <span className="status-dot"></span>
                  {client.status}
                </span>
              </div>
            </div>

            <div className="client-actions">
              <button className="btn-secondary flex items-center gap-2 text-accent">
                <FolderOpen size={16} />
                <span>Expediente</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="clients-footer">
        <span className="showing-text">Mostrando 1 a 3 de 42 clientes</span>
        <div className="pagination">
          <button className="page-btn">&lt;</button>
          <button className="page-btn">&gt;</button>
        </div>
      </div>
    </main>
  );
};

export default Clients;
