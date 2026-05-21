import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { Cliente, ClienteInput } from '../lib/api';

interface ClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: ClienteInput) => Promise<void>;
  initialData?: Cliente | null;
}

const EMPTY_FORM: ClienteInput = {
  nombre_completo: '',
  email: '',
  telefono: '',
  direccion: '',
  estado: 'Activo',
};

const ClienteModal: React.FC<ClienteModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [form, setForm] = useState<ClienteInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setForm({
          nombre_completo: initialData.nombre_completo,
          email: initialData.email || '',
          telefono: initialData.telefono || '',
          direccion: initialData.direccion || '',
          estado: initialData.estado,
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setError(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre_completo.trim()) { setError('El nombre es requerido'); return; }

    setSaving(true);
    setError(null);
    try {
      await onSubmit(form);
      setForm(EMPTY_FORM); // limpiar para la próxima
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm transition-opacity" />
      
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-6 py-5 border-b border-neutral-100 bg-neutral-50/50">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">Nuevo Cliente</h2>
            <p className="text-sm text-neutral-500 mt-1">Registra un nuevo comprador o prospecto</p>
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
          <div className="space-y-1.5 mb-5">
            <label htmlFor="nombre_completo" className="text-sm font-medium text-neutral-700">Nombre Completo <span className="text-red-500">*</span></label>
            <input 
              id="nombre_completo" name="nombre_completo" type="text" placeholder="Ej. Juan Pérez" 
              value={form.nombre_completo} onChange={handleChange} 
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-neutral-700">Correo Electrónico</label>
              <input 
                id="email" name="email" type="email" placeholder="ejemplo@correo.com" 
                value={form.email} onChange={handleChange} 
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="telefono" className="text-sm font-medium text-neutral-700">Teléfono</label>
              <input 
                id="telefono" name="telefono" type="text" placeholder="+52 ..." 
                value={form.telefono} onChange={handleChange} 
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5 mb-5">
            <label htmlFor="direccion" className="text-sm font-medium text-neutral-700">Dirección</label>
            <textarea 
              id="direccion" name="direccion" rows={2} placeholder="Dirección física (opcional)"
              value={form.direccion} onChange={handleChange} 
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
            />
          </div>

          <div className="space-y-1.5 mb-6">
            <label htmlFor="estado" className="text-sm font-medium text-neutral-700">Estado Inicial</label>
            <select 
              id="estado" name="estado" value={form.estado} onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            >
              <option value="Activo">Activo</option>
              <option value="Pendiente">Pendiente (Prospecto)</option>
            </select>
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
              {saving ? 'Guardando...' : 'Crear Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClienteModal;
