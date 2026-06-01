import React, { useState, useEffect } from 'react';
import { Building2, Gavel, RefreshCw, Sliders, AlertTriangle, Map, Plus, Users, UserPlus, CheckCircle2 } from 'lucide-react';
import { api, type Parcela, type Usuario } from '../lib/api';
import './Settings.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'equipo'>('general');
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [newParcelaName, setNewParcelaName] = useState('');
  const [newParcelaDesc, setNewParcelaDesc] = useState('');
  const [loadingParcela, setLoadingParcela] = useState(false);

  // Equipo
  const [equipo, setEquipo] = useState<Usuario[]>([]);
  const [loadingEquipo, setLoadingEquipo] = useState(false);
  const [showNewVendedorModal, setShowNewVendedorModal] = useState(false);
  
  // Nuevo Vendedor
  const [nvNombre, setNvNombre] = useState('');
  const [nvEmail, setNvEmail] = useState('');
  const [nvPassword, setNvPassword] = useState('');
  const [nvRol, setNvRol] = useState('vendedor');
  const [nvLoading, setNvLoading] = useState(false);
  const [nvError, setNvError] = useState('');
  const [nvSuccess, setNvSuccess] = useState(false);

  useEffect(() => {
    loadParcelas();
    if (activeTab === 'equipo') {
      loadEquipo();
    }
  }, [activeTab]);

  const loadParcelas = async () => {
    try {
      const data = await api.parcelas.getAll();
      setParcelas(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadEquipo = async () => {
    try {
      setLoadingEquipo(true);
      const data = await api.usuarios.getAll();
      setEquipo(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEquipo(false);
    }
  };

  const handleCreateParcela = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParcelaName) return;
    setLoadingParcela(true);
    try {
      await api.parcelas.create({ nombre: newParcelaName, descripcion: newParcelaDesc });
      setNewParcelaName('');
      setNewParcelaDesc('');
      await loadParcelas();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingParcela(false);
    }
  };

  const handleCreateVendedor = async (e: React.FormEvent) => {
    e.preventDefault();
    setNvError('');
    setNvSuccess(false);
    setNvLoading(true);
    try {
      await api.usuarios.createVendedor({
        nombre: nvNombre,
        email: nvEmail,
        password: nvPassword,
        rol: nvRol
      });
      setNvSuccess(true);
      setNvNombre('');
      setNvEmail('');
      setNvPassword('');
      await loadEquipo();
      setTimeout(() => {
        setShowNewVendedorModal(false);
        setNvSuccess(false);
      }, 2000);
    } catch (err: any) {
      setNvError(err.message || 'Error al crear el vendedor');
    } finally {
      setNvLoading(false);
    }
  };

  return (
    <main className="settings-container">
      <div className="settings-header">
        <h2 className="settings-title">Configuración del Sistema</h2>
        <p className="settings-subtitle">Administra los detalles de la organización, reglas de negocio y equipo de ventas.</p>
      </div>

      <div className="flex border-b border-neutral-200 mb-6">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'general' ? 'border-orange-500 text-orange-600' : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          Ajustes Generales
        </button>
        <button
          onClick={() => setActiveTab('equipo')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'equipo' ? 'border-orange-500 text-orange-600' : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          <Users size={16} />
          Equipo de Ventas
        </button>
      </div>

      {activeTab === 'general' && (
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
                    disabled={loadingParcela || !newParcelaName}
                    className="w-full flex items-center justify-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-700 px-4 py-2.5 rounded-xl font-medium transition-colors border border-orange-200 disabled:opacity-50"
                  >
                    <Plus size={16} />
                    <span>{loadingParcela ? 'Creando...' : 'Crear Parcela'}</span>
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
      )}

      {activeTab === 'equipo' && (
        <div className="card settings-card max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="card-header mb-0">
              <Users size={20} className="card-icon" />
              <h3 className="card-title">Directorio del Equipo</h3>
            </div>
            <button 
              onClick={() => setShowNewVendedorModal(true)}
              className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              <UserPlus size={16} />
              Añadir Usuario
            </button>
          </div>
          
          <p className="card-desc mb-6">
            Los usuarios que añadas aquí podrán iniciar sesión en la plataforma. Los Administradores tienen acceso total, y los Vendedores solo a los terrenos asignados.
          </p>

          {loadingEquipo ? (
            <p className="text-sm text-neutral-500 py-4 text-center">Cargando directorio...</p>
          ) : equipo.filter(u => u.rol === 'vendedor').length === 0 ? (
            <div className="text-center py-12 bg-neutral-50 rounded-xl border border-neutral-100">
              <Users size={32} className="mx-auto text-neutral-300 mb-3" />
              <h4 className="text-neutral-700 font-medium mb-1">Aún no hay vendedores</h4>
              <p className="text-neutral-500 text-sm">Haz clic en Añadir Vendedor para crear la primera cuenta.</p>
            </div>
          ) : (
            <div className="border border-neutral-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Nombre Completo</th>
                    <th className="px-4 py-3 font-medium">Correo Electrónico</th>
                    <th className="px-4 py-3 font-medium">Rol</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {equipo.map(u => (
                    <tr key={u.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3 font-medium text-neutral-900">{u.nombre_completo}</td>
                      <td className="px-4 py-3 text-neutral-600">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium capitalize ${
                          u.rol === 'admin' ? 'bg-purple-50 text-purple-700' : 'bg-orange-50 text-orange-700'
                        }`}>
                          {u.rol}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Activo
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal para Nuevo Vendedor */}
      {showNewVendedorModal && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-neutral-100">
              <h3 className="text-xl font-bold text-neutral-900">Añadir Usuario</h3>
              <p className="text-sm text-neutral-500 mt-1">Crea una cuenta nueva para tu equipo.</p>
            </div>

            <form onSubmit={handleCreateVendedor} className="p-6 space-y-4">
              {nvError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
                  <AlertTriangle size={16} />
                  {nvError}
                </div>
              )}
              {nvSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  Usuario creado correctamente. Redirigiendo...
                </div>
              )}

              <div className="form-group">
                <label>Rol en el sistema</label>
                <select 
                  value={nvRol}
                  onChange={(e) => setNvRol(e.target.value)}
                  className="w-full p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
                >
                  <option value="vendedor">Vendedor (Acceso restringido)</option>
                  <option value="admin">Administrador (Acceso total)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Nombre Completo</label>
                <input 
                  type="text" 
                  required
                  value={nvNombre}
                  onChange={(e) => setNvNombre(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  className="w-full p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div className="form-group">
                <label>Correo Electrónico</label>
                <input 
                  type="email" 
                  required
                  value={nvEmail}
                  onChange={(e) => setNvEmail(e.target.value)}
                  placeholder="juan@empresa.com"
                  className="w-full p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div className="form-group">
                <label>Contraseña Temporal</label>
                <input 
                  type="password" 
                  required
                  value={nvPassword}
                  onChange={(e) => setNvPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
                <p className="text-xs text-neutral-500 mt-1">Comparte esta contraseña con el vendedor para que pueda iniciar sesión.</p>
              </div>

              <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-neutral-100">
                <button 
                  type="button"
                  onClick={() => setShowNewVendedorModal(false)}
                  className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={nvLoading || nvSuccess}
                  className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-800 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {nvLoading ? 'Creando...' : 'Crear Cuenta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default Settings;
