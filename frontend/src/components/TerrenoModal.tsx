import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { Terreno, TerrenoInput, Cliente, Usuario } from '../lib/api';
import { api } from '../lib/api';

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
  vendedor_id: '',
  moneda: 'MXN',
};

const TerrenoModal: React.FC<TerrenoModalProps> = ({ isOpen, onClose, onSubmit, terreno }) => {
  const [form, setForm] = useState<TerrenoInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [vendedores, setVendedores] = useState<Usuario[]>([]);
  const isAdmin = localStorage.getItem('user_role') === 'admin';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientesData, usuariosData] = await Promise.all([
          api.clientes.getAll(),
          isAdmin ? api.usuarios.getAll() : Promise.resolve([])
        ]);
        setClientes(clientesData || []);
        if (isAdmin) {
          setVendedores((usuariosData || []).filter(u => u.rol === 'vendedor'));
        }
      } catch (err) {
        console.error('Error al cargar datos:', err);
      }
    };
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, isAdmin]);

  const isEditing = !!terreno;

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
        vendedor_id: terreno.vendedor_id ?? '',
        moneda: 'MXN', // Agregamos el campo moneda que es requerido
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
    if (isEditing && !form.clave.trim()) { setError('La clave es requerida'); return; }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm transition-opacity" />
      
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-6 py-5 border-b border-neutral-100 bg-neutral-50/50">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">{isEditing ? 'Editar Terreno' : 'Nuevo Terreno'}</h2>
            <p className="text-sm text-neutral-500 mt-1">{isEditing ? `Modificando: ${terreno!.clave}` : 'Registra un nuevo lote en el catálogo'}</p>
          </div>
          <button 
            className="p-2 -mr-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors disabled:opacity-50" 
            onClick={onClose} 
            disabled={saving}
          >
            <X size={20} />
          </button>
        </div>

        <form className="p-6 overflow-y-auto max-h-[calc(100vh-10rem)]" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
            {isEditing && (
              <div className="space-y-1.5">
                <label htmlFor="clave" className="text-sm font-medium text-neutral-700">Clave <span className="text-red-500">*</span></label>
                <input 
                  id="clave" name="clave" type="text" placeholder="Ej. SL-045" 
                  value={form.clave} onChange={handleChange} 
                  disabled={true}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all disabled:opacity-70 disabled:bg-neutral-200"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <label htmlFor="estado" className="text-sm font-medium text-neutral-700">Estado <span className="text-red-500">*</span></label>
              <select 
                id="estado" name="estado" value={form.estado} onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              >
                <option value="disponible">Disponible</option>
                <option value="apartado">Apartado</option>
                <option value="vendido">Vendido</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
            <div className="space-y-1.5">
              <label htmlFor="superficie_m2" className="text-sm font-medium text-neutral-700">Superficie (m²) <span className="text-red-500">*</span></label>
              <input 
                id="superficie_m2" name="superficie_m2" type="number" step="0.01" min="0" placeholder="450.00" 
                value={form.superficie_m2 || ''} onChange={handleChange} 
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="precio_lista" className="text-sm font-medium text-neutral-700">Precio Lista (MXN) <span className="text-red-500">*</span></label>
              <input 
                id="precio_lista" name="precio_lista" type="number" step="0.01" min="0" placeholder="1250000" 
                value={form.precio_lista || ''} onChange={handleChange} 
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5 mb-5">
            <label htmlFor="propietario" className="text-sm font-medium text-neutral-700">Propietario / Cliente asignado</label>
            <select 
              id="propietario" name="propietario" 
              value={form.propietario || ''} onChange={handleChange} 
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            >
              <option value="">Sin asignar (Opcional)</option>
              {clientes.map(c => (
                <option key={c.id} value={c.nombre_completo}>
                  {c.nombre_completo}
                </option>
              ))}
            </select>
          </div>

          {isAdmin && (
            <div className="space-y-1.5 mb-5">
              <label htmlFor="vendedor_id" className="text-sm font-medium text-neutral-700">Asesor Asignado</label>
              <select 
                id="vendedor_id" name="vendedor_id" 
                value={form.vendedor_id || ''} onChange={handleChange} 
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              >
                <option value="">Sin asignar (Visible para todos los admins)</option>
                {vendedores.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.nombre_completo}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1.5 mb-6">
            <label htmlFor="notas" className="text-sm font-medium text-neutral-700">Notas</label>
            <textarea 
              id="notas" name="notas" rows={3} placeholder="Observaciones adicionales (opcional)"
              value={form.notas} onChange={handleChange} 
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
            />
          </div>

          {error && <p className="mb-4 text-sm font-medium text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

          <div className="flex items-center justify-end gap-3 pt-5 border-t border-neutral-100">
            <button 
              type="button" 
              className="px-5 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors disabled:opacity-50" 
              onClick={onClose} 
              disabled={saving}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:from-orange-700 hover:to-orange-600 transition-all shadow-md hover:shadow-lg disabled:opacity-70" 
              disabled={saving}
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : null}
              {saving ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Terreno'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TerrenoModal;
