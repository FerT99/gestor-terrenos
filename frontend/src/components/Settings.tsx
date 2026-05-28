import React, { useState, useEffect } from 'react';
import { Building2, Gavel, RefreshCw, Sliders, AlertTriangle, Map, Plus } from 'lucide-react';
import { api, type Parcela } from '../lib/api';
import './Settings.css';

const Settings = () => {
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [newParcelaName, setNewParcelaName] = useState('');
  const [newParcelaDesc, setNewParcelaDesc] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadParcelas();
  }, []);

  const loadParcelas = async () => {
    try {
      const data = await api.parcelas.getAll();
      setParcelas(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateParcela = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParcelaName) return;
    setLoading(true);
    try {
      await api.parcelas.create({ nombre: newParcelaName, descripcion: newParcelaDesc });
      setNewParcelaName('');
      setNewParcelaDesc('');
      await loadParcelas();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="settings-container">
      <div className="settings-header">
        <h2 className="settings-title">Configuración del Sistema</h2>
        <p className="settings-subtitle">Administra los detalles de la organización, reglas de negocio y preferencias.</p>
      </div>

      <div className="settings-content">
        <div className="settings-left-column">
          {/* Company Profile Card */}
          <div className="card settings-card">
            <div className="card-header">
              <Building2 size={20} className="card-icon" />
              <h3 className="card-title">Perfil de Empresa</h3>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Razón Social</label>
                <input type="text" defaultValue="Loterra" className="form-input" />
              </div>
              <div className="form-group">
                <label>Tax ID / RFC</label>
                <input type="text" defaultValue="LOTT-2023-XYZ" className="form-input" />
              </div>
            </div>

            <div className="form-group mt-4">
              <label>Dirección Fiscal</label>
              <input type="text" defaultValue="124 Golden Dune Blvd, Suite 400" className="form-input" />
            </div>

            <div className="form-grid mt-4">
              <div className="form-group">
                <label>Email de Soporte</label>
                <input type="email" defaultValue="admin@saharalands.com" className="form-input" />
              </div>
              <div className="form-group">
                <label>Teléfono de Contacto</label>
                <input type="text" defaultValue="+1 (555) 019-2834" className="form-input" />
              </div>
            </div>

            <div className="form-actions mt-6">
              <button className="btn-primary">Guardar Perfil</button>
            </div>
          </div>

          {/* Business Rules Card */}
          <div className="card settings-card">
            <div className="card-header">
              <Gavel size={20} className="card-icon" />
              <h3 className="card-title">Reglas de Negocio</h3>
            </div>

            <div className="rules-grid">
              <div className="rule-box">
                <div className="rule-header">
                  <span className="rule-title">Comisión Base de Ventas</span>
                  <span className="rule-symbol">%</span>
                </div>
                <p className="rule-desc">Porcentaje de comisión base para agentes de ventas.</p>
                <div className="rule-input-wrapper">
                  <input type="text" defaultValue="6.75" className="rule-input" />
                  <span className="rule-suffix">%</span>
                </div>
              </div>

              <div className="rule-box">
                <div className="rule-header">
                  <span className="rule-title">Porcentaje de Mora</span>
                  <AlertTriangle size={14} className="text-alert" />
                </div>
                <p className="rule-desc">Tasa de penalización aplicada a pagos vencidos.</p>
                <div className="rule-input-wrapper">
                  <input type="text" defaultValue="15.0" className="rule-input" />
                  <span className="rule-suffix">%</span>
                </div>
              </div>
            </div>

            <div className="toggle-row mt-6">
              <div className="toggle-info">
                <span className="toggle-title">Permitir Días de Gracia</span>
                <span className="toggle-desc">Habilitar un periodo de gracia estándar de 5 días antes de aplicar mora.</span>
              </div>
              <label className="switch">
                <input type="checkbox" defaultChecked />
                <span className="slider round"></span>
              </label>
            </div>
          </div>

          {/* Parcelas Card */}
          <div className="card settings-card">
            <div className="card-header">
              <Map size={20} className="card-icon" />
              <h3 className="card-title">Gestión de Parcelas</h3>
            </div>
            <p className="card-desc mb-4">Administra las parcelas donde se agrupan los terrenos y ventas.</p>

            <div className="space-y-3 mb-6">
              {parcelas.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <div>
                    <p className="font-semibold text-neutral-900 text-sm">{p.nombre}</p>
                    <p className="text-xs text-neutral-500">{p.descripcion || 'Sin descripción'}</p>
                  </div>
                  <span className="text-xs font-medium text-neutral-400">ID: {p.id.split('-')[0]}...</span>
                </div>
              ))}
              {parcelas.length === 0 && (
                <p className="text-sm text-neutral-500 text-center py-2">No hay parcelas creadas.</p>
              )}
            </div>

            <div className="border-t border-neutral-100 pt-4">
              <h4 className="text-sm font-medium text-neutral-900 mb-3">Registrar Nueva Parcela</h4>
              <form onSubmit={handleCreateParcela} className="space-y-3">
                <div className="form-group">
                  <input 
                    type="text" 
                    placeholder="Nombre de la parcela (Ej. Villa del Sol)" 
                    className="form-input" 
                    value={newParcelaName}
                    onChange={e => setNewParcelaName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <input 
                    type="text" 
                    placeholder="Descripción (opcional)" 
                    className="form-input" 
                    value={newParcelaDesc}
                    onChange={e => setNewParcelaDesc(e.target.value)}
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading || !newParcelaName}
                  className="w-full flex items-center justify-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-700 px-4 py-2.5 rounded-xl font-medium transition-colors border border-orange-200 disabled:opacity-50"
                >
                  <Plus size={16} />
                  <span>{loading ? 'Creando...' : 'Crear Parcela'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="settings-right-column">
          {/* Exchange Rate Card */}
          <div className="card settings-card">
            <div className="card-header">
              <RefreshCw size={20} className="card-icon" />
              <h3 className="card-title">Tipo de Cambio</h3>
            </div>
            <p className="card-desc mb-4">Establecer el tipo de cambio manual usado para métricas.</p>

            <div className="exchange-wrapper">
              <div className="exchange-box">
                <span className="exchange-currency">1 USD</span>
                <span className="exchange-arrow">→</span>
                <input type="text" defaultValue="18.50" className="exchange-input" />
                <span className="exchange-currency">MXN</span>
              </div>
              <span className="update-time">Última actualización: Hoy, 09:00 AM</span>
            </div>
          </div>

          {/* Preferences Card */}
          <div className="card settings-card">
            <div className="card-header">
              <Sliders size={20} className="card-icon" />
              <h3 className="card-title">Preferencias</h3>
            </div>

            <div className="form-group mb-6">
              <label>Idioma del Sistema</label>
              <select className="form-select">
                <option>English (US)</option>
                <option>Español (MX)</option>
              </select>
            </div>

            <div className="notifications-section">
              <div className="notifications-header">
                <span className="notifications-title">Notificaciones</span>
                <span className="badge-coming-soon">PRÓXIMAMENTE</span>
              </div>

              <label className="checkbox-label disabled">
                <input type="checkbox" defaultChecked disabled />
                <span className="checkbox-text">Resúmenes por email (Semanal)</span>
              </label>

              <label className="checkbox-label disabled">
                <input type="checkbox" disabled />
                <span className="checkbox-text">Alertas de Slack para ventas nuevas</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Settings;
