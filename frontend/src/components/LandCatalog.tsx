import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import './LandCatalog.css';

interface Land {
  id: string;
  clave: string;
  superficie: string;
  precio: string;
  propietario: string | null;
  propietarioInitials: string | null;
  estado: 'Disponible' | 'Apartado' | 'Vendido';
}

const mockData: Land[] = [
  { id: '1', clave: 'SL-045', superficie: '450.00', precio: '$1,250,000 MXN', propietario: null, propietarioInitials: null, estado: 'Disponible' },
  { id: '2', clave: 'SL-046', superficie: '620.50', precio: '$1,850,000 MXN', propietario: 'Mariana Valdez', propietarioInitials: 'MV', estado: 'Apartado' },
  { id: '3', clave: 'SL-047', superficie: '500.00', precio: '$1,400,000 MXN', propietario: 'Carlos Ruiz', propietarioInitials: 'CR', estado: 'Vendido' },
  { id: '4', clave: 'SL-048', superficie: '450.00', precio: '$1,250,000 MXN', propietario: null, propietarioInitials: null, estado: 'Disponible' },
  { id: '5', clave: 'SL-049', superficie: '1200.00', precio: '$3,100,000 MXN', propietario: null, propietarioInitials: null, estado: 'Disponible' },
];

const LandCatalog = () => {
  const [filter, setFilter] = useState('Todos');
  const filters = ['Todos', 'Disponible', 'Apartado', 'Vendido'];

  return (
    <main className="catalog-container">
      <div className="catalog-header">
        <div>
          <h2 className="catalog-title">Catálogo de Terrenos</h2>
          <p className="catalog-subtitle">Administra propiedades, disponibilidad y asignación de lotes en todo el portafolio de Loterra.</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <span>+</span> Nuevo Lote
        </button>
      </div>

      <div className="catalog-filters">
        <span className="filter-label">Estado:</span>
        <div className="filter-pills">
          {filters.map(f => (
            <button
              key={f}
              className={`pill ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="table-container card">
        <table className="catalog-table">
          <thead>
            <tr>
              <th>CLAVE</th>
              <th>SUPERFICIE (M²)</th>
              <th>PRECIO</th>
              <th>PROPIETARIO</th>
              <th>ESTADO</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {mockData.map((lot) => (
              <tr key={lot.id}>
                <td className="font-medium text-primary">{lot.clave}</td>
                <td>{lot.superficie}</td>
                <td>{lot.precio}</td>
                <td>
                  {lot.propietario ? (
                    <div className="flex items-center gap-2">
                      <div className="avatar-small">{lot.propietarioInitials}</div>
                      <span>{lot.propietario}</span>
                    </div>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                <td>
                  <span className={`status-badge status-${lot.estado.toLowerCase()}`}>
                    {lot.estado === 'Vendido' ? <Check size={12} className="status-icon" /> : <span className="status-dot"></span>}
                    {lot.estado}
                  </span>
                </td>
                <td>
                  {/* Acciones can be implemented later */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="table-footer">
          <span className="showing-text">Mostrando 1 a 5 de 124 registros</span>
          <div className="pagination">
            <button className="page-btn"><ChevronLeft size={16} /></button>
            <button className="page-btn"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LandCatalog;
