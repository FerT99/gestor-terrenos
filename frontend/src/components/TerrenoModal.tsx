import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { Terreno, TerrenoInput } from '../lib/api';
import './TerrenoModal.css';

interface TerrenoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: TerrenoInput) => Promise<void>;
  terreno?: Terreno | null; // si viene, es edición; si no, es creación
}

const EMPTY_FORM: TerrenoInput = {
  clave: '',
  nombre: '',
  fase: '',
  superficie_m2: 0,
  precio_lista: 0,
  propietario: '',
  estado: 'disponible',
  coordenadas: '',
  notas: '',
};

const TerrenoModal: React.FC<TerrenoModalProps> = ({ isOpen, onClose, onSubmit, terreno }) => {
  const [form, setForm] = useState<TerrenoInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!terreno;

  // Pre-llenar form si es edición
  useEffect(() => {
    if (terreno) {
      setForm({
        clave: terreno.clave,
        nombre: terreno.nombre ?? '',
        fase: terreno.fase ?? '',
        superficie_m2: terreno.superficie_m2,
        precio_lista: terreno.precio_lista,
        propietario: terreno.propietario ?? '',
        estado: terreno.estado,
        coordenadas: terreno.coordenadas ?? '',
        notas: terreno.notas ?? '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setError(null);
  }, [terreno, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'superficie_m2' || name === 'precio_lista' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clave.trim()) { setError('La clave es requerida'); return; }
    if (form.superficie_m2 <= 0) { setError('La superficie debe ser mayor a 0'); return; }
    if (form.precio_lista <= 0) { setError('El precio debe ser mayor a 0'); return; }

    setSaving(true);
    setError(null);
    try {
      await onSubmit(form);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">{isEditing ? 'Editar Terreno' : 'Nuevo Terreno'}</h2>
            <p className="modal-subtitle">{isEditing ? `Modificando: ${terreno!.clave}` : 'Registra un nuevo lote en el catálogo'}</p>
          </div>
          <button className="modal-close-btn" onClick={onClose} disabled={saving}>
            <X size={20} />
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="modal-grid-2">
            <div className="form-field">
              <label htmlFor="clave">Clave <span className="required">*</span></label>
              <input id="clave" name="clave" type="text" placeholder="Ej. SL-045" value={form.clave} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label htmlFor="nombre">Nombre</label>
              <input id="nombre" name="nombre" type="text" placeholder="Ej. Lote Norte A" value={form.nombre} onChange={handleChange} />
            </div>
          </div>

          <div className="modal-grid-2">
            <div className="form-field">
              <label htmlFor="fase">Fase / Sección</label>
              <input id="fase" name="fase" type="text" placeholder="Ej. Fase 1" value={form.fase} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label htmlFor="estado">Estado <span className="required">*</span></label>
              <select id="estado" name="estado" value={form.estado} onChange={handleChange}>
                <option value="disponible">Disponible</option>
                <option value="apartado">Apartado</option>
                <option value="vendido">Vendido</option>
              </select>
            </div>
          </div>

          <div className="modal-grid-2">
            <div className="form-field">
              <label htmlFor="superficie_m2">Superficie (m²) <span className="required">*</span></label>
              <input id="superficie_m2" name="superficie_m2" type="number" step="0.01" min="0"
                placeholder="450.00" value={form.superficie_m2 || ''} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label htmlFor="precio_lista">Precio Lista (MXN) <span className="required">*</span></label>
              <input id="precio_lista" name="precio_lista" type="number" step="0.01" min="0"
                placeholder="1250000" value={form.precio_lista || ''} onChange={handleChange} />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="propietario">Propietario / Cliente asignado</label>
            <input id="propietario" name="propietario" type="text" placeholder="Nombre del propietario (opcional)"
              value={form.propietario} onChange={handleChange} />
          </div>

          <div className="form-field">
            <label htmlFor="coordenadas">Coordenadas</label>
            <input id="coordenadas" name="coordenadas" type="text" placeholder="Ej. 21.1619,-86.8515 (opcional)"
              value={form.coordenadas} onChange={handleChange} />
          </div>

          <div className="form-field">
            <label htmlFor="notas">Notas</label>
            <textarea id="notas" name="notas" rows={3} placeholder="Observaciones adicionales (opcional)"
              value={form.notas} onChange={handleChange} />
          </div>

          {error && <p className="modal-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? <Loader2 size={16} className="spin" /> : null}
              {saving ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Terreno'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TerrenoModal;
