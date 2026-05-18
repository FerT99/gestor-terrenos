import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Pencil, Trash2, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useTerrenos } from '../hooks/useTerrenos';
import type { Terreno, TerrenoInput } from '../lib/api';
import TerrenoModal from './TerrenoModal';
import './LandCatalog.css';

const ESTADOS = ['Todos', 'disponible', 'apartado', 'vendido'] as const;
const PAGE_SIZE = 10;

const formatPrice = (price: number) =>
  `$${price.toLocaleString('es-MX', { minimumFractionDigits: 0 })} MXN`;

const LandCatalog = () => {
  const { terrenos, loading, error, refresh, createTerreno, updateTerreno, deleteTerreno } = useTerrenos();

  const [filter, setFilter] = useState<string>('Todos');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTerreno, setEditTerreno] = useState<Terreno | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Filtrado
  const filtered = filter === 'Todos'
    ? terrenos
    : terrenos.filter(t => t.estado === filter);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = (f: string) => {
    setFilter(f);
    setPage(1);
  };

  // Abrir modal de creación
  const handleNuevoLote = () => {
    setEditTerreno(null);
    setModalOpen(true);
  };

  // Abrir modal de edición
  const handleEdit = (t: Terreno) => {
    setEditTerreno(t);
    setModalOpen(true);
  };

  // Eliminar con confirmación
  const handleDelete = async (t: Terreno) => {
    const confirmed = window.confirm(`¿Eliminar el lote ${t.clave}? Esta acción no se puede deshacer.`);
    if (!confirmed) return;
    setDeletingId(t.id);
    setActionError(null);
    try {
      await deleteTerreno(t.id);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Error al eliminar');
    } finally {
      setDeletingId(null);
    }
  };

  // Submit del modal (crear o editar)
  const handleModalSubmit = async (input: TerrenoInput) => {
    if (editTerreno) {
      await updateTerreno(editTerreno.id, input);
    } else {
      await createTerreno(input);
    }
  };

  return (
    <main className="catalog-container">
      {/* Header */}
      <div className="catalog-header">
        <div>
          <h2 className="catalog-title">Catálogo de Terrenos</h2>
          <p className="catalog-subtitle">
            Administra propiedades, disponibilidad y asignación de lotes.
          </p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary icon-btn" onClick={refresh} title="Actualizar" disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
          </button>
          <button className="btn-primary flex items-center gap-2" onClick={handleNuevoLote}>
            <span>+</span> Nuevo Lote
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="catalog-filters">
        <span className="filter-label">Estado:</span>
        <div className="filter-pills">
          {ESTADOS.map(f => (
            <button
              key={f}
              className={`pill ${filter === f ? 'active' : ''}`}
              onClick={() => handleFilterChange(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <span className="filter-count">{filtered.length} lotes</span>
      </div>

      {/* Error de acción */}
      {actionError && (
        <div className="catalog-error">
          <AlertCircle size={14} /> {actionError}
        </div>
      )}

      {/* Tabla */}
      <div className="table-container card">
        {loading ? (
          <div className="catalog-loading">
            <Loader2 size={24} className="spin" />
            <span>Cargando terrenos...</span>
          </div>
        ) : error ? (
          <div className="catalog-empty">
            <AlertCircle size={32} />
            <p>{error}</p>
            <button className="btn-secondary" onClick={refresh}>Reintentar</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="catalog-empty">
            <p>No hay terrenos con el filtro seleccionado.</p>
          </div>
        ) : (
          <>
            <table className="catalog-table">
              <thead>
                <tr>
                  <th>CLAVE</th>
                  <th>NOMBRE / FASE</th>
                  <th>SUPERFICIE (M²)</th>
                  <th>PRECIO LISTA</th>
                  <th>PROPIETARIO</th>
                  <th>ESTADO</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((lot) => (
                  <tr key={lot.id}>
                    <td className="font-medium text-primary">{lot.clave}</td>
                    <td>
                      <div>
                        <span>{lot.nombre ?? '—'}</span>
                        {lot.fase && <span className="text-muted small-text"> · {lot.fase}</span>}
                      </div>
                    </td>
                    <td>{Number(lot.superficie_m2).toFixed(2)}</td>
                    <td>{formatPrice(lot.precio_lista)}</td>
                    <td>
                      {lot.propietario ? (
                        <div className="flex items-center gap-2">
                          <div className="avatar-small">
                            {lot.propietario.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <span>{lot.propietario}</span>
                        </div>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge status-${lot.estado}`}>
                        {lot.estado === 'vendido'
                          ? <Check size={12} className="status-icon" />
                          : <span className="status-dot"></span>}
                        {lot.estado.charAt(0).toUpperCase() + lot.estado.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEdit(lot)}
                          title="Editar"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDelete(lot)}
                          disabled={deletingId === lot.id}
                          title="Eliminar"
                        >
                          {deletingId === lot.id
                            ? <Loader2 size={14} className="spin" />
                            : <Trash2 size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="table-footer">
              <span className="showing-text">
                Mostrando {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length} registros
              </span>
              <div className="pagination">
                <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                  <ChevronLeft size={16} />
                </button>
                <span className="page-indicator">{page} / {totalPages}</span>
                <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal crear / editar */}
      <TerrenoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        terreno={editTerreno}
      />
    </main>
  );
};

export default LandCatalog;
