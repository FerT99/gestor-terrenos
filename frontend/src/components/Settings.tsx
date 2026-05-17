import React from 'react';
import { Building2, Gavel, RefreshCw, Sliders, AlertTriangle } from 'lucide-react';
import './Settings.css';

const Settings = () => {
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
